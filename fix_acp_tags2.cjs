const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  '        ) : null}\n          </div>\n      </main>',
  '        ) : null}\n      </main>\n    </div>'
);
// wait, the previous code had:
//         ) : null}
//           </div>
//       </main>
// so if I replace it with </main> \n </div>, it will close <main> then <div>.

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
