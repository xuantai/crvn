const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  '<input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" placeholder="Để trống nếu không muốn dùng mật khẩu chung" />',
  '<input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" placeholder="Để trống nếu không muốn dùng mật khẩu chung" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" />'
);
fs.writeFileSync('src/App.tsx', code);
