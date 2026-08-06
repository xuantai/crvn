import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Settings, LogIn, LogOut, FileText, Layout, Copy, Repeat, Lock, Link as LinkIcon, Save, Eye, Plus, ChevronLeft, Globe, Camera, X } from 'lucide-react';
import { LanguageContext } from '../App';
import { getPlatformDomain } from '../utils/platform';



const TEMPLATES = [
  { id: '1', name: 'Vui vẻ (Ấm áp)' },
  { id: '2', name: 'Căng Cực (Sôi động)' },
  { id: '3', name: 'Buồn (Sâu lắng)' },
  { id: '4', name: 'Thư giãn (Nhẹ nhàng)' },
  { id: '5', name: 'Đáng yêu (Đỏ, Nhảy múa)' },
  { id: '6', name: 'Hạnh Phúc (Hồng, Hoa rơi)' },
  { id: '7', name: 'Học Đường (Trắng, Lá vàng rơi)' },
  { id: '8', name: 'Tổ Quốc (Đỏ, Cờ phấp phới)' },
  { id: '9', name: 'Cầu Vồng' },
  { id: '10', name: 'Hip Hop (Đường phố)' },
  { id: '11', name: 'Kỳ bí (Đen vàng, Trăng khói mưa)' },
  { id: '12', name: 'Cổ điển (Nâu, retro)' },
  { id: '13', name: 'Hoàng hôn (Cam đỏ trời chiều)' },
  { id: '14', name: 'Đại Dương (Sóng biển)' },
  { id: '15', name: 'Retro 8-Bit (Game)' },
  { id: '16', name: 'Xếp hình Puzzle' },
  { id: '17', name: 'Cổ vũ (Mây, mặt trời)' },
  { id: '18', name: 'Pháo hoa (Năm mới)' }
];

