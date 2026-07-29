import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''      <AnimatePresence>
        {isImgOpen && createPortal(
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" 
            onClick={() => setIsImgOpen(false)}
          >'''

new_code = '''      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isImgOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm" 
              onClick={() => setIsImgOpen(false)}
            >'''

content = content.replace(old_code, new_code)

old_end = '''              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>'''

new_end = '''              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>'''

content = content.replace(old_end, new_end)

# Also fix the image shift
old_img_div = '''className={`shrink-0 relative bg-[#fdfbf7] p-1.5 pb-5 sm:p-2.5 sm:pb-8 shadow-[2px_4px_15px_rgba(0,0,0,0.15)] border border-stone-200/80 rounded-sm cursor-pointer hover:z-20 hover:scale-105 transition-all ${!isSplit ? 'md:group-odd:order-first' : ''}`}'''
new_img_div = '''className={`shrink-0 relative bg-[#fdfbf7] p-1.5 pb-5 sm:p-2.5 sm:pb-8 shadow-[2px_4px_15px_rgba(0,0,0,0.15)] border border-stone-200/80 rounded-sm cursor-pointer hover:z-20 hover:scale-105 transition-all translate-x-3 sm:translate-x-5 md:translate-x-6 z-10 ${!isSplit ? 'md:group-odd:order-first' : ''}`}'''

content = content.replace(old_img_div, new_img_div)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed portal")

