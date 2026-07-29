const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (isDefaultPlatform && !isLocal) {
    if (currentPath === '/') {
      return '';
    }
  }`;

const replacement = `  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.chorus.vn') || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  if (isDefaultPlatform && !isLocal) {
    if (currentPath === '/') {
      return '';
    }
  }`;

code = code.replace(target, replacement);

const removeTarget = `  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  const segments = currentPath.split('/').filter(Boolean);`;

const removeReplacement = `  const segments = currentPath.split('/').filter(Boolean);`;

code = code.replace(removeTarget, removeReplacement);

fs.writeFileSync('src/App.tsx', code);
