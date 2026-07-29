const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const missingTrans = {
  en: `"Về Tôi": "About Me", "Tiểu Sử": "Biography", "Giới thiệu nghệ sĩ": "Artist Introduction", "Tên Thật": "Real Name", "Ngày Sinh": "Date of Birth", "Địa Chỉ": "Address", "Công Ty": "Company", "Danh Xưng": "Title/Role", "Email": "Email", "SĐT": "Phone Number", "Học Vấn": "Education", "Kinh nghiệm": "Experience", "Thời gian": "Time/Period", "Sự Kiện": "Event", "Thêm giai đoạn": "Add Period",`,
  ko: `"Về Tôi": "내 소개", "Tiểu Sử": "약력", "Giới thiệu nghệ sĩ": "아티스트 소개", "Tên Thật": "본명", "Ngày Sinh": "생년월일", "Địa Chỉ": "주소", "Công Ty": "회사", "Danh Xưng": "직함/역할", "Email": "이메일", "SĐT": "전화번호", "Học Vấn": "학력", "Kinh nghiệm": "경력", "Thời gian": "기간", "Sự Kiện": "이벤트", "Thêm giai đoạn": "기간 추가",`,
  ja: `"Về Tôi": "自己紹介", "Tiểu Sử": "経歴", "Giới thiệu nghệ sĩ": "アーティスト紹介", "Tên Thật": "本名", "Ngày Sinh": "生年月日", "Địa Chỉ": "住所", "Công Ty": "会社", "Danh Xưng": "役職", "Email": "Eメール", "SĐT": "電話番号", "Học Vấn": "学歴", "Kinh nghiệm": "経験", "Thời gian": "期間", "Sự Kiện": "イベント", "Thêm giai đoạn": "期間を追加",`,
  th: `"Về Tôi": "เกี่ยวกับฉัน", "Tiểu Sử": "ประวัติส่วนตัว", "Giới thiệu nghệ sĩ": "แนะนำศิลปิน", "Tên Thật": "ชื่อจริง", "Ngày Sinh": "วันเกิด", "Địa Chỉ": "ที่อยู่", "Công Ty": "บริษัท", "Danh Xưng": "ตำแหน่ง", "Email": "อีเมล", "SĐT": "เบอร์โทรศัพท์", "Học Vấn": "การศึกษา", "Kinh nghiệm": "ประสบการณ์", "Thời gian": "เวลา/ช่วงเวลา", "Sự Kiện": "เหตุการณ์", "Thêm giai đoạn": "เพิ่มช่วงเวลา",`,
  zh: `"Về Tôi": "关于我", "Tiểu Sử": "个人简介", "Giới thiệu nghệ sĩ": "艺术家介绍", "Tên Thật": "真实姓名", "Ngày Sinh": "出生日期", "Địa Chỉ": "地址", "Công Ty": "公司", "Danh Xưng": "职位/角色", "Email": "电子邮件", "SĐT": "电话号码", "Học Vấn": "教育", "Kinh nghiệm": "经验", "Thời gian": "时间/期间", "Sự Kiện": "事件", "Thêm giai đoạn": "添加时期",`
};

for (const [lang, trans] of Object.entries(missingTrans)) {
  // Regex to match lang: { only for translations and adminTranslations which have a space or newline after
  // We can just find the exact `lang: { ` or `lang: {\n` in the first 2000 lines.
  const regex = new RegExp(`^(\\s*${lang}:\\s*\\{)(?=[\\s\\S])`, 'gm');
  // Just replacing the first two occurrences should cover translations and adminTranslations
  let count = 0;
  content = content.replace(regex, (match, p1) => {
    count++;
    if (count <= 2) {
      return `${p1}\n    ${trans}\n`;
    }
    return match;
  });
}

fs.writeFileSync('src/App.tsx', content);
console.log('Dictionaries updated!');
