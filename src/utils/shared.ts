import React from "react";
import { getPlatformDomain } from "./platform";

// ============================================
// Shared utilities extracted from App.tsx
// ============================================
export const formatShareUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = String(url).trim();
  while (/^https?:\/\/[^\/]+\/?https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.replace(/^https?:\/\/[^\/]+\/?(?=https?:\/\/)/i, '');
  }
  return cleaned
    .replace(/xn--ti-jia\.com/gi, 'tài.com')
    .replace(/xn--ti-8ja\.com/gi, 'tài.com')
    .replace(/xn--ti-.*\.com/gi, 'tài.com');
};

export const getThumbUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.includes('-thumb')) return url;
  const lastDot = url.lastIndexOf('.');
  if (lastDot > 0 && (url.includes('/uploads/') || url.includes('.r2.dev/'))) {
    return `${url.substring(0, lastDot)}-thumb${url.substring(lastDot)}`;
  }
  return url;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (!target || (target as any).__error_handled__) return;
  (target as any).__error_handled__ = true;
  if (target.src.includes('-thumb.')) {
    target.src = target.src.replace(/-thumb\.(jpg|png|webp|jpeg)/i, '.$1');
  } else if (target.src.includes('cdn.chorus.vn/')) {
    target.src = target.src.replace('cdn.chorus.vn/', 'chorus.vn/');
  }
};

// ---- GLOBAL MULTI-ARTIST INTERCEPTORS ----
export const isBasePlatformDomain = (host: string) => {
  const cleanHost = host.replace(/^www\./, '').toLowerCase().trim();
  if (cleanHost === 'chorus.vn' || cleanHost === 'bbb.bz') return true;
  if (cleanHost.endsWith('.run.app') || cleanHost.endsWith('.aistudio.google') || cleanHost.endsWith('.gitpod.io')) {
    if (!(window as any).__ACTIVE_ARTIST_EXTENSION__) return true;
  }
  return false;
};

export const getArtistExtensionFromUrl = (customPath?: string) => {
  const currentPath = customPath !== undefined ? customPath : window.location.pathname;
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const isBaseDomain = isBasePlatformDomain(host);

  if (parts.length >= 3 && !isLocal) {
    const baseDomain = parts.slice(-2).join('.');
    if (baseDomain === 'chorus.vn' || baseDomain === 'bbb.bz') {
      const sub = parts.slice(0, parts.length - 2).join('.');
      if (sub && sub !== 'www') return sub;
    }
  }

  if ((window as any).__ACTIVE_ARTIST_EXTENSION__ && !isLocal) {
    return (window as any).__ACTIVE_ARTIST_EXTENSION__; // Custom domain always uses injected extension
  }

  if (isBaseDomain && !isLocal) {
    if (currentPath === '/') {
      return '';
    }
  }

  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0].toLowerCase();
    
    const reserved = ['admin', 'acp', 'master', 'mem', 'demo', 'song', 'playlist', 'verify-email', 'help', 'register', 'login', 'explore', 'kham-pha'];
    if (!reserved.includes(firstSegment)) {
      return segments[0];
    }
  }

  const activeAdminExt = (typeof localStorage !== 'undefined' ? ((window as any).__originalGetItem__ ? (window as any).__originalGetItem__.call(localStorage, 'activeAdminExtension') : localStorage.getItem('activeAdminExtension')) : null) || getGlobalCookie('activeAdminExtension');
  if (activeAdminExt) {
    return activeAdminExt;
  }

  return '';
};

export const isArtistContext = () => {
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  if (parts.length >= 3 && !isLocal) {
    const sub = parts.slice(0, parts.length - 2).join('.');
    if (sub && sub !== 'www') return true;
  }
  
  // Custom domain check
  const isBaseDomain = isBasePlatformDomain(host);
  if (!isLocal && !isBaseDomain) {
    return true;
  }
  return false;
};

export const getAdminLink = (subPath: string = '', _customPath?: string) => {
  let clean = subPath;
  if (clean.startsWith('#')) {
    clean = clean.substring(1);
  }
  const normalizedPath = clean ? (clean.startsWith('/') ? clean : `/${clean}`) : '';
  return `/admin${normalizedPath}`;
};

