with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('t["Hiển thị"]', 't("Hiển thị")')
content = content.replace('t["bài / trang"]', 't("bài / trang")')
content = content.replace('t["Tổng"]', 't("Tổng")')
content = content.replace('t["Trước"]', 't("Trước")')
content = content.replace('t["Sau"]', 't("Sau")')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed remaining t[] calls")
