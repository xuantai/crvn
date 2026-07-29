import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = '''              {/* Image */}
              <div className="flex items-center justify-center overflow-hidden border border-stone-200/50 relative">
                <img 
                  src={item.imageUrl} 
                  className="w-auto h-auto max-w-full max-h-[75vh] object-contain shadow-sm cursor-pointer" 
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
              </div>'''

new_modal = '''              {/* Image */}
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
              </div>'''

if old_modal in content:
    content = content.replace(old_modal, new_modal)
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")
else:
    print("Not found")

