const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf-8');

const target = `              <form onSubmit={handleSaveLandingConfig} className="space-y-6">`;
const layoutUI = `              {/* Layout settings */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-4 sm:p-6 mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-black flex items-center gap-2 text-teal-400">
                    <LayoutTemplate className="w-5 h-5" />
                    <span>Bố cục nghệ sĩ mặc định</span>
                  </h2>
                  <p className="text-neutral-400 text-xs mt-1">
                    Kéo thả các phần dưới đây để sắp xếp thứ tự hiển thị mặc định của trang chủ nghệ sĩ. (Áp dụng cho nghệ sĩ chưa tự tùy chỉnh).
                  </p>
                </div>
                
                <div className="space-y-2">
                  {globalLayoutSections.map((sec, i) => (
                    <div 
                      key={sec} 
                      draggable 
                      onDragStart={(e) => handleDragStartLayout(e, i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropLayout(e, i)}
                      className="flex items-center gap-4 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm select-none"
                    >
                      <GripVertical className="text-neutral-500 w-4 h-4 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-neutral-200 text-xs">
                          {getLayoutSectionName(sec)}
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>\n\n`;

if (code.includes(target) && !code.includes('Bố cục nghệ sĩ mặc định')) {
  code = code.replace(target, layoutUI + target);
  fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
  console.log("Patched global layout UI");
}
