const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

function buildUploadUI(title, description, previewUrlVar, progressVar, id, name, setPreviewFn, setProgressFn) {
  return `
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">${title}</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const url = await uploadWithProgress(file, ${setProgressFn});
                                ${setPreviewFn}(url);
                            } catch (err) {
                                alert('Lỗi upload');
                                ${setProgressFn}(0);
                            }
                        }
                    }}
                  >
                    {${previewUrlVar} ? (
                      <img src={getPreviewUrl(${previewUrlVar})} className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-stone-200 bg-stone-100/50 flex items-center justify-center text-stone-400 shadow-inner shrink-0">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={\`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm \${${progressVar} === 100 || ${previewUrlVar} ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}\`} onClick={() => document.getElementById('${id}')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{${progressVar} > 0 && ${progressVar} < 100 ? \`Đang tải \${${progressVar}}%\` : (${previewUrlVar} ? 'Thay đổi' : 'Chọn ảnh')}</span>
                        </button>
                        {${progressVar} > 0 && ${progressVar} < 100 ? (
                          <button type="button" onClick={() => ${setProgressFn}(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : (${previewUrlVar} ? (
                          <button type="button" onClick={() => { ${setPreviewFn}(''); ${setProgressFn}(0); (document.getElementById('${id}') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {${progressVar} > 0 && ${progressVar} < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: \`\${${progressVar}}%\` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        Kéo thả ảnh trực tiếp vào ô này
                      </p>
                    </div>
                    <input type="hidden" name="${name}" value={${previewUrlVar}} />
                    <input type="file" id="${id}" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const url = await uploadWithProgress(e.target.files[0], ${setProgressFn});
                        ${setPreviewFn}(url);
                      } catch (err) {
                        alert('Lỗi upload');
                        ${setProgressFn}(0);
                      }
                    }} />
                  </div>
                  ${description ? `<p className="text-xs text-stone-500 mt-2">${description}</p>` : ''}
                </div>`;
}

// 1. Avatar
const oldAvatarBlockRegex = /<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ<\/label>\s*<div className="flex flex-wrap gap-4 items-center">[\s\S]*?<p className="text-xs text-stone-500 mt-2">Dùng đại diện cho kho nhạc, nên chọn ảnh vuông\.<\/p>\s*<\/div>/g;

const newAvatarBlock = buildUploadUI('Avatar Nghệ Sĩ', 'Dùng đại diện cho kho nhạc, nên chọn ảnh vuông.', 'homeCoverUrlPreview', 'homeCoverProgress', 'homeCoverUpload', 'homeCoverUrl', 'setHomeCoverUrlPreview', 'setHomeCoverProgress');

code = code.replace(oldAvatarBlockRegex, newAvatarBlock);

// 2. Favicon and Thumbnail
const oldGridBlockRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<div>\s*<label className="block text-sm font-bold text-stone-700 mb-2">Favicon \(Kéo thả\)<\/label>[\s\S]*?<\/div>\s*<\/div>/g;

const newFaviconBlock = buildUploadUI('Favicon (Icon trên trình duyệt)', '', 'faviconUrlPreview', 'faviconProgress', 'faviconUpload', 'faviconUrl', 'setFaviconUrlPreview', 'setFaviconProgress');

const newThumbnailBlock = buildUploadUI('Thumbnail ( Ảnh minh họa khi chia sẻ Link )', '', 'ogImageUrlPreview', 'ogImageProgress', 'ogImageUpload', 'ogImageUrl', 'setOgImageUrlPreview', 'setOgImageProgress');

const newGridBlock = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n  ${newFaviconBlock}\n  ${newThumbnailBlock}\n                </div>`;

code = code.replace(oldGridBlockRegex, newGridBlock);

fs.writeFileSync('src/App.tsx', code);
console.log('UI updated');
