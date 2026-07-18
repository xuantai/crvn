const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSelect = `options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name), isVip: tc.isVip, disabled: tc.isVip && !(appData?.roleId === 'vip' || appData?.roleId === 'pro' || appData?.isSpecial || (appData?.maxTemplates && appData.maxTemplates > 0)) }))}`;
const replaceSelect = `options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name), isVip: tc.isVip || tc.id === '2', disabled: (tc.isVip || tc.id === '2') && !(appData?.roleId === 'vip' || appData?.roleId === 'pro' || appData?.isSpecial || (appData?.maxTemplates && appData.maxTemplates > 0)) }))}`;

code = code.replaceAll(targetSelect, replaceSelect);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated isVip in CustomSelect options");
