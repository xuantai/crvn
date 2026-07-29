const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf-8');

if (!code.includes('GripVertical')) {
  code = code.replace(
    `import { Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X, LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home, Upload, MessageSquare, Send, AlertTriangle, Disc3, Bell, ChevronLeft, Mail, Palette } from 'lucide-react';`,
    `import { Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X, LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home, Upload, MessageSquare, Send, AlertTriangle, Disc3, Bell, ChevronLeft, Mail, Palette, LayoutTemplate, GripVertical, Type } from 'lucide-react';`
  );
}

const target2 = `              {/* Interface settings */}`;
const layoutUI = `              {/* Layout settings */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md mb-8">
                <div className="mb-6">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <LayoutTemplate className="w-5.5 h-5.5 text-teal-400" />
                    <span>Bố cục nghệ sĩ mặc định</span>
                  </h2>
                  <p className="text-neutral-400 text-xs mt-1">
                    Kéo thả các phần dưới đây để sắp xếp thứ tự hiển thị mặc định của trang chủ nghệ sĩ. (Sẽ áp dụng cho các nghệ sĩ chưa tự tùy chỉnh bố cục riêng).
                  </p>
                </div>
                
                <div className="space-y-3">
                  {globalLayoutSections.map((sec, i) => (
                    <div 
                      key={sec} 
                      draggable 
                      onDragStart={(e) => handleDragStartLayout(e, i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropLayout(e, i)}
                      className="flex items-center gap-4 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm select-none"
                    >
                      <GripVertical className="text-neutral-500 w-5 h-5 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-neutral-200 text-sm">
                          {getLayoutSectionName(sec)}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-neutral-400">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>\n\n`;

if (code.includes(target2) && !code.includes('Bố cục nghệ sĩ mặc định')) {
  code = code.replace(target2, layoutUI + target2);
}

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
