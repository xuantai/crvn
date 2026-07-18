const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const redirectFunc = `
const getArtistAdminRedirect = (targetExt: string, toPage = 'admin') => {
  const host = window.location.hostname.replace(/^www\\./, '').toLowerCase().trim();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isDefaultPlatform = host === 'chorus.vn' || host.endsWith('.run.app') || host.endsWith('.aistudio.google') || host.endsWith('.gitpod.io');

  if (!isLocal && (!isDefaultPlatform || host.endsWith('.chorus.vn'))) {
     return \`https://\${targetExt}.chorus.vn/\${toPage}\`;
  } else if (isLocal && host.endsWith('.localhost')) {
     return \`\${window.location.protocol}//\${targetExt}.localhost:\${window.location.port}/\${toPage}\`;
  }
  return \`/\${targetExt}/\${toPage}\`;
};
`;

code = code.replace(`const getActiveAdminSession = () => {`, redirectFunc + `\nconst getActiveAdminSession = () => {`);

const target2 = `    if (activeExt && activeToken && activeExt !== ext) {
      const activeActivated = localStorage.getItem('activeAdminActivated') !== 'false';
      if (!activeActivated) {
        window.location.href = \`/\${activeExt}/help\`;
      } else {
        window.location.href = \`/\${activeExt}/admin\`;
      }
      return null;
    }`;

const replacement2 = `    if (activeExt && activeToken && activeExt !== ext) {
      const activeActivated = localStorage.getItem('activeAdminActivated') !== 'false';
      if (!activeActivated) {
        window.location.href = getArtistAdminRedirect(activeExt, 'help');
      } else {
        window.location.href = getArtistAdminRedirect(activeExt, 'admin');
      }
      return null;
    }`;

code = code.replace(target2, replacement2);

const target3 = `    if (activeExt && activeToken && activeExt !== currentExt) {
      if (isAdminPage || isHelpPage) {
        if (!activeActivated) {
          window.location.href = \`/\${activeExt}/help\`;
        } else {
          window.location.href = \`/\${activeExt}/admin\`;
        }
        return;
      }
    }`;

const replacement3 = `    if (activeExt && activeToken && activeExt !== currentExt) {
      if (isAdminPage || isHelpPage) {
        if (!activeActivated) {
          window.location.href = getArtistAdminRedirect(activeExt, 'help');
        } else {
          window.location.href = getArtistAdminRedirect(activeExt, 'admin');
        }
        return;
      }
    }`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', code);
