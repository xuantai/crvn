const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  '        ) : null}\n          </div>\n        </div>\n      </main>',
  '        ) : null}\n          </div>\n      </main>'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
