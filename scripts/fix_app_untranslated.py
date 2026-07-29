import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace >Vui lòng nhập thông tin đăng nhập quản trị< with >{t("Vui lòng nhập thông tin đăng nhập quản trị")}<
content = content.replace('>Vui lòng nhập thông tin đăng nhập quản trị<', '>{t("Vui lòng nhập thông tin đăng nhập quản trị")}<')
content = content.replace('>Khu Vực Thành Viên<', '>{t("Khu Vực Thành Viên")}<')
content = content.replace('>Playlist được bảo vệ<', '>{t("Playlist được bảo vệ")}<')
content = content.replace('>Hoặc sử dụng Secret Link nếu có.<', '>{t("Hoặc sử dụng Secret Link nếu có.")}<')
content = content.replace('>Giao diện #{config.id}<', '>{t("Giao diện")} #{config.id}<')
content = content.replace('>Đang tải...<', '>{t("Đang tải...")}<')
content = content.replace(">{editingConfigId === 'new' ? 'Thêm cấu hình mới' : 'Chỉnh sửa cấu hình'}<", ">{editingConfigId === 'new' ? t('Thêm cấu hình mới') : t('Chỉnh sửa cấu hình')}<")
content = content.replace('>Tên gợi nhớ (VD: DB cũ, Mặc định...)<', '>{t("Tên gợi nhớ (VD: DB cũ, Mặc định...)")}<')
content = content.replace('>Firestore Database ID (mặc định là default)<', '>{t("Firestore Database ID (mặc định là default)")}<')
content = content.replace('>Quản Lý Cơ Sở Dữ Liệu<', '>{t("Quản Lý Cơ Sở Dữ Liệu")}<')
content = content.replace('>Chuyển đổi giữa các Firebase config (DB mới / DB cũ) an toàn.<', '>{t("Chuyển đổi giữa các Firebase config (DB mới / DB cũ) an toàn.")}<')
content = content.replace('>Đang dùng<', '>{t("Đang dùng")}<')
content = content.replace(">{demo.password || `Mật khẩu chung: ${data?.globalPassword}`}<", ">{demo.password || `${t('Mật khẩu chung')}: ${data?.globalPassword}`}<")
content = content.replace(">Đối Tác: {demo.brandName || '---'}<", ">{t('Đối Tác')}: {demo.brandName || '---'}<")
content = content.replace(">{songCount} bài nhạc<", ">{songCount} {t('bài nhạc')}<")
content = content.replace(">{albumCount} album/ep<", ">{albumCount} {t('album/ep')}<")
content = content.replace(">Các mục trong thùng rác ({allTrashed.length})<", ">{t('Các mục trong thùng rác')} ({allTrashed.length})<")

with open('src/App.tsx', 'w') as f:
    f.write(content)
