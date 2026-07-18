const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const target = `                          </td>

                          <td className="p-4 text-sm">
                            <a 
                              href={\`/\${artist.extension}\`}`;

const replacement = `                          </td>

                          <td className="p-4">
                            {artist.role === 'vip' && <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-yellow-500/20 uppercase tracking-wide flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>VIP</span>}
                            {artist.role === 'pro' && <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide w-max">PRO</span>}
                            {(!artist.role || artist.role === 'free') && <span className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase tracking-wide w-max">FREE</span>}
                          </td>

                          <td className="p-4 text-sm">
                            <a 
                              href={\`/\${artist.extension}\`}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
    console.log("Replaced Role successfully!");
} else {
    console.log("Target not found!");
}
