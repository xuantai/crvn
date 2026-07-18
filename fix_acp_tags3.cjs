const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

code = code.replace(
  '        ) : null}\n      </main>\n    </div>',
  '        ) : null}\n      </main>'
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
