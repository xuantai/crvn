import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to add some admin translation keys
keys_to_add = {
    'Về Tôi': 'Về Tôi',
    'Tiểu Sử': 'Tiểu Sử',
    'Quản lý Menu': 'Quản lý Menu',
    'Giới thiệu nghệ sĩ': 'Giới thiệu nghệ sĩ',
    'Tên Thật': 'Tên Thật',
    'Ngày Sinh': 'Ngày Sinh',
    'Địa Chỉ': 'Địa Chỉ',
    'Công Ty': 'Công Ty',
    'Vai Trò': 'Vai Trò',
    'Email': 'Email',
    'SĐT': 'SĐT',
    'Học Vấn': 'Học Vấn',
    'Kinh nghiệm': 'Kinh nghiệm',
    'Thời gian': 'Thời gian',
    'Sự Kiện': 'Sự Kiện',
    'Mô tả': 'Mô tả',
    'Thêm Menu Mới': 'Thêm Menu Mới',
    'Tiêu Đề Menu': 'Tiêu Đề Menu',
    'Đường Dẫn': 'Đường Dẫn',
    'Thêm giai đoạn': 'Thêm giai đoạn'
}

# The easiest way to inject is to just add it at the top of the 'vi' block in adminTranslations
# wait, what if I just use English as default? Let's just put it in `adminTranslations`
vi_injection = ""
for k, v in keys_to_add.items():
    vi_injection += f'      "{k}": "{v}",\n'

content = content.replace("vi: {\n", "vi: {\n" + vi_injection)

with open('src/App.tsx', 'w') as f:
    f.write(content)

