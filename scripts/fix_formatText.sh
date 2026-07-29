sed -i '34c\
                  </span>\
                );' src/App.tsx

sed -i '38c\
              return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;' src/App.tsx
