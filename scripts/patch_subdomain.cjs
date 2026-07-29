const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldFunc = `const getArtistExtensionFromUrl = (customPath?: string) => {
  const currentPath = customPath !== undefined ? customPath : window.location.pathname;
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

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
  }

  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  const segments = currentPath.split('/').filter(Boolean);`;

const newFunc = `const getArtistExtensionFromUrl = (customPath?: string) => {
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
  }

  const segments = currentPath.split('/').filter(Boolean);`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/App.tsx', code);
