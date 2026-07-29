const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const englishTemplates = [
  'Cheerful (Warm)', 'Energetic (Vibrant)', 'Sad (Deep)', 'Relaxed (Gentle)',
  'Cute (Red, dancing)', 'Happy (Pink, falling petals)', 'School (White, falling yellow leaves)',
  'Vietnam ( Red, waving flag )', 'Rainbow', 'Hip Hop (Street)',
  'Mysterious (Black-Gold, Moon-Smoke-Rain)', 'Classic (Brown, retro)', 'Sunset (Orange-Red sunset)',
  'Ocean (Sea waves)', 'Retro 8-Bit (Game)', 'Puzzle Grid', 'Cheering (Clouds, sun)', 'Fireworks (New Year)'
];

const viTemplates = [
  'Vui vẻ (Ấm áp)', 'Căng Cực (Sôi động)', 'Buồn (Sâu lắng)', 'Thư giãn (Nhẹ nhàng)',
  'Đáng yêu (Đỏ, Nhảy múa)', 'Hạnh Phúc (Hồng, Hoa rơi)', 'Học Đường (Trắng, Lá vàng rơi)',
  'Tổ Quốc (Đỏ, Cờ phấp phới)', 'Cầu Vồng', 'Hip Hop (Đường phố)',
  'Kỳ bí (Đen vàng, Trăng khói mưa)', 'Cổ điển (Nâu, retro)', 'Hoàng hôn (Cam đỏ trời chiều)',
  'Đại Dương (Sóng biển)', 'Retro 8-Bit (Game)', 'Xếp hình Puzzle', 'Cổ vũ (Mây, mặt trời)', 'Pháo hoa (Năm mới)'
];

for (let i = 0; i < englishTemplates.length; i++) {
  code = code.split("'" + englishTemplates[i] + "'").join("'" + viTemplates[i] + "'");
  code = code.split('"' + englishTemplates[i] + '"').join('"' + viTemplates[i] + '"');
}

// Special case for the array of strings
code = code.replace(
  /'Cheerful \(Warm\)', 'Energetic \(Vibrant\)', 'Sad \(Deep\)', 'Relaxed \(Gentle\)',/g,
  "'Vui vẻ (Ấm áp)', 'Căng Cực (Sôi động)', 'Buồn (Sâu lắng)', 'Thư giãn (Nhẹ nhàng)',"
);
code = code.replace(
  /'Cute \(Red, dancing\)', 'Happy \(Pink, falling petals\)', 'School \(White, falling yellow leaves\)',/g,
  "'Đáng yêu (Đỏ, Nhảy múa)', 'Hạnh Phúc (Hồng, Hoa rơi)', 'Học Đường (Trắng, Lá vàng rơi)',"
);
code = code.replace(
  /'Vietnam \( Red, waving flag \)', 'Rainbow', 'Hip Hop \(Street\)',/g,
  "'Tổ Quốc (Đỏ, Cờ phấp phới)', 'Cầu Vồng', 'Hip Hop (Đường phố)',"
);
code = code.replace(
  /'Mysterious \(Black-Gold, Moon-Smoke-Rain\)', 'Classic \(Brown, retro\)', 'Sunset \(Orange-Red sunset\)',/g,
  "'Kỳ bí (Đen vàng, Trăng khói mưa)', 'Cổ điển (Nâu, retro)', 'Hoàng hôn (Cam đỏ trời chiều)',"
);
code = code.replace(
  /'Ocean \(Sea waves\)', 'Retro 8-Bit \(Game\)', 'Puzzle Grid', 'Cheering \(Clouds, sun\)', 'Fireworks \(New Year\)'/g,
  "'Đại Dương (Sóng biển)', 'Retro 8-Bit (Game)', 'Xếp hình Puzzle', 'Cổ vũ (Mây, mặt trời)', 'Pháo hoa (Năm mới)'"
);

fs.writeFileSync('src/App.tsx', code);
