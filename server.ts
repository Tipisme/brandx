import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ViteDevServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const BASE_DOMAIN = 'https://brandix.vn';
const CMS_API_BASE = 'https://admin.hdslaw.vn';

const app = express();

// In-memory cache for news articles to ensure ultra-fast and consistent SSR responses
const postCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Fallback articles list if CMS API is unreachable during SSR
const FALLBACK_ARTICLES: Record<string, any> = {
  'nvidia-dan-xep-vu-kien-nhan-hieu-lien-quan-den-phan-mem-ai-modulus': {
    slug: 'nvidia-dan-xep-vu-kien-nhan-hieu-lien-quan-den-phan-mem-ai-modulus',
    title: 'NVIDIA Dàn xếp vụ kiện nhãn hiệu liên quan đến phần mềm AI Modulus',
    meta_description: 'NVIDIA đã giải quyết xong tranh chấp nhãn hiệu liên quan đến phần mềm AI Modulus với đối tác phát triển độc quyền.',
    description: '<p>NVIDIA đã đạt được thỏa thuận dàn xếp chính thức trong vụ tranh chấp nhãn hiệu thương mại liên quan đến bộ công cụ phần mềm trí tuệ nhân tạo (AI) Modulus. Quyết định này giúp công ty củng cố quyền sở hữu trí tuệ trên quy mô toàn cầu.</p>',
    featured_image: '/brandix-logo.jpg',
    tags: [{ name: 'Tranh chấp nhãn hiệu' }],
  },
  'bao-ho-chi-dan-dia-ly-bac-ha': {
    slug: 'bao-ho-chi-dan-dia-ly-bac-ha',
    title: 'Bảo hộ chỉ dẫn địa lý Bắc Hà',
    meta_description: 'Chỉ dẫn địa lý Bắc Hà chính thức được cấp bằng bảo hộ độc quyền cho các sản phẩm nông sản đặc sản vùng cao.',
    description: '<p>Cục Sở hữu trí tuệ đã cấp Giấy chứng nhận đăng ký chỉ dẫn địa lý Bắc Hà cho các sản phẩm nông sản chủ lực, nâng cao giá trị thương hiệu vùng miền.</p>',
    featured_image: '/brandix-logo.jpg',
    tags: [{ name: 'Chỉ dẫn địa lý' }],
  },
  'tranh-chap-nhan-hieu-ca-phe-trung-nguyen': {
    slug: 'tranh-chap-nhan-hieu-ca-phe-trung-nguyen',
    title: 'Tranh chấp nhãn hiệu Cà phê Trung Nguyên',
    meta_description: 'Phân tích toàn diện góc nhìn pháp lý vụ án tranh chấp thương hiệu Cà phê Trung Nguyên và bài học thương trường.',
    description: '<p>Vụ tranh chấp nhãn hiệu Cà phê Trung Nguyên là bài học đắt giá về tầm quan trọng của hợp đồng sở hữu trí tuệ và cấu trúc tài sản doanh nghiệp.</p>',
    featured_image: '/brandix-logo.jpg',
    tags: [{ name: 'Án lệ SHTT' }],
  }
};

/**
 * Escapes unsafe string values for HTML injection
 */
function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strip HTML tags and truncate text for meta descriptions
 */
function stripHtmlAndTruncate(html: string = '', maxLength: number = 160): string {
  const plainText = html.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Resolves meta image absolute URL
 */
function resolveMetaImageUrl(rawImg: any): string {
  if (!rawImg) return `${BASE_DOMAIN}/brandix-logo.jpg`;
  const imgStr = typeof rawImg === 'string' ? rawImg.trim() : (rawImg.url || rawImg.path || '');
  if (!imgStr) return `${BASE_DOMAIN}/brandix-logo.jpg`;
  if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) return imgStr;
  if (imgStr.startsWith('/brandix-logo.jpg') || imgStr === 'brandix-logo.jpg') return `${BASE_DOMAIN}/brandix-logo.jpg`;
  const cleanPath = imgStr.startsWith('/') ? imgStr : `/${imgStr}`;
  return `${CMS_API_BASE}${cleanPath}`;
}

/**
 * Scans CMS API pages for all live posts
 */
