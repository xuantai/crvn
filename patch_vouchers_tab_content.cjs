const fs = require('fs');
let code = fs.readFileSync('src/components/ACPControlPanel.tsx', 'utf8');

const tabContentStr = `
        ) : activeTab === 'vouchers' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" /> Quản lý Voucher
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Tạo và quản lý các mã quà tặng</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch('/api/acp/vouchers/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                  body: JSON.stringify({ 
                    code: document.getElementById('new-voucher-code').value,
                    increaseSongs: document.getElementById('new-voucher-songs').value,
                    increaseTemplates: document.getElementById('new-voucher-templates').value,
                    vipMonths: document.getElementById('new-voucher-vip').value
                  })
                });
                if (res.ok) {
                  const newVoucher = await res.json();
                  setVouchers(prev => [...prev, newVoucher]);
                  document.getElementById('new-voucher-code').value = '';
                  document.getElementById('new-voucher-songs').value = '0';
                  document.getElementById('new-voucher-templates').value = '0';
                  document.getElementById('new-voucher-vip').value = '0';
                } else {
                  const data = await res.json();
                  alert(data.error || 'Lỗi');
                }
              } catch(err) {
                alert('Lỗi');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mã Voucher *</label>
                  <input type="text" id="new-voucher-code" required placeholder="Nhập mã..." className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng số bài</label>
                  <input type="number" id="new-voucher-songs" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng Giao diện</label>
                  <input type="number" id="new-voucher-templates" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tháng VIP</label>
                  <input type="number" id="new-voucher-vip" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl">Thêm Voucher</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-neutral-900/50">
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Mã Voucher</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Quyền lợi</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Số lần SD</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Ngày tạo</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold text-right pr-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers?.map(v => (
                    <tr key={v.id} className="border-b border-white/5">
                      <td className="p-4 text-sm font-mono text-purple-400">{v.code}</td>
                      <td className="p-4 text-sm text-neutral-300">
                        {v.increaseSongs > 0 && <span className="block">+ {v.increaseSongs} bài</span>}
                        {v.increaseTemplates > 0 && <span className="block">+ {v.increaseTemplates} giao diện</span>}
                        {v.vipMonths > 0 && <span className="block">+ {v.vipMonths} tháng VIP</span>}
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{v.usedBy?.length || 0} lần</td>
                      <td className="p-4 text-sm text-neutral-400">{new Date(v.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right pr-6">
                        <button onClick={async () => {
                          if (confirm('Xóa mã này?')) {
                            const res = await fetch('/api/acp/vouchers/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                              body: JSON.stringify({ id: v.id })
                            });
                            if (res.ok) setVouchers(prev => prev.filter(x => x.id !== v.id));
                          }
                        }} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {(!vouchers || vouchers.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">Chưa có voucher nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'roles' ? (
`;

code = code.replace(
  ") : activeTab === 'roles' ? (",
  tabContentStr
);

fs.writeFileSync('src/components/ACPControlPanel.tsx', code);
