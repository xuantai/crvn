import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, Music, Apple, Youtube, Play, Share2, X, ExternalLink, ArrowLeft, Check, Edit3, FileText, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface IndirectBioCardProps {
  key?: React.Key;
  demo: {
    id: string;
    slug?: string;
    title: string;
    coverUrl?: string;
    composer?: string;
    musicProducer?: string;
    singer?: string;
    linkZing?: string;
    linkSpotify?: string;
    linkApple?: string;
    linkYoutubeMusic?: string;
    linkYoutube?: string;
    linkDrive?: string;
    isBrand?: boolean;
    brandName?: string;
    brandColor?: string;
    brandLogoUrl?: string;
    brandBrief?: string;
    brandReferenceVideos?: string[];
    achievements?: any[];
  };
  onClose?: () => void;
  isStandalone?: boolean;
  lang?: string;
}

const SpotifyIcon = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C15.84 7.08 9.12 6.9 5.28 8.04c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.38-1.26 11.76-1.08 16.68 1.86.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z"/>
  </svg>
);

const AppleMusicIcon = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z"/>
  </svg>
);

const YoutubeMusicIcon = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 1 0 24 12 12.013 12.013 0 0 0 12 0zm-2.4 17.5V6.5L16.6 12z"/>
  </svg>
);

const YoutubeIcon = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
    <path fill="white" d="M9.545 15.568V8.432L15.818 12z" />
  </svg>
);

const ZingIcon = ({ className }: { className?: string }) => (
  <motion.div 
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
    className={`overflow-hidden rounded-full flex items-center justify-center ${className}`}
  >
    <img 
      className="w-full h-full object-cover scale-[1.7]" 
      src="https://yt3.googleusercontent.com/ytc/AIdro_kfPqO-m9zcBxusjVAWHXrEVzNn2zFiauJ5D9VKmCBNO8g=s900-c-k-c0x00ffffff-no-rj" 
      alt="Zing MP3"
      referrerPolicy="no-referrer"
    />
  </motion.div>
);

const getArtistExtensionFromUrl = () => {
  const host = window.location.hostname.replace(/^www\./, '');
  if (host.endsWith('.chorus.vn') && host !== 'chorus.vn') {
    const sub = host.replace('.chorus.vn', '');
    if (sub) return sub;
  }
  const match = window.location.pathname.match(/^\/([^\/]+)/);
  if (match && !['admin', 'api', 'upload', 'demo', 'song', 'playlist', 'assets'].includes(match[1])) {
    return match[1];
  }
  return '';
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

const getAdminLink = (subPath: string = '') => {
  const host = window.location.hostname.replace(/^www\./, '');
  const isSubdomain = host.endsWith('.chorus.vn') && host !== 'chorus.vn';
  if (isSubdomain) {
    return `/admin${subPath}`;
  }
  const ext = getArtistExtensionFromUrl();
  return ext ? `/${ext}/admin${subPath}` : `/admin${subPath}`;
};

const getLuminance = (hex: string) => {
  let c = hex.substring(1); // strip #
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const rgb = parseInt(c, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getBrandBadgeStyle = (primaryColor: string) => {
  const isColorLight = getLuminance(primaryColor) > 0.5;
  const backgroundColor = isColorLight ? 'rgba(15, 15, 15, 0.85)' : 'rgba(245, 245, 245, 0.9)';
  const borderColor = isColorLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const labelColor = isColorLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  const valueColor = primaryColor;
  const dotColor = primaryColor;
  return {
    backgroundColor,
    borderColor,
    labelColor,
    valueColor,
    dotColor,
    boxShadow: isColorLight ? '0 4px 12px rgba(0, 0, 0, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.05)'
  };
};

function formatBriefText(text: string | null | undefined) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`l147-idx-${idx}`} className="h-2" />;
    }
    
    // Check if line matches a list with bullet (- or * or + or •)
    const bulletMatch = line.match(/^(\s*)([-*•+])\s+(.*)$/);
    if (bulletMatch) {
      const leadingSpaces = bulletMatch[1];
      const content = bulletMatch[3];
      const indentClass = leadingSpaces.length > 0 ? "pl-8" : "pl-4";
      return (
        <div key={`l157-idx-${idx}`} className={`flex items-start gap-2 ${indentClass} py-0.5 leading-relaxed text-left`}>
          <span className="text-indigo-400 select-none shrink-0">•</span>
          <span className="text-left">{content}</span>
        </div>
      );
    }
    
    // Check if line matches a numbered list e.g. "1. " or "2) " or "1 " (with spaces)
    const numberMatch = line.match(/^(\s*)(\d+|[a-zA-Z])([.)]|\s+)\s*(.*)$/);
    if (numberMatch) {
      const leadingSpaces = numberMatch[1];
      const num = numberMatch[2];
      const separator = numberMatch[3].trim();
      const content = numberMatch[4];
      if (content) {
        const indentClass = leadingSpaces.length > 0 ? "pl-8" : "pl-4";
        return (
          <div key={`l174-idx-${idx}`} className={`flex items-start gap-2 ${indentClass} py-0.5 leading-relaxed text-left`}>
            <span className="text-indigo-400 font-bold font-mono select-none shrink-0">{num}{separator || '.'}</span>
            <span className="text-left">{content}</span>
          </div>
        );
      }
    }
    
    return <div key={`l182-idx-${idx}`} className="text-left whitespace-pre-wrap">{line}</div>;
  });
}

