import sys
import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace specific known strings from the grep output
replacements = {
    "Xem trước giao diện": "Xem trước chủ đề",
    "Chỉnh Sửa Giao Diện": "Chỉnh Sửa Chủ Đề",
    "hiển thị của giao diện khi chọn": "hiển thị của chủ đề khi chọn",
    "Giao Diện để chỉnh sửa chi tiết": "Chủ Đề để chỉnh sửa chi tiết",
    "bài hát nào dùng giao diện này": "bài hát nào dùng chủ đề này",
    "Giao diện xem trên máy tính": "Chủ đề xem trên máy tính",
    "Giao diện": "Chủ đề",
    "Giao Diện": "Chủ Đề",
    "giao diện": "chủ đề"
}

# Apply simple string replacement in order of length descending (to avoid partial word matches causing issues if we just replaced 'giao diện' first)

for key, value in replacements.items():
    content = content.replace(key, value)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
