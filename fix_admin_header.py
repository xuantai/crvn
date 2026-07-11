import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add to EN
en_add = """    "Đăng Bài Hát Mới": "Post New Song","""
content = re.sub(r'const en = {', r'const en = {\n' + en_add, content, 1)

# Add to KR
kr_add = """    "Đăng Bài Hát Mới": "새 노래 게시","""
content = re.sub(r'const kr = {', r'const kr = {\n' + kr_add, content, 1)

# Add to JP
jp_add = """    "Đăng Bài Hát Mới": "新曲を投稿","""
content = re.sub(r'const jp = {', r'const jp = {\n' + jp_add, content, 1)

# Add to TH
th_add = """    "Đăng Bài Hát Mới": "โพสต์เพลงใหม่","""
content = re.sub(r'const th = {', r'const th = {\n' + th_add, content, 1)

# Add to CN
cn_add = """    "Đăng Bài Hát Mới": "发布新歌","""
content = re.sub(r'const cn = {', r'const cn = {\n' + cn_add, content, 1)

# Add to VN
vn_add = """    "Đăng Bài Hát Mới": "Đăng Bài Hát Mới","""
content = re.sub(r'const vn = {', r'const vn = {\n' + vn_add, content, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
