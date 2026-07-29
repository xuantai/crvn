import sys

with open("src/components/HelpPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the broken imports
content = content.replace("import { TEMPLATES, DEFAULT_VI_NAMES } from '../templates';", "")

# Define TEMPLATES inline
template_def = """
const TEMPLATES = [
  { id: '1', name: 'Vui vẻ (Ấm áp)' },
  { id: '2', name: 'Căng Cực (Sôi động)' },
  { id: '3', name: 'Lạnh (Buồn)' },
  { id: '4', name: 'Thư giãn (Nhẹ nhàng)' }
];
"""

content = content.replace("export default function HelpPage() {", template_def + "\nexport default function HelpPage() {")

content = content.replace("DEFAULT_VI_NAMES[t.id] ? DEFAULT_VI_NAMES[t.id] : t.name", "t.name")
content = content.replace("TEMPLATES.find(t => t.id === selectedTheme) || TEMPLATES[0]", "{ id: selectedTheme, templateTheme: '1' }")

with open("src/components/HelpPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
