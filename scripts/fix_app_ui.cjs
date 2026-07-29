const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetMobile1 = `                            <p className="text-xs text-stone-500 mt-1">
                              Người yêu cầu: <strong>{selectedTicket.reporter.name}</strong> (u/ {selectedTicket.reporter.username})
                            </p>`;

const replaceMobile1 = `                            <p className="text-xs text-stone-500 mt-1">
                              <span className="hidden sm:inline">Người yêu cầu: </span><strong>{selectedTicket.reporter.name}</strong> <span className="hidden sm:inline">(u/ {selectedTicket.reporter.username})</span>
                            </p>`;

if (code.includes(targetMobile1)) {
  code = code.replace(targetMobile1, replaceMobile1);
  console.log('Fixed mobile reporter label');
}

const targetVip = `Thiết Lập Mật Khẩu Thành Viên (VIP VIP)`;
if (code.includes(targetVip)) {
  code = code.replace(targetVip, `Thiết Lập Mật Khẩu Thành Viên`);
  console.log('Fixed VIP text');
}

fs.writeFileSync('src/App.tsx', code);
