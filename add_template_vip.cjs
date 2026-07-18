const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  'const [templateNames, setTemplateNames] = useState<Record<string, string>>({});',
  'const [templateNames, setTemplateNames] = useState<Record<string, string>>({});\n  const [templateVip, setTemplateVip] = useState<Record<string, boolean>>({});'
);

code = code.replace(
  'setTemplateNames(data.templateNames || {});',
  'setTemplateNames(data.templateNames || {});\n        setTemplateVip(data.templateVip || {});'
);

code = code.replace(
  'demoSongInfo: { title: demoSongTitle, artist: demoSongArtist, lyrics: demoSongLyrics },\n          templateNames',
  'demoSongInfo: { title: demoSongTitle, artist: demoSongArtist, lyrics: demoSongLyrics },\n          templateNames,\n          templateVip'
);

const vipCheckHtml = `
                      <label className="block text-xs font-bold text-neutral-400 mb-2 flex items-center justify-between">
                        <span>Giao diện #{id} - {templateNames[id] || DEFAULT_TEMPLATE_NAMES[id]}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!templateVip[id]}
                            onChange={(e) => setTemplateVip({...templateVip, [id]: e.target.checked})}
                            className="w-3 h-3 text-yellow-500 rounded focus:ring-yellow-500 bg-neutral-900 border-white/10"
                          />
                          <span className="text-[10px] text-yellow-500 font-bold">VIP</span>
                        </label>
                      </label>
`;

code = code.replace(
  '<label className="block text-xs font-bold text-neutral-400 mb-2">Giao diện #{id} - {templateNames[id] || DEFAULT_TEMPLATE_NAMES[id]}</label>',
  vipCheckHtml
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
