const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCoverCode = `                  ) : displayCoverUrl ? (
                    <img 
                      src={displayCoverUrl}`;

const replaceCoverCode = `                  ) : templateType === '19' ? (
                    <div className="relative w-full aspect-[4/5] bg-[#EAE6DF] p-4 flex flex-col justify-center items-center shadow-inner rounded-xl overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 w-[12%] bg-[#1A1A1A] flex flex-col justify-between py-3 border-r border-[#333] z-10">
                         {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="w-[45%] aspect-square bg-[#EAE6DF] mx-auto rounded-[2px] opacity-90 shadow-inner"></div>
                         ))}
                         <div className="absolute top-[20%] -right-5 text-[#EAE6DF]/60 text-[7px] font-mono rotate-90 tracking-widest whitespace-nowrap">3 • 13A</div>
                         <div className="absolute top-[60%] -right-5 text-[#EAE6DF]/60 text-[7px] font-mono rotate-90 tracking-widest whitespace-nowrap">5 • 15A</div>
                      </div>
                      <div className="absolute top-0 bottom-0 right-0 w-[12%] bg-[#1A1A1A] flex flex-col justify-between py-3 border-l border-[#333] z-10">
                         {Array.from({length: 12}).map((_, i) => (
                            <div key={i} className="w-[45%] aspect-square bg-[#EAE6DF] mx-auto rounded-[2px] opacity-90 shadow-inner"></div>
                         ))}
                      </div>
                      <div className="w-[85%] aspect-square flex items-center justify-center bg-black relative z-20">
                        <div className="relative w-[95%] aspect-square shadow-[0_0_15px_rgba(0,0,0,0.8)] bg-[#2F1A0F]">
                           {displayCoverUrl ? (
                              <img src={displayCoverUrl} alt="Cover" className="w-full h-full object-cover sepia-[0.25] brightness-90 contrast-110" />
                           ) : (
                              <div className="w-full h-full flex flex-col justify-center items-center">
                                <Music className="w-12 h-12 text-[#E5B582] opacity-80" />
                              </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 to-transparent mix-blend-overlay pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                  ) : templateType === '20' ? (
                    <div className="relative w-full aspect-[4/3] bg-[#FFA7B6] rounded-[2rem] p-4 sm:p-5 border-[6px] border-[#FF8DA1] shadow-[inset_0_-10px_20px_rgba(255,100,130,0.4)] flex items-center">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-16 pointer-events-none">
                         <div className="absolute bottom-0 left-1/2 w-1.5 h-12 bg-gray-300 origin-bottom -rotate-45 rounded-full"></div>
                         <div className="absolute bottom-0 left-1/2 w-1.5 h-16 bg-gray-300 origin-bottom rotate-12 rounded-full"></div>
                         <div className="absolute top-0 left-[20%] w-4 h-4 bg-red-400 rounded-full shadow-sm border border-white/40"></div>
                         <div className="absolute -top-2 right-[35%] w-5 h-5 bg-yellow-400 rounded-full shadow-sm border border-white/40"></div>
                      </div>
                      <div className="w-[65%] h-[85%] bg-black rounded-3xl border-[6px] border-gray-800 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] ml-2 relative overflow-hidden flex items-center justify-center">
                         {displayCoverUrl ? (
                            <img src={displayCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                         ) : (
                            <Music className="w-16 h-16 text-pink-400 opacity-80" />
                         )}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="w-[35%] h-full flex flex-col justify-center items-center gap-4 sm:gap-6 pl-2 sm:pl-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md rounded-full flex items-center justify-center border border-pink-200">
                           <div className="w-6 sm:w-8 h-1.5 bg-gray-200 rotate-45 rounded-full"></div>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-md rounded-full flex items-center justify-center border border-pink-200">
                           <div className="w-6 sm:w-8 h-1.5 bg-gray-200 -rotate-12 rounded-full"></div>
                        </div>
                        <div className="flex flex-col gap-2 mt-2 sm:mt-4">
                           <div className="w-10 sm:w-12 h-2 bg-pink-400/50 rounded-full"></div>
                           <div className="w-10 sm:w-12 h-2 bg-pink-400/50 rounded-full"></div>
                           <div className="w-10 sm:w-12 h-2 bg-pink-400/50 rounded-full"></div>
                           <div className="w-10 sm:w-12 h-2 bg-pink-400/50 rounded-full"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-3 left-6 text-xl sm:text-2xl animate-bounce">✨</div>
                      <div className="absolute -bottom-2 right-12 text-lg sm:text-xl">🌈</div>
                      <div className="absolute -left-3 top-1/2 text-2xl sm:text-3xl text-pink-500 animate-pulse">💖</div>
                    </div>
                  ) : displayCoverUrl ? (
                    <img 
                      src={displayCoverUrl}`;

code = code.replace(targetCoverCode, replaceCoverCode);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated cover art logic");