function HelpEmailVerifySection({ initialEmail, onVerifiedSuccess }: { initialEmail?: string; onVerifiedSuccess?: (artist: any) => void }) {
  const [verifyEmailInput, setVerifyEmailInput] = useState(initialEmail || '');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
  const [verifyStatus, setVerifyStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (initialEmail && !verifyEmailInput) {
      setVerifyEmailInput(initialEmail);
    }
  }, [initialEmail]);

  // Check persistent countdown timer from localStorage on mount & when email changes
  useEffect(() => {
    if (verifyEmailInput) {
      const key = `otp_resend_expires_${verifyEmailInput.trim().toLowerCase()}`;
      const expiresRaw = localStorage.getItem(key);
      if (expiresRaw) {
        const expires = parseInt(expiresRaw, 10);
        const rem = Math.ceil((expires - Date.now()) / 1000);
        if (rem > 0) {
          setTimer(rem);
        } else {
          localStorage.removeItem(key);
          setTimer(0);
        }
      }
    }
  }, [verifyEmailInput]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (verifyEmailInput) {
              localStorage.removeItem(`otp_resend_expires_${verifyEmailInput.trim().toLowerCase()}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, verifyEmailInput]);

  // Auto check status if email is entered
  const checkEmailStatus = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return;
    try {
      const res = await fetch('/api/public/check-email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      });
      const data = await res.json();
      if (data.success && data.artist) {
        if (data.emailVerified && onVerifiedSuccess) {
          onVerifiedSuccess(data.artist);
        }
      }
    } catch (e) {}
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmailInput) return;
    setResendStatus({ type: '', msg: '' });
    setIsResending(true);
    try {
      const res = await fetch('/api/public/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmailInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.emailVerified && data.artist) {
          setResendStatus({ type: 'success', msg: data.message || 'Email này đã được xác thực thành công!' });
          if (onVerifiedSuccess) onVerifiedSuccess(data.artist);
        } else {
          setResendStatus({ type: 'success', msg: data.message || 'Đã gửi lại mã OTP 6 số vào email của bạn!' });
          const expireTime = Date.now() + 60000;
          localStorage.setItem(`otp_resend_expires_${verifyEmailInput.trim().toLowerCase()}`, expireTime.toString());
          setTimer(60);
        }
      } else {
        setResendStatus({ type: 'error', msg: data.error || 'Có lỗi xảy ra khi gửi lại email!' });
      }
    } catch (err) {
      setResendStatus({ type: 'error', msg: 'Lỗi kết nối máy chủ!' });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6 || !verifyEmailInput) return;
    setVerifyStatus({ type: '', msg: '' });
    setIsVerifying(true);
    try {
      const res = await fetch('/api/public/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmailInput, otpCode: code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatus({ type: 'success', msg: data.message || 'Xác thực Email thành công!' });
        if (onVerifiedSuccess) {
          onVerifiedSuccess({
            artistName: data.artistName,
            email: verifyEmailInput,
            emailVerified: true
          });
        }
      } else {
        setVerifyStatus({ type: 'error', msg: data.error || 'Mã OTP không chính xác!' });
      }
    } catch (err) {
      setVerifyStatus({ type: 'error', msg: 'Lỗi kết nối máy chủ!' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mt-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">
          ✉️
        </div>
        <div>
          <h3 className="font-black text-neutral-900 text-base">Xác Thực Email & Gửi Lại Mã OTP</h3>
          <p className="text-xs text-neutral-500">Trường hợp bạn thoát màn hình đăng ký hoặc chưa nhận được email xác thực</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Gửi lại mã */}
        <form onSubmit={handleResend} className="space-y-3 bg-neutral-50 p-5 rounded-xl border border-neutral-200/80 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-neutral-700 uppercase tracking-wider text-center">Bước 1: Gửi Lại Mã OTP Về Email</h4>
            <div>
              <label className="text-[11px] font-bold text-neutral-500 block mb-1">Email đăng ký của bạn</label>
              <input
                type="email"
                value={verifyEmailInput}
                onChange={e => {
                  setVerifyEmailInput(e.target.value);
                }}
                onBlur={e => checkEmailStatus(e.target.value)}
                placeholder="Nhập email đăng ký..."
                className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            {resendStatus.msg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${resendStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {resendStatus.msg}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isResending || timer > 0}
            className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {isResending ? 'Đang gửi...' : timer > 0 ? `Gửi Lại Mã OTP (${timer}s)` : 'Gửi Lại Mã OTP Mới'}
          </button>
        </form>

        {/* Form 2: Nhập mã OTP 6 số */}
        <form onSubmit={handleVerifyOtp} className="space-y-3 bg-neutral-50 p-5 rounded-xl border border-neutral-200/80 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-neutral-700 uppercase tracking-wider text-center">Bước 2: Nhập 6 Chữ Số OTP Để Kích Hoạt</h4>
            
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1 w-full mx-auto text-center">
              {otpDigits.map((digit, idx) => (
                <input
                  key={`help-otp-${idx}`}
                  id={`help-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => {
                    const val = e.target.value;
                    const newDigits = [...otpDigits];
                    newDigits[idx] = val;
                    setOtpDigits(newDigits);
                    if (val && idx < 5) {
                      const next = document.getElementById(`help-otp-${idx + 1}`);
                      if (next) next.focus();
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                      const prev = document.getElementById(`help-otp-${idx - 1}`);
                      if (prev) prev.focus();
                    }
                  }}
                  onPaste={e => {
                    e.preventDefault();
                    const pasteData = e.clipboardData.getData('text').trim();
                    if (/^\d{6}$/.test(pasteData)) {
                      setOtpDigits(pasteData.split(''));
                      const last = document.getElementById('help-otp-5');
                      if (last) last.focus();
                    }
                  }}
                  className="w-9 h-11 text-center text-lg font-black bg-white text-neutral-900 border border-neutral-300 rounded-lg focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            {verifyStatus.msg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${verifyStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {verifyStatus.msg}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpDigits.join('').length !== 6}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-amber-500/20 mt-2"
          >
            {isVerifying ? 'Đang xác thực...' : 'Xác Nhận Kích Hoạt OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HelpPage({ DemoPlayer }: { DemoPlayer?: any }) {
  const { lang, landingConfig } = useContext(LanguageContext);
  const location = useLocation();

  // Helper functions
  const getArtistExtensionFromUrl = (customPath?: string) => {
    const currentPath = customPath !== undefined ? customPath : window.location.pathname;
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0 && parts[0] !== 'acp' && parts[0] !== 'mem' && parts[0] !== 'demo' && parts[0] !== 'song' && parts[0] !== 'playlist' && parts[0] !== 'admin' && parts[0] !== 'help') {
      return parts[0].toLowerCase().trim();
    }
    return '';
  };
  const ext = getArtistExtensionFromUrl(location.pathname);
  const token = localStorage.getItem('adminToken');

  const getAvatarUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
    return `/uploads/${ext || 'common'}/${url}`;
  };

  const [activeTab, setActiveTab] = useState(token ? 'account' : 'login');
  const [showTooltip, setShowTooltip] = useState(false);
  const [artistData, setArtistData] = useState<any>(null);
  
  const [artistName, setArtistName] = useState('');
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
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(TEMPLATES[0].id);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setActiveTab('login');
      try {
        const pendingRaw = localStorage.getItem('pendingRegistrationInfo');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          if (pending && (pending.username || pending.email || pending.extension)) {
            setArtistData({
              artistName: pending.artistName || pending.username,
              username: pending.username,
              extension: pending.extension,
              email: pending.email,
              activated: false,
              emailVerified: pending.emailVerified === true
            });
            if (pending.email) setEmail(pending.email);
            if (pending.username) setUsername(pending.username);
            if (pending.extension) setExtension(pending.extension);
            if (pending.artistName) setArtistName(pending.artistName);
          }
        }
      } catch (e) {}
      return;
    }
    
    fetch('/api/admin/check', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.isAdmin && data.artist) {
        const isAct = data.artist.activated !== false;
        localStorage.setItem('activeAdminActivated', isAct ? 'true' : 'false');
        if (data.artist.extension) {
          localStorage.setItem('activeAdminExtension', data.artist.extension);
        }
        localStorage.setItem('activeAdminName', data.artist.artistName || data.artist.username || data.artist.extension);
        setArtistData({ ...data.artist, aboutMe: data.aboutMe });
        setEmail(data.artist.email || '');
        setUsername(data.artist.pendingUsernameChange || data.artist.username || '');
        setExtension(data.artist.pendingExtensionChange || data.artist.extension || '');
        setArtistName(data.artist.pendingNameChange || data.artist.artistName || '');
        
        const checkAvatar = data.avatarUrl || '';
        setAvatarUrl(checkAvatar);
        localStorage.setItem('activeAdminAvatar', checkAvatar);
        if (!isAct) {
          setActiveTab('login');
        }
      } else {
        // If token is invalid, just act as guest
        setActiveTab('login');
      }
    })
    .catch(() => {
      setActiveTab('login');
    })
    .finally(() => setIsLoading(false));
  }, [token, ext]);

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    try {
      const res = await fetch('/api/admin/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setEmailSuccess('Cập nhật email thành công!');
      } else {
        setEmailError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setEmailError('Lỗi kết nối');
    }
  };


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
      setIsAvatarChanged(true);
      setAvatarSuccess('');
      setAvatarError('');
      setAvatarProgress(0);
    } catch(err) {
      console.error(err);
      setAvatarProgress(0);
      setAvatarError('Tải lên thất bại');
    }
  };

  const handleAvatarSave = async () => {
    setAvatarSuccess('');
    setAvatarError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-artist-extension': ext
        },
        body: JSON.stringify({ 
          homeCoverUrl: avatarUrl,
          aboutMe: {
            ...(artistData?.aboutMe || {}),
            avatarUrl: avatarUrl
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarSuccess('Đã lưu avatar thành công!');
        setIsAvatarChanged(false);
        localStorage.setItem('activeAdminAvatar', avatarUrl);
        window.dispatchEvent(new Event('admin-session-change'));
        setArtistData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            homeCoverUrl: avatarUrl,
            aboutMe: {
              ...(prev.aboutMe || {}),
              avatarUrl: avatarUrl
            }
          };
        });
      } else {
        setAvatarError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setAvatarError('Lỗi kết nối');
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artistName, username, extension })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess('Đã gửi yêu cầu thay đổi thành công! Vui lòng chờ quản trị viên duyệt.');
      } else {
        setProfileError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setProfileError('Lỗi kết nối');
    }
  };

  const menuItems = [
    { id: 'account', label: 'Cài đặt tài khoản', icon: Settings },
    { id: 'login', label: 'Đăng Nhập', icon: LogIn, category: 'Hướng dẫn' },
    { id: 'post', label: 'Đăng bài', icon: FileText, category: 'Hướng dẫn' },
    { id: 'themes', label: 'Các Chủ Đề', icon: Layout, category: 'Hướng dẫn' },
    { id: 'clone', label: 'Nhân bản', icon: Copy, category: 'Hướng dẫn' },
    { id: 'repost', label: 'Đăng lại', icon: Repeat, category: 'Hướng dẫn' },
    { id: 'password', label: 'Mật Khẩu Demo', icon: Lock, category: 'Hướng dẫn' },
    { id: 'secretlink', label: 'Secret Link', icon: LinkIcon, category: 'Hướng dẫn' }
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans text-neutral-500">Đang tải...</div>;
  }

  const isActivated = artistData ? (artistData.activated !== false) : (localStorage.getItem('activeAdminActivated') !== 'false');
  const backTarget = (ext && isActivated) ? `/${ext}` : '/';

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('activeAdminExtension');
    localStorage.removeItem('activeAdminName');
    localStorage.removeItem('activeAdminAvatar');
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      await fetch('/api/member/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = backTarget;
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-200 p-6 shrink-0 md:h-screen md:sticky md:top-0 overflow-y-auto flex flex-col justify-between">
        <div>
          <Link to={backTarget} className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors mb-8 text-sm font-bold w-fit">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Link>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 mb-6">Trợ Giúp</h2>
          <div className="space-y-6">
            {token && (
              <div>
                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2 px-3">Cài Đặt</div>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'account' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                >
                  <Settings className="w-4 h-4" /> Cài đặt tài khoản
                </button>
              </div>
            )}
            <div>
              <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-2 px-3">Hướng dẫn</div>
              <div className="space-y-1">
                {menuItems.filter(m => m.category === 'Hướng dẫn').map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`help-item-${item.id || ''}-${idx}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}
                    >
                      <Icon className="w-4 h-4" /> {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200 mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" /> Đăng Xuất
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {activeTab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Cài đặt tài khoản</h1>
              <p className="text-neutral-500 text-sm mb-8">Quản lý thông tin đăng nhập và địa chỉ trang nhạc của bạn.</p>
              
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 mb-8">
                <h3 className="text-lg font-black text-neutral-900 mb-4">Avatar Nghệ Sĩ</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-neutral-100 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={getAvatarUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
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
                    <div className="flex flex-wrap gap-2 items-center">
                      <button 
                        type="button"
                        onClick={() => document.getElementById('avatarUploadHelp')?.click()} 
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> Chọn Ảnh Mới
                      </button>
                      {isAvatarChanged && (
                        <button 
                          type="button"
                          onClick={handleAvatarSave} 
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer"
                        >
                          <Save className="w-4 h-4" /> Lưu Avatar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">Hỗ trợ JPG, PNG. Khuyến nghị 500x500px.</p>
                    {avatarSuccess && <div className="text-emerald-600 text-xs font-bold mt-1">{avatarSuccess}</div>}
                    {avatarError && <div className="text-red-600 text-xs font-bold mt-1">{avatarError}</div>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200 h-full">
                    <h3 className="text-lg font-black text-neutral-900 mb-6">Thông Tin Cơ Bản</h3>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-2">Nghệ Danh</label>
                        <input
                          type="text"
                          value={artistName}
                          onChange={e => setArtistName(e.target.value)}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-2">Username đăng nhập</label>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-2">Phần mở rộng (Link)</label>
                        <input
                          type="text"
                          value={extension}
                          onChange={e => setExtension(e.target.value)}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono"
                          required
                        />
                        <div className="mt-2 text-[11px] text-neutral-500">Đang dùng: <span className="font-bold text-black">{artistData?.extension}.{getPlatformDomain()}</span></div>
                      </div>
                      {profileError && <div className="text-red-600 text-xs font-bold">{profileError}</div>}
                      {profileSuccess && <div className="text-emerald-600 text-xs font-bold">{profileSuccess}</div>}
                      <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer">
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
                              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono"
                              placeholder="Mật khẩu hiện tại..."
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono"
                              placeholder="Mật khẩu mới..."
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono"
                              placeholder="Xác nhận mật khẩu mới..."
                              required
                            />
                          </div>
                          {passwordError && <div className="text-red-600 text-xs font-bold">{passwordError}</div>}
                          {passwordSuccess && <div className="text-emerald-600 text-xs font-bold">{passwordSuccess}</div>}
                          <button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer">
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
                              className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white"
                              placeholder="Nhập email..."
                              required
                            />
                          </div>
                          {emailError && <div className="text-red-600 text-xs font-bold">{emailError}</div>}
                          {emailSuccess && <div className="text-emerald-600 text-xs font-bold">{emailSuccess}</div>}
                          <button type="submit" className="w-full bg-stone-100 text-stone-700 border border-stone-200 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors cursor-pointer">
                            Cập Nhật
                          </button>
                        </form>
                      </div>
                  </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Đăng Nhập</h1>
              <p className="text-neutral-500 text-sm mb-8">Thông tin đăng nhập của bạn.</p>
              
              <div className="bg-amber-50/50 rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200/60 max-w-xl text-sm">
                <div className="flex items-center justify-between mb-6 border-b border-amber-100 pb-4">
                  <h3 className="text-amber-950 font-black text-lg">Thông tin đăng nhập & Quản lý</h3>
                  <button 
                    onClick={() => {
                        const platDom = getPlatformDomain();
                        const txt = `Nghệ danh: ${artistData?.artistName || artistData?.username}\nWebsite: ${artistData?.extension}.${platDom}\nAdmin: ${platDom}/admin\nĐăng nhập: ${artistData?.username} hoặc ${artistData?.email}`;
                        navigator.clipboard.writeText(txt);
                    }}
                    className="text-amber-700 hover:text-amber-900 transition-colors bg-white hover:bg-amber-100 p-2 rounded-lg border border-amber-200"
                    title="Copy info"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {artistData?.activated === false && (
                    <div className="mb-6 p-4 bg-orange-100 text-orange-800 rounded-xl font-bold text-sm border border-orange-200">
                        Tài khoản của bạn đang chờ kích hoạt, sau khi kích hoạt thành công bạn có thể đăng nhập với thông tin dưới đây.
                    </div>
                )}
                
                <div className="space-y-4 text-stone-700 font-medium">
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Nghệ danh:</span>
                    <span className="font-black text-stone-900 text-base">{artistData?.artistName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4 mt-6 mb-2">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Website:</span>
                    <a href={`https://${artistData?.extension}.${getPlatformDomain()}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline">{artistData?.extension}.{getPlatformDomain()}</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Trang Admin:</span>
                    <a href={`https://${getPlatformDomain()}/admin`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline">{getPlatformDomain()}/admin</a>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Đăng nhập bằng:</span>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">{artistData?.username}</span>
                      <span className="text-stone-400 font-bold text-xs">HOẶC</span>
                      <span className="font-black text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200">{artistData?.email || 'email'}</span>
                    </div>
                  </div>
                  <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-4">
                    <span className="w-32 text-stone-500 font-bold shrink-0">Mật khẩu:</span>
                    <span className="font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">Mật khẩu do bạn tạo</span>
                  </div>
                </div>
              </div>

              {artistData?.emailVerified === true ? (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-sm font-bold flex items-start sm:items-center gap-3 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">✓</div>
                  <div>
                    <div className="font-black text-emerald-950 text-base">Email Của Bạn Đã Được Xác Thực Thành Công</div>
                    <div className="text-xs text-emerald-700 font-medium mt-0.5">Tài khoản nghệ sĩ của bạn đã xác thực email thành công và đang chờ Quản trị viên kích hoạt. Ngay sau khi được kích hoạt, bạn có thể bắt đầu sử dụng tất cả tính năng của Chorus.vn.</div>
                  </div>
                </div>
              ) : (
                <HelpEmailVerifySection 
                  initialEmail={artistData?.email || email} 
                  onVerifiedSuccess={(art) => {
                    setArtistData((prev: any) => ({
                      ...(prev || {}),
                      ...(art || {}),
                      emailVerified: true
                    }));
                    if (art?.artistName) setArtistName(art.artistName);
                    if (art?.username) setUsername(art.username);
                    if (art?.extension) setExtension(art.extension);
                    if (art?.email) setEmail(art.email);
                    try {
                      localStorage.setItem('pendingRegistrationInfo', JSON.stringify({
                        artistName: art?.artistName || artistName,
                        username: art?.username || username,
                        extension: art?.extension || extension,
                        email: art?.email || email,
                        emailVerified: true
                      }));
                    } catch (e) {}
                  }}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'post' && (
            <motion.div key="post" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Đăng bài</h1>
              <p className="text-neutral-500 text-sm mb-8">Cách để thêm một bài hát mới vào kho nhạc của bạn.</p>
              
              <div className="prose prose-stone prose-sm">
                <p>Để đăng bài, bạn hãy bấm vào nút nổi (floating button) ở góc dưới bên phải màn hình khi bạn đang ở trong trang kho nhạc của mình.</p>
                <div className="my-8 p-8 bg-neutral-100 rounded-3xl flex items-center justify-center border border-neutral-200 relative overflow-hidden h-64">
                  {/* Floating button demo */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                          className="relative bg-stone-950/95 backdrop-blur-md border border-white/15 text-white text-xs font-black tracking-wider px-4 py-2.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap pointer-events-none uppercase"
                        >
                          Đăng Bài Hát Mới
                          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl -z-10 animate-pulse" />
                          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-stone-950/95 border-r border-t border-white/15 rotate-45"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Link to={`/${ext}/admin/new`}>
                    <motion.div 
                      className="relative flex items-center justify-center w-16 h-16 rounded-full cursor-pointer group overflow-hidden border border-white/50 backdrop-blur-xl bg-purple-950/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.75),0_16px_40px_rgba(219,39,119,0.5),0_0_24px_rgba(168,85,247,0.35)]"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "inset 0 2px 4px rgba(255,255,255,0.75), 0 16px 40px rgba(219,39,119,0.5), 0 0 24px rgba(168,85,247,0.35)",
                          "inset 0 2px 4px rgba(255,255,255,0.9), 0 24px 56px rgba(236,72,153,0.75), 0 0 36px rgba(139,92,246,0.6)",
                          "inset 0 2px 4px rgba(255,255,255,0.75), 0 16px 40px rgba(219,39,119,0.5), 0 0 24px rgba(168,85,247,0.35)"
                        ]
                      }}
                      transition={{
                        scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                        boxShadow: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-fuchsia-600 via-pink-600 to-rose-500 opacity-100 animate-rotate-border -z-10" style={{ transform: 'scale(1.2)' }} />
                      <div className="absolute inset-0 bg-gradient-to-bl from-pink-500 via-purple-600 to-indigo-700 opacity-60 mix-blend-overlay animate-[pulse_3s_ease-in-out_infinite] -z-10" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,transparent_60%)] pointer-events-none mix-blend-overlay" />
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-full pointer-events-none" />
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-pink-500/40 -z-20"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-purple-600/30 -z-20"
                        animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      />
                      <Plus className="w-8 h-8 text-white filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] relative z-10" strokeWidth={2.5} />
                    </motion.div>
                    </Link>
                  </div>
                </div>
                <p>Nút này sẽ mở ra form upload, cho phép bạn tải lên tệp âm thanh (MP3, WAV...), ảnh bìa, điền lời bài hát và các thông tin khác.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'themes' && (
            <motion.div key="themes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Các Chủ Đề</h1>
              <p className="text-neutral-500 text-sm mb-8">Trải nghiệm các giao diện khác nhau cho kho nhạc của bạn.</p>
              
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {TEMPLATES.map((t, idx) => (
                    <div key={`theme-${t.id || ''}-${idx}`} onClick={() => setSelectedTheme(t.id)} className={`p-4 bg-white border rounded-xl cursor-pointer transition-colors flex items-center justify-between group ${selectedTheme === t.id ? 'border-black ring-1 ring-black' : 'border-neutral-200 hover:border-black'}`}>
                      <div className="font-bold text-neutral-800">{t.name}</div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" />
                    </div>
                  ))}
                  <div className="text-xs text-neutral-500 mt-4 pb-4">Bấm vào các chủ đề trên để xem trước giao diện trên điện thoại demo bên cạnh. Bạn có thể vuốt trên màn hình điện thoại để xem trọn vẹn.</div>
                </div>
                
                <div className="w-full lg:w-72 shrink-0 flex justify-center">
                  <div className="w-[280px] h-[580px] bg-black rounded-[3rem] p-3 shadow-2xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                    <div className="w-full h-full bg-stone-100 rounded-[2.25rem] overflow-hidden relative">
                      <div className="absolute inset-0 flex flex-col scale-[0.8] origin-top-left w-[125%] h-[125%]">
                        {DemoPlayer ? (
                          <DemoPlayer 
                             songIdP="demo" 
                             previewConfig={{...{ id: selectedTheme, templateTheme: '1' }, isPCPreviewMode: false}} 
                             previewData={{
                               title: landingConfig?.demoSongInfo?.title || "Bài Hát Mẫu Demo",
                               artist: landingConfig?.demoSongInfo?.artist || "Admin",
                               coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
                               backgroundUrl: "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=500&q=80",
                               lyrics: landingConfig?.demoSongInfo?.lyrics || "[Verse 1]\nCon phố quen bước chân ai vừa qua\nLắng nghe tiếng mưa rơi nhẹ trên hiên nhà\nTa gom góp những mảnh ký ức cũ\nĐể viết lại bản tình ca còn ấp ủ.\n\n[Chorus]\nVà ngày mai nắng sẽ lại về trên đôi vai\nCho những giấc mơ không còn chút ưu tư dài\nTa mỉm cười với chính mình hôm nay\nĐể hy vọng lại đong đầy trên đôi bàn tay.\n\n[Verse 2]\nCó những lúc lặng lẽ nhìn về phía xa\nTìm lại chút dư âm ngày tháng nhạt nhòa\nĐừng buồn nhé khi đường đời nhiều sỏi đá\nBởi sau cơn mưa, bầu trời sẽ lại xanh lạ.\n\n[Bridge]\nThời gian trôi, chẳng chờ đợi một ai\nDù phía trước là đường dài hay chông gai\nTa vẫn đứng đây, vững tin vào ngày mới\nGửi vào gió những yêu thương ta đã tới.\n\n[Chorus]\nVà ngày mai nắng sẽ lại về trên đôi vai\nCho những giấc mơ không còn chút ưu tư dài\nTa mỉm cười với chính mình hôm nay\nĐể hy vọng lại đong đầy trên đôi bàn tay.\n\n[Outro]\nNắng vẫn trong, tình vẫn ấm...\nCho riêng ta một khoảng trời bình yên.",
                               isReleased: false,
                               status: 'public'
                             }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-neutral-400">Đang tải demo...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'clone' && (
            <motion.div key="clone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Nhân bản bài hát</h1>
              <p className="text-neutral-500 text-sm mb-8">Sao chép nhanh thông tin từ một bài hát có sẵn.</p>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm prose prose-sm prose-stone">
                <p>Nếu bạn có nhiều phiên bản cho cùng 1 bài hát (ví dụ: Acoustic, Remix, Instrumental), hãy sử dụng tính năng <strong>Nhân bản</strong>.</p>
                <ol className="space-y-2 text-neutral-700">
                  <li>Tìm bài hát gốc trong kho nhạc của bạn.</li>
                  <li>Bấm vào biểu tượng <strong>Chỉnh sửa</strong> (Edit).</li>
                  <li>Tìm và bấm vào nút <strong>Nhân bản</strong> (biểu tượng Copy <Copy className="w-3 h-3 inline mx-1" />).</li>
                  <li>Hệ thống sẽ tạo ra một bản sao với toàn bộ thông tin (Tên, Lời, Tác giả...). Bạn chỉ cần thay thế file nhạc mới và đổi lại tên cho phù hợp.</li>
                </ol>
              </div>
            </motion.div>
          )}

          {activeTab === 'repost' && (
            <motion.div key="repost" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Đăng lại (Repost)</h1>
              <p className="text-neutral-500 text-sm mb-8">Chia sẻ bài hát từ nghệ sĩ khác vào kho nhạc của bạn.</p>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm prose prose-sm prose-stone">
                <p>Nếu bạn có sản phẩm hợp tác chung với một nghệ sĩ khác, và họ đã đăng bài hát đó lên kênh Chorus của họ, bạn có thể <strong>đăng lại nhanh</strong> mà không cần phải upload tệp tin từ đầu.</p>
                <ol className="space-y-2 text-neutral-700">
                  <li>Lấy link bài hát (URL) từ trang của đối tác.</li>
                  <li>Trong trang quản trị của bạn, tìm mục <strong>Thêm bài hát đăng lại</strong>.</li>
                  <li>Dán link vào và xác nhận. Bài hát sẽ tự động xuất hiện trong kho nhạc của bạn và liên kết trực tiếp tới bản gốc.</li>
                </ol>
              </div>
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Mật Khẩu Demo</h1>
              <p className="text-neutral-500 text-sm mb-8">Bảo vệ các bản demo chưa ra mắt của bạn.</p>
              
              <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="text-lg font-black text-neutral-900 mb-3 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-500" /> Mật khẩu riêng</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Để bảo mật, bạn có thể thiết lập mật khẩu cho mỗi bài hát ngay khi đăng tải. Người nghe sẽ phải nhập đúng mật khẩu này để có thể phát nhạc.
                  </p>
                </div>
                
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="text-lg font-black text-neutral-900 mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-500" /> Mật khẩu chung</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                    Trong trường hợp bạn muốn bảo mật tất cả các demo mà không cần phải thiết lập tay cho từng bài, hãy sử dụng <strong>Mật khẩu chung</strong>.
                  </p>
                  <div className="p-4 bg-neutral-50 rounded-xl text-sm text-neutral-700 border border-neutral-100">
                    <p><strong>Cách hoạt động:</strong></p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Những bài đã cài đặt <strong>Mật khẩu riêng</strong> sẽ được mở khóa bằng mật khẩu riêng đó.</li>
                      <li>Những bài <strong>Chưa cài mật khẩu</strong> sẽ tự động yêu cầu nhập <strong>Mật khẩu chung</strong>.</li>
                    </ul>
                  </div>
                  <p className="text-sm text-neutral-500 mt-4 italic">
                    * Bạn có thể thay đổi Mật khẩu chung trong mục <strong>Bảo Mật & Email</strong> ở trang quản trị (AdminCP).
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'secretlink' && (
            <motion.div key="secretlink" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-3xl font-black text-neutral-900 mb-2">Secret Link</h1>
              <p className="text-neutral-500 text-sm mb-8">Chia sẻ bài hát bảo mật mà không cần gửi mật khẩu.</p>
              
              <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200 shadow-sm">
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    Với những demo đã đặt mật khẩu, bạn có thể tạo một <strong>Secret Link</strong> để chia sẻ. Người nhận được link này sẽ được nghe bài hát ngay lập tức mà <strong>không cần phải nhập mật khẩu</strong>.
                  </p>
                  
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100 mb-6 w-max">
                    <div className="text-sm font-bold text-neutral-600">Cách lấy link: Bấm vào biểu tượng</div>
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-lg flex items-center justify-center shadow-sm border border-amber-200">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-bold text-neutral-600">bên cạnh nút Chia sẻ.</div>
                  </div>
                  
                  <h4 className="font-bold text-neutral-900 mb-2">Khóa Secret Link</h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Nếu bạn muốn hủy bỏ quyền truy cập của Secret Link đó (để link trở lại trạng thái yêu cầu mật khẩu), bạn chỉ cần vào chỉnh sửa bài hát và bấm <strong>Reset Secret Link</strong>.
                  </p>
                </div>
                
                <div className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-100 shadow-sm">
                  <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">Reset toàn bộ Secret Link</h4>
                  <p className="text-sm text-red-700 leading-relaxed mb-4">
                    Trong trường hợp rủi ro bảo mật và bạn muốn thu hồi toàn bộ các Secret Link đã chia sẻ trước đó cho tất cả bài hát, bạn có thể vào mục <strong>Bảo Mật & Email</strong> và bấm nút <strong>Reset toàn bộ secret link</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
