const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const sidebarTarget = `                </div>
              </>
            </div>
            
            <div className="mt-auto px-2">`;

const sidebarReplacement = `                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className={\`flex items-center transition-all relative group \${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } \${
                      activeTab === 'vouchers' ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }\`}
                    title={t("Mã quà tặng")}
                  >
                    {activeTab === 'vouchers' && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center">
                      <Award className={\`w-5 h-5 relative z-10 transition-colors \${activeTab === 'vouchers' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}\`} />
                    </div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Mã quà tặng")}
                      </span>
                    )}
                  </button>
                </div>
              </>
            </div>
            
            <div className="mt-auto px-2">`;

const renderTarget = `          {activeTab === 'database' && (`;

const renderReplacement = `          {activeTab === 'vouchers' && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 mt-10">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" /> {t("Sử dụng mã Voucher")}
              </h2>
              <p className="text-sm text-stone-500 mb-8 font-medium leading-relaxed">
                {t("Nhập mã voucher để nhận thêm đặc quyền (tăng giới hạn đăng bài, giao diện VIP, ...).")}
              </p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const code = e.currentTarget.voucherCode.value;
                if (!code) return;
                try {
                  const res = await fetch('/api/admin/vouchers/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${getAdminToken() || ''}\`, 'x-artist-extension': getArtistExtensionFromUrl() },
                    body: JSON.stringify({ code })
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
                  <input name="voucherCode" required placeholder="Nhập mã..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>
                <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition-colors shadow-sm">
                  {t("Áp dụng Voucher")}
                </button>
              </form>
            </div>
          )}
          {activeTab === 'database' && (`;

let codeStr = code.join('\n');
if (codeStr.includes(sidebarTarget) && codeStr.includes(renderTarget)) {
   codeStr = codeStr.replace(sidebarTarget, sidebarReplacement);
   codeStr = codeStr.replace(renderTarget, renderReplacement);
   
   // We also need to add 'vouchers' to the activeTab type definition
   const typeTarget = `const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'about'|'bio'|'menus'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'|'layout'>(`;
   const typeReplacement = `const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'about'|'bio'|'menus'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'|'layout'|'vouchers'>(`;
   if (codeStr.includes(typeTarget)) {
       codeStr = codeStr.replace(typeTarget, typeReplacement);
   }

   fs.writeFileSync('src/App.tsx', codeStr);
   console.log("Added voucher tab successfully!");
} else {
   console.log("Targets not found!");
}