export const getArtistLink = (subPath: string = '', customPath?: string) => {
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const currentExt = getArtistExtensionFromUrl();
  const targetExt = (customPath !== undefined ? getArtistExtensionFromUrl(customPath) : (customPath || currentExt)) || (window as any).__ACTIVE_ARTIST_EXTENSION__ || '';
  const isArtistCtx = isArtistContext();

  let cleanPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';

  // 1. If cleanPath starts with /<targetExt>, strip /<targetExt>
  if (targetExt) {
    const extPrefix = `/${targetExt}`;
    if (cleanPath === extPrefix || cleanPath === `${extPrefix}/`) {
      cleanPath = '';
    } else if (cleanPath.startsWith(`${extPrefix}/`)) {
      cleanPath = cleanPath.substring(extPrefix.length);
    }
  }

  // 2. Check if cleanPath contains a firstSegment matching an extension (e.g., /acxuantai/song/123)
  if (cleanPath.startsWith('/')) {
    const pParts = cleanPath.split('/').filter(Boolean);
    if (pParts.length > 0) {
      const firstSegment = pParts[0].toLowerCase();
      const RESERVED_EXTS = [
        'admin', 'master', 'acp', 'verify-email', 'help', 'api', 'assets', 'static', 
        'favicon.ico', 'robots.txt', 'sitemap.xml', 'mem', 'demo', 'song', 'playlist',
        'explore', 'kham-pha'
      ];
      if (!RESERVED_EXTS.includes(firstSegment)) {
        const explicitExt = firstSegment;
        const restOfPath = '/' + pParts.slice(1).join('/');
        const normalizedRest = (restOfPath === '/' || restOfPath === '') ? '' : restOfPath;

        if (isArtistCtx && currentExt && explicitExt.toLowerCase() === currentExt.toLowerCase()) {
          return normalizedRest || '/';
        }
        const platformDomain = getPlatformDomain();
        if (!isLocal) {
          return `https://${explicitExt}.${platformDomain}${normalizedRest}`;
        } else {
          return `http://${explicitExt}.localhost:${window.location.port}${normalizedRest}`;
        }
      }
    }
  }

  const normalizedPath = cleanPath ? (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`) : '';

  // If inside an artist context (subdomain or custom domain like tài.vn) and target is current artist, return relative path!
  if (isArtistCtx) {
    if (!targetExt || (currentExt && targetExt.toLowerCase() === currentExt.toLowerCase())) {
      return normalizedPath || '/';
    }
  }

  // Cross-linking to another artist or navigating from landing page (chorus.vn)
  const platformDomain = getPlatformDomain();
  if (targetExt && !isLocal) {
    return `https://${targetExt}.${platformDomain}${normalizedPath}`;
  } else if (targetExt && isLocal) {
    return `http://${targetExt}.localhost:${window.location.port}${normalizedPath}`;
  }

  return normalizedPath || '/';
};

export const getArtistFullUrl = (subPath: string = '', customPath?: string) => {
  const link = getArtistLink(subPath, customPath);
  let full = link;
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    full = window.location.origin + (link.startsWith('/') ? link : `/${link}`);
  }
  return formatShareUrl(full);
};

export const sanitizePlaylistPassword = (pwd: any): string => {
  if (!pwd || pwd === true || pwd === false || pwd === 1 || pwd === '1') return '';
  const str = String(pwd).trim();
  const lower = str.toLowerCase();
  if (lower === 'true' || lower === 'false' || lower === 'undefined' || lower === 'null') return '';
  return str;
};

export const getAdminTokenKey = (customPath?: string) => getArtistExtensionFromUrl(customPath) ? `adminToken_${getArtistExtensionFromUrl(customPath)}` : 'adminToken';
export const getMemberTokenKey = (customPath?: string) => getArtistExtensionFromUrl(customPath) ? `memberToken_${getArtistExtensionFromUrl(customPath)}` : 'memberToken';

export const setGlobalCookie = (name: string, value: string) => {
  if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) {
    return;
  }
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
  const domainAttr = !isLocal ? `domain=.${baseDomain};` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; ${domainAttr} path=/; max-age=31536000; SameSite=Lax`;
};

export const getGlobalCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

export const removeGlobalCookie = (name: string) => {
  const host = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '').toLowerCase().trim() : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = isHttps ? '; Secure' : '';

  if (!isLocal) {
    document.cookie = `${name}=; domain=.${baseDomain}; path=/; expires=${expires}; max-age=0; SameSite=Lax${secure}`;
    document.cookie = `${name}=; domain=${baseDomain}; path=/; expires=${expires}; max-age=0; SameSite=Lax${secure}`;
    if (host !== baseDomain) {
      document.cookie = `${name}=; domain=.${host}; path=/; expires=${expires}; max-age=0; SameSite=Lax${secure}`;
      document.cookie = `${name}=; domain=${host}; path=/; expires=${expires}; max-age=0; SameSite=Lax${secure}`;
    }
  }
  document.cookie = `${name}=; path=/; expires=${expires}; max-age=0; SameSite=Lax${secure}`;
};


export const getArtistAdminRedirect = (targetExt: string, toPage = 'admin') => {
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const baseDomain = (parts.length >= 2 && !isLocal) ? parts.slice(-2).join('.') : host;

  if (toPage === 'admin' || toPage.startsWith('admin/')) {
    const sub = toPage.replace(/^admin\/?/, '');
    const adminPath = sub ? `/admin/${sub}` : '/admin';
    if (isLocal) {
      return `http://localhost:${window.location.port}${adminPath}`;
    }
    return `https://${baseDomain}${adminPath}`;
  }

  if (toPage === 'help' || toPage.startsWith('help/')) {
    if (isLocal) {
      return `http://localhost:${window.location.port}/help`;
    }
    return `https://${baseDomain}/help`;
  }

  // Public artist page link -> ALWAYS use subdomain!
  const pagePath = toPage ? (toPage.startsWith('/') ? toPage : `/${toPage}`) : '';
  if (!isLocal) {
    return `https://${targetExt}.${baseDomain}${pagePath}`;
  } else {
    return `http://${targetExt}.localhost:${window.location.port}${pagePath}`;
  }
};

