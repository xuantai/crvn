with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Translate "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)"
content = content.replace(
    'Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)',
    '{t("Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)")}'
)

# 2. Translate "Thêm thành tích"
content = content.replace(
    '<Plus className="w-4 h-4" /> Thêm thành tích',
    '<Plus className="w-4 h-4" /> {t("Thêm thành tích")}'
)

# 3. Translate "Trạng thái (Hiển thị)" -> "Hiển Thị"
content = content.replace(
    '{t("Trạng thái (Hiển thị)")}',
    '{t("Hiển Thị")}'
)

# 4. Replace button complex shadow style
old_btn_style = "bg-stone-900/80 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.3)] text-white hover:bg-stone-800/90 hover:border-white/20 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.6),0_6px_14px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out active:scale-[0.98]"
new_btn_style = "bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98]"

content = content.replace(old_btn_style, new_btn_style)

with open('src/App.tsx', 'w') as f:
    f.write(content)