const useBrandLogoColors = (logoUrl: string | undefined, brandName: string | undefined, defaultColor: string = '#6366f1') => {
  const [colors, setColors] = useState<{
    primary: string;
    secondary: string;
    background: string;
    borderColor: string;
  }>({
    primary: defaultColor,
    secondary: '#888888',
    background: '#ffffff',
    borderColor: 'rgba(0,0,0,0.08)',
  });

  useEffect(() => {
    if (!logoUrl) {
      const normColor = defaultColor || '#6366f1';
      const isLight = getLuminance(normColor) > 0.4;
      setColors({
        primary: normColor,
        secondary: isLight ? '#000000' : '#888888',
        background: isLight ? '#121212' : '#ffffff',
        borderColor: isLight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      });
      return;
    }

    const bName = (brandName || '').toLowerCase().trim();
    if (bName.includes('xanh sm') || bName.includes('xanhsm') || bName.includes('gsm')) {
      setColors({
        primary: '#00B6B3', // cyan
        secondary: '#071A2C', // navy/dark-blue
        background: '#ffffff', // solid white
        borderColor: 'rgba(0, 0, 0, 0.12)',
      });
      return;
    }
    if (bName.includes('grab')) {
      setColors({
        primary: '#00b14f',
        secondary: '#071A2C',
        background: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.12)',
      });
      return;
    }
    if (bName.includes('be')) {
      setColors({
        primary: '#212121',
        secondary: '#facc15',
        background: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.12)',
      });
      return;
    }
    if (bName.includes('gojek')) {
      setColors({
        primary: '#00aa13',
        secondary: '#ff3b30',
        background: '#ffffff',
        borderColor: 'rgba(0, 0, 0, 0.12)',
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No ctx');
        
        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;
        
        const colorBuckets: { [key: string]: { rSum: number, gSum: number, bSum: number, count: number } } = {};
        
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a < 120) continue;
          
          const isWhite = r > 240 && g > 240 && b > 240;
          const isBlack = r < 15 && g < 15 && b < 15;
          
          const rRound = Math.round(r / 32) * 32;
          const gRound = Math.round(g / 32) * 32;
          const bRound = Math.round(b / 32) * 32;
          
          const key = `${rRound},${gRound},${bRound}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = { rSum: 0, gSum: 0, bSum: 0, count: 0 };
          }
          colorBuckets[key].rSum += r;
          colorBuckets[key].gSum += g;
          colorBuckets[key].bSum += b;
          const weight = (isWhite || isBlack) ? 0.3 : 1.0;
          colorBuckets[key].count += weight;
        }
        
        const sortedBuckets = Object.entries(colorBuckets)
          .map(([key, item]) => {
            const count = item.count;
            const mult = key.includes('224,224,224') || key.includes('0,0,0') ? 0.3 : 1.0;
            const div = item.count / mult || 1;
            const rAvg = item.rSum / div;
            const gAvg = item.gSum / div;
            const bAvg = item.bSum / div;
            
            const toHex = (n: number) => {
              const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            };
            
            return {
              hex: `#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`,
              r: rAvg,
              g: gAvg,
              b: bAvg,
              count
            };
          })
          .sort((a, b) => b.count - a.count);
          
        if (sortedBuckets.length > 0) {
          const prim = sortedBuckets[0].hex;
          let sec = sortedBuckets[1]?.hex || sortedBuckets[0].hex;
          
          if (sortedBuckets[1]) {
            const dist = Math.sqrt(
              Math.pow(sortedBuckets[0].r - sortedBuckets[1].r, 2) +
              Math.pow(sortedBuckets[0].g - sortedBuckets[1].g, 2) +
              Math.pow(sortedBuckets[0].b - sortedBuckets[1].b, 2)
            );
            if (dist < 40 && sortedBuckets[2]) {
              sec = sortedBuckets[2].hex;
            }
          }
          
          const primLum = getLuminance(prim);
          const isBgDark = primLum > 0.45;
          const background = isBgDark ? '#141414' : '#ffffff';
          const borderColor = isBgDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
          
          setColors({
            primary: prim,
            secondary: sec,
            background,
            borderColor
          });
        }
      } catch (err) {
        console.warn('CORS or Canvas extraction failed', err);
        const normColor = defaultColor || '#6366f1';
        const isLight = getLuminance(normColor) > 0.4;
        setColors({
          primary: normColor,
          secondary: isLight ? '#000000' : '#ffffff',
          background: isLight ? '#ffffff' : '#121212',
          borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        });
      }
    };
    
    img.onerror = () => {
      const normColor = defaultColor || '#6366f1';
      const isLight = getLuminance(normColor) > 0.4;
      setColors({
        primary: normColor,
        secondary: isLight ? '#000000' : '#ffffff',
        background: isLight ? '#ffffff' : '#121212',
        borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
      });
    };
  }, [logoUrl, brandName, defaultColor]);

  return colors;
};

