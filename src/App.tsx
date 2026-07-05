import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { ChorusLogo } from './components/ChorusLogo';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Settings, Play, Music, Lock, ArrowLeft, Upload, Disc3, Plus, Trash2, Edit3, Globe, Camera, X, FileAudio, Share2, ListMusic, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Facebook, Instagram, Youtube, GripVertical, LogOut, ChevronRight, Monitor, Home as HomeIcon, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, FileText, Sparkles, Copy, ExternalLink, Database, BadgeCheck, Search, Download, FolderDown, RotateCcw, Image, MessageSquare, Bell, Send, AlertCircle, AlertTriangle, CheckCircle, Info, Check , ChevronLeft} from 'lucide-react';
import { toPng } from 'html-to-image';
import { AppData, DemoSong, TemplateConfig, Achievement } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { IndirectBioCard } from './components/IndirectBioCard';

function formatText(text: string | null | undefined, disableLinks = false) {
  if (!text) return null;
  const lines = text.replace(/\s+\(/g, '\n(').split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
              if (isSeparator) {
                return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
              }
              
              const isSecret = segment.toLowerCase().includes("secret");
              if (isSecret) {
                return (
                  <span 
                    key={`${lineIdx}-${segIdx}`}
                    className="select-none filter blur-[4.5px] cursor-help inline-block bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5" 
                    title="Nghệ sĩ bí mật"
                  >
                    {segment}
                  </span>
                );
              }
              
              return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

function renderArtistNameWithLinks(text: string | null | undefined, systemArtists: any[]) {
  if (!text) return null;
  const lines = text.replace(/\s+\(/g, '\n(').split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
              if (isSeparator) {
                return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
              }
              
              const isSecret = segment.toLowerCase().includes("secret");
              if (isSecret) {
                return (
                  <span 
                    key={`${lineIdx}-${segIdx}`}
                    className="select-none filter blur-[4.5px] cursor-help inline-block bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5" 
                    title="Nghệ sĩ bí mật"
                  >
                    {segment}
                  </span>
                );
              }

              // Match in systemArtists
              const trimmedName = segment.trim();
              const matchedArtist = systemArtists.find(
                a => a.artistName && a.artistName.trim().toLowerCase() === trimmedName.toLowerCase()
              );

              if (matchedArtist) {
                // Construct link
                const isProduction = window.location.hostname.includes('chorus.vn');
                let href = `/${matchedArtist.extension}`;
                let isExternal = false;

                if (matchedArtist.hasExternalWebsite && matchedArtist.externalWebsiteUrl) {
                  const cleanUrl = matchedArtist.externalWebsiteUrl.trim().replace(/^https?:\/\//i, '');
                  href = `https://${cleanUrl}`;
                  isExternal = true;
                } else if (matchedArtist.customDomain) {
                  const cleanUrl = matchedArtist.customDomain.trim().replace(/^https?:\/\//i, '');
                  href = `https://${cleanUrl}`;
                  isExternal = true;
                } else if (isProduction) {
                  href = `https://${matchedArtist.extension}.chorus.vn`;
                  isExternal = true;
                }

                if (isExternal) {
                  return (
                    <a 
                      key={`${lineIdx}-${segIdx}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="artist-link-cool cursor-pointer text-inherit inline-flex items-baseline"
                    >
                      {segment}
                    </a>
                  );
                } else {
                  return (
                    <Link 
                      key={`${lineIdx}-${segIdx}`}
                      to={href}
                      className="artist-link-cool cursor-pointer text-inherit inline-flex items-baseline"
                    >
                      {segment}
                    </Link>
                  );
                }
              }
              
              return <span key={`${lineIdx}-${segIdx}`}>{segment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}


// Global styles added in index.css

const translations: Record<string, Record<string, string>> = {
  vi: { dDesc: "Thiên đường âm nhạc của", btnSpot: "Nghe trên Spotify", lDemos: "Đề Mô", lReleased: "Ra Rồi", lDemoMark: "DEMO", lReleasedMark: "RELEASED", pReq: "Cần Mật Khẩu", pNow: "Nghe Ngay", nDemo: "Chưa có demo nào.", rMv: "MV Đã Phát Hành", nMv: "Chưa có MV nào.", lMore: "Hiển thị thêm", mList: "người nghe hàng tháng", load: "Đang tải...", back: "Trở về", adm: "AdminCP", edit: "Chỉnh sửa", pPrompt: "Cần mật khẩu", pPrompt2: "Nhập mật khẩu để nghe demo này", unlock: "Mở khóa", wPass: "Sai mật khẩu", lyric: "Lời bài hát", nLyric: "Chưa cập nhật lời bài hát", sAuth: "Sáng tác:", lang: "Tiếng Việt", lDemosMobile: "Đề mô", lReleasedMobile: "Ra Rồi" },
  en: { dDesc: "Music paradise of", btnSpot: "Listen on Spotify", lDemos: "Demo", lReleased: "Release", lDemoMark: "DEMO", lReleasedMark: "RELEASED", pReq: "Password", pNow: "Play Now", nDemo: "No demos yet.", rMv: "Released Music Videos", nMv: "No MVs yet.", lMore: "Load more", mList: "monthly listeners", load: "Loading...", back: "Back", adm: "Admin", edit: "Edit", pPrompt: "Password required", pPrompt2: "Enter password to listen to this demo", unlock: "Unlock", wPass: "Wrong password", lyric: "Lyrics", nLyric: "No lyrics yet", sAuth: "Composer:", lang: "English" },
  ko: { dDesc: "데모 파라다이스", btnSpot: "Spotify에서 듣기", lDemos: "최신 데모", lReleased: "발매된 음악", lDemoMark: "데모", lReleasedMark: "발매됨", pReq: "비밀번호", pNow: "지금 듣기", nDemo: "데모 없음", rMv: "발매된 뮤직비디오", nMv: "MV 없음", lMore: "더 보기", mList: "월간 청취자", load: "로딩 중...", back: "뒤로", adm: "관리자", edit: "편집", pPrompt: "비밀번호 필요", pPrompt2: "이 데모를 들으려면 비밀번호를 입력하세요", unlock: "잠금 해제", wPass: "잘못된 비밀번호", lyric: "가사", nLyric: "가사 없음", sAuth: "작곡가:", lang: "한국어" },
  ja: { dDesc: "デモパラダイス", btnSpot: "Spotifyで聴く", lDemos: "最新のデモ", lReleased: "リリースされた音楽", lDemoMark: "デモ", lReleasedMark: "リリース済", pReq: "パスワード", pNow: "今すぐ聴く", nDemo: "デモなし", rMv: "リリースされたMV", nMv: "MVなし", lMore: "もっと見る", mList: "月間リスナー", load: "読み込み中...", back: "戻る", adm: "管理者", edit: "編集", pPrompt: "パスワードが必要", pPrompt2: "このデモを聴くにはパスワードを入力してください", unlock: "ロック解除", wPass: "パスワードが間違っています", lyric: "歌詞", nLyric: "歌詞なし", sAuth: "作曲:", lang: "日本語" },
  th: { dDesc: "สวรรค์แห่งเพลงเดโม่ของ", btnSpot: "ฟังบน Spotify", lDemos: "ตัวอย่างล่าสุด", lReleased: "เพลงที่ปล่อยแล้ว", lDemoMark: "เดโม่", lReleasedMark: "ปล่อยแล้ว", pReq: "รหัสผ่าน", pNow: "ฟังเลย", nDemo: "ไม่มีตัวอย่าง", rMv: "มิวสิควิดีโอ", nMv: "ไม่มี MV", lMore: "โหลดเพิ่ม", mList: "ผู้ฟังรายเดือน", load: "กำลังโหลด...", back: "กลับ", adm: "แอดมิน", edit: "แก้ไข", pPrompt: "ต้องใช้รหัสผ่าน", pPrompt2: "ใส่รหัสผ่านเพื่อฟังเดโม่นี้", unlock: "ปลดล็อค", wPass: "รหัสผ่านผิด", lyric: "เนื้อเพลง", nLyric: "ไม่มีเนื้อเพลง", sAuth: "แต่งโดย:", lang: "ไทย" },
  zh: { dDesc: "的演示天堂", btnSpot: "在Spotify收听", lDemos: "最新演示", lReleased: "已发行的音乐", lDemoMark: "演示", lReleasedMark: "已发行", pReq: "需要密码", pNow: "立即收听", nDemo: "暂无演示", rMv: "已发行的视频", nMv: "暂无视频", lMore: "加载更多", mList: "月度听众", load: "载入中...", back: "返回", adm: "管理", edit: "编辑", pPrompt: "需要密码", pPrompt2: "输入密码收听此演示", unlock: "解锁", wPass: "密码错误", lyric: "歌词", nLyric: "暂无歌词", sAuth: "作曲:", lang: "中文" }
};

interface LangContextType {
  lang: string;
  setLang: (l: string) => void;
}
const LanguageContext = createContext<LangContextType>({ lang: 'vi', setLang: () => {} });

// Thumbnail fallback handled server-side now

// ---- GLOBAL MULTI-ARTIST INTERCEPTORS ----
const getArtistExtensionFromUrl = () => {
  const host = window.location.hostname.replace(/^www\./, '');
  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }

  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0].toLowerCase();
    
    // If we are on /admin/tennghesi or /mem/tennghesi
    if ((firstSegment === 'admin' || firstSegment === 'mem') && segments.length > 1) {
      return segments[1];
    }
    
    const reserved = ['admin', 'acp', 'mem', 'demo', 'song', 'playlist'];
    if (!reserved.includes(firstSegment)) {
      return segments[0];
    }
  }
  return '';
};

const getAdminLink = (subPath: string = '') => {
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  if (isSubdomain) {
    return `/admin${subPath}`;
  }
  const ext = getArtistExtensionFromUrl();
  return ext ? `/${ext}/admin${subPath}` : `/admin${subPath}`;
};

const getArtistLink = (subPath: string = '') => {
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  const normalizedPath = subPath.startsWith('/') ? subPath : `/${subPath}`;
  if (isSubdomain) {
    return normalizedPath;
  }
  const ext = getArtistExtensionFromUrl();
  return ext ? `/${ext}${normalizedPath}` : normalizedPath;
};

const getAdminTokenKey = () => getArtistExtensionFromUrl() ? `adminToken_${getArtistExtensionFromUrl()}` : 'adminToken';
const getMemberTokenKey = () => getArtistExtensionFromUrl() ? `memberToken_${getArtistExtensionFromUrl()}` : 'memberToken';

const getAdminToken = () => localStorage.getItem(getAdminTokenKey());
const setAdminToken = (token: string) => localStorage.setItem(getAdminTokenKey(), token);
const removeAdminToken = () => localStorage.removeItem(getAdminTokenKey());

const getMemberToken = () => localStorage.getItem(getMemberTokenKey());
const setMemberToken = (token: string) => localStorage.setItem(getMemberTokenKey(), token);
const removeMemberToken = () => localStorage.removeItem(getMemberTokenKey());


// Patch window.fetch to automatically route to artist collections using Object.defineProperty to support read-only (getter-only) envs
const originalFetch = window.fetch;
const customFetch = function(this: any, input: any, init: any) {
  let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  
  if (url.startsWith('/api/') || url.includes('/api/')) {
    const ext = getArtistExtensionFromUrl();
    if (ext) {
      if (!url.includes('artist=') && !url.includes('extension=')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}artist=${ext}`;
      }
      
      if (init) {
        if (!init.headers) {
          init.headers = {};
        }
        if (Array.isArray(init.headers)) {
          init.headers.push(['x-artist-extension', ext]);
        } else if (init.headers instanceof Headers) {
          init.headers.set('x-artist-extension', ext);
        } else {
          (init.headers as any)['x-artist-extension'] = ext;
        }
      } else {
        init = {
          headers: {
            'x-artist-extension': ext
          }
        };
      }
    }
  }
  return originalFetch.call(this || window, url, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Failed to redefine window.fetch directly, trying prototype...", e);
  try {
    Object.defineProperty(Window.prototype, 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    console.error("Critical: Could not patch window.fetch", err);
  }
}

// Patch localStorage to separate session credentials per artist
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
  const ext = getArtistExtensionFromUrl();
  if (ext && key !== 'masterToken') {
    return originalGetItem.call(this, `${ext}_${key}`);
  }
  return originalGetItem.call(this, key);
};

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  const ext = getArtistExtensionFromUrl();
  if (ext && key !== 'masterToken') {
    return originalSetItem.call(this, `${ext}_${key}`, value);
  }
  return originalSetItem.call(this, key, value);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  const ext = getArtistExtensionFromUrl();
  if (ext && key !== 'masterToken') {
    return originalRemoveItem.call(this, `${ext}_${key}`);
  }
  return originalRemoveItem.call(this, key);
};

const formatFileName = (name: string, maxLen = 22) => {
  if (!name || name.length <= maxLen) return name;
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) {
    return name.slice(0, maxLen - 3) + '...';
  }
  const ext = name.slice(dotIndex);
  const baseName = name.slice(0, dotIndex);
  const charsToKeep = maxLen - ext.length - 3;
  if (charsToKeep <= 4) {
    return name.slice(0, maxLen - 3) + '...';
  }
  const half = Math.floor(charsToKeep / 2);
  const start = baseName.slice(0, half);
  const end = baseName.slice(-half);
  return `${start}...${end}${ext}`;
};

import ACPControlPanel from './components/ACPControlPanel';
import ChorusVNLanding from './components/ChorusVNLanding';

// ---- ADMIN LOGIN & REQUIRE ADMIN ----
function AdminLogin() {
  const ext = getArtistExtensionFromUrl();
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const host = window.location.hostname.replace(/^www\./, '');
    const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
    if (!isSubdomain && window.location.pathname === '/admin') {
      window.location.href = '/';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.token || pwd);
        const host = window.location.hostname.replace(/^www\./, '');
        const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
        if (isSubdomain) {
          window.location.href = getAdminLink();
        } else {
          const extPath = data.extension ? `/${data.extension}` : '';
          window.location.href = `${extPath}/admin`;
        }
      } else {
        const data = await res.json();
        setErr(data.error || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setErr('Lỗi kết nối máy chủ!');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-stone-900 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-stone-200">
        <h2 className="text-2xl font-black mb-2 text-center text-stone-800">Admin Login</h2>
        <p className="text-stone-500 mb-6 text-center text-sm">Vui lòng nhập thông tin đăng nhập quản trị</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Username</label>
            <input 
              type="text" 
              required
              value={usr}
              onChange={(e) => setUsr(e.target.value)}
              className="w-full border border-stone-300 px-4 py-3 rounded-xl focus:border-stone-900 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              required
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full border border-stone-300 px-4 py-3 rounded-xl focus:border-stone-900 focus:outline-none"
            />
          </div>

          {err && <p className="text-red-500 text-sm font-bold text-center">{err}</p>}
          <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition-colors">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- MEMBER LOGIN & SERVICES ----
function MemberLogin() {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [artistName, setArtistName] = useState('Nghệ sĩ');
  const isMember = !!getMemberToken();

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data?.artistName) {
        setArtistName(data.artistName);
      }
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        setMemberToken(data.token || pwd);
        const ext = getArtistExtensionFromUrl();
        window.location.href = ext ? `/${ext}` : '/';
      } else {
        const data = await res.json();
        setErr(data.error || 'Sai mật khẩu thành viên!');
      }
    } catch (err) {
      setErr('Lỗi kết nối máy chủ!');
    }
  };

  const handleLogout = async () => {
    removeMemberToken();
    try {
      await fetch('/api/member/logout', { method: 'POST' });
    } catch (e) {}
    window.location.reload();
  };

  if (isMember) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow effect matching platform design */}
        <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(225,29,72,0.15),transparent_50%)] pointer-events-none animate-pulse"></div>
        
        <div className="relative bg-neutral-900/50 border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-purple-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
            <Music className="w-8 h-8 text-white animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-black mb-3 tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-rose-500 bg-clip-text text-transparent">
            Chào Mừng Thành Viên!
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Bạn đã đăng nhập thành công dưới quyền <strong>Thành viên VIP</strong>. Giờ đây bạn có thể thưởng thức toàn bộ album, danh sách phát và các bài hát đệm demo bảo mật trên hệ thống của <strong>{artistName}</strong> mà không cần nhập passcode riêng biệt.
          </p>

          <div className="space-y-3">
            <Link 
              to={getArtistExtensionFromUrl() ? `/${getArtistExtensionFromUrl()}` : "/"} 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.02] transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-white" /> Khám phá & Nghe nhạc ngay
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-neutral-800/80 text-neutral-300 font-bold py-3 px-6 rounded-2xl border border-white/5 hover:bg-neutral-800 hover:text-white transition-all duration-300"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effect matching platform design */}
      <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15),transparent_50%)] pointer-events-none animate-pulse"></div>
      
      <div className="relative bg-neutral-900/50 border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
            <Lock className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Khu Vực Thành Viên</h2>
          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
            Nhập mật khẩu thành viên để nghe nhạc tự do không cần passcode
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input 
              type="password" 
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full bg-black/40 text-white border border-white/10 px-5 py-3.5 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center tracking-widest font-mono text-lg transition-all"
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-rose-500 text-xs font-bold text-center mt-1 bg-rose-500/10 py-2 rounded-xl px-3 border border-rose-500/15">{err}</p>}
          <button 
            type="submit" 
            className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-neutral-200 transition-all active:scale-95 shadow-lg"
          >
            Xác nhận Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to={getArtistExtensionFromUrl() ? `/${getArtistExtensionFromUrl()}` : "/"} className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Trở về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const ext = getArtistExtensionFromUrl();
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  
  if (!ext && !isSubdomain) {
     window.location.href = '/';
     return null;
  }
  
  const token = getAdminToken();
  if (!token) {
    return <AdminLogin />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';

  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Routes location={location} key={location.pathname}>
        {/* Core Root Routes */}
        <Route path="/" element={isSubdomain ? <Home /> : <ChorusVNLanding />} />
        <Route path="/acp" element={<ACPControlPanel />} />
        <Route path="/mem" element={<MemberLogin />} />
        <Route path="/demo/:id" element={<DemoPlayer />} />
        <Route path="/song/:id" element={<DemoPlayer />} />
        <Route path="/playlist/:id" element={<PlaylistPlayer />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/new" element={<RequireAdmin><AdminCreateDemo /></RequireAdmin>} />
        <Route path="/admin/edit/:id" element={<RequireAdmin><AdminEditDemo /></RequireAdmin>} />
        <Route path="/admin/playlist/:id" element={<RequireAdmin><AdminPlaylistEdit /></RequireAdmin>} />

        {/* Dynamic Artist Prefix Routes */}
        <Route path="/:artistExtension" element={<Home />} />
        <Route path="/:artistExtension/mem" element={<MemberLogin />} />
        <Route path="/:artistExtension/demo/:id" element={<DemoPlayer />} />
        <Route path="/:artistExtension/song/:id" element={<DemoPlayer />} />
        <Route path="/:artistExtension/playlist/:id" element={<PlaylistPlayer />} />
        <Route path="/:artistExtension/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/:artistExtension/admin/new" element={<RequireAdmin><AdminCreateDemo /></RequireAdmin>} />
        <Route path="/:artistExtension/admin/edit/:id" element={<RequireAdmin><AdminEditDemo /></RequireAdmin>} />
        <Route path="/:artistExtension/admin/playlist/:id" element={<RequireAdmin><AdminPlaylistEdit /></RequireAdmin>} />
      </Routes>
    </AnimatePresence>
  );
}

function AdminFloatingControls({ onLogout }: { onLogout: () => void }) {
  const isAdmin = !!getAdminToken();
  const location = useLocation();
  
  if (!isAdmin) return null;

  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  const isListeningPage = location.pathname.includes('/demo/') || 
                          location.pathname.includes('/song/') || 
                          location.pathname.includes('/playlist/');

  if (isListeningPage) return null;

  return (
    <div className={
      isListeningPage
        ? "hidden md:flex md:fixed md:left-6 md:top-1/2 md:-translate-y-1/2 z-[100] md:flex-col md:gap-4 md:translate-x-0"
        : "fixed top-6 mt-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 z-[100] flex flex-row gap-4"
    }>
       {isAdminPage ? (
         <a 
           href={getArtistExtensionFromUrl() ? `/${getArtistExtensionFromUrl()}` : "/"}
           className="flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-115"
           title="Trang chủ"
         >
           <HomeIcon className="w-5 h-5 stroke-[1.5]" />
         </a>
       ) : (
         <a 
           href={getAdminLink()}
           className="flex items-center justify-center p-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/25 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-[0_4px_12px_rgba(16,185,129,0.15)] transition-all duration-300 hover:scale-115 cursor-pointer"
           title="Cài đặt (Admin)"
         >
           <Settings className="w-5 h-5 stroke-[1.5]" />
         </a>
       )}
       <button 
         onClick={onLogout}
         className="flex items-center justify-center p-3 rounded-full bg-red-500/10 hover:bg-red-500/25 backdrop-blur-md text-red-400 border border-red-500/40 shadow-[0_4px_12px_rgba(239,68,68,0.15)] transition-all duration-300 hover:scale-115 cursor-pointer"
         title="Đăng xuất"
       >
         <LogOut className="w-5 h-5 stroke-[1.5]" />
       </button>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('vi');

  const handleLogout = async () => {
    removeAdminToken();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    const ext = getArtistExtensionFromUrl();
    window.location.href = ext ? `/${ext}` : '/';
  };

  useEffect(() => {
    fetch('https://get.geojs.io/v1/ip/country.json').then(r=>r.json()).then(res => {
      const code = res.country;
      if (code === 'KR') setLang('ko');
      else if (code === 'JP') setLang('ja');
      else if (code === 'TH') setLang('th');
      else if (code === 'CN' || code === 'TW') setLang('zh');
      else if (code === 'US' || code === 'GB' || code === 'AU' || code === 'CA') setLang('en');
      else setLang('vi');
    }).catch(()=>setLang('vi'));
  }, []);

  // Cơ chế tự động khôi phục Ảnh từ Server cục bộ nếu Link Firebase Storage bị Die/Chặn trong nước
  useEffect(() => {
    const handleGlobalImgError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const currentSrc = img.src;
        if (currentSrc && currentSrc.includes('firebasestorage.googleapis.com') && currentSrc.includes('uploads%2F')) {
          try {
            const parts = currentSrc.split('uploads%2F');
            if (parts.length > 1) {
              const filenameWithParams = parts[1];
              const filename = filenameWithParams.split('?')[0];
              const decodedFilename = decodeURIComponent(filename);
              const fallbackUrl = `/uploads/${decodedFilename}`;
              console.log("Global Capture: Chuyển hướng ảnh sang local fallback do Link Firebase không phản hồi:", fallbackUrl);
              img.src = fallbackUrl;
            }
          } catch (e) {
            console.error("Lỗi khi khôi phục link ảnh dự phòng cục bộ:", e);
          }
        }
      }
    };

    window.addEventListener('error', handleGlobalImgError, true); // true = Bắt sự kiện trong Capture Phase
    return () => {
      window.removeEventListener('error', handleGlobalImgError, true);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <BrowserRouter>
        <AdminFloatingControls onLogout={handleLogout} />
        <AnimatedRoutes />
      </BrowserRouter>
    </LanguageContext.Provider>
  );
}

// ---- HOME PAGE ----

const AutoTranslate = ({ text, className = "" }: { text: string; className?: string }) => {
  const { lang } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
     if (lang === 'vi') {
        setTranslated(text);
        return;
     }
     const abort = new AbortController();
     fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: lang }),
        signal: abort.signal
     }).then(r => r.json()).then(data => {
        if (data.translated && data.translated !== text) setTranslated(data.translated);
     }).catch(() => {});
     return () => abort.abort();
  }, [lang, text]);

  return <span className={className}>{translated}</span>;
};

const HoverTranslate = ({ text, className = "", format = false }: { text: string; className?: string, format?: boolean }) => {
  const { lang } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(text);
  const [hasFetched, setHasFetched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
     if (lang === 'vi') return;
     if (isHovered && !hasFetched) {
        setHasFetched(true);
        fetch('/api/translate', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ text, targetLang: lang })
        }).then(r => r.json()).then(data => {
           if (data.translated) setTranslated(data.translated);
        }).catch(() => {});
     }
  }, [lang, isHovered, hasFetched, text]);

  useEffect(() => {
     setHasFetched(false); 
     setTranslated(text);
  }, [lang, text]);

  const output = (isHovered && lang !== 'vi') ? translated : text;

  return (
    <span 
      className={className} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {format ? formatText(output) : output}
    </span>
  );
};

const SpotifyIcon = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C15.84 7.08 9.12 6.9 5.28 8.04c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.38-1.26 11.76-1.08 16.68 1.86.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z"/>
  </svg>
);

const ZingIcon = ({ className }: { className?: string }) => (
  <img 
    className={`${className} rounded-full object-cover`} 
    src="https://yt3.googleusercontent.com/ytc/AIdro_kfPqO-m9zcBxusjVAWHXrEVzNn2zFiauJ5D9VKmCBNO8g=s900-c-k-c0x00ffffff-no-rj" 
    alt="Zing MP3"
    referrerPolicy="no-referrer"
  />
);

const LanguageSwitcher = () => {
  const { lang, setLang } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const langs = ['vi', 'en', 'ko', 'ja', 'th', 'zh'];

  return (
    <div className="fixed top-6 right-6 z-50">
      <div 
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full px-4 py-2 backdrop-blur-xl cursor-pointer transition-all shadow-lg hover:pr-5 group"
        onClick={() => setOpen(!open)}
      >
        <Globe className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
        <span className="text-white font-bold uppercase text-xs tracking-wider">{lang}</span>
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 flex flex-col bg-neutral-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl origin-top-right"
          >
            {langs.map(l => (
              <button 
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`px-6 py-3.5 text-sm font-medium transition-colors text-left flex items-center justify-between min-w-[140px] border-b border-white/5 last:border-0 ${lang === l ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{translations[l].lang}</span>
                {lang === l && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(243,24,103,1)]"></div>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TiktokIcon = ({ className }: { className?: string }) => (
   <svg className={className} viewBox="0 -32 448 576" fill="currentColor">
     <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
   </svg>
);

function AchievementBadge({ achievement, align = 'right' }: { achievement: Achievement; align?: 'left' | 'right' }) {
  const isLeft = align === 'left';
  if (achievement.type === 'youtube_trending' || achievement.type === 'youtube_views') {
    const isTrending = achievement.type === 'youtube_trending';
    const isTop1Trending = isTrending && (achievement.value?.toString().trim() === '1' || achievement.value?.toString().toLowerCase().trim() === 'top 1' || achievement.value?.toString().trim() === '#1');
    return (
      <div className={`flex flex-row items-center gap-2 sm:gap-2.5 w-full ${isLeft ? 'justify-start' : 'justify-end'} group/badge`}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff0f7b] to-[#f89b29] p-[1px] rounded-lg sm:rounded-xl shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-flicker-yt">
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-[7px] sm:rounded-[11px] flex items-center justify-center border border-red-400/20">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white ml-0.5 shadow-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" fill="currentColor" />
          </div>
        </div>
        <div className={`flex flex-col gap-0.5 ${isLeft ? 'items-start' : 'items-end'} justify-center`}>
           <div className="border border-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md flex items-center justify-center shadow-[0_0_4px_rgba(239,68,68,0.15)] animate-flicker-yt">
             <span className="text-[7.5px] sm:text-[8px] font-black text-red-500 tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               YOUTUBE
             </span>
           </div>
           <h4 className={`text-[9.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 ${isTop1Trending ? 'animate-yt-top1' : 'animate-slow-glow-yt'}`}>
             {isTrending ? (
                 <><span className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">TOP {achievement.value}</span> <span className="text-stone-200">Trending</span></>
             ) : (
                 <><span className="text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.3)]">&gt; {achievement.value}</span> <span className="text-stone-200">Views</span></>
             )}
           </h4>
        </div>
      </div>
    );
  }

  if (achievement.type === 'tiktok_viral') {
    return (
      <div className={`flex flex-row items-center gap-2 sm:gap-2.5 w-full ${isLeft ? 'justify-start' : 'justify-end'} group/badge`}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-bl from-[#00f2fe] via-black to-[#fe0979] p-[1px] rounded-lg sm:rounded-xl shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-flicker-tt">
          <div className="w-full h-full bg-black rounded-[7px] sm:rounded-[11px] flex items-center justify-center border border-white/5">
            <TiktokIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0.5 ${isLeft ? 'items-start' : 'items-end'} justify-center`}>
           <div className="border border-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-md flex items-center justify-center shadow-[0_0_4px_rgba(20,184,166,0.15)] animate-flicker-tt">
             <span className="text-[7.5px] sm:text-[8px] font-black text-teal-400 tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               TIKTOK
             </span>
           </div>
           <h4 className="text-[9.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-tt">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] via-white to-[#fe0979] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">✨ VIRAL ✨</span>
           </h4>
        </div>
      </div>
    );
  }

  if (achievement.type === 'spotify_streams') {
    return (
      <div className={`flex flex-row items-center gap-2 sm:gap-2.5 w-full ${isLeft ? 'justify-start' : 'justify-end'} group/badge`}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#1ED760] to-[#128a3c] p-[1px] rounded-full shrink-0 shadow-[0_0_10px_rgba(29,185,84,0.3)] animate-flicker-sp">
          <div className="w-full h-full bg-gradient-to-br from-[#1DB954] to-[#169c46] rounded-full flex items-center justify-center border border-white/20">
            <SpotifyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0.5 ${isLeft ? 'items-start' : 'items-end'} justify-center`}>
           <div className="border border-[#1DB954] bg-[#1DB954]/10 px-1.5 py-0.5 rounded-md flex items-center justify-center shadow-[0_0_4px_rgba(29,185,84,0.15)] animate-flicker-sp">
             <span className="text-[7.5px] sm:text-[8px] font-black text-[#1DB954] tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               SPOTIFY
             </span>
           </div>
           <h4 className="text-[9.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-sp">
             <span className="text-[#1DB954] drop-shadow-[0_0_4px_rgba(29,185,84,0.5)]">&gt; {achievement.value}</span> <span className="text-stone-200">Streams</span>
           </h4>
        </div>
      </div>
    );
  }

  if (achievement.type === 'zing_streams') {
    return (
      <div className={`flex flex-row items-center gap-2 sm:gap-2.5 w-full ${isLeft ? 'justify-start' : 'justify-end'} group/badge`}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#a855f7] to-[#6b21a8] p-[1px] rounded-full shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-flicker-zg">
          <div className="w-full h-full bg-gradient-to-br from-[#bc56fd] to-[#801bb6] rounded-full flex items-center justify-center border border-white/20 overflow-hidden">
            <ZingIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] scale-[1.8]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0.5 ${isLeft ? 'items-start' : 'items-end'} justify-center`}>
           <div className="border border-[#a855f7] bg-[#a855f7]/10 px-1.5 py-0.5 rounded-md flex items-center justify-center shadow-[0_0_4px_rgba(168,85,247,0.15)] animate-flicker-zg">
             <span className="text-[7.5px] sm:text-[8px] font-black text-[#bc56fd] tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               ZING MP3
             </span>
           </div>
           <h4 className="text-[9.5px] sm:text-[10px] font-black text-white whitespace-nowrap mt-0.5 animate-slow-glow-zg">
             <span className="text-[#c084fc] drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]">&gt; {achievement.value}</span> <span className="text-stone-200">Streams</span>
           </h4>
        </div>
      </div>
    );
  }

  return null;
}

function AchievementCycle({ achievements, align = 'right' }: { achievements: Achievement[]; align?: 'left' | 'right' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!achievements || achievements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % achievements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [achievements]);

  if (!achievements || achievements.length === 0) return null;

  const isLeft = align === 'left';

  return (
    <div className={`relative w-full h-[40px] sm:h-[48px] flex items-center ${isLeft ? 'justify-start' : 'justify-end'} overflow-visible`}>
      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0.7 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0.7 }}
           transition={{ duration: 0.35, ease: "easeInOut" }}
           className={`relative w-full flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
        >
           <AchievementBadge achievement={achievements[currentIndex]} align={align} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Home() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang] || translations['vi'];
  const [data, setData] = useState<AppData | null>(null);
  const [ytVideos, setYtVideos] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [spotifyInfo, setSpotifyInfo] = useState<any>(null);
  const [visibleMVs, setVisibleMVs] = useState(4);
  const [activeListTab, setActiveListTab] = useState<'demos'|'released'|'albums'>('released');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showArtist, setShowArtist] = useState(false);
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState('');
  const [activeBioSong, setActiveBioSong] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    if (data && data.demos && !hasInitializedTab) {
      const hasReleased = data.demos.some(d => (d.status === 'public' || d.linkType === 'indirect') && !d.isDraft && (d.isReleased || d.linkType === 'indirect'));
      const hasDemos = data.demos.some(d => (d.status === 'public' || d.linkType === 'indirect') && !d.isDraft && (!d.isReleased && d.linkType !== 'indirect'));
      if (!hasReleased && hasDemos) {
        setActiveListTab('demos');
      }
      setHasInitializedTab(true);
    }
  }, [data, hasInitializedTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;

    if (value.endsWith(' ')) {
      const hasReleasedMatches = (data?.demos?.filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft)
        .filter(d => d.isReleased || d.linkType === 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasDemosMatches = (data?.demos?.filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft)
        .filter(d => !d.isReleased && d.linkType !== 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasAlbumsMatches = (data?.playlists?.filter((playlist: any) => {
        const songsInPlaylist = data.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id));
        return songsInPlaylist.length > 0;
      }) || []).some((playlist: any) => {
        if (playlist.title.toLowerCase().includes(trimmed)) return true;
        const songsInPlaylist = data?.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id)) || [];
        return songsInPlaylist.some(d => d.title.toLowerCase().includes(trimmed));
      });

      if (hasReleasedMatches) {
        setActiveListTab('released');
      } else if (hasDemosMatches) {
        setActiveListTab('demos');
      } else if (hasAlbumsMatches) {
        setActiveListTab('albums');
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeListTab]);

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  useEffect(() => {
    if (!data?.autoSwitchTabs) return;
    const tabInterval = setInterval(() => {
      setActiveListTab(prev => {
        if (prev === 'released') return 'demos';
        if (prev === 'demos' && data?.playlists && data.playlists.length > 0) return 'albums';
        return 'released';
      });
    }, 23000);
    return () => clearInterval(tabInterval);
  }, [data]);

  // For slideshow
  useEffect(() => {
    if (!data?.slideshowImages?.length) return;
    const int = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % data.slideshowImages!.length);
    }, 4000); // 4 seconds
    return () => clearInterval(int);
  }, [data?.slideshowImages]);

  // Auto scroll down to tab section after 5 seconds of inactivity
  useEffect(() => {
    let scrolled = false;
    const handleScroll = () => {
      scrolled = true;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    const timeoutId = setTimeout(() => {
      if (!scrolled) {
        const el = document.getElementById('music-tabs-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, []);

  const lastMvElementRef = useCallback((node: HTMLButtonElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleMVs < ytVideos.length) {
        setVisibleMVs(prev => prev + 4);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleMVs, ytVideos.length]);

  const handleSharePlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    let url = window.location.origin + getArtistLink('/playlist/' + playlistId);
    url = formatShareUrl(url);
    await copyToClipboard(url);
    setToast(t.toastCopy || 'Đã copy link!');
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      setData(data);
      if (data) {
        document.title = data.pageTitle || `${t.dDesc} ${data.artistName || 'Nghệ sĩ'}`;
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.faviconUrl;
        }
        if (data.ogImageUrl) {
          let meta = document.querySelector("meta[property='og:image']");
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', 'og:image');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', data.ogImageUrl);
        }
      }
      
      if (data?.youtubePlaylistUrl) {
          const plMatch = data.youtubePlaylistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
          const chMatch = data.youtubePlaylistUrl.match(/channel\/([a-zA-Z0-9_-]+)/);
          let fetchUrl = '';
          if (plMatch) fetchUrl = `/api/youtube-playlist?plId=${plMatch[1]}`;
          else if (chMatch) fetchUrl = `/api/youtube-playlist?chId=${chMatch[1]}`;
          
          if (fetchUrl) {
              fetch(fetchUrl).then(r => r.json()).then(res => {
                  if (Array.isArray(res)) setYtVideos(res);
              }).catch(() => {});
          }
      }
      
      if (data?.spotifyUrl) {
          fetch(`/api/spotify-profile?url=${encodeURIComponent(data.spotifyUrl)}`)
            .then(r => r.json())
            .then(res => {
                if (res) setSpotifyInfo(res);
            }).catch(()=>{});
      }
    });
  }, [t.lDemos]);

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t.load}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex flex-col bg-neutral-950 text-white font-sans selection:bg-rose-500 selection:text-white relative z-0 bg-notebook-dark"
    >
      <SocialCarousel data={data} />
      {data.slideshowImages && data.slideshowImages.length > 0 ? (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-neutral-950">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                 backgroundImage: `url(${data.slideshowImages[currentSlide]})`, 
                 backgroundPosition: 'center 20%', 
                 maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)', 
                 WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)' 
              }}
            />
          </AnimatePresence>
        </div>
      ) : data.homeCoverUrl ? (
        <div className="fixed inset-0 z-[-1] pointer-events-none relative_mask bg-neutral-950">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${data.homeCoverUrl})`, backgroundPosition: 'center 20%', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)' }}></div>
        </div>
      ) : (
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900 via-neutral-950 to-neutral-950"></div>
      )}
      <LanguageSwitcher />
      {playingVideo && (() => {
        const activeSong = ytVideos.find(song => song.videoId === playingVideo);
        const activeTitle = activeSong ? activeSong.title : "MV / Video";
        const ytLink = `https://www.youtube.com/watch?v=${playingVideo}`;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-pointer" onClick={() => setPlayingVideo(null)}>
            {/* Slideshow background behind main overlay player */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {data && data.slideshowImages && data.slideshowImages.length > 0 ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                  style={{ 
                    backgroundImage: `url(${data.slideshowImages[currentSlide]})`,
                    backgroundPosition: 'center 20%'
                  }}
                />
              ) : data && data.homeCoverUrl ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${data.homeCoverUrl})`,
                    backgroundPosition: 'center 20%'
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/50 to-neutral-950/80" />
              )}
              {/* Soft dimming and minimal blurring of the background slideshow */}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
            </div>

            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col z-10 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-3 bg-neutral-900 border-b border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-neutral-350 relative z-10">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                  <span className="font-bold text-white text-[11px] sm:text-sm tracking-tight break-words line-clamp-2 sm:line-clamp-none leading-normal">
                    {activeTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-end shrink-0">
                  <button 
                    className="text-neutral-400 hover:text-white px-2.5 py-0.5 font-bold transition-colors text-base sm:text-lg shrink-0"
                    onClick={() => setPlayingVideo(null)}
                    title={lang === 'vi' ? 'Đóng' : 'Close'}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Clicking this thumbnail direct into the Youtube link in a new tab */}
              <a 
                href={ytLink} 
                target="_blank" 
                rel="noreferrer" 
                className="flex-1 w-full h-full relative bg-neutral-950 group overflow-hidden block"
                title="Bấm để phát trên YouTube ở tab mới"
              >
                {/* Image with fallback urls in standard CSS support structure */}
                <img 
                  src={`https://img.youtube.com/vi/${playingVideo}/maxresdefault.jpg`} 
                  onError={(e) => {
                    // Fallback to hqdefault in case maxresdefault doesn't exist (can happen for older uploads)
                    e.currentTarget.src = `https://img.youtube.com/vi/${playingVideo}/hqdefault.jpg`;
                  }}
                  alt={activeTitle} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Vignette Overlay shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 group-hover:via-black/20 transition-all duration-300" />
                
                {/* Glow ring Play button in middle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none z-10 gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all duration-350 sm:group-hover:scale-110 sm:group-active:scale-95 border border-white/20 relative">
                    <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-35"></span>
                    <Play className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white translate-x-0.5" />
                  </div>
                  
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <h4 className="text-sm sm:text-lg font-black text-white tracking-widest uppercase drop-shadow-md sm:group-hover:text-red-400 transition-colors">
                      {lang === 'vi' ? 'Bấm để phát trên YouTube' : 'Click to Play on YouTube'}
                    </h4>
                  </div>
                </div>
              </a>
            </div>
          </div>
        );
      })()}

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[500px]">

        
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-12">
          <div className="w-full text-center">
            {data.homeCoverUrl ? (
              <div>
                <motion.p 
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  onAnimationComplete={() => setShowArtist(true)}
                  className="text-xl sm:text-2xl text-stone-200 font-medium max-w-3xl mx-auto drop-shadow-lg mb-2"
                >
                  <AutoTranslate text={(!data.artistBio || ["Thiên đường demo của", "Thiên đường âm nhạc của"].includes(data.artistBio?.trim() || '')) ? t.dDesc : data.artistBio} />
                </motion.p>
                <AnimatePresence>
                  {showArtist && (
                    <motion.h1 
                      initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="relative inline-flex items-start justify-center gap-1 sm:gap-1.5 md:gap-2 text-4xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-black mb-4 tracking-tighter text-white drop-shadow-2xl whitespace-nowrap"
                    >
                      <span>{formatText(data.artistName)}</span>
                      <div className="relative group inline-flex items-center justify-center -top-2 sm:-top-4 md:-top-6 lg:-top-8">
                        <BadgeCheck className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-500 fill-blue-500/20 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0 cursor-pointer" />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-neutral-900 border border-white/10 text-white text-[11px] sm:text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-50 tracking-normal normal-case leading-none">
                          Nghệ sĩ đã xác thực
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                        </div>
                      </div>
                    </motion.h1>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div 
                className="w-full max-w-3xl border border-white/10 bg-white/5 backdrop-blur-md p-10 rounded-3xl shadow-2xl mx-auto mb-8"
              >
                <motion.p 
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  onAnimationComplete={() => setShowArtist(true)}
                  className="text-lg text-neutral-400 font-medium mb-4"
                >
                  <AutoTranslate text={(!data.artistBio || ["Thiên đường demo của", "Thiên đường âm nhạc của"].includes(data.artistBio?.trim() || '')) ? t.dDesc : data.artistBio} />
                </motion.p>
                <AnimatePresence>
                  {showArtist && (
                    <motion.h1 
                      initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="relative inline-flex items-start justify-center gap-1 sm:gap-1.5 text-3xl sm:text-5xl md:text-6xl font-black mb-0 tracking-tight whitespace-nowrap"
                    >
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-300">
                        {formatText(data.artistName)}
                      </span>
                      <div className="relative group inline-flex items-center justify-center -top-1.5 sm:-top-3 md:-top-4">
                        <BadgeCheck className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 fill-blue-500/20 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0 cursor-pointer" />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-neutral-900 border border-white/10 text-white text-[11px] sm:text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-50 tracking-normal normal-case leading-none">
                          Nghệ sĩ đã xác thực
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                        </div>
                      </div>
                    </motion.h1>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {data.spotifyUrl && (
            <div className="w-full relative z-10 max-w-4xl mx-auto mt-12">
              {(() => {
                const spMatch = data.spotifyUrl.match(/spotify\.com\/(artist|playlist|album|track)\/([a-zA-Z0-9]+)/);
                if (spMatch) {
                  return (
                    <motion.div 
                      key="spotify-embed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: spotifyLoaded ? 1 : 0, y: spotifyLoaded ? 0 : 20 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="w-full bg-black/20 p-2 sm:p-4 md:p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-4"
                    >
                      {spotifyInfo && (
                        <div className="flex items-center gap-4 px-2">
                           <img src={spotifyInfo.image} className="w-16 h-16 rounded-full shadow-lg border border-white/20 object-cover" alt="Spotify" />
                           <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-lg">{data.artistName}</span>
                                <div className="w-4 h-4 bg-[#1DB954] rounded-full flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-stone-300">
                                {spotifyInfo.description.replace('người nghe hàng tháng', 'monthly listeners')}
                              </span>
                           </div>
                           <a href={data.spotifyUrl} target="_blank" rel="noreferrer" className="hidden sm:flex ml-auto items-center gap-2 bg-[#1DB954] text-white px-4 py-2 rounded-full hover:scale-105 transition-transform font-bold text-sm">
                             <SpotifyIcon className="w-4 h-4" /> Open Spotify
                           </a>
                        </div>
                      )}
                      
                      <div className="w-full overflow-hidden rounded-2xl relative min-h-[450px]">
                        {!spotifyLoaded && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                             <div className="w-8 h-8 border-4 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin"></div>
                           </div>
                        )}
                        <iframe 
                          src={`https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator&theme=0`} 
                          width="100%" 
                          height="450" 
                          frameBorder="0" 
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                          loading="lazy" 
                          onLoad={() => setSpotifyLoaded(true)}
                          className={`w-full bg-neutral-900 transition-opacity duration-1000 ${spotifyLoaded ? 'opacity-100' : 'opacity-0'}`}
                        ></iframe>
                      </div>
                    </motion.div>
                  );
                }
                return (
                 <div className="flex justify-center mt-6">
                   <a href={data.spotifyUrl} target="_blank" rel="noreferrer" className="inline-flex transition-transform hover:scale-105">
                     <span className="flex items-center gap-2 bg-[#1DB954] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#1DB954]/20 text-lg">
                       <SpotifyIcon className="w-5 h-5" /> {t.btnSpot}
                     </span>
                   </a>
                 </div>
                );
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 space-y-12 sm:space-y-16">
        
        {/* Demos Section */}
        <section id="music-tabs-section" className="scroll-mt-24">
          {/* Header Row with compact Search Box */}
          <div className="flex items-center justify-between mb-4">
            <div className={`${isHomeSearchExpanded ? 'hidden sm:flex' : 'flex'} text-base sm:text-lg font-bold tracking-tight text-white/95 items-center gap-2 shrink-0`}>
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <span>Kho Nhạc</span>
            </div>

            <div className="relative flex items-center flex-1 sm:flex-initial justify-end">
              <AnimatePresence initial={false}>
                {isHomeSearchExpanded ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: window.innerWidth < 640 ? 240 : 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden relative flex items-center"
                  >
                    <input
                      type="text"
                      id="home-search-input"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Tìm kiếm bài hát..."
                      className="w-full bg-neutral-900/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-500 font-medium"
                      autoFocus
                    />
                    <span className="absolute left-3 text-stone-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                        }}
                        className="absolute right-3 text-stone-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <button
                onClick={() => {
                  if (isHomeSearchExpanded) {
                    setIsHomeSearchExpanded(false);
                    setSearchQuery('');
                  } else {
                    setIsHomeSearchExpanded(true);
                  }
                }}
                className={`p-2 rounded-xl transition-all ${
                  isHomeSearchExpanded 
                    ? 'text-stone-400 hover:text-white ml-2' 
                    : 'bg-neutral-900/50 border border-white/5 hover:bg-neutral-800/80 text-stone-400 hover:text-white'
                }`}
                title={isHomeSearchExpanded ? "Đóng tìm kiếm" : "Tìm kiếm bài hát"}
              >
                {isHomeSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="relative flex items-center gap-1 sm:gap-2 mb-6 bg-neutral-900/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/5 w-full flex-nowrap overflow-x-auto custom-scrollbar">
             <button 
               onClick={() => setActiveListTab('released')} 
               className={`relative flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-base md:text-xl font-bold tracking-tight transition-all duration-300 ${activeListTab === 'released' ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`}
             >
                {activeListTab === 'released' && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/20 rounded-lg sm:rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Music className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 ${activeListTab === 'released' ? 'text-emerald-400' : 'text-neutral-400'}`} />
                <span className="whitespace-nowrap relative z-10">{data?.tab1Name || t.lReleasedMobile || t.lReleased}</span>
             </button>
             
             <button 
               onClick={() => setActiveListTab('demos')} 
               className={`relative flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-base md:text-xl font-bold tracking-tight transition-all duration-300 ${activeListTab === 'demos' ? 'text-rose-400' : 'text-white/60 hover:text-white'}`}
             >
                {activeListTab === 'demos' && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-rose-500/20 border border-rose-500/20 rounded-lg sm:rounded-xl shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Disc3 className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 ${activeListTab === 'demos' ? 'text-rose-400' : 'text-neutral-400'}`} />
                <span className="whitespace-nowrap relative z-10">{data?.tab2Name || t.lDemosMobile || t.lDemos}</span>
             </button>
             
             {data?.playlists && data.playlists.length > 0 && (
               <button 
                 onClick={() => setActiveListTab('albums')} 
                 className={`relative flex items-center justify-center flex-1 sm:flex-none gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-2 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-base md:text-xl font-bold tracking-tight transition-all duration-300 ${activeListTab === 'albums' ? 'text-purple-400' : 'text-white/60 hover:text-white'}`}
               >
                  {activeListTab === 'albums' && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-purple-500/20 border border-purple-500/20 rounded-lg sm:rounded-xl shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <ListMusic className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 ${activeListTab === 'albums' ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap relative z-10">{data?.tab3Name || "Album/EP"}</span>
               </button>
             )}
          </div>
          
          {(() => {
            let currentListItems = activeListTab === 'albums' 
              ? (data?.playlists?.filter((playlist: any) => {
                  const songsInPlaylist = data.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id));
                  return songsInPlaylist.length > 0;
                }) || [])
              : (data?.demos.filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft).filter(d => activeListTab === 'demos' ? (!d.isReleased && d.linkType !== 'indirect') : (d.isReleased || d.linkType === 'indirect')) || []);

            if (searchQuery.trim()) {
              const query = searchQuery.trim().toLowerCase();
              if (activeListTab === 'albums') {
                currentListItems = currentListItems.filter((playlist: any) => {
                  if (playlist.title.toLowerCase().includes(query)) return true;
                  const songsInPlaylist = data?.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id)) || [];
                  return songsInPlaylist.some(d => d.title.toLowerCase().includes(query));
                });
              } else {
                currentListItems = currentListItems.filter((d: any) => d.title.toLowerCase().includes(query));
              }
            }

            const totalItems = currentListItems.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedItems = currentListItems.slice(startIndex, startIndex + pageSize);

            const activeColorClass = activeListTab === 'released' 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] border-emerald-500'
              : activeListTab === 'demos'
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.45)] border-rose-500'
              : 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.45)] border-purple-500';

            const activeRingColor = activeListTab === 'released'
              ? 'focus:ring-emerald-500/50'
              : activeListTab === 'demos'
              ? 'focus:ring-rose-500/50'
              : 'focus:ring-purple-500/50';

            const activeHoverBorderColor = activeListTab === 'released'
              ? 'hover:border-emerald-500/50'
              : activeListTab === 'demos'
              ? 'hover:border-rose-500/50'
              : 'hover:border-purple-500/50';

            return (
              <>
                {totalItems === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="col-span-full py-16 px-4 text-center rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center shadow-lg"
                  >
                    <Disc3 className="w-12 h-12 text-neutral-600 animate-spin-slow mb-4" />
                    <p className="text-neutral-300 font-bold text-lg">Chưa có bài hát nào</p>
                    <p className="text-neutral-500 text-sm mt-1">Danh sách đang được cập nhật, bạn vui lòng quay lại sau nhé!</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={activeListTab}
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.04
                        }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {activeListTab === 'albums' ? (
                      paginatedItems.map((playlist: any) => {
                        const songsInPlaylist = data.demos.filter(d => d.status === 'public' && !d.isDraft && d.playlistIds && d.playlistIds.includes(playlist.id));
                        if (songsInPlaylist.length === 0) return <React.Fragment key={playlist.id} />;
                        
                        let coverUrl = playlist.coverUrl || '';
                        if (!coverUrl && data.slideshowImages && data.slideshowImages.length > 0) {
                           const hash = Array.from(playlist.id as string).reduce((sum: number, char: any) => sum + char.charCodeAt(0), 0);
                           coverUrl = data.slideshowImages[hash % data.slideshowImages.length];
                        }

                        return (
                          <motion.div
                            key={playlist.id}
                            variants={{
                              hidden: { opacity: 0, y: 15 },
                              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                            }}
                          >
                            <Link to={getArtistLink(`/playlist/${playlist.id}`)} className="group relative bg-neutral-900/50 border border-white/5 hover:border-purple-500/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] overflow-hidden flex items-center gap-3 sm:gap-4 w-full">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 transition-all duration-500"></div>
                              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden relative z-10 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                                {coverUrl ? (
                                   <img src={coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={playlist.title} />
                                ) : (
                                   <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-purple-500 transition-colors">
                                     <ListMusic className="w-6 h-6 sm:w-8 sm:h-8" />
                                   </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                                    <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 relative z-10 pr-12">
                                <h3 className="text-base sm:text-lg font-bold group-hover:text-purple-400 transition-colors truncate">
                                  {playlist.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-400 mt-1">{songsInPlaylist.length} bài hát</p>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  let url = window.location.origin + getArtistLink(`/playlist/${playlist.id}`);
                                  url = formatShareUrl(url);
                                  await copyToClipboard(url);
                                  setToast('Đã copy link playlist!');
                                  setTimeout(() => setToast(''), 3000);
                                }}
                                className="absolute bottom-3 right-3 z-20 bg-black/40 hover:bg-black/70 text-white/80 hover:text-white p-2 rounded-full border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 active:scale-90"
                                title="Chia sẻ playlist"
                              >
                                <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                              </button>
                            </Link>
                          </motion.div>
                        );
                      })
                    ) : (
                      paginatedItems.map((demo: any) => (
                        <motion.div
                          key={demo.id}
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                          }}
                        >
                          <Link 
                            to={activeListTab === 'released' ? getArtistLink(`/playlist/released?song=${demo.slug || demo.id}`) : getArtistLink(`/song/${demo.slug || demo.id}`)} 
                            onClick={(e) => {
                              if (demo.linkType === 'indirect') {
                                e.preventDefault();
                                const indirectLinks = [
                                  demo.linkSpotify, 
                                  demo.linkApple, 
                                  demo.linkZing, 
                                  demo.linkYoutubeMusic, 
                                  demo.linkYoutube
                                ].filter(l => !!l);
                                
                                if (indirectLinks.length === 1 && indirectLinks[0]) {
                                   window.open(indirectLinks[0], '_blank');
                                } else {
                                   setActiveBioSong(demo);
                                }
                              }
                            }}
                            className={`group relative rounded-2xl p-3 sm:p-4 transition-all duration-300 flex items-center gap-3 w-full ${demo.achievements?.length ? 'hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]' : 'hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]'}`}
                          >
                            {demo.achievements && demo.achievements.length > 0 ? (
                              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_280deg,theme(colors.amber.500)_360deg)] animate-rotate-border z-0 opacity-80" />
                                <div className="absolute inset-[1px] rounded-[15px] bg-neutral-900/80 backdrop-blur-md z-0" />
                                <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-br from-amber-950/30 to-transparent z-0" />
                                <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-shimmer-sweep z-0 pointer-events-none skew-x-[-20deg]" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 bg-neutral-900/50 border border-white/5 group-hover:border-rose-500/50 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/10 transition-all duration-500 z-0"></div>
                              </div>
                            )}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative z-10 select-none">
                              <div className="w-full h-full rounded-xl overflow-hidden relative border border-white/10 group-hover:border-rose-500/30 transition-colors">
                                {demo.coverUrl ? (
                                   <img src={demo.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={demo.title} />
                                ) : (
                                   <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-rose-500 transition-colors">
                                      <Disc3 className="w-6 h-6 sm:w-8 sm:h-8" />
                                   </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                                    <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`flex-1 min-w-0 relative z-10 flex flex-col justify-center ${demo.achievements?.length ? 'pr-1.5' : (demo.isReleased ? 'pr-12' : 'pr-4')}`}>
                              <h3 className={`font-bold transition-colors ${demo.achievements?.length ? 'text-[11px] sm:text-[13px] group-hover:text-amber-400 leading-tight whitespace-normal break-words' : 'text-base sm:text-lg group-hover:text-rose-400 truncate'}`}>
                                <HoverTranslate text={demo.title} format={true} />
                              </h3>
                              <p className={`text-neutral-400 mt-1 ${demo.achievements?.length ? 'text-[9px] leading-tight whitespace-normal break-words' : 'text-xs truncate'}`}>
                                {formatText(demo.singer || demo.author || data?.artistName || 'Nghệ sĩ', true)}
                              </p>
                            </div>
                            {demo.achievements && demo.achievements.length > 0 && (
                              <div className="relative z-10 shrink-0 w-[120px] sm:w-[150px] pr-2 sm:pr-3">
                                 <AchievementCycle achievements={demo.achievements} />
                              </div>
                            )}
                            {demo.isReleased ? (
                              <>
                                <span className="absolute top-0 right-0 translate-x-[20%] -translate-y-[10%] rotate-[15deg] bg-emerald-600 text-[7px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(5,150,105,0.6)] tracking-widest border border-emerald-400/50 select-none flex-shrink-0 z-20 animate-released-wiggle">
                                  {t.lReleasedMark || 'RELEASED'}
                                </span>
                                <button
                                  key="share-btn"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    let url = window.location.origin + getArtistLink(`/song/${demo.slug || demo.id}`);
                                    url = formatShareUrl(url);
                                    await copyToClipboard(url);
                                    setToast('Đã copy link bài hát!');
                                    setTimeout(() => setToast(''), 3000);
                                  }}
                                  className="absolute bottom-3 right-3 z-20 bg-black/40 hover:bg-black/70 text-white/80 hover:text-white p-2 rounded-full border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 active:scale-90"
                                  title="Chia sẻ bài hát"
                                >
                                  <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={`absolute top-2 right-2 rotate-[15deg] ${demo.linkType === 'indirect' ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.8)]' : 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)]'} text-[8px] font-black text-white px-1.5 py-0.5 rounded animate-[pulse_2s_ease-in-out_infinite] tracking-widest border border-white/20 select-none flex-shrink-0 z-20`}>
                                  {demo.linkType === 'indirect' ? 'Landing Page' : (t.lDemoMark || 'DEMO')}
                                </span>
                              </>
                            )}
                            {(demo.password || data?.globalPassword) && !demo.isReleased && demo.linkType !== 'indirect' && (
                              <div className="absolute bottom-3 right-3 z-20 bg-black/60 p-1.5 rounded-full border border-white/10 shadow-md">
                                 <Lock className="w-3.5 h-3.5 text-yellow-500" />
                              </div>
                            )}
                            {demo.releaseYear && (
                              <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-rose-950/90 via-stone-900/90 to-amber-950/85 backdrop-blur-[4px] text-[8px] sm:text-[9.5px] font-mono font-black text-rose-200 px-3 py-0.5 rounded-tr-xl rounded-bl-[15px] border-t border-r border-rose-500/30 z-20 transition-all duration-300 group-hover:from-rose-600 group-hover:to-pink-600 group-hover:text-white group-hover:border-rose-400/50 shadow-[0_2px_12px_rgba(244,63,94,0.15)] group-hover:shadow-[0_4px_20px_rgba(244,63,94,0.4)] pointer-events-none select-none tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse group-hover:bg-white shrink-0"></span>
                                {demo.releaseYear}
                              </div>
                            )}
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {totalItems > 0 && (
                  <div className="col-span-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                      <span>Hiển thị</span>
                      <select 
                        value={pageSize} 
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={`bg-neutral-900/90 border border-white/20 rounded-xl px-3 py-1.5 text-white cursor-pointer backdrop-blur-md transition-all duration-300 hover:bg-neutral-800/90 hover:border-white/40 focus:outline-none focus:ring-2 ${activeRingColor} text-xs sm:text-sm shadow-lg`}
                      >
                        <option value={20} className="bg-neutral-900 text-white">20</option>
                        <option value={50} className="bg-neutral-900 text-white">50</option>
                        <option value={100} className="bg-neutral-900 text-white">100</option>
                      </select>
                      <span>bài / trang (Tổng: {totalItems})</span>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                            const el = document.getElementById('music-tabs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md ${
                            currentPage === 1 
                              ? 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                              : `bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 ${activeHoverBorderColor} active:scale-95`
                          }`}
                        >
                          Trước
                        </button>
                        
                        {(() => {
                          const pages: number[] = [];
                          let startPage = Math.max(1, currentPage - 2);
                          let endPage = Math.min(totalPages, startPage + 4);
                          if (endPage - startPage < 4) {
                            startPage = Math.max(1, endPage - 4);
                          }
                          for (let p = startPage; p <= endPage; p++) {
                            pages.push(p);
                          }
                          return pages.map(page => {
                            const isCurrent = currentPage === page;
                            return (
                              <button
                                key={page}
                                onClick={() => {
                                  setCurrentPage(page);
                                  const el = document.getElementById('music-tabs-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-9 h-9 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md flex items-center justify-center ${
                                  isCurrent 
                                    ? activeColorClass 
                                    : `bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/15 ${activeHoverBorderColor} active:scale-95`
                                }`}
                              >
                                {page}
                              </button>
                            );
                          });
                        })()}
                        
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                            const el = document.getElementById('music-tabs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md ${
                            currentPage === totalPages 
                              ? 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                              : `bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 ${activeHoverBorderColor} active:scale-95`
                          }`}
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </section>

        {/* Released Songs Section */}
        {ytVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8 px-4 border-b border-white/10 pb-4">
              <Music className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-bold tracking-tight">{t.rMv}</h2>
            </div>
            <div className="space-y-4">
              {ytVideos.slice(0, visibleMVs).map((song, i) => (
                <button 
                  ref={i === visibleMVs - 1 ? lastMvElementRef : null}
                  onClick={() => setPlayingVideo(song.videoId)} key={song.videoId} 
                  className="w-full text-left flex items-center gap-4 bg-neutral-900 border border-white/5 hover:bg-neutral-800 rounded-xl p-3 transition-colors group">
                  <div className="w-24 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`} alt={song.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                       <Play className="w-6 h-6 text-white drop-shadow-md opacity-70 group-hover:opacity-100" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-emerald-400 transition-colors pr-2 break-words">{song.title}</h3>
                </button>
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="py-8 text-center text-sm border-t border-white/10 relative z-10">
        <a href="https://Chorus.vn" target="_blank" rel="noopener noreferrer" className="font-bold tracking-wider text-rose-500/80 hover:text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all">
          Powered by Chorus.vn
        </a>
      </footer>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md text-white border border-white/20 px-5 py-3 rounded-2xl shadow-2xl z-[500] flex items-center gap-2 font-mono text-xs animate-bounce">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
           {toast}
        </div>
      )}

      {/* Indirect Bio Card Popup */}
      <AnimatePresence>
        {activeBioSong && (
          <IndirectBioCard 
            demo={{...activeBioSong, coverUrl: getPreviewUrl(activeBioSong.coverUrl)}} 
            onClose={() => setActiveBioSong(null)} 
            isStandalone={false}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const resolveUploadUrl = (url: string | undefined): string => {
  if (!url) return '';
  const uploadsIndex = url.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return url.substring(uploadsIndex);
  }
  return url;
};

const formatShareUrl = (url: string): string => {
  if (!url) return '';
  return url
    .replace(/xn--ti-jia\.com/gi, 'tài.com')
    .replace(/xn--ti-8ja\.com/gi, 'tài.com')
    .replace(/xn--ti-.*\.com/gi, 'tài.com');
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("Clipboard API failed, using fallback copy method.", e);
    }
  }
  
  // Fallback copy method
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy method failed.", err);
    return false;
  }
};

const getAudioPlayUrl = (url: string) => {
  if (!url) return '';
  // Convert Google Drive share link to proxied backend URL to bypass CORS/cookie restrictions
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]{25,})/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  return url;
};

function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(!isPreview);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const almostEndedTriggered = useRef(false);
  const [currentSrc, setCurrentSrc] = useState(getAudioPlayUrl(src));
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentSrc(getAudioPlayUrl(src));
    setAudioError(null);
  }, [src]);

  useEffect(() => {
    almostEndedTriggered.current = false;
    if (audioRef.current && !isPreview) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          if (error.name !== 'AbortError') {
            console.warn("Autoplay was prevented or playback was interrupted", error);
            setIsPlaying(false);
          }
        });
      }
    } else if (isPreview) {
        setIsPlaying(false);
    }
  }, [currentSrc, isPreview]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.warn("Play interrupted or prevented", error);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(true);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cTime = audioRef.current.currentTime;
      const dTime = audioRef.current.duration;
      setCurrentTime(cTime);
      
      if (dTime && dTime > 0 && dTime - cTime <= 2 && !almostEndedTriggered.current) {
        almostEndedTriggered.current = true;
        if (onAlmostEnded) onAlmostEnded();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const waves = Array.from({ length: 32 });

  const isLight = ['1', '4', '6', '7', '9', '17'].includes(template);
  let waveColorClass = "bg-white";
  if (template === '1') waveColorClass = "bg-orange-500";
  if (template === '2') waveColorClass = "bg-fuchsia-300";
  if (template === '3') waveColorClass = "bg-slate-300";
  if (template === '4') waveColorClass = "bg-teal-600";
  if (template === '5') waveColorClass = "bg-red-100";
  if (template === '6') waveColorClass = "bg-pink-600";
  if (template === '7') waveColorClass = "bg-stone-800";
  if (template === '8') waveColorClass = "bg-yellow-400";
  if (template === '9') waveColorClass = "bg-sky-600";
  if (template === '10') waveColorClass = "bg-yellow-400";
  if (template === '11') waveColorClass = "bg-[#d4af37]";
  if (template === '12') waveColorClass = "bg-[#d97706]";
  if (template === '13') waveColorClass = "bg-[#f43f5e]";
  if (template === '14') waveColorClass = "bg-[#38bdf8]";
  if (template === '15') waveColorClass = "bg-[#10b981]";
  if (template === '16') waveColorClass = "bg-purple-500";
  if (template === '17') waveColorClass = "bg-yellow-400";
  if (template === '18') waveColorClass = "bg-amber-300";

  const shouldAnimateWave = isPlaying || isPreview;

  return (
    <div 
      className={`flex flex-col w-full gap-2 md:gap-4 ${isLight ? 'text-stone-900 font-extrabold drop-shadow-sm' : 'text-white font-extrabold drop-shadow-md'}`}
      style={lyricsColor ? { color: lyricsColor } : undefined}
    >
      <audio 
        ref={audioRef} 
        src={currentSrc || undefined} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        onError={() => {
          // If the Google Drive link fails to play, fall back to the backup traditional uploaded file if available
          if (backupAudioUrl && currentSrc && (currentSrc.includes('drive.google.com') || currentSrc.includes('docs.google.com') || currentSrc.includes('/api/proxy-audio'))) {
            console.log("Google Drive play error. Falling back to traditional uploaded audio:", backupAudioUrl);
            setCurrentSrc(getAudioPlayUrl(backupAudioUrl));
            setAudioError(null);
            return;
          }
          if (currentSrc && currentSrc.includes('firebasestorage.googleapis.com') && currentSrc.includes('uploads%2F')) {
            try {
              const parts = currentSrc.split('uploads%2F');
              if (parts.length > 1) {
                const filename = parts[1].split('?')[0];
                const fallbackUrl = `/uploads/${decodeURIComponent(filename)}`;
                console.log("Audio Error: Chuyển hướng nhạc sang local fallback:", fallbackUrl);
                setCurrentSrc(fallbackUrl);
                setAudioError(null);
                return;
              }
            } catch (err) {
              console.error("Audio fallback calculation failed", err);
            }
          }
          if (currentSrc && (currentSrc.includes('drive.google.com') || currentSrc.includes('docs.google.com') || currentSrc.includes('/api/proxy-audio'))) {
            setAudioError("Không thể tải nhạc từ Google Drive. Vui lòng kiểm tra và chắc chắn liên kết đã được chia sẻ ở chế độ CÔNG KHAI (Bất kỳ ai có liên kết đều xem được).");
          } else {
            setAudioError("Không thể phát file nhạc này. Vui lòng kiểm tra lại định dạng hoặc liên kết file.");
          }
        }}
        loop={playlistContext?.repeat === 2}
      />
      
      {/* Wave visualizer */}
      <div 
        className="flex items-end justify-between h-4 md:h-5 w-full mb-0"
      >
        {waves.map((_, i) => {
          const randDur = 0.5 + Math.random() * 0.8;
          return (
             <div 
              key={i} 
              className={`w-1 rounded-full ${waveColorClass} transition-all duration-300 origin-bottom opacity-90 drop-shadow-sm`}
              style={{
                height: shouldAnimateWave ? '100%' : '15%',
                animation: shouldAnimateWave ? `pulse-wave ${randDur}s ease-in-out infinite alternate` : 'none',
                backgroundColor: waveColor || lyricsColor || undefined,
              }}
            ></div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] md:text-xs font-mono opacity-100">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <input 
        type="range" 
        min={0} 
        max={duration || 0} 
        value={currentTime} 
        onChange={handleProgressChange}
        className={`w-full h-1 md:h-1.5 ${isLight ? 'bg-black/20' : 'bg-white/30'} rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 ${isLight ? '[&::-webkit-slider-thumb]:bg-stone-800' : '[&::-webkit-slider-thumb]:bg-white'} [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-transform outline-none`}
      />

      {audioError && (
        <div className="text-[10px] md:text-xs text-red-600 font-bold bg-white/90 border border-red-300 rounded-xl px-3 py-2 text-center my-1 select-none flex items-center justify-center gap-1.5 leading-relaxed shadow-sm">
          <span className="shrink-0 text-xs">⚠️</span>
          <span>{audioError}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-1 md:mt-2">
         {/* Volume */}
         <div className="flex items-center gap-2 group w-20 md:w-24">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 hover:opacity-100 cursor-pointer drop-shadow-sm"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.01} 
              value={volume} 
              onChange={handleVolumeChange}
              className={`w-full h-1.5 ${isLight ? 'bg-black/20' : 'bg-white/30'} rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 ${isLight ? '[&::-webkit-slider-thumb]:bg-stone-800' : '[&::-webkit-slider-thumb]:bg-white'} [&::-webkit-slider-thumb]:rounded-full outline-none`}
            />
         </div>

        {playlistContext ? (
          <div className="flex items-center gap-4">
             <button onClick={() => playlistContext.setShuffle(!playlistContext.shuffle)} className={`opacity-60 hover:opacity-100 ${playlistContext.shuffle ? 'text-blue-400 opacity-100' : ''}`}><Shuffle className="w-4 h-4 md:w-5 md:h-5" /></button>
             <button onClick={playlistContext.handlePrev} className="opacity-80 hover:opacity-100 hover:scale-110 transition"><SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" /></button>
             <button 
               onClick={togglePlay}
               className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center ${isLight ? 'bg-stone-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.15)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'} rounded-full hover:scale-105 transition-all outline-none`}
             >
               {isPlaying ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
               )}
             </button>
             <button onClick={playlistContext.handleNext} className="opacity-80 hover:opacity-100 hover:scale-110 transition"><SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" /></button>
             <button onClick={() => playlistContext.setRepeat((playlistContext.repeat + 1) % 3)} className={`opacity-60 hover:opacity-100 ${playlistContext.repeat > 0 ? 'text-blue-400 opacity-100' : ''}`}>
               {playlistContext.repeat === 2 ? <Repeat1 className="w-4 h-4 md:w-5 md:h-5" /> : <Repeat className="w-4 h-4 md:w-5 md:h-5" />}
             </button>
          </div>
        ) : (
          <button 
            onClick={togglePlay}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center ${isLight ? 'bg-stone-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.15)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'} rounded-full hover:scale-105 transition-all outline-none`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
        )}

        <div className="w-20 md:w-24 flex justify-end"></div>
      </div>
    </div>
  );
}

function ButterflyEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[30] opacity-60">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute animate-float-shape"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 8 + 6}s`,
            animationDelay: `${Math.random() * -10}s`
          }}
        >
          <div className="text-xl md:text-3xl animate-[spin_4s_linear_infinite]" style={{ animationDirection: i % 2 === 0 ? 'normal' : 'reverse' }}>🦋</div>
        </div>
      ))}
    </div>
  );
}

function CandyEffect() {
  const candies = ['🍬', '🍭', '🍫', '🍡'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-80">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-xl md:text-2xl animate-snow will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * -15}s`
          }}
        >
          {candies[Math.floor(Math.random() * candies.length)]}
        </div>
      ))}
    </div>
  );
}

function ElectricEffect() {
  const colorMap = [
    { bg: 'bg-red-500', hex: '#ef4444' },
    { bg: 'bg-blue-500', hex: '#3b82f6' },
    { bg: 'bg-green-500', hex: '#22c55e' },
    { bg: 'bg-yellow-500', hex: '#eab308' },
    { bg: 'bg-purple-500', hex: '#a855f7' },
    { bg: 'bg-pink-500', hex: '#ec4899' },
    { bg: 'bg-cyan-500', hex: '#06b6d4' }
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[30] opacity-50">
      {Array.from({ length: 15 }).map((_, i) => {
        const item = colorMap[i % colorMap.length];
        const height = Math.random() * 100 + 50;
        const duration = Math.random() * 5 + 3;
        const delay = Math.random() * -5;
        const blinkDelay = Math.random() * 1.8;
        return (
          <div 
            key={i} 
            className={`absolute w-1 rounded-full ${item.bg}`}
            style={{
              left: `${Math.random() * 100}%`,
              height: `${height}px`,
              animation: `snow ${duration}s linear infinite, neon-blink 1.8s infinite ease-in-out`,
              animationDelay: `${delay}s, ${blinkDelay}s`,
              '--neon-color': item.hex
            } as React.CSSProperties}
          ></div>
        );
      })}
    </div>
  );
}

function ChainEffect() {
  const chains = ['⛓️', '💎', '💰', '👑'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[30] opacity-70">
      {Array.from({ length: 25 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-2xl md:text-3xl animate-snow will-change-transform drop-shadow-md"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 8 + 4}s`,
            animationDelay: `${Math.random() * -10}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          {chains[Math.floor(Math.random() * chains.length)]}
        </div>
      ))}
    </div>
  );
}

function NoteEffect() {
  const notes = ['🎵', '🎼', '🎶', '♩', '♪', '♫', '♬'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-2xl md:text-4xl animate-snow will-change-transform drop-shadow-sm text-stone-100"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 12 + 6}s`,
            animationDelay: `${Math.random() * -15}s`
          }}
        >
          {notes[Math.floor(Math.random() * notes.length)]}
        </div>
      ))}
    </div>
  );
}

function EightBitEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[30] opacity-30">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute w-4 h-4 bg-white animate-snow will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 2}s`,
            animationDelay: `${Math.random() * -10}s`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
          }}
        ></div>
      ))}
    </div>
  );
}

function SnowEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 40 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-white/30 rounded-full animate-snow will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
            animationDuration: `${Math.random() * 15 + 5}s`,
            animationDelay: `${Math.random() * -15}s`
          }}
        ></div>
      ))}
    </div>
  );
}

function CuteEffect() {
  const shapes = ['rounded-full', 'rounded-lg rotate-45', 'rounded-tl-3xl rounded-br-3xl'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i} 
          className={`absolute bg-[#fef08a] animate-float-shape ${shapes[i % 3]}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 40 + 20}px`,
            height: `${Math.random() * 40 + 20}px`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * -10}s`
          }}
        ></div>
      ))}
    </div>
  );
}

function BlossomEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-pink-300 animate-snow will-change-transform opacity-70 shadow-[0_0_8px_rgba(244,114,182,0.4)]"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 6 + 4}px`,
            borderRadius: '2px 10px',
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * -10}s`,
            filter: 'blur(0.5px)',
          }}
        ></div>
      ))}
    </div>
  );
}

function LeavesEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 25 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute bg-yellow-600/30 animate-snow will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 12 + 6}px`,
            height: `${Math.random() * 8 + 4}px`,
            animationDuration: `${Math.random() * 12 + 4}s`,
            animationDelay: `${Math.random() * -12}s`,
            borderRadius: '50% 0 50% 0' // leaf shape
          }}
        ></div>
      ))}
    </div>
  );
}

function FlagEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Flag Red base color with shifting shadows for wavy folds */}
      <div 
        className="absolute inset-0 bg-[#da251d]" 
        style={{
          backgroundImage: 'linear-gradient(105deg, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.12) 20%, rgba(0,0,0,0.3) 40%, rgba(255,255,255,0.15) 60%, rgba(0,0,0,0.3) 80%, rgba(255,255,255,0.08) 100%)',
          backgroundSize: '200% 200%',
          animation: 'flag-shadow 8s ease-in-out infinite'
        }}
      />
      {/* Wavy lines layers to add depth of flowing silk */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay animate-pulse" style={{ animationDuration: '4s' }}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 100 Q 250 50, 500 100 T 1000 100 T 1500 100 L 1500 1000 L 0 1000 Z" fill="rgba(255,255,255,0.2)" />
        </svg>
      </div>

      {/* Flag Center Waving Star */}
      <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-0 opacity-80">
        <div className="animate-[flag-weave_6s_ease-in-out_infinite] transform-gpu">
          <svg viewBox="0 0 100 100" className="w-[85vw] h-[85vw] max-w-[420px] max-h-[420px] text-yellow-400 drop-shadow-[0_0_90px_rgba(250,204,21,0.75)]" fill="currentColor">
            <polygon points="50,0 62.5,35 97.5,35 68.75,56.25 81.25,91.25 50,70 18.75,91.25 31.25,56.25 2.5,35 37.5,35" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function RainbowEffect() {
  const cloudsData = [
    { top: '12%', left: '-10%', size: 'scale-[0.6]', duration: '85s', delay: '0s', opacity: 'opacity-80' },
    { top: '24%', left: '-15%', size: 'scale-[0.8]', duration: '65s', delay: '-15s', opacity: 'opacity-70' },
    { top: '38%', left: '-8%', size: 'scale-[0.55]', duration: '110s', delay: '-40s', opacity: 'opacity-85' },
    { top: '55%', left: '-22%', size: 'scale-[0.95]', duration: '50s', delay: '-20s', opacity: 'opacity-65' },
    { top: '70%', left: '-12%', size: 'scale-[0.7]', duration: '95s', delay: '-30s', opacity: 'opacity-75' },
    { top: '8%', left: '-30%', size: 'scale-[0.5]', duration: '130s', delay: '-50s', opacity: 'opacity-90' },
    { top: '48%', left: '-18%', size: 'scale-[0.85]', duration: '75s', delay: '-10s', opacity: 'opacity-75' },
    { top: '62%', left: '-25%', size: 'scale-[1.1]', duration: '45s', delay: '-5s', opacity: 'opacity-60' }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50">
      <style>{`
        @keyframes rainbow-cycle {
          0%, 5% { opacity: 0; transform: translate(-50%, 80px) scale(0.9); }
          15%, 85% { opacity: 0.65; transform: translate(-50%, 0) scale(1); }
          95%, 100% { opacity: 0; transform: translate(-50%, -50px) scale(1.05); }
        }
        @keyframes cloud-swim {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(calc(100vw + 150px)); }
        }
        @keyframes sun-pulsate {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 35px rgba(253, 224, 71, 0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 65px rgba(253, 224, 71, 0.9)); }
        }
        @keyframes sun-rays-spin {
          0% { transform: rotate(0deg); opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: rotate(360deg); opacity: 0.3; }
        }
        .animate-rainbow-slow {
          animation: rainbow-cycle 16s ease-in-out infinite;
        }
        .animate-cloud-slow {
          animation: cloud-swim linear infinite;
        }
        .animate-sun-pulsate {
          animation: sun-pulsate 6s ease-in-out infinite;
        }
        .animate-sun-rays-spin {
          animation: sun-rays-spin 30s linear infinite;
        }
      `}</style>

      {/* Sun backdrop glow & Sun rays */}
      <div className="absolute top-[8%] right-[10%] w-28 h-28 md:w-36 md:h-36 pointer-events-none z-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.25)_0%,transparent_70%)] animate-sun-rays-spin" style={{ transformOrigin: 'center' }}>
          <svg className="w-full h-full text-yellow-300 opacity-30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="10" />
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 360) / 12;
              return (
                <line
                  key={idx}
                  x1="50"
                  y1="50"
                  x2={50 + 42 * Math.cos((angle * Math.PI) / 180)}
                  y2={50 + 42 * Math.sin((angle * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
              );
            })}
          </svg>
        </div>
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 shadow-[0_0_50px_rgba(253,224,71,0.7)] animate-sun-pulsate" />
      </div>

      {/* Gigantic Beautiful Rainbow SVG Backdrop behind the elements */}
      <svg className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[650px] md:w-[950px] h-[325px] md:h-[475px] animate-rainbow-slow origin-bottom z-0" viewBox="0 0 200 100">
        <path d="M 12,100 A 88,88 0 0,1 188,100" fill="none" stroke="#FF4D4D" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="#FF9E3b" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 28,100 A 72,72 0 0,1 172,100" fill="none" stroke="#FFEF3b" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 36,100 A 64,64 0 0,1 164,100" fill="none" stroke="#4DFF4D" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 44,100 A 56,56 0 0,1 156,100" fill="none" stroke="#4D9EFF" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 52,100 A 48,48 0 0,1 148,100" fill="none" stroke="#7A4DFF" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
        <path d="M 60,100 A 40,40 0 0,1 140,100" fill="none" stroke="#D74DFF" strokeWidth="8" strokeLinecap="round" opacity="0.65"/>
      </svg>

      {/* Floating clouds looping left to right */}
      {cloudsData.map((cloud, idx) => (
        <svg 
          key={idx}
          className={`absolute ${cloud.size} ${cloud.opacity} animate-cloud-slow pointer-events-none z-10 w-28 md:w-36`} 
          style={{ 
            top: cloud.top, 
            left: cloud.left, 
            animationDuration: cloud.duration, 
            animationDelay: cloud.delay 
          }} 
          viewBox="0 0 120 70" 
          fill="white"
        >
          <path d="M 20 50 A 20 20 0 0 1 40 20 A 25 25 0 0 1 80 20 A 20 20 0 0 1 100 50 A 15 15 0 0 1 80 65 L 30 65 A 15 15 0 0 1 20 50 Z" />
        </svg>
      ))}
    </div>
  );
}

// ---- DEMO PLAYER PAGE ----
function StreetLightEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
       <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-yellow-500/20 via-yellow-500/5 to-transparent mix-blend-overlay animate-flicker"></div>
       <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(250,204,21,0.1),transparent_50%)] animate-flicker" style={{ animationDelay: '0.2s' }}></div>
       <div className="absolute top-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.1),transparent_50%)] animate-flicker" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
}

function MysteriousEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background stardust */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay animate-flicker"></div>
      
      {/* Moon */}
      <div className="absolute top-[10%] right-[10%] w-[15vw] h-[15vw] min-w-[100px] min-h-[100px] bg-[#fcf5c7] rounded-full shadow-[0_0_120px_rgba(252,245,199,0.5),inset_0_0_40px_rgba(218,165,32,0.8)] opacity-90 mix-blend-screen animate-[pulse_4s_ease-in-out_infinite]">
         {/* Moon craters */}
         <div className="absolute top-[20%] left-[30%] w-[15%] h-[15%] bg-black/10 rounded-full blur-[2px]"></div>
         <div className="absolute top-[50%] left-[20%] w-[25%] h-[20%] bg-black/10 rounded-full blur-[3px]"></div>
         <div className="absolute top-[40%] right-[20%] w-[20%] h-[25%] bg-black/10 rounded-full blur-[2px]"></div>
      </div>
      
      {/* Gold glow around moon */}
      <div className="absolute top-[-5%] right-[0%] w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.2),transparent_50%)] mix-blend-screen animate-flicker pointer-events-none" style={{ animationDuration: '4s' }}></div>
      
      {/* Light smoke */}
      <div className="absolute bottom-0 inset-x-0 h-[50vh] bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent blur-xl"></div>
      
      {/* Rain effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzIiBoZWlnaHQ9IjUwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI1MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] animate-rain" style={{ animationDuration: '0.6s' }}></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjgwIj48cmVjdCB4PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSI3MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvc3ZnPg==')] animate-rain" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}></div>
    </div>
  );
}

function RetroNotesEffect() {
  const notes = ['🎵', '🎶', '♩', '♪', '♫', '♬'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {Array.from({ length: 25 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-xl sm:text-2xl animate-snow will-change-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-[#a16207]"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 6}s`,
            animationDelay: `${Math.random() * -12}s`
          }}
        >
          {notes[i % notes.length]}
        </div>
      ))}
    </div>
  );
}

function SunsetSunEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sunset gold sunset glow */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[35vw] h-[35vw] min-w-[250px] min-h-[250px] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.8),rgba(234,179,8,0.6)_50%,transparent_70%)] opacity-80 animate-[pulse_5s_ease-in-out_infinite]"></div>
      
      {/* Foggy warm layer */}
      <div className="absolute bottom-0 inset-x-0 h-[45vh] bg-gradient-to-t from-[#7c2d12]/30 via-[#7c2d12]/10 to-transparent blur-lg"></div>
    </div>
  );
}

function SunsetLeavesEffect() {
  const colors = ['bg-orange-500/40', 'bg-amber-500/50', 'bg-yellow-500/40', 'bg-red-500/30', 'bg-rose-500/30'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div 
          key={i} 
          className={`absolute ${colors[i % colors.length]} animate-snow will-change-transform`}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 14 + 10}px`,
            height: `${Math.random() * 9 + 5}px`,
            animationDuration: `${Math.random() * 11 + 5}s`,
            animationDelay: `${Math.random() * -12}s`,
            borderRadius: '60% 10% 60% 10%',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        ></div>
      ))}
    </div>
  );
}

function OceanWavesEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Wave layered background */}
      <div className="absolute bottom-0 inset-x-0 h-[120px] bg-gradient-to-t from-sky-450 via-sky-350 to-transparent opacity-30 animate-[pulse_6s_ease-in-out_infinite]"></div>
      {/* Ambient sky/sea radial lighting */}
      <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center_left,rgba(14,165,233,0.15),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,116,144,0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '8s' }}></div>
      
      {/* Waves animations dập dồn at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-25">
        <svg className="absolute bottom-0 w-[200%] h-full translate-x-0 animate-[wave_10s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z" fill="#0ea5e9" />
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-full translate-x-0 animate-[wave_15s_linear_infinite]" style={{ animationDirection: 'reverse', opacity: 0.7 }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C180,90 280,10 480,50 C680,90 780,10 980,50 C1180,90 1280,10 1480,50 L1480,120 L0,120 Z" fill="#38bdf8" />
        </svg>
      </div>
    </div>
  );
}

function OceanNightSkyEffect() {
  const clouds = [
    { top: '10%', scale: 1.0, duration: '40s', delay: '-5s' },
    { top: '22%', scale: 0.7, duration: '60s', delay: '-25s' },
    { top: '5%', scale: 0.4, duration: '85s', delay: '-45s' },
    { top: '35%', scale: 1.2, duration: '45s', delay: '-15s' },
    { top: '18%', scale: 0.6, duration: '70s', delay: '-30s' },
    { top: '48%', scale: 0.9, duration: '50s', delay: '-10s' },
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Crescent Moon */}
      <div 
        className="absolute top-12 right-12 md:top-16 md:right-16 text-5xl md:text-6xl drop-shadow-[0_0_25px_rgba(253,224,71,0.55)] select-none z-10 animate-pulse" 
        style={{ animationDuration: '4s' }}
      >
        🌙
      </div>
      {/* Drifting Clouds */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute text-5xl sm:text-7xl pointer-events-none select-none text-white/12"
          style={{
            top: c.top,
            animation: `drift ${c.duration} linear infinite`,
            animationDelay: c.delay,
            transform: `scale(${c.scale})`,
          }}
        >
          ☁️
        </div>
      ))}
    </div>
  );
}

function EightBitGameEffect() {
  const elements = ['🎮', '👾', '👾', '⭐', '🍒', '🍄', '⚡', '🦖', '🎈', '💖'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-55">
      {/* Scanline pattern for CRT/arcade experience */}
      <div className="absolute inset-0 bg-[#000]/10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px]" />
      
      {/* Optimized radial gradients replacing expensive CSS blurs */}
      <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.15),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
      
      {Array.from({ length: 28 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-xl sm:text-3xl animate-snow drop-shadow-[0_3px_6px_rgba(236,72,153,0.6)] font-mono select-none will-change-transform"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 8 + 5}s`,
            animationDelay: `${Math.random() * -12}s`
          }}
        >
          {elements[i % elements.length]}
        </div>
      ))}
    </div>
  );
}

function PuzzleEffect() {
  const colors = [
    'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]',
    'text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]',
    'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    'text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.8)]',
    'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]',
    'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]',
    'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]',
    'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]'
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1] opacity-75">
      {/* Colorful background ambient blur bubbles */}
      <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-0 right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[20%] right-0 w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_right,rgba(6,182,212,0.15),transparent_50%)] animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-0 left-[20%] w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.1),transparent_50%)] animate-pulse" style={{ animationDuration: '9s' }}></div>

      {Array.from({ length: 30 }).map((_, i) => {
        const colorClass = colors[i % colors.length];
        const randomRot = Math.random() * 360;
        const randomScale = 0.5 + Math.random() * 1.5;
        return (
          <div 
            key={i} 
            className={`absolute text-2xl sm:text-4xl animate-snow will-change-transform select-none ${colorClass}`}
            style={{
              left: `${Math.random() * 100}%`,
              transform: `rotate(${randomRot}deg) scale(${randomScale})`,
              animationDuration: `${Math.random() * 10 + 6}s`,
              animationDelay: `${Math.random() * -15}s`
            }}
          >
            🧩
          </div>
        );
      })}
    </div>
  );
}

function CheeringEffect() {
  const [confettiBursts, setConfettiBursts] = useState<{ id: number; items: any[] }[]>([]);
  const [hatWaves, setHatWaves] = useState<{ id: number; items: any[] }[]>([]);

  const generateConfettiBurst = () => {
    const items = Array.from({ length: 24 }).map((_, i) => {
      const isLeft = i % 2 === 0;
      const colors = ['bg-red-400', 'bg-blue-400', 'bg-emerald-400', 'bg-yellow-300', 'bg-purple-300', 'bg-pink-400'];
      const isSquare = Math.random() > 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = 2.8 + Math.random() * 1.8; // 2.8s to 4.6s max duration
      const bottom = `${10 + Math.random() * 30}%`;
      return {
        isLeft,
        color,
        isSquare,
        duration,
        bottom,
      };
    });
    return {
      id: Date.now() + Math.random(),
      items
    };
  };

  const generateHatWave = (count: number) => {
    const items = Array.from({ length: count }).map((_, i) => {
      const tx = (Math.random() * 40 - 20) + 'vw';
      const ty = `-${25 + Math.random() * 30}vh`; // Heights from -25vh to -55vh
      const left = `${10 + Math.random() * 80}%`;
      const duration = 4.0 + Math.random() * 1.5; // 4.0s to 5.5s
      const delay = Math.random() * 0.7; // Chaotic timing within the wave
      return {
        tx,
        ty,
        left,
        duration,
        delay,
      };
    });
    return {
      id: Date.now() + Math.random(),
      items
    };
  };

  useEffect(() => {
    let confettiTimer1: any;
    let confettiTimer2: any;
    let confettiInterval: any;

    const runConfettiCycle = () => {
      // Wave 1: instant
      const burst1 = generateConfettiBurst();
      setConfettiBursts(prev => [...prev, burst1]);
      confettiTimer1 = setTimeout(() => {
        setConfettiBursts(prev => prev.filter(b => b.id !== burst1.id));
      }, 5500); // Clean after 5.5s (longer than max duration of 4.6s)

      // Wave 2: after 1.2s
      confettiTimer2 = setTimeout(() => {
        const burst2 = generateConfettiBurst();
        setConfettiBursts(prev => [...prev, burst2]);
        setTimeout(() => {
          setConfettiBursts(prev => prev.filter(b => b.id !== burst2.id));
        }, 5500);
      }, 1200);
    };

    runConfettiCycle();
    // 1.2s delay + 4.8s fall time + 2s wait time = 8s cycle!
    confettiInterval = setInterval(runConfettiCycle, 8000);

    return () => {
      clearTimeout(confettiTimer1);
      clearTimeout(confettiTimer2);
      clearInterval(confettiInterval);
    };
  }, []);

  useEffect(() => {
    let hatTimer1: any;
    let hatTimer2: any;
    let hatInterval: any;

    const runHatCycle = () => {
      // Wave 1 immediately: 2 hats
      const wave1 = generateHatWave(2);
      setHatWaves(prev => [...prev, wave1]);
      hatTimer1 = setTimeout(() => {
        setHatWaves(prev => prev.filter(w => w.id !== wave1.id));
      }, 10000); // Clean after 10.0s (longer than max duration + max delay)

      // Wave 2 after close, random interval (0.8s to 1.4s): 2 hats (Total 4 hats per wave)
      const wave2Delay = 800 + Math.random() * 600;
      hatTimer2 = setTimeout(() => {
        const wave2 = generateHatWave(2);
        setHatWaves(prev => [...prev, wave2]);
        setTimeout(() => {
          setHatWaves(prev => prev.filter(w => w.id !== wave2.id));
        }, 10000);
      }, wave2Delay);
    };

    runHatCycle();
    // ~1.4s max wave2Delay + 5.5s max duration + 0.7s delay = ~7.6s total animation time + 7.4s wait time = 15s cycle
    hatInterval = setInterval(runHatCycle, 15000);

    return () => {
      clearTimeout(hatTimer1);
      clearTimeout(hatTimer2);
      clearInterval(hatInterval);
    };
  }, []);

  return (
    <>
      {/* Behind Cover (z-[5]): Sun (mặt trời vẫn ở sau) and Hats */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
        {/* Sun */}
        <div className="absolute top-10 right-10 text-[80px] drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] animate-[cute-spin_8s_ease-in-out_infinite]">
          ☀️
        </div>
        {/* Hats thrown from bottom */}
        {hatWaves.map(wave => 
          wave.items.map((hat, i) => (
            <div
              key={`${wave.id}-${i}`}
              className="absolute text-5xl md:text-6xl drop-shadow-xl will-change-transform"
              style={{
                left: hat.left,
                bottom: '-20%',
                '--tx': hat.tx,
                '--ty': hat.ty,
                animation: `hat-toss ${hat.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                animationDelay: `${hat.delay}s`,
                opacity: 0.4,
                filter: 'brightness(1.5)',
              } as React.CSSProperties}
            >
              🎓
            </div>
          ))
        )}
      </div>

      {/* Confetti (z-[20]) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[20]">
        {/* Rhythmic Burst Confetti */}
        {confettiBursts.map(burst => 
          burst.items.map((conf, i) => (
            <div
              key={`${burst.id}-${i}`}
              className={`absolute ${conf.color} ${conf.isSquare ? 'w-2 h-2' : 'w-1.5 h-3'} will-change-transform`}
              style={{
                left: conf.isLeft ? '-10%' : '110%',
                bottom: conf.bottom,
                animation: conf.isLeft 
                  ? `confetti-right ${conf.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards` 
                  : `confetti-left ${conf.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                opacity: 0.5,
                filter: 'brightness(1.5)',
              }}
            />
          ))
        )}
      </div>

      {/* On top of Cover (z-[45]): Clouds (mây đè lên ảnh bìa z-10 nhưng dưới lời bài hát z-150) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[45]">
        {/* Clouds */}
        <div className="absolute top-20 left-5 text-[60px] animate-[cloud-drift_6s_ease-in-out_infinite] opacity-90 drop-shadow-lg">☁️</div>
        <div className="absolute top-10 left-[30%] text-[70px] animate-[cloud-drift_8s_ease-in-out_infinite] opacity-80 drop-shadow-lg" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-32 right-32 text-[50px] animate-[cloud-drift_7s_ease-in-out_infinite] opacity-90 drop-shadow-md" style={{ animationDelay: '2s' }}>☁️</div>
        <div className="absolute top-16 right-[45%] text-[55px] animate-[cloud-drift_9s_ease-in-out_infinite] opacity-70 drop-shadow-sm" style={{ animationDelay: '3s' }}>☁️</div>
      </div>
    </>
  );
}

function FireworksEffect() {
  const fireworks = Array.from({ length: 15 });
  const buildings = Array.from({ length: 35 }).map((_, i) => ({
    height: 30 + Math.random() * 60,
    width: 20 + Math.random() * 50,
    lights: Math.random() > 0.3,
    delay: Math.random() * 3
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
      {/* Background flash */}
      <div className="absolute inset-0 animate-pulse bg-amber-500/10 mix-blend-screen" style={{ animationDuration: '2s' }}></div>
      
      {fireworks.map((_, i) => {
        const left = 10 + Math.random() * 80;
        return (
          <div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${left}%` }}
          >
             {/* Rocket shooting up */}
             <div className="absolute bottom-0 w-1 rounded-full bg-orange-300 will-change-transform" style={{
                animation: `shootUp ${2 + Math.random()}s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
                animationDelay: `${Math.random() * 4}s`,
             }}></div>
             {/* Explosion ping */}
             <div className="absolute will-change-transform" style={{
                bottom: `${40 + Math.random() * 40}vh`,
                animation: `blowUp ${2 + Math.random()}s ease-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
             }}>
                <div className="w-1.5 h-1.5 rounded-full animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_infinite]" style={{
                  boxShadow: `0 0 60px 20px ${['#fef08a', '#fda4af', '#7dd3fc', '#86efac', '#fca5a5'][Math.floor(Math.random() * 5)]}`,
                  background: 'white',
                  animationDelay: `${Math.random() * 4}s`,
                }}></div>
             </div>
          </div>
        );
      })}

      {/* City Skyline */}
      <div className="absolute bottom-0 inset-x-0 h-[25vh] flex items-end justify-center px-2 opacity-95 z-0">
         {buildings.map((b, i) => (
            <div key={i} className="bg-[#0a0a0a] border-t border-white/5 mx-[1px]" style={{
                height: `${b.height}%`,
                width: `${b.width}px`,
                position: 'relative'
            }}>
                {b.lights && (
                   <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-yellow-200/60 animate-pulse" style={{ animationDelay: `${b.delay}s`}}></div>
                )}
                {b.lights && Math.random() > 0.5 && (
                   <div className="absolute top-10 right-2 w-1.5 h-1.5 bg-yellow-200/40 animate-pulse" style={{ animationDelay: `${b.delay + 1}s`}}></div>
                )}
                {b.lights && Math.random() > 0.7 && (
                   <div className="absolute top-16 left-3 w-1.5 h-1.5 bg-yellow-200/50 animate-pulse" style={{ animationDelay: `${b.delay + 0.5}s`}}></div>
                )}
            </div>
         ))}
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[40vh] bg-gradient-to-t from-black/90 to-transparent z-0"></div>
    </div>
  );
}

function PlaylistPlayer() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang] || translations['vi'];
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<0 | 1 | 2>(0); // 0: off, 1: playlist, 2: one
  const [error, setError] = useState('');
  
  const [isMinimized, setIsMinimized] = useState(() => id === 'released');
  
  useEffect(() => {
    if (id === 'released') {
      setIsMinimized(true);
    } else {
      setIsMinimized(false);
      if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
    }
  }, [id]);
  const interactTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSongRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isMinimized && activeSongRef.current) {
      activeSongRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isMinimized]);

  const resetTimer = useCallback(() => {
     if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
     interactTimerRef.current = setTimeout(() => {
        setIsMinimized(true);
     }, 3000);
  }, []);

  useEffect(() => {
     if (!isMinimized) {
        resetTimer();
     } else {
        if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
     }
     return () => {
        if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
     };
  }, [isMinimized, resetTimer]);

  useEffect(() => {
     if (songs.length > 0) {
        resetTimer();
     }
  }, [currentIndex, resetTimer, songs.length]);

  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [protectedInfo, setProtectedInfo] = useState<{ title?: string; coverUrl?: string; artistExtension?: string }>({});

  useEffect(() => {
    if (id === 'released') {
      fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        const releasedSongs = (data.demos || [])
          .filter((d: any) => d.isReleased && d.status === 'public' && !d.deleted);

        const queryParams = new URLSearchParams(window.location.search);
        const targetSongId = queryParams.get('song');
        
        let startIdx = 0;
        if (targetSongId) {
          const matchedIdx = releasedSongs.findIndex((d: any) => d.id === targetSongId || d.slug === targetSongId);
          if (matchedIdx !== -1) {
            startIdx = matchedIdx;
          }
        }

        setPlaylist({
          title: "Các bài hát đã phát hành",
          id: "released",
          coverUrl: releasedSongs[0]?.coverUrl || ''
        });
        setSongs(releasedSongs);
        setCurrentIndex(startIdx);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('secret') || urlParams.get('token') || sessionStorage.getItem(`playlist_token_${id}`) || '';
      fetch(`/api/playlists/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`, {
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || getMemberToken() || ''}` }
      })
      .then(async res => {
        const data = await res.json();
        if (res.status === 401 && data.isProtected) {
           setIsProtected(true);
           setProtectedInfo({ title: data.title, coverUrl: data.coverUrl, artistExtension: data.artistExtension });
           setLoading(false);
           return;
        }
        if (data.error) throw new Error(data.error);
        if (token) {
           sessionStorage.setItem(`playlist_token_${id}`, token);
        }
        setPlaylist(data.playlist);
        setSongs(data.songs);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [id]);

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/playlists/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem(`playlist_token_${id}`, data.token);
        window.location.reload();
      } else {
        setError('Sai mật khẩu!');
      }
    } catch (err) {
      setError('Lỗi kết nối!');
    }
    setVerifying(false);
  };

  const handleBackPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    const ext = getArtistExtensionFromUrl() || protectedInfo?.artistExtension || playlist?.artistExtension;
    if (ext) {
      navigate(`/${ext}`);
    } else {
      navigate('/');
    }
  };

  const handleNext = useCallback(() => {
     if (songs.length === 0) return;
     if (shuffle) {
         let nextIdx = Math.floor(Math.random() * songs.length);
         if (songs.length > 1 && nextIdx === currentIndex) {
             nextIdx = (nextIdx + 1) % songs.length;
         }
         setCurrentIndex(nextIdx);
     } else {
         if (currentIndex < songs.length - 1) {
             setCurrentIndex(currentIndex + 1);
         } else if (repeat === 1 || repeat === 2) {
             setCurrentIndex(0);
         }
     }
  }, [songs.length, shuffle, currentIndex, repeat]);

  const handlePrev = useCallback(() => {
     if (songs.length === 0) return;
     if (shuffle) {
         let nextIdx = Math.floor(Math.random() * songs.length);
         setCurrentIndex(nextIdx);
     } else {
         if (currentIndex > 0) {
             setCurrentIndex(currentIndex - 1);
         } else if (repeat === 1 || repeat === 2) {
             setCurrentIndex(songs.length - 1);
         }
     }
  }, [songs.length, shuffle, currentIndex, repeat]);

  const handleEnd = () => {
    if (repeat === 2) {
      // Loop is handled natively by audio tag. If it still calls onEnd, do nothing to stay on the same track.
    } else {
      handleNext();
    }
  };

  const handleAlmostEnded = () => {
     setIsMinimized(false);
     if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
  };

  const currentSong = songs[currentIndex];

  useEffect(() => {
     if (id === 'released' && currentSong) {
       const searchParams = new URLSearchParams(window.location.search);
       if (searchParams.get('song') !== (currentSong.slug || currentSong.id)) {
         window.history.replaceState(null, '', getArtistLink(`/playlist/released?song=${currentSong.slug || currentSong.id}`));
       }
     }
  }, [id, currentSong]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t.load}</div>;
  if (isProtected) return (
     <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
        <button onClick={handleBackPlaylist} className="fixed top-6 left-6 opacity-60 hover:opacity-100 flex items-center gap-2 z-20 transition-opacity font-medium text-white cursor-pointer" title={t.back}>
          <ArrowLeft className="w-5 h-5" /> {t.back}
        </button>
        {protectedInfo.coverUrl && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-2xl z-10" />
             <img src={protectedInfo.coverUrl} className="w-full h-full object-cover opacity-50" alt="background" />
          </div>
        )}
        <div className="w-full max-w-sm bg-stone-900/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto">
             <Lock className="w-8 h-8 text-white/80" />
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-2">Playlist được bảo vệ</h2>
          {protectedInfo.title && <p className="text-stone-400 text-sm text-center mb-6">{protectedInfo.title}</p>}
          <form onSubmit={verifyPassword} className="space-y-4">
             <div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu playlist..." autoFocus className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-center" />
             </div>
             <button type="submit" disabled={verifying || !password} className="w-full bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-stone-200 transition-colors">
                {verifying ? 'Đang kiểm tra...' : 'Truy cập'}
             </button>
             <p className="text-stone-500 text-xs text-center">Hoặc sử dụng Secret Link nếu có.</p>
          </form>
        </div>
     </div>
  );
  if (error || !playlist) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Error: {error || 'Playlist not found'}</div>;

  return (
    <div 
      className="relative min-h-screen bg-black overflow-hidden"
      onClick={() => setIsMinimized(true)}
    >
      {currentSong && (
         <div className="absolute inset-0 z-0 overflow-y-auto custom-scrollbar">
            <DemoPlayer songIdP={currentSong.slug || currentSong.id} playlistId={id} onEnd={handleEnd} onAlmostEnded={handleAlmostEnded} playlistSongs={songs} playlistContext={{ handlePrev, handleNext, shuffle, setShuffle, repeat, setRepeat }} />
         </div>
      )}

      {/* Frame on top */}
      <AnimatePresence>
         {!isMinimized && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               transition={{ duration: 0.2 }}
               className="absolute top-0 right-0 max-w-sm w-full p-4 z-[100] drop-shadow-xl pointer-events-none"
            >
              <div 
                 className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 pointer-events-auto shadow-2xl"
                 onMouseMove={resetTimer} onTouchStart={resetTimer} onClick={(e) => { e.stopPropagation(); resetTimer(); }}
              >
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white truncate pr-2">{playlist.title}</h2>
                    <div className="flex items-center gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition" title="Thu nhỏ">
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 mb-4">
                   <button onClick={() => setShuffle(!shuffle)} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${shuffle ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-neutral-400 hover:text-white border-white/5'}`}>
                     <Shuffle className="w-4 h-4" />
                   </button>
                   <button onClick={() => setRepeat(!repeat)} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${repeat ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-neutral-400 hover:text-white border-white/5'}`}>
                     <Repeat className="w-4 h-4" /> 
                   </button>
                   <button onClick={() => handleNext()} className="flex-1 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                      Bài Tiếp Theo <Play className="w-3 h-3 fill-white" />
                   </button>
                 </div>

                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar" onScroll={resetTimer}>
                   {songs.map((song, i) => (
                      <button 
                        key={song.id} 
                        ref={i === currentIndex ? activeSongRef : null}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2 sm:gap-3 transition-colors relative overflow-hidden ${i === currentIndex ? 'bg-purple-500/20 border-purple-500/30 border' : 'hover:bg-white/5 border border-transparent'} ${song.achievements?.length && i !== currentIndex ? 'hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] bg-neutral-900' : ''}`}
                      >
                         {song.achievements && song.achievements.length > 0 && i !== currentIndex && (
                            <>
                              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_280deg,theme(colors.amber.500)_360deg)] animate-rotate-border z-0 opacity-80" />
                              <div className="absolute inset-[1px] rounded-[11px] bg-neutral-900/80 backdrop-blur-md z-0" />
                              <div className="absolute inset-[1px] rounded-[11px] bg-gradient-to-r from-amber-950/20 to-transparent z-0" />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-shimmer-sweep z-0 pointer-events-none skew-x-[-20deg]" />
                            </>
                         )}
                         <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden border border-white/5 relative z-10 transition-transform">
                            {song.coverUrl ? <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <Music className="w-4 h-4 m-3 sm:m-3.5 text-neutral-500" />}
                         </div>
                         <div className={`flex-1 min-w-0 flex flex-col justify-center relative z-10 ${song.achievements?.length ? 'pr-1' : 'pr-4'}`}>
                            <p className={`font-bold transition-colors ${i === currentIndex ? 'text-purple-400' : (song.achievements?.length ? 'text-amber-100 hover:text-amber-300' : 'text-white')} ${song.achievements?.length ? 'text-[10px] sm:text-[11px] leading-[1.15] whitespace-normal break-words' : 'text-sm truncate'}`}>
                              <HoverTranslate text={song.title} />
                            </p>
                            <p className={`text-neutral-400 mt-0.5 ${song.achievements?.length ? 'text-[8.5px] sm:text-[9px] leading-tight opacity-90 whitespace-normal break-words' : 'text-xs truncate'}`}>{formatText(song.singer || song.composer || 'Đang cập nhật', true)}</p>
                         </div>
                         
                         {song.achievements && song.achievements.length > 0 && (
                            <div className="relative z-10 shrink-0 w-[100px] sm:w-[130px] pr-2 transform scale-[0.8] sm:scale-100 origin-right">
                               <AchievementCycle achievements={song.achievements} />
                            </div>
                         )}

                         {song.requiresPassword && !song.achievements?.length && <Lock className="w-3 h-3 text-yellow-500 flex-shrink-0 relative z-10" />}
                         {i === currentIndex && !song.achievements?.length && <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_theme(colors.purple.400)] relative z-10" />}
                      </button>
                   ))}
                 </div>
              </div>
            </motion.div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {isMinimized && (
            <motion.div
               initial={{ opacity: 0, scale: 0.5, y: -20, x: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
               exit={{ opacity: 0, scale: 0.5, y: -20, x: 20 }}
               transition={{ duration: 0.2 }}
               className="absolute top-6 right-6 z-[100]"
            >
               <button 
                  onClick={(e) => {
                     e.stopPropagation();
                     setIsMinimized(false);
                     resetTimer();
                  }}
                  className="w-14 h-14 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:bg-black/90 transition-all hover:scale-105 active:scale-95 group relative animate-heartbeat"
               >
                  <ListMusic className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-black flex items-center justify-center">
                     <Music className="w-2.5 h-2.5 text-white" />
                  </div>
               </button>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}

function DemoPlayer({ songIdP, playlistId, playlistSongs, setNextSong, onEnd, onAlmostEnded, playlistContext, previewConfig, previewData }: any = {}) {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang] || translations['vi'];
  const paramsId = useParams().id;
  const id = songIdP || paramsId;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('secret');
  const navigate = useNavigate();
  const isAdmin = !!getAdminToken();
  const [demo, setDemo] = useState<DemoSong | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [displayCoverUrl, setDisplayCoverUrl] = useState<string>('');
  const [triedRelative, setTriedRelative] = useState(false);
  const [triedAbsolute, setTriedAbsolute] = useState(false);
  const [triedRandom, setTriedRandom] = useState(false);
  const [systemArtists, setSystemArtists] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/artists')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setSystemArtists(data);
        } else if (data && Array.isArray(data.artists)) {
          setSystemArtists(data.artists);
        }
      })
      .catch(err => console.error("Error fetching public artists:", err));
  }, []);

  // Initialize displayCoverUrl whenever song or previewConfig updates
  useEffect(() => {
    const primaryUrl = demo?.coverUrl || demo?.globalCoverUrl || (previewConfig && previewConfig.coverUrl) || '';
    setDisplayCoverUrl(primaryUrl);
    setTriedRelative(false);
    setTriedAbsolute(false);
    setTriedRandom(false);
  }, [id, demo?.id, demo?.coverUrl, demo?.globalCoverUrl, previewConfig?.coverUrl]);

  // Sequential error fallback strategy
  const handleCoverError = () => {
    // 1. If absolute URL failed but it's an uploaded file, try relative
    if (displayCoverUrl && displayCoverUrl.startsWith('http') && displayCoverUrl.includes('/uploads/') && !triedRelative) {
      setTriedRelative(true);
      const idx = displayCoverUrl.indexOf('/uploads/');
      if (idx !== -1) {
        setDisplayCoverUrl(displayCoverUrl.substring(idx));
        return;
      }
    }

    // 2. If relative URL failed, try prefixing globalBaseUrl to load from production
    if (displayCoverUrl && displayCoverUrl.startsWith('/uploads/')) {
      if (!triedAbsolute) {
        setTriedAbsolute(true);
        let base = '';
        if (demo?.globalCoverUrl) {
          try {
            const urlObj = new URL(demo.globalCoverUrl);
            base = urlObj.origin;
          } catch (e) {
            // ignore
          }
        }
        if (base) {
          setDisplayCoverUrl(`${base}${displayCoverUrl}`);
          return;
        }
      }
    }

    // 3. Fall back to song's stable hash-based random cover chosen from slideshow images
    if (!triedRandom) {
      setTriedRandom(true);
      const imagesToUse = (demo?.slideshowImages && demo.slideshowImages.length > 0)
        ? demo.slideshowImages
        : (previewConfig?.slideshowImages && previewConfig.slideshowImages.length > 0) ? previewConfig.slideshowImages : [];
      
      const imagesList = imagesToUse.length > 0 ? imagesToUse : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"];
      
      const idStr = String(id || demo?.id || '');
      let hash = 0;
      for (let i = 0; i < idStr.length; i++) {
        hash += idStr.charCodeAt(i);
      }
      setDisplayCoverUrl(imagesList[hash % imagesList.length]);
      return;
    }

    // 4. Ultimate stock image fallback
    const ultimateStock = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80";
    if (displayCoverUrl !== ultimateStock) {
      setDisplayCoverUrl(ultimateStock);
    }
  };

  const getFormattedLyricsText = (rawLyrics: string) => {
    if (!rawLyrics) return '';
    const lines = rawLyrics.split(/\r?\n/);
    const cleanedLines: string[] = [];
    let skipBlank = false;
    for (let i = 0; i < lines.length; i++) {
      let textLine = lines[i];
      let trimmed = textLine.trim();
      let lower = trimmed.toLowerCase();
      
      if (/^\[?\s*(dk|đk)\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*(dk|đk)\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[2] ? `Chorus ${match[2]}` : "Chorus";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^\[?\s*pk\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*pk\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[1] ? `Verse ${match[1]}` : "Verse";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^ver\s*(\d+)[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^ver\s*(\d+)[:]*\s*/i, "Verse $1");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^rap[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^rap[:]*\s*/i, "Rap");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      }

      const isAnn = lower.includes("pre") || 
                    lower.includes("chorus") || 
                    lower.includes("verse") || 
                    lower.includes("bridge") || 
                    lower.includes("drop") ||
                    lower.includes("ending") ||
                    lower.includes("coda") ||
                    lower.includes("rap");

      if (isAnn) {
        let annotation = trimmed;
        if (lower.includes("pre")) annotation = "Pre-Chorus";
        else if (lower.includes("chorus")) annotation = "Chorus";
        else if (lower.includes("verse")) {
          const match = trimmed.match(/verse\s*(\d+)?/i);
          annotation = match?.[1] ? `Verse ${match[1]}` : "Verse";
        } else if (lower.includes("bridge")) annotation = "Bridge";
        else if (lower.includes("drop")) annotation = "Drop";
        else if (lower.includes("ending")) annotation = "Ending";
        else if (lower.includes("coda")) annotation = "Coda";
        else if (lower.includes("rap")) annotation = "Rap";
        
        cleanedLines.push(`[${annotation}]`);
        skipBlank = true;
      } else {
        if (trimmed === "") {
          if (skipBlank) continue;
          cleanedLines.push("");
        } else {
          cleanedLines.push(trimmed);
          skipBlank = false;
        }
      }
    }
    return cleanedLines.join('\n').trim();
  };

  const parseLyricsToElements = (rawLyrics: string) => {
    if (!rawLyrics) return null;
    const lines = rawLyrics.split(/\r?\n/);
    
    // Clean up lines: ignore all blank lines immediately following an annotation
    const cleanedLines: { text: string; origIdx: number }[] = [];
    let skipBlank = false;
    
    for (let i = 0; i < lines.length; i++) {
      let textLine = lines[i];
      let trimmed = textLine.trim();
      let lower = trimmed.toLowerCase();

      if (/^\[?\s*(dk|đk)\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*(dk|đk)\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[2] ? `Chorus ${match[2]}` : "Chorus";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^\[?\s*pk\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*pk\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[1] ? `Verse ${match[1]}` : "Verse";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^ver\s*(\d+)[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^ver\s*(\d+)[:]*\s*/i, "Verse $1");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^rap[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^rap[:]*\s*/i, "Rap");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      }
      
      const isAnn = lower.includes("pre") || 
                    lower.includes("chorus") || 
                    lower.includes("verse") || 
                    lower.includes("bridge") || 
                    lower.includes("drop") ||
                    lower.includes("ending") ||
                    lower.includes("coda") ||
                    lower.includes("rap");
                    
      if (isAnn) {
        cleanedLines.push({ text: textLine, origIdx: i });
        skipBlank = true;
      } else {
        if (trimmed === "") {
          if (skipBlank) {
            continue; // Skip blank line immediately following annotation
          }
          cleanedLines.push({ text: textLine, origIdx: i });
        } else {
          cleanedLines.push({ text: textLine, origIdx: i });
          skipBlank = false;
        }
      }
    }
    
    return (
      <div 
        className={`font-sans pb-24 pl-4 border-l ${isLight ? 'border-black/25 text-black/95' : 'border-white/25 text-white/[0.97]'} space-y-4`}
        style={{ 
          color: customConfig?.lyricsColor || undefined,
          textShadow: isLight ? '0 1px 1px rgba(255,255,255,0.5)' : '0 1px 3px rgba(0,0,0,0.7)'
        }}
      >
        {cleanedLines.map(({ text, origIdx }) => {
          const trimmed = text.trim();
          const lower = trimmed.toLowerCase();
          
          let annotation = "";
          let badgeClass = "";
          
          if (lower.includes("pre")) {
            annotation = "Pre-Chorus";
            badgeClass = isLight 
              ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("chorus")) {
            annotation = "Chorus";
            badgeClass = isLight 
              ? "bg-red-50 text-red-900 border border-red-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("verse")) {
            const match = trimmed.match(/verse\s*(\d+)?/i);
            annotation = match?.[1] ? `Verse ${match[1]}` : "Verse";
            badgeClass = isLight 
              ? "bg-blue-50 text-blue-900 border border-blue-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("bridge")) {
            annotation = "Bridge";
            badgeClass = isLight 
              ? "bg-purple-50 text-purple-900 border border-purple-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("drop")) {
            annotation = "Drop";
            badgeClass = isLight 
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("ending")) {
            annotation = "Ending";
            badgeClass = isLight 
              ? "bg-pink-50 text-pink-900 border border-pink-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("coda")) {
            annotation = "Coda";
            badgeClass = isLight 
              ? "bg-teal-50 text-teal-900 border border-teal-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("rap")) {
            annotation = "Rap";
            badgeClass = isLight 
              ? "bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          }
          
          if (annotation) {
            return (
              <div key={origIdx} className="flex items-center my-6 select-none animate-fade-in">
                <span className={`text-[10px] md:text-sm font-black tracking-widest uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                  {annotation}
                </span>
                <div className={`flex-1 border-t border-dashed ${isLight ? 'border-neutral-400/20' : 'border-neutral-500/25'} ml-3 opacity-30`} />
              </div>
            );
          }
          
          if (trimmed === "") {
            return <div key={origIdx} className="h-4" />;
          }
          
          return (
            <div 
              key={origIdx} 
              className="text-lg/relaxed sm:text-xl/loose font-semibold opacity-95 hover:opacity-100 transition-opacity"
            >
              <HoverTranslate text={trimmed} format={false} />
            </div>
          );
        })}
      </div>
    );
  };

  const pwdTouchedRef = useRef(false);
  const pwdRef = useRef(password);

  useEffect(() => {
     pwdRef.current = password;
  }, [password]);

  useEffect(() => {
     // Reset touched state when id changes
     pwdTouchedRef.current = false;
  }, [id]);

  useEffect(() => {
     if (loading || unlocked || isAdmin || !playlistSongs) return;

     const t1 = setTimeout(() => {
        if (!pwdTouchedRef.current) {
           onEnd?.();
        }
     }, 3000);

     const t2 = setTimeout(() => {
        if (pwdRef.current === '') {
           onEnd?.();
        }
     }, 10000);

     return () => {
        clearTimeout(t1);
        clearTimeout(t2);
     };
  }, [loading, unlocked, isAdmin, playlistSongs, id, onEnd]);

  useEffect(() => {
    if (previewData) {
      setDemo(previewData);
      setUnlocked(true);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setUnlocked(false);
    setPassword('');
    setError('');
    pwdTouchedRef.current = false;

    let queryParam = secretKey ? `?secret=${encodeURIComponent(secretKey)}` : '';
    if (playlistId) {
      const pToken = sessionStorage.getItem(`playlist_token_${playlistId}`);
      if (pToken) {
        queryParam += (queryParam ? '&' : '?') + `playlistId=${encodeURIComponent(playlistId)}&playlistToken=${encodeURIComponent(pToken)}`;
      }
    }

    const memberToken = getMemberToken() || '';
    const isMember = memberToken === 'XuanTaiDepTrai';
    fetch(`/api/demos/${id}${queryParam}`, {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Authorization': `Bearer ${getAdminToken() || memberToken || ''}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setDemo(data);
        if (!data.requiresPassword || isAdmin || isMember) setUnlocked(true);
        setLoading(false);
      });
  }, [id, isAdmin, playlistSongs, previewData, playlistId]);

  useEffect(() => {
    if (unlocked && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [unlocked]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { password };
    if (playlistId) {
       payload.playlistId = playlistId;
       payload.playlistToken = sessionStorage.getItem(`playlist_token_${playlistId}`) || '';
    }
    const res = await fetch(`/api/demos/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      setDemo(data.demo);
      setUnlocked(true);
      setError('');
    } else {
      setError(data.error || t.wPass);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.state?.fromAdmin) {
      navigate(-1);
    } else {
      const ext = getArtistExtensionFromUrl() || (demo as any)?.artistExtension;
      if (ext) {
        navigate(`/${ext}`);
      } else {
        navigate('/');
      }
    }
  };

  useEffect(() => {
     if (demo) {
        let titleSuffix = demo.singer || demo.author || demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ';
        if (demo.secretKey && /secret/i.test(titleSuffix)) {
          titleSuffix = titleSuffix.replace(/secret/gi, 'Ca sĩ Bí Mật');
        }
        const pageTitle = demo.isReleased 
          ? `${demo.title} - ${titleSuffix}`
          : `${demo.title} - ${titleSuffix} ( demo )`;
        document.title = pageTitle;
        
        let metaTitle = document.querySelector('meta[property="og:title"]');
        if (!metaTitle) {
          metaTitle = document.createElement('meta');
          metaTitle.setAttribute('property', 'og:title');
          document.head.appendChild(metaTitle);
        }
        metaTitle.setAttribute('content', pageTitle);

        if (demo.ogImageUrl) {
          let metaImage = document.querySelector('meta[property="og:image"]');
          if (!metaImage) {
            metaImage = document.createElement('meta');
            metaImage.setAttribute('property', 'og:image');
            document.head.appendChild(metaImage);
          }
          metaImage.setAttribute('content', window.location.origin + demo.ogImageUrl);
        }
     }
  }, [demo]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t.load}</div>;
  if (!demo) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Không tìm thấy demo</div>;

  const resolveCoverUrl = (urlStr: string | undefined): string => {
    if (!urlStr) return '';
    if (urlStr.startsWith('http') || urlStr.startsWith('data:') || urlStr.startsWith('blob:')) return urlStr;
    try {
      const base = demo?.globalCoverUrl ? new URL(demo.globalCoverUrl).origin : window.location.origin;
      return urlStr.startsWith('/') ? `${base}${urlStr}` : `${base}/${urlStr}`;
    } catch {
      return urlStr;
    }
  };

  const finalDisplayCover = resolveCoverUrl(displayCoverUrl) || displayCoverUrl;

  if (demo?.linkType === 'indirect') {
    return <IndirectBioCard demo={{...demo, coverUrl: finalDisplayCover}} isStandalone={true} />;
  }

  // Templates
  const templateType = (previewConfig && previewConfig.id) ? previewConfig.id : (demo.template || '1');
  const customConfig = previewConfig || demo.templateConfigs?.find((c: any) => c.id === templateType);
  const isPreview = !!previewConfig;
  const forceMobile = isPreview && !previewConfig.isPCPreviewMode;
  const forcePC = isPreview && previewConfig.isPCPreviewMode;
  const isLight = templateType === '1' || templateType === '4' || templateType === '6' || templateType === '7' || templateType === '9' || templateType === '17';
  const pageBgUrl = demo.backgroundUrl ? demo.backgroundUrl : displayCoverUrl;
  let themeClasses = "";
  let accentClass = "";

  if (templateType === '1') {
    themeClasses = "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 text-orange-950";
    accentClass = "bg-orange-500 text-white";
  } else if (templateType === '2') {
    themeClasses = "text-white animate-club-bg";
    accentClass = "bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)]";
  } else if (templateType === '3') {
    themeClasses = "bg-slate-900 text-slate-300 bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-slate-900 to-slate-950";
    accentClass = "bg-slate-700 text-white";
  } else if (templateType === '4') {
    themeClasses = "bg-emerald-50 text-emerald-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]";
    accentClass = "bg-emerald-600 text-emerald-50 shadow-lg shadow-emerald-200";
  } else if (templateType === '5') {
    themeClasses = "bg-red-500 text-white bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-400 to-red-600";
    accentClass = "bg-white text-red-500";
  } else if (templateType === '6') {
    themeClasses = "bg-pink-50 text-pink-900 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-fuchsia-100 to-pink-50";
    accentClass = "bg-pink-500 text-white shadow-lg shadow-pink-200";
  } else if (templateType === '7') {
    themeClasses = "bg-[#faf9f6] text-stone-800 bg-notebook-light";
    accentClass = "bg-stone-800 text-[#faf9f6]";
  } else if (templateType === '8') {
    themeClasses = "bg-red-600 text-yellow-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600 via-red-500 to-red-700 [text-shadow:0_2px_4px_rgba(153,27,27,0.8)]";
    accentClass = "bg-yellow-400 text-red-900 font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)]";
  } else if (templateType === '9') {
    themeClasses = "bg-transparent text-sky-950";
    accentClass = "bg-white/85 backdrop-blur text-sky-800 shadow-xl shadow-sky-200/50 outline outline-2 outline-white font-bold";
  } else if (templateType === '10') {
    themeClasses = "bg-neutral-900/80 bg-[url('/hiphop-bg.png')] bg-cover bg-center bg-fixed text-white bg-blend-multiply";
    accentClass = "bg-yellow-400 text-black font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wide transform hover:scale-105 hover:-rotate-2 transition-transform";
  } else if (templateType === '11') {
    themeClasses = "bg-black text-amber-100 font-serif";
    accentClass = "bg-[#d4af37] text-black font-bold uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)]";
  } else if (templateType === '12') {
    themeClasses = "bg-gradient-to-br from-[#3E2723] via-[#1A0C06] to-[#0A0402] text-[#EFEBE9] font-serif";
    accentClass = "bg-[#8D6E63] text-[#EFEBE9] hover:bg-[#A1887F] font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(141,110,99,0.3)]";
  } else if (templateType === '13') {
    themeClasses = "bg-gradient-to-b from-[#1E1B4B] via-[#4C1D95] via-[#9D174D] via-[#E11D48] to-[#FBBF24] text-[#FFFBEB] font-sans";
    accentClass = "bg-[#f43f5e] hover:bg-[#e11d48] text-[#FFFBEB] shadow-[0_0_20px_rgba(244,63,94,0.6)] font-bold uppercase rounded-xl";
  } else if (templateType === '14') {
    themeClasses = "bg-gradient-to-b from-[#0B2545] via-[#134074] via-[#001D3D] to-[#003566] text-white font-sans";
    accentClass = "bg-[#003566] hover:bg-[#001D3D] text-sky-200 border border-sky-400/30 shadow-[0_0_25px_rgba(14,165,233,0.4)] font-bold uppercase rounded-xl";
  } else if (templateType === '15') {
    themeClasses = "bg-[#090615] text-emerald-400 font-mono tracking-tight";
    accentClass = "bg-[#ec4899] hover:bg-[#db2777] text-white border-2 border-[#10b981] shadow-[4px_4px_0_rgba(16,185,129,0.7)] font-extrabold uppercase rounded-none tracking-widest";
  } else if (templateType === '16') {
    themeClasses = "bg-gradient-to-tr from-[#1e1b4b] via-[#3c0952] via-[#094154] to-[#111115] text-white font-sans";
    accentClass = "bg-gradient-to-r from-yellow-400 via-pink-400 via-purple-500 to-indigo-500 hover:from-yellow-300 hover:via-pink-300 hover:via-purple-400 hover:to-indigo-450 text-white font-black tracking-widest uppercase rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.5)] border border-pink-500/20";
  } else if (templateType === '17') {
    themeClasses = "bg-sky-300 text-stone-900 font-sans";
    accentClass = "bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-full font-black border-[3px] border-white shadow-[0_0_20px_rgba(250,204,21,0.6)]";
  } else if (templateType === '18') {
    themeClasses = "bg-slate-900 text-amber-50 font-sans";
    accentClass = "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-full font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)]";
  }

  if (!unlocked) {
    return (
      <div 
        className={`min-h-[100dvh] px-4 py-12 flex flex-col items-center justify-center ${themeClasses} transition-colors duration-1000 relative overflow-hidden`}
        style={{ backgroundColor: customConfig?.bgColor || undefined }}
      >
        <motion.div 
          initial={{ scaleY: 1 }} 
          animate={{ scaleY: 0 }} 
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} 
          className="fixed inset-0 z-[9999] bg-black origin-bottom pointer-events-none" 
        />
        {templateType === '1' && <ButterflyEffect />}
        {templateType === '2' && <ElectricEffect />}
        {templateType === '3' && <SnowEffect />}
        {templateType === '4' && <NoteEffect />}
        {templateType === '5' && <><CuteEffect /><CandyEffect /></>}
        {templateType === '6' && <><BlossomEffect /><EightBitEffect /></>}
        {templateType === '7' && <LeavesEffect />}
        {templateType === '8' && <FlagEffect />}
        {templateType === '9' && <RainbowEffect />}
        {templateType === '10' && <><StreetLightEffect /><ChainEffect /></>}
        {templateType === '11' && <MysteriousEffect />}
        {templateType === '12' && <RetroNotesEffect />}
        {templateType === '13' && <><SunsetSunEffect /><SunsetLeavesEffect /></>}
        {templateType === '14' && <><OceanWavesEffect /><OceanNightSkyEffect /></>}
        {templateType === '15' && <EightBitGameEffect />}
        {templateType === '16' && <PuzzleEffect />}
        {templateType === '17' && <CheeringEffect />}
        {templateType === '18' && <FireworksEffect />}
        
        {pageBgUrl && templateType !== '9' && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-md scale-105"
            style={{ backgroundImage: `url(${pageBgUrl})` }}
          ></div>
        )}

        {true && (
          <button onClick={handleBack} className={`fixed top-6 left-6 opacity-60 hover:opacity-100 flex items-center gap-2 z-20 transition-opacity font-medium ${isLight ? 'text-stone-900' : 'text-white'}`}>
            <ArrowLeft className="w-5 h-5" /> {t.back}
          </button>
        )}

        <div className={`relative z-10 w-full max-w-md ${isLight ? 'bg-white/40' : 'bg-black/40'} backdrop-blur-xl border ${isLight ? 'border-white/40' : 'border-white/10'} p-8 rounded-[2rem] shadow-2xl`}>
          {displayCoverUrl ? (
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20 shadow-xl relative animate-[spin_8s_linear_infinite]">
              <img src={displayCoverUrl} className="w-full h-full object-cover" alt="Cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className={`w-6 h-6 rounded-full ${isLight ? 'bg-white/80' : 'bg-black/60'} border border-white/30 backdrop-blur-sm shadow-inner`}></div>
              </div>
            </div>
          ) : (
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isLight ? 'bg-black/10 text-stone-600' : 'bg-white/10 text-stone-300'}`}>
              <Lock className="w-8 h-8 opacity-50" />
            </div>
          )}
          
          <h2 className={`text-2xl font-black text-center mb-1 drop-shadow-sm`}>
            <HoverTranslate text={demo.title} />
          </h2>
          <p className="text-sm font-medium text-center mb-6 opacity-80">
             {renderArtistNameWithLinks(demo.singer || demo.author || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}
             <span className="block text-xs mt-1 opacity-70">Sáng tác: {renderArtistNameWithLinks(demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}</span>
          </p>
          
          <p className="text-center mb-6 text-sm font-semibold opacity-70">
             {t.pPrompt2}
             {playlistSongs && <span className="block mt-2 italic text-xs">Sẽ tự động chuyển bài nếu không nhập mật khẩu</span>}
          </p>
          
          <form onSubmit={handleUnlock} onClick={(e) => e.stopPropagation()} className="space-y-4">
            <input 
              type="password" 
              placeholder="***" 
              value={password}
              onFocus={() => { pwdTouchedRef.current = true; }}
              onChange={e => {
                setPassword(e.target.value);
                pwdTouchedRef.current = true;
              }}
              className={`w-full ${isLight ? 'bg-white/60 focus:bg-white text-stone-900 placeholder:text-stone-400' : 'bg-black/40 focus:bg-black/60 text-white placeholder:text-stone-500'} border-none px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center tracking-widest font-mono text-lg shadow-inner`}
            />
            {error && <p className="text-red-500 text-sm text-center font-bold drop-shadow-sm">{error}</p>}
            <button type="submit" className={`w-full ${isLight ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-black hover:bg-stone-200'} font-bold py-3.5 rounded-xl transition-colors shadow-lg active:scale-95`}>
              {t.unlock}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-[100dvh] min-w-full px-4 py-8 ${themeClasses} transition-colors duration-1000 relative ${forceMobile ? 'overflow-hidden' : ''}`}
      style={{ backgroundColor: customConfig?.bgColor || undefined }}
    >
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="puzzle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.15 0.15 
                     H 0.4 
                     C 0.4 0.04 0.46 0.0 0.5 0.0 
                     C 0.54 0.0 0.6 0.04 0.6 0.15 
                     H 0.85 
                     V 0.4 
                     C 0.96 0.4 1.0 0.46 1.0 0.5 
                     C 1.0 0.54 0.96 0.6 0.85 0.6 
                     V 0.85 
                     H 0.6 
                     C 0.6 0.96 0.54 1.0 0.5 1.0 
                     C 0.46 1.0 0.4 0.96 0.4 0.85 
                     H 0.15 
                     V 0.6 
                     C 0.04 0.6 0.0 0.54 0.0 0.5 
                     C 0.0 0.46 0.04 0.4 0.15 0.4 
                     Z" />
          </clipPath>
        </defs>
      </svg>
      <motion.div 
        initial={{ scaleY: 1 }} 
        animate={{ scaleY: 0 }} 
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} 
        className="fixed inset-0 z-[9999] bg-black origin-bottom pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed inset-0 pointer-events-none z-0" 
      />
      {templateType === '1' && <ButterflyEffect />}
      {templateType === '2' && <ElectricEffect />}
      {templateType === '3' && <SnowEffect />}
      {templateType === '4' && <NoteEffect />}
      {templateType === '5' && <><CuteEffect /><CandyEffect /></>}
      {templateType === '6' && <><BlossomEffect /><EightBitEffect /></>}
      {templateType === '7' && <LeavesEffect />}
      {templateType === '8' && <FlagEffect />}
      {templateType === '9' && <RainbowEffect />}
      {templateType === '10' && <><StreetLightEffect /><ChainEffect /></>}
      {templateType === '11' && <MysteriousEffect />}
      {templateType === '12' && <RetroNotesEffect />}
      {templateType === '13' && <><SunsetSunEffect /><SunsetLeavesEffect /></>}
      {templateType === '14' && <><OceanWavesEffect /><OceanNightSkyEffect /></>}
      {templateType === '15' && <EightBitGameEffect />}
      {templateType === '16' && <PuzzleEffect />}
      {templateType === '17' && <CheeringEffect />}
      {templateType === '18' && <FireworksEffect />}
      
      {pageBgUrl && templateType !== '9' && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 blur-md scale-105 pointer-events-none z-0"
          style={{ backgroundImage: `url(${pageBgUrl})` }}
        ></div>
      )}

      {/* Hide fixed top UI elements if in preview mode */}
      {!previewConfig && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`fixed top-0 inset-x-0 h-16 bg-gradient-to-b ${isLight ? 'from-[#faf9f6]/50' : 'from-black/40'} to-transparent pointer-events-none z-40`}
          />

          <div className={`fixed top-6 left-6 flex items-center gap-3 z-[300] ${isLight ? 'text-stone-900' : 'text-white'}`}>
            <button onClick={handleBack} className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current" title={t.back}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={async () => {
                if (!demo) return;
                const baseUrl = '/song/';
                const dynamicId = demo.slug || demo.id;
                let url = window.location.origin + getArtistLink(baseUrl + dynamicId);
                url = formatShareUrl(url);
                await copyToClipboard(url);
                setToast('Đã copy link bài hát!');
                setTimeout(() => setToast(''), 3000);
              }}
              className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current"
              title="Chia sẻ link"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
            {isAdmin && demo?.secretKey && (demo?.password || demo?.hasPassword) && (
              <button
                onClick={async () => {
                  if (!demo) return;
                  const baseUrl = '/song/';
                  const dynamicId = demo.slug || demo.id;
                  let url = window.location.origin + getArtistLink(baseUrl + dynamicId);
                  url = formatShareUrl(url);
                  url += `?secret=${demo.secretKey}`;
                  await copyToClipboard(url);
                  setToast('Đã copy Secret Link!');
                  setTimeout(() => setToast(''), 3000);
                }}
                className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current"
                title="Copy Secret Link"
              >
                <Lock className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {isAdmin && demo && (
            <div id="admin-controls-ui" className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[999]">
              <Link to={getAdminLink(`/edit/${demo.id}`)} className="opacity-80 hover:opacity-100 flex items-center justify-center transition-all bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/20 text-white shadow-xl hover:scale-110" title={t.edit}>
                <Edit3 className="w-5 h-5" />
              </Link>
            </div>
          )}
        </>
      )}

      <div 
        className={`max-w-5xl mx-auto w-full relative ${forceMobile ? 'block pb-16 pt-8' : forcePC ? 'flex flex-row gap-8 items-stretch pt-16' : 'block md:flex md:flex-row md:gap-8 md:items-stretch pb-16 md:pb-0 pt-8 md:pt-16'}`}
      >
        {/* Left: Player */}
        <div className={`w-full max-w-md mx-auto block relative z-[215] ${forceMobile ? 'px-2 text-center' : forcePC ? 'flex-1 sticky top-24 self-start mx-0' : 'px-2 md:px-0 text-center md:text-left md:flex-1 md:sticky md:top-24 md:self-start md:mx-0'}`}>
          <div className={`${forceMobile ? '' : forcePC ? 'flex flex-col items-center flex-1 text-left' : 'flex flex-col items-center md:items-start flex-1'}`}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`w-full flex flex-col items-center`}
            >
            <div className={`relative ${templateType === '12' ? 'w-full max-w-[280px] md:max-w-[340px]' : 'w-full max-w-[260px] md:max-w-[320px]'} aspect-square mb-4 mt-2 md:mt-0 z-10 mx-auto`}>
              {demo.achievements && demo.achievements.length > 0 && (
                <motion.div 
                  animate={{ 
                    y: [2, -2, 3, -1, 2],
                    rotate: [0, 0.5, -0.5, 0.3, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5.5,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-2 left-2 -translate-x-[12%] translate-y-[12%] z-50 transform scale-[0.82] md:scale-95 origin-center pointer-events-none"
                >
                  <div className="pl-2.5 pr-4.5 md:pl-3 md:pr-5 py-1.5 bg-gradient-to-r from-amber-950/80 via-yellow-950/80 to-amber-900/80 backdrop-blur-xl border border-amber-400/35 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.45),0_0_8px_rgba(217,119,6,0.12),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-start w-fit min-w-[140px] sm:min-w-[165px] h-[48px] sm:h-[56px] overflow-visible">
                    <AchievementCycle achievements={demo.achievements} align="left" />
                  </div>
                </motion.div>
              )}

              {templateType === '12' ? (
                /* WOODEN TURNTABLE CASE WITH REVOLVING VINYL AND DYNAMIC TONEARM */
                <div id="retro-turntable" className="relative w-full h-full p-6 md:p-8 bg-gradient-to-br from-[#4e342e] to-[#2d1a15] rounded-3xl border-8 border-[#3e2723] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
                  {/* Pivot brass accent on the wooden frame */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-900 shadow-md z-20 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-neutral-800" />
                  </div>
                  
                  {/* Dynamic Tonearm */}
                  <motion.div 
                    initial={{ rotate: -55 }}
                    animate={{ rotate: -15 }}
                    transition={{ type: 'spring', stiffness: 45, damping: 15, delay: 1 }}
                    className="absolute top-2 right-2 w-28 h-44 z-30 pointer-events-none origin-[80%_15.6%]"
                  >
                    <svg width="112" height="176" viewBox="0 0 100 160" fill="none" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                      {/* Base pivot center using concentric circles for solid Safari/iOS support */}
                      <circle cx="80" cy="25" r="14" fill="#b0bec5" stroke="#1a0c06" strokeWidth="1.5" />
                      <circle cx="80" cy="25" r="8" fill="#455a64" />
                      <circle cx="80" cy="25" r="4" fill="#111" />
                      
                      {/* Metallic arm pole (silver stainless-steel rod) curves to the cartridge */}
                      {/* Using dual layered solid-stroke paths for a perfect 3D cylindrical metal look visible on iOS Safari */}
                      <path d="M 80 25 Q 75 80 50 110 L 25 135" stroke="#b0bec5" strokeWidth="5.5" strokeLinecap="round" />
                      <path d="M 80 25 Q 75 80 50 110 L 25 135" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                      
                      {/* Cartridge headshell */}
                      <g transform="translate(15, 126) rotate(35)">
                        <rect x="0" y="0" width="12" height="20" rx="2" fill="#222" stroke="#d4af37" strokeWidth="1" />
                        <rect x="2" y="2" width="8" height="6" fill="#8D6E63" />
                        <circle cx="6" cy="15" r="2" fill="#d4af37" />
                      </g>
                    </svg>
                  </motion.div>

                  {/* THE ROTATING VINYL DISC */}
                  <div className="w-[190px] h-[190px] sm:w-[224px] sm:h-[224px] md:w-[260px] md:h-[260px] aspect-square relative rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.7)] animate-[spin_12s_linear_infinite] flex items-center justify-center border-4 border-stone-800 bg-[#0c0c0c] overflow-hidden flex-shrink-0 z-10">
                    {/* Artwork label center */}
                    {displayCoverUrl ? (
                      <img 
                        src={displayCoverUrl} 
                        alt="Cover" 
                        className="w-full h-full rounded-full object-cover aspect-square z-10" 
                        onError={handleCoverError}
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center z-10 text-stone-600 aspect-square">
                        <Music className="w-8 h-8" />
                      </div>
                    )}

                    {/* Glossy vinyl light shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15 rounded-full z-[15] pointer-events-none"></div>
                    
                    {/* Spindle hole & metallic center rim to keep visual charm */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#0c0c0c]/90 border border-stone-700 rounded-full z-20 shadow-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
                    </div>
                  </div>
                  {demo.releaseYear && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
                      whileHover={{ scale: 1.1, rotate: -2 }}
                      className="absolute bottom-3 right-3 z-30 px-3 py-1 bg-amber-950/80 text-amber-100 border border-amber-500/20 font-serif text-xs rounded-lg shadow-lg tracking-wider"
                    >
                      {demo.releaseYear}
                    </motion.div>
                  )}
                </div>
              ) : (
                /* ALL OTHER TEMPLATES */
                <div className={`w-full h-full relative transition-all duration-1000 ${
                  (templateType === '9' || templateType === '16') ? 'overflow-visible' : 'overflow-hidden'
                } ${
                  templateType === '1' ? 'shadow-glow-1 animate-[bounce_6s_infinite] rounded-3xl border-4' :
                  templateType === '2' ? 'shadow-glow-2 scale-105 rounded-3xl border-4' :
                  templateType === '3' ? 'shadow-2xl animate-sway rounded-lg border-[12px] opacity-90' :
                  templateType === '4' ? 'shadow-[0_20px_45px_rgba(16,185,129,0.25)] rounded-[2rem] border-[6px] border-emerald-500 hover:scale-105 hover:rotate-1 transition-transform duration-500 bg-emerald-50' : 
                  templateType === '5' ? 'shadow-xl rounded-full border-4 animate-[bounce_2s_infinite] shadow-red-900/50' : 
                  templateType === '6' ? 'shadow-[12px_12px_0_rgba(244,114,182,0.3)] rounded-l-sm rounded-r-3xl border-l-[20px] border-l-pink-400 border-pink-200 rotate-2 hover:rotate-0 transition-transform bg-white' :
                  templateType === '7' ? 'shadow-[8px_8px_0px_rgba(0,0,0,0.8)] rounded-xl border-4 border-stone-800 rotate-2 hover:rotate-0 transition-transform' : 
                  templateType === '8' ? 'shadow-[0_0_40px_rgba(250,204,21,0.6)] rounded-full border-4 border-yellow-400' :
                  templateType === '9' ? 'shadow-xl shadow-sky-300 rounded-[2rem] border-4 border-white/80 animate-[bounce_4s_infinite]' : 
                  templateType === '10' ? 'shadow-[8px_8px_0_rgba(234,179,8,1)] border-[4px] border-black rounded-sm skew-x-[-2deg] scale-[1.02] bg-zinc-900' : 
                  templateType === '11' ? 'shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-2xl border-2 border-stone-800' :
                  templateType === '13' ? 'shadow-[0_0_40px_rgba(244,63,94,0.3)] bg-black/40 border border-[#f43f5e]/20 rounded-[2.5rem] hover:scale-105 transition-transform duration-500' : 
                  templateType === '14' ? 'shadow-[0_0_50px_rgba(14,165,233,0.35)] bg-gradient-to-b from-[#134074] to-[#0B2545] border-4 border-sky-400/50 rounded-[2rem] hover:scale-102 transition-transform duration-500' : 
                  templateType === '15' ? 'border-[6px] border-[#ec4899] rounded-none shadow-[6px_6px_0_#10b981] bg-black hover:scale-105 transition-transform duration-300' : 
                  templateType === '16' ? 'rounded-none overflow-visible hover:scale-105 transition-transform duration-500 max-w-[280px] md:max-w-[340px]' : 
                  templateType === '17' ? 'shadow-[0_0_50px_rgba(250,204,21,0.5)] border-[8px] border-white rounded-3xl rotate-2 hover:rotate-0 transition-transform duration-500' : 
                  templateType === '18' ? 'shadow-[0_0_60px_rgba(251,191,36,0.3)] border-2 border-amber-500/50 rounded-full hover:scale-105 transition-transform duration-500' : 'shadow-2xl rounded-3xl border-4'
                }`}>
                  {templateType === '9' && (
                    <>
                      <div className="absolute -top-4 -left-4 text-4xl animate-float-shape z-40 drop-shadow-md select-none">☁️</div>
                      <div className="absolute -bottom-2 -right-4 text-3xl animate-float-shape z-40 drop-shadow-md select-none" style={{animationDelay: '1s'}}>☁️</div>
                    </>
                  )}
                  {templateType === '16' ? (
                    <div className="relative w-full aspect-square p-2 border-0">
                      {/* Colorful neon/gradient outer backdrop offset shadows */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-yellow-400 via-emerald-400 to-indigo-500 opacity-95 blur-[3px]" style={{ clipPath: 'url(#puzzle-clip)', transform: 'scale(1.06)' }}></div>
                      <div className="absolute inset-0 bg-gradient-to-bl from-yellow-400 via-orange-500 via-red-500 to-purple-600 opacity-70 blur-[1px]" style={{ clipPath: 'url(#puzzle-clip)', transform: 'scale(1.03)' }}></div>
                      
                      {/* Black base fill so cover art fits perfectly */}
                      <div className="absolute inset-0 bg-black" style={{ clipPath: 'url(#puzzle-clip)' }}></div>
                      
                      {displayCoverUrl ? (
                        <img 
                          src={displayCoverUrl} 
                          alt="Cover" 
                          className="w-full h-full object-cover animate-zoom-gentle relative z-10"
                          style={{ clipPath: 'url(#puzzle-clip)' }}
                          onError={handleCoverError}
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-900 flex flex-col justify-center items-center relative z-10" style={{ clipPath: 'url(#puzzle-clip)' }}>
                          <Music className="w-16 h-16 text-yellow-400 opacity-80" />
                        </div>
                      )}
                    </div>
                  ) : displayCoverUrl ? (
                    <img 
                      src={displayCoverUrl} 
                      alt="Cover" 
                      className={`w-full h-full object-cover ${templateType === '2' ? 'animate-zoom-fast' : 'animate-zoom-gentle'} ${templateType === '9' ? 'rounded-[1.7rem]' : ''}`}
                      onError={handleCoverError}
                    />
                  ) : (
                    <div className={`w-full h-full bg-black/30 flex flex-col justify-center items-center ${templateType === '9' ? 'rounded-[1.7rem]' : ''}`}>
                      <Music className="w-24 h-24 opacity-20" />
                    </div>
                  )}
                  <div className={`absolute inset-0 ${templateType === '6' ? 'bg-gradient-to-r from-black/20 to-transparent w-8' : ''}`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent ${templateType === '4' || templateType === '9' ? 'rounded-[1.7rem]' : (templateType === '5' || templateType === '8' || templateType === '18' ? 'rounded-full' : '')} ${templateType === '6' ? 'opacity-30' : ''} ${templateType === '16' ? 'hidden' : ''}`}></div>
                  {demo.releaseYear && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
                      whileHover={{ scale: 1.1, rotate: -2 }}
                      className={`absolute bottom-3 right-3 z-30 px-3 py-1 font-mono text-xs sm:text-sm font-black rounded-lg shadow-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] ${
                        templateType === '7' ? 'bg-[#faf9f6] text-stone-800 border-2 border-stone-800 font-sans tracking-wide rotate-2' :
                        templateType === '10' ? 'bg-yellow-400 text-black uppercase font-black px-4 py-1.5 shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest border-2 border-black rounded-none -rotate-3' :
                        templateType === '11' ? 'bg-[#d4af37]/90 text-black border border-[#d4af37] tracking-widest' :
                        templateType === '15' ? 'bg-[#ec4899] text-white border-2 border-[#10b981] rounded-none tracking-widest' :
                        templateType === '16' ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl' :
                        'bg-rose-600/95 text-white border border-white/25 rounded-md tracking-wider'
                      }`}
                    >
                      {demo.releaseYear}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
          <h1 
            className="text-xl md:text-2xl font-black text-center mb-1 drop-shadow-sm flex items-center justify-center relative z-30"
            style={{ color: customConfig?.titleColor || undefined }}
          >
            <span className="relative inline-block pr-10 z-40">
              <HoverTranslate text={demo.title} format={true} />
              {demo.linkType === 'indirect' ? (
               <div className="absolute top-0 right-0 translate-x-[15%] -translate-y-[10%] rotate-[12deg] bg-indigo-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-[pulse_2s_ease-in-out_infinite] tracking-widest border border-white/20 select-none z-50 whitespace-nowrap">
                 Landing Page
               </div>
              ) : demo.isReleased ? (
               <div className="absolute top-0 right-0 translate-x-[25%] -translate-y-[10%] rotate-[12deg] bg-emerald-600 text-[9px] font-black text-white px-2 py-0.5 rounded shadow-[0_0_15px_rgba(5,150,105,0.8)] tracking-widest border border-emerald-400/50 select-none animate-released-wiggle z-50">
                 {t.lReleasedMark || 'RELEASED'}
               </div>
              ) : (
               <div className="absolute top-0 right-0 translate-x-[15%] -translate-y-[10%] rotate-[12deg] bg-rose-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(225,29,72,0.8)] animate-[pulse_2s_ease-in-out_infinite] tracking-widest border border-white/20 select-none z-50">
                 {t.lDemoMark || 'DEMO'}
               </div>
              )}
            </span>
          </h1>
          <p 
            className="text-lg md:text-xl font-medium text-center mb-0"
            style={{
              opacity: isLight ? 0.85 : 0.95,
              textShadow: isLight ? '0 1px 1.5px rgba(255,255,255,0.7)' : '0 1.5px 3px rgba(0,0,0,0.85)',
            }}
          >
            {renderArtistNameWithLinks(demo.singer || demo.author || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}
          </p>
          <p 
            className={`text-xs md:text-sm text-center mb-1 md:mb-6 ${templateType === '6' ? 'font-semibold text-[#fef08a]' : 'font-medium opacity-60'}`}
          >
            {t.sAuth} {renderArtistNameWithLinks(demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}
          </p>
          </motion.div>
          
          <div 
            className={`rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border ${isLight ? 'border-black/10' : 'border-white/20'} z-[200] overflow-hidden animate-fade-in ${forceMobile ? 'fixed bottom-4 w-[calc(100%-2rem)] inset-x-0 mx-auto' : forcePC ? 'relative bottom-auto w-full inset-x-auto mx-0' : 'fixed md:relative bottom-4 md:bottom-auto w-[calc(100%-2rem)] md:w-full inset-x-0 md:inset-x-auto mx-auto md:mx-0'}`}
          >
            {/* Background with blur and mask */}
            <div 
              className="absolute inset-0 backdrop-blur-xl"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 25%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 25%, black 100%)' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-t ${(templateType === '2' || templateType === '5' || templateType === '8') ? 'from-black/70 via-black/30' : (isLight ? 'from-white/90 via-white/50' : 'from-black/90 via-black/50')} to-transparent`}></div>
              {displayCoverUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay saturate-150"
                  style={{ backgroundImage: `url(${displayCoverUrl})` }}
                ></div>
              )}
            </div>
            <div className="relative z-10 px-4 pt-2 pb-3 md:px-5 md:pt-3 md:pb-4">
               <CustomAudioPlayer src={demo.audioUrl} backupAudioUrl={demo.backupAudioUrl} template={templateType} onEnded={onEnd} onAlmostEnded={onAlmostEnded} playlistContext={playlistContext} isPreview={isPreview} lyricsColor={customConfig?.lyricsColor} waveColor={customConfig?.waveColor} />
            </div>
          </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`flex-1 w-full relative z-[150] ${forceMobile ? 'pb-32 mt-8' : forcePC ? 'pb-0 mt-0' : 'pb-32 md:pb-0 mt-8 md:mt-0'}`}
        >
          <div className={`flex items-center justify-between mb-4 ml-4 pr-4 ${forceMobile ? 'mt-0' : 'mt-0 md:mt-0'} ${templateType === '6' ? '' : 'opacity-50'}`}>
            <h3 
              className={`text-[11px] md:text-sm uppercase tracking-widest ${templateType === '6' ? 'font-black text-[#fef08a]' : 'font-bold'}`}
            >
              {t.lyric}
            </h3>
            <div className="flex items-center gap-4">
              {demo.linkDrive && (
                <a
                  href={demo.linkDrive}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${templateType === '6' ? 'hover:scale-105 active:scale-95 text-[11px] md:text-xs font-black text-[#fef08a]' : 'hover:opacity-100 text-xs font-bold'}`}
                  title="Tải nhạc từ Google Drive"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải nhạc
                </a>
              )}
              {demo.lyrics && (
                <button
                  onClick={async () => {
                    const formattedTitle = demo.title || 'Unknown';
                    const formattedSinger = demo.singer || 'Đang cập nhật';
                    const formattedComposer = demo.composer || 'Đang cập nhật';
                    const rawLyricsText = getFormattedLyricsText(demo.lyrics).replace(/\n{3,}/g, '\n\n');
                    const copyText = `${formattedTitle}\nCa sĩ: ${formattedSinger}\nSáng tác: ${formattedComposer}\n\nLời bài hát:\n${rawLyricsText}`;
                    await copyToClipboard(copyText);
                    setToast('Đã copy lời bài hát!');
                    setTimeout(() => setToast(''), 3000);
                  }}
                  className={`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${templateType === '6' ? 'hover:scale-105 active:scale-95 text-[11px] md:text-xs font-black text-[#fef08a]' : 'hover:opacity-100 text-xs font-bold'}`}
                  title="Copy lời bài hát"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              )}
            </div>
          </div>
          <div className="pr-4">
            {demo.lyrics ? (
              parseLyricsToElements(demo.lyrics)
            ) : (
              <div className="flex items-center justify-center opacity-30 italic py-20">
                {t.nLyric}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md text-white border border-white/20 px-5 py-3 rounded-2xl shadow-2xl z-[500] flex items-center gap-2 font-mono text-xs animate-bounce">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
           {toast}
        </div>
      )}
    </div>
  );
}

// ---- SOCIAL CAROUSEL ----
function formatSocialLink(url: string, platform: string) {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http')) return url;
  if (platform === 'fb') return `https://facebook.com/${url}`;
  if (platform === 'ig') return `https://instagram.com/${url}`;
  if (platform === 'yt') return `https://youtube.com/@${url.replace(/^@/, '')}`;
  if (platform === 'tk') return `https://tiktok.com/@${url.replace(/^@/, '')}`;
  return url;
}

const FollowIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4a2 2 0 0 1 10 0v2H7V4zM5 8a2 2 0 0 1 14 0v2H5V8z" opacity="0.6"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6 9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3H6zm5 4a1 1 0 0 1 2 0v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2v-2z" />
  </svg>
);

function SocialCarousel({ data }: { data: AppData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIconIdx, setCurrentIconIdx] = useState(-1);

  const socials = [
    { id: 'fb', url: formatSocialLink(data.socialFacebook || '', 'fb'), Icon: Facebook, color: 'hover:bg-blue-600' },
    { id: 'ig', url: formatSocialLink(data.socialInstagram || '', 'ig'), Icon: Instagram, color: 'hover:bg-pink-600' },
    { id: 'yt', url: formatSocialLink(data.socialYoutube || '', 'yt'), Icon: Youtube, color: 'hover:bg-red-600' },
    { id: 'tk', url: formatSocialLink(data.socialTiktok || '', 'tk'), color: 'hover:bg-neutral-800', Icon: TiktokIcon }
  ].filter(s => s.url);

  useEffect(() => {
    if (isOpen || socials.length === 0) {
       setCurrentIconIdx(-1);
       return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const playLoop = () => {
       let idx = 0;
       setCurrentIconIdx(idx);
       intervalId = setInterval(() => {
          idx++;
          if (idx >= socials.length) {
             clearInterval(intervalId);
             setCurrentIconIdx(-1);
             timeoutId = setTimeout(playLoop, 5000);
          } else {
             setCurrentIconIdx(idx);
          }
       }, 700);
    };

    timeoutId = setTimeout(playLoop, 5000);

    return () => {
       clearTimeout(timeoutId);
       clearInterval(intervalId);
    };
  }, [isOpen, socials.length]);

  if (socials.length === 0) return null;

  return (
    <div className="fixed top-6 left-6 z-50 flex flex-col items-center gap-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all cursor-pointer"
        title="Follow"
      >
        <AnimatePresence mode="popLayout">
           {!isOpen ? (
             <motion.div
                key={currentIconIdx === -1 ? 'follow' : `social-${currentIconIdx}`}
                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.3 }}
                className="absolute"
             >
                {currentIconIdx === -1 ? (
                   <FollowIcon className="w-5 h-5" />
                ) : (
                   (() => {
                      const ActiveIcon = socials[currentIconIdx].Icon;
                      return <ActiveIcon className="w-5 h-5" />;
                   })()
                )}
             </motion.div>
           ) : (
             <motion.div
                key="close"
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
                className="absolute"
             >
                <X className="w-5 h-5" />
             </motion.div>
           )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-col gap-3"
          >
            {socials.map((social) => {
              const IconComponent = social.Icon;
              return (
                <motion.a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: -10, scale: 0.8 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white ${social.color} hover:scale-110 shadow-lg transition-all`}
                >
                  <IconComponent className="w-5 h-5" />
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- ADMIN DASHBOARD ----
function AdminTemplatesSettings({ isPCPreviewMode, setIsPCPreviewMode }: { isPCPreviewMode?: boolean, setIsPCPreviewMode?: (b: boolean) => void }) {
  const [templateConfigs, setTemplateConfigs] = useState<TemplateConfig[]>([
    { id: '1', name: 'Vui vẻ (Ấm áp)', order: 1 },
    { id: '2', name: 'Căng Cực (Sôi động)', order: 2 },
    { id: '3', name: 'Buồn (Sâu lắng)', order: 3 },
    { id: '4', name: 'Thư giãn (Nhẹ nhàng)', order: 4 },
    { id: '5', name: 'Đáng yêu (Đỏ, Nhảy múa)', order: 5 },
    { id: '6', name: 'Hạnh Phúc (Hồng, Hoa rơi)', order: 6 },
    { id: '7', name: 'Học Đường (Trắng, Lá vàng rơi)', order: 7 },
    { id: '8', name: 'Tổ Quốc (Đỏ, Cờ phấp phới)', order: 8 },
    { id: '9', name: 'Cầu Vồng', order: 9 },
    { id: '10', name: 'Hip Hop (Đường phố)', order: 10 },
    { id: '11', name: 'Kỳ bí (Đen vàng, Trăng khói mưa)', order: 11 },
    { id: '12', name: 'Cổ điển (Nâu, retro)', order: 12 },
    { id: '13', name: 'Hoàng hôn (Cam đỏ trời chiều)', order: 13 },
    { id: '14', name: 'Đại Dương (Sóng biển)', order: 14 },
    { id: '15', name: 'Retro 8-Bit (Game)', order: 15 },
    { id: '16', name: 'Xếp hình Puzzle', order: 16 },
    { id: '17', name: 'Cổ vũ (Mây, mặt trời)', order: 17 },
    { id: '18', name: 'Pháo hoa (Năm mới)', order: 18 }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedTemplateIds, setExpandedTemplateIds] = useState<string[]>([]);

  const [demos, setDemos] = useState<any[]>([]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedTemplateIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          const merged = data.templateConfigs.map((c: any) => c.id === '9' ? { ...c, name: 'Cầu Vồng' } : c);
          const defaultNames = [
            'Vui vẻ (Ấm áp)', 'Căng Cực (Sôi động)', 'Buồn (Sâu lắng)', 'Thư giãn (Nhẹ nhàng)',
            'Đáng yêu (Đỏ, Nhảy múa)', 'Hạnh Phúc (Hồng, Hoa rơi)', 'Học Đường (Trắng, Lá vàng rơi)',
            'Tổ Quốc (Đỏ, Cờ phấp phới)', 'Cầu Vồng', 'Hip Hop (Đường phố)',
            'Kỳ bí (Đen vàng, Trăng khói mưa)', 'Cổ điển (Nâu, retro)', 'Hoàng hôn (Cam đỏ trời chiều)',
            'Đại Dương (Sóng biển)', 'Retro 8-Bit (Game)', 'Xếp hình Puzzle', 'Cổ vũ (Mây, mặt trời)', 'Pháo hoa (Năm mới)'
          ];
          for (let i = 1; i <= 18; i++) {
             const exist = merged.find((c: any) => c.id === String(i));
             if (!exist) merged.push({ id: String(i), name: defaultNames[i - 1], order: i });
          }
          merged.sort((a: any,b: any) => a.order - b.order);
          setTemplateConfigs(merged);
        }
        setDemos(data.demos || []);
        setIsLoading(false);
      });
  }, []);

  const handleSaveAll = async (configsToSave: TemplateConfig[]) => {
    fetch('/api/admin/save-templates', {
      method: 'POST',
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken() || ''}`
      },
      body: JSON.stringify({ configs: configsToSave })
    });
    setToast('Đã lưu cấu hình!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId === targetId) return;

    const sourceIdx = templateConfigs.findIndex(t => t.id === sourceId);
    const targetIdx = templateConfigs.findIndex(t => t.id === targetId);
    
    if (sourceIdx >= 0 && targetIdx >= 0) {
      const newConfigs = [...templateConfigs];
      const [item] = newConfigs.splice(sourceIdx, 1);
      newConfigs.splice(targetIdx, 0, item);
      
      newConfigs.forEach((c, idx) => c.order = idx + 1);
      setTemplateConfigs(newConfigs);
      handleSaveAll(newConfigs);
    }
  };

  if (isLoading) return <div>Đang tải...</div>;

  if (editingId) {
    return <AdminTemplateEdit 
             config={templateConfigs.find(c => c.id === editingId)!} 
             demos={demos}
             onBack={() => {
                setEditingId(null);
                if (setIsPCPreviewMode) setIsPCPreviewMode(false);
             }}
             onSave={async (newConfig: TemplateConfig) => {
               const newConfigs = templateConfigs.map(c => c.id === editingId ? newConfig : c);
               setTemplateConfigs(newConfigs);
               await handleSaveAll(newConfigs);
             }}
             isPCPreviewMode={isPCPreviewMode}
             setIsPCPreviewMode={setIsPCPreviewMode}
           />;
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Sắp xếp Giao Diện</h2>
        {toast && <span className="bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm animate-pulse">{toast}</span>}
      </div>
      <p className="text-stone-500 mb-6 text-sm">Kéo thả để sắp xếp lại thứ tự hiển thị của giao diện khi chọn. Nhấn vào Giao Diện để chỉnh sửa chi tiết.</p>
      
      <div className="space-y-3">
        {templateConfigs.map(config => {
          const isExpanded = expandedTemplateIds.includes(config.id);
          const activeDemos = demos.filter(d => (d.template || '1') === config.id);
          return (
          <div key={config.id} className="space-y-1">
          <div 
            draggable
            onDragStart={(e) => handleDragStart(e, config.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, config.id)}
            onClick={() => setEditingId(config.id)}
            className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
               <div className="cursor-grab text-stone-400 hover:text-stone-600 p-1 -m-1 shrink-0" onClick={e => e.stopPropagation()}>
                 <GripVertical className="w-5 h-5" />
               </div>
               <span className="text-stone-500 font-mono font-bold text-xs sm:text-sm w-6 sm:w-7 tracking-tight flex items-center justify-center bg-stone-200/80 rounded-md h-6 sm:h-7 shrink-0">#{config.id}</span>
               <span className="text-sm sm:text-base font-bold truncate">{config.name}</span>
            </div>
            <div 
              className="p-2 -mr-2 text-stone-400 hover:text-stone-800 transition-colors" 
              onClick={(e) => toggleExpand(e, config.id)}
            >
              {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
          </div>
          {isExpanded && activeDemos.length > 0 && (
            <div className="pl-14 pr-4 py-2 bg-stone-50/50 rounded-xl border border-stone-100 space-y-1">
               {activeDemos.map(d => (
                 <div key={d.id} className="text-sm font-medium text-stone-600 flex items-center gap-2 truncate">
                   <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"></span>
                   <span className="truncate">{d.title}</span>
                 </div>
               ))}
            </div>
          )}
          {isExpanded && activeDemos.length === 0 && (
            <div className="pl-14 pr-4 py-2 bg-stone-50/50 rounded-xl border border-stone-100 text-sm italic text-stone-400">
               Chưa có bài hát nào dùng giao diện này
            </div>
          )}
          </div>
        )})}
      </div>
    </div>
  );
}

function AdminTemplateEdit({ config, demos, onBack, onSave, isPCPreviewMode, setIsPCPreviewMode }: any) {
    const [name, setName] = useState(config.name);
    const [bgColor, setBgColor] = useState(config.bgColor || '');
    const [titleColor, setTitleColor] = useState(config.titleColor || '');
    const [lyricsColor, setLyricsColor] = useState(config.lyricsColor || '');
    const [waveColor, setWaveColor] = useState(config.waveColor || '');
    const [previewSongId, setPreviewSongId] = useState(demos[0]?.id || '');

    const currentConfig = { ...config, name, bgColor, titleColor, lyricsColor, waveColor };

    const renderColorPickerField = (
      label: string, 
      value: string, 
      setValue: (v: string) => void, 
      placeholder: string
    ) => {
      const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);
      const pickerVal = isValidHex ? (value.length === 4 ? '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3] : value) : '#ffffff';

      return (
        <div>
          <label className={`block font-bold text-stone-700 mb-1 ${isPCPreviewMode ? 'text-xs' : 'text-sm'}`}>{label}</label>
          <div className="flex gap-2 items-center animate-fade-in">
            <input 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              className={`flex-1 border border-stone-200 rounded-xl px-4 ${isPCPreviewMode ? 'py-2 text-sm' : 'py-3 text-base'} bg-stone-50/50 hover:bg-stone-50 outline-none focus:ring-2 focus:ring-emerald-500/25 transition-all`} 
              placeholder={placeholder} 
            />
            <div className="relative w-10 h-10 md:w-12 md:h-12 border border-stone-200 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform flex items-center justify-center bg-stone-50">
              <div className="absolute inset-1 rounded-lg border border-black/5" style={{ backgroundColor: value || 'transparent' }} />
              <input 
                type="color" 
                value={pickerVal} 
                onChange={e => setValue(e.target.value)} 
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
              />
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className={`flex flex-col fixed inset-0 md:relative md:inset-auto bg-zinc-900 z-50 ${isPCPreviewMode ? 'w-full h-full' : 'md:h-[calc(100vh-128px)] md:-m-8'}`}>
         <div className="bg-white p-4 border-b flex justify-between items-center z-10 shrink-0">
             <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium font-sans">
                 <ArrowLeft className="w-5 h-5"/> Trở về
             </button>
             <div className="flex items-center gap-4">
                 <button 
                     onClick={() => setIsPCPreviewMode && setIsPCPreviewMode(!isPCPreviewMode)} 
                     className={`hidden md:flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${isPCPreviewMode ? 'border-stone-800 bg-stone-100 text-stone-900' : 'border-stone-200 bg-transparent text-stone-450 hover:text-stone-700 hover:border-stone-400'} shadow-sm`}
                     title="Giao diện xem trên máy tính"
                 >
                     <Monitor className="w-5 h-5 stroke-[1.5]" />
                 </button>
                 <button onClick={() => onSave(currentConfig)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow">
                     Lưu cài đặt
                 </button>
             </div>
         </div>
         <div className="flex flex-1 flex-col md:flex-row overflow-y-auto md:overflow-hidden relative border-t-0">
             <div className={`w-full h-auto md:h-full ${isPCPreviewMode ? 'md:w-[260px] p-4 space-y-4' : 'md:w-[400px] p-6 md:p-8 space-y-6'} bg-white flex-shrink-0 border-b md:border-b-0 md:border-r overflow-visible md:overflow-y-auto custom-scrollbar`}>
                 <div>
                     <h3 className={`${isPCPreviewMode ? 'text-lg' : 'text-2xl'} font-black mb-1`}>Chỉnh sửa</h3>
                     <p className="inline-block bg-stone-100 text-stone-500 font-mono text-xs px-2 py-0.5 rounded-md mt-1">Giao diện #{config.id}</p>
                 </div>
                 
                 <div>
                    <label className={`${isPCPreviewMode ? 'text-xs' : 'text-sm'} block font-bold text-stone-700 mb-2`}>Bài hát Preview</label>
                    <select className={`w-full border rounded-xl px-4 ${isPCPreviewMode ? 'py-2 text-sm' : 'py-3'} bg-stone-50`} value={previewSongId} onChange={e => setPreviewSongId(e.target.value)}>
                       {demos.map((d: any) => (
                           <option key={d.id} value={d.id}>{d.title}</option>
                       ))}
                    </select>
                 </div>

                 <div className={`space-y-4 pt-4 border-t border-stone-200 ${isPCPreviewMode ? 'text-sm' : ''}`}>
                    <div>
                        <label className={`block font-bold text-stone-700 mb-1 ${isPCPreviewMode ? 'text-xs' : 'text-sm'}`}>Tên hiển thị</label>
                        <input value={name} onChange={e => setName(e.target.value)} className={`w-full border border-stone-300 rounded-xl px-4 ${isPCPreviewMode ? 'py-2' : 'py-3'}`} placeholder="VD: Mặc định 1" />
                    </div>
                    {renderColorPickerField("Màu nền tùy chỉnh", bgColor, setBgColor, "VD: #111827")}
                    {renderColorPickerField("Màu chữ tiêu đề", titleColor, setTitleColor, "VD: #ffffff")}
                    {renderColorPickerField("Màu lời bài hát", lyricsColor, setLyricsColor, "VD: #eeeeee")}
                    {renderColorPickerField("Màu sóng âm", waveColor, setWaveColor, "VD: #10b981")}
                 </div>
             </div>
             <div className="flex-1 w-full min-h-[700px] md:min-h-0 bg-stone-900 relative overflow-hidden flex items-center justify-center py-6 md:py-0">
                {previewSongId ? (
                   <div className={`w-full bg-black relative overflow-hidden transition-all duration-500 ease-in-out transform transform-gpu ${
                       isPCPreviewMode 
                           ? 'h-full border-0 rounded-none shadow-none scale-100 min-w-[700px] xl:min-w-[1024px]'
                           : 'md:w-[375px] h-full md:h-[812px] shadow-2xl md:rounded-[3rem] md:border-[12px] border-stone-800 shrink-0 md:scale-[0.80] lg:scale-[0.80] xl:scale-[0.80] 2xl:scale-[0.95] origin-center no-scrollbar'
                   }`}>
                      <div className="absolute inset-0 overflow-y-auto  no-scrollbar custom-scrollbar">
                        <DemoPlayer songIdP={previewSongId} previewConfig={{...currentConfig, isPCPreviewMode}} />
                      </div>
                   </div>
                ) : (
                    <div className="text-stone-500 bg-stone-900 h-full w-full flex items-center justify-center font-medium">Hãy chọn bài hát để xem.</div>
                )}
             </div>
         </div>
      </div>
    );
}

function AdminDatabaseSettings() {
  const [configsData, setConfigsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/firebase-configs', {
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfigsData(data);
      } else {
        setError('Không thể lấy danh sách cấu hình Firebase');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (id: string) => {
    if (!configsData) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const newConfigsData = { ...configsData, activeId: id };
      const res = await fetch('/api/admin/firebase-configs', {
        method: 'POST',
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfigsData)
      });
      const data = await res.json();
      if (res.ok) {
        setConfigsData(newConfigsData);
        setSuccess('Đã chuyển DB Firebase thành công! (Vui lòng tải lại trang để thấy dữ liệu mới)');
      } else {
        setError(data.error || 'Lỗi khi chuyển DB');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!configsData || !editForm) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let updatedConfigs = [...configsData.configs];
      if (editingConfigId === 'new') {
        updatedConfigs.push({ ...editForm, id: Date.now().toString() });
      } else {
        const idx = updatedConfigs.findIndex(c => c.id === editingConfigId);
        if (idx >= 0) updatedConfigs[idx] = editForm;
      }
      const newConfigsData = { ...configsData, configs: updatedConfigs };
      
      const res = await fetch('/api/admin/firebase-configs', {
        method: 'POST',
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfigsData)
      });
      if (res.ok) {
        setConfigsData(newConfigsData);
        setSuccess('Đã lưu cấu hình Firebase!');
        setEditingConfigId(null);
        setEditForm(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Lỗi khi lưu cấu hình');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !configsData) return <div className="text-stone-500">Đang tải...</div>;

  if (editingConfigId && editForm) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => { setEditingConfigId(null); setEditForm(null); }} className="p-2 hover:bg-stone-200 rounded-lg text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-stone-900">{editingConfigId === 'new' ? 'Thêm cấu hình mới' : 'Chỉnh sửa cấu hình'}</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Tên gợi nhớ (VD: DB cũ, Mặc định...)</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Project ID</label>
              <input type="text" value={editForm.config.projectId} onChange={e => setEditForm({...editForm, config: {...editForm.config, projectId: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">API Key</label>
              <input type="text" value={editForm.config.apiKey} onChange={e => setEditForm({...editForm, config: {...editForm.config, apiKey: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">App ID</label>
              <input type="text" value={editForm.config.appId} onChange={e => setEditForm({...editForm, config: {...editForm.config, appId: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Auth Domain</label>
              <input type="text" value={editForm.config.authDomain} onChange={e => setEditForm({...editForm, config: {...editForm.config, authDomain: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Storage Bucket</label>
              <input type="text" value={editForm.config.storageBucket} onChange={e => setEditForm({...editForm, config: {...editForm.config, storageBucket: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Messaging Sender ID</label>
              <input type="text" value={editForm.config.messagingSenderId} onChange={e => setEditForm({...editForm, config: {...editForm.config, messagingSenderId: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Measurement ID</label>
              <input type="text" value={editForm.config.measurementId || ''} onChange={e => setEditForm({...editForm, config: {...editForm.config, measurementId: e.target.value}})} className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Firestore Database ID (mặc định là default)</label>
              <input type="text" value={editForm.config.firestoreDatabaseId || ''} onChange={e => setEditForm({...editForm, config: {...editForm.config, firestoreDatabaseId: e.target.value}})} placeholder="default" className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          
          <div className="pt-4 flex gap-3">
            <button disabled={loading} onClick={handleSaveEdit} className="px-6 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50">
              Lưu Lại
            </button>
            <button onClick={() => { setEditingConfigId(null); setEditForm(null); }} className="px-6 py-2 bg-stone-200 text-stone-800 rounded-xl font-bold hover:bg-stone-300">
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-stone-900">Quản Lý Cơ Sở Dữ Liệu</h2>
          <p className="text-sm text-stone-500">Chuyển đổi giữa các Firebase config (DB mới / DB cũ) an toàn.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => {
            if (window.confirm('CẢNH BÁO: Hành động này sẽ XÓA SẠCH toàn bộ dữ liệu (bài hát, playlist, cài đặt) trong Database ĐANG DÙNG. Bạn có chắc chắn muốn làm mới Database này?')) {
              setLoading(true);
              try {
                const res = await fetch('/api/admin/firebase-wipe', {
                  method: 'POST',
                  headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken()}` }
                });
                if (res.ok) {
                  setSuccess('Đã xóa sạch dữ liệu trong DB hiện tại. Vui lòng tải lại trang!');
                } else {
                  setError('Lỗi khi xóa DB');
                }
              } catch (e) {
                setError('Lỗi kết nối máy chủ');
              } finally {
                setLoading(false);
              }
            }
          }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 text-sm">
            <Trash2 className="w-4 h-4" /> Làm mới DB này
          </button>
          <button onClick={() => {
            setEditingConfigId('new');
            setEditForm({ name: '', config: { projectId: '', apiKey: '', appId: '', authDomain: '', storageBucket: '', messagingSenderId: '', measurementId: '', firestoreDatabaseId: 'default' } });
          }} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 text-sm">
            <Plus className="w-4 h-4" /> Thêm DB mới
          </button>
        </div>
      </div>

      {success && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium">{success}</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configsData?.configs?.map((c: any) => {
          const isActive = c.id === configsData.activeId;
          return (
            <div key={c.id} className={`p-5 rounded-2xl border-2 transition-all ${isActive ? 'border-blue-500 bg-blue-50/30' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                    {c.name} {isActive && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Đang dùng</span>}
                  </h3>
                  <p className="text-sm text-stone-500 font-mono mt-1">{c.config.projectId}</p>
                </div>
                <button onClick={() => { setEditingConfigId(c.id); setEditForm({...c}); }} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              
              {!isActive && (
                <button disabled={loading} onClick={() => handleSwitch(c.id)} className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
                  Dùng DB này
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState<AppData | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'>('demos');
  const [demosSubTab, setDemosSubTab] = useState<'released' | 'demos' | 'drafts' | 'playlists' | 'trash' | 'landing_pages'>('released');
  
  // Chorus Repost & Ticket States
  const [otherSongs, setOtherSongs] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  
  // Report Popup State
  const [reportSong, setReportSong] = useState<any | null>(null);
  const [reportType, setReportType] = useState<'remove' | 'edit'>('edit');
  const [reportDesc, setReportDesc] = useState('');

  // Bell/Notification Count State
  const [bellCount, setBellCount] = useState(0);

  // External URL states
  const [showExternalUrlInput, setShowExternalUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [isCheckingExternalUrl, setIsCheckingExternalUrl] = useState(false);
  const [externalError, setExternalError] = useState('');
  const [externalSuccess, setExternalSuccess] = useState('');
  
  const [systemArtists, setSystemArtists] = useState<any[]>([]);
  const [systemFavicon, setSystemFavicon] = useState<string>('');

  useEffect(() => {
    fetch('/api/public/artists')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setSystemArtists(data);
        } else if (data && Array.isArray(data.artists)) {
          setSystemArtists(data.artists);
        }
      })
      .catch(err => console.error("Error fetching public artists:", err));

    fetch('/api/public/landing-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.faviconUrl) {
          setSystemFavicon(data.faviconUrl);
        }
      })
      .catch(err => console.error("Error fetching landing config:", err));
  }, []);

  const handleAddExternalSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;
    setIsCheckingExternalUrl(true);
    setExternalError('');
    setExternalSuccess('');
    try {
      const response = await fetch('/api/admin/add-external-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ url: externalUrl })
      });
      const dataRes = await response.json();
      if (!response.ok) {
        setExternalError(dataRes.error || 'Có lỗi xảy ra khi kiểm tra bài hát!');
      } else {
        setExternalSuccess('Thêm bài hát đăng lại ngoài thành công!');
        setExternalUrl('');
        // Refresh other songs
        await fetchOtherSongs();
        setTimeout(() => setShowExternalUrlInput(false), 2000);
      }
    } catch (err: any) {
      setExternalError('Lỗi kết nối: ' + err.message);
    } finally {
      setIsCheckingExternalUrl(false);
    }
  };

  const handleRemoveExternalRepost = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài hát ngoài này khỏi danh sách Đăng lại?')) return;
    try {
      const response = await fetch('/api/admin/remove-external-repost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        await fetchOtherSongs();
      } else {
        const dataRes = await response.json();
        alert(dataRes.error || 'Lỗi khi xóa bài hát ngoài!');
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const fetchOtherSongs = async () => {
    try {
      const res = await fetch('/api/admin/other-songs', {
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        setOtherSongs(list);
      }
    } catch (e) {
      console.error("Error fetching other songs:", e);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets', {
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        setTicketsList(list);
        
        // Calculate bell Count: open edit tickets
        const openEditTickets = list.filter((t: any) => t.status === 'open' && t.type === 'edit');
        setBellCount(openEditTickets.length);

        if (selectedTicket) {
          const updatedSelected = list.find((t: any) => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      }
    } catch (e) {
      console.error("Error fetching tickets:", e);
    }
  };

  // Poll for tickets and other songs
  useEffect(() => {
    fetchOtherSongs();
    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCreateReport = async () => {
    if (!reportSong || !reportDesc) return;
    try {
      const res = await fetch('/api/admin/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({
          songId: reportSong.id,
          songTitle: reportSong.title,
          sourceArtist: reportSong.sourceArtist.username,
          type: reportType,
          description: reportDesc
        })
      });
      if (res.ok) {
        setToast("Đã gửi báo cáo thành công!");
        setReportSong(null);
        setReportDesc('');
        fetchTickets();
      } else {
        const err = await res.json();
        setToast(`Lỗi: ${err.error || 'Gửi báo cáo thất bại'}`);
      }
    } catch (e: any) {
      setToast(`Lỗi: ${e.message}`);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const handleSendTicketMessage = async () => {
    if (!selectedTicket || !chatMessageText.trim()) return;
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ text: chatMessageText })
      });
      if (res.ok) {
        setChatMessageText('');
        fetchTickets();
      } else {
        const errorData = await res.json();
        console.error("Failed to send message:", errorData);
        setToast(`Không thể gửi tin nhắn: ${errorData.error || 'Lỗi không xác định'}`);
      }
    } catch (e: any) {
      console.error("Exception sending message:", e);
      setToast(`Đã xảy ra lỗi: ${e.message}`);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Mở lại yêu cầu",
      message: "Bạn có chắc chắn muốn mở lại ticket này không?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/tickets/${ticketId}/reopen`, {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': `Bearer ${getAdminToken() || ''}`
            }
          });
          if (res.ok) {
            setToast("Đã mở lại ticket thành công!");
            fetchTickets();
          } else {
             const err = await res.json();
             setToast(`Lỗi: ${err.error}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleResolveTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Từ chối yêu cầu",
      message: "Bạn có chắc chắn muốn từ chối yêu cầu và đóng ticket này?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/tickets/${ticketId}/resolve`, {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': `Bearer ${getAdminToken() || ''}`
            }
          });
          if (res.ok) {
            setToast("Đã đóng ticket thành công!");
            fetchTickets();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };
  const handleResolveTicketOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/resolve`, {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        setToast("Đã đóng ticket thành công!");
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminRemoveSong = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Xác nhận gỡ bài",
      message: "Bạn có chắc chắn gỡ bài hát này khỏi trang của mình theo yêu cầu của đối tác không?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/tickets/${ticketId}/remove-song`, {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': `Bearer ${getAdminToken() || ''}`
            }
          });
          if (res.ok) {
            setToast("Đã ra quyết định gỡ bài hát và đóng ticket!");
            fetchTickets();
          } else {
            const err = await res.json();
            setToast(`Lỗi: ${err.error}`);
          }
        } catch (e: any) {
          setToast(`Lỗi: ${e.message}`);
        }
      }
    });
  };
  const handleAdminRemoveSongOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/remove-song`, {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        setToast("Đã ra quyết định gỡ bài hát và đóng ticket!");
        fetchTickets();
      } else {
        const err = await res.json();
        setToast(`Lỗi: ${err.error}`);
      }
    } catch (e: any) {
      setToast(`Lỗi: ${e.message}`);
    }
  };
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [actionConfirm, setActionConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'song' | 'playlist';
    id: string;
    name: string;
  } | null>(null);
  const [toast, setToast] = useState('');
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [homeCoverProgress, setHomeCoverProgress] = useState(0);
  const [faviconProgress, setFaviconProgress] = useState(0);
  const [ogImageProgress, setOgImageProgress] = useState(0);
  const [syncingCovers, setSyncingCovers] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [customDomain, setCustomDomain] = useState('');
  const [slideProgress, setSlideProgress] = useState(0);
  const [draggingSlideIdx, setDraggingSlideIdx] = useState<number | null>(null);
  
  const [homeCoverUrlPreview, setHomeCoverUrlPreview] = useState('');
  const [faviconUrlPreview, setFaviconUrlPreview] = useState('');
  const [ogImageUrlPreview, setOgImageUrlPreview] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isAdminSearchExpanded, setIsAdminSearchExpanded] = useState(false);

  const handleAdminSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAdminSearchQuery(value);
    setCurrentPage(1);

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;

    if (value.endsWith(' ')) {
      const hasReleasedMatches = (data?.demos?.filter(d => d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasDemosMatches = (data?.demos?.filter(d => !d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasDraftsMatches = (data?.demos?.filter(d => d.isDraft && !d.deleted && d.linkType !== 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasLandingMatches = (data?.demos?.filter(d => d.linkType === 'indirect' && !d.deleted) || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasPlaylistMatches = (data?.playlists || []).filter(p => !p.deleted)
        .some(p => p.title.toLowerCase().includes(trimmed));

      if (hasReleasedMatches) {
        setDemosSubTab('released');
      } else if (hasDemosMatches) {
        setDemosSubTab('demos');
      } else if (hasDraftsMatches) {
        setDemosSubTab('drafts');
      } else if (hasLandingMatches) {
        setDemosSubTab('landing_pages');
      } else if (hasPlaylistMatches) {
        setDemosSubTab('playlists');
      }
    }
  };

  const handleLogoutAdmin = async () => {
    removeAdminToken();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    const ext = getArtistExtensionFromUrl();
    window.location.href = ext ? `/${ext}` : '/';
  };

  const renderPagination = (totalItems: number) => {
     const totalPages = Math.ceil(totalItems / itemsPerPage);
     if (totalPages <= 1) return null;
     return (
        <div className="flex justify-center items-center gap-2 mt-6">
           <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50">&lt;</button>
           <span className="text-sm font-bold text-stone-600 px-3">{currentPage} / {totalPages}</span>
           <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50">&gt;</button>
        </div>
     );
  };

  // Passwords Tab States
  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminPassError, setAdminPassError] = useState('');
  const [adminPassSuccess, setAdminPassSuccess] = useState('');

  const [memberPassInput, setMemberPassInput] = useState('');
  const [memberPassError, setMemberPassError] = useState('');
  const [memberPassSuccess, setMemberPassSuccess] = useState('');
  
  const [isPCPreviewMode, setIsPCPreviewMode] = useState(false);
  const effectiveSidebarCollapsed = isSidebarCollapsed || isPCPreviewMode;
  
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [demosSubTab]);

  const loadData = () => {
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Authorization': `Bearer ${getAdminToken() || ''}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          removeAdminToken();
          window.location.href = getAdminLink();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(resData => {
        setData(resData);
        if (resData.customDomain) {
          setCustomDomain(resData.customDomain);
        }
        if (resData.slideshowImages) {
          setSlideshowImages(resData.slideshowImages);
        }
        if (resData.homeCoverUrl) setHomeCoverUrlPreview(resData.homeCoverUrl);
        if (resData.faviconUrl) setFaviconUrlPreview(resData.faviconUrl);
        if (resData.ogImageUrl) setOgImageUrlPreview(resData.ogImageUrl);
        if (resData.memberPassword) {
          setMemberPassInput(resData.memberPassword);
        }
      })
      .catch(err => {
        console.error("Lỗi tải thông tin quản trị:", err);
      });
  };

  useEffect(() => { loadData(); }, []);

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  const uploadWithProgress = (file: File, setProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken() || ''}`);
    xhr.setRequestHeader('x-artist-extension', getArtistExtensionFromUrl());
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgress(100);
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } else reject(new Error('Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  const handleShare = async (slugOrId: string) => {
    let url = window.location.origin + getArtistLink('/song/' + slugOrId);
    url = formatShareUrl(url);
    await copyToClipboard(url);
    setToast('Đã copy link!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleShareSecret = async (demoItem: any) => {
    let url = window.location.origin + getArtistLink('/song/' + (demoItem.slug || demoItem.id));
    url = formatShareUrl(url);
    url += `?secret=${demoItem.secretKey}`;
    await copyToClipboard(url);
    setToast('Đã copy Secret Link!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeleteClick = (type: 'song' | 'playlist', id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    const endpoint = type === 'song' ? `/api/demos/${id}/delete` : `/api/playlists/${id}/delete`;
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Authorization': `Bearer ${getAdminToken() || ''}`
      }
    });
    
    setDeleteConfirm(null);
    setToast(type === 'song' ? 'Đã di chuyển bài hát vào Thùng rác!' : 'Đã di chuyển playlist vào Thùng rác!');
    setTimeout(() => setToast(''), 3000);
    loadData();
  };

  const handleDuplicate = async (id: string) => {
    try {
       const res = await fetch(`/api/demos/${id}/duplicate`, {
         method: 'POST',
         headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

           'Authorization': `Bearer ${getAdminToken() || ''}`
         }
       });
       if (res.ok) {
          const newDemo = await res.json();
          setToast('Đã tạo bản sao thành công! Đang chuyển hướng...');
          setTimeout(() => {
            setToast('');
            navigate(getAdminLink(`/edit/${newDemo.id}`));
          }, 1000);
       } else {
          alert('Lỗi khi duplicate bản ghi.');
       }
    } catch (err) {
       console.error(err);
    }
  };

  const handleRestore = async (type: 'song' | 'playlist', id: string) => {
    const endpoint = type === 'song' ? `/api/demos/${id}/restore` : `/api/playlists/${id}/restore`;
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Authorization': `Bearer ${getAdminToken() || ''}`
      }
    });
    
    setToast(type === 'song' ? 'Đã khôi phục bài hát!' : 'Đã khôi phục playlist!');
    setTimeout(() => setToast(''), 3000);
    loadData();
  };

  const handleCancelRequest = async (type: 'name' | 'username') => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;
    try {
      // Optimistically clear the pending status so the inputs unlock immediately
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pendingNameChange: type === 'name' ? undefined : prev.pendingNameChange,
          pendingUsernameChange: type === 'username' ? undefined : prev.pendingUsernameChange
        };
      });

      const res = await fetch('/api/profile/cancel-request', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        setToast('Đã hủy yêu cầu!');
        setTimeout(() => setToast(''), 3000);
        loadData();
      } else {
        // Rollback on error
        loadData();
      }
    } catch (e) {
      loadData();
    }
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({
          pageTitle: payload.pageTitle,
          artistName: payload.artistName,
          username: payload.username,
          artistBio: payload.artistBio,
          homeCoverUrl: payload.homeCoverUrl,
          faviconUrl: payload.faviconUrl,
          ogImageUrl: payload.ogImageUrl,
          youtubePlaylistUrl: payload.youtubePlaylistUrl,
          spotifyUrl: payload.spotifyUrl,
          socialFacebook: payload.socialFacebook,
          socialInstagram: payload.socialInstagram,
          socialYoutube: payload.socialYoutube,
          socialTiktok: payload.socialTiktok,
          globalPassword: payload.globalPassword,
          globalBaseUrl: payload.globalBaseUrl,
          customDomain: payload.customDomain,
          autoSwitchTabs: payload.autoSwitchTabs === 'true',
          hideFromHomepage: payload.hideFromHomepage === 'true',
          slideshowImages: slideshowImages,
          tab1Name: payload.tab1Name,
          tab2Name: payload.tab2Name,
          tab3Name: payload.tab3Name
        }),
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        setData(updatedData);
        setToast('Đã lưu thông tin thành công!');
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast('Lỗi khi lưu thông tin!');
        setTimeout(() => setToast(''), 3000);
      }
    } catch (error) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError('');
    setAdminPassSuccess('');

    if (!oldAdminPass || !newAdminPass || !confirmAdminPass) {
      setAdminPassError('Vui lòng điền đầy đủ các trường!');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setAdminPassError('Xác nhận mật khẩu mới không khớp!');
      return;
    }
    if (newAdminPass.length < 4) {
      setAdminPassError('Mật khẩu mới phải từ 4 ký tự trở lên!');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({
          oldPassword: oldAdminPass,
          newPassword: newAdminPass,
          confirmPassword: confirmAdminPass
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setAdminToken(resData.token);
        setAdminPassSuccess('Đổi mật khẩu quản trị thành công!');
        setOldAdminPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
        setToast('Đổi mật khẩu quản trị thành công!');
        setTimeout(() => setToast(''), 3000);
      } else {
        setAdminPassError(resData.error || 'Đã có lỗi xảy ra!');
      }
    } catch (err) {
      setAdminPassError('Lỗi kết nối máy chủ!');
    }
  };

  const handleMemberPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberPassError('');
    setMemberPassSuccess('');

    if (!memberPassInput || memberPassInput.length < 4) {
      setMemberPassError('Mật khẩu thành viên tối thiểu phải từ 4 ký tự!');
      return;
    }

    try {
      const res = await fetch('/api/admin/set-member-password', {
        method: 'POST',
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ memberPassword: memberPassInput })
      });

      const resData = await res.json();
      if (res.ok) {
        setMemberPassSuccess('Cập nhật mật khẩu thành viên thành công!');
        setToast('Đã cập nhật mật khẩu thành viên!');
        setTimeout(() => setToast(''), 3000);
        loadData();
      } else {
        setMemberPassError(resData.error || 'Đã có lỗi xảy ra!');
      }
    } catch (err) {
      setMemberPassError('Lỗi kết nối máy chủ!');
    }
  };

  if (!data) return <div className="min-h-screen bg-stone-100 flex items-center justify-center text-stone-500">Đang tải AdminCP...</div>;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold z-50 animate-[bounce_1s_ease-in-out]">
          {toast}
        </div>
      )}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-lg select-none">
            <ChorusLogo className="w-9 h-9" />
            
            <span className="leading-none mt-1 ml-1 text-stone-400">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={getArtistExtensionFromUrl() ? `/${getArtistExtensionFromUrl()}` : "/"} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 hover:scale-105 animate-[fade-in_0.3s_ease-out]"
              title="Trang chủ"
              id="admin-top-home-btn"
            >
              <HomeIcon className="w-4 h-4 stroke-[2]" />
            </Link>
            <button 
              onClick={handleLogoutAdmin}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer animate-[fade-in_0.3s_ease-out]"
              title="Đăng xuất"
              id="admin-top-logout-btn"
            >
              <LogOut className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      <div className={`mx-auto ${isPCPreviewMode ? 'w-full px-0 py-0 flex-1 flex overflow-hidden' : 'w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8'}`}>
        <aside className={`${
          effectiveSidebarCollapsed 
            ? (isPCPreviewMode 
                ? 'flex flex-col w-16 bg-white border-r border-stone-200 shrink-0 py-4 items-center space-y-4 relative' 
                : 'hidden md:flex flex-col w-16 bg-white border-r border-stone-200 shrink-0 py-4 items-center space-y-4 relative')
            : 'w-full md:w-64 shrink-0 flex flex-col md:sticky md:top-[88px] self-start relative'
        }`}>
          {!effectiveSidebarCollapsed && <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-4 hidden md:block">Quản lý</h3>}
          {!isPCPreviewMode && (
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`hidden md:flex absolute ${isSidebarCollapsed ? '-top-2 left-1/2 -translate-x-1/2 z-10' : '-top-2 right-2 z-10'} items-center justify-center p-1 text-stone-400 hover:text-stone-900 transition-colors bg-white rounded-md border border-stone-100 shadow-sm`}
             >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
             </button>
          )}
          <div className={`${effectiveSidebarCollapsed ? 'flex flex-col gap-2 w-full px-2' : 'mb-6 space-y-1'}`}>
            <button
              onClick={() => { setActiveTab('demos'); setDemosSubTab('released'); }}
              className={`flex items-center transition-colors ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'demos' && demosSubTab !== 'playlists' && demosSubTab !== 'drafts' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`}
              title="Bài Hát"
            >
              <Disc3 className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Bài Hát</span>}
            </button>
            <button
              onClick={() => { setActiveTab('demos'); setDemosSubTab('drafts'); }}
              className={`flex items-center transition-colors ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'demos' && demosSubTab === 'drafts' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`}
              title="Nháp"
            >
              <FileText className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Nháp</span>}
            </button>
            <button
              onClick={() => { setActiveTab('demos'); setDemosSubTab('playlists'); }}
              className={`flex items-center transition-colors ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'demos' && demosSubTab === 'playlists' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`}
              title="Playlist"
            >
              <ListMusic className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Playlist</span>}
            </button>
            <button 
              onClick={() => setActiveTab('templates')} 
              className={`flex items-center transition-colors ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'templates' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`} 
              title="Giao Diện"
            >
              <Camera className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Giao Diện</span>}
            </button>
            <button
              onClick={() => setActiveTab('reposts')}
              className={`flex items-center transition-colors relative ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'reposts' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`}
              title={`Đăng lại (${otherSongs.length})`}
            >
              <div className="relative flex items-center justify-center">
                <Repeat className="w-5 h-5" />
                {effectiveSidebarCollapsed && otherSongs.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {otherSongs.length}
                  </span>
                )}
              </div>
              {!effectiveSidebarCollapsed && <span>Đăng lại ({otherSongs.length})</span>}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center transition-colors relative ${
                effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
              } ${
                activeTab === 'tickets' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'
              }`}
              title="Hộp Thư"
            >
              <MessageSquare className="w-5 h-5" /> 
              {!effectiveSidebarCollapsed && <span className="flex items-center gap-2">Hộp Thư {bellCount > 0 && <Bell className="w-3.5 h-3.5 text-red-400 animate-bounce" />}</span>}
              {bellCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {bellCount}
                </span>
              )}
            </button>
          </div>
          
          <div className={`${effectiveSidebarCollapsed ? 'flex flex-col gap-2 w-full px-2' : 'mb-6 space-y-1'}`}>
            {!effectiveSidebarCollapsed && <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-4">Hồ sơ & Mở rộng</h3>}
            <button onClick={() => setActiveTab('profile')} className={`flex items-center transition-colors ${
              effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
            } ${activeTab === 'profile' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'}`} title="Cài Đặt">
              <Settings className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Cài Đặt</span>}
            </button>
            <button onClick={() => setActiveTab('socials')} className={`flex items-center transition-colors ${
              effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
            } ${activeTab === 'socials' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'}`} title="Mạng Xã Hội">
              <Globe className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Mạng Xã Hội</span>}
            </button>
            <button onClick={() => setActiveTab('security')} className={`flex items-center transition-colors ${
              effectiveSidebarCollapsed ? 'justify-center w-10 h-10 rounded-xl mx-auto' : 'justify-start w-full gap-3 px-4 py-3 rounded-xl font-medium'
            } ${activeTab === 'security' ? 'bg-stone-900 text-white' : 'hover:bg-stone-200 text-stone-600'}`} title="Bảo Mật">
              <Lock className="w-5 h-5" /> {!effectiveSidebarCollapsed && <span>Bảo Mật</span>}
            </button>

          </div>
        </aside>

        <main className={`flex-1 bg-white flex flex-col ${isPCPreviewMode ? 'rounded-none border-0 shadow-none min-h-0 h-[calc(100vh-64px)] overflow-hidden' : 'rounded-none md:rounded-3xl border-0 md:border md:border-stone-200 shadow-none md:shadow-sm p-4 md:p-8 min-h-[calc(100vh-64px)]'}`}>
          {activeTab === 'demos' && (
            <div>
              {/* Header with Sub-tabs and Create button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-1.5 p-1 bg-stone-150/60 rounded-xl max-w-full overflow-x-auto custom-scrollbar flex-wrap">
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('released')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'released'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    <span>Ra rồi</span>
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
                      {data.demos?.filter(d => d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect')
                        .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('demos')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'demos'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Disc3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                    <span>Đề Mô</span>
                    <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-xs">
                      {data.demos?.filter(d => !d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect')
                        .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('drafts')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'drafts'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    <span>Nháp</span>
                    <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs">
                      {data.demos?.filter(d => d.isDraft && !d.deleted && d.linkType !== 'indirect')
                        .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('landing_pages')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'landing_pages'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
                    <span>Landing Page</span>
                    <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded text-xs">
                      {data.demos?.filter(d => d.linkType === 'indirect' && !d.deleted)
                        .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('playlists')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'playlists'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                    <span>Playlist</span>
                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                      {(data.playlists || []).filter(p => !p.deleted)
                        .filter(p => !adminSearchQuery.trim() || p.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemosSubTab('trash')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                      demosSubTab === 'trash'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-500" />
                    <span>Thùng rác</span>
                    <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-xs">
                      {((data.demos?.filter(d => d.deleted).filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0) + 
                       ((data.playlists || []).filter(p => p.deleted).filter(p => !adminSearchQuery.trim() || p.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0))}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {/* Collapsible Admin Search */}
                  <div className="relative flex items-center">
                    <AnimatePresence initial={false}>
                      {isAdminSearchExpanded ? (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 180, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden relative flex items-center"
                        >
                          <input
                            type="text"
                            id="admin-search-input"
                            value={adminSearchQuery}
                            onChange={handleAdminSearchChange}
                            placeholder="Tìm kiếm..."
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-8 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder:text-stone-400 font-medium"
                            autoFocus
                          />
                          <span className="absolute left-3 text-stone-400">
                            <Search className="w-3.5 h-3.5" />
                          </span>
                          {adminSearchQuery && (
                            <button
                              onClick={() => setAdminSearchQuery('')}
                              className="absolute right-3 text-stone-400 hover:text-stone-800"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => {
                        if (isAdminSearchExpanded) {
                          setIsAdminSearchExpanded(false);
                          setAdminSearchQuery('');
                        } else {
                          setIsAdminSearchExpanded(true);
                        }
                      }}
                      className={`p-2 rounded-xl transition-all border ${
                        isAdminSearchExpanded 
                          ? 'text-stone-400 hover:text-stone-800 border-transparent ml-2' 
                          : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-500 hover:text-stone-800'
                      }`}
                      title={isAdminSearchExpanded ? "Đóng tìm kiếm" : "Tìm kiếm..."}
                    >
                      {isAdminSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>

                  <select 
                    value={itemsPerPage} 
                    onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                    className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-700 outline-none hover:border-stone-300 transition-colors cursor-pointer"
                  >
                    <option value={10}>10 bài</option>
                    <option value={20}>20 bài</option>
                    <option value={50}>50 bài</option>
                    <option value={100}>100 bài</option>
                  </select>
                  {demosSubTab === 'playlists' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const title = prompt("Nhập tên playlist mới:");
                        if (!title) return;
                        const res = await fetch('/api/playlists', {
                          method: 'POST',
                          headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAdminToken()}`
                          },
                          body: JSON.stringify({ title })
                        });
                        if (res.ok) {
                           setToast('Tạo playlist thành công!');
                           setTimeout(() => setToast(''), 3000);
                           loadData();
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
                      title="Tạo Playlist"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : demosSubTab !== 'trash' ? (
                    <Link to={getAdminLink('/new')} className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-sm" title="Tạo mới bài viết">
                      <Plus className="w-5 h-5" />
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Action area for selected subtab */}
              <div className="overflow-x-auto min-h-[300px]">
                {demosSubTab === 'landing_pages' && (() => {
                  let landingList = data.demos?.filter(d => d.linkType === 'indirect' && !d.deleted) || [];
                  if (adminSearchQuery.trim()) {
                    landingList = landingList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (landingList.length === 0) {
                     return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">Chưa có Landing Page nào. Hãy tạo mới và chọn Loại Liên Kết là "Landing Page"!</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> Kéo thả các dòng để sắp xếp thứ tự
                      </div>
                      {landingList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={demo.id}
                          className="border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <Link to={getArtistLink(`/song/${demo.slug || demo.id}`)} state={{ fromAdmin: true }} className="hover:text-pink-600 font-bold text-stone-850 text-sm md:text-base block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[580px]">
                                {demo.title}
                              </Link>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs">
                                <span className="text-stone-500 font-medium">Landing Page / Điều hướng</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Chia sẻ Link">
                               <Globe className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Nhân bản">
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Chỉnh sửa">
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title="Xóa">
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                         </div>
                        );
                      })}
                      {renderPagination(landingList.length)}
                    </div>
                  );
                })()}

                {demosSubTab === 'released' && (() => {
                  let releasedList = data.demos?.filter(d => d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    releasedList = releasedList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (releasedList.length === 0) {
                     return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">Chưa có bài hát đã phát hành nào. Hãy tạo mới và đặt trạng thái "Ra rồi"!</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> Kéo thả các dòng bài hát để sắp xếp thứ tự hiển thị ưu tiên ngoài trang chủ
                      </div>
                      {releasedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={demo.id}
                          draggable
                          onDragStart={() => setDraggedItemIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setDraggedItemIdx(null)}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            if (draggedItemIdx === null || draggedItemIdx === idx) return;
                            const items = [...releasedList];
                            const draggedItem = items.splice(draggedItemIdx, 1)[0];
                            items.splice(idx, 0, draggedItem);
                            setDraggedItemIdx(idx);
                            
                            // Reassemble
                            const remaining = (data.demos || []).filter(d => !d.isReleased || d.deleted || d.isDraft);
                            const merged = [...items, ...remaining];
                            setData({ ...data, demos: merged });
                            
                            // Call api to persist order
                            fetch('/api/admin/reorder-demos', {
                              method: 'POST',
                              headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getAdminToken()}`
                              },
                              body: JSON.stringify({ demoIds: [...items, ...((data.demos || []).filter(d => (!d.isReleased || d.isDraft) && !d.deleted))].map(d => d.id) })
                            });
                          }}
                          className={`border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <Link to={getArtistLink(`/song/${demo.slug || demo.id}`)} state={{ fromAdmin: true }} className="hover:text-blue-600 font-bold text-stone-850 text-sm md:text-base block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[580px]">
                                {demo.title}
                              </Link>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs">
                                {demo.status !== 'public' && (
                                  <span className="px-1.5 py-0.5 rounded font-semibold bg-stone-200 text-stone-600 text-[10px] flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" /> Ẩn
                                  </span>
                                )}
                                {demo.singer && <span className="text-stone-500 font-medium">Ca sĩ: {demo.singer}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Chia sẻ Link">
                               <Globe className="w-4 h-4" />
                            </button>
                            {demo.secretKey && (demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) && (
                              <button type="button" onClick={() => handleShareSecret(demo)} className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors animate-[fade-in_0.3s_ease-out]" title="Copy Secret Link">
                                 <Lock className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Nhân bản">
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Chỉnh sửa">
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title="Xóa">
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(releasedList.length)}
                    </div>
                  );
                })()}

                {demosSubTab === 'demos' && (() => {
                  let demoList = data.demos?.filter(d => !d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    demoList = demoList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (demoList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">Chưa có bài hát demo nào. Hãy tạo mới và đặt trạng thái "Đề mô"!</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> Kéo thả các dòng bài hát để sắp xếp thứ tự hiển thị ưu tiên ngoài trang chủ
                      </div>
                      {demoList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={demo.id}
                          draggable
                          onDragStart={() => setDraggedItemIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setDraggedItemIdx(null)}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            if (draggedItemIdx === null || draggedItemIdx === idx) return;
                            const items = [...demoList];
                            const draggedItem = items.splice(draggedItemIdx, 1)[0];
                            items.splice(idx, 0, draggedItem);
                            setDraggedItemIdx(idx);
                            
                            // Reassemble
                            const remaining = (data.demos || []).filter(d => d.isReleased || d.deleted || d.isDraft);
                            const merged = [...remaining, ...items];
                            setData({ ...data, demos: merged });
                            
                            // Call api to persist order
                            fetch('/api/admin/reorder-demos', {
                              method: 'POST',
                              headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getAdminToken()}`
                              },
                              body: JSON.stringify({ demoIds: [...((data.demos || []).filter(d => (d.isReleased || d.isDraft) && !d.deleted)), ...items].map(d => d.id) })
                            });
                          }}
                          className={`border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <Link to={getArtistLink(`/song/${demo.slug || demo.id}`)} state={{ fromAdmin: true }} className="hover:text-blue-600 font-bold text-stone-850 text-sm md:text-base block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[580px]">
                                {demo.title}
                              </Link>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs">
                                {demo.status !== 'public' && (
                                  <span className="px-1.5 py-0.5 rounded font-semibold bg-stone-200 text-stone-600 text-[10px] flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" /> Ẩn
                                  </span>
                                )}
                                {(demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) ? (
                                  <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 border border-stone-200 rounded flex items-center gap-1 text-[10px] md:text-xs">
                                    <Lock className="w-3 h-3 text-stone-500" /> <span className="font-mono">{demo.password || `Mật khẩu chung: ${data?.globalPassword}`}</span>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Chia sẻ Link">
                               <Globe className="w-4 h-4" />
                            </button>
                            {demo.secretKey && (demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) && (
                              <button type="button" onClick={() => handleShareSecret(demo)} className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors animate-[fade-in_0.3s_ease-out]" title="Copy Secret Link">
                                 <Lock className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Nhân bản">
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Chỉnh sửa">
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title="Xóa">
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(demoList.length)}
                    </div>
                  );
                })()}

                {demosSubTab === 'drafts' && (() => {
                  let draftList = data.demos?.filter(d => d.isDraft && !d.deleted && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    draftList = draftList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (draftList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">Chưa có bản nháp nào. Bản nháp được lưu từ màn hình tạo hoặc chỉnh sửa bài hát!</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> Kéo thả để sắp xếp thứ tự hiển thị bản nháp
                      </div>
                      {draftList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={demo.id}
                          draggable
                          onDragStart={() => setDraggedItemIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setDraggedItemIdx(null)}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            if (draggedItemIdx === null || draggedItemIdx === idx) return;
                            const items = [...draftList];
                            const draggedItem = items.splice(draggedItemIdx, 1)[0];
                            items.splice(idx, 0, draggedItem);
                            setDraggedItemIdx(idx);
                            
                            // Reassemble
                            const remaining = (data.demos || []).filter(d => !d.isDraft || d.deleted);
                            const merged = [...items, ...remaining];
                            setData({ ...data, demos: merged });
                            
                            // Call api to persist order
                            fetch('/api/admin/reorder-demos', {
                              method: 'POST',
                              headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getAdminToken()}`
                              },
                              body: JSON.stringify({ demoIds: [...items, ...((data.demos || []).filter(d => !d.isDraft && !d.deleted))].map(d => d.id) })
                            });
                          }}
                          className={`border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <Link to={getAdminLink(`/edit/${demo.id}`)} className="hover:text-amber-600 font-bold text-stone-850 text-sm md:text-base block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[580px]">
                                {demo.title || '(Chưa đặt tiêu đề)'}
                              </Link>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs">
                                <span className="px-1.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-600 text-[10px]">Bản nháp</span>
                                {demo.singer && <span className="text-stone-500 font-medium">Ca sĩ: {demo.singer}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title="Nhân bản">
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Chỉnh sửa">
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title || 'Bản nháp')} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title="Xóa">
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(draftList.length)}
                    </div>
                  );
                })()}

                {demosSubTab === 'playlists' && (() => {
                  let playlistList = (data.playlists || []).filter(p => !p.deleted);
                  if (adminSearchQuery.trim()) {
                    playlistList = playlistList.filter(p => p.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (playlistList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 border border-dashed border-stone-200 rounded-2xl italic bg-stone-50 font-medium text-sm">Chưa có playlist nào. Hãy tạo mới một playlist bên trên!</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> Kéo thả để sắp xếp thứ tự hiển thị playlist ưu tiên ngoài trang chủ
                      </div>
                      {playlistList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((pl, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        const songCount = (data.demos || []).filter(d => 
                           !d.deleted && ((d.playlistIds && d.playlistIds.includes(pl.id)) || 
                           (pl.songIds && pl.songIds.includes(d.id)))
                        ).length;

                        return (
                          <div
                            key={pl.id}
                            draggable
                            onDragStart={() => setDraggedItemIdx(idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnd={() => setDraggedItemIdx(null)}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              if (draggedItemIdx === null || draggedItemIdx === idx) return;
                              const items = [...playlistList];
                              const draggedItem = items.splice(draggedItemIdx, 1)[0];
                              items.splice(idx, 0, draggedItem);
                              setDraggedItemIdx(idx);
                              
                              // Reassemble
                              const remaining = (data.playlists || []).filter(p => p.deleted);
                              const merged = [...items, ...remaining];
                              setData({ ...data, playlists: merged });
                              
                              // Call api to persist order
                              fetch('/api/admin/reorder-playlists', {
                                method: 'POST',
                                headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${getAdminToken()}`
                                },
                                body: JSON.stringify({ playlistIds: items.map(p => p.id) })
                              });
                            }}
                            className={`border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                              <div className="flex flex-col flex-1 min-w-0">
                                <h4 className="font-bold text-stone-850 text-base">{pl.title}</h4>
                                <span className="text-xs text-stone-400 mt-0.5">{songCount} bài nhạc</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                              <Link to={getAdminLink(`/playlist/${pl.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Chỉnh sửa playlist">
                                <Edit3 className="w-4 h-4 text-blue-600" />
                              </Link>
                              <button type="button" onClick={() => handleDeleteClick('playlist', pl.id, pl.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold" title="Xóa playlist">
                                <X className="w-4 h-4 text-red-500 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {renderPagination(playlistList.length)}
                    </div>
                  );
                })()}

                {demosSubTab === 'trash' && (() => {
                  const trashedDemos = data.demos?.filter(d => d.deleted) || [];
                  const trashedPlaylists = (data.playlists || []).filter(p => p.deleted);
                  
                  let allTrashed = [
                     ...trashedDemos.map(d => ({ ...d, _type: 'song' as const })),
                     ...trashedPlaylists.map(p => ({ ...p, _type: 'playlist' as const }))
                  ].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

                  if (adminSearchQuery.trim()) {
                    const q = adminSearchQuery.trim().toLowerCase();
                    allTrashed = allTrashed.filter(item => (item.title || '').toLowerCase().includes(q));
                  }

                  if (allTrashed.length === 0) {
                    return (
                      <div className="text-center py-16 border rounded-2xl border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3">
                        <Trash2 className="w-12 h-12 text-stone-350" />
                        <span className="text-stone-500 italic font-medium text-sm">Thùng rác trống rỗng.</span>
                      </div>
                    );
                  }
                  
                  const getRemainingDays = (deletedAt?: number) => {
                    if (!deletedAt) return '30 ngày';
                    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                    const elapsed = Date.now() - deletedAt;
                    const remainingMs = thirtyDaysMs - elapsed;
                    if (remainingMs <= 0) return '0 ngày ( sắp dọn dẹp )';
                    const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
                    return `Còn ${days} ngày`;
                  };

                  return (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 flex items-start gap-2.5 text-xs shadow-sm">
                        <span className="font-bold flex items-center justify-center p-1 bg-amber-200 rounded-full w-5 h-5 text-[10px] shrink-0 text-amber-800">⚠️</span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-850">Lưu ý dọn dẹp thùng rác:</p>
                          <p className="opacity-90">Hệ thống sẽ giữ tạm thời các mục trên tại đây tối đa 30 ngày. Quá thời gian này, các mục sẽ bị dọn dẹp và xóa vĩnh viễn không thể khôi phục.</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2 px-1">Các mục trong thùng rác ({allTrashed.length})</h4>
                        <div className="space-y-2">
                          {allTrashed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item: any) => (
                            <div key={`${item._type}-${item.id}`} className="border border-stone-100 p-3 rounded-xl flex items-center justify-between gap-3 bg-white shadow-sm hover:bg-stone-50/30 transition-all">
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-stone-850 text-sm md:text-base truncate">{item.title || '(Chưa đặt tiêu đề)'}</span>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                                  <span>{item._type === 'playlist' ? 'Playlist' : (item.isReleased ? 'Bài viết ra rồi' : 'Demo / Nháp')}</span>
                                  <span>•</span>
                                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px] md:text-xs">{getRemainingDays(item.deletedAt)}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRestore(item._type, item.id)}
                                className="text-stone-700 hover:bg-stone-100 border border-stone-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors"
                              >
                                Khôi phục
                              </button>
                            </div>
                          ))}
                        </div>
                        {renderPagination(allTrashed.length)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-8">Thông tin hồ sơ</h2>
              <form onSubmit={handleProfileSave} className="space-y-6">

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Giới thiệu ngắn</label>
                  <input name="artistBio" defaultValue={data.artistBio} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tên nghệ sĩ</label>
                  {data.pendingNameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingNameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('name')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Username đăng nhập</label>
                  {data.pendingUsernameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingUsernameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('username')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Phần mở rộng (Sub-domain)</label>
                  {data.pendingExtensionChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-4 py-3 flex items-center justify-between opacity-80 select-none">
                        <span>Đang yêu cầu đổi thành: <strong>{data.pendingExtensionChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('extension')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="extension" defaultValue={data.extension} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                  <p className="text-xs text-stone-500 mt-1.5">
                    Link của bạn đang là <strong className="text-stone-700">{data.extension}.chorus.vn</strong>
                  </p>
                </div>

<div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Avatar Nghệ Sĩ</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const url = await uploadWithProgress(file, setHomeCoverProgress);
                                setHomeCoverUrlPreview(url);
                            } catch (err) {
                                alert('Lỗi upload');
                                setHomeCoverProgress(0);
                            }
                        }
                    }}
                  >
                    {homeCoverUrlPreview ? (
                      <img src={getPreviewUrl(homeCoverUrlPreview)} className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-stone-200 bg-stone-100/50 flex items-center justify-center text-stone-400 shadow-inner shrink-0">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${homeCoverProgress === 100 || homeCoverUrlPreview ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('homeCoverUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{homeCoverProgress > 0 && homeCoverProgress < 100 ? `Đang tải ${homeCoverProgress}%` : (homeCoverUrlPreview ? 'Thay đổi' : 'Chọn ảnh')}</span>
                        </button>
                        {homeCoverProgress > 0 && homeCoverProgress < 100 ? (
                          <button type="button" onClick={() => setHomeCoverProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : (homeCoverUrlPreview ? (
                          <button type="button" onClick={() => { setHomeCoverUrlPreview(''); setHomeCoverProgress(0); (document.getElementById('homeCoverUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {homeCoverProgress > 0 && homeCoverProgress < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${homeCoverProgress}%` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        Kéo thả ảnh trực tiếp vào ô này
                      </p>
                    </div>
                    <input type="hidden" name="homeCoverUrl" value={homeCoverUrlPreview} />
                    <input type="file" id="homeCoverUpload" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const url = await uploadWithProgress(e.target.files[0], setHomeCoverProgress);
                        setHomeCoverUrlPreview(url);
                      } catch (err) {
                        alert('Lỗi upload');
                        setHomeCoverProgress(0);
                      }
                    }} />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">Dùng đại diện cho kho nhạc, nên chọn ảnh vuông.</p>
                </div>
<div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh nền trang chủ ( Chọn nhiều ảnh để chạy slideshow )</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
                       {slideshowImages.map((src, i) => (
                          <div 
                             key={src + i} 
                             draggable
                             onDragStart={() => setDraggingSlideIdx(i)}
                             onDragEnter={(e) => {
                               e.preventDefault();
                               if (draggingSlideIdx === null || draggingSlideIdx === i) return;
                               const newImages = [...slideshowImages];
                               const item = newImages.splice(draggingSlideIdx, 1)[0];
                               newImages.splice(i, 0, item);
                               setDraggingSlideIdx(i);
                               setSlideshowImages(newImages);
                             }}
                             onDragOver={(e) => e.preventDefault()}
                             onDragEnd={() => setDraggingSlideIdx(null)}
                             className={`relative w-24 h-24 bg-stone-200 rounded-xl overflow-hidden border border-stone-300 group cursor-move ${draggingSlideIdx === i ? 'opacity-50' : 'opacity-100'}`}
                          >
                             <img src={getPreviewUrl(src)} className="w-full h-full object-cover pointer-events-none" />
                             <button type="button" onClick={() => setSlideshowImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">Xóa</button>
                          </div>
                       ))}
                       <button type="button" className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 flex flex-col items-center justify-center gap-1 transition-colors relative overflow-hidden" onClick={() => document.getElementById('slideUpload')?.click()}>
                          {slideProgress > 0 && slideProgress < 100 && <div className="absolute top-0 left-0 bottom-0 bg-stone-300 pointer-events-none" style={{ width: `${slideProgress}%` }}></div>}
                          <div className="text-2xl relative z-10">+</div>
                          <div className="text-xs font-semibold relative z-10 px-1 text-center">{slideProgress > 0 && slideProgress < 100 ? `${slideProgress}%` : 'Thêm ảnh'}</div>
                       </button>
                    </div>
                    <input type="file" id="slideUpload" className="hidden" accept="image/*" multiple onChange={async (e) => {
                      if (!e.target.files?.length) return;
                      const newUploads = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                         try {
                           const url = await uploadWithProgress(e.target.files[i], setSlideProgress);
                           newUploads.push(url);
                         } catch (err) {
                           console.error(err);
                         }
                      }
                      if (newUploads.length) setSlideshowImages(prev => [...prev, ...newUploads]);
                      setSlideProgress(0);
                      e.target.value = '';
                    }} />
                  </div>
                </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Favicon (Icon trên trình duyệt)</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const url = await uploadWithProgress(file, setFaviconProgress);
                                setFaviconUrlPreview(url);
                            } catch (err) {
                                alert('Lỗi upload');
                                setFaviconProgress(0);
                            }
                        }
                    }}
                  >
                    {faviconUrlPreview ? (
                      <img src={getPreviewUrl(faviconUrlPreview)} className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-stone-200 bg-stone-100/50 flex items-center justify-center text-stone-400 shadow-inner shrink-0">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${faviconProgress === 100 || faviconUrlPreview ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('faviconUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{faviconProgress > 0 && faviconProgress < 100 ? `Đang tải ${faviconProgress}%` : (faviconUrlPreview ? 'Thay đổi' : 'Chọn ảnh')}</span>
                        </button>
                        {faviconProgress > 0 && faviconProgress < 100 ? (
                          <button type="button" onClick={() => setFaviconProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : (faviconUrlPreview ? (
                          <button type="button" onClick={() => { setFaviconUrlPreview(''); setFaviconProgress(0); (document.getElementById('faviconUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {faviconProgress > 0 && faviconProgress < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${faviconProgress}%` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        Kéo thả ảnh trực tiếp vào ô này
                      </p>
                    </div>
                    <input type="hidden" name="faviconUrl" value={faviconUrlPreview} />
                    <input type="file" id="faviconUpload" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const url = await uploadWithProgress(e.target.files[0], setFaviconProgress);
                        setFaviconUrlPreview(url);
                      } catch (err) {
                        alert('Lỗi upload');
                        setFaviconProgress(0);
                      }
                    }} />
                  </div>
                  
                </div>
  
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Thumbnail ( Ảnh minh họa khi chia sẻ Link )</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const url = await uploadWithProgress(file, setOgImageProgress);
                                setOgImageUrlPreview(url);
                            } catch (err) {
                                alert('Lỗi upload');
                                setOgImageProgress(0);
                            }
                        }
                    }}
                  >
                    {ogImageUrlPreview ? (
                      <img src={getPreviewUrl(ogImageUrlPreview)} className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-stone-200 bg-stone-100/50 flex items-center justify-center text-stone-400 shadow-inner shrink-0">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${ogImageProgress === 100 || ogImageUrlPreview ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('ogImageUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{ogImageProgress > 0 && ogImageProgress < 100 ? `Đang tải ${ogImageProgress}%` : (ogImageUrlPreview ? 'Thay đổi' : 'Chọn ảnh')}</span>
                        </button>
                        {ogImageProgress > 0 && ogImageProgress < 100 ? (
                          <button type="button" onClick={() => setOgImageProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : (ogImageUrlPreview ? (
                          <button type="button" onClick={() => { setOgImageUrlPreview(''); setOgImageProgress(0); (document.getElementById('ogImageUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {ogImageProgress > 0 && ogImageProgress < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${ogImageProgress}%` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        Kéo thả ảnh trực tiếp vào ô này
                      </p>
                    </div>
                    <input type="hidden" name="ogImageUrl" value={ogImageUrlPreview} />
                    <input type="file" id="ogImageUpload" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const url = await uploadWithProgress(e.target.files[0], setOgImageProgress);
                        setOgImageUrlPreview(url);
                      } catch (err) {
                        alert('Lỗi upload');
                        setOgImageProgress(0);
                      }
                    }} />
                  </div>
                  
                </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề Website</label>
                  <input name="pageTitle" defaultValue={data.pageTitle} placeholder="Để trống sẽ dùng mặc định: Thiên Đường Demo của [Tên nghệ sĩ]" className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                </div>

<hr className="border-stone-200" />
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Playlist YouTube (Nhạc đã phát hành)</label>
                  <input name="youtubePlaylistUrl" defaultValue={data.youtubePlaylistUrl} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://youtube.com/playlist?list=..." />
                  <p className="text-sm text-stone-500 mt-2">Sẽ tự động hiển thị 4 bài hát mới nhất từ playlist này.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Profile Spotify</label>
                  <input name="spotifyUrl" defaultValue={data.spotifyUrl} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://open.spotify.com/artist/..." />
                </div>
                <hr className="border-stone-200" />
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu chung cho các Demo</label>
                  <input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" placeholder="Để trống nếu không muốn dùng mật khẩu chung" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" />
                  <p className="text-sm text-stone-500 mt-2">Tất cả các link ở trang chủ nếu chưa đặt mật khẩu riêng thì sẽ được bảo vệ bởi mật khẩu chung này.</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-extrabold text-stone-800 uppercase tracking-wider">
                        Cấu hình tên miền riêng (Custom Domain)
                      </label>
                      <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
                        <span className="text-xs">✨</span> VIP
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                    Sử dụng tên miền riêng của bạn (ví dụ: <code className="font-mono bg-stone-100 px-1 rounded">nghesi.com</code> hoặc <code className="font-mono bg-stone-100 px-1 rounded">music.nghesi.com</code>) thay vì sử dụng địa chỉ mặc định của hệ thống.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        name="customDomain" 
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="w-full border border-stone-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm text-stone-900" 
                        placeholder="VD: nghesi.com" 
                      />
                    </div>

                    {/* Show setup instructions if domain format looks okay */}
                    {customDomain.trim().length > 3 && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(customDomain.trim()) ? (
                      <div className="bg-white border border-amber-200 rounded-xl p-5 space-y-3 shadow-inner text-stone-800">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                          <span>📋 Hướng dẫn cấu hình DNS</span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          Vui lòng truy cập trang quản lý tên miền của bạn (ví dụ: Cloudflare, GoDaddy, Nhân Hòa...) và thiết lập bản ghi sau để kết nối tên miền này:
                        </p>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-stone-200 text-stone-400">
                                <th className="pb-2 font-semibold uppercase">Loại bản ghi</th>
                                <th className="pb-2 font-semibold uppercase">Tên (Host)</th>
                                <th className="pb-2 font-semibold uppercase">Giá trị (Points to)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-stone-100">
                                <td className="py-2.5 font-mono font-bold text-stone-800">A</td>
                                <td className="py-2.5 font-mono text-stone-600">{customDomain.trim().split('.').length > 2 ? customDomain.trim().split('.')[0] : '@'}</td>
                                <td className="py-2.5 font-mono font-bold text-amber-600">{(data as any)?.systemIp || '103.1.2.3'}</td>
                              </tr>
                              {customDomain.trim().split('.').length <= 2 && (
                                <tr>
                                  <td className="py-2.5 font-mono font-bold text-stone-800">CNAME</td>
                                  <td className="py-2.5 font-mono text-stone-600">www</td>
                                  <td className="py-2.5 font-mono text-stone-600">{getArtistExtensionFromUrl() || 'artist'}.chorus.vn</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="text-[11px] text-stone-500 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                          <strong>💡 Lưu ý:</strong> Sau khi cấu hình xong, quá trình cập nhật DNS có thể mất từ vài phút đến tối đa 24 giờ tùy nhà đăng ký tên miền.
                        </div>
                      </div>
                    ) : customDomain.trim().length > 0 ? (
                      <div className="text-xs text-rose-500 font-medium">
                        ⚠️ Định dạng tên miền không hợp lệ (ví dụ đúng: nghesi.com, sub.nghesi.com)
                      </div>
                    ) : null}
                  </div>
                </div>



                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="autoSwitchTabs" 
                      name="autoSwitchTabs" 
                      defaultChecked={data.autoSwitchTabs} 
                      value="true" 
                      className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer" 
                    />
                    <label htmlFor="autoSwitchTabs" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                      Tự động chuyển tab ở trang chủ (Music / Demo / Playlist)
                    </label>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="hideFromHomepage" 
                      name="hideFromHomepage" 
                      defaultChecked={data.hideFromHomepage} 
                      value="true" 
                      className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer" 
                    />
                    <label htmlFor="hideFromHomepage" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
                      Ẩn khỏi danh sách nghệ sĩ trên trang chủ Chorus.vn
                    </label>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-stone-800 text-sm">Tên tùy chỉnh các Tab Danh Sách Nhạc</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 1 (Nhạc phát hành)</label>
                      <input name="tab1Name" defaultValue={data.tab1Name} placeholder="Mặc định: Ra Rồi" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 2 (Nhạc đề mô)</label>
                      <input name="tab2Name" defaultValue={data.tab2Name} placeholder="Mặc định: Đề Mô" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">Tab 3 (Album/EP)</label>
                      <input name="tab3Name" defaultValue={data.tab3Name} placeholder="Mặc định: Album/EP" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                    </div>
                  </div>
                </div>

<div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">
                    <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors">Lưu thay đổi</button>
                    <button type="button" onClick={async () => {
                      if (!confirm("Bạn có chắc muốn làm mới toàn bộ Secret Link? Các Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu.")) return;
                      const res = await fetch('/api/admin/reset-secret-links', {
                        method: 'POST',
                        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                          'Authorization': `Bearer ${getAdminToken() || ''}`
                        }
                      });
                      if (res.ok) {
                        setToast("Đã reset toàn bộ Secret Link thành công!");
                        setTimeout(() => setToast(''), 3000);
                        loadData();
                      }
                    }} className="text-red-500 font-bold ml-auto px-4 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">Reset Toàn Bộ Secret Link</button>
                </div>
              </form>
            </div>
          )}


          {activeTab === 'socials' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-8">Mạng xã hội</h2>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Facebook</label>
                  <input name="socialFacebook" defaultValue={data.socialFacebook} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Instagram</label>
                  <input name="socialInstagram" defaultValue={data.socialInstagram} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">YouTube</label>
                  <input name="socialYoutube" defaultValue={data.socialYoutube} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">TikTok</label>
                  <input name="socialTiktok" defaultValue={data.socialTiktok} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900" placeholder="https://tiktok.com/@..." />
                </div>
                
                <div className="flex items-center gap-4 border-t border-stone-200 pt-6 mt-2">
                    <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'templates' && (
            <AdminTemplatesSettings isPCPreviewMode={isPCPreviewMode} setIsPCPreviewMode={setIsPCPreviewMode} />
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-stone-900">Đổi Mật Khẩu Quản Trị (Admin)</h2>
                <p className="text-sm text-stone-500 mb-6">Bạn sẽ dùng mật khẩu này để đăng nhập vào trang quản trị AdminCP này.</p>
                
                <form onSubmit={handleAdminPasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu cũ</label>
                    <input 
                      type="password"
                      value={oldAdminPass}
                      onChange={(e) => setOldAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                                    <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-stone-700">Mật khẩu mới</label>
                      <button type="button" onClick={() => { const p = Math.random().toString(36).slice(-8); setNewAdminPass(p); setConfirmAdminPass(p); }} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Đề xuất Random</button>
                    </div>
                    <input 
                      type="text"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Mật khẩu mới (tối thiểu 4 ký tự)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input 
                      type="text"
                      value={confirmAdminPass}
                      onChange={(e) => setConfirmAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  {adminPassError && (
                    <p className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2">{adminPassError}</p>
                  )}
                  {adminPassSuccess && (
                    <p className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{adminPassSuccess}</p>
                  )}

                  <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors">
                    Đổi mật khẩu Admin
                  </button>
                </form>
              </div>

              <hr className="border-stone-200" />

              <div>
                <h2 className="text-2xl font-bold mb-2 text-stone-900">Thiết Lập Mật Khẩu Thành Viên</h2>
                <p className="text-sm text-stone-500 mb-6">Người dùng nhập mật khẩu này tại trang <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-red-600">/mem</code> để nghe tự do mọi album/bài hát có passcode mà không cần nhập code riêng biệt.</p>
                
                <form onSubmit={handleMemberPasswordChange} className="space-y-4 max-w-md">
                                    <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-stone-700">Mật khẩu thành viên hiện tại hoặc mới</label>
                      <button type="button" onClick={() => setMemberPassInput(Math.random().toString(36).slice(-8))} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Đề xuất Random</button>
                    </div>
                    <input 
                      type="text"
                      value={memberPassInput}
                      onChange={(e) => setMemberPassInput(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      placeholder="Mật khẩu thành viên"
                    />
                  </div>

                  {memberPassError && (
                    <p className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2">{memberPassError}</p>
                  )}
                  {memberPassSuccess && (
                    <p className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{memberPassSuccess}</p>
                  )}

                  <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors">
                    Cập nhật mật khẩu Thành viên
                  </button>
                </form>
              </div>
            </div>
          )}



          {activeTab === 'reposts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">Đăng lại (Repost) ({otherSongs.length})</h2>
                  <p className="text-sm text-stone-500 mt-1">Danh sách các bài hát của bạn đang được các nghệ sĩ khác đăng tải lên kênh của họ hoặc liên kết từ URL ngoài.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExternalUrlInput(!showExternalUrlInput)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-xl font-bold text-sm inline-flex items-center gap-1.5 border border-stone-200 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
                >
                  <Globe className="w-4 h-4 text-stone-500" />
                  URL Ngoài
                </button>
              </div>

              {showExternalUrlInput && (
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-stone-850 text-sm">Nhập link bài hát ngoài hệ thống</h3>
                  <form onSubmit={handleAddExternalSong} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Hỗ trợ các link bài hát chung cấu trúc với chorus.vn (ví dụ: https://tai.com/song/ten-bai-hat)"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isCheckingExternalUrl}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 disabled:bg-stone-400 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {isCheckingExternalUrl ? (
                        <>
                          <Disc3 className="w-4 h-4 animate-spin" /> Đang kiểm tra...
                        </>
                      ) : (
                        'Kiểm tra & Thêm'
                      )}
                    </button>
                  </form>
                  {externalError && <p className="text-xs font-semibold text-red-500">{externalError}</p>}
                  {externalSuccess && <p className="text-xs font-semibold text-emerald-600">{externalSuccess}</p>}
                  <p className="text-[11px] text-stone-400">
                    * Hệ thống sẽ tự động quét qua credit bài hát bên URL ngoài để xác thực tên nghệ sĩ của bạn trước khi đưa vào danh sách đăng lại này.
                  </p>
                </div>
              )}

              {otherSongs.length === 0 ? (
                <div className="bg-white border border-stone-150 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                    <Music className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="font-bold text-stone-850 mb-1">Không tìm thấy bài hát nào</h3>
                  <p className="text-stone-500 text-sm max-w-sm mx-auto">Hiện tại không có bài hát nào của bạn do nghệ sĩ khác đăng tải hoặc liên kết ngoài.</p>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50/70 border-b border-stone-150 text-xs font-bold text-stone-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Bài hát</th>
                          <th className="px-6 py-4">Vai trò của bạn</th>
                          <th className="px-6 py-4">Người đăng tải</th>
                          <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150 text-sm text-stone-700">
                        {otherSongs.map((song) => {
                          const isSinger = song.singer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                          const isComposer = song.composer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                          
                          return (
                            <tr key={song.id} className="hover:bg-stone-50/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 flex items-center justify-center">
                                    {song.coverUrl ? (
                                      <img src={song.coverUrl} className="w-full h-full object-cover" alt={song.title} />
                                    ) : (
                                      <Disc3 className="w-5 h-5 text-stone-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                      {song.title}
                                      {song.isExternal && (
                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title="Bài hát ngoài hệ thống">
                                          <Globe className="w-2.5 h-2.5" /> Ngoài
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-0.5">Ca sĩ: {song.singer || 'Chưa rõ'} | Sáng tác: {song.composer || 'Chưa rõ'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {isSinger && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">Ca sĩ</span>}
                                  {isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Nhạc sĩ</span>}
                                  {!isSinger && !isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">Nghệ sĩ liên quan</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-stone-850">{song.sourceArtist.artistName || song.sourceArtist.name}</div>
                                {song.isExternal ? (
                                  <div className="text-xs text-stone-400 font-mono flex items-center gap-1 mt-0.5">
                                    <Globe className="w-3 h-3 text-emerald-500" /> Ngoại tuyến
                                  </div>
                                ) : (
                                  <div className="text-xs text-stone-400 font-mono">@{song.sourceArtist.username}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => navigate(getAdminLink('/new'), { state: { repostFrom: song } })}
                                    className="p-2 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Đăng lại bài hát này lên kênh của bạn"
                                  >
                                    <Repeat className="w-4 h-4" />
                                  </button>
                                  {song.isExternal ? (
                                    <button
                                      onClick={() => handleRemoveExternalRepost(song.id)}
                                      className="p-2 rounded-xl border border-red-100 hover:border-red-500 bg-red-50 hover:bg-red-100 text-red-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                                      title="Xóa khỏi danh sách đăng lại"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setReportSong(song)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 hover:bg-red-100/60 text-red-600 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                      title="Gửi báo cáo / yêu cầu gỡ hoặc chỉnh sửa"
                                    >
                                      Report
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Hộp thư Ticket</h2>
                <p className="text-sm text-stone-500 mt-1">Nơi trao đổi và giải quyết các vấn đề bản quyền, yêu cầu gỡ hoặc chỉnh sửa thông tin bài hát.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-stone-150 rounded-2xl overflow-hidden shadow-sm h-[650px]">
                {/* Tickets Sidebar */}
                <div className={`lg:col-span-4 border-r border-stone-150 flex-col h-full bg-stone-50/50 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="p-4 border-b border-stone-150 bg-white">
                    <h3 className="font-bold text-stone-800 text-sm">Danh sách cuộc hội thoại ({ticketsList.length})</h3>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stone-150">
                    {ticketsList.length === 0 ? (
                      <div className="p-6 text-center text-stone-500 text-sm">
                        Không có ticket nào hiện tại.
                      </div>
                    ) : (
                      ticketsList.map((ticket) => {
                        const isSelected = selectedTicket?.id === ticket.id;
                        const lastMsg = ticket.messages[ticket.messages.length - 1];
                        
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`w-full p-4 text-left transition-all flex flex-col gap-2 hover:bg-stone-100/50 ${isSelected ? 'bg-white border-l-4 border-stone-900' : ''}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ticket.type === 'remove' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {ticket.type === 'remove' ? 'Yêu cầu gỡ' : 'Yêu cầu sửa'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ticket.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-200 text-stone-600'}`}>
                                {ticket.status === 'open' ? 'Đang xử lý' : 'Đã đóng'}
                              </span>
                            </div>
                            
                            <div className="font-bold text-stone-850 text-sm truncate w-full">
                              {ticket.songTitle}
                            </div>
                            
                            <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-2">
                              <span>Bởi: <strong className="text-stone-700">{ticket.reporter.name}</strong></span>
                            </div>

                            {lastMsg && (
                              <p className="text-xs text-stone-500 truncate w-full mt-1 bg-stone-100/80 rounded px-2 py-1 italic">
                                "{lastMsg.senderName}": {lastMsg.text}
                              </p>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Ticket Chat Panel */}
                <div className={`lg:col-span-8 flex-col h-full bg-white min-h-0 ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                  {selectedTicket ? (
                    <div className="flex flex-col h-full min-h-0">
                      {/* Chat Header */}
                      <div className="p-4 border-b border-stone-150 flex items-center justify-between bg-stone-50/40">
                        <div className="flex items-start lg:items-center gap-3">
                          <button 
                            onClick={() => setSelectedTicket(null)} 
                            className="lg:hidden flex items-center gap-1 text-stone-500 hover:text-stone-900 shrink-0 mt-0.5"
                          >
                            <ChevronLeft className="w-5 h-5 -ml-2" />
                            
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-stone-900">{selectedTicket.songTitle}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${selectedTicket.type === 'remove' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                {selectedTicket.type === 'remove' ? 'Yêu cầu gỡ' : 'Yêu cầu sửa'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                              <span className="hidden sm:inline">Người yêu cầu: </span><strong>{selectedTicket.reporter.name}</strong> <span className="hidden sm:inline">(u/ {selectedTicket.reporter.username})</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Admin Only actions */}
                          {(data?.username === 'acxuantai' || data?.isMasterAdmin) && selectedTicket.status === 'open' && (
                            <>
                              {selectedTicket.type === 'remove' && (
                                <button
                                  onClick={() => handleAdminRemoveSong(selectedTicket.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  title="Duyệt Gỡ Bài"
                                >
                                  <Check className="w-4 h-4" />
                                  <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Đồng Ý</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleResolveTicket(selectedTicket.id)}
                                className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Đóng Ticket"
                              >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Từ Chối</span>
                              </button>
                            </>
                          )}
                          {(data?.username === 'acxuantai' || data?.isMasterAdmin) && selectedTicket.status !== 'open' && (
                             <button
                                onClick={() => handleReopenTicket(selectedTicket.id)}
                                className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title="Mở lại Ticket"
                              >
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Mở Lại</span>
                              </button>
                          )}
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-stone-50/20">
                        {/* Initial system/description card */}
                        <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-3 text-stone-700 text-xs space-y-1 max-w-2xl">
                          <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Yêu cầu ban đầu:</p>
                          <p className="whitespace-pre-wrap italic">"{selectedTicket.description}"</p>
                          <p className="text-stone-400 text-[10px] text-right">{new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</p>
                        </div>

                        {selectedTicket.messages.map((msg: any, idx: number) => {
                          let senderUsername = msg.sender;
                          if (msg.sender === 'admin' && msg.senderName !== 'Hệ thống' && msg.senderName !== 'Admin hệ thống' && msg.senderName !== 'Admin') {
                            const found = systemArtists.find(a => a.artistName === msg.senderName);
                            if (found) senderUsername = found.username;
                          }
                          if (msg.sender === 'reporter' || msg.role === 'reporter') senderUsername = selectedTicket.reporter.username;
                          if (msg.sender === 'source' || msg.role === 'target') senderUsername = selectedTicket.sourceArtist;
                          
                          const isSystemAdmin = msg.senderName === 'Hệ thống' || msg.senderName === 'Admin hệ thống' || (msg.sender === 'admin' && msg.senderName === 'Admin');
                          const isMe = !isSystemAdmin && (data?.username === senderUsername || (msg.sender === 'admin' && data?.username === 'acxuantai'));
                          const isReporterRole = msg.sender === 'reporter' || msg.role === 'reporter' || senderUsername === selectedTicket.reporter.username;
                          const isTargetRole = msg.sender === 'source' || msg.role === 'target' || senderUsername === selectedTicket.sourceArtist;

                          const initial = (msg.senderName || senderUsername || '?').charAt(0).toUpperCase();

                          let avatarBg = 'bg-gradient-to-tr from-stone-400 to-stone-500';
                          if (isSystemAdmin) {
                            avatarBg = 'bg-gradient-to-tr from-rose-500 to-amber-500';
                          } else if (isMe) {
                            avatarBg = 'bg-gradient-to-tr from-blue-500 to-sky-500';
                          } else if (isReporterRole) {
                            avatarBg = 'bg-gradient-to-tr from-sky-500 to-indigo-600';
                          } else if (isTargetRole) {
                            avatarBg = 'bg-gradient-to-tr from-emerald-500 to-teal-600';
                          }

                          const artistAvatar = isSystemAdmin ? systemFavicon : systemArtists.find(a => a.extension === senderUsername || a.username === senderUsername)?.homeCoverUrl;

                          return (
                            <div 
                              key={msg.id || idx} 
                              className={`flex gap-3 items-end w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-4`}
                            >
                              {/* Avatar */}
                              {!isSystemAdmin && (
                                <Link to={`/${senderUsername}`} target="_blank" className={`w-8 h-8 rounded-full ${artistAvatar ? 'bg-transparent' : avatarBg} text-white flex items-center justify-center text-xs font-extrabold shadow-sm select-none shrink-0 mb-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}>
                                  {artistAvatar ? (
                                    <img src={artistAvatar} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    initial
                                  )}
                                </Link>
                              )}
                              {isSystemAdmin && (
                                <div className="w-8 h-8 shrink-0 mb-1 flex items-center justify-center">
                                  <ChorusLogo className="w-8 h-8" />
                                </div>
                              )}

                              {/* Message bubble & details */}
                              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {/* Sender name & Role */}
                                <div className="text-[10px] text-stone-500 mb-1 px-1 flex items-center gap-1.5">
                                  <span className="font-semibold">{msg.senderName}</span>
                                  {isSystemAdmin ? (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                      Admin
                                    </span>
                                  ) : isReporterRole ? (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-600 border border-sky-100">
                                      Reporter
                                    </span>
                                  ) : isTargetRole ? (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                      Uploader
                                    </span>
                                  ) : null}
                                </div>

                                {/* Bubble */}
                                <div 
                                  title={msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                  className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all relative ${
                                  isMe 
                                    ? 'bg-[#3A7CF7] text-white rounded-br-none font-medium' 
                                    : isSystemAdmin
                                      ? 'bg-rose-500 text-white rounded-bl-none font-medium shadow-rose-500/20'
                                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                                }`}>
                                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                </div>

                                {/* Timestamp */}
                                <span className="text-[9px] text-stone-400 mt-1 px-1">
                                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Input */}
                      {((data?.username === 'acxuantai' || data?.isMasterAdmin) && 
                        data?.username !== selectedTicket.sourceArtist && 
                        data?.username !== selectedTicket.reporter.username && 
                        selectedTicket.type === 'edit') ? (
                        <div className="p-4 border-t border-stone-150 bg-stone-50 text-center text-xs text-stone-500 font-semibold select-none">
                          Admin không tham gia vào yêu cầu chỉnh sửa (chỉ 2 bên trao đổi).
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-3 border-t border-stone-150 bg-white shrink-0">
                          {selectedTicket.status !== 'open' && (
                            <p className="text-[11px] text-stone-500 italic text-center mb-1 bg-stone-50 py-1.5 rounded-lg border border-stone-100">
                              Ticket này đã đóng/giải quyết xong nhưng bạn vẫn có thể tiếp tục nhắn tin trao đổi.
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={chatMessageText}
                              onChange={(e) => setChatMessageText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendTicketMessage()}
                              placeholder="Nhập tin nhắn trao đổi..."
                              className="flex-1 border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                            <button
                              onClick={handleSendTicketMessage}
                              className="bg-stone-900 hover:bg-stone-800 text-white p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-stone-500">
                      <MessageSquare className="w-12 h-12 text-stone-300 mb-3" />
                      <h4 className="font-bold text-stone-800 mb-1">Hộp hội thoại trống</h4>
                      <p className="text-sm max-w-xs">Vui lòng chọn một cuộc hội thoại ticket từ danh sách bên trái để bắt đầu trao đổi.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Report Song Modal */}
          {reportSong && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-150 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 text-stone-900 mb-4">
                  <div className="p-2.5 bg-stone-100 rounded-xl">
                    <Bell className="w-6 h-6 text-stone-700 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">Báo cáo & Yêu cầu bài hát</h3>
                    <p className="text-xs text-stone-500">Gửi yêu cầu gỡ hoặc chỉnh sửa cho bài hát này</p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-150 rounded-xl p-3 mb-4 text-xs">
                  <div className="font-bold text-stone-800 truncate">Bài: {reportSong.title}</div>
                  <div className="text-stone-500 mt-0.5">Uploader: <strong>{reportSong.sourceArtist.name}</strong> (@{reportSong.sourceArtist.username})</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Loại yêu cầu</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReportType('edit')}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${reportType === 'edit' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'}`}
                      >
                        <span className={`font-bold text-xs ${reportType === 'edit' ? 'text-blue-700' : 'text-blue-600'}`}>Yêu cầu chỉnh sửa</span>
                        <span className={`text-[10px] leading-tight ${reportType === 'edit' ? 'text-blue-600' : 'text-stone-500'}`}>Trao đổi với người đăng để cập nhật nội dung</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('remove')}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${reportType === 'remove' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-red-200 bg-red-50/30 hover:bg-red-50'}`}
                      >
                        <span className={`font-bold text-xs ${reportType === 'remove' ? 'text-red-700' : 'text-red-600'}`}>Yêu cầu gỡ</span>
                        <span className={`text-[10px] leading-tight ${reportType === 'remove' ? 'text-red-600' : 'text-stone-500'}`}>Tố cáo bài viết vi phạm.</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Mô tả lý do / Nội dung chi tiết</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Mô tả cụ thể lý do yêu cầu (ví dụ: Vi phạm bản quyền, sai thông tin ca sĩ, nhạc sĩ...)"
                      rows={4}
                      className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => { setReportSong(null); setReportDesc(''); }}
                    className="px-4 py-2 border rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 text-sm transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReport}
                    disabled={!reportDesc.trim()}
                    className="px-4 py-2 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 disabled:pointer-events-none active:scale-95 text-sm transition-all"
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {actionConfirm?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold mb-2">{actionConfirm.title}</h3>
            <p className="text-stone-600 mb-6">{actionConfirm.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setActionConfirm(null)} 
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => { actionConfirm.onConfirm(); setActionConfirm(null); }} 
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-150 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">Xác nhận xóa tạm thời</h3>
            </div>
            
            <div className="text-stone-700 text-sm mb-5 leading-relaxed bg-white">
              Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'song' ? 'bài hát' : 'playlist'}{' '}
              <span className="font-bold my-1.5 block px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-900 truncate">
                "{deleteConfirm.name}"
              </span>
              Mục này sẽ được chuyển vào <span className="font-bold text-stone-800">Thùng rác</span> tạm thời và tự động xóa vĩnh viễn sau 30 ngày.
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 text-sm transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 active:scale-95 text-sm transition-all"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaylistSelect({ selectedIds, onChange }: { selectedIds: string[], onChange: (ids: string[]) => void }) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
    })
    .then(res => res.json())
    .then(data => {
      setPlaylists((data.playlists || []).filter((p: any) => !p.deleted));
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken() || ''}`
      },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    if (res.ok) {
      const p = await res.json();
      setPlaylists([...playlists, p]);
      onChange([...selectedIds, p.id]);
      setNewTitle('');
    }
  };

  const toggle = (id: string, e: React.ChangeEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-stone-700">Thêm vào Playlist</label>
      <div className="relative">
         <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow text-left">
           <span className="truncate">{selectedIds.length > 0 ? `${selectedIds.length} playlist được chọn` : 'Chọn Playlist'}</span>
           <svg className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
         </button>
         
         {isOpen && (
           <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl z-[100] p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              {playlists.map(p => (
                 <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors" key={p.id}>
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => toggle(p.id, e)} className="w-[18px] h-[18px] rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                    <span className="flex-1 truncate text-sm font-medium text-stone-800">{p.title}</span>
                 </label>
              ))}
              <div className="border-t border-stone-100 pt-2 mt-2 sticky bottom-0 bg-white pb-1 flex gap-2">
                 <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreate())} placeholder="Tên Playlist mới..." className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
                 <button type="button" onClick={handleCreate} disabled={!newTitle.trim()} className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold hover:bg-stone-800 disabled:opacity-50">Tạo mới</button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

function TemplatePickerModal({ 
  configs, 
  onSelect, 
  onClose, 
  previewSongId,
  previewData,
  defaultTemplateId
}: { 
  configs: any[], 
  onSelect: (id: string) => void, 
  onClose: () => void, 
  previewSongId: string,
  previewData?: any,
  defaultTemplateId?: string
}) {
  const [selectedId, setSelectedId] = useState(defaultTemplateId || configs[0]?.id || '1');
  const [isPCPreviewMode, setIsPCPreviewMode] = useState(false);

  const selectedConfig = configs.find(c => c.id === selectedId) || configs[0];

  return (
    <div className="flex flex-col fixed inset-0 bg-zinc-900 z-[9999]">
      <div className="bg-white p-4 border-b border-stone-200 flex justify-between items-center z-10 shrink-0">
          <button type="button" onClick={onClose} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium font-sans">
              <ArrowLeft className="w-5 h-5"/> Trở về
          </button>
          <div className="flex items-center gap-4">
              <button onClick={() => setIsPCPreviewMode(false)} className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${!isPCPreviewMode ? 'border-2 border-stone-850 bg-transparent text-stone-900' : 'border border-stone-200 bg-transparent text-stone-400 hover:text-stone-700 hover:border-stone-400'} shadow-sm`} title="Xem giao diện điện thoại">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </button>
              <button onClick={() => setIsPCPreviewMode(true)} className={`hidden md:flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${isPCPreviewMode ? 'border-2 border-stone-850 bg-transparent text-stone-900' : 'border border-stone-200 bg-transparent text-stone-400 hover:text-stone-700 hover:border-stone-400'} shadow-sm`} title="Xem giao diện máy tính">
                <Monitor className="w-5 h-5 stroke-[1.5]"/>
              </button>
              <button type="button" onClick={() => onSelect(selectedId)} className="bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow hover:bg-stone-800">Chọn</button>
          </div>
      </div>
      <div className="flex flex-1 flex-col md:flex-row overflow-y-auto md:overflow-hidden relative border-t-0">
         <div className={`w-full h-auto md:h-full ${isPCPreviewMode ? 'md:w-[260px] p-4 space-y-4' : 'md:w-[400px] p-6 md:p-8 space-y-6'} bg-white flex-shrink-0 border-b md:border-b-0 md:border-r overflow-visible md:overflow-y-auto custom-scrollbar`}>
            <h3 className="text-xl font-black mb-4">Chọn Template</h3>
            <div className="space-y-2 pb-6">
               {configs.map(c => (
                  <button type="button" key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${selectedId === c.id ? 'border-stone-900 bg-stone-50 font-bold' : 'border-transparent bg-white hover:bg-stone-100'}`}>
                      {c.name}
                  </button>
               ))}
            </div>
         </div>
         <div className="flex-1 w-full min-h-[500px] md:min-h-0 bg-stone-900 relative overflow-hidden flex items-center justify-center py-6 md:py-0 shrink-0">
            <div className="absolute top-4 right-4 z-[100] flex gap-2">
               <button onClick={() => setIsPCPreviewMode(false)} className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${!isPCPreviewMode ? 'border-white/60 bg-transparent text-white' : 'border-white/20 bg-transparent text-white/40 hover:text-white/60 hover:border-white/40'} shadow-sm`} title="Xem giao diện điện thoại">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
               </button>
               <button onClick={() => setIsPCPreviewMode(true)} className={`hidden md:flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${isPCPreviewMode ? 'border-white/60 bg-transparent text-white' : 'border-white/20 bg-transparent text-white/40 hover:text-white/60 hover:border-white/40'} shadow-sm`} title="Xem giao diện máy tính">
                  <Monitor className="w-5 h-5 stroke-[1.5]"/>
               </button>
            </div>
            {previewSongId ? (
                <div className={`w-full bg-black relative overflow-hidden transition-all duration-500 ease-in-out ${
                    isPCPreviewMode 
                        ? 'h-full border-0 rounded-none shadow-none scale-100 min-w-[700px] xl:min-w-[1024px]'
                        : 'w-full h-full md:w-[375px] md:h-[812px] shadow-2xl md:rounded-[3rem] md:border-[12px] border-stone-800 shrink-0 md:transform md:transform-gpu md:scale-[0.80] lg:scale-[0.80] xl:scale-[0.80] 2xl:scale-[0.95] origin-center no-scrollbar'
                }`}>
                   <div className="absolute inset-0 overflow-y-auto no-scrollbar custom-scrollbar">
                     <DemoPlayer songIdP={previewSongId} previewConfig={{...selectedConfig, isPCPreviewMode}} previewData={previewData} />
                   </div>
                </div>
            ) : (
                 <div className="text-stone-500 bg-stone-900 h-full w-full flex items-center justify-center font-medium">Đang tải...</div>
            )}
         </div>
      </div>
    </div>
  )
}

const achievementTypes = {
  youtube_trending: 'Top Trending YouTube',
  tiktok_viral: 'Viral TikTok',
  spotify_streams: 'Lượt Streams Spotify',
  zing_streams: 'Lượt Streams Zing MP3',
  youtube_views: 'Views YouTube',
};

function AchievementEditor({ achievements, onChange }: { achievements: Achievement[], onChange: (a: Achievement[]) => void }) {
  const handleAdd = () => {
    onChange([...achievements, { type: 'youtube_trending', value: '' }]);
  };

  const handleUpdate = (index: number, field: keyof Achievement, value: string) => {
    const newAchievements = [...achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    onChange(newAchievements);
  };

  const handleRemove = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    onChange(newAchievements);
  };

  return (
    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-6 relative hover:border-stone-300 transition-colors">
      <h3 className="text-stone-800 font-bold mb-6 text-sm flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)
      </h3>
      {achievements.length > 0 && (
        <div className="space-y-4 mb-4">
          {achievements.map((ach, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group overflow-hidden items-end">
              <div className="w-full sm:w-[220px] shrink-0">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Loại thành tích</label>
                <div className="relative">
                   <select 
                     value={ach.type} 
                     onChange={e => handleUpdate(index, 'type', e.target.value)}
                     className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white appearance-none cursor-pointer pr-10 hover:border-stone-400 transition-colors"
                   >
                     {Object.entries(achievementTypes).map(([k, v]) => (
                       <option key={k} value={k}>{v}</option>
                     ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Giá trị / Nội dung chi tiết</label>
                <div className="flex w-full group-focus-within:ring-2 ring-stone-900 rounded-lg">
                  <input 
                    value={ach.value} 
                    onChange={e => handleUpdate(index, 'value', e.target.value)} 
                    placeholder="VD: 10M, Dành cho hiệu ứng TikTok..."
                    className="w-full border border-stone-300 rounded-l-lg px-4 py-2.5 text-sm focus:outline-none focus:border-transparent group-focus-within:border-transparent transition-colors z-10 relative"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemove(index)} 
                    className="shrink-0 aspect-square w-11 flex items-center justify-center border border-l-0 border-stone-300 rounded-r-lg hover:bg-red-50 hover:text-red-600 transition-colors z-10 relative bg-white text-stone-400 hover:border-red-200" 
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button 
        type="button" 
        onClick={handleAdd} 
        className="w-full sm:w-auto text-sm font-medium border-2 border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-900 hover:text-white transition-all px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Thêm thành tích
      </button>
    </div>
  );
}

// ---- ADMIN CREATE DEMO ----
function AdminCreateDemo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang xử lý...');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    onClose?: () => void;
  } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, onClose?: () => void) => {
    setNotification({ message, type, title, onClose });
  };

  const handleCloseNotification = () => {
    if (notification?.onClose) {
      notification.onClose();
    }
    setNotification(null);
  };

  useEffect(() => {
    if (location.state?.repostFrom) {
      const sf = location.state.repostFrom;
      setTitle(sf.title || '');
      setSinger(sf.singer || '');
      setComposer(sf.composer || '');
      setLyrics(sf.lyrics || '');
      setReleaseYear(sf.releaseYear || '');
      setIsReleased(sf.isReleased !== false);
      
      if (sf.audioUrl) {
        setUploadedAudioUrl(sf.audioUrl);
        setUploadedAudioName(getFileNameFromUrl(sf.audioUrl) || 'audio.mp3');
      }
      if (sf.coverUrl) {
        setUploadedCoverUrl(sf.coverUrl);
        setUploadedCoverName(getFileNameFromUrl(sf.coverUrl) || 'cover.jpg');
      }
      if (sf.backgroundUrl) {
        setUploadedBgUrl(sf.backgroundUrl);
        setUploadedBgName(getFileNameFromUrl(sf.backgroundUrl) || 'background.jpg');
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/data', {
          headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
        });
        const data = await res.json();
        setAppData(data);
        if (data.slideshowImages && data.slideshowImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.slideshowImages.length);
          setRandomSlideUrl(data.slideshowImages[randomIndex]);
        }
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          const sorted = data.templateConfigs.map((c: any) => c.id === '9' ? { ...c, name: 'Cầu Vồng' } : c).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          setTemplateConfigs([
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
            { id: '14', name: 'Đêm đen (Sao băng)' }
          ]);
        }
      } catch (err) {}
    };
    fetchData();
  }, []);
  const [title, setTitle] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [templateConfigs, setTemplateConfigs] = useState<any[]>([]);
  const [linkDrive, setLinkDrive] = useState('');

  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState('');
  const [uploadedAudioName, setUploadedAudioName] = useState('');
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState('');
  const [uploadedCoverName, setUploadedCoverName] = useState('');
  const [bgUploadProgress, setBgUploadProgress] = useState(0);
  const [uploadedBgUrl, setUploadedBgUrl] = useState('');
  const [uploadedBgName, setUploadedBgName] = useState('');

  const getFileNameFromUrl = (url: string | undefined) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.replace(/^\d+[-_]/, ''));
    } catch (e) {
      return url || '';
    }
  };

  const [composer, setComposer] = useState('');
  const [singer, setSinger] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [lyrics, setLyrics] = useState('');
  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = (tag: string) => {
    const textarea = lyricsRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const insertText = `[${tag}]\n`;
    const newLyrics = before + insertText + after;
    
    setLyrics(newLyrics);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [randomSlideUrl, setRandomSlideUrl] = useState<string>('');

  const [template, setTemplate] = useState('1');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const [linkType, setLinkType] = useState<'direct'|'indirect'>('direct');
  const [isReleased, setIsReleased] = useState(false);
  const [password, setPassword] = useState('');
  const [linkZing, setLinkZing] = useState('');
  const [linkSpotify, setLinkSpotify] = useState('');
  const [linkApple, setLinkApple] = useState('');
  const [linkYoutubeMusic, setLinkYoutubeMusic] = useState('');
  const [linkYoutube, setLinkYoutube] = useState('');

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  const generateSlug = (text: string) => {
    return text.toString()
      .normalize('NFD') // split an accented letter in the base letter and the accent
      .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (!isSlugEdited) {
      setSlug(generateSlug(title));
    }
  }, [title, isSlugEdited]);

  useEffect(() => {
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.slideshowImages) {
          setSlideshowImages(data.slideshowImages);
          if (data.slideshowImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.slideshowImages.length);
            setRandomSlideUrl(data.slideshowImages[randomIndex]);
          }
        }
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          const sorted = data.templateConfigs.map((c: any) => c.id === '9' ? { ...c, name: 'Cầu Vồng' } : c).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          // Fallback static
          setTemplateConfigs([
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
          ]);
        }
      })
      .catch(console.error);
  }, []);

  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);

  const audioXhrRef = useRef<XMLHttpRequest | null>(null);
  const coverXhrRef = useRef<XMLHttpRequest | null>(null);
  const bgXhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    return () => {
      if (audioXhrRef.current) audioXhrRef.current.abort();
      if (coverXhrRef.current) coverXhrRef.current.abort();
      if (bgXhrRef.current) bgXhrRef.current.abort();
    };
  }, []);

  const cancelUpload = (type: 'audio' | 'cover' | 'background') => {
    if (type === 'audio') {
      if (audioXhrRef.current) {
        audioXhrRef.current.abort();
        audioXhrRef.current = null;
      }
      setAudioUploadProgress(0);
      setUploadedAudioUrl('');
      setUploadedAudioName('');
      const input = document.getElementById('audioCreateUpload') as HTMLInputElement;
      if (input) input.value = '';
    } else if (type === 'cover') {
      if (coverXhrRef.current) {
        coverXhrRef.current.abort();
        coverXhrRef.current = null;
      }
      setCoverUploadProgress(0);
      setUploadedCoverUrl('');
      setUploadedCoverName('');
      const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
      if (input) input.value = '';
    } else if (type === 'background') {
      if (bgXhrRef.current) {
        bgXhrRef.current.abort();
        bgXhrRef.current = null;
      }
      setBgUploadProgress(0);
      setUploadedBgUrl('');
      setUploadedBgName('');
      const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const uploadFileDirectly = (file: File, type: 'audio' | 'cover' | 'background') => {
    if (type === 'audio') {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification('Dung lượng file nhạc quá lớn (' + (file.size / (1024 * 1024)).toFixed(1) + 'MB). Vui lòng tải lên file nhạc dưới 100MB để đảm bảo tốc độ xử lý của server.', 'warning', 'Tệp quá lớn');
        const input = document.getElementById('audioCreateUpload') as HTMLInputElement;
        if (input) input.value = '';
        return;
      }
      setUploadedAudioName(file.name);
    } else {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification('Dung lượng file ảnh quá lớn. Vui lòng chọn file dưới 100MB.', 'warning', 'Ảnh quá lớn');
        if (type === 'cover') {
          const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
          if (input) input.value = '';
        } else {
          const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
          if (input) input.value = '';
        }
        return;
      }
      if (type === 'cover') {
        setUploadedCoverName(file.name);
      } else if (type === 'background') {
        setUploadedBgName(file.name);
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    if (type === 'audio') {
      if (audioXhrRef.current) audioXhrRef.current.abort();
      audioXhrRef.current = xhr;
    } else if (type === 'cover') {
      if (coverXhrRef.current) coverXhrRef.current.abort();
      coverXhrRef.current = xhr;
    } else if (type === 'background') {
      if (bgXhrRef.current) bgXhrRef.current.abort();
      bgXhrRef.current = xhr;
    }

    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken() || ''}`);
    xhr.setRequestHeader('x-artist-extension', getArtistExtensionFromUrl());

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            let percent = Math.round((event.loaded / event.total) * 100);
            if (percent === 100) percent = 99; // Giữ 99% cho đến khi xử lý xong
            if (type === 'audio') setAudioUploadProgress(percent);
            else if (type === 'cover') setCoverUploadProgress(percent);
            else setBgUploadProgress(percent);
        }
    };

    xhr.onload = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            if (type === 'audio') {
                setUploadedAudioUrl(res.url);
                setAudioUploadProgress(100);
            } else if (type === 'cover') {
                setUploadedCoverUrl(res.url);
                setCoverUploadProgress(100);
            } else {
                setUploadedBgUrl(res.url);
                setBgUploadProgress(100);
            }
        } else {
            triggerNotification(xhr.status === 413 ? 'Hệ thống báo lỗi file quá lớn.' : 'Lỗi tải file. Vui lòng thử lại.', 'error', 'Tải tệp thất bại');
            if (type === 'audio') {
                setUploadedAudioName('');
                setUploadedAudioUrl('');
                setAudioUploadProgress(0);
                const input = document.getElementById('audioCreateUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else if (type === 'cover') {
                setUploadedCoverName('');
                setUploadedCoverUrl('');
                setCoverUploadProgress(0);
                const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else {
                setUploadedBgName('');
                setUploadedBgUrl('');
                setBgUploadProgress(0);
                const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
                if (input) input.value = '';
            }
        }
    };
    
    xhr.onerror = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        triggerNotification('Lỗi kết nối. Có thể mạng yếu hoặc file quá khổng lồ.', 'error', 'Lỗi kết nối');
        if (type === 'audio') {
            setUploadedAudioName('');
            setUploadedAudioUrl('');
            setAudioUploadProgress(0);
            const input = document.getElementById('audioCreateUpload') as HTMLInputElement;
            if (input) input.value = '';
        } else if (type === 'cover') {
            setUploadedCoverName('');
            setUploadedCoverUrl('');
            setCoverUploadProgress(0);
            const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
            if (input) input.value = '';
        } else {
            setUploadedBgName('');
            setUploadedBgUrl('');
            setBgUploadProgress(0);
            const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
            if (input) input.value = '';
        }
    };

    xhr.send(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileDirectly(file, type);
  };

  const saveDemo = async (isDraft: boolean) => {
    if (!title.trim()) {
      triggerNotification("Vui lòng nhập tên bài hát!", "warning", "Thiếu thông tin");
      return;
    }
    if (linkType === 'direct') {
      if (!isDraft && !uploadedAudioUrl) {
        triggerNotification("Vui lòng tải lên file nhạc!", "warning", "Chưa tải nhạc");
        return;
      }
      if (audioUploadProgress > 0 && audioUploadProgress < 100) {
        triggerNotification("Vui lòng đợi file nhạc tải lên xong!", "info", "Đang tải lên");
        return;
      }
      if (bgUploadProgress > 0 && bgUploadProgress < 100) {
        triggerNotification("Vui lòng đợi ảnh nền tải lên xong!", "info", "Đang tải lên");
        return;
      }
    }
    if (coverUploadProgress > 0 && coverUploadProgress < 100) {
      triggerNotification("Vui lòng đợi ảnh bìa tải lên xong!", "info", "Đang tải lên");
      return;
    }

    setLoadingText(isDraft ? 'Đang lưu bản nháp...' : 'Đang xuất bản bài hát...');
    setLoading(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('slug', slug);
    formData.set('composer', composer);
    formData.set('singer', singer);
    formData.set('lyrics', lyrics);
    formData.set('template', template);
    formData.set('audioUrl', uploadedAudioUrl);
    formData.set('backupAudioUrl', uploadedAudioUrl);
    formData.set('coverUrl', uploadedCoverUrl);
    formData.set('backgroundUrl', uploadedBgUrl);
    formData.set('playlistIds', JSON.stringify(playlistIds));
    formData.set('achievements', JSON.stringify(achievements));
    formData.set('releaseYear', releaseYear);
    formData.set('linkType', linkType);
    formData.set('linkZing', linkZing);
    formData.set('linkSpotify', linkSpotify);
    formData.set('linkApple', linkApple);
    formData.set('linkYoutubeMusic', linkYoutubeMusic);
    formData.set('linkYoutube', linkYoutube);
    formData.set('linkDrive', linkDrive);

    const statusEl = document.querySelector('select[name="status"]') as HTMLSelectElement;

    formData.set('password', password);
    formData.set('status', statusEl?.value || 'public');
    formData.set('isReleased', isReleased ? 'true' : 'false');
    formData.set('isDraft', isDraft ? 'true' : 'false');
    
    try {
        const res = await fetch('/api/demos', {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': `Bearer ${getAdminToken() || ''}`
            },
            body: formData
        });
        if (res.ok) {
            const newDemo = await res.json();
            if (isDraft) {
               triggerNotification('Đã lưu bản nháp thành công!', 'success', 'Thành công', () => {
                 navigate(getAdminLink(`/edit/${newDemo.id}`));
               });
            } else {
               triggerNotification('Đăng bài hát thành công!', 'success', 'Thành công', () => {
                 navigate(getAdminLink());
               });
            }
        } else {
            triggerNotification('Lỗi tải lên bài hát!', 'error', 'Thất bại');
        }
    } catch (err) {
        triggerNotification('Lỗi mạng!', 'error', 'Lỗi mạng');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveDemo(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to={getAdminLink()} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Trở về Dashboard
        </Link>
        
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
          
          <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-full max-w-xs mx-auto">
            <button type="button" onClick={() => setLinkType('direct')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${linkType === 'direct' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Trực Tiếp</button>
            <button type="button" onClick={() => setLinkType('indirect')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${linkType === 'indirect' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Landing Page</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Tên bài hát <span className="text-red-500">*</span></label>
              <input name="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tên bài hát..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Phần mở rộng (Link bài hát)</label>
              <div className="flex items-center gap-2 border border-stone-300 rounded-xl px-4 py-3 bg-white focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900 transition-shadow">
                <span className="text-stone-400 font-mono text-sm opacity-60 hidden sm:inline">/</span>
                <input name="slug" value={slug} onChange={e => {setSlug(e.target.value); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent" />
              </div>
              <p className="text-xs text-stone-500 mt-2">Sẽ tự động tạo dựa trên tên bài hát nếu bỏ trống.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Link Google Drive tải nhạc</label>
              <div className="relative">
                <FolderDown className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                <input 
                  name="linkDrive" 
                  value={linkDrive} 
                  onChange={e => setLinkDrive(e.target.value)} 
                  placeholder="https://drive.google.com/file/d/.../view" 
                  className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" 
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">Nếu nhập link, người dùng sẽ thấy icon tải nhạc (Download) ở trên phần lời bài hát để click tải.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Sáng tác</label>
                <input name="composer" value={composer} onChange={e => setComposer(e.target.value)} placeholder={appData?.artistName || 'Nghệ sĩ'} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Ca sĩ thể hiện</label>
                <input name="singer" value={singer} onChange={e => setSinger(e.target.value)} placeholder={appData?.artistName || 'Nghệ sĩ'} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Năm phát hành</label>
                <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value)} placeholder="Ví dụ: 2026, 2024..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Bìa Đĩa (Dùng làm thumbnail)</label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDraggingCover(false); 
                    const file = e.dataTransfer.files?.[0]; 
                    if (file && file.type.startsWith('image/')) uploadFileDirectly(file, 'cover'); 
                  }}
                  className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                    isDraggingCover 
                      ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                      : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                  }`}
                >
                  {uploadedCoverUrl ? (
                    <img src={getPreviewUrl(uploadedCoverUrl)} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${coverUploadProgress === 100 || uploadedCoverUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('coverCreateUpload')?.click()}>
                          <Upload className="w-4 h-4"/>
                          <span className="max-w-[150px] truncate">{coverUploadProgress > 0 && coverUploadProgress < 100 ? `Đang tải ${coverUploadProgress}%` : (uploadedCoverName ? formatFileName(uploadedCoverName) : 'Chọn bìa đĩa')}</span>
                      </button>
                      {coverUploadProgress > 0 && coverUploadProgress < 100 ? (
                        <button type="button" onClick={() => cancelUpload('cover')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                      ) : (uploadedCoverUrl ? (
                        <button type="button" onClick={() => { setUploadedCoverUrl(''); setCoverUploadProgress(0); setUploadedCoverName(''); (document.getElementById('coverCreateUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                      ) : null)}
                    </div>
                    {coverUploadProgress > 0 && coverUploadProgress < 100 && (
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${coverUploadProgress}%` }} />
                      </div>
                    )}
                    <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                      {uploadedCoverName ? `Tệp đã chọn: ${formatFileName(uploadedCoverName, 30)}` : 'Kéo thả bìa đĩa trực tiếp vào ô này'}
                    </p>
                  </div>
                  <input type="hidden" name="coverUrl" value={uploadedCoverUrl} />
                  <input type="file" id="coverCreateUpload" name="cover" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} className="hidden" />
                </div>
              </div>
 
              {linkType === 'direct' && (
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh Nền (Nếu có)</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingBg(true); }}
                    onDragLeave={() => setIsDraggingBg(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setIsDraggingBg(false); 
                      const file = e.dataTransfer.files?.[0]; 
                      if (file && file.type.startsWith('image/')) uploadFileDirectly(file, 'background'); 
                    }}
                    className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                      isDraggingBg 
                        ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                        : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                    }`}
                  >
                    {uploadedBgUrl ? (
                      <img src={uploadedBgUrl} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                        <Image className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${bgUploadProgress === 100 || uploadedBgUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('bgCreateUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{bgUploadProgress > 0 && bgUploadProgress < 100 ? `Đang tải ${bgUploadProgress}%` : (uploadedBgName ? formatFileName(uploadedBgName) : 'Chọn ảnh nền')}</span>
                        </button>
                        {bgUploadProgress > 0 && bgUploadProgress < 100 ? (
                          <button type="button" onClick={() => cancelUpload('background')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : (uploadedBgUrl ? (
                          <button type="button" onClick={() => { setUploadedBgUrl(''); setBgUploadProgress(0); setUploadedBgName(''); (document.getElementById('bgCreateUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {bgUploadProgress > 0 && bgUploadProgress < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${bgUploadProgress}%` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        {uploadedBgName ? `Tệp đã chọn: ${formatFileName(uploadedBgName, 30)}` : 'Kéo thả ảnh nền trực tiếp vào ô này'}
                      </p>
                    </div>
                    <input type="hidden" name="backgroundUrl" value={uploadedBgUrl} />
                    <input type="file" id="bgCreateUpload" name="background" accept="image/*" onChange={e => handleFileUpload(e, 'background')} className="hidden" />
                  </div>
                </div>
              )}
            </div>

            {linkType === 'direct' && (
              <>
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">File Nhạc (Audio) <span className="text-red-500">*</span></label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                    onDragLeave={() => setIsDraggingAudio(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setIsDraggingAudio(false); 
                      const file = e.dataTransfer.files?.[0]; 
                      if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a'))) {
                        uploadFileDirectly(file, 'audio');
                      }
                    }}
                    className={`bg-stone-50 border-2 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-all duration-200 ${
                      isDraggingAudio 
                        ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                        : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                    }`}
                  >
                    <div className="flex flex-wrap gap-4 items-center">
                      {(uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                        <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      )}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${audioUploadProgress === 100 || (uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com')) ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('audioCreateUpload')?.click()}>
                              <Upload className="w-4 h-4"/>
                              <span className="max-w-[200px] truncate">{audioUploadProgress > 0 && audioUploadProgress < 100 ? `Đang tải ${audioUploadProgress}%` : (uploadedAudioName ? formatFileName(uploadedAudioName) : 'Chọn file nhạc')}</span>
                          </button>
                          {audioUploadProgress > 0 && audioUploadProgress < 100 ? (
                            <button type="button" onClick={() => cancelUpload('audio')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                          ) : ((uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                            <button type="button" onClick={() => { setUploadedAudioUrl(''); setAudioUploadProgress(0); setUploadedAudioName(''); (document.getElementById('audioCreateUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                          ) : null)}
                        </div>
                        {audioUploadProgress > 0 && audioUploadProgress < 100 && (
                          <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${audioUploadProgress}%` }} />
                          </div>
                        )}
                        <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                          {uploadedAudioName ? `Tệp đã chọn: ${formatFileName(uploadedAudioName, 30)}` : 'Kéo thả file nhạc (.mp3, .wav, .m4a) trực tiếp vào ô này'}
                        </p>
                      </div>
                      <input type="file" id="audioCreateUpload" name="audio" accept="audio/mp3,audio/wav,audio/*" onChange={e => handleFileUpload(e, 'audio')} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="block text-sm font-bold text-stone-700">Lời bài hát</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="hidden sm:inline text-[11px] text-stone-400 font-medium mr-1">Chèn nhanh:</span>
                      {[
                        { label: 'Intro', value: 'Intro', className: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' },
                        { label: 'Verse', value: 'Verse', className: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
                        { label: 'Chorus', value: 'Chorus', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
                        { label: 'Rap', value: 'Rap', className: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
                        { label: 'Drop', value: 'Drop', className: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
                        { label: 'Bridge', value: 'Bridge', className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                        { label: 'Outro', value: 'Outro', className: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' },
                        { label: 'Ending', value: 'Ending', className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' }
                      ].map((tag) => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => handleInsertTag(tag.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer shadow-xs ${tag.className}`}
                        >
                          +{tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    ref={lyricsRef}
                    name="lyrics" 
                    rows={6} 
                    value={lyrics} 
                    onChange={e => setLyrics(e.target.value)} 
                    placeholder="Nhập lời bài hát (nếu có)..." 
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow leading-relaxed"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                  <div className="w-full">
                    <label className="block text-sm font-bold text-stone-700 mb-2">Template Giao Diện</label>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 min-w-0">
                      <select name="template" value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full min-w-0 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white shadow-sm">
                        {templateConfigs.map((tc: any) => (
                          <option key={tc.id} value={tc.id}>{tc.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        disabled={!title.trim()}
                        onClick={() => setShowTemplatePicker(true)} 
                        className={`px-6 py-3 border border-transparent shrink-0 shadow-sm text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${(!title.trim()) ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'}`}
                      >
                        <Eye className="w-5 h-5" /> Xem trước giao diện
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {linkType === 'indirect' && (
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 text-lg">Liên kết phát nhạc</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Zing MP3</label>
                    <input name="linkZing" value={linkZing} onChange={e => setLinkZing(e.target.value)} placeholder="Nhập link Zing MP3..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Spotify</label>
                    <input name="linkSpotify" value={linkSpotify} onChange={e => setLinkSpotify(e.target.value)} placeholder="Nhập link Spotify..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Apple Music</label>
                    <input name="linkApple" value={linkApple} onChange={e => setLinkApple(e.target.value)} placeholder="Nhập link Apple Music..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">YouTube Music</label>
                    <input name="linkYoutubeMusic" value={linkYoutubeMusic} onChange={e => setLinkYoutubeMusic(e.target.value)} placeholder="Nhập link YouTube Music..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">YouTube MV</label>
                    <input name="linkYoutube" value={linkYoutube} onChange={e => setLinkYoutube(e.target.value)} placeholder="Nhập link YouTube MV..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                </div>
              </div>
            )}

            {linkType !== 'indirect' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                  {!isReleased ? (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu bảo vệ (tùy chọn)</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                        <input name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Bỏ trống nếu không cần" className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-stone-500 text-sm italic font-medium pt-2">
                      <span>✓ Bài hát đã phát hành sẽ không sử dụng mật khẩu bảo vệ.</span>
                    </div>
                  )}
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Hiển thị (Trạng thái phát hành)</label>
                     <select name="status" className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white">
                      <option value="public">Công khai</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </div>
                </div>

                <AchievementEditor achievements={achievements} onChange={setAchievements} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Đã phát hành</label>
                    <label className="inline-flex items-center gap-3 cursor-pointer mt-1">
                      <input type="checkbox" name="isReleased" checked={isReleased} onChange={e => {
                        const checked = e.target.checked;
                        setIsReleased(checked);
                        if (checked) {
                          setPassword('');
                        }
                      }} className="w-6 h-6 rounded border-stone-300 text-stone-900 focus:ring-stone-900 transition-all cursor-pointer" />
                    </label>
                  </div>

                   <div>
                     <PlaylistSelect selectedIds={playlistIds} onChange={setPlaylistIds} />
                   </div>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                disabled={loading} 
                type="button" 
                onClick={() => saveDemo(true)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 text-lg font-bold py-4 rounded-xl transition-colors disabled:opacity-80 flex justify-center items-center gap-2"
              >
                <FileText className="w-5 h-5 text-amber-500" />
                {loading ? 'Đang lưu...' : 'Lưu Bản Nháp'}
              </button>
              
              <button 
                disabled={loading} 
                type="button" 
                onClick={() => saveDemo(false)}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-lg font-bold py-4 rounded-xl transition-colors disabled:opacity-80 flex justify-center items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {loading ? 'Đang xuất bản...' : 'Xuất Bản'}
              </button>
            </div>
          </form>
        </div>
      </div>
       {showTemplatePicker && (
         <TemplatePickerModal 
            configs={templateConfigs} 
            previewSongId="preview"
            defaultTemplateId={template}
            previewData={{
              id: 'preview',
              title: title,
              singer: singer || appData?.artistName || 'Nghệ sĩ',
              composer: composer || appData?.artistName || 'Nghệ sĩ',
              audioUrl: uploadedAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              coverUrl: uploadedCoverUrl || randomSlideUrl || (slideshowImages && slideshowImages.length > 0 ? slideshowImages[0] : '') || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
              backgroundUrl: uploadedBgUrl,
              lyrics: lyrics,
              template: template,
              status: 'public',
              isReleased: false,
              playlistIds: playlistIds,
              requiresPassword: false
            }}
            onSelect={(id) => {
               setTemplate(id);
               setShowTemplatePicker(false);
            }} 
            onClose={() => setShowTemplatePicker(false)}
         />
      )}

      {loading && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white">
          <div className="bg-stone-950/95 border border-stone-800 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm mx-4 text-center">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <Disc3 className="w-8 h-8 text-amber-500 animate-[spin_4s_linear_infinite]" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">{loadingText}</h3>
            <p className="text-stone-400 text-xs leading-relaxed">Vui lòng đợi trong giây lát. Hệ thống đang tối ưu hóa dữ liệu và lưu trữ an toàn trên cloud.</p>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-950 border border-stone-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center animate-[fade-in_0.2s_ease-out]"
          >
            <div className="mb-4">
              {notification.type === 'error' && <AlertCircle className="w-12 h-12 text-rose-500 animate-[bounce_1.5s_infinite]" />}
              {notification.type === 'warning' && <AlertTriangle className="w-12 h-12 text-amber-500 animate-[bounce_1.5s_infinite]" />}
              {notification.type === 'success' && <CheckCircle className="w-12 h-12 text-emerald-500" />}
              {notification.type === 'info' && <Info className="w-12 h-12 text-blue-500" />}
            </div>
            <h4 className="text-white font-black text-xl mb-2 tracking-tight">{notification.title || (notification.type === 'error' ? 'Lỗi xảy ra' : 'Thông báo')}</h4>
            <p className="text-stone-400 text-xs leading-relaxed mb-6">{notification.message}</p>
            <button 
              type="button" 
              onClick={handleCloseNotification}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black py-3 px-6 rounded-xl transition-all shadow-md tracking-tight text-sm"
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ---- ADMIN EDIT DEMO ----
function AdminEditDemo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang xử lý...');
  const [demo, setDemo] = useState<DemoSong | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [toast, setToast] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    onClose?: () => void;
  } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, onClose?: () => void) => {
    setNotification({ message, type, title, onClose });
  };

  const handleCloseNotification = () => {
    if (notification?.onClose) {
      notification.onClose();
    }
    setNotification(null);
  };

  const [title, setTitle] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [templateConfigs, setTemplateConfigs] = useState<any[]>([]);
  
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState('');
  const [uploadedAudioName, setUploadedAudioName] = useState('');
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState('');
  const [uploadedCoverName, setUploadedCoverName] = useState('');
  const [bgUploadProgress, setBgUploadProgress] = useState(0);
  const [uploadedBgUrl, setUploadedBgUrl] = useState('');
  const [uploadedBgName, setUploadedBgName] = useState('');

  const getFileNameFromUrl = (url: string | undefined) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.replace(/^\d+[-_]/, ''));
    } catch (e) {
      return url || '';
    }
  };

  const [template, setTemplate] = useState('1');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const [composer, setComposer] = useState('');
  const [singer, setSinger] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [lyrics, setLyrics] = useState('');
  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = (tag: string) => {
    const textarea = lyricsRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const insertText = `[${tag}]\n`;
    const newLyrics = before + insertText + after;
    
    setLyrics(newLyrics);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  const [randomSlideUrl, setRandomSlideUrl] = useState<string>('');

  const [linkType, setLinkType] = useState<'direct'|'indirect'>('direct');
  const [isReleased, setIsReleased] = useState(false);
  const [password, setPassword] = useState('');
  const [linkZing, setLinkZing] = useState('');
  const [linkSpotify, setLinkSpotify] = useState('');
  const [linkApple, setLinkApple] = useState('');
  const [linkYoutubeMusic, setLinkYoutubeMusic] = useState('');
  const [linkYoutube, setLinkYoutube] = useState('');

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  useEffect(() => {
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

        'Authorization': `Bearer ${getAdminToken() || ''}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          removeAdminToken();
          window.location.href = getAdminLink();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        setAppData(data);
        if (data.slideshowImages && data.slideshowImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.slideshowImages.length);
          setRandomSlideUrl(data.slideshowImages[randomIndex]);
        }
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          const sorted = data.templateConfigs.map((c: any) => c.id === '9' ? { ...c, name: 'Cầu Vồng' } : c).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          setTemplateConfigs([
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
          ]);
        }
        const found = data.demos.find((d: any) => d.id === id);
        if (found) {
          setDemo(found);
          setTitle(found.title || '');
          setSlug(found.slug || '');
          setIsSlugEdited(!!found.slug);
          setUploadedCoverUrl(found.coverUrl || '');
          setUploadedBgUrl(found.backgroundUrl || '');
          setPlaylistIds(found.playlistIds || []);
          setTemplate(found.template || '1');
          setComposer(found.composer || '');
          setSinger(found.singer || '');
          setReleaseYear(found.releaseYear || '');
          setLyrics(found.lyrics || '');
          setAchievements(found.achievements || []);
          setLinkType(found.linkType || 'direct');
          setIsReleased(found.isReleased || false);
          setPassword(found.passwordValue || found.password || '');
          setUploadedAudioUrl(found.audioUrl || '');
          setLinkZing(found.linkZing || '');
          setLinkSpotify(found.linkSpotify || '');
          setLinkApple(found.linkApple || '');
          setLinkYoutubeMusic(found.linkYoutubeMusic || '');
          setLinkYoutube(found.linkYoutube || '');
          setLinkDrive(found.linkDrive || '');
        }
      })
      .catch(err => {
        console.error("Lỗi tải thông tin quản trị:", err);
      });
  }, [id]);

  const [isReverting, setIsReverting] = useState(false);
  const handleRevertAudio = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục lại phiên bản file nhạc trước đó gần nhất không?")) {
      return;
    }
    setIsReverting(true);
    try {
      const res = await fetch(`/api/demos/${id}/revert`, {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        const updatedDemo = await res.json();
        setDemo(updatedDemo);
        setUploadedAudioUrl(updatedDemo.audioUrl || '');
        setUploadedAudioName(''); // reset to show original/reverted filename
        triggerNotification("Khôi phục phiên bản nhạc thành công!", "success", "Thành công");
      } else {
        const errData = await res.json();
        triggerNotification(errData.error || "Có lỗi xảy ra khi khôi phục.", "error", "Thất bại");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Lỗi kết nối.", "error", "Lỗi kết nối");
    } finally {
      setIsReverting(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (!isSlugEdited && !demo) {
      setSlug(generateSlug(title));
    }
  }, [title, isSlugEdited, demo]);

  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);

  const audioXhrRef = useRef<XMLHttpRequest | null>(null);
  const coverXhrRef = useRef<XMLHttpRequest | null>(null);
  const bgXhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    return () => {
      if (audioXhrRef.current) audioXhrRef.current.abort();
      if (coverXhrRef.current) coverXhrRef.current.abort();
      if (bgXhrRef.current) bgXhrRef.current.abort();
    };
  }, []);

  const cancelUpload = (type: 'audio' | 'cover' | 'background') => {
    if (type === 'audio') {
      if (audioXhrRef.current) {
        audioXhrRef.current.abort();
        audioXhrRef.current = null;
      }
      setAudioUploadProgress(0);
      setUploadedAudioUrl('');
      setUploadedAudioName('');
      const input = document.getElementById('audioEditUpload') as HTMLInputElement;
      if (input) input.value = '';
    } else if (type === 'cover') {
      if (coverXhrRef.current) {
        coverXhrRef.current.abort();
        coverXhrRef.current = null;
      }
      setCoverUploadProgress(0);
      setUploadedCoverUrl('');
      setUploadedCoverName('');
      const input = document.getElementById('coverEditUpload') as HTMLInputElement;
      if (input) input.value = '';
    } else if (type === 'background') {
      if (bgXhrRef.current) {
        bgXhrRef.current.abort();
        bgXhrRef.current = null;
      }
      setBgUploadProgress(0);
      setUploadedBgUrl('');
      setUploadedBgName('');
      const input = document.getElementById('bgEditUpload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const uploadFileDirectly = (file: File, type: 'audio' | 'cover' | 'background') => {
    if (type === 'audio') {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification('Dung lượng file nhạc quá lớn (' + (file.size / (1024 * 1024)).toFixed(1) + 'MB). Vui lòng tải lên file nhạc dưới 100MB để đảm bảo tốc độ xử lý của server.', 'warning', 'Tệp quá lớn');
        const input = document.getElementById('audioEditUpload') as HTMLInputElement;
        if (input) input.value = '';
        return;
      }
      setUploadedAudioName(file.name);
    } else {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification('Dung lượng file ảnh quá lớn. Vui lòng chọn file dưới 100MB.', 'warning', 'Ảnh quá lớn');
        if (type === 'cover') {
          const input = document.getElementById('coverEditUpload') as HTMLInputElement;
          if (input) input.value = '';
        } else {
          const input = document.getElementById('bgEditUpload') as HTMLInputElement;
          if (input) input.value = '';
        }
        return;
      }
      if (type === 'cover') {
        setUploadedCoverName(file.name);
      } else if (type === 'background') {
        setUploadedBgName(file.name);
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    if (type === 'audio') {
      if (audioXhrRef.current) audioXhrRef.current.abort();
      audioXhrRef.current = xhr;
    } else if (type === 'cover') {
      if (coverXhrRef.current) coverXhrRef.current.abort();
      coverXhrRef.current = xhr;
    } else if (type === 'background') {
      if (bgXhrRef.current) bgXhrRef.current.abort();
      bgXhrRef.current = xhr;
    }

    xhr.open('POST', '/api/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken() || ''}`);
    xhr.setRequestHeader('x-artist-extension', getArtistExtensionFromUrl());

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            let percent = Math.round((event.loaded / event.total) * 100);
            if (percent === 100) percent = 99; // Giữ 99% cho đến khi xử lý xong
            if (type === 'audio') setAudioUploadProgress(percent);
            else if (type === 'cover') setCoverUploadProgress(percent);
            else setBgUploadProgress(percent);
        }
    };

    xhr.onload = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            if (type === 'audio') {
                setUploadedAudioUrl(res.url);
                setAudioUploadProgress(100);
            } else if (type === 'cover') {
                setUploadedCoverUrl(res.url);
                setCoverUploadProgress(100);
            } else {
                setUploadedBgUrl(res.url);
                setBgUploadProgress(100);
            }
        } else {
            triggerNotification(xhr.status === 413 ? 'Hệ thống báo lỗi file quá lớn.' : 'Lỗi tải file. Vui lòng thử lại.', 'error', 'Tải tệp thất bại');
            if (type === 'audio') {
                setUploadedAudioName('');
                setUploadedAudioUrl('');
                setAudioUploadProgress(0);
                const input = document.getElementById('audioEditUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else if (type === 'cover') {
                setUploadedCoverName('');
                setUploadedCoverUrl('');
                setCoverUploadProgress(0);
                const input = document.getElementById('coverEditUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else {
                setUploadedBgName('');
                setUploadedBgUrl('');
                setBgUploadProgress(0);
                const input = document.getElementById('bgEditUpload') as HTMLInputElement;
                if (input) input.value = '';
            }
        }
    };
    
    xhr.onerror = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        triggerNotification('Lỗi kết nối. Có thể mạng yếu hoặc file quá khổng lồ.', 'error', 'Lỗi kết nối');
        if (type === 'audio') {
            setUploadedAudioName('');
            setUploadedAudioUrl('');
            setAudioUploadProgress(0);
            const input = document.getElementById('audioEditUpload') as HTMLInputElement;
            if (input) input.value = '';
        } else if (type === 'cover') {
            setUploadedCoverName('');
            setUploadedCoverUrl('');
            setCoverUploadProgress(0);
            const input = document.getElementById('coverEditUpload') as HTMLInputElement;
            if (input) input.value = '';
        } else {
            setUploadedBgName('');
            setUploadedBgUrl('');
            setBgUploadProgress(0);
            const input = document.getElementById('bgEditUpload') as HTMLInputElement;
            if (input) input.value = '';
        }
    };

    xhr.send(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileDirectly(file, type);
  };

  const saveDemo = async (isDraft: boolean) => {
    if (!title.trim()) {
      triggerNotification("Vui lòng nhập tên bài hát!", "warning", "Thiếu thông tin");
      return;
    }
    if (linkType === 'direct') {
      const currentAudio = uploadedAudioUrl || demo?.audioUrl || '';
      if (!isDraft && !currentAudio) {
        triggerNotification("Vui lòng tải lên file nhạc!", "warning", "Chưa tải nhạc");
        return;
      }
    }
    if (audioUploadProgress > 0 && audioUploadProgress < 100) {
      triggerNotification("Vui lòng đợi file nhạc tải lên xong!", "info", "Đang tải lên");
      return;
    }
    if (coverUploadProgress > 0 && coverUploadProgress < 100) {
      triggerNotification("Vui lòng đợi ảnh bìa tải lên xong!", "info", "Đang tải lên");
      return;
    }
    if (bgUploadProgress > 0 && bgUploadProgress < 100) {
      triggerNotification("Vui lòng đợi ảnh nền tải lên xong!", "info", "Đang tải lên");
      return;
    }

    setLoadingText(isDraft ? 'Đang lưu bản nháp...' : 'Đang xuất bản bài hát...');
    setLoading(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('slug', slug);
    formData.set('composer', composer);
    formData.set('singer', singer);
    formData.set('lyrics', lyrics);
    formData.set('template', template);
    if (uploadedAudioUrl) {
      formData.set('audioUrl', uploadedAudioUrl);
      formData.set('backupAudioUrl', uploadedAudioUrl);
    } else {
      formData.set('audioUrl', demo?.audioUrl || '');
      formData.set('backupAudioUrl', demo?.backupAudioUrl || demo?.audioUrl || '');
    }
    formData.set('coverUrl', uploadedCoverUrl || demo?.coverUrl || '');
    formData.set('backgroundUrl', uploadedBgUrl || demo?.backgroundUrl || '');
    formData.set('playlistIds', JSON.stringify(playlistIds));
    formData.set('achievements', JSON.stringify(achievements));
    formData.set('releaseYear', releaseYear);
    formData.set('linkType', linkType);
    formData.set('linkZing', linkZing);
    formData.set('linkSpotify', linkSpotify);
    formData.set('linkApple', linkApple);
    formData.set('linkYoutubeMusic', linkYoutubeMusic);
    formData.set('linkYoutube', linkYoutube);
    formData.set('linkDrive', linkDrive);

    const statusEl = document.querySelector('select[name="status"]') as HTMLSelectElement;

    formData.set('password', password);
    formData.set('status', statusEl?.value || 'public');
    formData.set('isReleased', isReleased ? 'true' : 'false');
    formData.set('isDraft', isDraft ? 'true' : 'false');
    
    try {
        const res = await fetch(`/api/demos/${id}/update`, {
            method: 'POST',
            headers: {
              'x-artist-extension': getArtistExtensionFromUrl(),
              'Authorization': `Bearer ${getAdminToken() || ''}`
            },
            body: formData
        });
        if (res.ok) {
            triggerNotification(isDraft ? 'Cập nhật bản nháp thành công!' : 'Cập nhật thành công!', 'success', 'Thành công', () => {
              navigate(getAdminLink());
            });
        } else {
            triggerNotification('Lỗi cập nhật. Thử tải lại trang và làm lại!', 'error', 'Thất bại');
        }
    } catch(err) {
        triggerNotification('Lỗi mạng!', 'error', 'Lỗi mạng');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveDemo(demo?.isDraft ? true : false);
  };

  if (!demo) return <div className="min-h-screen bg-stone-100 flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={getAdminLink()} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" /> Trở về Dashboard
          </Link>
          <button 
            type="button" 
            onClick={async () => {
              try {
                 const res = await fetch(`/api/demos/${demo.id}/duplicate`, {
                   method: 'POST',
                   headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                     'Authorization': `Bearer ${getAdminToken() || ''}`
                   }
                 });
                 if (res.ok) {
                    const newDemo = await res.json();
                    setToast('Đã tạo bản sao thành công! Đang chuyển hướng...');
                    setTimeout(() => {
                      setToast('');
                      navigate(getAdminLink(`/edit/${newDemo.id}`));
                    }, 1500);
                 } else {
                    alert('Lỗi khi duplicate bản ghi.');
                 }
              } catch (err) {
                 console.error(err);
              }
            }}
            className="bg-stone-200 text-stone-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-300 transition-colors shadow-sm font-bold text-sm"
          >
            <Copy className="w-4 h-4" /> Nhân bản
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/50">
          <h1 className="text-3xl font-bold mb-6">Chỉnh Sửa Demo</h1>
          
          <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-full max-w-xs mx-auto">
            <button type="button" onClick={() => setLinkType('direct')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${linkType === 'direct' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Trực Tiếp</button>
            <button type="button" onClick={() => setLinkType('indirect')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${linkType === 'indirect' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Landing Page</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Tên bài hát <span className="text-red-500">*</span></label>
              <input name="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tên bài hát..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Phần mở rộng (Link bài hát)</label>
              <div className="flex items-center gap-2 border border-stone-300 rounded-xl px-4 py-3 bg-white focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900 transition-shadow">
                <span className="text-stone-400 font-mono text-sm opacity-60 hidden sm:inline">/</span>
                <input name="slug" value={slug} onChange={e => {setSlug(e.target.value); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Link Google Drive tải nhạc</label>
              <div className="relative">
                <FolderDown className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                <input 
                  name="linkDrive" 
                  value={linkDrive} 
                  onChange={e => setLinkDrive(e.target.value)} 
                  placeholder="https://drive.google.com/file/d/.../view" 
                  className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" 
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">Nếu nhập link, người dùng sẽ thấy icon tải nhạc (Download) ở trên phần lời bài hát để click tải.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Sáng tác</label>
                <input name="composer" value={composer} onChange={e => setComposer(e.target.value)} placeholder={appData?.artistName || 'Nghệ sĩ'} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Ca sĩ thể hiện</label>
                <input name="singer" value={singer} onChange={e => setSinger(e.target.value)} placeholder={appData?.artistName || 'Nghệ sĩ'} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Năm phát hành</label>
                <input name="releaseYear" value={releaseYear} onChange={e => setReleaseYear(e.target.value)} placeholder="Ví dụ: 2026, 2024..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Bìa Đĩa (Dùng làm thumbnail)</label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDraggingCover(false); 
                    const file = e.dataTransfer.files?.[0]; 
                    if (file && file.type.startsWith('image/')) uploadFileDirectly(file, 'cover'); 
                  }}
                  className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                    isDraggingCover 
                      ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                      : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                  }`}
                >
                  {(uploadedCoverUrl || demo?.coverUrl) ? (
                    <img src={getPreviewUrl(uploadedCoverUrl || demo?.coverUrl)} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${coverUploadProgress === 100 || uploadedCoverUrl || demo?.coverUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('coverEditUpload')?.click()}>
                          <Upload className="w-4 h-4"/>
                          <span className="max-w-[150px] truncate">
                            {coverUploadProgress > 0 && coverUploadProgress < 100 
                              ? `Đang tải ${coverUploadProgress}%` 
                              : (uploadedCoverName ? formatFileName(uploadedCoverName) : (getFileNameFromUrl(uploadedCoverUrl || demo?.coverUrl) ? formatFileName(getFileNameFromUrl(uploadedCoverUrl || demo?.coverUrl)) : 'Chọn bìa đĩa'))}
                          </span>
                      </button>
                      {coverUploadProgress > 0 && coverUploadProgress < 100 ? (
                        <button type="button" onClick={() => cancelUpload('cover')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                      ) : ((uploadedCoverUrl || demo?.coverUrl) ? (
                        <button type="button" onClick={() => { setUploadedCoverUrl(''); setCoverUploadProgress(0); setUploadedCoverName(''); (document.getElementById('coverEditUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                      ) : null)}
                    </div>
                    {coverUploadProgress > 0 && coverUploadProgress < 100 && (
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${coverUploadProgress}%` }} />
                      </div>
                    )}
                    <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                      {uploadedCoverName 
                        ? `Tệp đã chọn: ${formatFileName(uploadedCoverName, 30)}` 
                        : (demo?.coverUrl 
                          ? `Tệp hiện tại: ${formatFileName(getFileNameFromUrl(uploadedCoverUrl || demo?.coverUrl), 30)}` 
                          : 'Kéo thả bìa đĩa trực tiếp vào ô này')}
                    </p>
                  </div>
                  <input type="hidden" name="coverUrl" value={uploadedCoverUrl} />
                  <input type="file" id="coverEditUpload" name="cover" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} className="hidden" />
                </div>
              </div>
 
              {linkType === 'direct' && (
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh Nền (Nếu có)</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingBg(true); }}
                    onDragLeave={() => setIsDraggingBg(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setIsDraggingBg(false); 
                      const file = e.dataTransfer.files?.[0]; 
                      if (file && file.type.startsWith('image/')) uploadFileDirectly(file, 'background'); 
                    }}
                    className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                      isDraggingBg 
                        ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                        : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                    }`}
                  >
                    {(uploadedBgUrl || demo?.backgroundUrl) ? (
                      <img src={getPreviewUrl(uploadedBgUrl || demo?.backgroundUrl)} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                        <Image className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${bgUploadProgress === 100 || uploadedBgUrl || demo?.backgroundUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('bgEditUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">
                              {bgUploadProgress > 0 && bgUploadProgress < 100 
                                ? `Đang tải ${bgUploadProgress}%` 
                                : (uploadedBgName ? formatFileName(uploadedBgName) : (getFileNameFromUrl(uploadedBgUrl || demo?.backgroundUrl) ? formatFileName(getFileNameFromUrl(uploadedBgUrl || demo?.backgroundUrl)) : 'Chọn ảnh nền'))}
                            </span>
                        </button>
                        {bgUploadProgress > 0 && bgUploadProgress < 100 ? (
                          <button type="button" onClick={() => cancelUpload('background')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                        ) : ((uploadedBgUrl || demo?.backgroundUrl) ? (
                          <button type="button" onClick={() => { setUploadedBgUrl(''); setBgUploadProgress(0); setUploadedBgName(''); (document.getElementById('bgEditUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                        ) : null)}
                      </div>
                      {bgUploadProgress > 0 && bgUploadProgress < 100 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${bgUploadProgress}%` }} />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                        {uploadedBgName 
                          ? `Tệp đã chọn: ${formatFileName(uploadedBgName, 30)}` 
                          : (demo?.backgroundUrl 
                            ? `Tệp hiện tại: ${formatFileName(getFileNameFromUrl(uploadedBgUrl || demo?.backgroundUrl), 30)}` 
                            : 'Kéo thả ảnh nền trực tiếp vào ô này')}
                      </p>
                    </div>
                    <input type="hidden" name="backgroundUrl" value={uploadedBgUrl} />
                    <input type="file" id="bgEditUpload" name="background" accept="image/*" onChange={e => handleFileUpload(e, 'background')} className="hidden" />
                  </div>
                </div>
              )}
            </div>

            {linkType === 'direct' && (
              <>
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">File Nhạc (Audio) <span className="text-red-500">*</span></label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                    onDragLeave={() => setIsDraggingAudio(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setIsDraggingAudio(false); 
                      const file = e.dataTransfer.files?.[0]; 
                      if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a'))) {
                        uploadFileDirectly(file, 'audio');
                      }
                    }}
                    className={`bg-stone-50 border-2 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm transition-all duration-200 ${
                      isDraggingAudio 
                        ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                        : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                    }`}
                  >
                    {/* Current Audio Info if exists */}
                    {(demo?.audioUrl || uploadedAudioUrl) && (
                      <div className="text-xs text-stone-500 border-b border-stone-200 pb-3 mb-1 flex justify-between items-center flex-wrap gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-bold block sm:inline font-sans text-stone-700">File hiện tại:</span>{' '}
                          <div className="mt-1">
                            {(() => {
                              const currentAudioUrl = uploadedAudioUrl || demo?.audioUrl || '';
                              if (currentAudioUrl.includes('drive.google.com') || currentAudioUrl.includes('docs.google.com')) {
                                  return (
                                    <span className="text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl text-[11px] inline-block leading-normal">
                                      ⚠️ Link Google Drive cũ (Hệ thống đã tắt tính năng chạy link trực tiếp, vui lòng tải file nhạc lên để phát ổn định)
                                    </span>
                                  );
                              } else {
                                  return (
                                    <span className="font-sans text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-[11px] inline-block leading-normal">
                                      🎵 Tệp nhạc đã được tải lên trực tiếp thành công
                                    </span>
                                  );
                              }
                            })()}
                          </div>
                        </div>
                        {demo?.backupAudioUrl && demo.backupAudioUrl !== (uploadedAudioUrl || demo?.audioUrl) && (
                          <button
                            type="button"
                            disabled={isReverting}
                            onClick={handleRevertAudio}
                            className="bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-bold text-[11px] shadow-sm shrink-0 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> 
                            {isReverting ? 'Đang khôi phục...' : 'Khôi phục bản cũ'}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                      {(uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                        <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      )}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${audioUploadProgress === 100 || (uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com')) || (demo?.audioUrl && !uploadedAudioUrl) ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} onClick={() => document.getElementById('audioEditUpload')?.click()}>
                              <Upload className="w-4 h-4"/>
                              <span className="max-w-[200px] truncate">
                                {audioUploadProgress > 0 && audioUploadProgress < 100 
                                  ? `Đang tải ${audioUploadProgress}%` 
                                  : (uploadedAudioName ? formatFileName(uploadedAudioName) : (getFileNameFromUrl(uploadedAudioUrl || demo?.audioUrl) ? formatFileName(getFileNameFromUrl(uploadedAudioUrl || demo?.audioUrl)) : 'Chọn file nhạc'))}
                              </span>
                          </button>
                          {audioUploadProgress > 0 && audioUploadProgress < 100 ? (
                            <button type="button" onClick={() => cancelUpload('audio')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title="Hủy tải lên"><X className="w-4 h-4"/></button>
                          ) : ((uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                            <button type="button" onClick={() => { setUploadedAudioUrl(''); setAudioUploadProgress(0); setUploadedAudioName(''); (document.getElementById('audioEditUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                          ) : null)}
                        </div>
                        {audioUploadProgress > 0 && audioUploadProgress < 100 && (
                          <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${audioUploadProgress}%` }} />
                          </div>
                        )}
                        <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                          {uploadedAudioName 
                            ? `Tệp đã chọn: ${formatFileName(uploadedAudioName, 30)}` 
                            : (demo?.audioUrl 
                              ? `Tệp hiện tại: ${formatFileName(getFileNameFromUrl(uploadedAudioUrl || demo?.audioUrl), 30)}` 
                              : 'Kéo thả file nhạc (.mp3, .wav, .m4a) trực tiếp vào ô này')}
                        </p>
                      </div>
                      <input type="file" id="audioEditUpload" name="audio" accept="audio/mp3,audio/wav,audio/*" onChange={e => handleFileUpload(e, 'audio')} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="block text-sm font-bold text-stone-700">Lời bài hát</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="hidden sm:inline text-[11px] text-stone-400 font-medium mr-1">Chèn nhanh:</span>
                      {[
                        { label: 'Intro', value: 'Intro', className: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' },
                        { label: 'Verse', value: 'Verse', className: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
                        { label: 'Chorus', value: 'Chorus', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
                        { label: 'Rap', value: 'Rap', className: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
                        { label: 'Drop', value: 'Drop', className: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
                        { label: 'Bridge', value: 'Bridge', className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                        { label: 'Outro', value: 'Outro', className: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' },
                        { label: 'Ending', value: 'Ending', className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' }
                      ].map((tag) => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => handleInsertTag(tag.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer shadow-xs ${tag.className}`}
                        >
                          +{tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    ref={lyricsRef}
                    name="lyrics" 
                    rows={6} 
                    value={lyrics} 
                    onChange={e => setLyrics(e.target.value)} 
                    placeholder="Nhập lời bài hát (nếu có)..." 
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow leading-relaxed"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                  <div className="w-full">
                    <label className="block text-sm font-bold text-stone-700 mb-2">Template Giao Diện</label>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 min-w-0">
                      <select name="template" value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full min-w-0 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white shadow-sm">
                        {templateConfigs.map((tc: any) => (
                          <option key={tc.id} value={tc.id}>{tc.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        disabled={!title.trim()}
                        onClick={() => setShowTemplatePicker(true)} 
                        className={`px-6 py-3 border border-transparent shrink-0 shadow-sm text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${(!title.trim()) ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'}`}
                      >
                        <Eye className="w-5 h-5" /> Xem trước giao diện
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {linkType === 'indirect' && (
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 text-lg">Liên kết phát nhạc</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Zing MP3</label>
                    <input name="linkZing" value={linkZing} onChange={e => setLinkZing(e.target.value)} placeholder="Nhập link Zing MP3..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Spotify</label>
                    <input name="linkSpotify" value={linkSpotify} onChange={e => setLinkSpotify(e.target.value)} placeholder="Nhập link Spotify..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Apple Music</label>
                    <input name="linkApple" value={linkApple} onChange={e => setLinkApple(e.target.value)} placeholder="Nhập link Apple Music..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">YouTube Music</label>
                    <input name="linkYoutubeMusic" value={linkYoutubeMusic} onChange={e => setLinkYoutubeMusic(e.target.value)} placeholder="Nhập link YouTube Music..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">YouTube MV</label>
                    <input name="linkYoutube" value={linkYoutube} onChange={e => setLinkYoutube(e.target.value)} placeholder="Nhập link YouTube MV..." className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                  </div>
                </div>
              </div>
            )}

            {linkType !== 'indirect' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                  {!isReleased ? (
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu bảo vệ (tùy chọn)</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                        <input name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Bỏ trống nếu không cần" className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-stone-500 text-sm italic font-medium pt-2">
                      <span>✓ Bài hát đã phát hành sẽ không sử dụng mật khẩu bảo vệ.</span>
                    </div>
                  )}
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Hiển thị (Trạng thái phát hành)</label>
                     <select name="status" defaultValue={demo.status} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white">
                      <option value="public">Công khai</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </div>
                </div>

                <AchievementEditor achievements={achievements} onChange={setAchievements} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Đã phát hành</label>
                    <label className="inline-flex items-center gap-3 cursor-pointer mt-1">
                      <input type="checkbox" name="isReleased" checked={isReleased} onChange={e => {
                        const checked = e.target.checked;
                        setIsReleased(checked);
                        if (checked) {
                          setPassword('');
                        }
                      }} className="w-6 h-6 rounded border-stone-300 text-stone-900 focus:ring-stone-900 transition-all cursor-pointer" />
                    </label>
                  </div>

                   <div>
                     <PlaylistSelect selectedIds={playlistIds} onChange={setPlaylistIds} />
                   </div>
                </div>

                {demo && demo.secretKey && (demo.linkType === 'indirect' ? password : (password || (appData?.globalPassword && !isReleased))) && (
                  <div className="bg-amber-50 border border-amber-250/60 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 mt-6 animate-[fade-in_0.3s_ease-out] w-full min-w-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:flex-1 min-w-0">
                      <div className="w-12 h-12 bg-amber-100/75 text-amber-700 rounded-xl flex items-center justify-center font-bold shrink-0 mx-auto sm:mx-0 shadow-xs">
                        <Lock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                        <div className="font-bold text-stone-800 text-sm tracking-tight">Secret Link (Chia sẻ trực tiếp xem không hỏi mật khẩu)</div>
                        <div className="text-xs text-amber-800 font-mono select-all truncate w-full max-w-full mt-1.5 px-3 py-1.5 bg-amber-150/40 rounded-lg border border-amber-200/50">
                          {formatShareUrl(window.location.origin + getArtistLink('/song/' + (demo.slug || demo.id)) + '?secret=' + demo.secretKey)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const baseUrl = '/song/';
                        const dynamicId = demo.slug || demo.id;
                        let url = window.location.origin + getArtistLink(baseUrl + dynamicId);
                        url = formatShareUrl(url);
                        url += `?secret=${demo.secretKey}`;
                        await copyToClipboard(url);
                        setToast('Đã copy Secret Link!');
                        setTimeout(() => setToast(''), 3000);
                      }}
                      className="w-full md:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
                    >
                      <Lock className="w-4 h-4" /> Copy Secret Link
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-4 mt-8">
              {demo.isDraft ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(true)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 text-lg font-bold py-4 rounded-xl transition-colors disabled:opacity-80 flex justify-center items-center gap-2"
                  >
                    <FileText className="w-5 h-5 text-amber-500" />
                    {loading ? 'Đang lưu...' : 'Lưu Bản Nháp'}
                  </button>
                  
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(false)}
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-lg font-bold py-4 rounded-xl transition-colors disabled:opacity-80 flex justify-center items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {loading ? 'Đang xuất bản...' : 'Xuất Bản'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(false)}
                    className="flex-1 bg-stone-900 text-white text-lg font-bold py-4 rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-80 flex justify-center items-center gap-2 shadow-sm"
                  >
                    <FileText className="w-5 h-5 text-amber-500" />
                    {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                  {(demo.linkType === 'indirect' ? demo.password : (demo.password || (appData?.globalPassword && !demo.isReleased))) && (
                    <button 
                      disabled={loading} 
                      type="button" 
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn làm mới Secret Link của bài này? Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu.")) return;
                        const res = await fetch(`/api/demos/${demo.id}/reset-secret`, {
                          method: 'POST',
                          headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),

                            'Authorization': `Bearer ${getAdminToken() || ''}`
                          }
                        });
                        if (res.ok) {
                          alert("Đã reset Secret Link thành công!");
                        }
                      }} 
                      className="flex-1 border-2 border-red-200 text-red-500 hover:bg-red-50 text-lg font-bold py-4 rounded-xl transition-colors disabled:opacity-80 flex justify-center items-center gap-2 shadow-sm"
                    >
                      <Lock className="w-5 h-5 text-red-500" />
                      Làm mới Secret Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold z-50 animate-[bounce_1s_ease-in-out]">
          {toast}
        </div>
      )}
      {showTemplatePicker && (
         <TemplatePickerModal 
            configs={templateConfigs} 
            previewSongId={id || 'preview'}
            defaultTemplateId={template}
            previewData={{
              id: id || 'preview',
              title: title,
              singer: singer || appData?.artistName || 'Nghệ sĩ',
              composer: composer || appData?.artistName || 'Nghệ sĩ',
              audioUrl: uploadedAudioUrl || demo?.audioUrl,
              coverUrl: uploadedCoverUrl || demo?.coverUrl || randomSlideUrl || (appData?.slideshowImages && appData.slideshowImages.length > 0 ? appData.slideshowImages[0] : '') || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
              backgroundUrl: uploadedBgUrl || demo?.backgroundUrl,
              lyrics: lyrics,
              template: template,
              status: 'public',
              isReleased: false,
              playlistIds: playlistIds,
              requiresPassword: false
            }}
            onSelect={(id) => {
               setTemplate(id);
               setShowTemplatePicker(false);
            }} 
            onClose={() => setShowTemplatePicker(false)}
         />
      )}

      {loading && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white">
          <div className="bg-stone-950/95 border border-stone-800 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm mx-4 text-center">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <Disc3 className="w-8 h-8 text-amber-500 animate-[spin_4s_linear_infinite]" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">{loadingText}</h3>
            <p className="text-stone-400 text-xs leading-relaxed">Vui lòng đợi trong giây lát. Hệ thống đang tối ưu hóa dữ liệu và lưu trữ an toàn trên cloud.</p>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-950 border border-stone-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center animate-[fade-in_0.2s_ease-out]"
          >
            <div className="mb-4">
              {notification.type === 'error' && <AlertCircle className="w-12 h-12 text-rose-500 animate-[bounce_1.5s_infinite]" />}
              {notification.type === 'warning' && <AlertTriangle className="w-12 h-12 text-amber-500 animate-[bounce_1.5s_infinite]" />}
              {notification.type === 'success' && <CheckCircle className="w-12 h-12 text-emerald-500" />}
              {notification.type === 'info' && <Info className="w-12 h-12 text-blue-500" />}
            </div>
            <h4 className="text-white font-black text-xl mb-2 tracking-tight">{notification.title || (notification.type === 'error' ? 'Lỗi xảy ra' : 'Thông báo')}</h4>
            <p className="text-stone-400 text-xs leading-relaxed mb-6">{notification.message}</p>
            <button 
              type="button" 
              onClick={handleCloseNotification}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black py-3 px-6 rounded-xl transition-all shadow-md tracking-tight text-sm"
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminPlaylistEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [coverUrlPreview, setCoverUrlPreview] = useState('');
  const [coverProgress, setCoverProgress] = useState(0);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNewSongIds, setSelectedNewSongIds] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [password, setPassword] = useState('');
  const [secretLink, setSecretLink] = useState('');

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  const uploadWithProgress = (file: File, setProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken() || ''}`);
    xhr.setRequestHeader('x-artist-extension', getArtistExtensionFromUrl());
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgress(100);
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } else reject(new Error('Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/playlists/${id}`, {
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
      }).then(r => r.json()),
      fetch('/api/admin/data', {
        headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken() || ''}` }
      }).then(r => r.json())
    ]).then(([playlistData, data]) => {
      setPlaylist(playlistData.playlist);
      setTitle(playlistData.playlist.title);
      setCoverUrlPreview(playlistData.playlist.coverUrl || '');
      setIsDraft(playlistData.playlist.isDraft || false);
      setPassword(playlistData.playlist.password || '');
      setSecretLink(playlistData.playlist.secretLink || '');
      setSongs(playlistData.songs);
      setAppData(data);
      setIsLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    const songIds = songs.map(s => s.id);
    await fetch(`/api/playlists/${id}/update`, {
      method: 'POST',
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAdminToken() || ''}` 
      },
      body: JSON.stringify({ title, coverUrl: coverUrlPreview, songIds, isDraft, password, secretLink })
    });
    setToast('Đã lưu thành công!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleDragStart = (idx: number) => {
    setDraggingIdx(idx);
  };

  const handleDragEnter = (targetIdx: number) => {
    if (draggingIdx === null || draggingIdx === targetIdx) return;
    const newSongs = [...songs];
    const draggedItem = newSongs[draggingIdx];
    newSongs.splice(draggingIdx, 1);
    newSongs.splice(targetIdx, 0, draggedItem);
    setDraggingIdx(targetIdx);
    setSongs(newSongs);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
  };

  if (isLoading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center text-stone-500">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans relative pb-24">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold z-50 animate-[bounce_1s_ease-in-out]">
          {toast}
        </div>
      )}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={getAdminLink()} className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1">
             <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <button onClick={handleSave} className="bg-stone-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-sm">Lưu thay đổi</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Tên Playlist</label>
            <input 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
            <div>
               <label className="block text-sm font-bold text-stone-700 mb-2">Trạng thái (Hiển thị)</label>
               <select value={isDraft ? 'true' : 'false'} onChange={e => setIsDraft(e.target.value === 'true')} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white">
                  <option value="false">Công khai (hiện ở trang chủ)</option>
                  <option value="true">Riêng tư / Bản nháp (ẩn khỏi trang chủ)</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-bold text-stone-700 mb-2">Mật khẩu Playlist (tùy chọn)</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                 <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Bỏ trống nếu không cần" className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
             <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-stone-700">Secret Link (Link Bí Mật)</label>
                <button type="button" onClick={() => {
                   if (!secretLink || confirm("Tạo mới Secret Link? Link cũ sẽ không thể truy cập nữa.")) {
                      setSecretLink(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
                   }
                }} className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg font-bold transition-colors">Tạo Link Mới</button>
             </div>
             {secretLink ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                   <p className="text-emerald-800 text-sm font-medium mb-2">Sử dụng link sau để truy cập trực tiếp (không cần nhập mật khẩu playlist):</p>
                   <div className="flex items-center gap-2">
                      <input readOnly value={`${window.location.origin}/playlist/${id}?secret=${secretLink}`} className="flex-1 bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm text-emerald-900 focus:outline-none" />
                      <button type="button" onClick={async () => {
                         await navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}?secret=${secretLink}`);
                         setToast('Đã copy Secret Link!');
                         setTimeout(() => setToast(''), 3000);
                      }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">Copy</button>
                      <button type="button" onClick={() => setSecretLink('')} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-sm hover:bg-red-200">Xóa</button>
                   </div>
                </div>
             ) : (
                <p className="text-sm text-stone-500 italic">Chưa tạo Secret Link cho Playlist này.</p>
             )}
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Ảnh bìa Playlist (Kích thước vuông)</label>
            <div className="flex flex-wrap gap-4 items-center">
              {coverUrlPreview && <img src={getPreviewUrl(coverUrlPreview)} className="w-24 h-24 rounded-xl object-cover border border-stone-200 shadow-sm" />}
              <button 
                type="button" 
                className={`w-24 h-24 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors border shadow-sm ${coverProgress === 100 ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-300 bg-stone-50 text-stone-500 hover:bg-stone-100'}`} 
                onClick={() => document.getElementById('playlistCoverUpload')?.click()}
              >
                  {coverProgress > 0 && coverProgress < 100 && (
                    <div className="absolute left-0 bottom-0 right-0 bg-stone-200 transition-all duration-300" style={{ height: `${coverProgress}%` }}></div>
                  )}
                  <span className="relative z-10 font-bold text-[10px] flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5"/> {coverProgress > 0 && coverProgress < 100 ? `${coverProgress}%` : ''}
                  </span>
              </button>
              {coverUrlPreview && (
                <button 
                  type="button" 
                  onClick={() => { setCoverUrlPreview(''); setCoverProgress(0); (document.getElementById('playlistCoverUpload') as HTMLInputElement).value = ''; }} 
                  className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              )}
              <input type="file" id="playlistCoverUpload" className="hidden" accept="image/*" onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                try {
                  const url = await uploadWithProgress(e.target.files[0], setCoverProgress);
                  setCoverUrlPreview(url);
                } catch (err) {
                  alert('Lỗi upload');
                  setCoverProgress(0);
                }
              }} />
            </div>
            <p className="text-xs text-stone-500 mt-2">Dùng để làm ảnh đại diện cho Playlist khi chia sẻ.</p>
          </div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-700">Danh sách bài hát (Kéo thả để sắp xếp)</h3>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-stone-900 text-white hover:bg-stone-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm bài hát
                </button>
             </div>
             {songs.length === 0 ? (
               <div className="text-center py-8 text-stone-400 border-2 border-dashed rounded-xl">Chưa có bài hát nào trong playlist này.</div>
             ) : (
               <div className="space-y-2">
                 {songs.map((song, i) => (
                    <div 
                       key={song.id}
                       draggable
                       onDragStart={() => handleDragStart(i)}
                       onDragEnter={() => handleDragEnter(i)}
                       onDragOver={(e) => e.preventDefault()}
                       onDragEnd={handleDragEnd}
                       className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${draggingIdx === i ? 'bg-stone-100 border-stone-400 opacity-50 relative z-10' : 'bg-white border-stone-200 hover:bg-stone-50'} cursor-grab active:cursor-grabbing`}
                    >
                       <GripVertical className="w-5 h-5 text-stone-400 shrink-0" />
                       {song.coverUrl ? (
                         <img src={getPreviewUrl(song.coverUrl)} className="w-12 h-12 rounded object-cover border border-stone-200 shrink-0" alt="" />
                       ) : (
                         <div className="w-12 h-12 bg-stone-100 rounded flex items-center justify-center shrink-0 border border-stone-200">
                           <Disc3 className="w-6 h-6 text-stone-400" />
                         </div>
                       )}
                       <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate">{song.title}</h4>
                          <p className="text-xs text-stone-500 truncate">{song.singer || song.author}</p>
                       </div>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           e.preventDefault();
                           setSongs(songs.filter(s => s.id !== song.id));
                         }}
                         className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                         title="Xóa khỏi playlist"
                       >
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-4 shrink-0">
              <h3 className="font-bold text-lg text-stone-900">Thêm bài hát vào playlist</h3>
              <button 
                type="button"
                onClick={() => { setShowAddModal(false); setSelectedNewSongIds([]); }} 
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(() => {
                const currentSongIds = songs.map(s => s.id);
                const availableSongs = appData?.demos?.filter((d: any) => !currentSongIds.includes(d.id)) || [];
                if (availableSongs.length === 0) {
                  return <p className="text-center text-stone-500 py-8">Tất cả bài hát đều đã ở trong playlist này rồi.</p>;
                }
                return availableSongs.map((song: any) => {
                  const isChecked = selectedNewSongIds.includes(song.id);
                  return (
                    <label 
                      key={song.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-stone-50 border-stone-450 font-semibold' : 'hover:bg-stone-50 border-stone-200'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {
                          if (isChecked) {
                            setSelectedNewSongIds(selectedNewSongIds.filter(id => id !== song.id));
                          } else {
                            setSelectedNewSongIds([...selectedNewSongIds, song.id]);
                          }
                        }}
                        className="w-5 h-5 rounded text-stone-900 border-stone-300 focus:ring-stone-900" 
                      />
                      {song.coverUrl ? (
                        <img src={getPreviewUrl(song.coverUrl)} className="w-10 h-10 rounded object-cover border shrink-0" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center shrink-0 border">
                          <Disc3 className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm truncate">{song.title}</p>
                        <p className="text-xs text-stone-500 truncate">{song.singer || song.author}</p>
                      </div>
                    </label>
                  );
                });
              })()}
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t mt-4 shrink-0">
              <button 
                type="button"
                onClick={() => { setShowAddModal(false); setSelectedNewSongIds([]); }} 
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button 
                type="button"
                onClick={() => {
                  const addedSongs = (appData?.demos || []).filter((d: any) => selectedNewSongIds.includes(d.id));
                  setSongs([...songs, ...addedSongs]);
                  setShowAddModal(false);
                  setSelectedNewSongIds([]);
                }}
                disabled={selectedNewSongIds.length === 0}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm đã chọn ({selectedNewSongIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
