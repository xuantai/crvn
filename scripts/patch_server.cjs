const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('globalLayoutSections')) {
  code = code.replace(
    `menuVaultVi, menuAboutVi, menuBioVi,\n      templateNames`,
    `menuVaultVi, menuAboutVi, menuBioVi,\n      templateNames,\n      globalLayoutSections`
  );
  code = code.replace(
    `menuBioVi: menuBioVi || '',\n      templateNames`,
    `menuBioVi: menuBioVi || '',\n      templateNames,\n      globalLayoutSections`
  );
  fs.writeFileSync('server.ts', code);
  console.log("Patched server");
} else {
  console.log("Already patched or target not found");
}
