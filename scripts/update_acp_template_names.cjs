const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const oldNames = `const DEFAULT_TEMPLATE_NAMES: Record<string, string> = {
  "1": "Cheerful (Warm)",
  "2": "Energetic (Vibrant)",
  "3": "Sad (Deep)",
  "4": "Relaxed (Gentle)",
  "5": "Cute (Red, dancing)",
  "6": "Happy (Pink, falling petals)",
  "7": "School (White, falling yellow leaves)",
  "8": "Vietnam ( Red, waving flag )",
  "9": "Rainbow",
  "10": "Hip Hop (Street)",
  "11": "Mysterious (Black-Gold, Moon-Smoke-Rain)",
  "12": "Classic (Brown, retro)",
  "13": "Indie (Warm, vintage)",
  "14": "Party (Neon, disco)",
  "15": "Acoustic (Wood, natural)",
  "16": "Lo-Fi (Purple, chill)",
  "17": "Pop (Bright, modern)",
  "18": "Rock (Dark, intense)"
};`;

const newNames = `const DEFAULT_TEMPLATE_NAMES: Record<string, string> = {
  '1': 'Vui vẻ (Ấm áp)',
  '2': 'Căng Cực (Sôi động)',
  '3': 'Buồn (Sâu lắng)',
  '4': 'Thư giãn (Nhẹ nhàng)',
  '5': 'Đáng yêu (Đỏ, Nhảy múa)',
  '6': 'Hạnh Phúc (Hồng, Hoa rơi)',
  '7': 'Học Đường (Trắng, Lá vàng rơi)',
  '8': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
  '9': 'Cầu Vồng',
  '10': 'Hip Hop (Đường phố)',
  '11': 'Kỳ bí (Đen vàng, Trăng khói mưa)',
  '12': 'Cổ điển (Nâu, retro)',
  '13': 'Hoàng hôn (Cam đỏ trời chiều)',
  '14': 'Đại Dương (Sóng biển)',
  '15': 'Retro 8-Bit (Game)',
  '16': 'Xếp hình Puzzle',
  '17': 'Cổ vũ (Mây, mặt trời)',
  '18': 'Pháo hoa (Năm mới)'
};`;

code = code.replace(oldNames, newNames);
fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
