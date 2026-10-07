/**
 * SEO & Social Metadata Manager
 * Synchronizes default homepage meta tags and dynamic page metadata
 * Defaults to /brandix-logo.jpg when meta image is empty or missing.
 */

export const DEFAULT_META_IMAGE = '/brandix-logo.jpg';

export const HOMEPAGE_SEO = {
  title: 'Brandix - Sàn Giao Dịch Nhãn Hiệu',
  description: 'Nền tảng giao dịch, chuyển nhượng và đăng ký bảo hộ nhãn hiệu trực tuyến hàng đầu Việt Nam. Kết nối trực tiếp, giao dịch an toàn, thủ tục nhanh chóng.',
  image: DEFAULT_META_IMAGE,
  imageAlt: 'Brandix - Sàn Giao Dịch Nhãn Hiệu',
  type: 'website',
  siteName: 'Brandix - Sàn Giao Dịch Nhãn Hiệu',
};

export interface MetaSeoOptions {
  title?: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

/**
 * Resolves an image URL:
 * - If missing, empty, null, or undefined, returns fallback (default: /brandix-logo.jpg)
 * - If absolute http(s) URL, returns as-is
 * - If relative path from uploads/storage, prepends the backend CMS domain
 * - If local asset / logo, returns clean path
 */
export function resolveMetaImage(rawImg?: any, fallback: string = DEFAULT_META_IMAGE): string {
  if (!rawImg) return fallback;

  let path = '';
  if (typeof rawImg === 'string') {
    path = rawImg.trim();
  } else if (typeof rawImg === 'object') {
    path = (rawImg.url || rawImg.path || rawImg.src || '').trim();
  }

  if (!path) return fallback;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/brandix-logo.jpg') || path === 'brandix-logo.jpg') {
    return DEFAULT_META_IMAGE;
  }

  if (
    path.startsWith('/uploads') || 
    path.startsWith('uploads') || 
    path.startsWith('/storage') || 
    path.startsWith('storage')
  ) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://admin.hdslaw.vn${cleanPath}`;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Sets or updates a meta tag in document.head
 */
export function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Updates full page SEO meta tags including OpenGraph and Twitter cards.
 * If image is not provided, defaults to /brandix-logo.jpg.
 */
export function updateMetaSeo(options: MetaSeoOptions = {}) {
  if (typeof document === 'undefined') return;

  const title = options.title ? `${options.title}` : HOMEPAGE_SEO.title;
  const description = options.description || HOMEPAGE_SEO.description;
  const image = resolveMetaImage(options.image, DEFAULT_META_IMAGE);
  const imageAlt = options.imageAlt || title;
  const type = options.type || 'website';
  const url = options.url || (typeof window !== 'undefined' ? window.location.href : '/');

  // Title
  document.title = title;

  // Basic meta
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="image"]', 'name', 'image', image);

  // OpenGraph Social Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
  setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', HOMEPAGE_SEO.siteName);

  // Twitter / X Cards
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', imageAlt);

  // Dynamic JSON-LD Structured Data
  const scriptId = 'dynamic-seo-jsonld';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (options.jsonLd) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.text = JSON.stringify(options.jsonLd);
  } else if (scriptEl) {
    scriptEl.remove();
  }
}

/**
 * Resets meta tags back to the Brandix home page defaults
 */
export function resetMetaSeo() {
  updateMetaSeo(HOMEPAGE_SEO);
}

/**
 * Synchronize SEO tags directly from the live API response of api/pages/brandix-home
 * If image is missing/null, falls back to /brandix-logo.jpg.
 */
export function syncHomePageSeo(data?: any) {
  if (!data) {
    resetMetaSeo();
    return;
  }

  const cleanBody = data.body 
    ? data.body.replace(/<\/?[^>]+(>|$)/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim() 
    : '';

  const title = data.title || HOMEPAGE_SEO.title;
  const description = data.description || cleanBody || HOMEPAGE_SEO.description;
  const image = resolveMetaImage(data.image, DEFAULT_META_IMAGE);
  const canonical = data.canonical || 'https://brandix.vn/';
  const keywords = data.keyword || 'brandix,nhãn hiệu';

  updateMetaSeo({
    title,
    description,
    image,
    imageAlt: title,
    url: canonical,
    type: 'website',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": title,
      "alternateName": "Brandix Việt Nam",
      "url": canonical,
      "description": description,
      "image": image,
      "publisher": {
        "@type": "Organization",
        "name": "Brandix Việt Nam",
        "url": canonical,
        "logo": {
          "@type": "ImageObject",
          "url": DEFAULT_META_IMAGE
        }
      }
    }
  });

  if (keywords) {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
  }
  if (canonical && typeof document !== 'undefined') {
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);
  }
}

