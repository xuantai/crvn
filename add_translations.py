import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# For vi
content = content.replace('"Sau": "Sau" }', '"Sau": "Sau", pPartner: "Đối tác:", pAutoNext: "Sẽ tự động chuyển bài nếu không nhập mật khẩu", vRef: "Video Tham Khảo", nArtist: "Nghệ sĩ" }')

# For en
content = content.replace('"Sau": "Next" }', '"Sau": "Next", pPartner: "Partner:", pAutoNext: "Will auto skip if password not entered", vRef: "Reference Video", nArtist: "Artist" }')

# For ko
content = content.replace('"Sau": "다음" }', '"Sau": "다음", pPartner: "파트너:", pAutoNext: "비밀번호 미입력 시 자동 다음 곡", vRef: "참조 비디오", nArtist: "아티스트" }')

# For ja
content = content.replace('"Sau": "次へ" }', '"Sau": "次へ", pPartner: "パートナー:", pAutoNext: "パスワード未入力で自動スキップ", vRef: "参考動画", nArtist: "アーティスト" }')

# For th
content = content.replace('"Sau": "ถัดไป" }', '"Sau": "ถัดไป", pPartner: "พาร์ทเนอร์:", pAutoNext: "จะข้ามอัตโนมัติหากไม่ใส่รหัส", vRef: "วิดีโออ้างอิง", nArtist: "ศิลปิน" }')

# For zh
content = content.replace('"Sau": "下一步" }', '"Sau": "下一步", pPartner: "合作伙伴:", pAutoNext: "未输入密码将自动跳过", vRef: "参考视频", nArtist: "艺术家" }')

with open('src/App.tsx', 'w') as f:
    f.write(content)
