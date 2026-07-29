import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add to EN
en_add = """    "Hiển Thị": "Visibility",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "Outstanding Achievements (Used to create highlights on Homepage)",
    "Thêm thành tích": "Add Achievement","""
content = re.sub(r'const en = {', r'const en = {\n' + en_add, content, 1)

# Add to KR
kr_add = """    "Hiển Thị": "표시",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "주요 성과 (홈페이지 강조용)",
    "Thêm thành tích": "성과 추가","""
content = re.sub(r'const kr = {', r'const kr = {\n' + kr_add, content, 1)

# Add to JP
jp_add = """    "Hiển Thị": "表示",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "主な実績（ホームページでのハイライト用）",
    "Thêm thành tích": "実績を追加","""
content = re.sub(r'const jp = {', r'const jp = {\n' + jp_add, content, 1)

# Add to TH
th_add = """    "Hiển Thị": "การมองเห็น",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "ความสำเร็จที่โดดเด่น (ใช้เพื่อเน้นบนหน้าแรก)",
    "Thêm thành tích": "เพิ่มความสำเร็จ","""
content = re.sub(r'const th = {', r'const th = {\n' + th_add, content, 1)

# Add to CN
cn_add = """    "Hiển Thị": "可见性",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "杰出成就（用于在主页上突出显示）",
    "Thêm thành tích": "添加成就","""
content = re.sub(r'const cn = {', r'const cn = {\n' + cn_add, content, 1)

# Add to VN
vn_add = """    "Hiển Thị": "Hiển Thị",
    "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)": "Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)",
    "Thêm thành tích": "Thêm thành tích","""
content = re.sub(r'const vn = {', r'const vn = {\n' + vn_add, content, 1)


with open('src/App.tsx', 'w') as f:
    f.write(content)

