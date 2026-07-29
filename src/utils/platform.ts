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

export function getArtistSubdomainUrl(extension: string): string {
  const domain = getPlatformDomain();
  return `https://${extension}.${domain}`;
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