async function fetchAllPostsFromCms(): Promise<any[]> {
  const allPosts: any[] = [];
  try {
    let page = 1;
    let lastPage = 1;
    while (page <= lastPage && page <= 5) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${CMS_API_BASE}/api/blogs/posts/tin-tuc?page=${page}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (!res.ok) break;
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data) || json.data.length === 0) break;

      allPosts.push(...json.data);
      const lp = Number(json.meta?.last_page || json.last_page || 1);
      lastPage = lp;
      page++;
    }
  } catch (err: any) {
    console.warn('[SSR] CMS API list fetch error:', err.message);
  }
  return allPosts;
}

/**
 * Fetch a single news post by slug with strict cache keying and API pagination scan
 */
async function fetchPostBySlug(slug: string): Promise<any | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Check in-memory cache first for valid non-stale data
  const cached = postCache.get(cleanSlug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 2. Fetch live posts list from CMS API and update cache
  const livePosts = await fetchAllPostsFromCms();
  const now = Date.now();

  for (const post of livePosts) {
    if (post && post.slug) {
      const s = String(post.slug).trim().toLowerCase();
      postCache.set(s, { data: post, timestamp: now });
      if (post.id) {
        postCache.set(String(post.id).trim().toLowerCase(), { data: post, timestamp: now });
      }
    }
  }

  // 3. Return from updated cache
  const newlyCached = postCache.get(cleanSlug);
  if (newlyCached) {
    return newlyCached.data;
  }

  // 4. Fallback to local known articles
  if (FALLBACK_ARTICLES[cleanSlug]) {
    return FALLBACK_ARTICLES[cleanSlug];
  }

  return null;
}

/**
 * Injects dynamic SEO meta tags, canonical link, OpenGraph, Twitter, and Schema.org JSON-LD into index.html
 */
function injectSeoMetadata(
  indexTemplate: string,
  options: {
    title: string;
    description: string;
    imageUrl: string;
    canonicalUrl: string;
    type?: string;
    jsonLd?: Record<string, any>;
    noindex?: boolean;
  }
): string {
  const title = escapeHtml(options.title);
  const description = escapeHtml(options.description);
  const imageUrl = options.imageUrl;
  const canonicalUrl = options.canonicalUrl;
  const type = options.type || 'website';
  const robots = options.noindex ? 'noindex, nofollow' : 'index, follow';

  let html = indexTemplate;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="title"\s+content=".*?"\s*\/?>/gi, `<meta name="title" content="${title}" />`);

  // Replace Description
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/gi, `<meta name="description" content="${description}" />`);

  // Replace Image
  html = html.replace(/<meta\s+name="image"\s+content=".*?"\s*\/?>/gi, `<meta name="image" content="${imageUrl}" />`);

  // Replace Robots
  html = html.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/gi, `<meta name="robots" content="${robots}" />`);

  // Replace Canonical Link
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/gi, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Open Graph
  html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/gi, `<meta property="og:image" content="${imageUrl}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/gi, `<meta property="og:type" content="${type}" />`);

  // Twitter Cards
  html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${imageUrl}" />`);
  html = html.replace(/<meta\s+name="twitter:url"\s+content=".*?"\s*\/?>/gi, `<meta name="twitter:url" content="${canonicalUrl}" />`);

  // Inject or replace JSON-LD
  if (options.jsonLd) {
    const jsonLdString = JSON.stringify(options.jsonLd, null, 2);
    const jsonLdScript = `<script type="application/ld+json" id="dynamic-seo-jsonld">${jsonLdString}</script>`;

    if (html.includes('<script type="application/ld+json">')) {
      html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, jsonLdScript);
    } else {
      html = html.replace('</head>', `  ${jsonLdScript}\n</head>`);
    }
  }

  return html;
}

/**
 * Pre-renders semantic HTML article content inside <div id="root"> for Server-Side Rendering
 */
