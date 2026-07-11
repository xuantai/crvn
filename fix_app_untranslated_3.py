import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('Chào Mừng Thành Viên!', '{t("Chào Mừng Thành Viên!")}')
content = content.replace('Bạn đã đăng nhập thành công dưới quyền <strong>Thành viên VIP</strong>. Giờ đây bạn có thể thưởng thức toàn bộ album, danh sách phát và các bài hát đệm demo bảo mật trên hệ thống của <strong>{artistName}</strong> mà không cần nhập passcode riêng biệt.', '{t("Bạn đã đăng nhập thành công dưới quyền")} <strong>{t("Thành viên VIP")}</strong>. {t("Giờ đây bạn có thể thưởng thức toàn bộ album, danh sách phát và các bài hát đệm demo bảo mật trên hệ thống của")} <strong>{artistName}</strong> {t("mà không cần nhập passcode riêng biệt.")}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
