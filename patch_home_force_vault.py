import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logic = """  const isVault = !activeMenuObj || activeMenuObj.type === 'vault';
  const isAbout = activeMenuObj?.type === 'about';
  const isBio = activeMenuObj?.type === 'bio';
  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) || (data.biography.experience && data.biography.experience.length > 0)));
  
  const finalMenus = currentMenus.filter((m: any) => {
    if (m.type === 'about' && !hasAbout) return false;
    if (m.type === 'bio' && !hasBio) return false;
    return true;
  });
  const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;"""

new_logic = """  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) || (data.biography.experience && data.biography.experience.length > 0)));
  
  const finalMenus = currentMenus.filter((m: any) => {
    if (m.type === 'about' && !hasAbout) return false;
    if (m.type === 'bio' && !hasBio) return false;
    return true;
  });
  const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;
  const isVault = !hasNavbar || !activeMenuObj || activeMenuObj.type === 'vault';
  const isAbout = hasNavbar && activeMenuObj?.type === 'about';
  const isBio = hasNavbar && activeMenuObj?.type === 'bio';"""

content = content.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
