const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/"Tiểu Sử": "Tiểu Sử",/g, '"Tiểu Sử": "Tiểu Sử", "Tải Nhạc": "Tải Nhạc", "Đến Từ": "Đến Từ", "Sinh Sống": "Sinh Sống",');
code = code.replace(/"Tiểu Sử": "Biography",/g, '"Tiểu Sử": "Biography", "Tải Nhạc": "Download MP3", "Đến Từ": "From", "Sinh Sống": "Lives In",');
code = code.replace(/"Tiểu Sử": "약력",/g, '"Tiểu Sử": "약력", "Tải Nhạc": "MP3 다운로드", "Đến Từ": "출신", "Sinh Sống": "거주지",');
code = code.replace(/"Tiểu Sử": "経歴",/g, '"Tiểu Sử": "経歴", "Tải Nhạc": "MP3 ダウンロード", "Đến Từ": "出身", "Sinh Sống": "居住地",');
code = code.replace(/"Tiểu Sử": "ประวัติส่วนตัว",/g, '"Tiểu Sử": "ประวัติส่วนตัว", "Tải Nhạc": "ดาวน์โหลด MP3", "Đến Từ": "จาก", "Sinh Sống": "อาศัยอยู่ที่",');
code = code.replace(/"Tiểu Sử": "个人简介",/g, '"Tiểu Sử": "个人简介", "Tải Nhạc": "下载 MP3", "Đến Từ": "来自", "Sinh Sống": "居住于",');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed translations");
