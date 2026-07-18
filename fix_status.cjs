const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const targetStatus = `{artist.activated !== false ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  Hoạt Động
                                </span>
                              ) : (
                                <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg text-[10px] font-bold animate-pulse">
                                  Chờ Duyệt
                                </span>
                              )}`;
const replaceStatus = `{artist.activated !== false ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] ml-2" title="Hoạt Động"></div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse ml-2" title="Chờ Duyệt"></div>
                              )}`;

code = code.replace(targetStatus, replaceStatus);
fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
console.log("Updated status dot");
