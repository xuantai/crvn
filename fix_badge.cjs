const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /function getBrandBadgeStyle\([\s\S]*?return \{[\s\S]*?\};\n\}/;

const replace = `function getBrandBadgeStyle(primaryColor: string) {
  const isColorLight = getLuminance(primaryColor) > 0.5;
  const backgroundColor = isColorLight ? 'rgba(15, 15, 15, 0.85)' : 'rgba(245, 245, 245, 0.9)';
  const borderColor = isColorLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const labelColor = isColorLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  
  return {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    labelColor: labelColor,
    valueColor: primaryColor,
    boxShadow: isColorLight ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
  };
}`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Restored getBrandBadgeStyle");
} else {
    console.log("Not found");
}
