const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = '`Admin hệ thống đã ra quyết định GỠ BÀI HÁT này khỏi kênh của ${ticket.sourceArtist}.`';
const replace = '`Hệ thống đã gỡ bài hát này khỏi kênh của ${ticket.sourceArtist} theo yêu cầu của ${ticket.reporter.name}.`';

if (code.includes(target)) {
  code = code.replaceAll(target, replace);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed message in server.ts');
} else {
  console.log('Target message not found');
}
