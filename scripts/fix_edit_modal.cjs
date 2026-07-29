const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          <button 
            type="button"
            onClick={async () => {
              try { 
                const res = await fetch(\`/api/demos/\${demo.id}/duplicate\`, {`;

const replacement = `          <div className="flex gap-2 items-center">
            {demo?.audioUrl && (
              <a 
                href={demo.audioUrl} 
                className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition-colors shadow-sm font-bold text-sm"
                onClick={(e) => {
                   e.preventDefault();
                   fetch(demo.audioUrl)
                     .then(res => res.blob())
                     .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = \`\${title || 'song'}.mp3\`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                     })
                     .catch(() => window.open(demo.audioUrl, '_blank'));
                }}
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            )}
            <button 
              type="button"
              onClick={async () => {
                try { 
                  const res = await fetch(\`/api/demos/\${demo.id}/duplicate\`, {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    // don't forget to close the new div after the duplicate button
    const targetClose = `            <Copy className="w-4 h-4" /> Nhân bản
          </button>
        </div>`;
    const replacementClose = `            <Copy className="w-4 h-4" /> Nhân bản
            </button>
          </div>
        </div>`;
    code = code.replace(targetClose, replacementClose);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed edit modal!");
} else {
    console.log("Target not found!");
}
