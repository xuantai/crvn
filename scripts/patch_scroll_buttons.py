import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update SocialCarousel
social_start = "function SocialCarousel({ data }: { data: AppData }) {"
social_new = """function SocialCarousel({ data, pushDown = false }: { data: AppData, pushDown?: boolean }) {"""
content = content.replace(social_start, social_new)

social_class_old = """<div className="fixed top-6 left-6 z-50 flex flex-col items-center gap-3">"""
social_class_new = """<div className={`fixed left-6 z-50 flex flex-col items-center gap-3 transition-all duration-500 ease-in-out ${pushDown ? 'top-20' : 'top-6'}`}>"""
content = content.replace(social_class_old, social_class_new)

# 2. Update LanguageSwitcher
lang_start = "const LanguageSwitcher = ({ isRelative = false }: { isRelative?: boolean }) => {"
lang_new = "const LanguageSwitcher = ({ isRelative = false, pushDown = false }: { isRelative?: boolean, pushDown?: boolean }) => {"
content = content.replace(lang_start, lang_new)

lang_class_old = """<div className={isRelative ? "relative" : "fixed top-6 right-6 z-50"}>"""
lang_class_new = """<div className={isRelative ? "relative" : `fixed right-6 z-50 transition-all duration-500 ease-in-out ${pushDown ? 'top-20' : 'top-6'}`}>"""
content = content.replace(lang_class_old, lang_class_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
