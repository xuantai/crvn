const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `                <input name="slug" value={slug} onChange={e => {setSlug(e.target.value); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent" />`;
const replacement1 = `                <input name="slug" value={slug} onChange={e => {setSlug(generateSlug(e.target.value)); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent" />`;

if (code.includes(target1)) {
  code = code.replaceAll(target1, replacement1);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced slug input logic!");
} else {
  console.log("Target slug input string not found in src/App.tsx!");
}
