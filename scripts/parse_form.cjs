const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '<form onSubmit={handleProfileSave} className="space-y-6">';
const endMarker = '          {activeTab === \'socials\' && (';

const startIndex = code.indexOf(startMarker) + startMarker.length;
const endIndex = code.indexOf(endMarker);

let formContent = code.substring(startIndex, endIndex);

// We need to extract each component.

// 1. Tiêu đề Website
const pageTitleStr = `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website</label>
                  <input name="pageTitle" defaultValue={data.pageTitle} placeholder="Để trống sẽ dùng mặc định: Thiên Đường Demo của [Tên nghệ sĩ]" className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>`;

// 2. Tên nghệ sĩ
const artistNameStr = `                <div>
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
                </div>`;

// 3. Username
const usernameStr = `                <div>
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
                </div>`;

// 4. Giới thiệu ngắn
const artistBioStr = `                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn</label>
                  <input name="artistBio" defaultValue={data.artistBio} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>`;

// 5. Tự động chuyển tab + Ẩn khỏi danh sách
const checkboxesStr = `                <div className="flex flex-col gap-3">
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
                </div>`;

// 6. Tên tùy chỉnh các Tab Danh Sách Nhạc
const tabNamesStr = `                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
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
                </div>`;

const getBlock = (regex) => {
    const match = formContent.match(regex);
    return match ? match[0] : '';
};

const avatarStr = getBlock(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ<\/label>[\s\S]*?Dùng đại diện cho kho nhạc, nên chọn ảnh vuông\.<\/p>\s*<\/div>/);
const bgImageStr = getBlock(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Ảnh nền trang chủ[\s\S]*?<\/div>\s*<\/div>/);
const gridColsStr = getBlock(/<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
const ytSpotifyEtcStr = getBlock(/<hr className="border-stone-200" \/>\s*<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube[\s\S]*?<div className="flex items-center justify-between mb-3">/);
// Wait, ytSpotifyEtc is everything until the custom domain setup.
// We can just grab the rest of the file after the gridColsStr!

const idx = formContent.indexOf('<hr className="border-stone-200" />\n                <div>\n                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube (Nhạc đã phát hành)</label>');

let theRest = '';
if (idx !== -1) {
    theRest = formContent.substring(idx);
}

// Ensure no duplicated fields in theRest (like if my previous script messed up)
// Just replace them with empty if they exist.
const stripOld = (str, block) => {
   if (block) {
      // simpler string replace by matching prefix to avoid regex escaping hell
      return str.replace(block, '');
   }
   return str;
};

// Instead of all that, let's just assemble what we want!

const topFields = [
    artistBioStr,
    artistNameStr,
    usernameStr,
    avatarStr,
    bgImageStr,
    gridColsStr, // This contains Favicon and Thumbnail
    pageTitleStr
].join('\\n');

const bottomFields = [
    checkboxesStr,
    tabNamesStr
].join('\\n');

// theRest contains YouTube, Spotify, Mật khẩu chung, domain, and submit buttons.
// Let's strip out any duplicates of our top/bottom fields from theRest just in case.
const fieldsToStrip = [
    pageTitleStr, artistNameStr, usernameStr, artistBioStr, checkboxesStr, tabNamesStr, avatarStr, bgImageStr, gridColsStr
];
// Wait, theRest only starts from <hr> Link Playlist YouTube, so it shouldn't have top fields.
// Unless they were inserted there by my previous script.
// Let's look at theRest and just find the submit button.
let submitStrIdx = theRest.indexOf('<div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">');
let beforeSubmit = theRest.substring(0, submitStrIdx);
let submitBlock = theRest.substring(submitStrIdx);

// Remove any accidentally injected blocks from beforeSubmit.
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn<\/label>[\s\S]*?<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Username \(Phần mở rộng\)<\/label>[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website<\/label>[\s\S]*?<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div className="flex flex-col gap-3">[\s\S]*?<\/div>\s*<\/div>/g, '');
beforeSubmit = beforeSubmit.replace(/<div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

const finalFormContent = '\\n' + topFields + '\\n' + beforeSubmit + '\\n' + bottomFields + '\\n' + submitBlock;

const newCode = code.substring(0, startIndex) + finalFormContent + code.substring(endIndex);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Successfully parsed and replaced");
