with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('{t("Học Vấn")}', '{t[\'Học Vấn\']}')
content = content.replace('{t("Kinh nghiệm")}', '{t[\'Kinh nghiệm\']}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed t() in PublicBioView")
