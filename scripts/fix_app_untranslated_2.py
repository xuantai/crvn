import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('<Plus className="w-4 h-4" /> Thêm DB mới', '<Plus className="w-4 h-4" /> {t("Thêm DB mới")}')
content = content.replace('<Plus className="w-3.5 h-3.5" /> Thêm bài hát', '<Plus className="w-3.5 h-3.5" /> {t("Thêm bài hát")}')
content = content.replace('Thêm đã chọn ({selectedNewSongIds.length})', '{t("Thêm đã chọn")} ({selectedNewSongIds.length})')
content = content.replace('<Trash2 className="w-4 h-4" /> Làm mới DB này', '<Trash2 className="w-4 h-4" /> {t("Làm mới DB này")}')
content = content.replace('Xóa toàn bộ dữ liệu', '{t("Xóa toàn bộ dữ liệu")}')
content = content.replace('Lỗi khi xóa DB', '{t("Lỗi khi xóa DB")}')
content = content.replace('Đã xóa sạch dữ liệu trong DB hiện tại. Vui lòng tải lại trang!', '{t("Đã xóa sạch dữ liệu trong DB hiện tại. Vui lòng tải lại trang!")}')

with open('src/App.tsx', 'w') as f:
    f.write(content)
