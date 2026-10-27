// Service for fetching news & blog articles from CMS API
import { decodeHtmlEntities } from '../utils/seo';

export const stripHtmlAndTruncate = (html: string, length: number = 150) => {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  const cleanText = decoded.replace(/\s+/g, " ").trim();
  if (cleanText.length <= length) return cleanText;
  return cleanText.substring(0, length) + '...';
};

export const DEFAULT_POST_IMAGE = '/brandix-logo.jpg';

export const getPostImageUrl = (img: any, fallback: string = DEFAULT_POST_IMAGE) => {
  if (!img) return fallback;
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
  return fallback;
};

// Cache to store loaded posts by slug and id for ultra-fast instant lookups
const postsCache = new Map<string, any>();

export const cachePost = (post: any) => {
  if (!post) return;
  if (post.slug) postsCache.set(String(post.slug).toLowerCase(), post);
  if (post.id) postsCache.set(String(post.id).toLowerCase(), post);
};

export const cachePosts = (postsList: any[]) => {
  if (Array.isArray(postsList)) {
    postsList.forEach(cachePost);
  }
};

export const getCachedPost = (slug: string) => {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
  return postsCache.get(cleanSlug) || null;
};

export async function fetchNewsPosts(page: number = 1) {
  const response = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?page=${page}`);
  if (!response.ok) throw new Error('Không thể tải dữ liệu tin tức từ máy chủ.');
  const json = await response.json();
  if (json && Array.isArray(json.data)) {
    cachePosts(json.data);
  }
  return json;
}

export async function fetchSinglePostBySlug(slug: string) {
  if (!slug) throw new Error('Thiếu định danh bài viết.');
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Check in-memory cache first for instant retrieval
  const cached = postsCache.get(cleanSlug);
  if (cached && cached.description) {
    return cached;
  }

  // 2. Fetch page 1 of news posts from API
  const res1 = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?page=1`);
  if (!res1.ok) throw new Error('Không thể tải dữ liệu bài viết từ máy chủ.');
  const json1 = await res1.json();

  if (json1 && Array.isArray(json1.data)) {
    cachePosts(json1.data);
    const found = json1.data.find((p: any) => 
      String(p.slug).toLowerCase() === cleanSlug || 
      String(p.id).toLowerCase() === cleanSlug
    );
    if (found) {
      return found;
    }

    // 3. Search remaining pages if not found on page 1
    const lastPage = Number(json1.meta?.last_page || json1.last_page || 1);
    for (let p = 2; p <= lastPage; p++) {
      try {
        const resNext = await fetch(`https://admin.hdslaw.vn/api/blogs/posts/tin-tuc?page=${p}`);
        if (resNext.ok) {
          const jsonNext = await resNext.json();
          if (jsonNext && Array.isArray(jsonNext.data)) {
            cachePosts(jsonNext.data);
            const foundNext = jsonNext.data.find((item: any) => 
              String(item.slug).toLowerCase() === cleanSlug || 
              String(item.id).toLowerCase() === cleanSlug
            );
            if (foundNext) {
              return foundNext;
            }
          }
        }
      } catch (pageErr) {
        console.warn(`Error searching news page ${p}:`, pageErr);
      }
    }
  }

  // 4. Final check in cache if loaded elsewhere
  if (postsCache.has(cleanSlug)) {
    return postsCache.get(cleanSlug);
  }

  throw new Error(`Không tìm thấy bài viết "${slug}" trong hệ thống.`);
}
