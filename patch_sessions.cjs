const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix getArtistExtensionFromUrl
code = code.replace(
`  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

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
  }`,
`  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

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
  }`
);

// 2. Add Cookie Helpers and patch getActiveAdminSession
const sessionCodeOld = `const getActiveAdminSession = () => {
  let activeExt = localStorage.getItem('activeAdminExtension');`;

const sessionCodeNew = `const setGlobalCookie = (name, value) => {
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const domain = (host.endsWith('.chorus.vn') || host === 'chorus.vn') ? 'domain=.chorus.vn;' : '';
  document.cookie = \`\${name}=\${encodeURIComponent(value)}; \${domain} path=/; max-age=31536000; SameSite=Lax\`;
};

const getGlobalCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const removeGlobalCookie = (name) => {
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const domain = (host.endsWith('.chorus.vn') || host === 'chorus.vn') ? 'domain=.chorus.vn;' : '';
  document.cookie = \`\${name}=; \${domain} path=/; max-age=0; SameSite=Lax\`;
};

const getActiveAdminSession = () => {
  let activeExt = localStorage.getItem('activeAdminExtension') || getGlobalCookie('activeAdminExtension');
  if (activeExt && !localStorage.getItem('activeAdminExtension')) localStorage.setItem('activeAdminExtension', activeExt);`;

code = code.replace(sessionCodeOld, sessionCodeNew);

// 3. Update getActiveAdminSession to use getGlobalCookie for others
code = code.replace(
`  let activeToken = activeExt ? localStorage.getItem(\`adminToken_\${activeExt}\`) : null;
  
  if (!activeExt || !activeToken) {`,
`  let activeToken = activeExt ? (localStorage.getItem(\`adminToken_\${activeExt}\`) || getGlobalCookie(\`adminToken_\${activeExt}\`)) : null;
  if (activeExt && activeToken && !localStorage.getItem(\`adminToken_\${activeExt}\`)) localStorage.setItem(\`adminToken_\${activeExt}\`, activeToken);
  
  if (!activeExt || !activeToken) {`
);

code = code.replace(
`  if (!activeExt && localStorage.getItem('adminToken')) {
    activeToken = localStorage.getItem('adminToken');
  }
  
  let activeName = localStorage.getItem('activeAdminName');`,
`  if (!activeExt && (localStorage.getItem('adminToken') || getGlobalCookie('adminToken'))) {
    activeToken = localStorage.getItem('adminToken') || getGlobalCookie('adminToken');
  }
  
  let activeName = localStorage.getItem('activeAdminName') || getGlobalCookie('activeAdminName');`
);

code = code.replace(
`  const activeActivated = localStorage.getItem('activeAdminActivated') !== 'false';
  const activeAvatar = localStorage.getItem('activeAdminAvatar') || '';`,
`  const storedActivated = localStorage.getItem('activeAdminActivated') || getGlobalCookie('activeAdminActivated');
  const activeActivated = storedActivated !== 'false';
  const activeAvatar = localStorage.getItem('activeAdminAvatar') || getGlobalCookie('activeAdminAvatar') || '';`
);

// 4. Update clearAllSessions to clear cookies
code = code.replace(
`      originalRemoveItem.call(localStorage, key);
    }
  });`,
`      originalRemoveItem.call(localStorage, key);
      removeGlobalCookie(key);
    }
  });
  removeGlobalCookie('adminToken');
  removeGlobalCookie('activeAdminExtension');
  removeGlobalCookie('activeAdminName');
  removeGlobalCookie('activeAdminAvatar');
  removeGlobalCookie('activeAdminActivated');
`
);

// 5. Update syncLoginSession to set cookies
code = code.replace(
`  originalSetItem.call(localStorage, 'activeAdminActivated', activated !== false ? 'true' : 'false');
  
  // Save in prefixed space for that artist extension to bypass separation patch`,
`  originalSetItem.call(localStorage, 'activeAdminActivated', activated !== false ? 'true' : 'false');
  
  setGlobalCookie('adminToken', token);
  setGlobalCookie(\`adminToken_\${extension}\`, token);
  setGlobalCookie('activeAdminExtension', extension);
  setGlobalCookie('activeAdminName', artistName);
  setGlobalCookie('activeAdminAvatar', avatar);
  setGlobalCookie('activeAdminActivated', activated !== false ? 'true' : 'false');

  // Save in prefixed space for that artist extension to bypass separation patch`
);

// 6. Update UnifiedArtistSessionFloatingWidget
code = code.replace(
`      fetch('/api/data', { cache: 'no-store',
        headers: { 'x-artist-extension': activeExt }
      })`,
`      fetch(\`/api/data?artist=\${activeExt}\`, { cache: 'no-store',
        headers: { 'x-artist-extension': activeExt }
      })`
);

fs.writeFileSync('src/App.tsx', code);
