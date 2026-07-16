import sys

with open("src/components/ChorusVNLanding.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """                  try {
                    localStorage.removeItem('chorus_admin_token');
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.reload();
                  } catch (e) {}"""

repl = """                  try {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem(`adminToken_${loggedInArtist.extension}`);
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.reload();
                  } catch (e) {}"""

content = content.replace(target, repl)

with open("src/components/ChorusVNLanding.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Landing logout patched")
