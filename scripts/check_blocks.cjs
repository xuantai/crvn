const fs = require('fs');

const b = {
  pageTitleStr: `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website</label>
                  <input name="pageTitle" defaultValue={data.pageTitle} placeholder="Để trống sẽ dùng mặc định: Thiên Đường Demo của [Tên nghệ sĩ]" className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>`,
  artistNameStr: `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ</label>
                  {data.pendingNameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingNameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('name')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  )}
                </div>`,
  usernameStr: `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Username (Phần mở rộng)</label>
                  {data.pendingUsernameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingUsernameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('username')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
                  )}
                  <p className="text-xs text-stone-500 mt-1.5">
                    Của bạn đang là <strong className="text-stone-700">{data.username}.chorus.vn</strong>
                  </p>
                </div>`,
  artistBioStr: `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn</label>
                  <input name="artistBio" defaultValue={data.artistBio} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>`,
  checkboxesStr: `                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="autoSwitchTabs" 
                      name="autoSwitchTabs" 
                      defaultChecked={data.autoSwitchTabs} 
                      value="true" 
                      className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer" 
                    />
                    <label htmlFor="autoSwitchTabs" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                      Tự động chuyển tab ở trang chủ (Music / Demo / Playlist)
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="hideFromHomepage" 
                      name="hideFromHomepage" 
                      defaultChecked={data.hideFromHomepage} 
                      value="true" 
                      className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer" 
                    />
                    <label htmlFor="hideFromHomepage" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                      Ẩn khỏi danh sách nghệ sĩ trên trang chủ Chorus.vn
                    </label>
                  </div>
                </div>`,
  tabNamesStr: `                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-stone-800 text-sm">Tên tùy chỉnh các Tab Danh Sách Nhạc</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 1 (Nhạc phát hành)</label>
                      <input name="tab1Name" defaultValue={data.tab1Name} placeholder="Mặc định: Ra Rồi" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 2 (Nhạc đề mô)</label>
                      <input name="tab2Name" defaultValue={data.tab2Name} placeholder="Mặc định: Đề Mô" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 3 (Album/EP)</label>
                      <input name="tab3Name" defaultValue={data.tab3Name} placeholder="Mặc định: Album/EP" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                  </div>
                </div>`
};

for (const [k, v] of Object.entries(b)) {
  const op = (v.match(/<div/g)||[]).length;
  const cl = (v.match(/<\/div>/g)||[]).length;
  console.log(k, "Op:", op, "Cl:", cl);
}