export const getLogoutRedirectUrl = () => {
  if (typeof window === 'undefined') return '/';
  const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;
  const isSubdomain = parts.length >= 3 && !isLocal;
  const isCustomDomain = !isLocal && parts.length <= 2 && host !== baseDomain;

  if (isSubdomain || isCustomDomain) {
    return '/';
  }

  const ext = getArtistExtensionFromUrl();
  if (ext && window.location.pathname.startsWith(`/${ext}`)) {
    return `/${ext}`;
  }
  return '/';
};

export const getActiveAdminSession = () => {
  if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) {
    return {
      activeExt: '',
      activeToken: '',
      activeName: '',
      activeActivated: false,
      activeAvatar: ''
    };
  }
  let activeExt = getGlobalCookie('activeAdminExtension') || (typeof localStorage !== 'undefined' ? (localStorage.getItem('activeAdminExtension') || '') : '');
  let activeToken = activeExt 
    ? (getGlobalCookie(`adminToken_${activeExt}`) || getGlobalCookie('adminToken') || (typeof localStorage !== 'undefined' ? (localStorage.getItem(`adminToken_${activeExt}`) || localStorage.getItem('adminToken') || '') : '')) 
    : (typeof localStorage !== 'undefined' ? (localStorage.getItem('adminToken') || '') : '');

  if (!activeExt || !activeToken) {
    return {
      activeExt: '',
      activeToken: '',
      activeName: '',
      activeActivated: false,
      activeAvatar: ''
    };
  }

  let activeName = getGlobalCookie('activeAdminName') || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeAdminName') : '') || activeExt;
  const storedActivated = getGlobalCookie('activeAdminActivated') || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeAdminActivated') : '');
  const activeActivated = storedActivated !== 'false';
  const activeAvatar = getGlobalCookie('activeAdminAvatar') || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeAdminAvatar') : '') || '';

  return {
    activeExt,
    activeToken,
    activeName,
    activeActivated,
    activeAvatar
  };
};

export const getAdminToken = (customPath?: string) => {
  if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) return '';
  const key = getAdminTokenKey(customPath);
  let val = getGlobalCookie(key) || getGlobalCookie('adminToken');
  if (!val && typeof localStorage !== 'undefined') {
    val = localStorage.getItem(key) || localStorage.getItem('adminToken') || localStorage.getItem('masterToken') || '';
  }
  return val || '';
};
export const setAdminToken = (token: string, customPath?: string) => localStorage.setItem(getAdminTokenKey(customPath), token);
export const removeAdminToken = (customPath?: string) => {
  const origRemove = (window as any).__originalRemoveItem__ || localStorage.removeItem;
  const key = getAdminTokenKey(customPath);
  origRemove.call(localStorage, key);
  const ext = getArtistExtensionFromUrl(customPath);
  if (ext) {
    origRemove.call(localStorage, `adminToken_${ext}`);
    origRemove.call(localStorage, `${ext}_adminToken`);
  }
  // Check if any other adminTokens are left in localStorage
  let hasAnyToken = false;
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k && (k === 'adminToken' || k.includes('adminToken_') || k.endsWith('_adminToken'))) {
      hasAnyToken = true;
      break;
    }
  }
  if (!hasAnyToken) {
    origRemove.call(localStorage, 'activeAdminExtension');
    origRemove.call(localStorage, 'activeAdminName');
    origRemove.call(localStorage, 'activeAdminActivated');
    origRemove.call(localStorage, 'activeAdminAvatar');
  }
};

export const getMemberToken = (customPath?: string) => {
  if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) return '';
  const host = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '').toLowerCase().trim() : '';
  const isChorusDomain = host.endsWith('.chorus.vn') || host === 'chorus.vn';
  const key = getMemberTokenKey(customPath);
  if (isChorusDomain) {
    return getGlobalCookie(key) || getGlobalCookie('memberToken') || '';
  }
  return localStorage.getItem(key) || '';
};
export const setMemberToken = (token: string, customPath?: string) => localStorage.setItem(getMemberTokenKey(customPath), token);
export const removeMemberToken = (customPath?: string) => {
  const origRemove = (window as any).__originalRemoveItem__ || localStorage.removeItem;
  const key = getMemberTokenKey(customPath);
  origRemove.call(localStorage, key);
  const ext = getArtistExtensionFromUrl(customPath);
  if (ext) {
    origRemove.call(localStorage, `memberToken_${ext}`);
    origRemove.call(localStorage, `${ext}_memberToken`);
  }
};
