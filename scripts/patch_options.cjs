const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = "options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name) }))}";
const newStr = "options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name), isVip: tc.isVip, disabled: tc.isVip && !(appData?.roleId === 'vip' || appData?.roleId === 'pro' || appData?.isSpecial || (appData?.maxTemplates && appData.maxTemplates > 0)) }))}";

code = code.replaceAll(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
