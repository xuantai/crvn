const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = '`Hệ thống đã gỡ bài hát này khỏi kênh của ${ticket.sourceArtist} theo yêu cầu của ${ticket.reporter.name}.`';
const replace1 = '`Hệ thống đã gỡ bài hát này khỏi kênh của ${ticket.sourceArtist} theo yêu cầu của ${mapTicket(ticket).reporter.name}.`';

if (code.includes(target1)) {
  code = code.replaceAll(target1, replace1);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed undefined reporter error in server.ts');
} else {
  console.log('Target not found');
}
