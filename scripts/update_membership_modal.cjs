const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `                {((data as any)?.roles && (data as any).roles.length > 0 ? (data as any).roles : [
                  { id: 'free', name: 'Gói Miễn Phí', price: '0', features: ['Quản lý bài hát cơ bản', 'Upload tối đa 5 bản nhạc demo', 'Chủ đề cơ bản'] },
                  { id: 'pro', name: 'Gói Chuyên Nghiệp', price: '199.000', features: ['Không giới hạn số bài hát', 'Tự tùy biến chủ đề', 'Hỗ trợ nâng cao', 'Sử dụng tên miền riêng'] }
                ]).map((role: any) => {`;

const replace1 = `                {((data as any)?.roles && (data as any).roles.length > 0 ? (data as any).roles : [
                  { id: 'free', name: 'Gói Miễn Phí', price: '0', features: ['Quản lý bài hát cơ bản', 'Upload tối đa 5 bản nhạc demo', 'Chủ đề cơ bản'] },
                  { id: 'pro', name: 'Gói Chuyên Nghiệp', price: '199.000', features: ['Không giới hạn số bài hát', 'Tự tùy biến chủ đề', 'Hỗ trợ nâng cao', 'Sử dụng tên miền riêng'] },
                  { id: 'vip', name: 'Gói VIP', price: '500.000', features: ['Tất cả quyền lợi Pro', 'Hiệu ứng hiển thị đặc biệt', 'Hỗ trợ 1-1', 'Nhạc thương hiệu (Brand Music)'] }
                ]).map((role: any) => {`;

// add selection button
const target2 = `                          <div className="text-2xl font-black text-stone-900 mb-6">
                            {role.price} ₫ <span className="text-sm font-semibold text-stone-500">/ tháng</span>
                          </div>`;

const replace2 = `                          <div className="text-2xl font-black text-stone-900 mb-6">
                            {role.price} ₫ <span className="text-sm font-semibold text-stone-500">/ tháng</span>
                          </div>
                          
                          <button 
                            type="button" 
                            className={\`w-full py-2.5 rounded-xl font-bold text-sm mb-4 transition-all \${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}\`}
                            onClick={() => {
                               if (!isActive) {
                                  // Triger a dummy loading toast then success
                                  setToast(\`Đang chuyển sang \${role.name}...\`);
                                  setTimeout(() => {
                                      window.location.reload();
                                  }, 1000);
                               }
                            }}
                          >
                            {isActive ? t('Đang Sử Dụng') : t('Chọn Gói Này')}
                          </button>`;

if (code.includes(target1)) {
    code = code.replace(target1, replace1);
    console.log("Replaced packages array");
}

if (code.includes(target2)) {
    code = code.replaceAll(target2, replace2);
    console.log("Replaced select button");
}

fs.writeFileSync('src/App.tsx', code);