function renderArticleServerHtml(post: any): string {
  const title = escapeHtml(post.title || '');
  const category = escapeHtml(post.tags?.[0]?.name || 'Pháp Luật SHTT');
  const featuredImg = resolveMetaImageUrl(post.featured_image);
  const bodyContent = post.description || `<p>${escapeHtml(post.meta_description || '')}</p>`;
  const readingTime = Math.max(1, Math.ceil((bodyContent.length || 1000) / 1000));

  return `<div id="root">
  <div class="bg-slate-50 min-h-screen pb-16" id="main-app">
    <header class="w-full bg-white text-slate-800 shadow-sm border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 text-decoration-none">
          <img src="/brandix-logo.jpg" alt="Brandix Việt Nam" class="h-10 rounded-lg shadow-xs" />
          <span class="font-extrabold text-slate-900 text-lg tracking-tight">Brandix</span>
        </a>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8" id="news-detail-page">
      <nav class="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-4" aria-label="Breadcrumb">
        <a href="/" class="hover:text-amber-600">Trang chủ</a> &gt;
        <a href="/news" class="hover:text-amber-600">Tin tức</a> &gt;
        <span class="text-slate-800 font-normal">${title}</span>
      </nav>
      <div class="space-y-4 border-l-4 border-[#D4AF37] pl-5 py-2">
        <span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-3 py-1 rounded-md">
          ${category}
        </span>
        <h1 class="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 leading-tight">
          ${title}
        </h1>
        <div class="flex items-center gap-4 text-xs text-slate-500 pt-1">
          <span class="font-bold text-slate-700">Ban biên tập HDS Law</span> •
          <span>16.07.2026</span> •
          <span>${readingTime} phút đọc</span>
        </div>
      </div>
      <div class="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
        ${featuredImg ? `<div class="w-full max-h-[460px] rounded-2xl overflow-hidden shadow-xs bg-slate-100">
          <img src="${featuredImg}" alt="${title}" class="w-full h-full max-h-[460px] object-cover" />
        </div>` : ''}
        <article class="blog-content text-slate-700 text-sm leading-relaxed space-y-4">
          ${bodyContent}
        </article>
      </div>
    </main>
  </div>
</div>`;
}

/**
 * 404 Not Found Server HTML template
 */
function render404ServerHtml(indexTemplate: string, reqUrl: string): string {
  const title = '404 - Trang không tồn tại | Brandix';
  const description = 'Trang bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống Brandix.';
  const canonicalUrl = `${BASE_DOMAIN}${reqUrl}`;

  let html = injectSeoMetadata(indexTemplate, {
    title,
    description,
    imageUrl: `${BASE_DOMAIN}/brandix-logo.jpg`,
    canonicalUrl,
    noindex: true,
  });

  const body404 = `<div id="root">
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
      <h1 class="text-4xl font-extrabold text-orange-500">404</h1>
      <h2 class="text-xl font-bold text-slate-900">Bài viết hoặc trang không tồn tại</h2>
      <p class="text-xs text-slate-500">Đường dẫn bạn truy cập không còn khả dụng trên hệ thống Brandix.</p>
      <a href="/" class="inline-block bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
        Về trang chủ Brandix
      </a>
    </div>
  </div>
</div>`;

  return html.replace(/<div\s+id="root">\s*<\/div>/gi, body404);
}

