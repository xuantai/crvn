const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

for (let i = 17000; i < 17200; i++) {
  if (code[i] && code[i].includes('<ArrowLeft className="w-5 h-5" /> {t("Trở về Dashboard")}')) {
    // Found the link, next element is the duplicate button.
    // It's inside a <div className="flex items-center justify-between mb-4">
    // We should wrap the duplicate button in a <div className="flex gap-2 items-center">
    for (let j = i; j < i + 10; j++) {
       if (code[j] && code[j].includes('<button')) {
          code.splice(j, 0,
            '          <div className="flex gap-2 items-center">',
            '            {demo?.audioUrl && (',
            '              <a ',
            '                href={demo.audioUrl} ',
            '                className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition-colors shadow-sm font-bold text-sm"',
            '                onClick={(e) => {',
            '                   e.preventDefault();',
            '                   fetch(demo.audioUrl)',
            '                     .then(res => res.blob())',
            '                     .then(blob => {',
            '                        const url = window.URL.createObjectURL(blob);',
            '                        const a = document.createElement(\'a\');',
            '                        a.href = url;',
            '                        a.download = \`\${title || \'song\'}.mp3\`;',
            '                        document.body.appendChild(a);',
            '                        a.click();',
            '                        a.remove();',
            '                        window.URL.revokeObjectURL(url);',
            '                     })',
            '                     .catch(() => window.open(demo.audioUrl, \'_blank\'));',
            '                }}',
            '              >',
            '                <Download className="w-4 h-4" /> Download File',
            '              </a>',
            '            )}'
          );
          
          // Now find where the button closes to close the div
          for (let k = j + 25; k < j + 60; k++) {
             if (code[k] && code[k].includes('</button>')) {
                code.splice(k + 1, 0, '          </div>');
                fs.writeFileSync('src/App.tsx', code.join('\n'));
                console.log("Fixed edit modal!");
                process.exit(0);
             }
          }
       }
    }
  }
}
