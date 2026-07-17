const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/function UnifiedArtistSessionFloatingWidget[\s\S]*?const AdminFloatingAddButton/g, `function UnifiedArtistSessionFloatingWidget({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [session, setSession] = useState(getActiveAdminSession());
  const [avatar, setAvatar] = useState(session.activeAvatar);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getActiveAdminSession();
      setSession(updated);
      setAvatar(updated.activeAvatar);
    };
    window.addEventListener('admin-session-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('admin-session-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const { activeExt, activeName, activeToken } = session;

  useEffect(() => {
    if (activeExt) {
      fetch('/api/data', { cache: 'no-store',
        headers: { 'x-artist-extension': activeExt }
      })
      .then(res => res.json())
      .then(data => {
        const fetchedAvatar = data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
        if (fetchedAvatar) {
          setAvatar(fetchedAvatar);
          localStorage.setItem('activeAdminAvatar', fetchedAvatar);
        }
      })
      .catch(() => {});
    }
  }, [activeExt]);

  if (!activeExt || !activeName || !activeToken) return null;

  // Do not show on acp control panel or admin pages or help guide
  if (location.pathname === '/acp' || location.pathname.includes('/admin') || location.pathname.includes('/help')) return null;

  const getAvatarUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
    return \`/uploads/\${activeExt}/\${url}\`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-6 z-[99] flex items-center gap-3 bg-stone-950/60 text-white px-4 py-2.5 rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          {avatar ? (
            <img 
              src={getAvatarUrl(avatar)} 
              className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
              alt={activeName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm animate-pulse shrink-0"
            style={{ display: avatar ? 'none' : 'flex' }}
          >
            {activeName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left flex flex-col justify-center leading-none">
            <span className="text-[10px] text-yellow-300 font-black uppercase tracking-wider leading-none mb-1 shadow-xs">Nghệ sĩ</span>
            <span className="text-xs font-black text-white uppercase tracking-wider leading-none max-w-[130px] sm:max-w-[200px] whitespace-normal break-words line-clamp-2">{activeName}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <div className="flex items-center gap-1.5">
          {session.activeActivated && (
            <a 
              href={\`/\${activeExt}/admin\`} 
              title="Quản trị"
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <Settings className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const AdminFloatingAddButton`);
fs.writeFileSync('src/App.tsx', code);
