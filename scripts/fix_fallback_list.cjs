const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFallback = `            { id: '17', name: 'Cổ vũ (Mây, mặt trời)' },
            { id: '18', name: 'Pháo hoa (Năm mới)' }
          ];`;

const replaceFallback = `            { id: '17', name: 'Cổ vũ (Mây, mặt trời)' },
            { id: '18', name: 'Pháo hoa (Năm mới)' },
            { id: '19', name: 'Ký Ức' },
            { id: '20', name: 'Ngọt Ngào' }
          ];`;

code = code.replace(targetFallback, replaceFallback);
// it occurs twice, one for new demo and one for edit demo. Wait, maybe multiple times? Let's use replaceAll
code = code.replaceAll(targetFallback, replaceFallback);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated fallback list");
