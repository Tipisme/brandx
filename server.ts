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

// Trademark catalog database for Sàn Nhãn Hiệu SSR
const TRADEMARKS_DATA = [
  {
    id: "tm-1",
    slug: "vinamilk",
    name: "VINAMILK",
    logoText: "Vinamilk",
    logoBg: "from-blue-600 to-indigo-800",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [29, 30, 32],
    goodsDescription: "Sữa, bơ, pho mát, sữa yogurt và các sản phẩm từ sữa khác; dầu thực vật dùng cho thực phẩm; nước trái cây đóng chai, đồ uống dinh dưỡng.",
    applicationNo: "4-2023-12345",
    filingDate: "2023-05-15",
    price: 1500000000,
    priceFormatted: "1.500.000.000 ₫",
    description: "Nhãn hiệu sữa hàng đầu Việt Nam, đã được đăng ký bảo hộ độc quyền trên toàn quốc. Thích hợp cho doanh nghiệp muốn khởi nghiệp hoặc mở rộng quy mô trong ngành sữa và chế phẩm từ sữa chất lượng cao."
  },
  {
    id: "tm-2",
    slug: "pepsi-co",
    name: "PEPSI.CO",
    logoText: "Pepsi.co",
    logoBg: "from-blue-500 via-red-500 to-indigo-600",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [32, 35],
    goodsDescription: "Đồ uống không cồn, nước ngọt có ga, nước tăng lực, nước suối đóng chai; dịch vụ quảng cáo thương mại và phân phối nước giải khát.",
    applicationNo: "4-2022-54321",
    filingDate: "2022-09-10",
    price: 3200000000,
    priceFormatted: "3.200.000.000 ₫",
    description: "Nhãn hiệu nước giải khát mang tính biểu tượng toàn cầu, cấu trúc chữ dễ nhớ, phù hợp cho các dòng sản phẩm nước ngọt, nước giải khát năng động, sáng tạo."
  },
  {
    id: "tm-3",
    slug: "coke-co",
    name: "COKE.CO",
    logoText: "Coke.co",
    logoBg: "from-red-600 to-red-800",
    status: "negotiating",
    statusText: "Đang thương lượng",
    classes: [32, 43],
    goodsDescription: "Nước ngọt có ga, nước khoáng, nước ép trái cây; dịch vụ cung cấp đồ ăn uống, chuỗi nhà hàng thức ăn nhanh và quán nước giải khát.",
    applicationNo: "4-2023-88899",
    filingDate: "2023-01-20",
    price: 2800000000,
    priceFormatted: "2.800.000.000 ₫",
    description: "Nhãn hiệu mang tính thương mại cực cao, thích hợp để phát triển các chuỗi đồ uống, quán cafe kết hợp thức ăn nhanh thế hệ mới."
  },
  {
    id: "tm-4",
    slug: "heineken",
    name: "HEINEKEN",
    logoText: "Heineken",
    logoBg: "from-green-600 to-emerald-800",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [32, 33],
    goodsDescription: "Bia, các loại nước có cồn nhẹ lên men từ lúa mạch; rượu vang và rượu mạnh chất lượng cao dùng trong nhà hàng, quán bar.",
    applicationNo: "4-2021-00789",
    filingDate: "2021-11-05",
    price: 4500000000,
    priceFormatted: "4.500.000.000 ₫",
    description: "Tên tuổi huyền thoại trong ngành bia và đồ uống có cồn. Cơ hội sở hữu nhãn hiệu danh tiếng bậc nhất với hồ sơ pháp lý sạch."
  },
  {
    id: "tm-5",
    slug: "fanta",
    name: "FANTA",
    logoText: "Fanta",
    logoBg: "from-orange-500 to-amber-600",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [32],
    goodsDescription: "Nước giải khát hương cam, nước ngọt hương vị trái cây tự nhiên, đồ uống sủi bọt không cồn cho giới trẻ.",
    applicationNo: "4-2023-33445",
    filingDate: "2023-08-12",
    price: 1200000000,
    priceFormatted: "1.200.000.000 ₫",
    description: "Nhãn hiệu mang tính vui nhộn, năng động cực kỳ phù hợp với phân khúc nước trái cây, nước ngọt có ga cho học sinh, sinh viên và gia đình."
  },
  {
    id: "tm-6",
    slug: "budweiser",
    name: "BUDWEISER",
    logoText: "Budweiser",
    logoBg: "from-red-700 via-amber-700 to-red-950",
    status: "sold",
    statusText: "Đã chuyển nhượng",
    classes: [32, 33, 43],
    goodsDescription: "Bia cao cấp, đồ uống có cồn chưng cất; dịch vụ quầy bar, quán bia, vũ trường và nhà hàng phục vụ món ăn kèm đồ uống.",
    applicationNo: "4-2020-99887",
    filingDate: "2020-04-18",
    price: 3800000000,
    priceFormatted: "3.800.000.000 ₫",
    description: "Nhãn hiệu bia vua đầy mạnh mẽ. Đã hoàn tất chuyển nhượng thành công cho một tập đoàn đồ uống lớn tại Việt Nam thông qua Brandix."
  },
  {
    id: "tm-7",
    slug: "highlands",
    name: "HIGHLANDS",
    logoText: "Highlands",
    logoBg: "from-red-800 to-amber-900",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [30, 43],
    goodsDescription: "Cà phê rang xay, hạt cà phê, trà xanh, trà đen túi lọc; dịch vụ quán cà phê, quán trà và cung cấp dịch vụ ẩm thực lưu động.",
    applicationNo: "4-2023-11223",
    filingDate: "2023-03-30",
    price: 2500000000,
    priceFormatted: "2.500.000.000 ₫",
    description: "Tên thương mại lý tưởng cho các chuỗi quán cà phê sang trọng, mang phong cách Việt hiện đại."
  },
  {
    id: "tm-8",
    slug: "medicare",
    name: "MEDICARE",
    logoText: "MediCare",
    logoBg: "from-teal-500 to-cyan-600",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [5, 44],
    goodsDescription: "Thực phẩm chức năng, vitamin, thiết bị y tế gia đình; dịch vụ phòng khám, chăm sóc sức khỏe, tư vấn dinh dưỡng và chăm sóc da.",
    applicationNo: "4-2022-77665",
    filingDate: "2022-12-05",
    price: 950000000,
    priceFormatted: "950.000.000 ₫",
    description: "Thương hiệu y tế và sức khỏe hiện đại. Phù hợp cho chuỗi nhà thuốc, phòng khám tư nhân hoặc thương hiệu thực phẩm chức năng nhập khẩu."
  },
  {
    id: "tm-9",
    slug: "ecoglow",
    name: "ECOGLOW",
    logoText: "EcoGlow",
    logoBg: "from-emerald-500 to-teal-700",
    status: "available",
    statusText: "Sẵn sàng chuyển nhượng",
    classes: [25, 44],
    goodsDescription: "Mỹ phẩm thiên nhiên, sản phẩm chăm sóc da hữu cơ; dịch vụ spa, massage và điều trị thẩm mỹ không xâm lấn.",
    applicationNo: "4-2023-99112",
    filingDate: "2023-07-22",
    price: 680000000,
    priceFormatted: "680.000.000 ₫",
    description: "Sự kết hợp hoàn hảo giữa Eco (Thân thiện môi trường) và Glow (Tỏa sáng). Thích hợp cho các nhãn hàng mỹ phẩm organic."
  },
  {
    id: "tm-10",
    slug: "techvina",
    name: "TECHVINA",
    logoText: "TechVina",
    logoBg: "from-slate-700 to-slate-900",
    status: "negotiating",
    statusText: "Đang thương lượng",
    classes: [9, 35],
    goodsDescription: "Phần mềm quản lý doanh nghiệp, ứng dụng ví điện tử, phần cứng máy tính; dịch vụ tư vấn chuyển đổi số và tiếp thị trực tuyến.",
    applicationNo: "4-2022-90909",
    filingDate: "2022-10-15",
    price: 1800000000,
    priceFormatted: "1.800.000.000 ₫",
    description: "Thương hiệu công nghệ thuần Việt cực kỳ chuyên nghiệp và uy tín. Thích hợp cho tập đoàn công nghệ phần mềm."
  }
];

