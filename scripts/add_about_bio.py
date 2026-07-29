import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I will write the handleCustomSave function
handle_custom_save = """
  const handleCustomSave = async (payloadToMerge: any) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify(payloadToMerge)
      });
      const resData = await res.json();
      if (res.ok) {
        setToast(t("Đã lưu cấu hình!"));
        setData(resData);
      } else {
        setToast(resData.error || t("Có lỗi xảy ra"));
      }
    } catch (e: any) {
      setToast(t("Lỗi kết nối"));
    }
  };
"""

# inject it after handleProfileSave declaration
# we can inject it right before `const copySocialLink`
content = content.replace("const copySocialLink", handle_custom_save + "\n  const copySocialLink")

# Also inject AdminAboutEdit, AdminBioEdit, and AdminMenuEdit at the end of the file.
components = """
function AdminAboutEdit({ data, t, onSave }: any) {
  const [aboutData, setAboutData] = useState(data.aboutMe || {});
  
  const handleSave = (e: any) => {
    e.preventDefault();
    onSave({ aboutMe: aboutData });
  };

  const handleChange = (field: string) => (e: any) => {
    setAboutData({ ...aboutData, [field]: e.target.value });
  };

  return (
    <motion.div key="about" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl pb-10">
        <h2 className="text-2xl font-bold mb-8">{t("Về Tôi")}</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">{t("Giới thiệu nghệ sĩ")}</label>
            <textarea value={aboutData.intro || ''} onChange={handleChange('intro')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 min-h-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Tên Thật")}</label>
              <input value={aboutData.realName || ''} onChange={handleChange('realName')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Ngày Sinh")}</label>
              <input value={aboutData.dob || ''} onChange={handleChange('dob')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Địa Chỉ")}</label>
              <input value={aboutData.address || ''} onChange={handleChange('address')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Công Ty")}</label>
              <input value={aboutData.company || ''} onChange={handleChange('company')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Vai Trò")}</label>
              <input value={aboutData.role || ''} onChange={handleChange('role')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("Email")}</label>
              <input value={aboutData.email || ''} onChange={handleChange('email')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">{t("SĐT")}</label>
              <input value={aboutData.phone || ''} onChange={handleChange('phone')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh đại diện (About Avatar)</label>
            <input value={aboutData.avatarUrl || ''} onChange={handleChange('avatarUrl')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="URL ảnh" />
          </div>
          
          <button type="submit" className="bg-stone-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-stone-800 transition-colors w-full cursor-pointer">{t("Lưu cài đặt")}</button>
        </form>
      </div>
    </motion.div>
  );
}

function AdminBioEdit({ data, t, onSave }: any) {
  const [education, setEducation] = useState<any[]>(data.biography?.education || []);
  const [experience, setExperience] = useState<any[]>(data.biography?.experience || []);

  const handleSave = (e: any) => {
    e.preventDefault();
    onSave({ biography: { education, experience } });
  };

  const addEdu = () => {
    if (education.length < 20) setEducation([...education, { time: '', title: '', description: '' }]);
  };
  const addExp = () => {
    if (experience.length < 20) setExperience([...experience, { time: '', title: '', description: '' }]);
  };

  const updateEdu = (idx: number, field: string, val: string) => {
    const newEdu = [...education];
    newEdu[idx][field] = val;
    setEducation(newEdu);
  };
  
  const updateExp = (idx: number, field: string, val: string) => {
    const newExp = [...experience];
    newExp[idx][field] = val;
    setExperience(newExp);
  };

  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const removeExp = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));

  return (
    <motion.div key="bio" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl pb-10">
        <h2 className="text-2xl font-bold mb-8">{t("Tiểu Sử")}</h2>
        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Education section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-800">{t("Học Vấn")}</h3>
              <button type="button" onClick={addEdu} className="flex items-center gap-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> {t("Thêm giai đoạn")}
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Thời gian")}</label>
                        <input value={edu.time} onChange={(e) => updateEdu(idx, 'time', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400" placeholder="VD: 2009-2012" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Sự Kiện")}</label>
                        <input value={edu.title} onChange={(e) => updateEdu(idx, 'title', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400" placeholder="VD: THPT Chuyên..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">{t("Mô tả")}</label>
                      <textarea value={edu.description} onChange={(e) => updateEdu(idx, 'description', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400 min-h-[60px]" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeEdu(idx)} className="text-stone-400 hover:text-red-500 self-start p-2 cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-800">{t("Kinh nghiệm")}</h3>
              <button type="button" onClick={addExp} className="flex items-center gap-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> {t("Thêm giai đoạn")}
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Thời gian")}</label>
                        <input value={exp.time} onChange={(e) => updateExp(idx, 'time', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400" placeholder="VD: 2025" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Sự Kiện")}</label>
                        <input value={exp.title} onChange={(e) => updateExp(idx, 'title', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">{t("Mô tả")}</label>
                      <textarea value={exp.description} onChange={(e) => updateExp(idx, 'description', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-400 min-h-[60px]" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeExp(idx)} className="text-stone-400 hover:text-red-500 self-start p-2 cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="bg-stone-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-stone-800 transition-colors w-full cursor-pointer">{t("Lưu cài đặt")}</button>
        </form>
      </div>
    </motion.div>
  );
}

function AdminMenuEdit({ data, t, onSave }: any) {
  const [menus, setMenus] = useState<any[]>(data.menus || [
    { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
  ]);

  const handleDragStart = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDrop = (e: any, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;
    const newMenus = [...menus];
    const draggedItem = newMenus[dragIndex];
    newMenus.splice(dragIndex, 1);
    newMenus.splice(dropIndex, 0, draggedItem);
    setMenus(newMenus);
  };

  const handleSave = () => {
    onSave({ menus });
  };
  
  const addCustomMenu = () => {
    const customCount = menus.filter((m: any) => m.type === 'custom').length;
    if (customCount >= 3) {
      alert("Tối đa 3 custom tab");
      return;
    }
    setMenus([...menus, { id: 'c' + Date.now(), type: 'custom', title: 'Tab Mới', link: '', isVisible: true }]);
  };

  const updateMenu = (idx: number, field: string, val: any) => {
    const newMenus = [...menus];
    newMenus[idx][field] = val;
    setMenus(newMenus);
  };

  const removeMenu = (idx: number) => {
    setMenus(menus.filter((_, i) => i !== idx));
  };

  return (
    <div className="mt-10 border-t border-stone-200 pt-8">
      <h3 className="text-xl font-bold mb-4">{t("Quản lý Menu")}</h3>
      <p className="text-sm text-stone-500 mb-6">Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.</p>
      
      <div className="space-y-3 mb-6">
        {menus.map((m: any, i: number) => (
          <div 
            key={m.id} 
            draggable 
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
            className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="text-stone-400 w-5 h-5 shrink-0" />
            <div className="flex-1 flex gap-4 items-center">
              <input 
                value={m.title} 
                onChange={(e) => updateMenu(i, 'title', e.target.value)} 
                className="font-bold bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                placeholder={t("Tiêu Đề Menu")}
              />
              {m.type === 'custom' && (
                <input 
                  value={m.link || ''} 
                  onChange={(e) => updateMenu(i, 'link', e.target.value)} 
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                  placeholder={t("Đường Dẫn (URL)")}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
               <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                 <input type="checkbox" checked={m.isVisible} onChange={(e) => updateMenu(i, 'isVisible', e.target.checked)} className="rounded text-stone-900 focus:ring-stone-900" />
                 Hiển thị
               </label>
               {m.type === 'custom' && (
                 <button type="button" onClick={() => removeMenu(i)} className="text-stone-400 hover:text-red-500 p-1">
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4">
        <button type="button" onClick={addCustomMenu} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> {t("Thêm Menu Mới")}
        </button>
        <button type="button" onClick={handleSave} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer">
          {t("Lưu Menu")}
        </button>
      </div>
    </div>
  );
}
"""

content = content + "\n" + components

with open('src/App.tsx', 'w') as f:
    f.write(content)

