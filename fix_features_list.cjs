const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<ul className="space-y-2 text-xs text-stone-600">
                          {(Array.isArray(role.features) ? role.features : (role.features || '').split('\\n').filter(Boolean)).map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>`;

const replace = `<ul className={\`space-y-2 text-xs \${role.id === 'vip' ? 'text-amber-900/80 font-medium' : 'text-stone-600'}\`}>
                          {(Array.isArray(role.features) ? role.features : (role.features || '').split('\\n').filter(Boolean)).map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className={\`w-3.5 h-3.5 shrink-0 mt-0.5 \${role.id === 'vip' ? 'text-amber-500' : 'text-emerald-500'}\`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>`;
                        
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated features list");