// Fallback news articles list if CMS API is unreachable during SSR
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
 * Find trademark item by ID or Slug
 */
function findTrademarkBySlug(slug: string) {
  if (!slug) return null;
  const clean = decodeURIComponent(slug).trim().toLowerCase();
  return TRADEMARKS_DATA.find((tm) => {
    return (
      tm.id.toLowerCase() === clean ||
      tm.name.toLowerCase() === clean ||
      (tm.slug && tm.slug.toLowerCase() === clean) ||
      tm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean
    );
  });
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
 * Pre-render Header
 */
function renderHeaderHtml(): string {
  return `<header class="w-full bg-white text-slate-800 shadow-sm border-b border-slate-100 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-decoration-none">
        <img src="/brandix-logo.jpg" alt="Brandix Việt Nam" class="h-10 rounded-lg shadow-xs" />
        <span class="font-extrabold text-slate-900 text-lg tracking-tight">Brandix</span>
      </a>
      <nav class="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
        <a href="/" class="hover:text-orange-500">Trang chủ</a>
        <a href="/catalog" class="hover:text-orange-500 text-orange-500">Sàn nhãn hiệu</a>
        <a href="/workflow" class="hover:text-orange-500">Quy trình</a>
        <a href="/about" class="hover:text-orange-500">Về chúng tôi</a>
        <a href="/faq" class="hover:text-orange-500">Hỏi đáp</a>
        <a href="/news" class="hover:text-orange-500">Tin tức</a>
      </nav>
    </div>
  </header>`;
}

/**
 * Pre-render Sàn Nhãn Hiệu (/catalog) HTML for View Source
 */
function renderCatalogServerHtml(): string {
  const trademarkCards = TRADEMARKS_DATA.map((tm) => `
    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-all">
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${tm.logoBg} text-white font-black text-sm flex items-center justify-center shadow-xs">
            ${escapeHtml(tm.logoText)}
          </div>
          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
            ${escapeHtml(tm.statusText)}
          </span>
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900">
            <a href="/catalog/${tm.slug}" class="hover:text-orange-600">${escapeHtml(tm.name)}</a>
          </h2>
          <p class="text-xs text-slate-500 mt-1">Số đơn: <strong class="text-slate-700">${escapeHtml(tm.applicationNo)}</strong> • Nhóm: <strong class="text-slate-700">${tm.classes.join(', ')}</strong></p>
        </div>
        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${escapeHtml(tm.goodsDescription)}</p>
      </div>
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
        <div>
          <span class="text-[10px] font-bold text-slate-400 block uppercase">Giá chuyển nhượng</span>
          <span class="text-sm font-black text-orange-600">${escapeHtml(tm.priceFormatted)}</span>
        </div>
        <a href="/catalog/${tm.slug}" class="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800">
          Xem chi tiết
        </a>
      </div>
    </div>
  `).join('\n');

  return `<div id="root">
  <div class="min-h-screen bg-white" id="main-app">
    ${renderHeaderHtml()}
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8" id="catalog">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold text-orange-500 uppercase tracking-widest block">Sàn Nhãn Hiệu Chuyển Nhượng</span>
        <h1 class="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight">Danh Mục Nhãn Hiệu Độc Quyền &amp; Chuyển Nhượng</h1>
        <p class="text-slate-500 text-xs sm:text-sm">Tra cứu trực tiếp cơ sở dữ liệu 368+ nhãn hiệu đã được nộp đơn hoặc cấp văn bằng bảo hộ độc quyền sẵn sàng mua bán chuyển nhượng ngay tại Việt Nam.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${trademarkCards}
      </div>
    </main>
  </div>
</div>`;
}

/**
 * Pre-render Chi Tiết Nhãn Hiệu (/catalog/:slug) HTML for View Source
 */
function renderTrademarkDetailServerHtml(tm: any): string {
  const name = escapeHtml(tm.name);
  const appNo = escapeHtml(tm.applicationNo);
  const classes = tm.classes.join(', ');
  const goods = escapeHtml(tm.goodsDescription);
  const price = escapeHtml(tm.priceFormatted);
  const desc = escapeHtml(tm.description);

  return `<div id="root">
  <div class="min-h-screen bg-slate-50" id="main-app">
    ${renderHeaderHtml()}
    <main class="max-w-5xl mx-auto px-4 py-8 space-y-8" id="trademark-detail-page">
      <nav class="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-4" aria-label="Breadcrumb">
        <a href="/" class="hover:text-amber-600">Trang chủ</a> &gt;
        <a href="/catalog" class="hover:text-amber-600">Sàn nhãn hiệu</a> &gt;
        <span class="text-slate-800 font-normal">${name}</span>
      </nav>
      <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${tm.logoBg} text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md">
              ${escapeHtml(tm.logoText)}
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">${name}</h1>
              <p class="text-xs text-slate-500 mt-1">Số đơn quốc gia: <strong class="text-slate-700">${appNo}</strong> • Phân loại nhóm Nice: <strong class="text-slate-700">${classes}</strong></p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-400 font-bold block uppercase">Giá chuyển nhượng</span>
            <span class="text-xl sm:text-2xl font-black text-orange-600">${price}</span>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <h2 class="text-sm font-bold text-slate-900 mb-1">Danh mục Sản phẩm &amp; Dịch vụ đăng ký bảo hộ độc quyền</h2>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">${goods}</p>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900 mb-1">Thông tin thương mại &amp; Hồ sơ pháp lý</h2>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">${desc}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>`;
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
    ${renderHeaderHtml()}
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

  // Handle /catalog/:slug trademark detail SSR route
  app.get('/catalog/:slug', async (req, res) => {
    const slug = req.params.slug;

    try {
      let indexTemplate = '';
      if (!isProd && vite) {
        const rawIndex = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        indexTemplate = await vite.transformIndexHtml(req.originalUrl, rawIndex);
      } else {
        indexTemplate = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
      }

      const trademark = findTrademarkBySlug(slug);

      if (!trademark) {
        console.warn(`[SSR 404] Trademark not found for slug: ${slug}`);
        const html404 = render404ServerHtml(indexTemplate, req.originalUrl);
        return res.status(404).send(html404);
      }

      const canonicalUrl = `${BASE_DOMAIN}/catalog/${trademark.slug || trademark.id}`;
      const title = `Nhãn Hiệu ${trademark.name} (Nhóm ${trademark.classes.join(', ')}) | Sàn Nhãn Hiệu Brandix`;
      const description = `Thông tin nhãn hiệu độc quyền ${trademark.name} - Nhóm ${trademark.classes.join(', ')}. Số đơn ${trademark.applicationNo}. Sẵn sàng mua bán chuyển nhượng nhanh chóng.`;

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `Nhãn hiệu độc quyền ${trademark.name}`,
        description: trademark.description,
        image: `${BASE_DOMAIN}/brandix-logo.jpg`,
        offers: {
          '@type': 'Offer',
          price: trademark.price,
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
        },
      };

      let html = injectSeoMetadata(indexTemplate, {
        title,
        description,
        imageUrl: `${BASE_DOMAIN}/brandix-logo.jpg`,
        canonicalUrl,
        type: 'product',
        jsonLd,
      });

      const tmDetailHtml = renderTrademarkDetailServerHtml(trademark);
      html = html.replace(/<div\s+id="root">\s*<\/div>/gi, tmDetailHtml);

      res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (err: any) {
      console.error('[SSR Trademark Route Error]', err);
      res.status(500).send('Internal Server Error');
    }
  });

  // Handle /news/:slug article detail SSR route
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

  // Handle All Other HTML Routes (Home, /catalog, Workflow, About, FAQ, /news)
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
      let preRenderedBody = '';

      if (req.path === '/catalog') {
        title = 'Sàn Giao Dịch Nhãn Hiệu Độc Quyền & Chuyển Nhượng | Brandix';
        description = 'Tra cứu danh mục 368+ nhãn hiệu đã được bảo hộ độc quyền sẵn sàng chuyển nhượng nhanh chóng và an toàn tại Việt Nam.';
        preRenderedBody = renderCatalogServerHtml();
      } else if (req.path === '/news') {
        title = 'Tin tức & Kiến thức Sở Hữu Trí Tuệ | Brandix';
        description = 'Cập nhật tin tức pháp luật sở hữu trí tuệ, thông tư bảo hộ nhãn hiệu kinh doanh và cẩm nang từ chuyên gia HDS Law.';
      } else if (req.path === '/workflow') {
        title = 'Quy Trình Mua Bán & Đăng Ký Nhãn Hiệu | Brandix';
        description = 'Tìm hiểu quy trình 4 bước giao dịch nhãn hiệu trực tuyến minh bạch, pháp lý đảm bảo 100%.';
      } else if (req.path === '/about') {
        title = 'Về Chúng Tôi | Brandix Việt Nam';
        description = 'Brandix là nền tảng giao dịch và nộp đơn độc quyền nhãn hiệu hàng đầu Việt Nam hợp tác cùng đại diện SHTT HDS Law.';
      } else if (req.path === '/faq') {
        title = 'Hỏi Đáp Pháp Lý Sở Hữu Trí Tuệ | Brandix';
        description = 'Giải đáp thắc mắc thường gặp về đăng ký bảo hộ thương hiệu, thủ tục chuyển nhượng và xử lý vi phạm nhãn hiệu.';
      }

      let html = injectSeoMetadata(indexTemplate, {
        title,
        description,
        imageUrl: `${BASE_DOMAIN}/brandix-logo.jpg`,
        canonicalUrl,
        type: 'website',
      });

      if (preRenderedBody) {
        html = html.replace(/<div\s+id="root">\s*<\/div>/gi, preRenderedBody);
      }

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
