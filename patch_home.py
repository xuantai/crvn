import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to add state for activeMenuTab
# Right after const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);
state_injection = """
  const [activeMenuTab, setActiveMenuTab] = useState<string>('');
"""
content = content.replace("const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);", "const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);\n" + state_injection)

# Inside the fetch callback
fetch_callback_injection = """
        // Determine default menu tab
        if (data.menus && data.menus.length > 0) {
          const visibleMenus = data.menus.filter((m: any) => m.isVisible);
          if (visibleMenus.length > 0) {
            setActiveMenuTab(visibleMenus[0].id);
          }
        } else {
          setActiveMenuTab('m1'); // default to vault
        }
"""
content = content.replace("document.title = data.pageTitle", fetch_callback_injection + "        document.title = data.pageTitle")

with open('src/App.tsx', 'w') as f:
    f.write(content)
