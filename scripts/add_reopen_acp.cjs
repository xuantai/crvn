const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const resolveDef = `  const handleResolveTicket = async (ticketId: string) => {`;
const reopenDef = `  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Mở lại yêu cầu",
      message: "Bạn có chắc chắn muốn mở lại ticket này không?",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(\`/api/acp/tickets/\${ticketId}/reopen\`, {
            method: 'POST',
            headers: {
              'Authorization': \`Bearer \${token}\`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã mở lại ticket thành công!");
            fetchTickets();
          } else {
            const err = await res.json();
            setToast(\`Lỗi: \${err.error}\`);
          }
        } catch (e) {
          console.error(e);
          setToast("Lỗi kết nối");
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };

  const handleResolveTicket = async (ticketId: string) => {`;

if (code.includes(resolveDef)) {
  code = code.replace(resolveDef, reopenDef);
  console.log('Added handleReopenTicket to ACP');
}

const actionButtons = `                      {selectedTicket.status === 'open' && (
                        <div className="flex items-center gap-2">`;
const reopenButton = `                      {selectedTicket.status === 'open' && (
                        <div className="flex items-center gap-2">`;
// Wait, we need to show the reopen button when it is NOT open.

const resolveButtonBlock = `                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Từ Chối</span>
                          </button>
                        </div>
                      )}`;
const resolveAndReopenButtonBlock = `                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Từ Chối</span>
                          </button>
                        </div>
                      )}
                      {selectedTicket.status !== 'open' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReopenTicket(selectedTicket.id)}
                            disabled={isHandlingTicketAction}
                            className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 hover:text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all active:scale-95"
                            title="Mở Lại"
                          >
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Mở Lại</span>
                          </button>
                        </div>
                      )}`;

if (code.includes(resolveButtonBlock)) {
  code = code.replace(resolveButtonBlock, resolveAndReopenButtonBlock);
  console.log('Added reopen button to ACP');
} else {
    console.log("resolveButtonBlock not found in ACP");
}

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
