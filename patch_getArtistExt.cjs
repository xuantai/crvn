const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const getArtistExtensionFromUrl = (customPath?: string) => {
  const currentPath = customPath !== undefined ? customPath : window.location.pathname;
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  if (isDefaultPlatform && !isLocal) {
    if (currentPath === '/') {
      return '';
    }
  }

  if ((window as any).__ACTIVE_ARTIST_EXTENSION__ && customPath === undefined) {
    return (window as any).__ACTIVE_ARTIST_EXTENSION__;
  }
  if (!isLocal && !isDefaultPlatform) {
    return '';
  }`;

const replacement1 = `const getArtistExtensionFromUrl = (customPath?: string) => {
  const currentPath = customPath !== undefined ? customPath : window.location.pathname;
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  if ((window as any).__ACTIVE_ARTIST_EXTENSION__ && !isDefaultPlatform && !isLocal) {
    return (window as any).__ACTIVE_ARTIST_EXTENSION__; // Custom domain always uses injected extension
  }

  if (isDefaultPlatform && !isLocal) {
    if (currentPath === '/') {
      return '';
    }
  }

  if ((window as any).__ACTIVE_ARTIST_EXTENSION__ && customPath === undefined) {
    return (window as any).__ACTIVE_ARTIST_EXTENSION__;
  }
  if (!isLocal && !isDefaultPlatform) {
    return (window as any).__ACTIVE_ARTIST_EXTENSION__ || '';
  }`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/App.tsx', code);
