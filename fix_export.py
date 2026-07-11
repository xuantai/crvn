import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("export default \nconst AdminFloatingAddButton", "const AdminFloatingAddButton")
content = content.replace("\nfunction App() {", "\nexport default function App() {")

with open('src/App.tsx', 'w') as f:
    f.write(content)
