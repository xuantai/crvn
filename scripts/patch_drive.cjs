const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const driveRegex = /\s*<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">\{t\("Link Google Drive tải nhạc"\)\}<\/label>\s*<div className="relative">\s*<FolderDown className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" \/>\s*<input \s*name="linkDrive" \s*value=\{linkDrive\} \s*onChange=\{e => setLinkDrive\(e\.target\.value\)\} \s*placeholder="https:\/\/drive\.google\.com\/file\/d\/\.\.\.\/view" \s*className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" \s*\/>\s*<\/div>\s*<p className="text-xs text-stone-500 mt-2">\{t\("Nếu nhập link, người dùng sẽ thấy icon tải nhạc \(Download\) ở trên phần lời bài hát để click tải\."\)\}<\/p>\s*<\/div>/g;

const matches = code.match(driveRegex);
if (matches && matches.length === 2) {
    code = code.replace(matches[0], '');
    code = code.replace(matches[1], '');
    
    const achievementTarget = `<AchievementEditor achievements={achievements} onChange={setAchievements} />`;
    const addBackTarget = `${achievementTarget}

                <div className="mt-6 mb-6">
                  <label className="block text-sm font-bold text-stone-700 mb-2">{t("Link Google Drive tải nhạc")}</label>
                  <div className="relative">
                    <FolderDown className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                    <input 
                      name="linkDrive" 
                      value={linkDrive} 
                      onChange={e => setLinkDrive(e.target.value)} 
                      placeholder="https://drive.google.com/file/d/.../view" 
                      className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow bg-white" 
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{t("Nếu nhập link, người dùng sẽ thấy icon tải nhạc (Download) ở trên phần lời bài hát để click tải.")}</p>
                </div>`;
                
    code = code.replaceAll(achievementTarget, addBackTarget);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Moved Drive link successfully!");
} else {
    console.log("Could not find exact matches for Drive Link, found:", matches ? matches.length : 0);
}
