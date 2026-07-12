import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_about_view = '''    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white flex flex-col md:flex-row gap-8 sm:gap-12 lg:gap-16 items-center md:items-start">
      {isAdmin && (
        <a href={artistExtension ? `/${artistExtension}/admin#about` : '/admin#about'} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white z-20" title={t("Chỉnh sửa")}>
          <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      )}

      {/* Left Side: Avatar floating */}
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
      )}
      
      {/* Details */}
      <div className="flex-1 space-y-6 sm:space-y-8 text-center md:text-left z-10 relative">
        {aboutMe.role && <span className="text-[#06b6d4] font-bold text-lg mb-2 tracking-wide uppercase inline-block">{aboutMe.role}</span>}
        <h2 className="text-[clamp(1.8rem,7vw,3rem)] font-black text-white drop-shadow-md mb-6 whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center md:justify-start gap-4 flex-wrap">
          {data?.artistName || t('Về Tôi') || 'Về Tôi'}
        </h2>'''

new_about_view = '''    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 mt-24 mb-20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative z-10 text-white max-w-6xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
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

content = content.replace(old_about_view, new_about_view)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PublicAboutView")
