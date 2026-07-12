with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto bg-neutral-900 border border-white/10 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative z-10">
      {aboutMe.avatarUrl && (
        <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-full overflow-hidden mb-8 border-4 border-neutral-800 shadow-xl">
          <img src={aboutMe.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      {aboutMe.intro && ("""
      
replacement = """    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto bg-neutral-900 border border-white/10 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative z-10">
      {aboutMe.intro && ("""
      
if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Replaced")
else:
    print("Not found")
