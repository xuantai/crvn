const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const getBadgeJSX = (mtClass) => `{(() => {
                    const roleIdStr = String(data?.roleId || 'free').toLowerCase();
                    const isVip = roleIdStr === 'vip';
                    const isPro = roleIdStr === 'pro' || roleIdStr === 'chuyên nghiệp' || roleIdStr === 'gói chuyên nghiệp';
                    let badgeClasses = "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border inline-block ${mtClass} ";
                    if (isVip) {
                      badgeClasses += "bg-gradient-to-r from-yellow-200 to-amber-300 text-amber-900 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-[pulse_2s_infinite]";
                    } else if (isPro) {
                      badgeClasses += "text-emerald-700 bg-emerald-100 border-emerald-300";
                    } else {
                      badgeClasses += "text-indigo-600 bg-indigo-50 border-indigo-100";
                    }
                    const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                    return <span className={badgeClasses}>{matchedRole ? matchedRole.name : (data?.roleId || 'Thành viên')}</span>;
                  })()}`;

const target1 = `<p className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-1.5 uppercase tracking-wider">
                  {(() => {
                    const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                    return matchedRole ? matchedRole.name : (data?.roleId || 'Thành viên');
                  })()}
                </p>`;

const target2 = `<span className="inline-block text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-2 uppercase tracking-wide">
                      {(() => {
                        const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                        return matchedRole ? matchedRole.name : (data?.roleId || t("Thành viên"));
                      })()}
                    </span>`;

let target2Alt = target2.replace('t("Thành viên")', "'Thành viên'");
let target2Alt2 = `<span className="inline-block text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-2 uppercase tracking-wide">
                      {(() => {
                        const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                        return matchedRole ? matchedRole.name : (data?.roleId || t("Thành viên"));
                      })()}
                    </span>`;

if (code.includes(target1)) {
    code = code.replace(target1, getBadgeJSX("mt-1.5"));
    console.log("Replaced target1");
}

if (code.includes(target2)) {
    code = code.replace(target2, getBadgeJSX("mt-2"));
    console.log("Replaced target2");
}

fs.writeFileSync('src/App.tsx', code);
