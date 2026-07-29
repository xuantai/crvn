import sys

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove from profile tab
target1 = """                </div>
                <hr className="border-stone-200" />
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu chung cho các Demo")}</label>
                  <input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" placeholder={t("Để trống nếu không muốn dùng mật khẩu chung")} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" />
                  <p className="text-sm text-stone-500 mt-2">{t("Tất cả các link ở trang chủ nếu chưa đặt mật khẩu riêng thì sẽ được bảo vệ bởi mật khẩu chung này.")}</p>
                </div>
                {/* Cấu hình tên miền riêng (Custom Domain) */}"""

repl1 = """                </div>
                {/* Cấu hình tên miền riêng (Custom Domain) */}"""

target2 = """                    </button>
                    <button type="button" onClick={async () => {
                      if (!confirm(t("Bạn có chắc muốn làm mới toàn bộ Secret Link? Các Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu."))) return;
                      const res = await fetch('/api/admin/reset-secret-links', {
                        method: 'POST',
                        headers: {
                          'x-artist-extension': getArtistExtensionFromUrl(),
                          'Authorization': `Bearer ${getAdminToken() || ''}`
                        }
                      });
                      if (res.ok) {
                        setToast(t("Đã reset toàn bộ Secret Link thành công!"));
                        setTimeout(() => setToast(''), 3000);
                        loadData();
                      }
                    }} className="text-red-500 hover:text-red-600 font-bold sm:ml-auto px-4 py-2 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl text-xs transition-all duration-200 cursor-pointer">{t("Reset Toàn Bộ Secret Link")}</button>
                  </div>"""

repl2 = """                    </button>
                  </div>"""

target3 = """          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-2xl space-y-12 pb-10">
              <div>"""

repl3 = """          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-2xl space-y-12 pb-10">
              <div>
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    {t("Mật khẩu chung và Bảo mật Demo")}
                  </h2>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu chung cho các Demo")}</label>
                    <input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" placeholder={t("Để trống nếu không muốn dùng mật khẩu chung")} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" />
                    <p className="text-sm text-stone-500 mt-2">{t("Tất cả các link ở trang chủ nếu chưa đặt mật khẩu riêng thì sẽ được bảo vệ bởi mật khẩu chung này.")}</p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 mt-6 flex flex-wrap gap-4 items-center">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">{t("Lưu thay đổi")}</button>
                    <button type="button" onClick={async () => {
                      if (!confirm(t("Bạn có chắc muốn làm mới toàn bộ Secret Link? Các Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu."))) return;
                      const res = await fetch('/api/admin/reset-secret-links', {
                        method: 'POST',
                        headers: {
                          'x-artist-extension': getArtistExtensionFromUrl(),
                          'Authorization': `Bearer ${getAdminToken() || ''}`
                        }
                      });
                      if (res.ok) {
                        setToast(t("Đã reset toàn bộ Secret Link thành công!"));
                        setTimeout(() => setToast(''), 3000);
                        loadData();
                      }
                    }} className="text-red-500 hover:text-red-600 font-bold px-4 py-2 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl text-xs transition-all duration-200 cursor-pointer">{t("Reset Toàn Bộ Secret Link")}</button>
                  </div>
                </form>
              </div>
              <div className="h-px bg-stone-100 w-full"></div>
              <div>"""

if target1 in content and target2 in content and target3 in content:
    content = content.replace(target1, repl1)
    content = content.replace(target2, repl2)
    content = content.replace(target3, repl3)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced all targets successfully.")
else:
    print("Could not find targets")
    if target1 not in content: print("Target 1 missing")
    if target2 not in content: print("Target 2 missing")
    if target3 not in content: print("Target 3 missing")
