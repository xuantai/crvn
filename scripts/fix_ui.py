import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = '''      <AnimatePresence>
        {isImgOpen && (
          <Portal>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-md" 
              onClick={() => setIsImgOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-16 sm:pb-24 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]" 
                onClick={e => e.stopPropagation()}
              >
                {/* Tape effect */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-5 sm:h-6 bg-white/60 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 border border-white/40"></div>
                
                {/* Close Button */}
                <div className="absolute -top-4 -right-4 z-20">
                  <button 
                    type="button" 
                    onClick={() => setIsImgOpen(false)} 
                    className="text-stone-500 hover:text-stone-800 transition-colors p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-md cursor-pointer"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Image */}
                <div className="flex items-center justify-center overflow-hidden border border-stone-200/50 min-w-[280px] min-h-[280px]">
                  <div className="relative inline-flex items-center justify-center w-full h-full min-w-[280px] min-h-[280px] bg-stone-100">
                    <img 
                      src={item.imageUrl} 
                      className="w-auto h-auto max-w-full max-h-[75vh] object-contain shadow-sm cursor-pointer" 
                      alt={item.title} 
                      onClick={() => setIsImgOpen(false)} 
                    />
                    
                    {/* Vintage Date Overlay */}
                    <div 
                      className="absolute bottom-2 left-4 z-10 text-[#ffb800] text-xl sm:text-2xl font-bold tracking-widest opacity-90 pointer-events-none" 
                      style={{ 
                        fontFamily: '"Courier New", Courier, monospace', 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
                
                {/* Handwriting Caption */}
                <div className="absolute bottom-5 sm:bottom-7 left-0 w-full px-6 text-center">
                  <h3 
                    className="text-xl sm:text-2xl text-stone-800 font-medium -rotate-1 break-words"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >{item.title}</h3>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>'''

new_modal = '''      <AnimatePresence>
        {isImgOpen && (
          <Portal>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/20 backdrop-blur-xl" 
              onClick={() => setIsImgOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-16 sm:pb-24 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]" 
                onClick={e => e.stopPropagation()}
              >
                {/* Tape effect */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-5 sm:h-6 bg-white/60 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 border border-white/40"></div>
                
                {/* Close Button */}
                <div className="absolute -top-4 -right-4 z-20">
                  <button 
                    type="button" 
                    onClick={() => setIsImgOpen(false)} 
                    className="text-stone-500 hover:text-stone-800 transition-colors p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-md cursor-pointer"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Image */}
                <div className="flex items-center justify-center overflow-hidden border border-stone-200/50">
                  <div className="relative inline-flex items-center justify-center bg-stone-100">
                    <img 
                      src={item.imageUrl} 
                      className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] max-w-[85vw] max-h-[60vh] object-cover shadow-sm cursor-pointer" 
                      alt={item.title} 
                      onClick={() => setIsImgOpen(false)} 
                    />
                    
                    {/* Vintage Date Overlay */}
                    <div 
                      className="absolute bottom-3 left-4 z-10 text-[#ffb800] text-xl sm:text-2xl font-bold tracking-widest opacity-90 pointer-events-none" 
                      style={{ 
                        fontFamily: '"Courier New", Courier, monospace', 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
                
                {/* Handwriting Caption */}
                <div className="absolute bottom-5 sm:bottom-7 left-0 w-full px-6 text-center flex items-center justify-center">
                  <h3 
                    className="text-xl sm:text-2xl text-stone-800 font-medium -rotate-1 break-words w-full"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >{item.title}</h3>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>'''

content = content.replace(old_modal, new_modal)

old_about_view = '''    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
      {isAdmin && (
        <a href={artistExtension ? `/${artistExtension}/admin#about` : '/admin#about'} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white z-20" title={t("Chỉnh sửa")}>
          <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      )}

      {/* Left Side: Avatar floating */}
      {avatar && (
        <div className="w-full max-w-sm lg:w-1/2 shrink-0 relative group">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-500 to-emerald-400 rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-10 opacity-70 blur-md group-hover:blur-lg transition-all duration-700"
          ></motion.div>
          <motion.div 
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 rounded-[2.5rem] translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5 -z-10 opacity-60"
          ></motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/50 border border-white/20 shadow-2xl relative z-10"
          >
            <img src={avatar} alt="Profile" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </div>
      )}
      
      {/* Details */}
      <div className={`w-full ${avatar ? "lg:w-1/2" : "max-w-3xl mx-auto"} flex flex-col justify-center space-y-2 z-10 relative`}>
        <span className="text-[#06b6d4] font-bold text-lg mb-2 tracking-wide uppercase inline-block">Profile Card</span>
        <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-white drop-shadow-md mb-6 break-words leading-tight flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start">
          {data?.artistName || t('Về Tôi') || 'Về Tôi'}
        </h2>'''

new_about_view = '''    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 sm:p-10 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
      {isAdmin && (
        <a href={artistExtension ? `/${artistExtension}/admin#about` : '/admin#about'} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white z-20" title={t("Chỉnh sửa")}>
          <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      )}

      {/* Left Side: Avatar floating */}
      {avatar && (
        <div className="w-full max-w-[16rem] sm:max-w-xs lg:max-w-[22rem] shrink-0 relative group mx-auto lg:mx-0 mt-2 lg:mt-0">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-500 to-emerald-400 rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-5 sm:translate-y-5 -z-10 opacity-70 blur-md group-hover:blur-lg transition-all duration-700"
          ></motion.div>
          <motion.div 
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 rounded-[2.5rem] translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 -z-10 opacity-60"
          ></motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/50 border border-white/20 shadow-2xl relative z-10"
          >
            <img src={avatar} alt="Profile" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </div>
      )}
      
      {/* Details */}
      <div className={`w-full ${avatar ? "lg:flex-1" : "max-w-3xl mx-auto"} flex flex-col justify-center space-y-1 sm:space-y-2 z-10 relative mt-6 lg:mt-0`}>
        <span className="text-[#06b6d4] font-bold text-sm sm:text-base mb-1 tracking-wide uppercase inline-block text-center lg:text-left">{aboutMe.role || 'Profile Card'}</span>
        <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black text-white drop-shadow-md mb-4 sm:mb-6 leading-tight text-center lg:text-left break-words">
          {data?.artistName || t('Về Tôi') || 'Về Tôi'}
        </h2>'''

content = content.replace(old_about_view, new_about_view)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UI")
