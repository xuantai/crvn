const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{t\("Địa Chỉ"\)\}/g, '{t("Đến Từ")}');
code = code.replace(/t\("Địa Chỉ"\) \|\| "Địa Chỉ"/g, 't("Đến Từ") || "Đến Từ"');
code = code.replace(/\{t\("Công Ty"\)\}/g, '{t("Sinh Sống")}');
code = code.replace(/t\("Công Ty"\) \|\| "Công Ty"/g, 't("Sinh Sống") || "Sinh Sống"');

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced labels");
