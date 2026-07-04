import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X,
  LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home
} from 'lucide-react';

interface Artist {
  artistName: string;
  username: string;
  extension: string;
  password: string;
  verified: boolean;
  isPublic?: boolean;
  dbConfig?: string;
  pendingNameChange?: string;
  hasExternalWebsite?: boolean;
  externalWebsiteUrl?: string;
  customDomain?: string;
}

export default function ACPControlPanel() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('masterToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');

  // ACP Navigation / Tab system
  const [activeTab, setActiveTab] = useState<'artists' | 'landing'>('artists');

  // ACP data
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  // Form states (Artist)
  const [artistName, setArtistName] = useState('');
  const [artistUsername, setArtistUsername] = useState('');
  const [artistExtension, setArtistExtension] = useState('');
  const [artistPassword, setArtistPassword] = useState('');
  const [artistVerified, setArtistVerified] = useState(true);
  const [artistIsPublic, setArtistIsPublic] = useState(true);
  const [artistDbConfig, setArtistDbConfig] = useState('');
  const [artistHasExternalWebsite, setArtistHasExternalWebsite] = useState(false);
  const [artistExternalWebsiteUrl, setArtistExternalWebsiteUrl] = useState('');
  const [formErr, setFormErr] = useState('');

  // Form states (Landing Config)
  const [landingTagline, setLandingTagline] = useState('');
  const [landingHeroTitle, setLandingHeroTitle] = useState('');
  const [landingHeroSubtitle, setLandingHeroSubtitle] = useState('');
  const [landingHeroDesc, setLandingHeroDesc] = useState('');
  const [landingFooterText, setLandingFooterText] = useState('');
  const [systemIp, setSystemIp] = useState('');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  
  // Feature section states
  const [feature1Title, setFeature1Title] = useState('');
  const [feature1Desc, setFeature1Desc] = useState('');
  const [feature2Title, setFeature2Title] = useState('');
  const [feature2Desc, setFeature2Desc] = useState('');
  const [feature3Title, setFeature3Title] = useState('');
  const [feature3Desc, setFeature3Desc] = useState('');
  const [feature4Title, setFeature4Title] = useState('');
  const [feature4Desc, setFeature4Desc] = useState('');

  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [landingSuccessMsg, setLandingSuccessMsg] = useState('');
  const [subscribers, setSubscribers] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      fetchArtists();
      fetchLandingConfig();
      fetchSubscribers();
    }
  }, [token]);

  const fetchArtists = async () => {
    try {
      const res = await fetch('/api/acp/artists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      } else {
        // Token might have expired
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/acp/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLandingConfig = async () => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLandingTagline(data.tagline || '');
        setLandingHeroTitle(data.heroTitle || 'Chorus');
        setLandingHeroSubtitle(data.heroSubtitle || 'Nơi những ca khúc khởi đầu.');
        setLandingHeroDesc(data.heroDescription || '');
        setLandingFooterText(data.footerText || '');
        setSystemIp(data.systemIp || '');
        setCloudSyncEnabled(data.cloudSyncEnabled !== false);
        setFeature1Title(data.feature1Title || 'Bảo mật demo & tuyển tập');
        setFeature1Desc(data.feature1Desc || 'Thiết lập mật mã cho từng tác phẩm chưa công bố, ngăn chặn nghe trộm hoặc chia sẻ trái phép. Gửi link demo bảo mật cho ca sĩ, nhạc sĩ phối khí và các đối tác đáng tin cậy.');
        setFeature2Title(data.feature2Title || 'Dịch thuật thông minh (AI Translation)');
        setFeature2Desc(data.feature2Desc || 'Nhận diện vị trí địa lý của khán giả quốc tế để hiển thị tiêu đề và nội dung mô tả sản phẩm bằng ngôn ngữ bản địa phù hợp nhất (Anh, Nhật, Trung, Hàn...).');
        setFeature3Title(data.feature3Title || 'Đồng bộ Cloud & Cache cục bộ');
        setFeature3Desc(data.feature3Desc || 'Lưu trữ dữ liệu kép trên Cloud Firestore chất lượng cao kết hợp cơ chế dự phòng cục bộ. Cam kết phát nhạc ổn định, tốc độ load nhanh ngay cả khi internet quốc tế gặp sự cố.');
        setFeature4Title(data.feature4Title || 'Bố cục mang đậm dấu ấn cá nhân');
        setFeature4Desc(data.feature4Desc || 'Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/acp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('masterToken', data.token);
        setToken(data.token);
      } else {
        setLoginErr(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginErr('Không thể kết nối với máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('masterToken');
    setToken(null);
    fetch('/api/acp/logout', { method: 'POST' }).catch(() => {});
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');
    
    if (!artistName || !artistUsername || !artistExtension || !artistPassword) {
      setFormErr('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      const res = await fetch('/api/acp/artists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artistName,
          username: artistUsername,
          extension: artistExtension,
          password: artistPassword,
          verified: artistVerified,
          isPublic: artistIsPublic,
          dbConfig: artistDbConfig,
          hasExternalWebsite: artistHasExternalWebsite,
          externalWebsiteUrl: artistExternalWebsiteUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchArtists();
      } else {
        setFormErr(data.error || 'Lỗi khi tạo nghệ sĩ');
      }
    } catch (err) {
      setFormErr('Lỗi kết nối máy chủ!');
    }
  };

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr('');

    if (!editingArtist) return;

    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUsername: editingArtist.username,
          artistName,
          extension: artistExtension,
          password: artistPassword,
          verified: artistVerified,
          isPublic: artistIsPublic,
          dbConfig: artistDbConfig,
          hasExternalWebsite: artistHasExternalWebsite,
          externalWebsiteUrl: artistExternalWebsiteUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        setEditingArtist(null);
        resetForm();
        fetchArtists();
      } else {
        setFormErr(data.error || 'Lỗi khi cập nhật nghệ sĩ');
      }
    } catch (err) {
      setFormErr('Lỗi kết nối máy chủ!');
    }
  };

  const handleApproveNameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi tên này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveNameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi tên nghệ sĩ!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể duyệt yêu cầu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleRejectNameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi tên này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectNameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi tên nghệ sĩ!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể từ chối yêu cầu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleApproveUsernameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi username này? Sẽ thay đổi đường dẫn của nghệ sĩ!')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveUsernameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi username!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể duyệt yêu cầu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleRejectUsernameChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi username này?')) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectUsernameChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi username!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Không thể từ chối yêu cầu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleDeleteArtist = async (username: string) => {
    if (username === 'acxuantai') {
      alert('Không thể xóa tài khoản master acxuantai!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA nghệ sĩ "${username}"? Toàn bộ file cấu hình của họ sẽ bị xóa.`)) return;

    try {
      const res = await fetch('/api/acp/artists/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (res.ok) {
        fetchArtists();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi xóa nghệ sĩ');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleSaveLandingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLanding(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tagline: landingTagline,
          heroTitle: landingHeroTitle,
          heroSubtitle: landingHeroSubtitle,
          heroDescription: landingHeroDesc,
          footerText: landingFooterText,
          systemIp,
          feature1Title,
          feature1Desc,
          feature2Title,
          feature2Desc,
          feature3Title,
          feature3Desc,
          feature4Title,
          feature4Desc,
          cloudSyncEnabled
        })
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã lưu cấu hình trang chủ thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 3000);
        fetchLandingConfig();
      } else {
        alert('Lỗi khi lưu cấu hình trang chủ');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsSavingLanding(false);
    }
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistName(artist.artistName);
    setArtistUsername(artist.username);
    setArtistExtension(artist.extension);
    setArtistPassword(artist.password);
    setArtistVerified(artist.verified);
    setArtistIsPublic(artist.isPublic !== false);
    setArtistDbConfig(artist.dbConfig || '');
    setArtistHasExternalWebsite(!!artist.hasExternalWebsite);
    setArtistExternalWebsiteUrl(artist.externalWebsiteUrl || '');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setArtistName('');
    setArtistUsername('');
    setArtistExtension('');
    setArtistPassword('');
    setArtistVerified(true);
    setArtistIsPublic(true);
    setArtistDbConfig('');
    setArtistHasExternalWebsite(false);
    setArtistExternalWebsiteUrl('');
    setFormErr('');
  };

  const filteredArtists = artists.filter(a => 
    a.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.extension.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none"></div>

        <div className="relative bg-neutral-900/50 border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-bold mb-1.5 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {loginErr && (
              <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-xl px-3 border border-rose-500/15">
                {loginErr}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Đang xác minh...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top navbar */}
      <header className="border-b border-white/5 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">Chorus.vn ACP</h1>
              <p className="text-[10px] text-purple-400 font-mono">Master Administrator Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="/"
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white py-2 px-4 rounded-xl text-xs transition-all font-bold cursor-pointer"
            >
              <Home className="w-4 h-4 text-purple-400" /> Trang chủ
            </a>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white py-2 px-4 rounded-xl text-xs transition-all font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Selection Navigation */}
        <div className="flex border-b border-white/5 mb-8">
          <button
            onClick={() => setActiveTab('artists')}
            className={`py-4 px-6 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'artists'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý nghệ sĩ</span>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`py-4 px-6 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'landing'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Cấu hình trang chủ</span>
          </button>
        </div>

        {activeTab === 'artists' ? (
          <>
            {/* Banner stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-purple-500/10"><Users className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Tổng Số Nghệ Sĩ</p>
                <h3 className="text-3xl font-black">{artists.length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-sky-500/10"><CheckCircle className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Xác Thực (Tích Xanh)</p>
                <h3 className="text-3xl font-black text-sky-400">{artists.filter(a => a.verified).length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-emerald-500/10"><Globe className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Công Khai (Trang chủ)</p>
                <h3 className="text-3xl font-black text-emerald-400">{artists.filter(a => a.isPublic !== false).length}</h3>
              </div>

              <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-6 right-6 text-pink-500/10"><RefreshCw className="w-16 h-16" /></div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Thay Đổi Tên</p>
                <h3 className="text-3xl font-black text-pink-400">{artists.filter(a => !!a.pendingNameChange).length}</h3>
              </div>
            </div>

            {/* Filters and Add button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm nghệ sĩ theo tên, username, extension..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/60 border border-white/5 py-3 pl-11 pr-4 rounded-2xl text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-neutral-500 transition-all"
                />
              </div>

              <button 
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold py-3 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Thêm Nghệ Sĩ Mới
              </button>
            </div>

            {/* Artist Table / Grid */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
              {filteredArtists.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Không tìm thấy nghệ sĩ nào phù hợp.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-neutral-900/50">
                        <th className="p-4 pl-6 text-xs text-neutral-400 uppercase font-bold tracking-wider">Nghệ Sĩ</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Username</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Hiển thị</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Mật khẩu</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Database</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider text-right pr-6">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredArtists.map((artist) => (
                        <tr key={artist.username} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2.5">
                              <div>
                                <div className="font-bold flex items-center gap-1.5">
                                  {artist.artistName}
                                  {artist.verified && (
                                    <span className="bg-sky-500/15 text-sky-400 p-0.5 rounded-full inline-block border border-sky-500/20" title="Đã xác thực">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                  )}
                                </div>
                                
                                {/* Pending name change badge */}
                                {artist.pendingNameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi thành: "{artist.pendingNameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveNameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectNameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                                {artist.pendingUsernameChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi Username thành: "{artist.pendingUsernameChange}"</span>
                                    <button 
                                      onClick={() => handleApproveUsernameChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectUsernameChange(artist.username)}
                                      className="bg-red-500 text-white p-0.5 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                                      title="Từ chối"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-mono text-neutral-400">{artist.username}</td>
                          <td className="p-4 text-sm">
                            <div className="flex flex-col gap-1">
                              <a 
                                href={`/${artist.extension}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                chorus.vn/{artist.extension}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <a 
                                href={`https://${artist.extension}.chorus.vn`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-teal-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                {artist.extension}.chorus.vn
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            {artist.isPublic !== false ? (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                Công khai
                              </span>
                            ) : (
                              <span className="bg-neutral-800 border border-white/5 text-neutral-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                Ẩn
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-mono text-neutral-400">{artist.password}</td>
                          <td className="p-4">
                            {artist.dbConfig ? (
                              <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/15 text-purple-400 px-2 py-0.5 rounded-lg text-[10px] w-fit font-mono font-bold">
                                <Database className="w-3 h-3" /> Custom DB
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-600">Mặc định (Local)</span>
                            )}
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(artist)}
                                className="p-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteArtist(artist.username)}
                                disabled={artist.username === 'acxuantai'}
                                className={`p-2 rounded-xl transition-colors ${
                                  artist.username === 'acxuantai' 
                                    ? 'opacity-20 cursor-not-allowed text-neutral-600' 
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer'
                                }`}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Homepage config panel tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Layout className="w-5.5 h-5.5 text-purple-400" />
                  <span>Cấu hình giao diện & mô tả Chorus.vn</span>
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Điều chỉnh tiêu đề, slogan, phần mô tả chính và chữ chân trang xuất hiện trên trang chủ.
                </p>
              </div>

              <form onSubmit={handleSaveLandingConfig} className="space-y-6">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Dòng giới thiệu nhỏ nổi bật (Tagline)
                  </label>
                  <input 
                    type="text" 
                    required
                    value={landingTagline}
                    onChange={(e) => setLandingTagline(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Kho lưu trữ và chia sẻ âm nhạc"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tiêu đề chính (Hero Title)
                    </label>
                    <input 
                      type="text" 
                      required
                      value={landingHeroTitle}
                      onChange={(e) => setLandingHeroTitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-bold"
                      placeholder="Chorus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Dòng phụ đề (Hero Subtitle)
                    </label>
                    <input 
                      type="text" 
                      required
                      value={landingHeroSubtitle}
                      onChange={(e) => setLandingHeroSubtitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Nơi những ca khúc khởi đầu."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Mô tả chi tiết trang chủ (Hero Description)
                  </label>
                  <textarea 
                    required
                    value={landingHeroDesc}
                    onChange={(e) => setLandingHeroDesc(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm h-32 leading-relaxed"
                    placeholder="Giải pháp hoàn hảo giúp các Nghệ sĩ tự do lưu trữ demo..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Chữ chân trang (Footer Text)
                  </label>
                  <input 
                    type="text" 
                    required
                    value={landingFooterText}
                    onChange={(e) => setLandingFooterText(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="CHORUS.VN © 2026 - Nơi những ca khúc bắt đầu."
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Địa chỉ IP hệ thống (System IP)
                  </label>
                  <input 
                    type="text" 
                    value={systemIp}
                    onChange={(e) => setSystemIp(e.target.value)}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="VD: 103.111.222.33"
                  />
                  <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed">
                    Dùng làm IP hướng dẫn để các nghệ sĩ trỏ bản ghi A (Custom Domain DNS) về hệ thống.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Cài đặt Đồng bộ Cloud
                  </h3>
                  <div className="flex items-start gap-4 bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox"
                        id="cloudSyncToggle"
                        checked={cloudSyncEnabled}
                        onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 text-purple-600 focus:ring-purple-500 bg-black/40 cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="cloudSyncToggle" className="text-sm font-bold text-white cursor-pointer select-none">
                        Đồng bộ dữ liệu lên Cloud Firestore
                      </label>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Khi bật, tất cả dữ liệu hoạt động của nghệ sĩ sẽ được sao lưu, đồng bộ thời gian thực lên Cloud Firestore của Google Firebase. Khi tắt, hệ thống sẽ hoạt động độc lập và chỉ lưu dữ liệu offline trong các tệp JSON cục bộ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit fields for the 4 features */}
                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest">
                    Cấu hình 4 tính năng nổi bật ở Trang chủ
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 1</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature1Title}
                          onChange={(e) => setFeature1Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Bảo mật demo & tuyển tập"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature1Desc}
                          onChange={(e) => setFeature1Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Thiết lập mật mã cho từng tác phẩm..."
                        />
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 2</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature2Title}
                          onChange={(e) => setFeature2Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Dịch thuật thông minh"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature2Desc}
                          onChange={(e) => setFeature2Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Nhận diện vị trí địa lý..."
                        />
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 3</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature3Title}
                          onChange={(e) => setFeature3Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Đồng bộ Cloud & Cache cục bộ"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature3Desc}
                          onChange={(e) => setFeature3Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Lưu trữ dữ liệu kép trên Cloud..."
                        />
                      </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div className="font-extrabold text-xs text-neutral-300">TÍNH NĂNG 4</div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          value={feature4Title}
                          onChange={(e) => setFeature4Title(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none"
                          placeholder="Bố cục mang đậm dấu ấn cá nhân"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">Mô tả chi tiết</label>
                        <textarea 
                          required
                          value={feature4Desc}
                          onChange={(e) => setFeature4Desc(e.target.value)}
                          className="w-full bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg text-xs focus:border-purple-500 focus:outline-none h-20 leading-relaxed"
                          placeholder="Tùy chỉnh ảnh bìa đại diện..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {landingSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{landingSuccessMsg}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isSavingLanding}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white font-extrabold py-3.5 px-8 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingLanding ? 'Đang lưu cấu hình...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Subscribers Column */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col h-fit max-h-[600px]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <Database className="text-purple-400 w-4.5 h-4.5" />
                    <span>Email đăng ký ({subscribers.length})</span>
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Danh sách nhận thông báo bản phát hành</p>
                </div>
                {subscribers.length > 0 && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(subscribers.join(', '));
                      alert('Đã sao chép tất cả email vào bộ nhớ tạm!');
                    }}
                    className="text-[10px] bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-bold px-2 py-1 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                  >
                    Sao chép tất cả
                  </button>
                )}
              </div>

              {subscribers.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 my-auto">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-10" />
                  <p className="text-xs">Chưa có ai đăng ký.</p>
                </div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2 pr-1">
                  {subscribers.map((email, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black/30 border border-white/5 px-3 py-2.5 rounded-xl flex items-center justify-between group hover:border-purple-500/20 transition-all"
                    >
                      <span className="text-xs font-mono text-neutral-300 select-all truncate">{email}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(email);
                          alert(`Đã sao chép email: ${email}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded-md transition-opacity cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" /> Thêm nghệ sĩ mới
            </h3>

            <form onSubmit={handleCreateArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tên Nghệ Sĩ *</label>
                <input 
                  type="text" 
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Tên Nghệ Sĩ"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username (Đăng nhập) *</label>
                  <input 
                    type="text" 
                    required
                    value={artistUsername}
                    onChange={(e) => setArtistUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="vd: username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                  <input 
                    type="text" 
                    required
                    value={artistExtension}
                    onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                    className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                    placeholder="vd: tennghesi"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>chorus.vn/{"{phần_mở_rộng}"}</strong> HOẶC cấu hình DNS trỏ subdomain <strong>{"{phần_mở_rộng}"}.chorus.vn</strong> về IP máy chủ để dùng như trang độc lập.
                  </p>
                </div>
              </div>

                            <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="text" 
                  required
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Mật khẩu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-verified"
                    checked={artistVerified}
                    onChange={(e) => setArtistVerified(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-verified" className="text-sm font-bold select-none cursor-pointer flex items-center gap-1">
                    Đã xác thực (Tích xanh)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-public"
                    checked={artistIsPublic}
                    onChange={(e) => setArtistIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-public" className="text-sm font-bold select-none cursor-pointer">
                    Hiển thị trên Trang chủ
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-has-external"
                    checked={artistHasExternalWebsite}
                    onChange={(e) => setArtistHasExternalWebsite(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="add-has-external" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Nghệ sĩ đã có Website riêng
                  </label>
                </div>
                {artistHasExternalWebsite && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Đường dẫn Website riêng
                    </label>
                    <input 
                      type="text"
                      value={artistExternalWebsiteUrl}
                      onChange={(e) => setArtistExternalWebsiteUrl(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
                      placeholder="VD: tai.com"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Hệ thống sẽ tự động đồng bộ & lấy ảnh bìa, danh sách bài hát, danh mục và số lượng bài hát từ Website này để hiển thị trực tiếp lên trang chủ.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Thông tin Database riêng (Nếu có)
                </label>
                <textarea 
                  value={artistDbConfig}
                  onChange={(e) => setArtistDbConfig(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-xs h-24"
                  placeholder='{ "apiKey": "AIza...", "projectId": "...", "storageBucket": "..." }'
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Nhập cấu hình Firebase JSON nếu nghệ sĩ này muốn lưu trữ dữ liệu trên hệ thống Firestore & Google Cloud của riêng họ.
                </p>
              </div>

              {formErr && (
                <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2.5 rounded-xl px-3 border border-rose-500/15">
                  {formErr}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer"
                >
                  Lưu nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingArtist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => { setShowEditModal(false); setEditingArtist(null); }}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-400" /> Sửa thông tin: {editingArtist.username}
            </h3>

            <form onSubmit={handleUpdateArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tên Nghệ Sĩ *</label>
                <input 
                  type="text" 
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Tên Nghệ Sĩ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phần mở rộng *</label>
                <input 
                  type="text" 
                  required
                  value={artistExtension}
                  onChange={(e) => setArtistExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="vd: tennghesi"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                    Truy cập qua: <strong>chorus.vn/{"{phần_mở_rộng}"}</strong> HOẶC subdomain <strong>{"{phần_mở_rộng}"}.chorus.vn</strong>
                </p>
              </div>

                            <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="text" 
                  required
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-verified"
                    checked={artistVerified}
                    onChange={(e) => setArtistVerified(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-verified" className="text-sm font-bold select-none cursor-pointer">
                    Đã xác thực (Tích xanh)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-public"
                    checked={artistIsPublic}
                    onChange={(e) => setArtistIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-public" className="text-sm font-bold select-none cursor-pointer">
                    Hiển thị trên Trang chủ
                  </label>
                </div>
              </div>

              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-has-external"
                    checked={artistHasExternalWebsite}
                    onChange={(e) => setArtistHasExternalWebsite(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-has-external" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Nghệ sĩ đã có Website riêng
                  </label>
                </div>
                {artistHasExternalWebsite && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Đường dẫn Website riêng
                    </label>
                    <input 
                      type="text"
                      value={artistExternalWebsiteUrl}
                      onChange={(e) => setArtistExternalWebsiteUrl(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-sm"
                      placeholder="VD: tai.com"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Hệ thống sẽ tự động đồng bộ & lấy ảnh bìa, danh sách bài hát, danh mục và số lượng bài hát từ Website này để hiển thị trực tiếp lên trang chủ.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Thông tin Database riêng (Nếu có)
                </label>
                <textarea 
                  value={artistDbConfig}
                  onChange={(e) => setArtistDbConfig(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono text-xs h-24"
                  placeholder='{ "apiKey": "AIza...", "projectId": "...", "storageBucket": "..." }'
                />
              </div>

              {formErr && (
                <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2.5 rounded-xl px-3 border border-rose-500/15">
                  {formErr}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingArtist(null); }}
                  className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer"
                >
                  Cập nhật nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 z-50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}
    </div>
  );

}
