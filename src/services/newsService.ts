// Service for fetching news & blog articles from CMS API

export const stripHtmlAndTruncate = (html: string, length: number = 150) => {
  if (!html) return '';
  const cleanText = html.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
  if (cleanText.length <= length) return cleanText;
  return cleanText.substring(0, length) + '...';
};

export const getPostImageUrl = (img: any) => {
  if (!img) return null;
  if (typeof img === 'string') {
    if (img.startsWith('http')) return img;
    return `https://admin.hdslaw.vn${img.startsWith('/') ? '' : '/'}${img}`;
  }
  if (img.path) {
    if (img.path.startsWith('http')) return img.path;
    return `https://admin.hdslaw.vn${img.path.startsWith('/') ? '' : '/'}${img.path}`;
  }
  if (img.url) {
    if (img.url.startsWith('http')) return img.url;
    return `https://admin.hdslaw.vn${img.url.startsWith('/') ? '' : '/'}${img.url}`;
  }
  return null;
};

export async function fetchNewsPosts(page: number = 1) {
  const response = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?page=${page}`);
  if (!response.ok) throw new Error('Không thể tải dữ liệu tin tức từ máy chủ.');
  const json = await response.json();
  return json;
}

export async function fetchSinglePostBySlug(slug: string) {
  const response = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?slug=${slug}`);
  if (!response.ok) throw new Error('Không thể tải chi tiết bài viết từ hệ thống.');
  const json = await response.json();
  return json;
}
