const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// I will just re-add the missing animation property and remove extra brace if needed
// Actually, let me just replace the broken part
css = css.replace(
/}\s*\.animate-float-shape {\s*}\s*}\s*\.artist-link-cool/g,
`}\n.animate-float-shape {\n  animation: float-shape infinite ease-in-out;\n}\n.artist-link-cool`
);

css = css.replace(/\}\s*\}\s*\.artist-link-cool/, "}\n.artist-link-cool");
css = css.replace(/\.animate-float-shape\s*\{\s*\}/, ".animate-float-shape {\n  animation: float-shape infinite ease-in-out;\n}");

fs.writeFileSync('src/index.css', css);
