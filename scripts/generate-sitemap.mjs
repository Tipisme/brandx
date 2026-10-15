import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const BASE_URL = 'https://brandix.vn';
const TODAY = new Date().toISOString().split('T')[0];

// Fallback news list if API request cannot be reached
const FALLBACK_NEWS_POSTS = [
  { slug: 'nvidia-dan-xep-vu-kien-nhan-hieu-lien-quan-den-phan-mem-ai-modulus', title: 'NVIDIA Dàn xếp vụ kiện nhãn hiệu liên quan đến phần mềm AI Modulus' },
  { slug: 'bao-ho-chi-dan-dia-ly-bac-ha', title: 'Bảo hộ chỉ dẫn địa lý Bắc Hà' },
  { slug: 'tranh-chap-nhan-hieu-ca-phe-trung-nguyen', title: 'Tranh chấp nhãn hiệu Cà phê Trung Nguyên' },
  { slug: 'bao-ho-chi-dan-dia-ly-bac-kan-cho-san-pham-bi-xanh-thom', title: 'Bảo hộ chỉ dẫn địa lý Bắc Kạn cho sản phẩm bí xanh thơm' },
  { slug: 'khoi-to-vo-chong-chu-kenh-gia-lang-tay-nguyen-lien-quan-xam-pham-chi-dan-dia-ly-sam-ngoc-linh', title: 'Khởi tố vợ chồng chủ kênh Già Làng Tây Nguyên liên quan xâm phạm chỉ dẫn địa lý sâm Ngọc Linh' },
  { slug: 'tranh-chap-nhan-hieu-binh-m', title: 'Tranh chấp nhãn hiệu Bình M' },
  { slug: 'dong-nai-tam-giu-76-doi-dep-nghi-gia-mao-nhan-hieu-hermes', title: 'Đồng Nai tạm giữ 76 đôi dép nghi giả mạo nhãn hiệu Hermes' },
  { slug: 'vu-an-tranh-chap-nhan-hieu-que-toi-nam-2024', title: 'Vụ án tranh chấp nhãn hiệu Quê Tôi năm 2024' },
  { slug: 'vu-an-nhan-hieu-pn-va-bai-hoc-kinh-nghiem', title: 'Vụ án nhãn hiệu PN và bài học kinh nghiệm' },
  { slug: 'starbucks-bat-loi-trong-tranh-chap-nhan-hieu', title: 'Starbucks bất lợi trong tranh chấp nhãn hiệu' },
  { slug: 'nhan-hieu-am-thanh', title: 'Nhãn hiệu âm thanh' },
  { slug: 'phan-tich-vu-tranh-chap-nhan-hieu-vincom-vincon-va-bai-hoc-kinh-nghiem', title: 'Phân tích vụ tranh chấp nhãn hiệu Vincom - Vincon và bài học kinh nghiệm' },
  { slug: '20-dieu-can-biet-truoc-khi-thanh-lap-cong-ty-nam-2026', title: '20 điều cần biết trước khi thành lập công ty năm 2026' },
  { slug: 'doanh-nghiep-moi-thanh-lap-can-lam-ho-so-gi-de-duoc-mien-thue-tndn-3-nam', title: 'Điều kiện để được miễn thuế TNDN 3 năm khi mới thành lập' },
  { slug: 'van-hoa-doi-moi', title: 'Văn hóa Đổi mới' },
  { slug: 'luat-su-doanh-nghiep-senior', title: 'Luật sư Doanh nghiệp (Senior)' }
];

// Trademarks list
const TRADEMARKS = [
  { id: 'tm-1', name: 'VINAMILK', title: 'Nhãn hiệu VINAMILK - Nhóm 29, 30, 32' },
  { id: 'tm-2', name: 'PEPSI.CO', title: 'Nhãn hiệu PEPSI.CO - Nhóm 32, 35' },
  { id: 'tm-3', name: 'COKE.CO', title: 'Nhãn hiệu COKE.CO - Nhóm 32, 43' },
  { id: 'tm-4', name: 'ECOFARM', title: 'Nhãn hiệu ECOFARM - Nhóm 29, 31' },
  { id: 'tm-5', name: 'TECHNOVO', title: 'Nhãn hiệu TECHNOVO - Nhóm 9, 42' },
  { id: 'tm-6', name: 'AQUAPURE', title: 'Nhãn hiệu AQUAPURE - Nhóm 32' },
  { id: 'tm-7', name: 'PHARMALIFE', title: 'Nhãn hiệu PHARMALIFE - Nhóm 5, 44' },
  { id: 'tm-8', name: 'FASHIONISTA', title: 'Nhãn hiệu FASHIONISTA - Nhóm 25, 35' },
  { id: 'tm-9', name: 'GOURMET', title: 'Nhãn hiệu GOURMET - Nhóm 29, 30, 43' },
  { id: 'tm-10', name: 'URBANSTYLE', title: 'Nhãn hiệu URBANSTYLE - Nhóm 25' }
];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function fetchLiveNewsPosts() {
  const posts = [];
  try {
    let page = 1;
    let maxPages = 3;
    while (page <= maxPages) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?page=${page}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) break;
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) break;
      
      posts.push(...data.data);
      if (data.meta && data.meta.last_page) {
        maxPages = data.meta.last_page;
      }
      page++;
    }
  } catch (err) {
    console.warn('Could not fetch live news posts from CMS API, using fallback list:', err.message);
  }

  if (posts.length === 0) {
    return FALLBACK_NEWS_POSTS;
  }
  return posts;
}

