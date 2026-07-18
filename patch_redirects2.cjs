const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const getArtistAdminRedirect = (targetExt: string, toPage = 'admin') => {
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (!isLocal && (!isDefaultPlatform || host.endsWith('.chorus.vn'))) {
     return \`https://\${targetExt}.chorus.vn/\${toPage}\`;
  } else if (isLocal && host.endsWith('.localhost')) {
     return \`\${window.location.protocol}//\${targetExt}.localhost:\${window.location.port}/\${toPage}\`;
  }
  return \`/\${targetExt}/\${toPage}\`;
};`;

const replacement1 = `const getArtistAdminRedirect = (targetExt: string, toPage = 'admin') => {
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  const currentExt = (window as any).__ACTIVE_ARTIST_EXTENSION__ || '';
  if (currentExt === targetExt && !host.endsWith('.chorus.vn')) {
     return \`/\${toPage}\`; // If already on custom domain or root domain of the artist, use relative paths
  }

  if (!isLocal && (!isDefaultPlatform || host.endsWith('.chorus.vn'))) {
     return \`https://\${targetExt}.chorus.vn/\${toPage}\`;
  } else if (isLocal && host.endsWith('.localhost')) {
     return \`\${window.location.protocol}//\${targetExt}.localhost:\${window.location.port}/\${toPage}\`;
  }
  return \`/\${targetExt}/\${toPage}\`;
};`;

code = code.replace(target1, replacement1);

fs.writeFileSync('src/App.tsx', code);
