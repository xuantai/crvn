const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /'bg-\[#1A1303\]\/90 border-\[#D4AF37\]\/50 text-\[#D4AF37\] hover:bg-black hover:shadow-\[0_0_15px_rgba\(212,175,55,0\.4\)\]'/g,
  "'bg-[#1A1303]/30 border-[#D4AF37]/50 text-[#AA7C11] hover:bg-[#1A1303]/80 hover:text-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]'"
);

code = code.replace(
  /'bg-\[#1A1303\]\/90 border-\[#D4AF37\]\/40 text-\[#D4AF37\] '/g,
  "'bg-[#1A1303]/30 border-[#D4AF37]/40 text-[#AA7C11] '"
);

fs.writeFileSync('src/App.tsx', code);