export async function generateSitemap() {
  console.log('Generating sitemap.xml and robots.txt for Google SEO...');
  const posts = await fetchLiveNewsPosts();
  console.log(`Loaded ${posts.length} news posts for sitemap.`);

  const xmlEntries = [];

  // 1. Core Pages
  const corePages = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily', title: 'Brandix - Sàn Giao Dịch Nhãn Hiệu Việt Nam', img: `${BASE_URL}/brandix-logo.jpg` },
    { loc: `${BASE_URL}/catalog`, priority: '0.9', changefreq: 'daily', title: 'Danh mục Nhãn hiệu Độc quyền & Chuyển nhượng' },
    { loc: `${BASE_URL}/news`, priority: '0.9', changefreq: 'daily', title: 'Tin tức & Kiến thức Sở hữu trí tuệ' },
    { loc: `${BASE_URL}/workflow`, priority: '0.8', changefreq: 'weekly', title: 'Quy trình Mua bán và Đăng ký Bảo hộ Nhãn hiệu' },
    { loc: `${BASE_URL}/about`, priority: '0.7', changefreq: 'monthly', title: 'Về chúng tôi - Nền tảng Nhãn hiệu Brandix' },
    { loc: `${BASE_URL}/faq`, priority: '0.7', changefreq: 'weekly', title: 'Câu hỏi thường gặp về Pháp lý SHTT' }
  ];

  for (const page of corePages) {
    let entry = `  <url>\n    <loc>${escapeXml(page.loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>`;
    if (page.img) {
      entry += `\n    <image:image>\n      <image:loc>${escapeXml(page.img)}</image:loc>\n      <image:title>${escapeXml(page.title)}</image:title>\n    </image:image>`;
    }
    entry += `\n  </url>`;
    xmlEntries.push(entry);
  }

  // 2. Trademark Detail Pages
  for (const tm of TRADEMARKS) {
    const loc = `${BASE_URL}/catalog/${tm.id}`;
    let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <image:image>\n      <image:loc>${BASE_URL}/brandix-logo.jpg</image:loc>\n      <image:title>${escapeXml(tm.title)}</image:title>\n    </image:image>\n  </url>`;
    xmlEntries.push(entry);
  }

  // 3. News Detail Pages
  for (const post of posts) {
    const slug = post.slug;
    if (!slug) continue;
    const loc = `${BASE_URL}/news/${slug}`;
    const title = post.title || post.meta_title || slug;
    let imgLoc = `${BASE_URL}/brandix-logo.jpg`;
    if (post.featured_image) {
      if (post.featured_image.startsWith('http')) {
        imgLoc = post.featured_image;
      } else {
        imgLoc = `https://admin.hdslaw.vn${post.featured_image.startsWith('/') ? '' : '/'}${post.featured_image}`;
      }
    }

    let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n    <image:image>\n      <image:loc>${escapeXml(imgLoc)}</image:loc>\n      <image:title>${escapeXml(title)}</image:title>\n    </image:image>\n  </url>`;
    xmlEntries.push(entry);
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries.join('\n')}
</urlset>
`;

  // Write sitemap.xml
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
  console.log(`Successfully generated ${sitemapPath} with ${xmlEntries.length} URLs.`);

  // Write robots.txt
  const robotsContent = `# Robots.txt for Brandix - https://brandix.vn
User-agent: *
Allow: /

# Prevent crawling of administrative/private sections
Disallow: /quan-tri/
Disallow: /dashboard/
Disallow: /reset-password/

# Google Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  const robotsPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
  console.log(`Successfully generated ${robotsPath}.`);
}

generateSitemap();
