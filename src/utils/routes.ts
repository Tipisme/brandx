import { Language } from '../localization';

export type AdminTab = 'profile' | 'trademarks' | 'cases' | 'files' | 'commissions' | 'settings' | 'support';

export interface RouteInfo {
  route: 'home' | 'catalog' | 'catalog-detail' | 'workflow' | 'about' | 'faq' | 'news' | 'news-detail' | 'reset-password' | 'admin' | 'dashboard';
  viewMode: 'marketplace' | 'dashboard';
  path: string;
  adminTab?: AdminTab;
  slug?: string;
  postId?: string;
  resetEmail?: string;
  resetToken?: string;
  searchQuery?: string;
}

// Slug mappings for Admin sub-menus
export const ADMIN_TAB_SLUGS: Record<AdminTab, string> = {
  profile: 'ca-nhan-to-chuc',
  trademarks: 'quan-ly-tai-san',
  cases: 'quan-ly-yeu-cau',
  files: 'quan-ly-file',
  commissions: 'hoa-hong-cua-toi',
  settings: 'cai-dat',
  support: 'ho-tro',
};

// Reverse lookup slug -> AdminTab
export const SLUG_TO_ADMIN_TAB: Record<string, AdminTab> = {
  'ca-nhan-to-chuc': 'profile',
  'profile': 'profile',
  'quan-ly-tai-san': 'trademarks',
  'tai-san': 'trademarks',
  'trademarks': 'trademarks',
  'quan-ly-yeu-cau': 'cases',
  'yeu-cau': 'cases',
  'cases': 'cases',
  'quan-ly-file': 'files',
  'files': 'files',
  'hoa-hong-cua-toi': 'commissions',
  'hoa-hong': 'commissions',
  'commissions': 'commissions',
  'referrals': 'commissions',
  'cai-dat': 'settings',
  'settings': 'settings',
  'ho-tro': 'support',
  'support': 'support',
};

// Human-readable labels
export const ADMIN_TAB_LABELS: Record<AdminTab, { vi: string; en: string }> = {
  profile: { vi: 'Cá nhân và tổ chức', en: 'Personal & Org' },
  trademarks: { vi: 'Quản lý tài sản', en: 'Asset Management' },
  cases: { vi: 'Quản lý yêu cầu', en: 'Request Management' },
  files: { vi: 'Quản lý file', en: 'File Management' },
  commissions: { vi: 'Hoa hồng của tôi', en: 'My Commissions' },
  settings: { vi: 'Cài đặt', en: 'Settings' },
  support: { vi: 'Hỗ trợ', en: 'Help & Support' },
};

export function getAdminTabLabel(tab: AdminTab = 'profile', lang: Language = 'vi'): string {
  const item = ADMIN_TAB_LABELS[tab] || ADMIN_TAB_LABELS.profile;
  return lang === 'en' ? item.en : item.vi;
}

/**
 * Returns the canonical URL path for a given admin tab
 */
export function getAdminTabPath(tab: AdminTab = 'profile'): string {
  return `/quan-tri/${ADMIN_TAB_SLUGS[tab]}`;
}

/**
 * Parses current location pathname and hash to extract route, viewMode, and params
 */
