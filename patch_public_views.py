import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

components = """
function PublicNavbar({ menus, activeTab, setActiveTab, t }: any) {
  if (!menus || menus.length === 0) return null;
  const visibleMenus = menus.filter((m: any) => m.isVisible);
  if (visibleMenus.length <= 1) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-12 mb-12 flex items-center justify-center gap-6 sm:gap-10 border-b border-white/10 pb-4">
      {visibleMenus.map((m: any) => (
        <button
          key={m.id}
          onClick={() => {
            if (m.type === 'custom' && m.link) {
              window.open(m.link, '_blank');
            } else {
              setActiveTab(m.id);
            }
          }}
          className={`font-bold transition-all relative text-sm sm:text-base ${
            activeTab === m.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {m.title}
          {activeTab === m.id && (
            <motion.div layoutId="nav-indicator" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-emerald-500" />
          )}
        </button>
      ))}
    </div>
  );
}

function PublicAboutView({ aboutMe }: any) {
  if (!aboutMe) return null;
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto bg-neutral-900 border border-white/10 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative z-10">
      {aboutMe.avatarUrl && (
        <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-full overflow-hidden mb-8 border-4 border-neutral-800 shadow-xl">
          <img src={aboutMe.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      {aboutMe.intro && (
        <div className="mb-10 text-neutral-300 text-lg leading-relaxed text-center whitespace-pre-line">
          {aboutMe.intro}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        {aboutMe.realName && <InfoField label="Tên Thật" value={aboutMe.realName} />}
        {aboutMe.dob && <InfoField label="Ngày Sinh" value={aboutMe.dob} />}
        {aboutMe.address && <InfoField label="Địa Chỉ" value={aboutMe.address} />}
        {aboutMe.company && <InfoField label="Công Ty" value={aboutMe.company} />}
        {aboutMe.role && <InfoField label="Vai Trò" value={aboutMe.role} />}
        {aboutMe.email && <InfoField label="Email" value={aboutMe.email} />}
        {aboutMe.phone && <InfoField label="SĐT" value={aboutMe.phone} />}
      </div>
    </motion.div>
  );
}

function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col border-b border-white/5 pb-3">
      <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className="text-white font-medium text-lg">{value}</span>
    </div>
  );
}

function PublicBioView({ biography, t }: any) {
  if (!biography) return null;
  
  const hasEdu = biography.education?.length > 0;
  const hasExp = biography.experience?.length > 0;
  
  if (!hasEdu && !hasExp) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-20 mb-20 relative z-10 px-6 sm:px-0">
      {hasEdu && (
        <div>
          <h2 className="text-3xl font-black text-white mb-10 text-center tracking-tight">{t("Học Vấn")}</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
            {biography.education.map((item: any, idx: number) => (
              <TimelineItem key={idx} item={item} />
            ))}
          </div>
        </div>
      )}
      
      {hasExp && (
        <div>
          <h2 className="text-3xl font-black text-white mb-10 text-center tracking-tight">{t("Kinh nghiệm")}</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
            {biography.experience.map((item: any, idx: number) => (
              <TimelineItem key={idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TimelineItem({ item }: { item: any }) {
  return (
    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
      {/* Timeline dot */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-neutral-950 bg-neutral-800 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* Content box */}
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-neutral-900 border border-white/5 shadow-xl hover:border-white/10 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h3 className="font-bold text-white text-lg">{item.title}</h3>
          <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg self-start sm:self-auto shrink-0">{item.time}</span>
        </div>
        <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
      </div>
    </div>
  );
}
"""

content = content + "\n" + components

with open('src/App.tsx', 'w') as f:
    f.write(content)