export function IndirectBioCard({ demo, onClose, isStandalone = false, lang = 'vi' }: IndirectBioCardProps) {
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [publicArtists, setPublicArtists] = useState<any[]>([]);
  const [showBrandBrief, setShowBrandBrief] = useState(false);
  const [showBrandVideos, setShowBrandVideos] = useState(false);
  const navigate = useNavigate();
  const primaryColor = demo.brandColor || '#6366f1';

  // Localized dictionary for bio card elements
  const localDict: Record<string, Record<string, string>> = {
    vi: {
      composer: "Sáng tác",
      musicProducer: "Music Producer",
      partner: "Đối tác",
      brandMusic: "Nhạc Thương Hiệu",
      brief: "Brief",
      reference: "Tham Khảo",
      back: "Trở về",
      home: "Trang chủ",
      briefTitle: "Brief khách hàng",
      videoTitle: "Video Tham Khảo",
      noLinks: "Bài hát chưa cập nhật link trực tuyến nào."
    },
    en: {
      composer: "Composer",
      musicProducer: "Music Producer",
      partner: "Partner",
      brandMusic: "Brand Music",
      brief: "Brief",
      reference: "Reference",
      back: "Back",
      home: "Home",
      briefTitle: "Client Brief",
      videoTitle: "Reference Video",
      noLinks: "No streaming links updated for this song."
    },
    ko: {
      composer: "작사/작곡",
      musicProducer: "뮤직 프로듀서",
      partner: "파트너",
      brandMusic: "브랜드 음악",
      brief: "브리프",
      reference: "참고",
      back: "뒤로",
      home: "홈",
      briefTitle: "클라이언트 브리프",
      videoTitle: "참고 비디오",
      noLinks: "이 노래에 대한 스트리밍 링크가 업데이트되지 않았습니다."
    },
    ja: {
      composer: "作詞/作曲",
      musicProducer: "音楽プロデューサー",
      partner: "パートナー",
      brandMusic: "ブランド音楽",
      brief: "ブリーフ",
      reference: "参考",
      back: "戻る",
      home: "ホーム",
      briefTitle: "クライアントブリーフ",
      videoTitle: "参考ビデオ",
      noLinks: "この曲のストリーミングリンクは更新されていません。"
    },
    th: {
      composer: "ผู้แต่งเพลง",
      musicProducer: "โปรดิวเซอร์เพลง",
      partner: "พันธมิตร",
      brandMusic: "เพลงแบรนด์",
      brief: "บรีฟ",
      reference: "อ้างอิง",
      back: "กลับ",
      home: "หน้าแรก",
      briefTitle: "บรีฟลูกค้า",
      videoTitle: "วิดีโออ้างอิง",
      noLinks: "ยังไม่มีลิงก์สตรีมมิ่งสำหรับเพลงนี้"
    },
    zh: {
      composer: "词曲",
      musicProducer: "音乐制作人",
      partner: "合作伙伴",
      brandMusic: "品牌音乐",
      brief: "简介",
      reference: "参考",
      back: "返回",
      home: "首页",
      briefTitle: "客户简报",
      videoTitle: "参考视频",
      noLinks: "此歌曲尚未更新流媒体链接。"
    }
  };

  const bt = (key: string) => {
    const l = localDict[lang] || localDict['vi'];
    return l[key] || localDict['vi'][key] || key;
  };

  useEffect(() => {
    const getAdminTokenKey = () => getArtistExtensionFromUrl() ? `adminToken_${getArtistExtensionFromUrl()}` : 'adminToken';
    setIsAdmin(!!localStorage.getItem(getAdminTokenKey()));

    fetch('/api/public/artists')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPublicArtists(data);
        }
      })
      .catch(err => console.error("Error fetching artists:", err));
  }, []);

  const splitArtists = (singerStr: string) => {
    if (!singerStr) return [];
    let normalized = singerStr
      .replace(/\s+ft\.?\s+/gi, ', ')
      .replace(/\s+feat\.?\s+/gi, ', ')
      .replace(/\s+x\s+/gi, ', ')
      .replace(/\s+&\s+/gi, ', ')
      .replace(/\s+và\s+/gi, ', ');
    
    normalized = normalized.replace(/\((?:feat|ft)\.?\s*([^)]+)\)/gi, ', $1');
    return normalized.split(',').map(s => s.trim()).filter(Boolean);
  };

  const renderArtistLinks = (textVal: string, defaultVal: string = '') => {
    const rawStr = textVal || defaultVal;
    if (!rawStr) return null;
    const parts = splitArtists(rawStr);
    
    if (parts.length === 0) return <span>{rawStr}</span>;
    
    return (
      <span className="flex flex-wrap items-center justify-center gap-1">
        {parts.map((name, index) => {
          const matched = publicArtists.find(
            a => a.artistName.trim().toLowerCase() === name.trim().toLowerCase()
          );
          
          return (
            <React.Fragment key={name + index}>
              {index > 0 && <span className="text-white/60 mx-1">x</span>}
              {matched ? (
                <a 
                  href={`/${matched.extension}`}
                  className="hover:underline hover:text-white transition duration-200 cursor-pointer text-rose-400 hover:text-rose-300 font-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/${matched.extension}`;
                  }}
                >
                  {name}
                </a>
              ) : (
                <span>{name}</span>
              )}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  const shareUrl = window.location.origin + getArtistLink(`/song/${demo.slug || demo.id}`);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const links = [
    {
      id: 'spotify',
      name: 'Spotify',
      url: demo.linkSpotify,
      icon: (
        <motion.div animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0px 0px 0px rgba(29, 185, 84, 0))', 'drop-shadow(0px 0px 12px rgba(29, 185, 84, 0.8))', 'drop-shadow(0px 0px 0px rgba(29, 185, 84, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <SpotifyIcon className="w-6 h-6 text-[#1DB954]" />
        </motion.div>
      ),
      color: 'bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/30 text-emerald-300',
      description: 'Nghe nhạc chất lượng cao trên Spotify',
    },
    {
      id: 'apple',
      name: 'Apple Music',
      url: demo.linkApple,
      icon: (
        <motion.div animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0px 0px 0px rgba(252, 60, 68, 0))', 'drop-shadow(0px 0px 12px rgba(252, 60, 68, 0.8))', 'drop-shadow(0px 0px 0px rgba(252, 60, 68, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}>
          <AppleMusicIcon className="w-6 h-6" />
        </motion.div>
      ),
      color: 'bg-[#fc3c44]/10 hover:bg-[#fc3c44]/20 border border-[#fc3c44]/30 text-rose-300',
      description: 'Stream chính thức trên Apple Music',
    },
    {
      id: 'zing',
      name: 'Zing MP3',
      url: demo.linkZing,
      icon: (
        <motion.div animate={{ filter: ['drop-shadow(0px 0px 0px rgba(141, 68, 173, 0))', 'drop-shadow(0px 0px 12px rgba(141, 68, 173, 0.8))', 'drop-shadow(0px 0px 0px rgba(141, 68, 173, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}>
          <ZingIcon className="w-6 h-6" />
        </motion.div>
      ),
      color: 'bg-[#8d44ad]/10 hover:bg-[#8d44ad]/20 border border-[#8d44ad]/30 text-purple-300',
      description: 'Nghe nhạc trực tuyến tại Zing MP3',
    },
    {
      id: 'ytmusic',
      name: 'YouTube Music',
      url: demo.linkYoutubeMusic,
      icon: (
        <motion.div animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0px 0px 0px rgba(255, 0, 0, 0))', 'drop-shadow(0px 0px 12px rgba(255, 0, 0, 0.8))', 'drop-shadow(0px 0px 0px rgba(255, 0, 0, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1.5 }}>
          <YoutubeMusicIcon className="w-6 h-6" />
        </motion.div>
      ),
      color: 'bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000]',
      description: 'Nghe miễn phí trên YouTube Music',
    },
    {
      id: 'ytmv',
      name: 'YouTube MV',
      url: demo.linkYoutube,
      icon: (
        <motion.div animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0px 0px 0px rgba(255, 0, 0, 0))', 'drop-shadow(0px 0px 12px rgba(255, 0, 0, 0.8))', 'drop-shadow(0px 0px 0px rgba(255, 0, 0, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 2 }}>
          <YoutubeIcon className="w-6 h-6" />
        </motion.div>
      ),
      color: 'bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000]',
      description: 'Xem MV chính thức trên YouTube',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      url: demo.linkDrive,
      icon: (
        <motion.div animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0px 0px 0px rgba(255, 255, 255, 0))', 'drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.8))', 'drop-shadow(0px 0px 0px rgba(255, 255, 255, 0))'] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 2.5 }}>
          <Download className="w-6 h-6 text-white" />
        </motion.div>
      ),
      color: 'bg-white/10 hover:bg-white/20 border border-white/30 text-white',
      description: 'Tải nhạc gốc từ Google Drive',
    },
  ].filter(l => !!l.url);

  useEffect(() => {
    if (isStandalone && links.length === 1 && links[0].url) {
      window.location.replace(links[0].url);
    }
  }, [isStandalone, links]);

  const defaultImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';
  const [bgImage, setBgImage] = useState(demo.coverUrl || defaultImage);

  useEffect(() => {
    if (demo.coverUrl) {
      setBgImage(demo.coverUrl);
    }
  }, [demo.coverUrl]);

  // Background cover element
  const containerVariants = {

    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const content = (
    <div 
       className="relative min-h-[100dvh] text-white flex flex-col items-center px-4 py-8 sm:px-8 sm:py-16 sm:pt-24 sm:pb-12 select-none overflow-x-hidden"
       onClick={(e) => {
         if (e.target === e.currentTarget) {
            if (onClose) {
              onClose();
            } else if (isStandalone) {
              navigate(getArtistLink('/'));
            }
         }
       }}
    >
      {/* Blurred Album Artwork Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center filter blur-3xl opacity-60 scale-110 transition-all duration-1000 saturate-200"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />
      {/* Dark overlay to improve text readability */}
      <div className="absolute inset-0 z-0 bg-black/70" />
      
      {/* Dimmer overlay for click outside */}
      <div 
        className="absolute inset-0 z-[5] cursor-pointer" 
        onClick={() => {
           if (onClose) {
             onClose();
           } else if (isStandalone) {
             navigate(getArtistLink('/'));
           }
        }} 
      />

      {/* Floating Header Actions */}
      <div className="fixed top-6 mt-[env(safe-area-inset-top,0px)] left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between z-[50] pointer-events-auto">
        {onClose ? (
          <button 
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/90 hover:text-white transition-all text-sm font-semibold backdrop-blur-xl cursor-pointer hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4.5 sm:h-4.5" /> <span className="hidden sm:inline">{bt('back')}</span>
          </button>
        ) : isStandalone ? (
          <Link 
            to={getArtistLink('/')}
            className="flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white/90 hover:text-white transition-all text-sm font-semibold backdrop-blur-xl cursor-pointer hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4.5 sm:h-4.5" /> <span className="hidden sm:inline">{bt('home')}</span>
          </Link>
        ) : <div />}
      </div>

      {/* Card Body Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[390px] bg-stone-900/35 backdrop-blur-3xl border border-white/20 rounded-[32px] shadow-2xl flex flex-col items-center my-4 sm:my-auto overflow-hidden mx-4"
      >
        {/* Windows-like Header with title and compact Edit & Share actions */}
        <motion.div 
          variants={itemVariants}
          className={`relative w-full border-b border-white/10 px-5 py-3 flex items-center justify-between backdrop-blur-xl overflow-hidden ${demo.isBrand ? 'bg-transparent' : 'bg-white/5'}`}
        >
          {demo.isBrand && demo.brandLogoUrl && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black/40">
              <motion.img 
                src={demo.brandLogoUrl} 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.2] blur-2xl pointer-events-none" 
                alt="" 
                referrerPolicy="no-referrer"
                animate={{
                  scale: [1.1, 1.25, 1.1],
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          )}
          <div className="relative z-10 flex flex-col min-w-0 text-left">
            <h1 className="text-sm font-bold tracking-tight text-white drop-shadow-md truncate max-w-full">
              {demo.title}
            </h1>
            <p className="text-[11px] text-white/70 font-mono truncate max-w-full mt-0.5">
              {demo.singer || 'A.C Xuân Tài'}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 ml-2 flex-shrink-0">
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/90 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Chia sẻ liên kết"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Share2 className="w-4 h-4 text-rose-400" />
              )}
            </button>
          </div>
        </motion.div>

        <div className="w-full px-5 py-4 flex flex-col items-center">
          {/* Cover Art and Partner Badge Group */}
          <div className="relative flex flex-col items-center select-none flex-shrink-0 mb-4 w-full">
            <motion.div 
              variants={itemVariants}
              className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-10"
            >
              <motion.img 
                src={bgImage} 
                onError={() => setBgImage(defaultImage)}
                className="w-full h-full object-cover pointer-events-none" 
                alt={demo.title}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
              />
            </motion.div>

            {/* Partner Badge sitting precisely on the bottom border (axis of symmetry) */}
            {demo.isBrand && demo.brandName && (() => {
              const brandColors = useBrandLogoColors(demo.brandLogoUrl, demo.brandName, primaryColor);
              return (
                <div className="absolute bottom-0 translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl border shadow-md"
                    style={{
                      borderColor: brandColors.borderColor,
                      backgroundColor: brandColors.background, // solid, opaque color (high contrast)
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    {demo.brandLogoUrl && (
                      <div 
                        className="w-3.5 h-3.5 rounded-md overflow-hidden flex items-center justify-center p-0.5"
                        style={{ 
                          border: `1px solid ${brandColors.borderColor}`,
                          backgroundColor: brandColors.background === '#ffffff' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        <img src={demo.brandLogoUrl} className="w-full h-full object-contain" alt={demo.brandName} referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <span className="text-[9px] uppercase tracking-wider font-black flex items-center gap-1">
                      <span style={{ color: brandColors.secondary }}>{bt('partner')}:</span>
                      <span style={{ color: brandColors.primary }}>{demo.brandName}</span>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5" style={{ backgroundColor: brandColors.primary }}></span>
                  </motion.div>
                </div>
              );
            })()}
          </div>

          {/* Info & Brief Buttons */}
          <motion.div 
            variants={itemVariants}
            className="relative z-10 text-center mt-2.5 w-full flex flex-col items-center"
          >
            {demo.isBrand && (demo.brandBrief || (demo.brandReferenceVideos && demo.brandReferenceVideos.length > 0)) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                {demo.brandBrief && (
                  <button 
                    onClick={() => setShowBrandBrief(true)} 
                    className="px-2.5 py-1 rounded-full bg-indigo-500/90 hover:bg-indigo-600 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-[10px] font-bold whitespace-nowrap shadow-sm text-white" 
                    title={bt('briefTitle')}
                  >
                    <FileText className="w-3 h-3 mr-1" /> {bt('brief')}
                  </button>
                )}
                {demo.brandReferenceVideos && demo.brandReferenceVideos.length > 0 && (
                  <button 
                    onClick={() => setShowBrandVideos(true)} 
                    className="px-2.5 py-1 rounded-full bg-rose-500/90 hover:bg-rose-600 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-[10px] font-bold whitespace-nowrap shadow-sm text-white" 
                    title={bt('videoTitle')}
                  >
                    <Youtube className="w-3 h-3 mr-1" /> {bt('reference')}
                  </button>
                )}
              </div>
            )}

            {demo.composer && demo.composer !== (demo.singer || 'A.C Xuân Tài') && (
              <p className="text-[9px] sm:text-[11px] text-white/80 tracking-wide sm:tracking-widest font-mono uppercase drop-shadow-md flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
                 <span className="opacity-65 whitespace-nowrap">{bt('composer')}:</span>
                 <span className="flex items-center gap-1 flex-wrap justify-center">{renderArtistLinks(demo.composer)}</span>
              </p>
            )}

            {demo.musicProducer && (
              <p className="text-[9px] sm:text-[11px] text-white/80 tracking-wide sm:tracking-widest font-mono uppercase drop-shadow-md flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 mt-1 sm:mt-0.5">
                 <span className="opacity-65 whitespace-nowrap">{bt('musicProducer')}:</span>
                 <span className="flex items-center gap-1 flex-wrap justify-center">{renderArtistLinks(demo.musicProducer)}</span>
              </p>
            )}
          </motion.div>

          {/* Playlist/Streaming Service Options */}
          <motion.div 
            variants={itemVariants}
            className="mt-3.5 w-full space-y-2"
          >
          {links.length > 0 ? (
            links.map((link, idx) => (
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={`${link.id || ''}-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-2xl ${link.color} transition-all shadow-lg group font-medium cursor-pointer overflow-hidden relative`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <div className="flex items-center gap-3.5 w-full min-w-0 relative z-10">
                  <div className="p-2 rounded-xl bg-black/40 group-hover:bg-black/60 transition-colors shadow-inner drop-shadow-md flex items-center justify-center shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-bold tracking-tight">{link.name}</span>
                    <span className="text-[10px] text-white/50 leading-snug truncate mt-0.5">{link.description}</span>
                  </div>
                </div>
                <div className="p-1.5 bg-black/20 group-hover:bg-black/40 rounded-full transition-colors shrink-0 relative z-10">
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))
          ) : (
            <div className="text-center py-6 text-neutral-400 border border-white/5 bg-black/20 rounded-2xl backdrop-blur-sm text-xs">
              {bt('noLinks')}
            </div>
          )}
          </motion.div>
        </div>
      </motion.div>
      
       {/* Admin Edit Button */}
      {isAdmin && (
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="fixed bottom-6 right-6 z-50"
        >
           <Link 
             to={getAdminLink(`/edit/${demo.id}`)}
             className="flex items-center justify-center p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] backdrop-blur-md"
             title="Chỉnh sửa bài hát (Admin)"
           >
             <Edit3 className="w-5 h-5" />
           </Link>
        </motion.div>
      )}

      {/* Brand Popups */}
      <AnimatePresence>
        {showBrandBrief && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]" onClick={() => setShowBrandBrief(false)}>
            <div className="relative overflow-hidden bg-[#1c1917]/95 border border-white/20 p-6 rounded-3xl max-w-lg w-full text-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <motion.div 
                className="absolute inset-0 pointer-events-none z-0 opacity-45 blur-3xl rounded-3xl"
                style={{
                  background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`
                }}
                animate={{
                  opacity: [0.35, 0.65, 0.35],
                  scale: [0.95, 1.15, 0.95]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {demo.brandLogoUrl && (
                <>
                  <motion.img 
                    src={demo.brandLogoUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-2xl pointer-events-none z-0" 
                    alt="" 
                    referrerPolicy="no-referrer"
                    animate={{
                      scale: [1.4, 1.55, 1.4],
                      opacity: [0.10, 0.16, 0.10]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.img 
                    src={demo.brandLogoUrl} 
                    className="absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.35] blur-[0.5px] pointer-events-none z-0 animate-[spin_30s_linear_infinite]" 
                    alt="" 
                    referrerPolicy="no-referrer"
                    animate={{
                      y: [0, -4, 2, -3, 0],
                      x: [0, 2, -2, 1, 0],
                      rotate: [0, 5, -5, 3, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </>
              )}
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" /> {bt('briefTitle')}</h3>
                  <button onClick={() => setShowBrandBrief(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="text-sm text-stone-200 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1">{formatBriefText(demo.brandBrief)}</div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBrandVideos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]" onClick={() => setShowBrandVideos(false)}>
            <div className="relative overflow-hidden bg-[#1c1917]/95 border border-white/20 p-6 rounded-3xl max-w-2xl w-full text-white shadow-2xl" onClick={e => e.stopPropagation()}>
              <motion.div 
                className="absolute inset-0 pointer-events-none z-0 opacity-45 blur-3xl rounded-3xl"
                style={{
                  background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`
                }}
                animate={{
                  opacity: [0.35, 0.65, 0.35],
                  scale: [0.95, 1.15, 0.95]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {demo.brandLogoUrl && (
                <>
                  <motion.img 
                    src={demo.brandLogoUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.12] blur-2xl pointer-events-none z-0" 
                    alt="" 
                    referrerPolicy="no-referrer"
                    animate={{
                      scale: [1.4, 1.55, 1.4],
                      opacity: [0.10, 0.16, 0.10]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.img 
                    src={demo.brandLogoUrl} 
                    className="absolute -right-4 -bottom-4 w-28 h-28 opacity-[0.35] blur-[0.5px] pointer-events-none z-0" 
                    alt="" 
                    referrerPolicy="no-referrer"
                    animate={{
                      y: [0, -4, 2, -3, 0],
                      x: [0, 2, -2, 1, 0],
                      rotate: [0, 5, -5, 3, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </>
              )}
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Youtube className="w-5 h-5 text-rose-400" /> {bt('videoTitle')}</h3>
                  <button onClick={() => setShowBrandVideos(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                  {demo.brandReferenceVideos?.map((vid: string, idx: number) => {
                    const embedUrl = vid.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
                    return (
                      <div key={`l1044-idx-${idx}`} className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                        <iframe src={embedUrl} className="w-full h-full" allowFullScreen></iframe>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (onClose) {
    // Rendered inside modal/overlay context on top of homepage
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-black/60 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
        {content}
      </div>
    );
  }

  // Standalone page
  return content;
}
