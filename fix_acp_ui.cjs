const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const target1 = `                        <p className="text-xs text-neutral-400 mt-1">
                          Người yêu cầu: <strong className="text-neutral-200">{selectedTicket.reporter.name}</strong> (@{selectedTicket.reporter.username}) | Kênh uploader: <strong className="text-neutral-200">{selectedTicket.sourceArtist}</strong>
                        </p>`;
const replace1 = `                        <p className="text-xs text-neutral-400 mt-1">
                          <span className="hidden sm:inline">Người yêu cầu: </span><strong className="text-neutral-200">{selectedTicket.reporter.name}</strong><span className="hidden sm:inline"> (@{selectedTicket.reporter.username})</span> | Kênh uploader: <strong className="text-neutral-200">{selectedTicket.sourceArtist}</strong>
                        </p>`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  console.log('Fixed mobile reporter label in ACP');
}

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
