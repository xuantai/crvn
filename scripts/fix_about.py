with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """function PublicAboutView({ aboutMe }: any) {
  if (!aboutMe) return null;
  
  
  
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto bg-neutral-900 border border-white/10 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative z-10">
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
}"""

replacement = """function PublicAboutView({ aboutMe, data, t }: any) {
  if (!aboutMe) return null;
  
  const avatar = aboutMe.avatarUrl || data?.artistAvatar;
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] p-8 sm:p-12 mb-20 shadow-2xl relative z-10 text-stone-900">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
        {/* Left Side: Avatar with blue offset */}
        {avatar && (
          <div className="w-full max-w-sm lg:w-1/2 shrink-0 relative">
            <div className="absolute inset-0 bg-[#3b82f6] rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 -z-10"></div>
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-200">
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        
        {/* Right Side: Details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <span className="text-[#06b6d4] font-bold text-lg mb-2 tracking-wide">Profile Card</span>
          <h2 className="text-4xl sm:text-5xl font-black text-stone-900 mb-8">{t['Về Tôi'] || 'Về Tôi'}</h2>
          
          {aboutMe.intro && (
            <div className="mb-10 text-stone-600 text-xl leading-relaxed whitespace-pre-line font-medium">
              {aboutMe.intro}
            </div>
          )}
          
          <div className="space-y-5 mb-10 text-lg">
            {aboutMe.realName && <InfoField label={t["Tên Thật"] || "Tên Thật"} value={aboutMe.realName} />}
            {aboutMe.dob && <InfoField label={t["Ngày Sinh"] || "Ngày Sinh"} value={aboutMe.dob} />}
            {aboutMe.address && <InfoField label={t["Địa Chỉ"] || "Địa Chỉ"} value={aboutMe.address} />}
            {aboutMe.company && <InfoField label={t["Công Ty"] || "Công Ty"} value={aboutMe.company} />}
            {aboutMe.role && <InfoField label={t["Vai Trò"] || "Vai Trò"} value={aboutMe.role} />}
            {aboutMe.email && <InfoField label={t["Email"] || "Email"} value={aboutMe.email} />}
            {aboutMe.phone && <InfoField label={t["SĐT"] || "SĐT"} value={aboutMe.phone} />}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-10">
            {data?.socialFacebook && (
               <a href={data.socialFacebook} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
               </a>
            )}
            {data?.socialYoutube && (
               <a href={data.socialYoutube} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#FF0000] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
               </a>
            )}
            {data?.socialTiktok && (
               <a href={data.socialTiktok} target="_blank" rel="noreferrer" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.39.81-4.78 2.62-6.19 1.83-1.47 4.31-1.84 6.54-1.16l-.1 4.18c-1.3-.23-2.67-.18-3.79.52-1.07.69-1.67 1.92-1.57 3.18.11 1.4 1.16 2.61 2.53 2.94 1.34.33 2.82.02 3.86-.88.94-.8 1.4-2.01 1.43-3.26.04-4.8.01-9.61.02-14.41z"/></svg>
               </a>
            )}
            {data?.socialInstagram && (
               <a href={data.socialInstagram} target="_blank" rel="noreferrer" className="w-10 h-10 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform overflow-hidden" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
               </a>
            )}
            {data?.socialSoundcloud && (
               <a href={data.socialSoundcloud} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#ff5500] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.758 15.864V8.895c.27-.058.536-.089.8-.089.704 0 1.258.219 1.663.655.405.436.608 1.054.608 1.854v4.549h-3.071zm9.896-1.503c0 1.139-.395 2.112-1.187 2.918-.792.807-1.748 1.21-2.868 1.21H15.11v-7.616c0-.987-.272-1.792-.816-2.414-.544-.622-1.267-.933-2.171-.933-.427 0-.822.062-1.186.187v-1.12c0-.521-.141-1.042-.423-1.564-.282-.522-.72-1.002-1.314-1.441-1.116-.838-2.39-1.258-3.82-1.258-1.517 0-2.809.537-3.879 1.611-1.07 1.074-1.605 2.366-1.605 3.875 0 .204.015.421.044.653-.787.218-1.439.638-1.956 1.26-.518.622-.777 1.348-.777 2.179 0 .91.319 1.685.956 2.325.637.639 1.411.959 2.322.959h10.963c.691 0 1.285-.245 1.78-.735.495-.49.743-1.082.743-1.776z"/></svg>
               </a>
            )}
          </div>
          
          <div>
             <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 px-8 rounded-full shadow-[0_8px_16px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 text-lg">
                {t["Hình Ảnh"] || "Hình Ảnh"}
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex font-medium text-stone-700">
      <span className="font-bold w-28 shrink-0">{label}</span>
      <span className="mx-2">:</span>
      <span className="text-stone-500 flex-1">{value}</span>
    </div>
  );
}"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed about view layout")
else:
    print("Could not find about view target")
