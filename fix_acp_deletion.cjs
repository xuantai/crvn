const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const missingBlock = `
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Login to System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            ADMIN PANEL
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setActiveTab('artists')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'artists'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Nghệ Sĩ & Thành Viên</span>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Layout className="w-4.5 h-4.5" />
            <span>Trang Chủ & SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={\`flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <div className="flex items-center gap-3.5">
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Hỗ trợ (Tickets)</span>
            </div>
            {tickets.filter(t => t.status !== 'resolved').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== 'resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Palette className="w-4.5 h-4.5" />
            <span>Tên Giao Diện</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>FAQ (Hỏi Đáp)</span>
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'keywords'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Lock className="w-4.5 h-4.5" />
            <span>Từ Khoá Cấm</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={\`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer \${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }\`}
          >
            <Edit2 className="w-4.5 h-4.5" />
            <span>Quản Lý Duyệt Bài</span>
          </button>
`;

code = code.replace(
  /}loginErr\s*\}\s*<\/p>\s*\)\}\s*<button\s*onClick=\{\(\) => setActiveTab\('roles'\)\}/,
  `}loginErr}
              </p>
            )}
${missingBlock}
            <button
              onClick={() => setActiveTab('roles')}`
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
