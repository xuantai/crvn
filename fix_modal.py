import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

portal_comp = '''
function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
'''
if 'function Portal(' not in content:
    content = content.replace('let globalShowConfirm: any = null;', portal_comp + '\nlet globalShowConfirm: any = null;')

old_modal = '''      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isImgOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" 
              onClick={() => setIsImgOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-14 sm:pb-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-stone-200/80 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]" 
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
                  <div className="relative inline-block leading-none">
                    <img 
                      src={item.imageUrl} 
                      className="w-auto h-auto max-w-full max-h-[75vh] object-contain shadow-sm cursor-pointer" 
                      alt={item.title} 
                      onClick={() => setIsImgOpen(false)} 
                    />
                    
                    {/* Vintage Date Overlay */}
                    <div 
                      className="absolute bottom-4 left-5 z-10 text-[#ffb800] text-xl sm:text-2xl font-bold tracking-widest opacity-90 pointer-events-none" 
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
                <div className="absolute bottom-4 sm:bottom-5 left-0 w-full px-6 text-center">
                  <h3 className="text-xl sm:text-2xl text-stone-800 font-medium italic -rotate-1">{item.title}</h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}'''

new_modal = '''      <AnimatePresence>
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

content = content.replace(old_modal, new_modal)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed modal")
