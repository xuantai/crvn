const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<motion.div
                                          key="brand-logo"
                                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full flex items-center justify-center p-2 bg-neutral-900/40 backdrop-blur-[2px]"
                                        >
                                          <img src={demo.brandLogoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={demo.brandName} referrerPolicy="no-referrer" />
                                        </motion.div>`;

const replace = `<motion.div
                                          key="brand-logo"
                                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full flex items-center justify-center p-1.5 bg-transparent"
                                        >
                                          <img src={demo.brandLogoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-md" alt={demo.brandName} referrerPolicy="no-referrer" />
                                        </motion.div>`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated brand logo bg");
