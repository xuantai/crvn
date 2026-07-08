sed -i -e 's/                                  return null; \/\/ removed \n                                  return (/                                  return (/g' src/App.tsx
sed -i -e '/🎵 Tệp nhạc đã được tải lên trực tiếp thành công/d' src/App.tsx
sed -i -e 's/<span className="font-sans text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-\[11px\] inline-block leading-normal">//g' src/App.tsx
sed -i -e 's/<\/span>//g' src/App.tsx
