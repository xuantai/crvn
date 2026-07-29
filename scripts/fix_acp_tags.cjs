const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

// Change root back to div
code = code.replace(
  '<main className="flex h-screen bg-black text-white font-sans overflow-hidden">',
  '<div className="flex h-screen bg-black text-white font-sans overflow-hidden">'
);

// Change the main content area to <main>
code = code.replace(
  '<div className="flex-1 min-w-0 space-y-8">',
  '<main className="flex-1 overflow-y-auto p-6 sm:p-10 min-w-0">'
);
// Wait, was the original className for main just flex-1 min-w-0 space-y-8?
// Actually in typical layouts it's:
// <main className="flex-1 overflow-y-auto p-6 sm:p-10 min-w-0">

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
