const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const resolveDef = `  const handleResolveTicket = async (ticketId: string) => {`;
const reopenDef = `  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Mở lại yêu cầu",
      message: "Bạn có chắc chắn muốn mở lại ticket này không?",
      onConfirm: async () => {
        try {
          const res = await fetch(\`/api/admin/tickets/\${ticketId}/reopen\`, {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': \`Bearer \${getAdminToken() || ''}\`
            }
          });
          if (res.ok) {
            setToast("Đã mở lại ticket thành công!");
            fetchTickets();
          } else {
             const err = await res.json();
             setToast(\`Lỗi: \${err.error}\`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleResolveTicket = async (ticketId: string) => {`;

if (code.includes(resolveDef)) {
  code = code.replace(resolveDef, reopenDef);
  console.log('Added handleReopenTicket to App');
}

const resolveButtonBlock = `                              <button
                                onClick={() => handleResolveTicket(selectedTicket.id)}
                                className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Đóng Ticket"
                              >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Từ Chối</span>
                              </button>
                            </>
                          )}
                        </div>`;
const resolveAndReopenButtonBlock = `                              <button
                                onClick={() => handleResolveTicket(selectedTicket.id)}
                                className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Đóng Ticket"
                              >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Từ Chối</span>
                              </button>
                            </>
                          )}
                          {(data?.username === 'acxuantai' || data?.isMasterAdmin) && selectedTicket.status !== 'open' && (
                             <button
                                onClick={() => handleReopenTicket(selectedTicket.id)}
                                className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Mở lại Ticket"
                              >
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Mở Lại</span>
                              </button>
                          )}
                        </div>`;

if (code.includes(resolveButtonBlock)) {
  code = code.replace(resolveButtonBlock, resolveAndReopenButtonBlock);
  console.log('Added reopen button to App');
} else {
    console.log("resolveButtonBlock not found in App");
}

fs.writeFileSync('src/App.tsx', code);
