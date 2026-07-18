const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `onClick={() => { 
                             if (!isActive) {
                                setToast(\`Vui lòng nâng cấp gói tại trang chủ landing page!\`);
                                setTimeout(() => setToast(''), 3000);
                             }
                          }}`;
const replace = `onClick={() => { 
                             if (!isActive) {
                                setData({...data, roleId: role.id});
                                setToast(\`Đã chuyển sang \${role.name} (chế độ xem trước)\`);
                                setTimeout(() => setToast(''), 3000);
                             }
                          }}`;
                          
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated selection logic");
