const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  )}
                </div>
              </>
            );
          })()}
        </aside>`;

const replacement = `                  )}
                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className={\`flex items-center transition-all relative group \${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } \${
                      activeTab === 'vouchers' ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }\`}
                    title={t("Mã quà tặng")}
                  >
                    {activeTab === 'vouchers' && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                      />
                    )}
                    <motion.div
                        className="relative z-10 flex items-center justify-center"
                      >
                      <Award className={\`w-5 h-5 relative z-10 transition-colors \${activeTab === 'vouchers' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}\`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Mã quà tặng")}
                      </span>
                    )}
                  </button>
                </div>
              </>
            );
          })()}
        </aside>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced sidebar!");
} else {
    console.log("Target not found!");
}
