const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  '<input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />',
  '<input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />'
);
code = code.replace(
  '<input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />',
  '<input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />'
);
fs.writeFileSync('src/App.tsx', code);
