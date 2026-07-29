const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetLogo = `<motion.div
                                          key="brand-logo"
                                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full flex items-center justify-center p-1.5 bg-transparent"
                                        >
                                          <img src={demo.brandLogoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-md" alt={demo.brandName} referrerPolicy="no-referrer" />
                                        </motion.div>`;

const replaceLogo = `<motion.div
                                          key="brand-logo"
                                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full flex items-center justify-center p-1 bg-transparent"
                                        >
                                          <img src={demo.brandLogoUrl} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700 shadow-md ring-1 ring-white/10" alt={demo.brandName} referrerPolicy="no-referrer" />
                                        </motion.div>`;

code = code.replace(targetLogo, replaceLogo);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated logo masking");
