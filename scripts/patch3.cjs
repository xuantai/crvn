const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `function RequireAdmin({ children }: { children: React.ReactNode }) {
  const ext = getArtistExtensionFromUrl();
  const host = window.location.hostname.replace(/^www\\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  
  if (!ext && !isSubdomain) {
     // Root domain without extension should redirect to ACP
     window.location.href = '/acp';
     return null;
  }

  const token = getAdminToken();
  if (!token) {
    return <AdminLogin />;
  }
  return <>{children}</>;
}`;

code = code.replace(/function RequireAdmin\(\{[^}]+\}[^{]+\{[^}]+\n[^}]+AdminLogin[^}]+}[^}]+}/m, replacement);
fs.writeFileSync('src/App.tsx', code);
