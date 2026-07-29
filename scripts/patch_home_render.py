import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to wrap the contents of main that belong to Vault.
# Actually, the Vault includes `<section id="music-tabs-section" ...>`, `Released Songs Section`, and `Spotify Section`.
# Let's extract the menu type.
# We have `activeMenuTab`. We can find the active menu object to know its type.
# ```tsx
# const activeMenuObj = data.menus?.find((m: any) => m.id === activeMenuTab);
# const isVault = !activeMenuObj || activeMenuObj.type === 'vault';
# const isAbout = activeMenuObj?.type === 'about';
# const isBio = activeMenuObj?.type === 'bio';
# ```

# I will inject these variables at the top of the render block of `Home`.
render_vars = """
  const activeMenuObj = data.menus?.find((m: any) => m.id === activeMenuTab);
  const isVault = !activeMenuObj || activeMenuObj.type === 'vault';
  const isAbout = activeMenuObj?.type === 'about';
  const isBio = activeMenuObj?.type === 'bio';
"""
content = content.replace("return (\n    <motion.div", render_vars + "  return (\n    <motion.div")

# Inject PublicNavbar before main
navbar = "\n      <PublicNavbar menus={data.menus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} />\n"
content = content.replace("      {/* Main Content */}\n      <main", navbar + "      {/* Main Content */}\n      <main")

# Wrap the Vault sections
# We need to wrap everything inside `<main>` with `{isVault && (<> ... </>)}`
# and also add `{isAbout && <PublicAboutView aboutMe={data.aboutMe} />}` and `{isBio && <PublicBioView biography={data.biography} t={t} />}`

content = content.replace('        {/* Demos Section */}', '        {isVault && (\n          <>\n        {/* Demos Section */}')
content = content.replace('      </main>', '          </>\n        )}\n        {isAbout && <PublicAboutView aboutMe={data.aboutMe} />}\n        {isBio && <PublicBioView biography={data.biography} t={t} />}\n      </main>')

with open('src/App.tsx', 'w') as f:
    f.write(content)
