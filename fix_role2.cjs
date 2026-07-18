const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8').split('\n');

for (let i = 1600; i < 1800; i++) {
  if (code[i] && code[i].includes('href={`/${artist.extension}`}')) {
    // Found the a tag! It's line i.
    // The td starts at i-2 usually. Let's find the <td class="p-4 text-sm">
    for (let j = i; j >= i - 5; j--) {
      if (code[j] && code[j].includes('<td className="p-4 text-sm">')) {
         code.splice(j, 0, 
           '                          <td className="p-4">',
           '                            {artist.roleId === \'vip\' && <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-yellow-500/20 uppercase tracking-wide flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>VIP</span>}',
           '                            {artist.roleId === \'pro\' && <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide w-max">PRO</span>}',
           '                            {(!artist.roleId || artist.roleId === \'free\') && <span className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase tracking-wide w-max">FREE</span>}',
           '                          </td>'
         );
         fs.writeFileSync('src/components/ACPControlPanel.tsx', code.join('\n'));
         console.log('Fixed role!');
         process.exit(0);
      }
    }
  }
}
