export function getPlatformDomain(): string {
  if (typeof window === 'undefined') return 'bbb.bz';
  const host = window.location.hostname;
  if (host.endsWith('.bbb.bz') || host === 'bbb.bz') return 'bbb.bz';
  if (host.endsWith('.chorus.vn') || host === 'chorus.vn') return 'chorus.vn';
  return host.includes('bbb') ? 'bbb.bz' : 'chorus.vn';
}

export function getPlatformBrandName(): string {
  const domain = getPlatformDomain();
  if (domain === 'bbb.bz') return 'bbb.bz';
  return 'Chorus.vn';
}

export function getPlatformFullDomainUrl(): string {
  return `https://${getPlatformDomain()}`;
}

export function getArtistSubdomainUrl(
  extension: string,
  artistOrSubPath?: { customDomain?: string; externalWebsiteUrl?: string; hasExternalWebsite?: boolean } | string,
  subPath: string = ''
): string {
  if (!extension) return '/';
  const host = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '').toLowerCase().trim() : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const parts = host.split('.');
  const baseDomain = (parts.length >= 2 && !isLocal) ? parts.slice(-2).join('.') : getPlatformDomain();

  let path = typeof artistOrSubPath === 'string' ? artistOrSubPath : subPath;
  if (path && !path.startsWith('/')) {
    path = '/' + path;
  }
  if (path === '/') path = '';

  if (!isLocal) {
    return `https://${extension}.${baseDomain}${path}`;
  } else {
    const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
    return `http://${extension}.localhost${port}${path}`;
  }
}

export function formatPlatformText(text: string): string {
  if (!text) return text;
  const domain = getPlatformDomain();

  if (domain === 'bbb.bz') {
    return text
      .replace(/chorus\.vn/gi, 'bbb.bz')
      .replace(/Chorus\.vn/gi, 'bbb.bz')
      .replace(/CHORUS\.VN/gi, 'bbb.bz')
      .replace(/BBB\.BZ/gi, 'bbb.bz')
      .replace(/BBB/g, 'bbb')
      .replace(/Chorus/g, 'bbb');
  }
  return text;
}

export function ensureGoogleSdkLoaded(timeoutMs: number = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).google?.accounts?.id) {
      return resolve(true);
    }

    let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, 100);
  });
}
