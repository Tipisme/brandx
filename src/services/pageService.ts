export interface PageValue {
  slug: string;
  value: string;
}

export interface ApiPageResponse {
  name: string;
  title: string | null;
  description: string | null;
  slug: string;
  image?: string | null;
  body?: string;
  keyword?: string | null;
  canonical?: string | null;
  values?: PageValue[];
}

/**
 * Get API base URL from environment variables, fallback to https://admin.hdslaw.vn
 */
export const getAdminApiUrl = (): string => {
  const meta = import.meta as any;
  const envUrl = 
    meta.env?.VITE_ADMIN_API_URL || 
    meta.env?.VITE_API_URL || 
    meta.env?.NEXT_PUBLIC_API_URL ||
    'https://admin.hdslaw.vn';
  
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

/**
 * Call API: {baseUrl}/api/pages/{slug} or {baseUrl}/{lang}/api/pages/{slug}
 * Always calls the live API directly without in-memory caching.
 * Example: https://admin.hdslaw.vn/api/pages/brandix-about
 */
export const fetchPageBySlug = async (
  slug: string = 'brandix-about',
  lang: string = 'vi'
): Promise<ApiPageResponse> => {
  const baseUrl = getAdminApiUrl();
  
  // Try direct API first as requested, then vi language-prefixed route
  const endpoints = [
    `${baseUrl}/vi/api/pages/${encodeURIComponent(slug)}`,
    `${baseUrl}/api/pages/${encodeURIComponent(slug)}`,
  ];

  let lastError: Error | null = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data: ApiPageResponse = await response.json();
        return data;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Không thể tải dữ liệu trang cho slug "${slug}"`);
};
