sed -i -e '/<span className="hidden sm:inline text-\[11px\] text-stone-400 font-medium mr-1">Chèn nhanh:<\/span>/d' src/App.tsx
sed -i -e 's/                                  return (/                                  return null; \/\/ removed \n                                  return (/g' src/App.tsx
