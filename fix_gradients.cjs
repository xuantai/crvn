const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target19 = `bg-gradient-to-br from-[#402314] via-[#2F1A0F] to-[#1C0F08] text-[#E5B582] font-sans`;
const replace19 = `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C4827] via-[#432311] to-[#1F0E05] text-[#E5B582] font-sans`;

const target20 = `bg-gradient-to-br from-[#FFD6D6] via-[#FFC0CB] to-[#FFA07A] text-[#D8436B] font-sans`;
const replace20 = `bg-gradient-to-br from-[#FAD2A8] via-[#F9A8D4] to-[#C4DAFA] text-[#D8436B] font-sans`;

code = code.replace(target19, replace19);
code = code.replace(target20, replace20);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated background gradients");