// Bootstrap Server & Vite dev middleware
async function startServer() {
  let vite: ViteDevServer | null = null;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
  }

  // Serve dynamic /sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemapPath = path.resolve(__dirname, 'public/sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        res.setHeader('Content-Type', 'application/xml');
        return res.sendFile(sitemapPath);
      }
      res.status(404).send('Sitemap not found');
    } catch (err) {
      res.status(500).send('Error reading sitemap');
    }
  });

  // Serve /robots.txt
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.resolve(__dirname, 'public/robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      return res.sendFile(robotsPath);
    }
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /quan-tri/\nDisallow: /dashboard/\nSitemap: ${BASE_DOMAIN}/sitemap.xml\n`);
  });

  // Handle /news/:slug SSR route
  app.get('/news/:slug', async (req, res, next) => {
    const slug = req.params.slug;
    if (!slug || slug === 'tin-tuc') return next();

    try {
      let indexTemplate = '';
      if (!isProd && vite) {
        const rawIndex = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        indexTemplate = await vite.transformIndexHtml(req.originalUrl, rawIndex);
      } else {
        indexTemplate = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }

      const post = await fetchPostBySlug(slug);

      if (!post) {
        console.warn(`[SSR 404] Post not found for slug: ${slug}`);
        const html404 = render404ServerHtml(indexTemplate, req.originalUrl);
        return res.status(404).send(html404);
      }

      const postSlug = post.slug || slug;
      const canonicalUrl = `${BASE_DOMAIN}/news/${postSlug}`;
      const title = `${post.meta_title || post.title} | Brandix`;
      const description = post.meta_description || stripHtmlAndTruncate(post.description, 160);
      const imageUrl = resolveMetaImageUrl(post.featured_image);

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: description,
        image: [imageUrl],
        datePublished: '2026-07-16T00:00:00+07:00',
        dateModified: '2026-07-16T09:56:44+07:00',
        author: {
          '@type': 'Person',
          name: 'Chuyên gia Pháp lý HDS Law',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Brandix Việt Nam',
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_DOMAIN}/brandix-logo.jpg`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        inLanguage: 'vi-VN',
      };

      // Inject SEO Head metadata
      let html = injectSeoMetadata(indexTemplate, {
        title,
        description,
        imageUrl,
        canonicalUrl,
        type: 'article',
        jsonLd,
      });

      // Inject pre-rendered SSR HTML content inside <div id="root">
      const articleServerHtml = renderArticleServerHtml(post);
      html = html.replace(/<div\s+id="root">\s*<\/div>/gi, articleServerHtml);

      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (err: any) {
      console.error('[SSR Error]', err);
      next(err);
    }
  });

  // Handle All Other HTML Routes (Home, Catalog, Workflow, About, FAQ, /news)
  app.get('*', async (req, res) => {
    try {
      let indexTemplate = '';
      if (!isProd && vite) {
        const rawIndex = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        indexTemplate = await vite.transformIndexHtml(req.originalUrl, rawIndex);
      } else {
        const distIndexPath = path.resolve(__dirname, 'dist/index.html');
        indexTemplate = fs.existsSync(distIndexPath)
          ? fs.readFileSync(distIndexPath, 'utf-8')
          : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      }

      const cleanPath = req.path === '/' ? '' : req.path;
      const canonicalUrl = `${BASE_DOMAIN}${cleanPath}`;

      let title = 'Brandix - Sàn Giao Dịch Nhãn Hiệu';
      let description = 'Nền tảng giao dịch, chuyển nhượng và đăng ký bảo hộ nhãn hiệu trực tuyến hàng đầu Việt Nam. Kết nối trực tiếp, giao dịch an toàn, thủ tục nhanh chóng.';

      if (req.path === '/news') {
        title = 'Tin tức & Kiến thức Sở Hữu Trí Tuệ | Brandix';
        description = 'Cập nhật tin tức pháp luật sở hữu trí tuệ, thông tư bảo hộ nhãn hiệu kinh doanh và cẩm nang từ chuyên gia HDS Law.';
      } else if (req.path === '/catalog') {
        title = 'Danh mục Nhãn hiệu Chuyển nhượng | Brandix';
        description = 'Tra cứu danh mục nhãn hiệu đã được bảo hộ độc quyền sẵn sàng chuyển nhượng nhanh chóng và an toàn.';
      } else if (req.path === '/workflow') {
        title = 'Quy trình Mua bán & Đăng ký Nhãn hiệu | Brandix';
        description = 'Tìm hiểu quy trình 4 bước giao dịch nhãn hiệu trực tuyến minh bạch, pháp lý đảm bảo 100%.';
      } else if (req.path === '/about') {
        title = 'Về Chúng Tôi | Brandix Việt Nam';
        description = 'Brandix là nền tảng giao dịch và nộp đơn độc quyền nhãn hiệu hàng đầu Việt Nam hợp tác cùng đại diện SHTT HDS Law.';
      } else if (req.path === '/faq') {
        title = 'Hỏi Đáp Pháp Lý Sở Hữu Trí Tuệ | Brandix';
        description = 'Giải đáp thắc mắc thường gặp về đăng ký bảo hộ thương hiệu, thủ tục chuyển nhượng và xử lý vi phạm nhãn hiệu.';
      }

      const html = injectSeoMetadata(indexTemplate, {
        title,
        description,
        imageUrl: `${BASE_DOMAIN}/brandix-logo.jpg`,
        canonicalUrl,
        type: 'website',
      });

      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (err: any) {
      console.error('[Server Route Error]', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Brandix SSR & SEO Server running at http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
