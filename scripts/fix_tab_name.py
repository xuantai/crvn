import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the UI calls
content = content.replace('t("Mạng Xã Hội")', 't("Branding Song")')

# We need to replace the dictionary keys. 
# We had `"Mạng Xã Hội": "Branding Song",`
content = content.replace('"Mạng Xã Hội": "Branding Song",', '"Branding Song": "Branding Song",')

# Actually, in the Vietnamese dictionary, `"Branding Song"` should be `"Branding Song"` or `"Nhạc Thương Hiệu"`?
# The user said: "Phải là Branding Song ( Dịch các ngôn ngữ khác cho chuẩn luôn )" -> "Must be Branding Song (translate for other languages correctly too)"
# So let's just make it Branding Song for all languages if they want. Or in Vietnamese it can be "Branding Song" too.
# Let's search and replace carefully.
