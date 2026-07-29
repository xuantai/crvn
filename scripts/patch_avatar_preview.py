import sys

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject state into AdminDashboard
dashboard_state_target = """  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');"""
dashboard_state_repl = """  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');"""
content = content.replace(dashboard_state_target, dashboard_state_repl)

# 2. Update AdminAboutEdit call in AdminDashboard
about_edit_call_target = """<AdminAboutEdit data={data} t={t} onSave={handleCustomSave} uploadWithProgress={uploadWithProgress} getPreviewUrl={getPreviewUrl} />"""
about_edit_call_repl = """<AdminAboutEdit 
  data={data} 
  t={t} 
  onSave={(newData: any) => { setPreviewAvatar(null); handleCustomSave(newData); }} 
  uploadWithProgress={uploadWithProgress} 
  getPreviewUrl={getPreviewUrl} 
  onPreviewAvatar={(url: string | null) => setPreviewAvatar(url)}
/>"""
content = content.replace(about_edit_call_target, about_edit_call_repl)

# 3. Update img src in AdminDashboard sidebar
sidebar_avatar_target = """src={data?.aboutMe?.avatarUrl || data?.homeCoverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80"}"""
sidebar_avatar_repl = """src={(previewAvatar !== null ? previewAvatar : (data?.aboutMe?.avatarUrl || data?.homeCoverUrl)) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80"}"""
content = content.replace(sidebar_avatar_target, sidebar_avatar_repl)

# 4. Update AdminAboutEdit signature
about_edit_sig_target = """function AdminAboutEdit({ data, t, onSave, uploadWithProgress, getPreviewUrl }: any) {"""
about_edit_sig_repl = """function AdminAboutEdit({ data, t, onSave, uploadWithProgress, getPreviewUrl, onPreviewAvatar }: any) {"""
content = content.replace(about_edit_sig_target, about_edit_sig_repl)

# 5. Call onPreviewAvatar when uploading
upload_avatar_target = """setAboutData({ ...aboutData, avatarUrl: url });"""
upload_avatar_repl = """setAboutData({ ...aboutData, avatarUrl: url });
                          if (onPreviewAvatar) onPreviewAvatar(url);"""
content = content.replace(upload_avatar_target, upload_avatar_repl)

# 6. Call onPreviewAvatar when removing via X
remove_avatar_target = """setAboutData({ ...aboutData, avatarUrl: '' }); setAvatarProgress(0); (document.getElementById('aboutAvatarUpload') as HTMLInputElement).value = '';"""
remove_avatar_repl = """setAboutData({ ...aboutData, avatarUrl: '' }); setAvatarProgress(0); (document.getElementById('aboutAvatarUpload') as HTMLInputElement).value = ''; if (onPreviewAvatar) onPreviewAvatar('');"""
content = content.replace(remove_avatar_target, remove_avatar_repl)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patched avatar preview successfully!")
