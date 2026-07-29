import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "setToast('Đã lưu thông tin thành công!');\n    setTimeout(() => setToast(''), 3000);",
    "setToast('Đã lưu thông tin thành công!');\n    setTimeout(() => setToast(''), 3000);\n    loadData();"
)

with open('src/App.tsx', 'w') as f:
    f.write(code)
