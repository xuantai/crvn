const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const templateOptions: CustomSelectOption[] = templates.map(t => ({
      value: t.id,
      label: t.name
    }));`;

const replacement1 = `const templateOptions: CustomSelectOption[] = templates.map(t => ({
      value: t.id,
      label: t.name,
      isVip: t.isVip,
      disabled: t.isVip && !isVip
    }));`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed template opts!");
} else {
    console.log("Target not found! (templateOptions)");
}
