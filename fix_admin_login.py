import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("function AdminLogin() {\n  const ext", "function AdminLogin() {\n  const { t } = useAdminTranslation();\n  const ext")

with open('src/App.tsx', 'w') as f:
    f.write(content)
