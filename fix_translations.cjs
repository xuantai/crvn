const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexVi1 = /"Chọn bìa đĩa": "Chọn bìa đĩa",/g;
const regexVi2 = /"Chọn file nhạc": "Chọn file nhạc",/g;
const regexVi3 = /"Chọn logo": "Chọn logo",/g;
const regexVi4 = /"Chọn ảnh": "Chọn ảnh",/g;
const regexVi5 = /"Chọn ảnh nền": "Chọn ảnh nền",/g;

code = code.replace(regexVi1, '"Chọn bìa đĩa": "Chọn File",');
code = code.replace(regexVi2, '"Chọn file nhạc": "Chọn File",');
code = code.replace(regexVi3, '"Chọn logo": "Chọn File",');
code = code.replace(regexVi4, '"Chọn ảnh": "Chọn File",');
code = code.replace(regexVi5, '"Chọn ảnh nền": "Chọn File",');

const regexEn1 = /"Chọn bìa đĩa": "Select Artwork",/g;
const regexEn2 = /"Chọn file nhạc": "Select Music File",/g;
const regexEn3 = /"Chọn logo": "Select Logo",/g;
const regexEn4 = /"Chọn ảnh": "Select Image",/g;
const regexEn5 = /"Chọn ảnh nền": "Select Background Image",/g;

code = code.replace(regexEn1, '"Chọn bìa đĩa": "Select File",');
code = code.replace(regexEn2, '"Chọn file nhạc": "Select File",');
code = code.replace(regexEn3, '"Chọn logo": "Select File",');
code = code.replace(regexEn4, '"Chọn ảnh": "Select File",');
code = code.replace(regexEn5, '"Chọn ảnh nền": "Select File",');

const regexNhb = /<Copy className="w-4 h-4" \/> Nhân bản/g;
code = code.replace(regexNhb, '<Copy className="w-4 h-4" /> {t("Nhân bản")}');

const targetOverflow = `className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group overflow-hidden items-end"`;
const replaceOverflow = `className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group items-end"`;
code = code.replace(targetOverflow, replaceOverflow);

// and also check if there are other occurrences
code = code.replaceAll(targetOverflow, replaceOverflow);

// The text under the button: "Drag and drop the album cover dir..."
const regexText1 = /<p className="text-\[10px\] text-stone-400 mt-1\.5">Drag and drop/g;
// I'll just find them manually

fs.writeFileSync('src/App.tsx', code);
console.log("Updated translations and overflow");
