const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const bcryptImport = `import bcrypt from 'bcryptjs';\n`;
if (!code.includes('bcryptjs')) {
    code = code.replace(`import express from 'express';`, `import express from 'express';\n${bcryptImport}`);
}

const checkAdminPassword = `if (artist && artist.password === password) {`;
const replaceAdminPassword = `
    const isMatch = artist && artist.password && (
      (artist.password.startsWith('$2a$') || artist.password.startsWith('$2b$')) 
        ? bcrypt.compareSync(password, artist.password) 
        : artist.password === password
    );
    if (isMatch) {`;
code = code.replace(checkAdminPassword, replaceAdminPassword);

const checkMemberPassword = `if (password === mPass) {`;
const replaceMemberPassword = `
    const isMatch = mPass && (
      (mPass.startsWith('$2a$') || mPass.startsWith('$2b$')) 
        ? bcrypt.compareSync(password, mPass) 
        : mPass === password
    );
    if (isMatch) {`;
code = code.replace(checkMemberPassword, replaceMemberPassword);

const changePassword = `data.adminPassword = newPassword;
    await saveData(data);
    
    artist.password = newPassword;`;
const replaceChangePassword = `
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    data.adminPassword = hashedNewPassword;
    await saveData(data);
    
    artist.password = hashedNewPassword;`;
code = code.replace(changePassword, replaceChangePassword);

const changeMemberPassword = `data.memberPassword = memberPassword || "";
    artist.memberPassword = memberPassword || "";`;
const replaceChangeMemberPassword = `
    const hashedMemberPassword = memberPassword ? bcrypt.hashSync(memberPassword, 10) : "";
    data.memberPassword = hashedMemberPassword;
    artist.memberPassword = hashedMemberPassword;`;
code = code.replace(changeMemberPassword, replaceChangeMemberPassword);

const createDemoPassword = `password: req.body.password || '',`;
const replaceCreateDemoPassword = `password: req.body.password ? bcrypt.hashSync(req.body.password, 10) : '',`;
code = code.replace(createDemoPassword, replaceCreateDemoPassword);

fs.writeFileSync('server.ts', code);
