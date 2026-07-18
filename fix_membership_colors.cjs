const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `className=\`border p-5 rounded-2xl flex flex-col justify-between transition-all relative \${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/25'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                      }\`
                    >
                      {isActive && (
                        <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {t("Bạn đang ở gói này")}
                        </span>
                      )}
                      
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-base mb-1">{role.name}</h4>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-xl font-black text-stone-900">
                            {role.price ? \`\${parseInt(role.price).toLocaleString('vi-VN')} ₫\` : '0 ₫'}
                          </span>
                          <span className="text-xs text-stone-500">/ tháng</span>
                        </div>
                        <button 
                          type="button" 
                          className={\`w-full py-2.5 rounded-xl font-bold text-xs mb-4 transition-all \${isActive ? 'bg-indigo-600 text-white shadow-md cursor-default' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer'}\`}`;

const replace = `className={\`border p-5 rounded-2xl flex flex-col justify-between transition-all relative \${
                        role.id === 'vip' ? (isActive ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100/50 ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50/50') :
                        role.id === 'pro' ? (isActive ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30' : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50') :
                        isActive ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/25' : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                      }\`}
                    >
                      {isActive && (
                        <span className={\`absolute -top-2.5 right-4 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm \${
                          role.id === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse' :
                          role.id === 'pro' ? 'bg-emerald-500' :
                          'bg-indigo-600'
                        }\`}>
                          {t("Bạn đang ở gói này")}
                        </span>
                      )}
                      
                      <div className="relative z-10">
                        <h4 className={\`font-extrabold text-base mb-1 \${role.id === 'vip' ? 'text-amber-700 drop-shadow-sm' : 'text-stone-900'}\`}>{role.name}</h4>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className={\`text-xl font-black \${role.id === 'vip' ? 'text-amber-900' : 'text-stone-900'}\`}>
                            {role.price ? \`\${parseInt(role.price).toLocaleString('vi-VN')} ₫\` : '0 ₫'}
                          </span>
                          <span className={\`text-xs \${role.id === 'vip' ? 'text-amber-700/70' : 'text-stone-500'}\`}>/ tháng</span>
                        </div>
                        <button 
                          type="button" 
                          className={\`w-full py-2.5 rounded-xl font-bold text-xs mb-4 transition-all \${
                            isActive 
                              ? (role.id === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md cursor-default' :
                                 role.id === 'pro' ? 'bg-emerald-600 text-white shadow-md cursor-default' :
                                 'bg-indigo-600 text-white shadow-md cursor-default') 
                              : (role.id === 'vip' ? 'bg-yellow-100 text-amber-700 hover:bg-yellow-200 hover:shadow-md cursor-pointer' :
                                 'bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer')
                          }\`}`;
                          
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated membership modal colors");
