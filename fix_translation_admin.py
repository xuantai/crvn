import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the tooltip text
content = content.replace('t("Tạo mới bài viết")', 't("Thêm Mới Bài Hát")')

# Replace the keys in translation dicts
content = content.replace('"Tạo mới bài viết": "Tạo mới bài viết",', '"Thêm Mới Bài Hát": "Thêm Mới Bài Hát",')
content = content.replace('"Tạo mới bài viết": "Create New Post",', '"Thêm Mới Bài Hát": "Add New Song",')
content = content.replace('"Tạo mới bài viết": "새 게시물 작성",', '"Thêm Mới Bài Hát": "새 노래 추가",')
content = content.replace('"Tạo mới bài viết": "新しい投稿を作成",', '"Thêm Mới Bài Hát": "新しい曲を追加",')
content = content.replace('"Tạo mới bài viết": "สร้างบทความใหม่",', '"Thêm Mới Bài Hát": "เพิ่มเพลงใหม่",')
content = content.replace('"Tạo mới bài viết": "创建新文章",', '"Thêm Mới Bài Hát": "添加新歌曲",')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
