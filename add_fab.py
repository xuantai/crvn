import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

fab_component = """
const AdminFloatingAddButton = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  // Thỉnh thoảng hiện tooltip
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000); // Tắt sau 3s
    }, 10000); // 10 giây hiện 1 lần
    return () => clearInterval(interval);
  }, []);

  // Chỉ hiện khi ở trang admin và không phải trang thêm/sửa
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.includes('/admin');
  const isFormPage = location.pathname.includes('/new') || location.pathname.includes('/edit');

  if (!isAdminPath || isFormPage) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex items-center gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          >
            {t("Đăng Bài Hát Mới")}
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-stone-900 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to={location.pathname.includes('/en') ? '/en/admin/new' : location.pathname.includes('/kr') ? '/kr/admin/new' : location.pathname.includes('/jp') ? '/jp/admin/new' : location.pathname.includes('/th') ? '/th/admin/new' : location.pathname.includes('/cn') ? '/cn/admin/new' : '/admin/new'}
      >
        <motion.div 
          className="relative flex items-center justify-center w-14 h-14 bg-stone-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-stone-800 transition-colors cursor-pointer group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Vòng tròn phập phồng (pulse) */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-stone-900/30 -z-10"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </motion.div>
      </Link>
    </div>
  );
};
"""

# Insert component before function App()
content = re.sub(r'function App\(\) \{', fab_component + '\nfunction App() {', content, 1)

# Insert <AdminFloatingAddButton /> at the end of App component inside Router or inside App wrapper
content = re.sub(r'      </Router>\n    </LanguageProvider>', r'        <AdminFloatingAddButton />\n      </Router>\n    </LanguageProvider>', content, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)

