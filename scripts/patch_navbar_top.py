import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove old PublicNavbar
old_navbar = "      <PublicNavbar menus={currentMenus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} />\n"
content = content.replace(old_navbar, "")

# 2. Add new PublicNavbar + wrap Hero Section
hero_section_start = "      {/* Hero Section */}\n      <section"
new_hero_start = """      {/* Top Navbar */}
      <div className="relative z-50 pt-28 sm:pt-36">
        <PublicNavbar menus={currentMenus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} />
      </div>

      {isVault && (
      {/* Hero Section */}
      <section"""
content = content.replace(hero_section_start, new_hero_start)

# 3. Add closing brace for isVault around Hero Section
hero_section_end = """              })()}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}"""

new_hero_end = """              })()}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Main Content */}"""

content = content.replace(hero_section_end, new_hero_end)

with open('src/App.tsx', 'w') as f:
    f.write(content)
