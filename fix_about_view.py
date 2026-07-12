with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix 1: Pass onGoToVault to PublicAboutView
target1 = "{isAbout && <PublicAboutView aboutMe={data.aboutMe} data={data} t={t} />}"
replacement1 = "{isAbout && <PublicAboutView aboutMe={data.aboutMe} data={data} t={t} onGoToVault={() => setActiveMenuTab(data.menus?.find((m: any) => m.type === 'vault')?.id || 'm1')} />}"
content = content.replace(target1, replacement1)

# Fix 2: Change PublicAboutView signature
target2 = "function PublicAboutView({ aboutMe, data, t }: any) {"
replacement2 = "function PublicAboutView({ aboutMe, data, t, onGoToVault }: any) {"
content = content.replace(target2, replacement2)

# Fix 3: Animate avatar frames
target3 = """        {avatar && (
          <div className="w-full max-w-sm lg:w-1/2 shrink-0 relative">
            <div className="absolute inset-0 bg-[#3b82f6] rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-10"></div>
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-200">
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        )}"""

replacement3 = """        {avatar && (
          <div className="w-full max-w-sm lg:w-1/2 shrink-0 relative">
            <motion.div 
              animate={{ x: [0, 8, 0], y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
              className="absolute inset-0 bg-[#3b82f6] rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-10"
            ></motion.div>
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }} 
              className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-200"
            >
              <img src={avatar} alt="Profile" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>
        )}"""
content = content.replace(target3, replacement3)

# Fix 4: Change "Hình Ảnh" button to "Kho Nhạc" and add onClick={onGoToVault}
target4 = """             <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 px-8 rounded-full shadow-[0_8px_16px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 text-lg">
                {t("Hình Ảnh") || "Hình Ảnh"}
             </button>"""

replacement4 = """             <button onClick={onGoToVault} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 px-8 rounded-full shadow-[0_8px_16px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 text-lg cursor-pointer">
                {t("Kho Nhạc")}
             </button>"""
content = content.replace(target4, replacement4)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Applied changes")
