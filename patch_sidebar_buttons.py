import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# patch imports
content = content.replace("UserPlus", "UserCircle, BookOpen, UserPlus") # just in case? Let's use a simpler way
content = re.sub(r'import \{ Settings', 'import { UserCircle, BookOpen, User, Settings', content)

# now add the buttons
about_btn = """                  <button
                    onClick={() => setActiveTab('about')}
                    className={`flex items-center transition-all relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isAboutActive ? 'text-white' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Về Tôi")}
                  >
                    {isAboutActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 bg-stone-900/95 rounded-xl z-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_6px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md border border-stone-800 group-hover:bg-stone-800/95"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div
                      animate={isAboutActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isAboutActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <UserCircle className={`w-5 h-5 transition-colors ${isAboutActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && <span className="relative z-10">{t("Về Tôi")}</span>}
                  </button>"""

bio_btn = """                  <button
                    onClick={() => setActiveTab('bio')}
                    className={`flex items-center transition-all relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isBioActive ? 'text-white' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Tiểu Sử")}
                  >
                    {isBioActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 bg-stone-900/95 rounded-xl z-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_6px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md border border-stone-800 group-hover:bg-stone-800/95"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div
                      animate={isBioActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isBioActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <BookOpen className={`w-5 h-5 transition-colors ${isBioActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && <span className="relative z-10">{t("Tiểu Sử")}</span>}
                  </button>"""

# find </button> of profile and append
profile_end = """{!effectiveSidebarCollapsed && <span className="relative z-10">{t("Cài Đặt")}</span>}
                  </button>"""

content = content.replace(profile_end, profile_end + "\n\n" + about_btn + "\n\n" + bio_btn)

with open('src/App.tsx', 'w') as f:
    f.write(content)

