const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert helpers right after getAdminLink
const helpers = `
const getAdminTokenKey = () => getArtistExtensionFromUrl() ? \`adminToken_\${getArtistExtensionFromUrl()}\` : 'adminToken';
const getMemberTokenKey = () => getArtistExtensionFromUrl() ? \`memberToken_\${getArtistExtensionFromUrl()}\` : 'memberToken';

const getAdminToken = () => localStorage.getItem(getAdminTokenKey());
const setAdminToken = (token: string) => localStorage.setItem(getAdminTokenKey(), token);
const removeAdminToken = () => localStorage.removeItem(getAdminTokenKey());

const getMemberToken = () => localStorage.getItem(getMemberTokenKey());
const setMemberToken = (token: string) => localStorage.setItem(getMemberTokenKey(), token);
const removeMemberToken = () => localStorage.removeItem(getMemberTokenKey());
`;

content = content.replace(/(const getAdminLink =.*?};)/s, '$1\n' + helpers);

// Replace usages
content = content.replace(/localStorage\.getItem\('adminToken'\)/g, 'getAdminToken()');
content = content.replace(/localStorage\.setItem\('adminToken',\s*([^)]+)\)/g, 'setAdminToken($1)');
content = content.replace(/localStorage\.removeItem\('adminToken'\)/g, 'removeAdminToken()');

content = content.replace(/localStorage\.getItem\('memberToken'\)/g, 'getMemberToken()');
content = content.replace(/localStorage\.setItem\('memberToken',\s*([^)]+)\)/g, 'setMemberToken($1)');
content = content.replace(/localStorage\.removeItem\('memberToken'\)/g, 'removeMemberToken()');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
