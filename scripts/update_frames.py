import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        {avatar && (
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

replacement = """        {avatar && (
          <div className="w-full max-w-sm lg:w-1/2 shrink-0 relative group">
            {/* Animated Gradient Background Frame */}
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0], 
                scale: [1, 1.02, 1] 
              }} 
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
              className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-purple-500 to-emerald-400 rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-10 opacity-70 blur-md group-hover:blur-lg transition-all duration-700"
            ></motion.div>
            
            <motion.div 
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.02, 1]
              }} 
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
              className="absolute inset-0 bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 rounded-[2.5rem] translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5 -z-10 opacity-60"
            ></motion.div>

            {/* Main Image Frame */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
              className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/50 border border-white/20 shadow-2xl relative z-10"
            >
              <img src={avatar} alt="Profile" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
            </motion.div>
          </div>
        )}"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Updated image frames with loops")
