import sys

with open("src/components/HelpPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add showTooltip state
state_target = "  const [activeTab, setActiveTab] = useState('account');"
state_repl = "  const [activeTab, setActiveTab] = useState('account');\n  const [showTooltip, setShowTooltip] = useState(false);"
if "const [showTooltip, setShowTooltip]" not in content:
    content = content.replace(state_target, state_repl)

# Replace the floating button demo
btn_target = """                  {/* Floating button demo */}
                  <div className="absolute bottom-6 right-6">
                    <div className="w-14 h-14 bg-black rounded-2xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform animate-[pulse_2s_infinite]">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>"""

btn_repl = """                  {/* Floating button demo */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                          className="relative bg-stone-950/95 backdrop-blur-md border border-white/15 text-white text-xs font-black tracking-wider px-4 py-2.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap pointer-events-none uppercase"
                        >
                          Đăng Bài Hát Mới
                          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl -z-10 animate-pulse" />
                          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-stone-950/95 border-r border-t border-white/15 rotate-45"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div 
                      className="relative flex items-center justify-center w-16 h-16 rounded-full cursor-pointer group overflow-hidden border border-white/50 backdrop-blur-xl bg-purple-950/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.75),0_16px_40px_rgba(219,39,119,0.5),0_0_24px_rgba(168,85,247,0.35)]"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "inset 0 2px 4px rgba(255,255,255,0.75), 0 16px 40px rgba(219,39,119,0.5), 0 0 24px rgba(168,85,247,0.35)",
                          "inset 0 2px 4px rgba(255,255,255,0.9), 0 24px 56px rgba(236,72,153,0.75), 0 0 36px rgba(139,92,246,0.6)",
                          "inset 0 2px 4px rgba(255,255,255,0.75), 0 16px 40px rgba(219,39,119,0.5), 0 0 24px rgba(168,85,247,0.35)"
                        ]
                      }}
                      transition={{
                        scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                        boxShadow: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-fuchsia-600 via-pink-600 to-rose-500 opacity-100 animate-rotate-border -z-10" style={{ transform: 'scale(1.2)' }} />
                      <div className="absolute inset-0 bg-gradient-to-bl from-pink-500 via-purple-600 to-indigo-700 opacity-60 mix-blend-overlay animate-[pulse_3s_ease-in-out_infinite] -z-10" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,transparent_60%)] pointer-events-none mix-blend-overlay" />
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-full pointer-events-none" />
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-pink-500/40 -z-20"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-purple-600/30 -z-20"
                        animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      />
                      <Plus className="w-8 h-8 text-white filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] relative z-10" strokeWidth={2.5} />
                    </motion.div>
                  </div>"""

content = content.replace(btn_target, btn_repl)

with open("src/components/HelpPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("HelpPage patched")