export function parseCurrentLocation(): RouteInfo {
  // Check hash or pathname
  const rawHash = window.location.hash || '';
  const pathname = window.location.pathname || '/';

  // Check query string in search or hash
  let searchQuery = '';
  if (window.location.search) {
    const sp = new URLSearchParams(window.location.search);
    searchQuery = sp.get('q') || sp.get('search') || '';
  }
  if (!searchQuery && rawHash.includes('?')) {
    const [, hashQ] = rawHash.split('?');
    const sp = new URLSearchParams(hashQ);
    searchQuery = sp.get('q') || sp.get('search') || '';
  }

  // Determine active path: check hash first if it has meaningful route, else pathname
  let cleanPath = '';
  if (rawHash && rawHash.length > 1) {
    const [hBase] = rawHash.split('?');
    cleanPath = hBase.replace(/^#\/?/, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  } else {
    cleanPath = pathname;
  }

  // Remove trailing slashes (except root)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const segments = cleanPath.split('/').filter(Boolean);

  // 1. Check for Reset Password route
  const resetIdx = segments.indexOf('reset-password');
  if (resetIdx !== -1 && segments.length > resetIdx + 2) {
    const email = decodeURIComponent(segments[resetIdx + 1]);
    const token = segments[resetIdx + 2];
    if (email.includes('@') && token && token.length >= 10) {
      return {
        route: 'reset-password',
        viewMode: 'marketplace',
        path: cleanPath,
        resetEmail: email,
        resetToken: token,
        searchQuery,
      };
    }
  }

  // 2. Check for Admin / Dashboard routes
  if (segments[0] === 'quan-tri' || segments[0] === 'dashboard') {
    let tab: AdminTab = 'profile';
    if (segments.length >= 2) {
      const subSlug = segments[1].toLowerCase();
      if (SLUG_TO_ADMIN_TAB[subSlug]) {
        tab = SLUG_TO_ADMIN_TAB[subSlug];
      }
    }
    return {
      route: 'dashboard',
      viewMode: 'dashboard',
      path: cleanPath,
      adminTab: tab,
      searchQuery,
    };
  }

  // 3. Catalog / Trademarks
  if (segments[0] === 'catalog' || segments[0] === 'san-pham') {
    if (segments.length >= 2) {
      return {
        route: 'catalog-detail',
        viewMode: 'marketplace',
        path: cleanPath,
        slug: segments[1],
        searchQuery,
      };
    }
    return {
      route: 'catalog',
      viewMode: 'marketplace',
      path: cleanPath,
      searchQuery,
    };
  }

  // 4. News / Posts
  if (segments[0] === 'news' || segments[0] === 'tin-tuc') {
    if (segments.length >= 2) {
      return {
        route: 'news-detail',
        viewMode: 'marketplace',
        path: cleanPath,
        postId: segments[1],
        searchQuery,
      };
    }
    return {
      route: 'news',
      viewMode: 'marketplace',
      path: cleanPath,
      searchQuery,
    };
  }

  // 5. Workflow
  if (segments[0] === 'workflow' || segments[0] === 'quy-trinh') {
    return {
      route: 'workflow',
      viewMode: 'marketplace',
      path: cleanPath,
      searchQuery,
    };
  }

  // 6. About
  if (segments[0] === 'about' || segments[0] === 've-chung-toi' || segments[0] === 'why-brandhub') {
    return {
      route: 'about',
      viewMode: 'marketplace',
      path: cleanPath,
      searchQuery,
    };
  }

  // 7. FAQ
  if (segments[0] === 'faq' || segments[0] === 'hoi-dap') {
    return {
      route: 'faq',
      viewMode: 'marketplace',
      path: cleanPath,
      searchQuery,
    };
  }

  // Default: Home
  return {
    route: 'home',
    viewMode: 'marketplace',
    path: cleanPath,
    searchQuery,
  };
}

/**
 * Navigate to a new path in the SPA without a full page refresh
 */
export function navigateTo(path: string, options?: { replace?: boolean }) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  if (options?.replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }

  // Dispatch popstate so listeners in App and other components trigger immediately
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Storage key for pending redirect after login
const LOGIN_REDIRECT_KEY = 'brandhub_redirect_after_login';

export interface LoginRedirectState {
  path: string;
  tab?: AdminTab;
  label?: string;
}

export function saveLoginRedirect(pathOrTarget: string | LoginRedirectState, tab?: AdminTab, label?: string) {
  try {
    const target: LoginRedirectState = typeof pathOrTarget === 'string'
      ? { path: pathOrTarget, tab, label }
      : pathOrTarget;
    sessionStorage.setItem(LOGIN_REDIRECT_KEY, JSON.stringify(target));
    localStorage.setItem(LOGIN_REDIRECT_KEY, JSON.stringify(target));
  } catch (err) {
    console.error('Failed to save login redirect', err);
  }
}

export function getSavedLoginRedirect(): LoginRedirectState | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_REDIRECT_KEY) || localStorage.getItem(LOGIN_REDIRECT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSavedLoginRedirect() {
  try {
    sessionStorage.removeItem(LOGIN_REDIRECT_KEY);
    localStorage.removeItem(LOGIN_REDIRECT_KEY);
  } catch {
    // Ignore
  }
}
