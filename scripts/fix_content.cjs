const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const renderTarget = `          {activeTab === 'database' && (`;

const renderReplacement = `          {activeTab === 'vouchers' && (
            <motion.div key="vouchers" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}>
              <div className="max-w-xl mx-auto bg-stone-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 mt-10">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-500" /> {t("Sử dụng mã Voucher")}
                </h2>
                <p className="text-sm text-stone-500 mb-8 font-medium leading-relaxed">
                  {t("Nhập mã voucher để nhận thêm đặc quyền (tăng giới hạn đăng bài, giao diện VIP, ...).")}
                </p>
                
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  const codeVal = e.currentTarget.voucherCode.value;
                  if (!codeVal) return;
                  try {
                    const res = await fetch('/api/admin/vouchers/redeem', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${getAdminToken() || ''}\`, 'x-artist-extension': getArtistExtensionFromUrl() },
                      body: JSON.stringify({ code: codeVal })
                    });
                    const json = await res.json();
                    if (res.ok) {
                      setToast(json.message || t("Áp dụng mã thành công!"));
                      setTimeout(() => window.location.reload(), 2000);
                    } else {
                      alert(json.error || 'Lỗi');
                    }
                  } catch(err) {
                    alert('Lỗi mạng');
                  }
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mã Voucher")}</label>
                    <input name="voucherCode" required placeholder="Nhập mã..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                  </div>
                  <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition-colors shadow-sm text-center">
                    {t("Áp dụng Voucher")}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
          {activeTab === 'database' && (`;

if (code.includes(renderTarget)) {
   code = code.replace(renderTarget, renderReplacement);
   
   // We also need to add 'vouchers' to the activeTab type definition
   const typeTarget = `const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'about'|'bio'|'menus'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'|'layout'>(`;
   const typeReplacement = `const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'about'|'bio'|'menus'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'|'layout'|'vouchers'>(`;
   if (code.includes(typeTarget)) {
       code = code.replace(typeTarget, typeReplacement);
   }

   fs.writeFileSync('src/App.tsx', code);
   console.log("Added voucher content successfully!");
} else {
   console.log("Targets not found!");
}
