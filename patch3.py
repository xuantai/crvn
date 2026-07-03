import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

old_func = """function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = getAdminToken();
  if (!token) {
    return <AdminLogin />;
  }
  return <>{children}</>;
}"""

new_func = """function RequireAdmin({ children }: { children: React.ReactNode }) {
  const ext = getArtistExtensionFromUrl();
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  
  if (!ext && !isSubdomain && host === 'chorus.vn') {
     window.location.href = '/acp';
     return null;
  }
  
  const token = getAdminToken();
  if (!token) {
    return <AdminLogin />;
  }
  return <>{children}</>;
}"""

code = code.replace(old_func, new_func)

with open('src/App.tsx', 'w') as f:
    f.write(code)

