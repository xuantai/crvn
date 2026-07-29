const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `"Địa Chỉ": "Địa Chỉ",
      "Công Ty": "Công Ty",`;
const replace = `"Địa Chỉ": "Đến Từ",
      "Công Ty": "Sinh Sống",`;
      
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated translations");
