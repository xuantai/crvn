import sys

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('<Route path="/pricing" element={<div className="min-h-screen bg-white" />} />\n', '')
content = content.replace('<Route path="/discover" element={<div className="min-h-screen bg-white" />} />\n', '')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Routes patched")
