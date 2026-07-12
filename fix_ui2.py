import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Avatar
old_avatar = '''      {/* Left Side: Avatar */}
      {avatar && (
        <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-[20rem] md:h-[26rem] lg:w-[22rem] lg:h-[28rem] z-20 shrink-0 group mx-auto md:mx-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500 shadow-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] -translate-x-3 translate-y-4 sm:-translate-x-4 sm:translate-y-5 group-hover:-translate-x-5 group-hover:translate-y-6 transition-transform duration-500 shadow-lg"></div>
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-10 bg-neutral-900 shadow-2xl border border-white/10">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      )}'''

new_avatar = '''      {/* Left Side: Avatar floating */}
      {avatar && (
        <div className="relative w-48 h-64 sm:w-64 sm:h-80 md:w-[26rem] md:h-[32rem] z-20 shrink-0">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-full h-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#eab308] to-[#d97706] rounded-[2.5rem] translate-x-4 translate-y-4 opacity-90 shadow-xl group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-[2.5rem] -translate-x-3 translate-y-6 opacity-70 mix-blend-screen shadow-xl group-hover:-translate-x-4 group-hover:translate-y-7 transition-transform duration-500"></div>
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-[4px_4px_15px_rgba(0,0,0,0.4)] bg-black/20 z-10">
              <img src={avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </motion.div>
        </div>
      )}'''

content = content.replace(old_avatar, new_avatar)

# Fix Timeline Modal
old_modal = '''      <AnimatePresence>
        {isImgOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" 
            onClick={() => setIsImgOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-12 sm:pb-16 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto" 
              onClick={e => e.stopPropagation()}
            >
              {/* Tape effect */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-5 sm:h-6 bg-white/60 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 border border-white/40"></div>
              
              {/* Close Button */}
              <div className="absolute -top-4 -right-4 z-20">
                <button 
                  type="button" 
                  onClick={() => setIsImgOpen(false)} 
                  className="text-stone-500 hover:text-stone-800 transition-colors p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-md"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center overflow-hidden border border-stone-200/50 bg-stone-100/50">
                <img 
                  src={item.imageUrl} 
                  className="w-auto h-auto max-w-full max-h-[calc(90vh-8rem)] object-contain shadow-sm cursor-pointer" 
                  alt={item.title} 
                  onClick={() => setIsImgOpen(false)} 
                />
              </div>
              
              {/* Handwriting Caption */}
              <div className="absolute bottom-3 sm:bottom-4 left-0 w-full px-6 text-center">
                <h3 className="text-xl sm:text-2xl text-stone-800 font-medium" style={{ fontFamily: 'Caveat, "Comic Sans MS", cursive', transform: 'rotate(-1deg)' }}>{item.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>'''

new_modal = '''      <AnimatePresence>
        {isImgOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" 
            onClick={() => setIsImgOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-12 sm:pb-16 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]" 
              onClick={e => e.stopPropagation()}
            >
              {/* Tape effect */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-5 sm:h-6 bg-white/60 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 border border-white/40"></div>
              
              {/* Close Button */}
              <div className="absolute -top-4 -right-4 z-20">
                <button 
                  type="button" 
                  onClick={() => setIsImgOpen(false)} 
                  className="text-stone-500 hover:text-stone-800 transition-colors p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-md"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center overflow-hidden border border-stone-200/50">
                <img 
                  src={item.imageUrl} 
                  className="w-auto h-auto max-w-full max-h-[65vh] object-contain shadow-sm cursor-pointer" 
                  alt={item.title} 
                  onClick={() => setIsImgOpen(false)} 
                />
              </div>
              
              {/* Handwriting Caption */}
              <div className="absolute bottom-3 sm:bottom-4 left-0 w-full px-6 text-center">
                <h3 className="text-xl sm:text-2xl text-stone-800 font-medium" style={{ fontFamily: 'Caveat, "Comic Sans MS", cursive', transform: 'rotate(-1deg)' }}>{item.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>'''

content = content.replace(old_modal, new_modal)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
