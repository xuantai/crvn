with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if line.startswith('function PublicBioView('):
        start_idx = i
        break

if start_idx != -1:
    new_code = """function PublicBioView({ biography, t }: any) {
  if (!biography) return null;
  
  const hasEdu = biography.education?.length > 0;
  const hasExp = biography.experience?.length > 0;
  
  if (!hasEdu && !hasExp) return null;
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full mx-auto mb-20 relative z-10 px-6 sm:px-12 bg-white rounded-[2.5rem] py-12 shadow-2xl text-stone-900 ${hasEdu && hasExp ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24' : 'max-w-4xl space-y-20'}`}>
      {hasEdu && (
        <div>
          <h2 className="text-3xl font-black text-stone-900 mb-10 text-center tracking-tight">{t['Học Vấn'] || 'Học Vấn'}</h2>
          <div className={`space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-200 ${hasEdu && hasExp ? 'md:before:ml-[1.125rem] md:before:-translate-x-px' : 'md:before:mx-auto md:before:translate-x-0'}`}>
            {biography.education.map((item: any, idx: number) => (
              <TimelineItem key={idx} item={item} isSplit={hasEdu && hasExp} color="emerald" />
            ))}
          </div>
        </div>
      )}
      
      {hasExp && (
        <div>
          <h2 className="text-3xl font-black text-stone-900 mb-10 text-center tracking-tight">{t['Kinh nghiệm'] || 'Kinh nghiệm'}</h2>
          <div className={`space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-stone-200 ${hasEdu && hasExp ? 'md:before:ml-[1.125rem] md:before:-translate-x-px' : 'md:before:mx-auto md:before:translate-x-0'}`}>
            {biography.experience.map((item: any, idx: number) => (
              <TimelineItem key={idx} item={item} isSplit={hasEdu && hasExp} color="blue" />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TimelineItem({ item, isSplit = false, color = "emerald" }: { item: any, isSplit?: boolean, color?: "emerald" | "blue" }) {
  const isEmerald = color === "emerald";
  
  return (
    <div className={`relative flex items-center justify-between md:justify-normal ${!isSplit ? 'md:odd:flex-row-reverse' : ''} group is-active`}>
      {/* Timeline dot */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white ${isEmerald ? 'bg-[#059669]' : 'bg-[#2563eb]'} text-white shadow-md shrink-0 relative z-10 ${!isSplit ? 'md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2' : 'ml-0'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isEmerald ? (
            <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>
          ) : (
            <><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
          )}
        </svg>
      </div>
      
      {/* Content box */}
      <div className={`w-[calc(100%-4rem)] p-4 sm:p-6 transition-colors ${!isSplit ? 'md:w-[calc(50%-2.5rem)] text-left md:group-odd:text-right' : 'ml-4 sm:ml-6'}`}>
        <div className={`flex flex-col mb-2 ${!isSplit ? 'md:group-odd:items-end' : ''}`}>
          <span className={`text-sm font-bold mb-1 ${isEmerald ? 'text-[#059669]' : 'text-[#2563eb]'}`}>{item.time}</span>
          <h3 className="font-bold text-stone-900 text-lg sm:text-xl">{item.title}</h3>
        </div>
        <p className="text-stone-500 text-sm sm:text-base leading-relaxed whitespace-pre-line">{item.description}</p>
      </div>
    </div>
  );
}
"""
    with open('src/App.tsx', 'w') as f:
        f.writelines(lines[:start_idx])
        f.write(new_code)
    print("Successfully updated Bio and Timeline components to EOF")
else:
    print("Could not find start index")
