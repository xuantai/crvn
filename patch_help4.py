import sys

with open("src/components/HelpPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add new icons
content = content.replace(
    "import { ChevronRight, Settings, LogIn, FileText, Layout, Copy, Repeat, Lock, Link as LinkIcon, Save, Eye, Plus, ChevronLeft, Globe } from 'lucide-react';",
    "import { ChevronRight, Settings, LogIn, FileText, Layout, Copy, Repeat, Lock, Link as LinkIcon, Save, Eye, Plus, ChevronLeft, Globe, Camera, X } from 'lucide-react';"
)

# Replace state block
state_target = """  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [extension, setExtension] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(TEMPLATES[0].id);"""

state_repl = """  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [extension, setExtension] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarProgress, setAvatarProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(TEMPLATES[0].id);"""
content = content.replace(state_target, state_repl)

# Replace useEffect block
useEffect_target = """      if (data.isAdmin && data.artist) {
        setArtistData(data.artist);
        setEmail(data.artist.email || '');
        setUsername(data.artist.pendingUsernameChange || data.artist.username || '');
        setExtension(data.artist.pendingExtensionChange || data.artist.extension || '');
      } else {"""
useEffect_repl = """      if (data.isAdmin && data.artist) {
        setArtistData(data.artist);
        setEmail(data.artist.email || '');
        setUsername(data.artist.pendingUsernameChange || data.artist.username || '');
        setExtension(data.artist.pendingExtensionChange || data.artist.extension || '');
        setArtistName(data.artist.pendingNameChange || data.artist.artistName || '');
        
        fetch('/api/data', {
          headers: { 'x-artist-extension': ext }
        }).then(r => r.json()).then(d => {
           setAvatarUrl(d.aboutMe?.avatarUrl || d.homeCoverUrl || '');
        }).catch(() => {});
      } else {"""
content = content.replace(useEffect_target, useEffect_repl)

# Update handleProfileSave
handleProfileSave_target = """        body: JSON.stringify({ username, extension })"""
handleProfileSave_repl = """        body: JSON.stringify({ artistName, username, extension })"""
content = content.replace(handleProfileSave_target, handleProfileSave_repl)

# Add helper functions and change password logic
helper_injection = """  const handleProfileSave = async (e: React.FormEvent) => {"""
helper_repl = """
  const uploadWithProgress = async (file: File, onProgress: (p: number) => void) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-artist-extension', ext);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const resp = JSON.parse(xhr.responseText);
            resolve(resp.url);
          } catch (e) { reject(e); }
        } else {
          reject('Upload failed');
        }
      };
      xhr.onerror = () => reject('Network error');
      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarProgress(1);
      const url = await uploadWithProgress(file, setAvatarProgress);
      setAvatarUrl(url);
      await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-artist-extension': ext
        },
        body: JSON.stringify({ homeCoverUrl: url })
      });
      setAvatarProgress(0);
    } catch(err) {
      console.error(err);
      setAvatarProgress(0);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setPasswordError('Lỗi kết nối');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {"""
content = content.replace(helper_injection, helper_repl)

# Replace Account Settings HTML
account_target = """              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mb-8">
                <h3 className="text-lg font-black text-neutral-900 mb-4">Địa chỉ Email</h3>
                <form onSubmit={handleEmailSave} className="space-y-4 max-w-md">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                      placeholder="Nhập email..."
                      required
                    />
                  </div>
                  {emailError && <div className="text-red-600 text-xs font-bold">{emailError}</div>}
                  {emailSuccess && <div className="text-emerald-600 text-xs font-bold">{emailSuccess}</div>}
                  <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                    Lưu Email
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
                <h3 className="text-lg font-black text-neutral-900 mb-1">Username & Phần mở rộng</h3>
                <p className="text-xs text-neutral-500 mb-6">Lưu ý: Thay đổi Username hoặc Phần mở rộng sẽ cần quản trị viên duyệt.</p>
                <form onSubmit={handleProfileSave} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Username đăng nhập</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Phần mở rộng (Link)</label>
                    <input
                      type="text"
                      value={extension}
                      onChange={e => setExtension(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                      required
                    />
                    <div className="mt-2 text-xs text-neutral-500">Link hiện tại: <span className="font-bold text-black">{artistData?.extension}.chorus.vn</span></div>
                  </div>
                  {profileError && <div className="text-red-600 text-xs font-bold">{profileError}</div>}
                  {profileSuccess && <div className="text-emerald-600 text-xs font-bold">{profileSuccess}</div>}
                  <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                    Lưu Thay Đổi
                  </button>
                </form>
              </div>"""

account_repl = """              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mb-8">
                <h3 className="text-lg font-black text-neutral-900 mb-4">Avatar Nghệ Sĩ</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-neutral-100 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-neutral-400 text-3xl font-black">{artistData?.artistName?.charAt(0) || artistData?.username?.charAt(0)}</span>
                      )}
                    </div>
                    {avatarProgress > 0 && avatarProgress < 100 && (
                      <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center font-bold text-xs text-black">
                        {avatarProgress}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input type="file" id="avatarUploadHelp" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <button 
                      type="button"
                      onClick={() => document.getElementById('avatarUploadHelp')?.click()} 
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Thay Đổi Avatar
                    </button>
                    <p className="text-xs text-neutral-500">Hỗ trợ JPG, PNG. Khuyến nghị 500x500px.</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 h-full">
                    <h3 className="text-lg font-black text-neutral-900 mb-6">Thông Tin Cơ Bản</h3>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Nghệ Danh</label>
                        <input
                          type="text"
                          value={artistName}
                          onChange={e => setArtistName(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Username đăng nhập</label>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Phần mở rộng (Link)</label>
                        <input
                          type="text"
                          value={extension}
                          onChange={e => setExtension(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                          required
                        />
                        <div className="mt-2 text-[11px] text-neutral-500">Đang dùng: <span className="font-bold text-black">{artistData?.extension}.chorus.vn</span></div>
                      </div>
                      {profileError && <div className="text-red-600 text-xs font-bold">{profileError}</div>}
                      {profileSuccess && <div className="text-emerald-600 text-xs font-bold">{profileSuccess}</div>}
                      <button type="submit" className="w-full bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                        Lưu Thông Tin
                      </button>
                    </form>
                  </div>
                  
                  <div className="flex flex-col gap-8">
                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 flex-1">
                        <h3 className="text-lg font-black text-neutral-900 mb-6">Đổi Mật Khẩu</h3>
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                          <div>
                            <input
                              type="password"
                              value={oldPassword}
                              onChange={e => setOldPassword(e.target.value)}
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                              placeholder="Mật khẩu hiện tại..."
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                              placeholder="Mật khẩu mới..."
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                              placeholder="Xác nhận mật khẩu mới..."
                              required
                            />
                          </div>
                          {passwordError && <div className="text-red-600 text-xs font-bold">{passwordError}</div>}
                          {passwordSuccess && <div className="text-emerald-600 text-xs font-bold">{passwordSuccess}</div>}
                          <button type="submit" className="w-full bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                            Đổi Mật Khẩu
                          </button>
                        </form>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 shrink-0">
                        <h3 className="text-sm font-black text-neutral-900 mb-4">Địa chỉ Email</h3>
                        <form onSubmit={handleEmailSave} className="space-y-3">
                          <div>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium"
                              placeholder="Nhập email..."
                              required
                            />
                          </div>
                          {emailError && <div className="text-red-600 text-xs font-bold">{emailError}</div>}
                          {emailSuccess && <div className="text-emerald-600 text-xs font-bold">{emailSuccess}</div>}
                          <button type="submit" className="w-full bg-white text-black border border-neutral-200 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                            Cập Nhật
                          </button>
                        </form>
                      </div>
                  </div>
              </div>"""
content = content.replace(account_target, account_repl)

# Replace Login Info HTML
login_target = """              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 max-w-md">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-neutral-400 font-bold mb-1">Tên đăng nhập:</div>
                    <div className="text-lg font-black text-black bg-neutral-50 p-3 rounded-xl border border-neutral-100">{artistData?.username}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 font-bold mb-1">Email:</div>
                    <div className="text-lg font-black text-black bg-neutral-50 p-3 rounded-xl border border-neutral-100">{artistData?.email || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>"""

login_repl = """              <div className="bg-[#111] rounded-2xl p-6 shadow-2xl border border-neutral-800 max-w-xl font-mono text-[13px] sm:text-sm">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                  <h3 className="text-white font-bold">Thông tin kho nhạc nghệ sĩ {artistData?.artistName || artistData?.username}</h3>
                  <button 
                    onClick={() => {
                        const txt = `Nghệ danh: ${artistData?.artistName || artistData?.username}\\nUsername: ${artistData?.username}\\nWebsite: ${artistData?.extension}.chorus.vn\\nAdmin: ${artistData?.extension}.chorus.vn/admin\\nAdmin User: ${artistData?.username}`;
                        navigator.clipboard.writeText(txt);
                    }}
                    className="text-neutral-500 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-800 p-2 rounded-lg"
                    title="Copy info"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4 text-neutral-300">
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Nghệ danh:</span>
                    <span className="font-bold text-white">{artistData?.artistName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Username:</span>
                    <span className="font-bold text-white">{artistData?.username}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4 mt-6 mb-2">
                    <span className="w-28 text-neutral-500 shrink-0">Website:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">{artistData?.extension}.chorus.vn</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Admin:</span>
                    <a href={`https://${artistData?.extension}.chorus.vn/admin`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 hover:underline">{artistData?.extension}.chorus.vn/admin</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-28 text-neutral-500 shrink-0">Admin User:</span>
                    <span className="font-bold text-white">{artistData?.username}</span>
                  </div>
                </div>
              </div>"""
content = content.replace(login_target, login_repl)

with open("src/components/HelpPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("HelpPage patched part 4")
