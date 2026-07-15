const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// First, remove the old one (if it exists)
const targetRemove = `{demo.linkDrive && (
              <div className="flex justify-center mt-2 mb-4 relative z-30">
                <a
                  href={demo.linkDrive}
                  target="_blank"
                  rel="noreferrer"
                  className={\`transition-all flex items-center justify-center gap-2 px-6 py-2.5 rounded-full uppercase tracking-widest text-xs md:text-sm shadow-md font-bold \${templateType === '6' ? 'bg-[#fef08a] text-black hover:scale-105' : 'bg-white text-stone-900 hover:bg-stone-100 hover:scale-105'}\`}
                  title="Tải nhạc từ Google Drive"
                >
                  <Download className="w-4 h-4" />
                  Tải nhạc
                </a>
              </div>
            )}`;

if (code.includes(targetRemove)) {
  code = code.replace(targetRemove, '');
  console.log("Removed old download button");
} else {
  console.log("Old download button not found");
}

// Next, add the download icon next to the copy button
const targetAdd = `<button
                  onClick={async () => {
                    const formattedTitle = demo.title || 'Unknown';
                    const formattedSinger = demo.singer || 'Đang cập nhật';
                    const formattedComposer = demo.composer || 'Đang cập nhật';
                    const rawLyricsText = getFormattedLyricsText(demo.lyrics).replace(/\\n{3,}/g, '\\n\\n');
                    const copyText = \`\${formattedTitle}\\nCa sĩ: \${formattedSinger}\\nSáng tác: \${formattedComposer}\\n\\nLời bài hát:\\n\${rawLyricsText}\`;
                    await copyToClipboard(copyText);
                    setToast('Đã copy lời bài hát!');
                    setTimeout(() => setToast(''), 3000);
                  }}
                  className={\`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer \${templateType === '6' ? 'hover:scale-105 text-[11px] md:text-xs font-black text-[#fef08a]' : 'hover:opacity-100 text-xs font-bold'}\`}
                  title="Copy lời bài hát"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              )}`;

const replacementAdd = `<button
                  onClick={async () => {
                    const formattedTitle = demo.title || 'Unknown';
                    const formattedSinger = demo.singer || 'Đang cập nhật';
                    const formattedComposer = demo.composer || 'Đang cập nhật';
                    const rawLyricsText = getFormattedLyricsText(demo.lyrics).replace(/\\n{3,}/g, '\\n\\n');
                    const copyText = \`\${formattedTitle}\\nCa sĩ: \${formattedSinger}\\nSáng tác: \${formattedComposer}\\n\\nLời bài hát:\\n\${rawLyricsText}\`;
                    await copyToClipboard(copyText);
                    setToast('Đã copy lời bài hát!');
                    setTimeout(() => setToast(''), 3000);
                  }}
                  className={\`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer \${templateType === '6' ? 'hover:scale-105 text-[11px] md:text-xs font-black text-[#fef08a]' : 'hover:opacity-100 text-xs font-bold'}\`}
                  title="Copy lời bài hát"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              )}
              {demo.linkDrive && (
                <a
                  href={demo.linkDrive}
                  target="_blank"
                  rel="noreferrer"
                  className={\`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer \${templateType === '6' ? 'hover:scale-105 text-[11px] md:text-xs font-black text-[#fef08a]' : 'hover:opacity-100 text-xs font-bold'}\`}
                  title="Tải nhạc từ Google Drive"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              )}`;

if (code.includes(targetAdd)) {
  code = code.replace(targetAdd, replacementAdd);
  console.log("Added download button above lyrics!");
} else {
  console.log("Target for adding download button above lyrics not found.");
}

fs.writeFileSync('src/App.tsx', code);
