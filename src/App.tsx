import { createPortal } from "react-dom";
import React, { useState, useEffect, useRef, createContext, useContext, useCallback, useMemo } from 'react';
import { ChorusLogo } from './components/ChorusLogo';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { UserCircle, BookOpen, User, Settings, Play, Pause, Music, Lock, Unlock, ArrowLeft, ArrowRight, Upload, Disc3, Plus, Trash2, Edit3, Globe, Camera, X, FileAudio, Share2, ListMusic, List, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Facebook, Instagram, Youtube, GripVertical, LogOut, ChevronRight, RefreshCw, Monitor, Home as HomeIcon, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, FileText, Sparkles, Copy, ExternalLink, Database, BadgeCheck, Search, Download, FolderDown, RotateCcw, Image, MessageSquare, Bell, Send, AlertCircle, AlertTriangle, CheckCircle, Info, Check, ChevronLeft, ChevronDown, Menu, Palette, LayoutTemplate, Award, History, HelpCircle, Paintbrush, CheckCircle2, XCircle, ShieldCheck, LogIn, Calendar } from 'lucide-react';
import { toPng } from 'html-to-image';
import { AppData, DemoSong, TemplateConfig, Achievement } from './types';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { IndirectBioCard } from './components/IndirectBioCard';
import { LoadingScreen } from './components/LoadingScreen';
import { getYoutubeId } from './components/SmartYouTubePlayer';
import RegisterModal from './components/RegisterModal';
import { getArtistSubdomainUrl, getPlatformDomain, ensureGoogleSdkLoaded } from './utils/platform';
import { formatShareUrl, getThumbUrl, handleImageError, isBasePlatformDomain, setGlobalCookie, getGlobalCookie, removeGlobalCookie, getArtistExtensionFromUrl, isArtistContext, getAdminLink, getArtistLink, getArtistFullUrl, sanitizePlaylistPassword, getAdminTokenKey, getMemberTokenKey, getArtistAdminRedirect, getLogoutRedirectUrl, getActiveAdminSession, getAdminToken, setAdminToken, removeAdminToken, getMemberToken, setMemberToken, removeMemberToken, copyToClipboard, resolveUploadUrl, getAudioPlayUrl } from './utils/shared';
import { translations, adminTranslations, useAdminTranslation, LanguageContext } from './i18n';
const woodBgAsset = '/wood-bg.jpg';


export function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

let _globalShowConfirm: any = null;
export const getGlobalShowConfirm = () => _globalShowConfirm;
export const setGlobalShowConfirm = (fn: any) => { _globalShowConfirm = fn; };

const brandColorCache: Record<string, { primary: string; secondary: string }> = {};

function useBrandColors(logoUrl: string | null | undefined, defaultColor: string | null | undefined) {
  const [colors, setColors] = useState<{ primary: string; secondary: string }>(() => {
    if (logoUrl && brandColorCache[logoUrl]) {
      return brandColorCache[logoUrl];
    }
    const pri = defaultColor || '#6366f1';
    return { primary: pri, secondary: '#a3a3a3' };
  });

  useEffect(() => {
    if (logoUrl && brandColorCache[logoUrl]) {
      setColors(brandColorCache[logoUrl]);
      return;
    }
    if (defaultColor) {
      setColors({ primary: defaultColor, secondary: '#a3a3a3' });
    }
  }, [defaultColor, logoUrl]);

  useEffect(() => {
    if (!logoUrl) return;
    if (brandColorCache[logoUrl]) return;
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;
        
        const counts: Record<string, { r: number; g: number; b: number; count: number }> = {};
        
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a < 50) continue;
          
          const isWhite = r > 240 && g > 240 && b > 240;
          const isBlack = r < 20 && g < 20 && b < 20;
          if (isWhite || isBlack) continue;
          
          const qr = Math.round(r / 15) * 15;
          const qg = Math.round(g / 15) * 15;
          const qb = Math.round(b / 15) * 15;
          const key = `${qr},${qg},${qb}`;
          
          if (!counts[key]) {
            counts[key] = { r, g, b, count: 0 };
          }
          counts[key].count++;
        }
        
        const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
        
        if (sorted.length > 0) {
          const primaryRGB = sorted[0];
          const formatHex = (r: number, g: number, b: number) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          };
          
          const adjustBrightness = (r: number, g: number, b: number) => {
            let rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
            let max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
            let l = (max + min) / 2;
            if (l < 0.45) {
              const scale = 0.55 / l;
              r = Math.min(255, Math.round(r * scale));
              g = Math.min(255, Math.round(g * scale));
              b = Math.min(255, Math.round(b * scale));
            }
            return { r, g, b };
          };
          
          const adjPrimary = adjustBrightness(primaryRGB.r, primaryRGB.g, primaryRGB.b);
          const primaryHex = formatHex(adjPrimary.r, adjPrimary.g, adjPrimary.b);
          
          let secondaryHex = defaultColor || '#a3a3a3';
          
          for (let i = 1; i < sorted.length; i++) {
            const sec = sorted[i];
            const dist = Math.sqrt(
              Math.pow(primaryRGB.r - sec.r, 2) +
              Math.pow(primaryRGB.g - sec.g, 2) +
              Math.pow(primaryRGB.b - sec.b, 2)
            );
            
            if (dist > 80) {
              const adjSec = adjustBrightness(sec.r, sec.g, sec.b);
              secondaryHex = formatHex(adjSec.r, adjSec.g, adjSec.b);
              break;
            }
          }
          
          if (secondaryHex === (defaultColor || '#a3a3a3') && defaultColor) {
            secondaryHex = defaultColor;
          } else if (secondaryHex === '#a3a3a3') {
            let rNorm = adjPrimary.r / 255, gNorm = adjPrimary.g / 255, bNorm = adjPrimary.b / 255;
            let max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
              }
              h /= 6;
            }
            
            h = (h + 0.166) % 1;
            if (l < 0.6) l = 0.65;
            if (s < 0.4) s = 0.7;
            
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1/6) return p + (q - p) * 6 * t;
              if (t < 1/2) return q;
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const rFinal = Math.round(hue2rgb(p, q, h + 1/3) * 255);
            const gFinal = Math.round(hue2rgb(p, q, h) * 255);
            const bFinal = Math.round(hue2rgb(p, q, h - 1/3) * 255);
            
            secondaryHex = formatHex(rFinal, gFinal, bFinal);
          }
          
          const result = { primary: primaryHex, secondary: secondaryHex };
          brandColorCache[logoUrl] = result;
          setColors(result);
        }
      } catch (e) {
        console.error("Error extracting brand colors", e);
      }
    };
  }, [logoUrl, defaultColor]);

  return colors;
}

function getLuminance(hex: string): number {
  if (!hex) return 0.5;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getBrandBadgeStyle(primaryColor: string, isGoldTheme?: boolean) {
  if (isGoldTheme) {
    return {
      backgroundColor: 'rgba(26, 19, 3, 0.95)',
      borderColor: 'rgba(212, 175, 55, 0.8)',
      labelColor: '#FBBF24',
      valueColor: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
      dotColor: '#D4AF37'
    };
  }
  const isColorLight = getLuminance(primaryColor) > 0.5;
  const backgroundColor = isColorLight ? 'rgba(15, 15, 15, 0.85)' : 'rgba(245, 245, 245, 0.9)';
  const borderColor = isColorLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const labelColor = isColorLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.75)';
  
  return {
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    labelColor: labelColor,
    valueColor: primaryColor,
    boxShadow: isColorLight ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
    dotColor: primaryColor
  };
}

interface BrandLogoColorExtractorProps {
  key?: React.Key;
  logoUrl: string | null | undefined;
  defaultColor: string | null | undefined;
  children: (colors: { primary: string; secondary: string }) => React.ReactNode;
}

function BrandLogoColorExtractor({ logoUrl, defaultColor, children }: BrandLogoColorExtractorProps) {
  const brandColors = useBrandColors(logoUrl, defaultColor);
  return <>{children(brandColors)}</>;
}

let globalPreviewAudio: HTMLAudioElement | null = null;
let globalActiveCardId: string | null = null;

const stopGlobalPreviewAudio = () => {
  if (globalPreviewAudio) {
    try {
      globalPreviewAudio.pause();
      globalPreviewAudio.currentTime = 0;
    } catch (e) {}
    globalPreviewAudio = null;
  }
  globalActiveCardId = null;
  window.dispatchEvent(new CustomEvent('crvn-stop-all-audio-previews', { detail: { currentId: null } }));
};

if (typeof window !== 'undefined') {
  window.addEventListener('mouseleave', stopGlobalPreviewAudio);
  
  // Pause all HTML5 audio elements when preview audio starts or stops
  window.addEventListener('crvn-stop-all-audio-previews', () => {
    const curPreview = globalPreviewAudio;
    document.querySelectorAll('audio').forEach(a => {
      if (a !== curPreview) {
        try { a.pause(); } catch(e) {}
      }
    });
  });
  
  // Autoplay unlocker listener to allow instant audio preview on first user interaction or mouse movement
  const unlockAudioContext = () => {
    try {
      const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      a.volume = 0;
      a.play().then(() => a.pause()).catch(() => {});
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    } catch (e) {}
    ['pointerdown', 'click', 'keydown', 'mousemove', 'mouseover', 'pointermove', 'mouseenter', 'touchstart', 'touchmove', 'wheel', 'scroll'].forEach(evt => {
      window.removeEventListener(evt, unlockAudioContext);
    });
  };
  ['pointerdown', 'click', 'keydown', 'mousemove', 'mouseover', 'pointermove', 'mouseenter', 'touchstart', 'touchmove', 'wheel', 'scroll'].forEach(evt => {
    window.addEventListener(evt, unlockAudioContext, { passive: true });
  });
}

interface DreamySongCardProps {
  key?: React.Key;
  demo: any;
  idx: number;
  activeListTab: string;
  getArtistLink: (subPath?: string, customPath?: string) => string;
  t: any;
  data: any;
  formatShareUrl: (url: string) => string;
  copyToClipboard: (text: string) => Promise<boolean>;
  setToast: (msg: string) => void;
  setActiveBioSong: (demo: any) => void;
}

function renderArtistNameWithBlur(text: string | null | undefined) {
  if (!text) return null;
  const str = String(text);
  const segments = str.split(/(\s*,\s*|\s*&\s*|\s+ft\.?\s+|\s+feat\.?\s+)/i);
  return (
    <>
      {segments.map((seg, idx) => {
        const isSecret = seg.toLowerCase().includes('secret') || seg.toLowerCase().includes('bí mật');
        if (isSecret) {
          return (
            <span
              key={idx}
              className="select-none filter blur-[4px] bg-stone-300/50 dark:bg-white/10 px-1 py-0.5 rounded border border-stone-400/20 inline-block mx-0.5 cursor-help"
              title="Nghệ sĩ bí mật"
            >
              {seg}
            </span>
          );
        }
        return <span key={idx}>{seg}</span>;
      })}
    </>
  );
}

function ArtistNameMarquee({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const cWidth = containerRef.current.clientWidth;
      const tWidth = textRef.current.scrollWidth;
      if (tWidth > cWidth) {
        setIsOverflowing(true);
        setTranslateX(tWidth - cWidth);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [text]);

  const animName = `artistMarqueeAnim_${Math.round(translateX)}`;

  return (
    <div ref={containerRef} className="w-full overflow-hidden select-none">
      {isOverflowing && (
        <style>{`
          @keyframes ${animName} {
            0%, 15% { transform: translateX(0px); }
            85%, 100% { transform: translateX(-${translateX}px); }
          }
        `}</style>
      )}
      <p 
        ref={textRef} 
        className={`${className || ''} whitespace-nowrap ${isOverflowing ? 'inline-block' : 'truncate'}`}
        style={isOverflowing ? {
          animation: `${animName} ${Math.max(4, translateX / 22)}s ease-in-out infinite alternate`
        } : undefined}
      >
        {renderArtistNameWithBlur(text)}
      </p>
    </div>
  );
}

function SongTitleMarquee({ title, themeHoverClass }: { title: string; themeHoverClass: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const checkOverflow = () => {
      animationFrameId = requestAnimationFrame(() => {
        if (containerRef.current && textRef.current) {
          const cWidth = containerRef.current.clientWidth;
          const tWidth = textRef.current.scrollWidth;
          if (tWidth > cWidth) {
            setIsOverflowing(true);
            setScrollAmount(tWidth - cWidth);
          } else {
            setIsOverflowing(false);
            setScrollAmount(0);
          }
        }
      });
    };

    checkOverflow();
    const timeout1 = setTimeout(checkOverflow, 300);
    const timeout2 = setTimeout(checkOverflow, 1000);

    let textObserver: ResizeObserver | null = null;
    let containerObserver: ResizeObserver | null = null;

    if (textRef.current) {
      textObserver = new ResizeObserver(checkOverflow);
      textObserver.observe(textRef.current);
    }
    if (containerRef.current) {
      containerObserver = new ResizeObserver(checkOverflow);
      containerObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      cancelAnimationFrame(animationFrameId);
      if (textObserver) textObserver.disconnect();
      if (containerObserver) containerObserver.disconnect();
    };
  }, [title]);

  const animName = `songTitlePingPongAnim_${Math.round(scrollAmount)}`;

  return (
    <div ref={containerRef} className="w-full overflow-hidden relative">
      {isOverflowing && (
        <style>{`
          @keyframes ${animName} {
            0%, 20% { transform: translateX(0px); }
            80%, 100% { transform: translateX(-${scrollAmount + 6}px); }
          }
        `}</style>
      )}
      <h3 
        ref={textRef} 
        className={`text-[13px] sm:text-[14.5px] font-extrabold text-stone-900 whitespace-nowrap transition-colors ${themeHoverClass} ${isOverflowing ? 'inline-block' : 'truncate'}`}
        style={isOverflowing ? {
          animation: `${animName} ${Math.max(4.5, scrollAmount / 18)}s ease-in-out infinite alternate`
        } : undefined}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}

function DreamySongCard({
  demo,
  idx,
  activeListTab,
  getArtistLink,
  t,
  data,
  formatShareUrl,
  copyToClipboard,
  setToast,
  setActiveBioSong,
  hasRowAchievement = true
}: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [mobilePopped, setMobilePopped] = useState(false);
  const mobilePoppedRef = useRef(false);
  const fadeIntervalRef = useRef<any>(null);
  const timerTimeoutRef = useRef<any>(null);

  const audioUrl = demo.audioUrl || demo.backupAudioUrl || demo.audio_url || '';

  const isTouchMobile = typeof window !== 'undefined' && (
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
    window.innerWidth < 768
  );

  const themePresets = [
    {
      cardBg: 'bg-gradient-to-b from-white via-rose-50/95 to-pink-100/95',
      strokeClass: 'stroke-pink-400 group-hover/card:stroke-pink-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(244,63,94,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(244,63,94,0.5)]',
      halo: 'bg-pink-400/80',
      yearText: 'text-pink-700 font-black',
      yearBorder: 'border-pink-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-[0_4px_14px_rgba(244,63,94,0.45)]',
      arcRim: 'rgba(244, 63, 94, 0.85)',
      hoverTitle: 'group-hover:text-rose-600'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-purple-50/95 to-indigo-100/95',
      strokeClass: 'stroke-purple-400 group-hover/card:stroke-purple-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(147,51,234,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(147,51,234,0.5)]',
      halo: 'bg-purple-400/80',
      yearText: 'text-purple-800 font-black',
      yearBorder: 'border-purple-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(147,51,234,0.45)]',
      arcRim: 'rgba(147, 51, 234, 0.85)',
      hoverTitle: 'group-hover:text-purple-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-amber-50/95 to-orange-100/95',
      strokeClass: 'stroke-amber-400 group-hover/card:stroke-amber-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(245,158,11,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(245,158,11,0.5)]',
      halo: 'bg-amber-400/80',
      yearText: 'text-amber-800 font-black',
      yearBorder: 'border-amber-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_4px_14px_rgba(245,158,11,0.45)]',
      arcRim: 'rgba(245, 158, 11, 0.85)',
      hoverTitle: 'group-hover:text-amber-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-sky-50/95 to-cyan-100/95',
      strokeClass: 'stroke-sky-400 group-hover/card:stroke-sky-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(14,165,233,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(14,165,233,0.5)]',
      halo: 'bg-sky-400/80',
      yearText: 'text-sky-800 font-black',
      yearBorder: 'border-sky-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 text-white shadow-[0_4px_14px_rgba(14,165,233,0.45)]',
      arcRim: 'rgba(14, 165, 233, 0.85)',
      hoverTitle: 'group-hover:text-sky-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-emerald-50/95 to-teal-100/95',
      strokeClass: 'stroke-emerald-400 group-hover/card:stroke-emerald-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(16,185,129,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(16,185,129,0.5)]',
      halo: 'bg-emerald-400/80',
      yearText: 'text-emerald-800 font-black',
      yearBorder: 'border-emerald-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      arcRim: 'rgba(16, 185, 129, 0.85)',
      hoverTitle: 'group-hover:text-emerald-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-fuchsia-50/95 to-pink-100/95',
      strokeClass: 'stroke-fuchsia-400 group-hover/card:stroke-fuchsia-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(217,70,239,0.32)] group-hover/card:drop-shadow-[0_22px_45px_rgba(217,70,239,0.5)]',
      halo: 'bg-fuchsia-400/80',
      yearText: 'text-fuchsia-800 font-black',
      yearBorder: 'border-fuchsia-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-600 text-white shadow-[0_4px_14px_rgba(217,70,239,0.45)]',
      arcRim: 'rgba(217, 70, 239, 0.85)',
      hoverTitle: 'group-hover:text-fuchsia-700'
    }
  ];

  const theme = themePresets[idx % themePresets.length];

  const isReleasedSong = activeListTab === 'released' || demo.isReleased === true || demo.isReleased === 'true' || demo.type === 'released' || !!(demo.linkYoutube || demo.linkSpotify || demo.linkApple || demo.linkZing || demo.linkYoutubeMusic);
  const isDemoSong = !isReleasedSong;

  const hasAchievementsArray = demo.achievements && Array.isArray(demo.achievements) && demo.achievements.length > 0;
  let achievementText = '';
  if (demo.achievement) {
    achievementText = String(demo.achievement);
  } else if (demo.achievements && typeof demo.achievements === 'string') {
    achievementText = String(demo.achievements);
  }

  const stopAudio = useCallback(() => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    fadeIntervalRef.current = null;
    timerTimeoutRef.current = null;

    if (globalActiveCardId === demo.id) {
      stopGlobalPreviewAudio();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setMobilePopped(false);
    mobilePoppedRef.current = false;
    setIsHovered(false);
  }, [demo.id]);

  const startAudioPreview = useCallback(() => {
    // Absolutely block preview for demo songs or when in demo tab
    if (activeListTab === 'demos' || isDemoSong) return;

    if (!audioUrl) return;

    setIsLoadingAudio(true);

    // Stop any existing global audio without resetting THIS card's mobilePopped state
    if (globalPreviewAudio) {
      try { globalPreviewAudio.pause(); globalPreviewAudio.currentTime = 0; } catch (e) {}
      globalPreviewAudio = null;
    }
    globalActiveCardId = demo.id;
    // Notify OTHER cards to reset (currentId = demo.id so THIS card's handler skips)
    window.dispatchEvent(new CustomEvent('crvn-stop-all-audio-previews', { detail: { currentId: demo.id } }));

    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    globalPreviewAudio = audio;

    audio.volume = 0;
    const playSnippet = () => {
      const duration = audio.duration || 180;
      const startTime = duration > 55 ? 48 : (duration > 20 ? 10 : 0);
      try { audio.currentTime = startTime; } catch (e) {}

      audio.play().then(() => {
        if (globalActiveCardId === demo.id && (isHoveredRef.current || mobilePoppedRef.current)) {
          setIsLoadingAudio(false);
          setIsPlaying(true);
          let vol = 0;
          const targetVol = 0.8;
          const fadeIn = setInterval(() => {
            if (vol < targetVol) {
              vol += 0.08;
              if (globalPreviewAudio === audio) audio.volume = Math.min(targetVol, vol);
            } else {
              if (globalPreviewAudio === audio) audio.volume = targetVol;
              clearInterval(fadeIn);
            }
          }, 100);
          fadeIntervalRef.current = fadeIn;

          timerTimeoutRef.current = setTimeout(() => {
            stopAudio();
          }, 28000);
        } else {
          audio.pause();
          setIsLoadingAudio(false);
        }
      }).catch(() => {
        // Autoplay blocked by browser policy prior to first user gesture.
        // Listen for first click/tap anywhere on page background to trigger preview audio immediately!
        try {
          const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
          a.volume = 0;
          a.play().then(() => a.pause()).catch(() => {});
        } catch (e) {}

        const playOnNextInteraction = () => {
          if (globalActiveCardId === demo.id && audio) {
            audio.play().then(() => {
              if (globalActiveCardId === demo.id) {
                setIsLoadingAudio(false);
                setIsPlaying(true);
                audio.volume = 0.8;
              }
            }).catch(() => {});
          }
          ['pointerdown', 'click', 'touchstart'].forEach(evt => {
            window.removeEventListener(evt, playOnNextInteraction, true);
          });
        };
        ['pointerdown', 'click', 'touchstart'].forEach(evt => {
          window.addEventListener(evt, playOnNextInteraction, { capture: true, once: true });
        });

        setIsPlaying(false);
        setIsLoadingAudio(false);
      });
    };

    if (audio.readyState >= 1) {
      playSnippet();
    } else {
      audio.onloadedmetadata = playSnippet;
      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlaying(false);
      };
      audio.load();
    }
  }, [audioUrl, demo.id, stopAudio]);

  const isHoveredRef = useRef(false);

  const handleMouseEnter = () => {
    if (isTouchMobile) return;
    isHoveredRef.current = true;
    setIsHovered(true);
    if (activeListTab === 'demos' || isDemoSong) return;
    if (audioUrl) {
      startAudioPreview();
    }
  };

  const handleMouseLeave = () => {
    if (isTouchMobile) return;
    isHoveredRef.current = false;
    setIsHovered(false);
    stopAudio();
  };

  // Global listener to immediately sync playing state across cards
  useEffect(() => {
    const handleStopOthers = (e: any) => {
      if (e.detail?.currentId !== demo.id) {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setMobilePopped(false);
        mobilePoppedRef.current = false;
      }
    };
    window.addEventListener('crvn-stop-all-audio-previews', handleStopOthers);
    return () => {
      window.removeEventListener('crvn-stop-all-audio-previews', handleStopOthers);
    };
  }, [demo.id]);

  const coverUrl = demo.thumbUrl || demo.coverUrl || demo.image || data?.slideshowImages?.[0] || data?.avatarUrl || '';
  const songYear = demo.releaseYear || demo.year || (demo.releaseDate ? new Date(demo.releaseDate).getFullYear() : '2024');

  // Safely extract achievement string
  const getAchievementText = (demoItem: any): string => {
    if (typeof demoItem.achievement === 'string' && demoItem.achievement.trim()) return demoItem.achievement.trim();
    if (typeof demoItem.award === 'string' && demoItem.award.trim()) return demoItem.award.trim();
    if (typeof demoItem.stats === 'string' && demoItem.stats.trim()) return demoItem.stats.trim();
    if (Array.isArray(demoItem.achievements) && demoItem.achievements.length > 0) {
      const first = demoItem.achievements[0];
      if (typeof first === 'string' && first.trim()) return first.trim();
      if (first && typeof first === 'object') {
        const type = (first.type || '').toLowerCase();
        const val = first.value || '';
        if (type === 'trending') return `TOP ${val} TRENDING`;
        if (type === 'views' || type === 'view') return `> ${val} VIEWS`;
        if (type === 'streams' || type === 'stream') return `> ${val} STREAMS`;
        if (val) return `${val}`;
      }
    }
    return '';
  };

  // (achievementText & hasAchievementsArray declared above)

  // Extract artist names for upper hemisphere of center label (max 3 lines, 1 artist per line)
  const rawArtistStr = demo.singer || demo.author || data?.artistName || '';
  const singersList = rawArtistStr
    .split(/,|\bft\.?\b|\bfeat\.?\b|&|\+/i)
    .map((s: string) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
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
      return;
    }
    // On mobile: first tap = preview (disc pops up), second tap = navigate
    if (isTouchMobile && !(activeListTab === 'demos' || isDemoSong)) {
      const alreadyElevated = mobilePoppedRef.current || isPlaying || isLoadingAudio;
      if (!alreadyElevated) {
        // First tap: prevent navigation, trigger preview
        e.preventDefault();
        mobilePoppedRef.current = true;
        setMobilePopped(true);
        startAudioPreview();
        return;
      }
      // Already elevated: stop audio then let navigation happen
      stopAudio();
    }
  };


  const targetLink = activeListTab === 'released' 
    ? getArtistLink(`/playlist/released?song=${demo.slug || demo.id}`) 
    : getArtistLink(`/song/${demo.slug || demo.id}`);

  const isElevated = isHovered || isPlaying || isLoadingAudio || mobilePopped;

  return (
    <div 
      className={`relative w-full group pt-14 sm:pt-24 select-none transition-all duration-300 ${isElevated ? 'z-[80]' : 'z-10 hover:z-[60]'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerLeave={handleMouseLeave}
    >
      {/* Halo Glow behind top of vinyl record */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 -top-1 sm:top-2 w-[85%] aspect-square rounded-full blur-2xl sm:blur-3xl pointer-events-none transition-all duration-700 ${isElevated ? 'opacity-90' : 'opacity-0 group-hover:opacity-60'} ${theme.halo}`} 
      />


      {/* Vinyl Record (BEHIND card sleeve - Clickable to pop up & preview) */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 top-1 sm:top-2 w-[78%] sm:w-[74%] aspect-square pointer-events-auto cursor-pointer transition-all duration-500 z-10 ${isElevated ? '-translate-y-10 sm:-translate-y-16' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeListTab === 'demos' || isDemoSong) return;
          if (isPlaying || mobilePopped || globalActiveCardId === demo.id) {
            stopAudio();
          } else {
            mobilePoppedRef.current = true;
            setMobilePopped(true);
            startAudioPreview();
          }
        }}
      >
        {/* Floating Top-Left PREVIEW / LOADING Badge */}
        {(isPlaying || isLoadingAudio || mobilePopped) && (
          <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-10 z-40 pointer-events-none">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isLoadingAudio ? 'bg-amber-600 border-amber-200/90' : 'bg-rose-600 border-rose-200/90'} text-white text-[8px] sm:text-[9px] font-black tracking-widest uppercase shadow-xl border animate-pulse`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {isLoadingAudio ? 'LOADING PREVIEW' : 'PREVIEW'}
            </span>
          </div>
        )}

        {/* Swirling Orbiting Light Beam ring around spinning vinyl disc */}
        {(isElevated || isPlaying) && (
          <>
            {/* Primary arc - clockwise */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute -inset-[8px] sm:-inset-[10px] rounded-full pointer-events-none z-30"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 40deg, rgba(244,63,94,0.8) 80deg, rgba(236,72,153,0.95) 130deg, rgba(168,85,247,0.8) 170deg, transparent 210deg, transparent 360deg)',
                WebkitMask: 'radial-gradient(circle, transparent calc(50% - 6px), black calc(50% - 4px))',
                mask: 'radial-gradient(circle, transparent calc(50% - 6px), black calc(50% - 4px))',
                filter: 'blur(3px)',
                opacity: 0.6
              }}
            />
            {/* Outer glow halo - soft */}
            <motion.div
              initial={{ rotate: 180 }}
              animate={{ rotate: -180 }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="absolute -inset-[12px] sm:-inset-[14px] rounded-full pointer-events-none z-[29]"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 120deg, rgba(251,207,232,0.5) 160deg, rgba(244,114,182,0.7) 200deg, rgba(236,72,153,0.5) 240deg, transparent 280deg, transparent 360deg)',
                WebkitMask: 'radial-gradient(circle, transparent calc(50% - 8px), black calc(50% - 5px))',
                mask: 'radial-gradient(circle, transparent calc(50% - 8px), black calc(50% - 5px))',
                filter: 'blur(6px)',
                opacity: 0.6
              }}
            />
          </>
        )}
        <div className={`w-full h-full rounded-full border-4 border-neutral-900/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden relative transition-all duration-500 transform ${
          isElevated ? 'scale-104 sm:scale-106 shadow-[0_20px_45px_rgba(0,0,0,0.45)]' : 'scale-100'
        }`}>
          {/* Shiny Glass Arc Reflection Overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 via-transparent to-black/50 pointer-events-none z-20" />

          {/* Rotating Vinyl Container */}
          <div className={`w-full h-full relative ${isTouchMobile ? 'animate-[spin_10s_linear_infinite]' : (isElevated ? 'animate-[spin_6s_linear_infinite]' : '')}`}>
            {/* Album Cover artwork as Vinyl disc face */}
            {coverUrl ? (
              <img 
                src={coverUrl} 
                className="w-full h-full object-cover rounded-full filter contrast-[1.05]" 
                alt={demo.title} 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 rounded-full" />
            )}

            {/* Vinyl Grooves Conic Shine Overlay */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none opacity-50 mix-blend-overlay z-10"
              style={{
                background: 'conic-gradient(from 0deg, rgba(255,255,255,0.45) 0deg, rgba(0,0,0,0.85) 90deg, rgba(255,255,255,0.45) 180deg, rgba(0,0,0,0.85) 270deg, rgba(255,255,255,0.45) 360deg)'
              }}
            />
            <div className="absolute inset-0 rounded-full border-[12px] sm:border-[14px] border-black/25 pointer-events-none z-10" />
            <div className="absolute inset-2 rounded-full border-[1px] border-white/15 pointer-events-none z-10" />
            <div className="absolute inset-6 rounded-full border-[1px] border-black/25 pointer-events-none z-10" />

            {/* Center Translucent Label Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-16 sm:h-16 bg-white/90 sm:bg-white/95 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex flex-col items-center justify-between py-1 px-0.5 text-center border sm:border-2 border-white z-20 overflow-hidden text-stone-950">
              {/* Upper Hemisphere: Artists (Hidden on Mobile, visible on PC) */}
              <div className="hidden sm:flex flex-col items-center justify-center min-h-0 w-full flex-1 pt-0.5 px-0.5">
                {singersList.length > 0 ? (
                  singersList.map((sName: string, sIdx: number) => {
                    const isSecret = sName.toLowerCase().includes("secret") || sName.toLowerCase().includes("bí mật");
                    const len = sName.length;
                    const fontClass = len > 14 ? 'text-[4px] sm:text-[5px] tracking-tighter' : len > 9 ? 'text-[4.5px] sm:text-[5.5px] tracking-tighter' : len > 7 ? 'text-[5.5px] sm:text-[6.5px] tracking-tight' : 'text-[6.5px] sm:text-[7.5px] tracking-normal';
                    return (
                      <span 
                        key={sIdx} 
                        className={`${fontClass} font-black uppercase text-stone-950 leading-[1.05] whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] ${isSecret ? 'filter blur-[3px] select-none inline-block' : ''}`}
                        title={isSecret ? "Nghệ sĩ bí mật" : sName}
                      >
                        {sName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[6.5px] sm:text-[7.5px] font-black uppercase text-stone-950 tracking-tight leading-[1.05] whitespace-nowrap overflow-hidden text-ellipsis w-full px-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)]">
                    ARTIST
                  </span>
                )}
              </div>

              {/* Spacer for dead-center spindle hole */}
              <div className="h-2 sm:h-4 shrink-0" />

              {/* Lower Hemisphere: Release Year (Hidden on Mobile, visible on PC) */}
              <div className="hidden sm:block w-full shrink-0 pb-0.5">
                <span className="text-[7px] sm:text-[8px] font-black text-stone-950 tracking-wider block leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                  {songYear}
                </span>
              </div>
            </div>

            {/* Realistic Center Spindle Hole */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-[1.5px] border-stone-900 bg-transparent shadow-[inset_0_1px_3px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.5)] z-30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* SVG ClipPath Definition for Concave Top Cutout Card Sleeve */}
      <svg className="w-0 h-0 absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="card-concave-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.18 C 0,0.06 0.03,0 0.08,0 L 0.12,0 C 0.24,0 0.30,0.18 0.5,0.18 C 0.70,0.18 0.76,0 0.88,0 L 0.92,0 C 0.97,0 1,0.06 1,0.18 L 1,0.82 C 1,0.94 0.97,1 0.92,1 L 0.08,1 C 0.03,1 0,0.94 0,0.82 Z" />
          </clipPath>
        </defs>
      </svg>



      {/* Outer Card Wrapper with Drop Shadow following the concave shape */}
      <div className={`relative w-full z-20 pointer-events-none transition-all duration-300 hover:-translate-y-2 group/card ${
        isElevated 
          ? 'drop-shadow-[0_0_35px_rgba(244,114,182,0.85)] drop-shadow-[0_0_60px_rgba(251,207,232,0.9)] scale-[1.02]' 
          : theme.dropShadow
      }`}>
        {/* Centered Year Badge at Bottom Edge of Card Sleeve (Photo 1) - Placed outside overflow-hidden with z-[90] */}
        <div className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
          <span className={`px-3.5 py-0.5 rounded-full text-[10px] sm:text-[11.5px] font-black shadow-md border ${theme.yearBorder} ${theme.yearText} bg-white/95 inline-flex items-center justify-center tracking-wider`}>
            {songYear}
          </span>
        </div>

        {/* Tilted RELEASED/DEMO Badge on Right Outer Shoulder */}
        <motion.div
          animate={{ 
            rotate: [14, 10, 18, 10, 14],
            scale: [1, 1.04, 0.96, 1.04, 1]
          }}
          transition={{ 
            duration: 4.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-2 -right-2 sm:top-2.5 sm:-right-3.5 z-50 select-none pointer-events-none"
        >
          <span className={`shadow-lg text-[8px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-md block border tracking-wider transform rotate-[10deg] ${
            isReleasedSong 
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-emerald-300/80 shadow-[0_4px_14px_rgba(16,185,129,0.6)]' 
              : demo.linkType === 'indirect' 
                ? 'bg-indigo-600 text-white border border-indigo-300/80 shadow-[0_4px_14px_rgba(79,70,229,0.6)]' 
                : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border border-rose-300/80 shadow-[0_4px_14px_rgba(225,29,72,0.6)]'
          }`}>
            {isReleasedSong ? (t.lReleasedMark || 'RELEASED') : (demo.linkType === 'indirect' ? 'Landing Page' : (t.lDemoMark || 'DEMO'))}
          </span>
        </motion.div>

        <Link
          to={targetLink}
          onClick={handleClick}
          className={`block w-full h-[145px] sm:h-[175px] flex flex-col justify-between pointer-events-auto ${theme.cardBg} backdrop-blur-2xl transition-all duration-300 relative pt-7.5 sm:pt-9 pb-4.5 px-4 sm:px-5 overflow-hidden`}
          style={{ clipPath: 'url(#card-concave-clip)', WebkitClipPath: 'url(#card-concave-clip)' }}
        >
          {/* SVG Curved Border Stroke following the exact concave path */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible" 
            viewBox="0 0 1 1" 
            preserveAspectRatio="none"
          >
            <path 
              d="M 0,0.18 C 0,0.06 0.03,0 0.08,0 L 0.12,0 C 0.24,0 0.30,0.18 0.5,0.18 C 0.70,0.18 0.76,0 0.88,0 L 0.92,0 C 0.97,0 1,0.06 1,0.18 L 1,0.82 C 1,0.94 0.97,1 0.92,1 L 0.08,1 C 0.03,1 0,0.94 0,0.82 Z" 
              fill="none" 
              className={`${isElevated ? 'stroke-rose-400 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]' : theme.strokeClass} transition-all duration-300`} 
              strokeWidth={isElevated ? "4" : "3"} 
              vectorEffect="non-scaling-stroke" 
            />
          </svg>

          {/* Light Gradient Sweeping Effect across card when playing */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-sweep" />
            </div>
          )}

          {/* Top Section: Achievement on Left */}
          <div className="flex items-center justify-between gap-1.5 w-full h-[28px] sm:h-[32px] mt-0.5 relative z-10 shrink-0">
            {hasAchievementsArray ? (
              <AchievementCycle achievements={demo.achievements} align="left" isLightBg={true} />
            ) : achievementText ? (
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} inline-flex items-center gap-1 shrink-0`}>
                <Award className="w-3 h-3 stroke-[2.5]" />
                {achievementText}
              </span>
            ) : null}
          </div>

          {/* Bottom Content Area */}
          <div className="flex items-end justify-between gap-3 relative z-10 shrink-0">
            {/* Left Column: Title (Marquee) & Artist */}
            <div className="flex-1 min-w-0 pr-1 flex flex-col justify-end">
              {/* Song Title with Immediate Marquee Effect for long titles */}
              <div className="h-[20px] sm:h-[24px] flex items-center">
                <SongTitleMarquee 
                  title={demo.title} 
                  themeHoverClass={theme.hoverTitle} 
                />
              </div>

              {/* Artist Name with Ping-Pong Marquee when overflowing */}
              <div className="h-[16px] sm:h-[18px] flex items-center mt-0.5">
                <ArtistNameMarquee 
                  text={rawArtistStr} 
                  className="text-xs font-semibold text-stone-500" 
                />
              </div>
            </div>

            {/* Right Column: Square Thumbnail Image (Hidden on Mobile only for max title/artist space, visible on PC md:block) */}
            <div className="hidden md:block w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-white/90 shadow-md group-hover/card:scale-105 transition-transform duration-500">
              {coverUrl ? (
                <img 
                  src={coverUrl} 
                  className="w-full h-full object-cover" 
                  alt={demo.title} 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                  <Music className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function MusicianWallFrames({
  data,
  setWallLightboxImg,
  t
}: {
  data: any;
  setWallLightboxImg: (img: string) => void;
  t: (key: string) => string;
}) {
  const [orientations, setOrientations] = useState<Record<string, 'landscape' | 'portrait'>>({});
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});
  const [swayAngle, setSwayAngle] = useState(0);
  const lastYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const swayTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const dy = currentY - lastYRef.current;
      lastYRef.current = currentY;

      // Calculate sway amplitude based on scroll velocity (-3.5 to +3.5 deg)
      const sway = Math.max(-3.5, Math.min(3.5, dy * 0.12));
      setSwayAngle(sway);

      if (swayTimerRef.current) clearTimeout(swayTimerRef.current);
      swayTimerRef.current = setTimeout(() => {
        setSwayAngle(0); // Decays back to 0deg (resting straight vertically)
      }, 160);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (swayTimerRef.current) clearTimeout(swayTimerRef.current);
    };
  }, []);

  // ONLY use slideshowImages uploaded in "Ảnh nền trang chủ ( Chọn nhiều ảnh để chạy slideshow )"
  const wallImages: string[] = useMemo(() => {
    const imgs: string[] = [];
    if (data?.slideshowImages && Array.isArray(data.slideshowImages) && data.slideshowImages.length > 0) {
      data.slideshowImages.forEach((img: string) => {
        if (img && typeof img === 'string' && !imgs.includes(img) && !failedImgs[img]) {
          imgs.push(img);
        }
      });
    }
    // Do not show default wall frames if artist has not uploaded slideshow images
    return imgs;
  }, [data?.slideshowImages, failedImgs]);

  const handleImgLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const isLandscape = img.naturalWidth > img.naturalHeight;
      setOrientations(prev => {
        if (prev[url] === (isLandscape ? 'landscape' : 'portrait')) return prev;
        return { ...prev, [url]: isLandscape ? 'landscape' : 'portrait' };
      });
    }
  };

  const handleImgError = (url: string) => {
    setFailedImgs(prev => ({ ...prev, [url]: true }));
  };

  const positions = [
    { top: '150px', left: '0.5%', right: 'auto', border: 'border-[#3B1D0E]', bgMat: 'bg-[#FBF9F5]' },
    { top: '340px', left: 'auto', right: '0.5%', border: 'border-[#482411]', bgMat: 'bg-[#FDFCF9]' },
    { top: '700px', left: '0.5%', right: 'auto', border: 'border-[#2A1308]', bgMat: 'bg-[#F5F2EB]' },
    { top: '1050px', left: 'auto', right: '0.5%', border: 'border-[#3B1D0E]', bgMat: 'bg-[#FBF9F5]' },
    { top: '1450px', left: '0.5%', right: 'auto', border: 'border-[#482411]', bgMat: 'bg-[#FDFCF9]' },
    { top: '1850px', left: 'auto', right: '0.5%', border: 'border-[#2A1308]', bgMat: 'bg-[#F5F2EB]' },
  ];

  if (wallImages.length === 0) return null;

  return (
    <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {wallImages.map((imgUrl: string, idx: number) => {
        const pos = positions[idx % positions.length];
        const orient = orientations[imgUrl] || 'portrait';
        const isLandscape = orient === 'landscape';

        // Orientation-specific dimensions for PC and Mobile:
        // Horizontal: aspect 4:3 (landscape)
        // Vertical: aspect 3:4 (portrait)
        const frameClass = isLandscape
          ? 'w-[75px] h-[58px] sm:w-[190px] sm:h-[135px] lg:w-[245px] lg:h-[175px]'
          : 'w-[58px] h-[75px] sm:w-[135px] sm:h-[190px] lg:w-[175px] lg:h-[245px]';

        const frameSway = idx % 2 === 0 ? swayAngle : -swayAngle;

        return (
          <div
            key={`musician-wall-frame-${idx}`}
            className="absolute pointer-events-auto group/wallframe transition-transform duration-300 ease-out hover:scale-105 z-[1] hover:z-30 opacity-85 sm:opacity-95 hover:opacity-100 cursor-pointer"
            style={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: `rotate(${frameSway}deg)`,
              transformOrigin: '50% 0%', // Anchored at top nail for realistic pendulum sway!
            }}
            onClick={() => setWallLightboxImg(imgUrl)}
            title={t("Bấm để xem ảnh khổ lớn") || "Bấm để xem ảnh khổ lớn"}
          >
            {/* Wall Brass Nail (hidden on mobile to merge with the song card's brass bolt above into 1 dot) */}
            <div className="hidden sm:flex absolute -top-3 sm:-top-5 left-1/2 -translate-x-1/2 w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-gradient-to-br from-amber-100 via-amber-400 to-amber-900 border border-amber-200/90 shadow-md z-20 items-center justify-center">
              <div className="w-0.5 sm:w-1 h-0.5 bg-amber-950/90 rotate-45" />
            </div>

            {/* Hanging String V-Shape - Attaches directly to the shelf bolt on mobile */}
            <svg className="absolute -top-4 sm:-top-5 left-0 right-0 h-4 sm:h-5 w-full overflow-visible pointer-events-none z-10">
              <line x1="50%" y1="0" x2="15%" y2="14" stroke="rgba(245,215,160,0.75)" strokeWidth="1.2" />
              <line x1="50%" y1="0" x2="85%" y2="14" stroke="rgba(245,215,160,0.75)" strokeWidth="1.2" />
            </svg>

            {/* Outer Wooden Picture Frame */}
            <div className={`relative ${frameClass} rounded-md p-1 sm:p-2 lg:p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] border-[4px] sm:border-[7px] lg:border-[9px] ${pos.border} ${pos.bgMat} transition-all duration-300 group-hover/wallframe:shadow-[0_20px_45px_rgba(0,0,0,0.95)]`}>
              {/* Inner Picture Mat Border */}
              <div className="w-full h-full rounded-[2px] border border-stone-300/70 shadow-inner overflow-hidden relative">
                <img 
                  src={imgUrl} 
                  alt={`Khung ảnh ${idx + 1}`} 
                  onLoad={(e) => handleImgLoad(imgUrl, e)}
                  onError={() => handleImgError(imgUrl)}
                  className="w-full h-full object-cover filter brightness-[0.94] contrast-[1.06] group-hover/wallframe:brightness-100 group-hover/wallframe:scale-105 transition-all duration-700" 
                  referrerPolicy="no-referrer"
                />
                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/12 to-white/0 pointer-events-none" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const getDeterministicCount = (title: string, platform: 'spotify' | 'youtube') => {
  const hash = Array.from(title || '').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  if (platform === 'spotify') {
    const list = ['> 10M Lượt nghe', '> 18M Lượt nghe', '> 5.6M Lượt nghe', '> 22M Lượt nghe', '> 8.3M Lượt nghe'];
    return list[hash % list.length];
  } else {
    const list = ['> 410K Lượt xem', '> 413K Lượt xem', '> 2.1M Lượt xem', '> 950K Lượt xem', '> 1.2M Lượt xem'];
    return list[hash % list.length];
  }
};

function MusicianSongCard({
  demo,
  idx,
  activeListTab,
  getArtistLink,
  t,
  data,
  formatShareUrl,
  copyToClipboard,
  setToast,
  setActiveBioSong
}: DreamySongCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [mobilePopped, setMobilePopped] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const fadeIntervalRef = useRef<any>(null);
  const timerTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const audioUrl = demo.audioUrl || demo.backupAudioUrl || demo.audio_url || '';
  const getSongCoverUrl = (songUrlOrObj?: string | any, thumbUrl?: string) => {
    if (typeof songUrlOrObj === 'object' && songUrlOrObj !== null) {
      return songUrlOrObj.thumbUrl || songUrlOrObj.coverUrl || songUrlOrObj.imageUrl || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
    }
    return thumbUrl || songUrlOrObj || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
  };

  const isTouchMobile = typeof window !== 'undefined' && (
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
    window.innerWidth < 768
  );

  const themePresets = [
    {
      cardBg: 'bg-gradient-to-b from-white via-rose-50/95 to-pink-100/95',
      strokeClass: 'stroke-pink-400 group-hover/card:stroke-pink-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(244,63,94,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(244,63,94,0.5)]',
      halo: 'bg-pink-400/80',
      yearText: 'text-pink-700 font-black',
      yearBorder: 'border-pink-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-rose-600'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-purple-50/95 to-indigo-100/95',
      strokeClass: 'stroke-purple-400 group-hover/card:stroke-purple-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(147,51,234,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(147,51,234,0.5)]',
      halo: 'bg-purple-400/80',
      yearText: 'text-purple-800 font-black',
      yearBorder: 'border-purple-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-purple-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-amber-50/95 to-orange-100/95',
      strokeClass: 'stroke-amber-400 group-hover/card:stroke-amber-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(245,158,11,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(245,158,11,0.5)]',
      halo: 'bg-amber-400/80',
      yearText: 'text-amber-800 font-black',
      yearBorder: 'border-amber-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-amber-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-sky-50/95 to-cyan-100/95',
      strokeClass: 'stroke-sky-400 group-hover/card:stroke-sky-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(14,165,233,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(14,165,233,0.5)]',
      halo: 'bg-sky-400/80',
      yearText: 'text-sky-800 font-black',
      yearBorder: 'border-sky-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-sky-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-emerald-50/95 to-teal-100/95',
      strokeClass: 'stroke-emerald-400 group-hover/card:stroke-emerald-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(16,185,129,0.5)]',
      halo: 'bg-emerald-400/80',
      yearText: 'text-emerald-800 font-black',
      yearBorder: 'border-emerald-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-emerald-700'
    },
    {
      cardBg: 'bg-gradient-to-b from-white via-fuchsia-50/95 to-pink-100/95',
      strokeClass: 'stroke-fuchsia-400 group-hover/card:stroke-fuchsia-500',
      dropShadow: 'drop-shadow-[0_15px_30px_rgba(217,70,239,0.35)] group-hover/card:drop-shadow-[0_22px_45px_rgba(217,70,239,0.5)]',
      halo: 'bg-fuchsia-400/80',
      yearText: 'text-fuchsia-800 font-black',
      yearBorder: 'border-fuchsia-300/90 bg-white/90 shadow-xs',
      badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)]',
      hoverTitle: 'group-hover:text-fuchsia-700'
    }
  ];

  const theme = themePresets[idx % themePresets.length];

  const isReleasedSong = activeListTab === 'released' || demo.isReleased === true || demo.isReleased === 'true' || demo.type === 'released' || !!(demo.linkYoutube || demo.linkSpotify || demo.linkApple || demo.linkZing || demo.linkYoutubeMusic);
  const isDemoSong = !isReleasedSong;

  const activeAchievements = useMemo(() => {
    if (demo.achievements && Array.isArray(demo.achievements) && demo.achievements.length > 0) {
      return demo.achievements;
    }
    const list: any[] = [];
    if (demo.spotifyListens || demo.spListens || demo.streamsCount) {
      list.push({ type: 'spotify_streams', value: demo.spotifyListens || demo.spListens || demo.streamsCount });
    }
    if (demo.youtubeViews || demo.ytViews || demo.viewsCount || demo.views) {
      list.push({ type: 'youtube_views', value: demo.youtubeViews || demo.ytViews || demo.viewsCount || demo.views });
    }
    if (demo.achievement) {
      const valStr = String(demo.achievement).replace('> ', '').replace(' Lượt xem', '').replace(' Lượt nghe', '');
      if (String(demo.achievement).toLowerCase().includes('spotify')) {
        list.push({ type: 'spotify_streams', value: valStr });
      } else {
        list.push({ type: 'youtube_views', value: valStr });
      }
    }
    return list.length > 0 ? list : null;
  }, [demo.achievements, demo.achievement, demo.spotifyListens, demo.spListens, demo.streamsCount, demo.youtubeViews, demo.ytViews, demo.viewsCount, demo.views]);

  const hasAchievementsArray = demo.achievements && Array.isArray(demo.achievements) && demo.achievements.length > 0;
  let achievementText = '';
  if (demo.achievement) {
    achievementText = String(demo.achievement);
  } else if (demo.achievements && typeof demo.achievements === 'string') {
    achievementText = String(demo.achievements);
  }

  const stopAudio = useCallback(() => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    fadeIntervalRef.current = null;
    timerTimeoutRef.current = null;

    if (globalActiveCardId === demo.id) {
      stopGlobalPreviewAudio();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setMobilePopped(false);
  }, [demo.id]);

  const startAudioPreview = useCallback(() => {
    if (activeListTab === 'demos' || isDemoSong) return;
    if (!audioUrl) return;

    stopGlobalPreviewAudio();
    globalActiveCardId = demo.id;

    const audio = new Audio(audioUrl);
    globalPreviewAudio = audio;
    audio.volume = 0;
    setIsLoadingAudio(true);

    const playSnippet = () => {
      if (globalActiveCardId !== demo.id) return;
      const duration = audio.duration || 180;
      const startTime = duration > 55 ? 48 : (duration > 20 ? 10 : 0);
      try { audio.currentTime = startTime; } catch (e) {}
      audio.play().then(() => {
        if (globalActiveCardId === demo.id) {
          setIsLoadingAudio(false);
          setIsPlaying(true);
          const targetVol = 0.8;
          let currentVol = 0;
          const fadeIn = setInterval(() => {
            currentVol += 0.1;
            if (currentVol >= targetVol) {
              if (globalPreviewAudio === audio) audio.volume = targetVol;
              clearInterval(fadeIn);
            } else {
              if (globalPreviewAudio === audio) audio.volume = Math.min(targetVol, currentVol);
            }
          }, 60);
          fadeIntervalRef.current = fadeIn;

          timerTimeoutRef.current = setTimeout(() => {
            stopAudio();
          }, 28000);
        } else {
          audio.pause();
          setIsLoadingAudio(false);
        }
      }).catch(() => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      });
    };

    if (audio.readyState >= 1) {
      playSnippet();
    } else {
      audio.onloadedmetadata = playSnippet;
      audio.onerror = () => {
        setIsLoadingAudio(false);
        setIsPlaying(false);
      };
      audio.load();
    }
  }, [audioUrl, demo.id, isDemoSong, stopAudio]);

  const handleMouseEnter = () => {
    if (isTouchMobile) return;
    setIsHovered(true);
    if (activeListTab === 'demos' || isDemoSong) return;
    if (audioUrl) {
      startAudioPreview();
    }
  };

  const handleMouseLeave = () => {
    if (isTouchMobile) return;
    setIsHovered(false);
    stopAudio();
  };

  useEffect(() => {
    const handleStopOthers = (e: any) => {
      if (e.detail?.currentId !== demo.id) {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setMobilePopped(false);
      }
    };
    window.addEventListener('crvn-stop-all-audio-previews', handleStopOthers);
    return () => {
      window.removeEventListener('crvn-stop-all-audio-previews', handleStopOthers);
    };
  }, [demo.id]);

  let songYear = demo.releaseYear || demo.year || demo.release_year || '';
  if (!songYear && demo.releaseDate) {
    songYear = String(demo.releaseDate).substring(0, 4);
  } else if (!songYear && demo.created_at) {
    songYear = String(demo.created_at).substring(0, 4);
  }
  if (!songYear) songYear = '2025';

  let rawArtistStr = demo.singers || demo.singer || demo.artist || data?.artistName || 'Nghệ Sĩ';
  const singersList = String(rawArtistStr).split(/,\s*|\s+&\s+|\s+ft\.?\s+|\s+feat\.?\s+/i).filter(Boolean);

  let coverUrl = demo.thumbUrl || getSongCoverUrl(demo.coverUrl) || getSongCoverUrl(demo.cover_url) || getSongCoverUrl(demo.image) || '';
  if (!coverUrl && data?.slideshowImages && data.slideshowImages.length > 0) {
    const hash = Array.from(String(demo.id || demo.title || 'song')).reduce((sum: number, char: any) => sum + char.charCodeAt(0), 0);
    coverUrl = data.slideshowImages[hash % data.slideshowImages.length];
  }

  const targetLink = isReleasedSong 
    ? getArtistLink(`/playlist/released?song=${demo.slug || demo.id}`)
    : getArtistLink(`/song/${demo.slug || demo.id}`);

  const handleClick = (e: React.MouseEvent) => {
    if (demo.linkType === 'indirect') {
      e.preventDefault();
      const indirectLinks = [
        demo.linkSpotify, 
        demo.linkApple, 
        demo.linkZing, 
        demo.linkYoutubeMusic, 
        demo.linkYoutube, 
        demo.linkSoundcloud, 
        demo.linkTiktok
      ].filter(Boolean);
      
      if (indirectLinks.length > 0) {
        window.open(indirectLinks[0], '_blank');
      } else {
        setActiveBioSong(demo);
      }
    }
  };

  const isElevated = isHovered || isPlaying || isLoadingAudio || mobilePopped;
  const hasAch = activeAchievements && activeAchievements.length > 0;

  return (
    <div 
      className={`relative w-full group select-none overflow-visible pt-9 sm:pt-14 transition-all duration-300 ${isElevated ? 'z-40' : 'z-10'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerLeave={handleMouseLeave}
    >
      {/* Golden spotlight glow on hover */}
      <div 
        className={`absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-amber-400/45 via-yellow-300/50 to-amber-400/45 blur-2xl pointer-events-none transition-all duration-400 ${isElevated ? 'opacity-100 scale-102' : 'opacity-0 scale-95'}`} 
      />

      {/* ── FLOATING ACHIEVEMENT BADGE (Positioned floating above card sleeve, zIndex 40) ── */}
      {hasAch && (
        <motion.div 
          animate={{ 
            y: [0, -1.5, 0, 1.5, 0],
            rotate: [0, -0.3, 0, 0.3, 0]
          }}
          transition={{ 
            duration: 5.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ zIndex: 8 }}
          className="absolute -top-19 sm:-top-19.5 left-1/2 -translate-x-1/2 shrink-0 w-auto min-w-[140px] sm:min-w-[170px] max-w-[90%] sm:max-w-[240px] h-8.5 sm:h-10.5 px-3 sm:px-4 py-1 rounded-xl bg-[#180e08]/95 border border-amber-500/50 shadow-[0_4px_18px_rgba(0,0,0,0.85),0_0_12px_rgba(245,158,11,0.3)] backdrop-blur-md flex items-center justify-center overflow-hidden pointer-events-none"
        >
          {/* Glowing radial background animation */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.25),transparent_70%)] animate-pulse pointer-events-none rounded-2xl" />
          
          {/* Light sweep animation */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-12 pointer-events-none rounded-2xl overflow-hidden"
          />
          
          {/* Achievement cycle text & icon */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <AchievementCycle achievements={activeAchievements} align="center" isLightBg={false} prefix="mus-badge" />
          </div>
        </motion.div>
      )}

      {/* ── WOODEN CRATE CONTAINER (overflow-visible so cover rises above crate top with ZERO clipping) ── */}
      <div 
        className="relative w-full rounded-xl overflow-visible cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activeListTab === 'demos' || isDemoSong) return;
          if (isPlaying || mobilePopped || globalActiveCardId === demo.id || isHovered) {
            stopAudio();
          } else {
            stopGlobalPreviewAudio();
            setMobilePopped(true);
            startAudioPreview();
          }
        }}
      >
        {/* ── BACK WOODEN WALL (z-0: interior of the wooden crate) ── */}
        <div 
          className="absolute inset-0 rounded-xl z-0"
          style={{
            background: `
              linear-gradient(104deg,
                #3A1804 0%, #52240A 8%, #3A1804 15%,
                #451D06 22%, #52240A 28%, #3A1804 35%,
                #451D06 42%, #52240A 48%, #3A1804 55%,
                #451D06 62%, #52240A 68%, #3A1804 75%,
                #451D06 82%, #52240A 88%, #3A1804 100%
              )
            `,
            border: isElevated ? '2.5px solid rgba(251,191,36,0.9)' : '2.5px solid rgba(160,100,30,0.7)',
            boxShadow: isElevated 
              ? '0 0 25px rgba(251,191,36,0.65), 0 0 8px rgba(251,191,36,0.85), 0 20px 45px rgba(0,0,0,0.9)' 
              : 'inset 0 4px 12px rgba(0,0,0,0.85), 0 18px 40px rgba(0,0,0,0.85)',
            filter: isElevated ? 'brightness(1.22) contrast(1.08)' : 'brightness(0.95)',
            transition: 'all 0.4s ease',
          }}
        />

        {/* ── SLOT INNER SIDE SHADOWS (z-5) ── */}
        <div className="absolute inset-y-0 left-0 w-6 z-[5] pointer-events-none rounded-l-xl"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-6 z-[5] pointer-events-none rounded-r-xl"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)' }} />

        {/* ── TOP SLOT AREA (height 175px) ── */}
        <div className="relative w-full h-[55px] sm:h-[80px] overflow-visible">

          {/* ── HUGE BLACK VINYL DISC (z-10: peaks out slightly behind cover before hover, pops up smoothly on hover) ── */}
          <motion.div
            className="absolute z-10 pointer-events-none left-[5%] w-[90%] aspect-square"
            animate={{
              bottom: isElevated ? (isDesktop ? 46 : 36) : (isDesktop ? -55 : -40),
              scale: isElevated ? 1.0 : (isDesktop ? 0.74 : 0.90),
              y: (isElevated && isPlaying) ? [0, -3, 0] : 0,
            }}
            transition={{
              bottom: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 0.45, ease: "easeOut" },
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div
              className={`w-full h-full rounded-full relative ${isElevated ? 'animate-[spin_4s_linear_infinite]' : ''}`}
              style={{
                background: 'radial-gradient(circle at 30% 30%, #444 0%, #1c1c1c 45%, #080808 100%)',
                boxShadow: '0 14px 40px rgba(0,0,0,0.95), inset 0 2px 5px rgba(255,255,255,0.15)',
              }}
            >
              {/* Groove rings — concentric circles for realistic vinyl */}
              {[10,18,26,34,42,49,56,62,67].map((r) => (
                <div key={r} className="absolute inset-0 rounded-full pointer-events-none" style={{
                  border: `1px solid rgba(255,255,255,0.06)`,
                  margin: `${r}%`,
                }} />
              ))}
              {/* High-contrast dual specular sheen wedges (clearly visible spin motion!) */}
              <div className="absolute inset-0 rounded-full pointer-events-none mix-blend-screen opacity-90"
                style={{
                  background: 'conic-gradient(from 30deg, rgba(255,255,255,0.28) 0deg, transparent 45deg, transparent 135deg, rgba(255,255,255,0.24) 180deg, transparent 225deg, transparent 315deg, rgba(255,255,255,0.28) 360deg)',
                }}
              />
              {/* Silver light arcs on vinyl surface */}
              <div className="absolute inset-3 rounded-full border-r-2 border-l-2 border-white/30 pointer-events-none opacity-60" />
              {/* Center label — amber/brown vintage style with spinning notch indicator */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center overflow-hidden"
                style={{
                  width: '48px', height: '48px',
                  background: 'radial-gradient(circle at 40% 35%, #e5aa4c, #9E6C15 60%, #6E460B)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.8)',
                  border: '2px solid rgba(255,200,90,0.6)',
                }}
              >
                {/* Visual spinning notch dot */}
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs border border-amber-900" />
                <span className="text-[6px] font-black uppercase tracking-widest text-amber-100 text-center leading-tight px-0.5 overflow-hidden mt-1" style={{ maxWidth: '44px' }}>
                  {(singersList[0] || '').substring(0,10)}
                </span>
                <span className="text-[5.5px] text-amber-200 font-bold">{songYear}</span>
              </div>
            </div>
          </motion.div>

          {/* ── HUMONGOUS ALBUM COVER IMAGE (z-20: elevated high before hover & lifts gently on hover) ── */}
          <motion.div
            className="absolute z-20 left-[4%] w-[92%] aspect-square"
            style={{
              transformOrigin: 'center bottom',
            }}
            animate={{
              bottom: isElevated ? -6 : (isDesktop ? -36 : -22),
              scale: isElevated ? 1.0 : (isDesktop ? 0.74 : 0.90),
              y: (isElevated && isPlaying) ? [0, -3, 0] : 0,
            }}
            transition={{
              bottom: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 0.45, ease: "easeOut" },
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* ── PREVIEW Indicator Badge (Top-Left corner of Cover) ── */}
            {(isPlaying || isLoadingAudio) && (
              <div className="absolute top-0.5 -left-3.5 z-40 pointer-events-none">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isLoadingAudio ? 'bg-amber-600' : 'bg-rose-600'} text-white text-[8px] font-black tracking-widest uppercase shadow-xl border border-white/40 animate-pulse`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {isLoadingAudio ? 'LOADING' : 'PREVIEW'}
                </span>
              </div>
            )}

            {/* ── RELEASED/DEMO Tilted Badge (Top-Right corner of Cover, lifts together on hover!) ── */}
            <motion.div
              animate={{ rotate: [14, 10, 18, 10, 14], scale: [1, 1.04, 0.96, 1.04, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1 -right-3.5 sm:-right-4.5 z-40 select-none pointer-events-none"
            >
              <span className={`shadow-xl text-[7px] sm:text-[9.5px] font-black px-2.5 py-0.5 rounded-md block border tracking-wider transform rotate-[12deg] ${
                isReleasedSong 
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-emerald-300/80 shadow-[0_6px_16px_rgba(16,185,129,0.6)]' 
                  : demo.linkType === 'indirect' 
                    ? 'bg-indigo-600 text-white border border-indigo-300/80 shadow-[0_6px_16px_rgba(79,70,229,0.6)]' 
                    : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border border-rose-300/80 shadow-[0_6px_16px_rgba(225,29,72,0.6)]'
              }`}>
                {isReleasedSong ? (t.lReleasedMark || 'RELEASED') : (demo.linkType === 'indirect' ? 'Landing Page' : (t.lDemoMark || 'DEMO'))}
              </span>
            </motion.div>

            <div
              className="w-full h-full rounded-[4px] overflow-hidden relative p-[2.5px] bg-[#121212]/85 border border-white/40 flex flex-row items-stretch shadow-2xl"
              style={{
                boxShadow: isElevated
                  ? '0 24px 45px rgba(0,0,0,0.92), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.8)'
                  : '0 12px 25px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.7)',
                transition: 'box-shadow 0.45s ease',
              }}
            >
              {/* Clear Plastic DVD Hinge/Spine on Left Side (Photo 1 style) */}
              <div className="w-3.5 sm:w-4.5 shrink-0 rounded-l-[3px] bg-gradient-to-r from-white/40 via-black/50 to-black/70 border-r border-white/25 flex flex-col justify-between py-1 relative z-10 -mr-[1px] pointer-events-none">
                <div className="w-2.5 h-1.5 bg-white/30 border-r border-b border-white/50 rounded-br-xs shadow-xs" />
                <div className="w-[1.5px] h-3/4 mx-auto bg-gradient-to-b from-white/45 via-white/10 to-white/45 shadow-[0_0_2px_rgba(255,255,255,0.6)]" />
                <div className="w-2.5 h-1.5 bg-white/30 border-r border-t border-white/50 rounded-tr-xs shadow-xs" />
              </div>

              {/* 1:1 Square Album Cover Image Sleeve */}
              <div className="flex-1 aspect-square rounded-r-[3px] overflow-hidden relative border border-white/20 shadow-inner">
                {coverUrl ? (
                  <img src={coverUrl} className="w-full h-full object-cover" alt={demo.title} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-950">
                    <Music className="w-10 h-10 text-amber-700/60" />
                  </div>
                )}
                {/* Realistic Plastic Gloss Glare Sweep across CD Front Cover */}
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-45"
                  style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 35%, transparent 60%, rgba(255,255,255,0.25) 100%)' }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FRONT FACE PANEL (z-30: covers bottom half of crate & album cover, creating slot pocket) ── */}
        <div className="relative z-30 w-full rounded-b-xl overflow-visible shadow-2xl"
          style={{ borderTop: '3px solid rgba(120,65,15,0.8)' }}>

          <Link
            to={targetLink}
            onClick={handleClick}
            className="block w-full relative pt-3 pb-2.5 px-2.5 sm:pt-3 sm:pb-3 sm:px-4"
            style={{
              background: isElevated 
                ? 'linear-gradient(to bottom, #FFF7DC, #FCE8B3)' 
                : 'linear-gradient(to bottom, rgba(240,212,158,0.98), rgba(220,186,120,0.99))',
              boxShadow: isElevated ? 'inset 0 0 20px rgba(255,255,255,0.8)' : 'none',
            }}
          >
            {/* Shimmer when playing */}
            {isPlaying && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent animate-shimmer-sweep" />
              </div>
            )}

            {/* Title & Artist on Left + Mini Thumbnail on Right */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <SongTitleMarquee 
                  title={demo.title} 
                  themeHoverClass="group-hover:text-amber-950" 
                />
                <ArtistNameMarquee 
                  text={rawArtistStr} 
                  className="text-[10px] sm:text-xs font-semibold text-amber-900/75 mt-0.5" 
                />
              </div>

              {/* Mini square thumbnail (desktop only) */}
              <div className="hidden sm:block sm:w-14 sm:h-14 shrink-0 rounded-lg overflow-hidden shadow-md"
                style={{ border: '2px solid rgba(130,75,18,0.45)' }}>
                {coverUrl ? (
                  <img src={coverUrl} className="w-full h-full object-cover" alt={demo.title} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-900/30">
                    <Music className="w-5 h-5 text-amber-700" />
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* ── SHELF LEDGE at bottom ── */}
          <div 
            className="w-full h-5.5 sm:h-6.5 relative flex items-center justify-between px-2 sm:px-3 overflow-hidden"
            style={{
              background: 'linear-gradient(104deg, #241003 0%, #3B1B09 15%, #241003 30%, #301404 45%, #241003 60%, #3B1B09 75%, #241003 90%)',
              borderTop: '1.5px solid rgba(140,85,25,0.65)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.9), inset 0 1px 3px rgba(255,180,60,0.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/40 pointer-events-none" />
            {/* Brass screw left */}
            <div className="w-2.5 h-2.5 rounded-full relative z-10 flex items-center justify-center shrink-0"
              style={{ background: 'radial-gradient(circle at 35% 35%, #f5d98b, #c47a15 55%, #7a4a05)', border: '1px solid rgba(220,170,60,0.5)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              <div className="w-1.5 h-[1.5px] rounded-full bg-amber-900/70 rotate-45" />
            </div>

            {/* Center year badge on shelf ledge (Mobile & PC) */}
            <div className="flex-1 mx-2 relative z-10 flex items-center justify-center">
              <span className="px-3 py-0.5 rounded-full text-[9px] sm:text-[10.5px] font-black border border-amber-400/40 text-amber-200 bg-amber-950/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.7)] tracking-wider">
                {songYear}
              </span>
            </div>

            {/* Brass screw right */}
            <div className="w-2.5 h-2.5 rounded-full relative z-10 flex items-center justify-center shrink-0"
              style={{ background: 'radial-gradient(circle at 35% 35%, #f5d98b, #c47a15 55%, #7a4a05)', border: '1px solid rgba(220,170,60,0.5)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              <div className="w-1.5 h-[1.5px] rounded-full bg-amber-900/70 -rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function MarqueeText({ children, text, to, className }: { children?: React.ReactNode, text?: string, to?: string, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0);

  const content = children || text;

  useEffect(() => {
    let animationFrameId: number;
    
    const checkOverflow = () => {
      // Use requestAnimationFrame to ensure layout is calculated
      animationFrameId = requestAnimationFrame(() => {
        if (containerRef.current && textRef.current) {
          const cWidth = containerRef.current.clientWidth;
          const tWidth = textRef.current.scrollWidth;
          
          if (tWidth > cWidth) {
            setIsOverflowing(true);
            setScrollAmount(tWidth - cWidth);
          } else {
            setIsOverflowing(false);
            setScrollAmount(0);
          }
        }
      });
    };

    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 300);
    const timeoutId2 = setTimeout(checkOverflow, 1000);
    
    let textObserver: ResizeObserver | null = null;
    let containerObserver: ResizeObserver | null = null;

    if (textRef.current) {
      textObserver = new ResizeObserver(checkOverflow);
      textObserver.observe(textRef.current);
    }
    
    if (containerRef.current) {
       containerObserver = new ResizeObserver(checkOverflow);
       containerObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      cancelAnimationFrame(animationFrameId);
      if (textObserver) textObserver.disconnect();
      if (containerObserver) containerObserver.disconnect();
    };
  }, [content]);

  const inner = (
    <div ref={containerRef} className={`w-full overflow-hidden flex items-center ${(!isOverflowing && (className?.includes('justify-center') || className?.includes('text-center'))) ? 'justify-center' : 'justify-start'} ${className || ''}`}>
      {isOverflowing ? (
        <motion.div
          className="whitespace-nowrap inline-flex items-center shrink-0 w-max pr-8"
          animate={{ x: [0, -scrollAmount - 32, 0] }}
          transition={{ duration: Math.max(scrollAmount * 0.03, 3), ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
        >
          <div ref={textRef} className="inline-flex items-center">
            {content}
          </div>
        </motion.div>
      ) : (
        <div ref={textRef} className={`whitespace-nowrap inline-flex items-center shrink-0 w-max max-w-full ${className?.includes('justify-center') || className?.includes('text-center') ? 'justify-center' : 'justify-start'}`}>
          {content}
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block w-full min-w-0">{inner}</Link>;
  }
  return inner;
}

export const MarqueeTitle = MarqueeText;

function formatText(text: string | null | undefined, disableLinks = false, isGold = true, bgMode: 'light' | 'red' | 'dark' | boolean = 'dark', prefix = '') {
  if (!text) return null;
  
  const effectiveBgMode: 'light' | 'red' | 'dark' = typeof bgMode === 'string' 
    ? bgMode 
    : (bgMode === true ? 'light' : 'dark');

  const textClean = String(text).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  // Split by parenthesis segments e.g. "Song Name ( OST Movie )" -> ["Song Name", "( OST Movie )"]
  const parts = text.split(/(\([^)]+\))/g);
  return (
    <>
      {parts.map((part, idx) => {
        const trimmedPart = part.trim();
        if (!trimmedPart) return null;

        if (trimmedPart.startsWith('(') && trimmedPart.endsWith(')')) {
          const innerContent = trimmedPart.slice(1, -1).trim();
          // Skip badge formatting for short single/double character parenthesized text like (s), (S), (1)
          if (innerContent.length > 2) {
            let badgeStyle = '';
            if (effectiveBgMode === 'light' || isGold) {
              badgeStyle = 'font-bold text-[#5C3E14] bg-[#F5E6B8] border border-[#D4AF37]/60 shadow-2xs';
            } else if (effectiveBgMode === 'red') {
              badgeStyle = 'font-bold text-white bg-black/50 border border-white/60 shadow-xs';
            } else {
              badgeStyle = 'font-bold text-amber-100 bg-neutral-900/80 border border-amber-400/40 shadow-xs';
            }

            return (
              <span 
                key={`ft-p-${prefix}-${textClean}-${idx}`} 
                className={`inline-block text-[7px] sm:text-[9.5px] max-w-full truncate align-middle my-0.5 leading-tight tracking-normal px-2 py-0.5 rounded-full ${badgeStyle}`}
              >
                {trimmedPart}
              </span>
            );
          }
        }
        
        // Normal text segment
        const cleanedPart = idx > 0 && !parts[idx-1].startsWith('(') ? part.trimStart() : part.trim();
        const lines = cleanedPart.split('\n');
        return (
          <React.Fragment key={`ft-n-${prefix}-${textClean}-${idx}`}>
            {lines.map((line, lineIdx) => {
              const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
              return (
                <React.Fragment key={`ft-l-${prefix}-${textClean}-${idx}-${lineIdx}`}>
                  {lineIdx > 0 && <br />}
                  {segments.map((segment, segIdx) => {
                    const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
                    if (isSeparator) {
                      return <span key={`ft-s-${prefix}-${textClean}-${idx}-${lineIdx}-${segIdx}`}>{segment}</span>;
                    }
                    
                    const isSecret = segment.toLowerCase().includes("secret");
                    if (isSecret) {
                      return (
                        <span 
                          key={`ft-sec-${prefix}-${textClean}-${idx}-${lineIdx}-${segIdx}`}
                          className="select-none filter blur-[4.5px] cursor-help inline-block bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5" 
                          title="Nghệ sĩ bí mật"
                        >
                          {segment}
                        </span>
                      );
                    }
                    
                    return <span key={`ft-text-${prefix}-${textClean}-${idx}-${lineIdx}-${segIdx}`}>{segment}</span>;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

function renderArtistNameWithLinks(text: string | null | undefined, systemArtists: any[]) {
  if (!text) return null;
  const textClean = String(text).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const lines = text.replace(/\s+\(/g, '\n(').split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = line.split(/(\s*,\s*|\s*&\s*)/g);
        return (
          <React.Fragment key={`ranwl-l-${textClean}-${lineIdx}`}>
            {lineIdx > 0 && <br />}
            {segments.map((segment, segIdx) => {
              const isSeparator = /^(\s*,\s*|\s*&\s*)$/.test(segment);
              if (isSeparator) {
                return <span key={`ranwl-sep-${textClean}-${lineIdx}-${segIdx}`}>{segment}</span>;
              }
              
              const isSecret = segment.toLowerCase().includes("secret");
              if (isSecret) {
                return (
                  <span 
                    key={`ranwl-sec-${textClean}-${lineIdx}-${segIdx}`}
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
                const href = getArtistSubdomainUrl(matchedArtist.extension, matchedArtist);
                const isExternal = true;

                if (isExternal) {
                  return (
                    <a 
                      key={`l418-art-l${lineIdx}-s${segIdx}`}
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
                      key={`l430-art-l${lineIdx}-s${segIdx}`}
                      to={href}
                      className="artist-link-cool cursor-pointer text-inherit inline-flex items-baseline"
                    >
                      {segment}
                    </Link>
                  );
                }
              }

              return <span key={`l440-art-l${lineIdx}-s${segIdx}`}>{segment}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

// Global styles added in index.css

// [CODE-SPLIT] translations, adminTranslations, useAdminTranslation, LanguageContext moved to src/i18n.ts

// Thumbnail fallback handled server-side now
// [CODE-SPLIT] getThumbUrl and handleImageError moved to src/utils/shared.ts

// ---- GLOBAL MULTI-ARTIST INTERCEPTORS ----
// [CODE-SPLIT] isBasePlatformDomain through removeMemberToken moved to src/utils/shared.ts
// [CODE-SPLIT] Functions isBasePlatformDomain through removeMemberToken deleted — see src/utils/shared.ts


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
        
        let hasArtistHeader = false;
        if (Array.isArray(init.headers)) {
          hasArtistHeader = init.headers.some(([k]) => k.toLowerCase() === 'x-artist-extension');
        } else if (init.headers instanceof Headers) {
          hasArtistHeader = init.headers.has('x-artist-extension');
        } else {
          hasArtistHeader = !!(init.headers as any)['x-artist-extension'] || !!(init.headers as any)['X-Artist-Extension'];
        }

        if (!hasArtistHeader) {
          if (Array.isArray(init.headers)) {
            init.headers.push(['x-artist-extension', ext]);
          } else if (init.headers instanceof Headers) {
            init.headers.set('x-artist-extension', ext);
          } else {
            (init.headers as any)['x-artist-extension'] = ext;
          }
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

// Patch localStorage to separate session credentials per artist, while bypassing global synced keys
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
  if (key && (key.includes('adminToken') || key.includes('activeAdmin') || key.includes('memberToken'))) {
    if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) {
      return null;
    }
  }
  const isGlobalKey = !key || key === 'masterToken' || 
                      key.includes('adminToken') || 
                      key.includes('activeAdmin') || 
                      key.includes('memberToken') ||
                      key === 'preferredLang' ||
                      key === 'manualLangSelected';
  if (isGlobalKey) {
    return originalGetItem.call(this, key);
  }
  const ext = getArtistExtensionFromUrl();
  if (ext) {
    return originalGetItem.call(this, `${ext}_${key}`);
  }
  return originalGetItem.call(this, key);
};

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key && (key.includes('adminToken') || key.includes('activeAdmin') || key.includes('memberToken'))) {
    if (typeof window !== 'undefined' && (window as any).__IS_LOGGED_OUT__) {
      return;
    }
  }

  const isGlobalKey = !key || key === 'masterToken' || 
                      key.includes('adminToken') || 
                      key.includes('activeAdmin') || 
                      key.includes('memberToken') ||
                      key === 'preferredLang' ||
                      key === 'manualLangSelected';
                      
  if (key && (key.includes('adminToken') || key.includes('activeAdmin'))) {
    setGlobalCookie(key, value);
  }

  if (isGlobalKey) {
    return originalSetItem.call(this, key, value);
  }

  const ext = getArtistExtensionFromUrl();
  if (ext) {
    if (key.includes('adminToken') || key.includes('activeAdmin')) {
      setGlobalCookie(`${ext}_${key}`, value);
    }
    return originalSetItem.call(this, `${ext}_${key}`, value);
  }
  return originalSetItem.call(this, key, value);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  const isGlobalKey = !key || key === 'masterToken' || 
                      key.includes('adminToken') || 
                      key.includes('activeAdmin') || 
                      key.includes('memberToken') ||
                      key === 'preferredLang' ||
                      key === 'manualLangSelected';
                      
  if (key && (key.includes('adminToken') || key.includes('activeAdmin'))) {
    removeGlobalCookie(key);
  }

  if (isGlobalKey) {
    return originalRemoveItem.call(this, key);
  }

  const ext = getArtistExtensionFromUrl();
  if (ext) {
    if (key.includes('adminToken') || key.includes('activeAdmin')) {
      removeGlobalCookie(`${ext}_${key}`);
    }
    return originalRemoveItem.call(this, `${ext}_${key}`);
  }
  return originalRemoveItem.call(this, key);
};

// Expose original localStorage methods and session functions globally for robust sync
(window as any).__originalGetItem__ = originalGetItem;
(window as any).__originalSetItem__ = originalSetItem;
(window as any).__originalRemoveItem__ = originalRemoveItem;

// Multi-Tab SSO BroadcastChannel initialization (2-Way Login/Logout sync)
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    const ssoChannel = new BroadcastChannel('chorus_sso_channel');
    ssoChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'LOGOUT_ALL') {
        const wasAlreadyLoggedOut = !!(window as any).__IS_LOGGED_OUT__;
        (window as any).__IS_LOGGED_OUT__ = true;
        const origRemove = (window as any).__originalRemoveItem__ || localStorage.removeItem;
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k && (k.includes('adminToken') || k.includes('activeAdmin') || k.includes('memberToken'))) {
            origRemove.call(localStorage, k);
          }
        });
        removeGlobalCookie('adminToken');
        removeGlobalCookie('activeAdminExtension');
        removeGlobalCookie('activeAdminName');
        removeGlobalCookie('activeAdminAvatar');
        removeGlobalCookie('activeAdminActivated');
        removeGlobalCookie('memberToken');

        if (typeof document !== 'undefined' && document.cookie) {
          document.cookie.split(';').forEach(c => {
            const k = c.split('=')[0].trim();
            if (k && (k.includes('adminToken') || k.includes('activeAdmin') || k.includes('memberToken'))) {
              removeGlobalCookie(k);
            }
          });
        }

        if (!wasAlreadyLoggedOut) {
          try {
            window.dispatchEvent(new CustomEvent('sso-toast', {
              detail: {
                type: 'logout',
                title: 'Đã Đăng Xuất',
                message: 'Đã đăng xuất'
              }
            }));
          } catch (e) {}
          window.dispatchEvent(new Event('admin-session-change'));
          window.dispatchEvent(new Event('storage'));
        }
      } else if (event.data && event.data.type === 'LOGIN_ALL') {
        delete (window as any).__IS_LOGGED_OUT__;
        const { token, extension, artistName, avatar, activated, isSilent } = event.data;
        if (token && extension) {
          const origSet = (window as any).__originalSetItem__ || localStorage.setItem;
          origSet.call(localStorage, 'adminToken', token);
          origSet.call(localStorage, `adminToken_${extension}`, token);
          origSet.call(localStorage, 'activeAdminExtension', extension);
          origSet.call(localStorage, 'activeAdminName', artistName || extension);
          origSet.call(localStorage, 'activeAdminAvatar', avatar || '');
          origSet.call(localStorage, 'activeAdminActivated', activated !== false ? 'true' : 'false');
          
          setGlobalCookie('adminToken', token);
          setGlobalCookie(`adminToken_${extension}`, token);
          setGlobalCookie('activeAdminExtension', extension);
          setGlobalCookie('activeAdminName', artistName || extension);
          setGlobalCookie('activeAdminAvatar', avatar || '');
          setGlobalCookie('activeAdminActivated', activated !== false ? 'true' : 'false');

          if (!isSilent) {
            try {
              window.dispatchEvent(new CustomEvent('sso-toast', {
                detail: {
                  type: 'login',
                  title: 'Đăng Nhập Thành Công',
                  message: `Chào mừng ${artistName || extension} trải nghiệm Chorus`
                }
              }));
            } catch (e) {}
          }

          window.dispatchEvent(new Event('admin-session-change'));
          window.dispatchEvent(new Event('storage'));
        }
      }
    };
  } catch (e) {}
}

(window as any).clearAllSessions = async (showToast: boolean = false) => {
  const wasAlreadyLoggedOut = !!(window as any).__IS_LOGGED_OUT__;
  (window as any).__IS_LOGGED_OUT__ = true;

  // 1. Broadcast LOGOUT_ALL to all other open tabs/subdomains immediately
  if (!wasAlreadyLoggedOut && typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('chorus_sso_channel');
      bc.postMessage({ type: 'LOGOUT_ALL' });
      bc.close();
    } catch (e) {}
  }

  // 2. Purge all localStorage keys on this tab
  const origRemove = (window as any).__originalRemoveItem__ || localStorage.removeItem;
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (
      key.includes('adminToken') || 
      key.includes('activeAdmin') || 
      key.includes('memberToken')
    ) {
      origRemove.call(localStorage, key);
      removeGlobalCookie(key);
    }
  });
  
  removeGlobalCookie('adminToken');
  removeGlobalCookie('activeAdminExtension');
  removeGlobalCookie('activeAdminName');
  removeGlobalCookie('activeAdminAvatar');
  removeGlobalCookie('activeAdminActivated');
  removeGlobalCookie('memberToken');

  if (typeof document !== 'undefined' && document.cookie) {
    document.cookie.split(';').forEach(c => {
      const k = c.split('=')[0].trim();
      if (k && (k.includes('adminToken') || k.includes('activeAdmin') || k.includes('memberToken'))) {
        removeGlobalCookie(k);
      }
    });
  }

  // 3. Notify client components
  if (showToast && !wasAlreadyLoggedOut) {
    try {
      window.dispatchEvent(new CustomEvent('sso-toast', {
        detail: {
          type: 'logout',
          title: 'Đã Đăng Xuất',
          message: 'Đã đăng xuất thành công! Hẹn gặp lại bạn.'
        }
      }));
    } catch (e) {}
  }
  if (!wasAlreadyLoggedOut) {
    window.dispatchEvent(new Event('admin-session-change'));
    window.dispatchEvent(new Event('storage'));
  }
  
  // 4. Call server logout to issue HTTP Set-Cookie deletion headers across .chorus.vn
  try {
    await Promise.all([
      fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }),
      fetch('/api/member/logout', { method: 'POST', credentials: 'include' })
    ]);
  } catch (e) {}
};

(window as any).syncLoginSession = (token: string, extension: string, artistName: string, avatar: string, activated?: boolean) => {
  delete (window as any).__IS_LOGGED_OUT__;

  // Broadcast LOGIN_ALL to all other open tabs/subdomains immediately
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel('chorus_sso_channel');
      bc.postMessage({ type: 'LOGIN_ALL', token, extension, artistName, avatar, activated });
      bc.close();
    } catch (e) {}
  }

  // Save globally in un-prefixed space
  originalSetItem.call(localStorage, 'adminToken', token);
  originalSetItem.call(localStorage, `adminToken_${extension}`, token);
  originalSetItem.call(localStorage, 'activeAdminExtension', extension);
  originalSetItem.call(localStorage, 'activeAdminName', artistName);
  originalSetItem.call(localStorage, 'activeAdminAvatar', avatar);
  originalSetItem.call(localStorage, 'activeAdminActivated', activated !== false ? 'true' : 'false');
  
  setGlobalCookie('adminToken', token);
  setGlobalCookie(`adminToken_${extension}`, token);
  setGlobalCookie('activeAdminExtension', extension);
  setGlobalCookie('activeAdminName', artistName);
  setGlobalCookie('activeAdminAvatar', avatar);
  setGlobalCookie('activeAdminActivated', activated !== false ? 'true' : 'false');

  // Save in prefixed space for that artist extension to bypass separation patch
  originalSetItem.call(localStorage, `${extension}_adminToken`, token);
  originalSetItem.call(localStorage, `${extension}_adminToken_${extension}`, token);
  originalSetItem.call(localStorage, `${extension}_activeAdminExtension`, extension);
  originalSetItem.call(localStorage, `${extension}_activeAdminName`, artistName);
  originalSetItem.call(localStorage, `${extension}_activeAdminAvatar`, avatar);
  originalSetItem.call(localStorage, `${extension}_activeAdminActivated`, activated !== false ? 'true' : 'false');

  window.dispatchEvent(new Event('admin-session-change'));
  window.dispatchEvent(new Event('storage'));
};

import { formatFileName, compressImageInBrowser, compressImageToJPG, uploadGlobal } from './utils/adminUtils';
// [CODE-SPLIT] formatFileName, compressImageInBrowser, compressImageToJPG, uploadGlobal moved to src/utils/adminUtils.ts

const ACPControlPanel = React.lazy(() => import('./components/ACPControlPanel'));
const ChorusVNLanding = React.lazy(() => import('./components/ChorusVNLanding'));
const ExploreFeatures = React.lazy(() => import('./components/ExploreFeatures'));
const HelpPage = React.lazy(() => import('./components/HelpPage'));
const AdminDashboard = React.lazy(() => import('./AdminModule').then(m => ({ default: m.AdminDashboard })));
const AdminCreateDemo = React.lazy(() => import('./AdminModule').then(m => ({ default: m.AdminCreateDemo })));
const AdminEditDemo = React.lazy(() => import('./AdminModule').then(m => ({ default: m.AdminEditDemo })));
const AdminPlaylistEdit = React.lazy(() => import('./AdminModule').then(m => ({ default: m.AdminPlaylistEdit })));

// ---- ADMIN LOGIN & REQUIRE ADMIN ----

export const PasswordInput = (props: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative w-full">
      <input
        {...props}
        type={show ? "text" : "password"}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none flex items-center justify-center z-10"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

function AdminLogin() {
  const { t } = useAdminTranslation();
  const ext = getArtistExtensionFromUrl();
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [unregisteredEmail, setUnregisteredEmail] = useState('');
  const [isGoogleVerifiedState, setIsGoogleVerifiedState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sysFavicon, setSysFavicon] = useState<string>('');

  useEffect(() => {
    fetch('/api/public/landing-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.faviconUrl) {
          setSysFavicon(data.faviconUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenRegisterModal = (emailToUse?: string, isGoogle?: boolean) => {
    const emailParam = emailToUse ? `&email=${encodeURIComponent(emailToUse)}` : '';
    const googleParam = isGoogle ? '&googleVerified=true' : '';
    window.location.href = `/?action=register${emailParam}${googleParam}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setUnregisteredEmail('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.extension) {
          const avatar = data.artist?.aboutMe?.avatarUrl || data.artist?.homeCoverUrl || '';
          if ((window as any).syncLoginSession) {
            (window as any).syncLoginSession(
              data.token || pwd,
              data.extension,
              data.artistName || data.username || data.extension,
              avatar,
              data.artist && data.artist.activated !== false
            );
          } else {
            setAdminToken(data.token || pwd, `/${data.extension}`);
            localStorage.setItem('activeAdminExtension', data.extension);
            setGlobalCookie('activeAdminExtension', data.extension);
            localStorage.setItem('activeAdminName', data.artistName || data.username || data.extension);
            localStorage.setItem('activeAdminActivated', data.artist && data.artist.activated !== false ? 'true' : 'false');
            localStorage.setItem('activeAdminAvatar', avatar);
          }
        } else {
          setAdminToken(data.token || pwd);
        }
        window.location.href = getAdminLink();
      } else {
        const data = await res.json();
        if (data.notFoundEmail) {
          setUnregisteredEmail(data.notFoundEmail);
          setIsGoogleVerifiedState(false);
        }
        setErr(data.error || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setErr('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const googleClientId = "578858946574-opa9vfj5t2tmb9sr5jregbur9qa4tdac.apps.googleusercontent.com";
    setErr('');
    setUnregisteredEmail('');
    setLoading(true);

    const loaded = await ensureGoogleSdkLoaded();
    if (loaded && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              try {
                const res = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: response.credential })
                });

                if (res.ok) {
                  const data = await res.json();
                  if (data.isArtist && (data.adminToken || data.token)) {
                    const token = data.adminToken || data.token;
                    const extension = data.artistExtension || data.username;
                    const avatar = data.user?.picture || '';
                    if ((window as any).syncLoginSession) {
                      (window as any).syncLoginSession(
                        token,
                        extension,
                        data.artistName || data.username || extension,
                        avatar,
                        true
                      );
                    } else {
                      setAdminToken(token, `/${extension}`);
                      localStorage.setItem('activeAdminExtension', extension);
                      setGlobalCookie('activeAdminExtension', extension);
                      localStorage.setItem('activeAdminName', data.artistName || data.username || extension);
                      localStorage.setItem('activeAdminAvatar', avatar);
                    }
                    window.location.href = getAdminLink();
                    return;
                  } else {
                    const email = data.user?.email || '';
                    if (email) {
                      setUnregisteredEmail(email);
                      setIsGoogleVerifiedState(true);
                    }
                    setErr(`Email ${email} chưa được đăng ký tài khoản nghệ sĩ.`);
                  }
                } else {
                  const data = await res.json();
                  setErr(data.error || 'Lỗi xác thực Google');
                }
              } catch (e: any) {
                setErr('Lỗi kết nối máy chủ!');
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          }
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
          }
        });
      } catch (e: any) {
        setErr(e?.message || 'Lỗi khởi tạo Google Auth');
        setLoading(false);
      }
    } else {
      setErr('Không thể nạp thư viện Google Auth. Vui lòng kiểm tra lại kết nối mạng!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/90 text-neutral-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Blur Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 p-1 mb-3 flex items-center justify-center overflow-hidden border border-amber-200/80 shadow-sm">
            {sysFavicon ? (
              <img src={sysFavicon} alt="Favicon" className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <div className="w-full h-full bg-amber-500 rounded-[14px] flex items-center justify-center text-white">
                <ShieldCheck className="w-8 h-8" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{t("Đăng Nhập Nghệ Sĩ")}</h2>
          <p className="text-neutral-500 text-xs mt-1 font-medium">{t("Chorus.vn • Hệ thống quản lý kho nhạc nghệ sĩ")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider mb-1.5">
              {t("TÊN ĐĂNG NHẬP HOẶC EMAIL")}
            </label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={usr}
                onChange={(e) => {
                  setUsr(e.target.value);
                  setUnregisteredEmail('');
                }}
                placeholder="Nhập tên đăng nhập hoặc email..."
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 px-4 py-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white focus:outline-none transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider mb-1.5">
              {t("MẬT KHẨU")}
            </label>
            <PasswordInput 
              required
              autoFocus
              value={pwd}
              onChange={(e: any) => setPwd(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 px-4 py-3 rounded-xl text-sm focus:border-stone-900 focus:bg-white focus:outline-none transition-all font-medium pr-12"
            />
          </div>

          {unregisteredEmail ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Email <b>{unregisteredEmail}</b> chưa được đăng ký tài khoản nghệ sĩ.</span>
              </div>
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                <span className="text-[11px] text-rose-700 font-medium">Bạn có muốn đăng ký không?</span>
                <button
                  type="button"
                  onClick={() => handleOpenRegisterModal(unregisteredEmail, isGoogleVerifiedState)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1"
                >
                  Đăng ký ngay →
                </button>
              </div>
            </div>
          ) : err ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{err}</span>
            </div>
          ) : null}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold text-xs py-4 px-6 rounded-xl shadow-sm uppercase tracking-wider transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{t("ĐĂNG NHẬP")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-neutral-200 flex-1"></div>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            HOẶC
          </span>
          <div className="h-px bg-neutral-200 flex-1"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold py-3.5 px-4 rounded-xl border border-neutral-300 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-neutral-400 active:scale-[0.98] text-xs"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Đồng bộ / Đăng nhập với Gmail</span>
        </button>

        {/* Register Option Button */}
        <div className="text-center mt-5 text-xs text-neutral-600 font-medium">
          Bạn chưa có tài khoản ?{' '}
          <button 
            type="button" 
            onClick={() => handleOpenRegisterModal('', false)} 
            className="font-extrabold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-6 pt-5 border-t border-neutral-200 flex items-center justify-between text-xs font-bold">
          <a href="/" className="text-neutral-500 hover:text-black transition-colors flex items-center gap-1">
            ← Trang chủ Chorus.vn
          </a>
          <a href="/help" className="text-neutral-500 hover:text-black transition-colors">
            Cần trợ giúp?
          </a>
        </div>
      </div>
    </div>
  );
}

// ---- MEMBER LOGIN & SERVICES ----
function MemberLogin() {
  const { t } = useAdminTranslation();
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
        window.location.href = ext ? getArtistLink('', ext) : '/';
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
            {t("Chào Mừng Thành Viên!")}
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            {t("Bạn đã đăng nhập thành công dưới quyền")} <strong>{t("Thành viên VIP")}</strong>. {t("Giờ đây bạn có thể thưởng thức toàn bộ album, danh sách phát và các bài hát đệm demo bảo mật trên hệ thống của")} <strong>{artistName}</strong> {t("mà không cần nhập passcode riêng biệt.")}
          </p>

          <div className="space-y-3">
            <Link 
              to={getArtistLink("/")} 
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
          <h2 className="text-xl font-black tracking-tight">{t("Khu Vực Thành Viên")}</h2>
          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
            Nhập mật khẩu thành viên để nghe nhạc tự do không cần passcode
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <PasswordInput 
              autoFocus
              value={pwd}
              onChange={(e: any) => setPwd(e.target.value)}
              className="w-full bg-black/40 text-white border border-white/10 px-5 py-3.5 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center tracking-widest font-mono text-lg transition-all pr-12"
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-rose-500 text-xs font-bold text-center mt-1 bg-rose-500/10 py-2 rounded-xl px-3 border border-rose-500/15">{err}</p>}
          <button 
            type="submit" 
            className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-neutral-200 transition-all shadow-lg"
          >
            Xác nhận Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to={getArtistLink("/")} className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> {t("Trở về Trang chủ")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const activeExt = localStorage.getItem('activeAdminExtension') || getGlobalCookie('activeAdminExtension') || '';
  
  let token = getAdminToken();
  if (!token && activeExt) {
    token = localStorage.getItem(`adminToken_${activeExt}`);
  }
  if (!token) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('adminToken')) {
        const val = localStorage.getItem(key);
        if (val) {
          token = val;
          break;
        }
      }
    }
  }

  if (!token) {
    return <AdminLogin />;
  }

  const [isValidated, setIsValidated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/check', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-artist-extension': activeExt
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.isAdmin) {
        // If Cookie session was deleted (user logged out from another tab), do NOT resurrect!
        const currentActive = getActiveAdminSession();
        if (!currentActive.activeExt || !currentActive.activeToken) {
          removeAdminToken();
          localStorage.removeItem('activeAdminExtension');
          removeGlobalCookie('activeAdminExtension');
          setIsValidated(false);
          return;
        }

        if (data.artist) {
          localStorage.setItem('activeAdminActivated', data.artist.activated !== false ? 'true' : 'false');
          if (data.artist.extension) {
            localStorage.setItem('activeAdminExtension', data.artist.extension);
            setGlobalCookie('activeAdminExtension', data.artist.extension);
          }
          const artistDisplayName = data.artistName || data.aboutMe?.name || data.artist.artistName || data.artist.username || data.artist.extension;
          localStorage.setItem('activeAdminName', artistDisplayName);
          setGlobalCookie('activeAdminName', artistDisplayName);
          const avatar = data.avatarUrl || '';
          localStorage.setItem('activeAdminAvatar', avatar);
          setGlobalCookie('activeAdminAvatar', avatar);
        }
        if (data.artist && data.artist.activated === false) {
          window.location.href = getArtistAdminRedirect(data.artist.extension || activeExt, 'help');
        } else {
          setIsValidated(true);
        }
      } else {
        removeAdminToken();
        localStorage.removeItem('activeAdminExtension');
        removeGlobalCookie('activeAdminExtension');
        setIsValidated(false);
      }
    })
    .catch(() => {
      setIsValidated(true);
    });
  }, [token, activeExt]);

  if (isValidated === false) {
    return <AdminLogin />;
  }

  if (isValidated === null) {
    return <LoadingScreen text="Đang kiểm tra quyền truy cập..." />;
  }

  return <>{children}</>;
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [artistName, setArtistName] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Đường dẫn kích hoạt không hợp lệ!');
      return;
    }
    fetch('/api/public/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Xác thực Email thành công!');
          if (data.artistName) setArtistName(data.artistName);
        } else {
          setStatus('error');
          setMessage(data.error || 'Xác thực Email thất bại!');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Lỗi kết nối máy chủ!');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-900/90 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
            <p className="text-stone-300 font-medium">Đang xác thực email của bạn...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              ✓
            </div>
            <h2 className="text-xl font-black text-amber-400">
              Kích hoạt tài khoản nghệ sĩ {artistName || 'mới'} thành công!
            </h2>
            <p className="text-stone-300 text-sm">Email của bạn đã được xác thực thành công trong hệ thống.</p>
            <div className="pt-4">
              <a
                href="/"
                className="inline-block w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Xây Dựng Kho Nhạc Của Bạn Ngay
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-5">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              ✕
            </div>
            <h2 className="text-xl font-bold text-rose-400">Xác Thực Thất Bại</h2>
            <p className="text-stone-300 text-sm">{message}</p>
            <div className="pt-4">
              <a
                href="/"
                className="inline-block w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition-all"
              >
                Về Trang Chủ
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isSubdomain = isArtistContext();

  useEffect(() => {
    const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    const currentExt = getArtistExtensionFromUrl(location.pathname);
    const { activeExt, activeToken, activeActivated } = getActiveAdminSession();

    const RESERVED_EXTS = [
      'admin', 'master', 'acp', 'verify-email', 'help', 'api', 'assets', 'static', 
      'favicon.ico', 'robots.txt', 'sitemap.xml', 'mem', 'demo', 'song', 'playlist',
      'explore', 'kham-pha'
    ];

    const isAdminPage = location.pathname.endsWith('/admin') || location.pathname.includes('/admin/');
    const isHelpPage = location.pathname.endsWith('/help') || location.pathname.includes('/help/');
    const isMasterPage = location.pathname === '/master' || location.pathname === '/acp';
    const isVerifyEmailPage = location.pathname === '/verify-email';

    // RULE 1 & 2: If accessing /admin on a subdomain (e.g. acxuantai.chorus.vn/admin) or path (/acxuantai/admin), redirect to baseDomain/admin
    const parts = host.split('.');
    const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : host;

    if (isAdminPage && !isLocal) {
      if (host !== baseDomain || (currentExt && location.pathname.startsWith(`/${currentExt}/admin`))) {
        const subPath = location.pathname.substring(location.pathname.indexOf('/admin'));
        window.location.href = `https://${baseDomain}${subPath}${location.search}`;
        return;
      }
    }

    // Verify status and handle subdomain redirect for active artist page
    if (currentExt && !RESERVED_EXTS.includes(currentExt.toLowerCase()) && !isAdminPage && !isHelpPage && !isMasterPage && !isVerifyEmailPage) {
      fetch('/api/data', {
        headers: { 'x-artist-extension': currentExt }
      }).then(res => res.json()).then(data => {
        if (!data || data.error === 'Artist not found' || data.notFound) {
          if (window.location.pathname !== '/') {
            window.location.href = window.location.origin + '/';
          }
          return;
        }
        if (data.error === 'inactive') {
          if (activeExt && activeExt === currentExt) {
            if (!isHelpPage) {
              window.location.href = getArtistAdminRedirect(activeExt, 'help');
            }
          } else {
            if (window.location.pathname !== '/') {
              window.location.href = window.location.origin + '/';
            }
          }
          return;
        }

        // If artist IS valid and accessing path-based artist URL on baseDomain (e.g., chorus.vn/xxxx/song/abc), redirect to xxxx.baseDomain/song/abc
        if (!isLocal && (host === baseDomain || host === `www.${baseDomain}`)) {
          const pathParts = location.pathname.split('/').filter(Boolean);
          const firstSegment = pathParts[0];
          if (firstSegment && !RESERVED_EXTS.includes(firstSegment.toLowerCase())) {
            const restOfPath = '/' + pathParts.slice(1).join('/');
            window.location.href = `https://${firstSegment}.${baseDomain}${restOfPath}${location.search}`;
          }
        }
      }).catch(() => {
        if (window.location.pathname !== '/') {
          window.location.href = window.location.origin + '/';
        }
      });
    }
  }, [location.pathname]);

  const getRouteKey = (pathname: string) => {
    if (pathname.includes('/admin')) return 'admin-root';
    if (pathname.includes('/master') || pathname === '/acp') return 'master-root';
    return pathname;
  };

  return (
      <React.Suspense fallback={<LoadingScreen text="Đang tải..." />}>
    <AnimatePresence mode="wait">
      {/* @ts-ignore */}
      <Routes location={location} key={getRouteKey(location.pathname)}>
        {/* Core Root Routes */}
        <Route path="/" element={isSubdomain ? <Home /> : <ChorusVNLanding />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/explore" element={<ExploreFeatures />} />
        <Route path="/kham-pha" element={<ExploreFeatures />} />
                        <Route path="/help" element={<HelpPage DemoPlayer={DemoPlayer} />} />
        <Route path="/:artistExtension/help" element={<HelpPage DemoPlayer={DemoPlayer} />} />
        <Route path="/acp" element={<ACPControlPanel />} />
        <Route path="/master/*" element={<ACPControlPanel />} />
        <Route path="/mem" element={<MemberLogin />} />
        <Route path="/demo/:id" element={<DemoPlayer />} />
        <Route path="/song/:id" element={<DemoPlayer />} />
        <Route path="/playlist/:id" element={<PlaylistPlayer />} />
        <Route path="/admin/new" element={<RequireAdmin><AdminCreateDemo /></RequireAdmin>} />
        <Route path="/admin/edit/:id" element={<RequireAdmin><AdminEditDemo /></RequireAdmin>} />
        <Route path="/admin/playlist/:id" element={<RequireAdmin><AdminPlaylistEdit /></RequireAdmin>} />
        <Route path="/admin/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

        {/* Dynamic Artist Prefix Routes */}
        <Route path="/:artistExtension" element={<Home />} />
        <Route path="/:artistExtension/mem" element={<MemberLogin />} />
        <Route path="/:artistExtension/demo/:id" element={<DemoPlayer />} />
        <Route path="/:artistExtension/song/:id" element={<DemoPlayer />} />
        <Route path="/:artistExtension/playlist/:id" element={<PlaylistPlayer />} />
        <Route path="/:artistExtension/admin/edit/:id" element={<RequireAdmin><AdminEditDemo /></RequireAdmin>} />
        <Route path="/:artistExtension/admin/playlist/:id" element={<RequireAdmin><AdminPlaylistEdit /></RequireAdmin>} />
        <Route path="/:artistExtension/admin/*" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/:artistExtension/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      </Routes>
    </AnimatePresence>
      </React.Suspense>
  );
}

function AdminFloatingControls({ onLogout }: { onLogout: () => void }) {
  return null;
}

function UnifiedArtistSessionFloatingWidget({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const { artistData, setArtistData } = useContext(LanguageContext);
  const { t } = useAdminTranslation();
  const [session, setSession] = useState(getActiveAdminSession());
  const [avatar, setAvatar] = useState(session.activeAvatar);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [originalTheme, setOriginalTheme] = useState<string | null>(null);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    if (typeof (window as any).clearAllSessions === 'function') {
      await (window as any).clearAllSessions(true);
    }
    onLogout();
    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  };

  const { activeExt, activeName, activeToken } = session;
  const currentExt = getArtistExtensionFromUrl(location.pathname);
  const isHomepage = isArtistContext() ? (location.pathname === '/' || location.pathname === '') : (location.pathname === `/${currentExt}` || location.pathname === `/${currentExt}/`);
  const isOnOwnArtistHomepage = activeExt && currentExt === activeExt && isHomepage;

  const handlePaletteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showThemeDropdown) {
      setShowThemeDropdown(false);
    } else {
      setOriginalTheme(artistData?.adminTheme || 'liquid-glass');
      setShowThemeDropdown(true);
    }
  };

  const selectThemePreview = (targetTheme: string) => {
    const currentTheme = artistData?.adminTheme || 'liquid-glass';
    if (!originalTheme) {
      setOriginalTheme(currentTheme);
    }
    if (typeof (window as any).previewTheme === 'function') {
      (window as any).previewTheme(targetTheme);
    }
    setPendingTheme(targetTheme);
    setShowThemeDropdown(false);
  };

  const handleConfirmTheme = async () => {
    if (!pendingTheme) return;
    const themeVipConfig = artistData?.landingConfig?.adminThemesVip || {};
    const isVipTheme = pendingTheme === 'gold' 
      ? themeVipConfig['gold'] !== false 
      : !!themeVipConfig[pendingTheme || ''];
    const roles = artistData?.roles || [];
    const roleId = artistData?.roleId || '';
    const userRole = roles.find((r: any) => String(r.id || r.name).toLowerCase() === String(roleId || '').toLowerCase());
    const isVvip = !!(
      artistData?.isSpecial || 
      artistData?.username === 'acxuantai' || 
      String(roleId || '').toLowerCase() === 'vvip' || 
      String(roleId || '').toLowerCase() === 'v.vip' ||
      artistData?.isMasterAdmin
    );
    const hasVipAccess = isVvip || !!(String(roleId).toLowerCase() === 'vip' || userRole?.exclusiveUi);

    if (pendingTheme === 'random' && !isVvip) {
      setThemeError("Giao diện Ngẫu Nhiên chỉ dành riêng cho tài khoản V.VIP!");
      return;
    }

    if (pendingTheme !== 'random' && isVipTheme && !hasVipAccess) {
      setThemeError("đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.");
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-artist-extension': activeExt || getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken || localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify({ adminTheme: pendingTheme })
      });
      if (res.ok) {
        const updatedData = await res.json();
        if (typeof (window as any).previewTheme === 'function') {
          (window as any).previewTheme(pendingTheme);
        }
        if (setArtistData) {
          setArtistData(updatedData);
        }
        setPendingTheme(null);
        setOriginalTheme(null);
        setThemeError(null);
        setShowThemeDropdown(false);
      } else {
        setThemeError("Lỗi máy chủ khi lưu giao diện.");
      }
    } catch (e) {
      setThemeError("Lỗi kết nối máy chủ.");
    }
  };

  const handleUndoTheme = () => {
    const revertTo = originalTheme || 'liquid-glass';
    if (typeof (window as any).previewTheme === 'function') {
      (window as any).previewTheme(revertTo);
    }
    if (setArtistData) {
      setArtistData((prev: any) => prev ? { ...prev, adminTheme: revertTo } : prev);
    }
    setPendingTheme(null);
    setOriginalTheme(null);
    setThemeError(null);
    setShowThemeDropdown(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getActiveAdminSession();
      setSession(updated);
      setAvatar(updated.activeAvatar);
    };
    window.addEventListener('admin-session-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    return () => {
      window.removeEventListener('admin-session-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeExt) {
      fetch(`/api/verify-admin-session?ext=${encodeURIComponent(activeExt)}`, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${activeToken || ''}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data || !data.valid) {
          removeAdminToken(activeExt);
          removeGlobalCookie('activeAdminExtension');
          removeGlobalCookie(`adminToken_${activeExt}`);
          removeGlobalCookie('activeAdminName');
          removeGlobalCookie('activeAdminAvatar');
          window.dispatchEvent(new Event('admin-session-change'));
          setSession(getActiveAdminSession());
          return;
        }
        fetch(`/api/data?artist=${encodeURIComponent(activeExt)}`, { cache: 'no-store' })
          .then(r => r.json())
          .then(d => {
            const fetchedAvatar = d?.aboutMe?.avatarUrl || d?.homeCoverUrl || '';
            if (fetchedAvatar) {
              setAvatar(fetchedAvatar);
              localStorage.setItem('activeAdminAvatar', fetchedAvatar);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
    }
  }, [activeExt, activeToken]);

  if (!activeExt || !activeName || !activeToken) return null;

  // Do not show on acp control panel or admin pages or help guide
  if (location.pathname === '/acp' || location.pathname === '/master' || location.pathname.includes('/admin') || location.pathname.includes('/help')) return null;

  const isMusicPlayerPage = location.pathname.includes('/demo/') || location.pathname.includes('/song/') || location.pathname.includes('/playlist/');
  const shouldHideOnMobilePlayer = isMobile && isMusicPlayerPage;

  const getAvatarUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url;
    return `/uploads/${activeExt}/${url}`;
  };

  const showWidget = !shouldHideOnMobilePlayer;

  return (
    <AnimatePresence mode="wait">
      {showWidget && (
        <motion.div key="widget"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[99] flex items-center gap-3 bg-black/40 text-white px-4 py-2.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:bg-black/50"
        >
          {isLoggingOut ? (
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs py-1 px-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t("Đăng xuất thành công!")}</span>
            </div>
          ) : (
            <>
              <a href={getArtistAdminRedirect(activeExt, '').replace(/\/$/, '') || '/'} className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity" title={t("Đến kho nhạc")}>
                {avatar ? (
                  <img 
                    src={getThumbUrl(getAvatarUrl(avatar))} 
                    className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
                    alt={activeName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm animate-pulse shrink-0"
                  style={{ display: avatar ? 'none' : 'flex' }}
                >
                  {activeName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex flex-col justify-center leading-none">
                  <span className="text-[10px] text-yellow-300 font-black uppercase tracking-wider leading-none mb-1 shadow-xs">{t("Nghệ sĩ")}</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider leading-relaxed pt-1 pb-0.5 max-w-[120px] sm:max-w-[200px] whitespace-normal break-words">{activeName}</span>
                </div>
              </a>
              <div className="w-px h-6 bg-white/10 mx-1"></div>
              <div className="flex items-center gap-1.5">
                {/* Theme Selector Icon/Menu */}
                {isOnOwnArtistHomepage && (
                <div className="relative">
                  <button
                    onClick={handlePaletteClick}
                    title={t("Đổi giao diện nhanh")}
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep pointer-events-none" />
                    <Palette className="w-4 h-4 text-amber-400 animate-pulse shrink-0 relative z-10" />
                  </button>
                  
                  <AnimatePresence>
                    {showThemeDropdown && (
                      <motion.div key="theme-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-14 right-0 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl w-48 flex flex-col gap-1 z-50 text-stone-200"
                      >
                        <div className="text-[10px] font-black uppercase text-stone-400 px-2 py-1 border-b border-white/5 mb-1 tracking-wider">
                          {t("Chọn giao diện")}
                        </div>
                        <button
                          disabled={(artistData?.adminTheme || 'liquid-glass') === 'liquid-glass'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectThemePreview('liquid-glass');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            (artistData?.adminTheme || 'liquid-glass') === 'liquid-glass'
                              ? 'opacity-50 cursor-not-allowed text-stone-500 bg-black/10'
                              : 'hover:bg-white/10 text-stone-200 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            Liquid Glass
                            {(() => {
                              const cfg = artistData?.landingConfig?.adminThemesVip?.['liquid-glass'];
                              let isPro = false; let isVip = false;
                              if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                              else if (cfg === true) { isPro = true; isVip = true; }
                              if (isVip) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-yellow-500 text-stone-950 rounded-full">VIP</span>;
                              if (isPro) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">PRO</span>;
                              return null;
                            })()}
                          </span>
                          {(artistData?.adminTheme || 'liquid-glass') === 'liquid-glass' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                        </button>
                        
                        <button
                          disabled={artistData?.adminTheme === 'gold'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectThemePreview('gold');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            artistData?.adminTheme === 'gold'
                              ? 'opacity-50 cursor-not-allowed text-stone-500 bg-black/10'
                              : 'hover:bg-white/10 text-stone-200 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            Gold Luxury <Sparkles className="w-3 h-3 text-yellow-400" />
                            {(() => {
                              const cfg = artistData?.landingConfig?.adminThemesVip?.['gold'];
                              let isPro = true; let isVip = true;
                              if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                              else if (cfg === false) { isPro = false; isVip = false; }
                              if (isVip) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-yellow-500 text-stone-950 rounded-full">VIP</span>;
                              if (isPro) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">PRO</span>;
                              return null;
                            })()}
                          </span>
                          {artistData?.adminTheme === 'gold' && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                        </button>

                        <button
                          disabled={artistData?.adminTheme === 'musician'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectThemePreview('musician');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            artistData?.adminTheme === 'musician'
                              ? 'opacity-50 cursor-not-allowed text-stone-500 bg-black/10'
                              : 'hover:bg-white/10 text-stone-200 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            Dreamy <Music className="w-3 h-3 text-amber-400" />
                            {(() => {
                              const cfg = artistData?.landingConfig?.adminThemesVip?.['musician'];
                              let isPro = true; let isVip = false;
                              if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                              else if (cfg === true) { isPro = true; isVip = true; }
                              else if (cfg === false) { isPro = false; isVip = false; }
                              if (isVip) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-yellow-500 text-stone-950 rounded-full">VIP</span>;
                              if (isPro) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">PRO</span>;
                              return null;
                            })()}
                          </span>
                          {artistData?.adminTheme === 'musician' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>

                        <button
                          disabled={artistData?.adminTheme === 'musician2'}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectThemePreview('musician2');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            artistData?.adminTheme === 'musician2'
                              ? 'opacity-50 cursor-not-allowed text-stone-500 bg-black/10'
                              : 'hover:bg-white/10 text-stone-200 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            Musician <Disc3 className="w-3 h-3 text-amber-500" />
                            {(() => {
                              const cfg = artistData?.landingConfig?.adminThemesVip?.['musician2'];
                              let isPro = true; let isVip = false;
                              if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                              else if (cfg === true) { isPro = true; isVip = true; }
                              else if (cfg === false) { isPro = false; isVip = false; }
                              if (isVip) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-yellow-500 text-stone-950 rounded-full">VIP</span>;
                              if (isPro) return <span className="px-1.5 py-0.2 text-[8px] font-black bg-blue-500 text-white rounded-full">PRO</span>;
                              return null;
                            })()}
                          </span>
                          {artistData?.adminTheme === 'musician2' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </button>

                        <button
                          disabled={artistData?.adminTheme === 'random'}
                          onClick={(e) => {
                            e.stopPropagation();
                            const isVvip = !!(
                              artistData?.isSpecial || 
                              artistData?.username === 'acxuantai' || 
                              String(artistData?.roleId || '').toLowerCase() === 'vvip' || 
                              String(artistData?.roleId || '').toLowerCase() === 'v.vip' ||
                              artistData?.isMasterAdmin
                            );
                            if (!isVvip) {
                              setThemeError("Giao diện Ngẫu Nhiên chỉ dành riêng cho tài khoản V.VIP!");
                              setPendingTheme('random');
                              setShowThemeDropdown(false);
                              return;
                            }
                            selectThemePreview('random');
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                            artistData?.adminTheme === 'random'
                              ? 'opacity-50 cursor-not-allowed text-stone-500 bg-black/10'
                              : 'hover:bg-white/10 text-stone-200 cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            Ngẫu Nhiên <Shuffle className="w-3 h-3 text-purple-400" />
                            <span className="px-1.5 py-0.2 text-[8px] font-black bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white rounded-full shadow-xs">V.VIP</span>
                          </span>
                          {artistData?.adminTheme === 'random' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )}

                <a 
                    href={getArtistAdminRedirect(activeExt, 'admin')} 
                    title={t("Quản trị")}
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4" />
                  </a>
                <button
                  onClick={handleLogoutClick}
                  title={t("Đăng xuất")}
                  className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {pendingTheme && (
          <div key="pending-theme" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 shadow-2xl rounded-3xl p-6 w-full max-w-sm relative font-sans text-stone-900"
            >
              <h3 className="text-lg font-black text-stone-900 mb-2 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500 animate-pulse" />
                Xác nhận đổi giao diện
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Bạn có chắc chắn muốn đổi sang giao diện <strong className="text-stone-800">{
                  pendingTheme === 'musician' ? 'Dreamy' :
                  pendingTheme === 'musician2' ? 'Musician' :
                  (pendingTheme === 'gold' || pendingTheme === 'gold2') ? 'Gold Luxury' :
                  pendingTheme === 'random' ? 'Ngẫu Nhiên' :
                  pendingTheme === 'liquid-glass' ? 'Liquid Glass' :
                  (pendingTheme || 'Liquid Glass')
                }</strong> không?
              </p>

              {themeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold leading-relaxed">
                  ⚠️ {themeError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleUndoTheme}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hoàn Tác
                </button>
                <button
                  onClick={handleConfirmTheme}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Xác Nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

const AdminFloatingAddButton = () => {
  const location = useLocation();
  const { t } = useAdminTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const isLandingPage = location.pathname === '/' && !getArtistExtensionFromUrl();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMusicPlayerPage = location.pathname.includes('/demo/') || location.pathname.includes('/song/') || location.pathname.includes('/playlist/') || location.pathname.includes('/landing/');
  const shouldHideOnMobilePlayer = isMobile && isMusicPlayerPage;

  // Thỉnh thoảng hiện tooltip
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000); // Tắt sau 3s
    }, 10000); // 10 giây hiện 1 lần
    return () => clearInterval(interval);
  }, []);

  // Chỉ hiện khi ở trang admin, đã đăng nhập thành công và không phải trang thêm/sửa
  const isAdmin = !!getAdminToken();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.includes('/admin');
  const isFormPage = location.pathname.includes('/new') || location.pathname.includes('/edit');

  const shouldShow = isAdmin && isAdminPath && !isFormPage && !isLandingPage && !shouldHideOnMobilePlayer;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.4, y: 120, x: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 120, x: 60 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex items-center gap-3"
        >
          <AnimatePresence>
            {showTooltip && (
              <motion.div key="tooltip"
                initial={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 15, scale: 0.9, filter: 'blur(4px)' }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                className="hidden md:block relative bg-stone-950/95 backdrop-blur-md border border-white/15 text-white text-xs font-black tracking-wider px-4 py-2.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap pointer-events-none uppercase"
              >
                {t("Đăng Bài Hát Mới")}
                {/* Liquid-glass subtle glow gradient inside tooltip */}
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl -z-10 animate-pulse" />
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-stone-950/95 border-r border-t border-white/15 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            to={getAdminLink('/new')}
          >
            <motion.div 
              className="relative flex items-center justify-center w-16 h-16 rounded-full cursor-pointer group overflow-hidden border border-white/50 backdrop-blur-xl bg-purple-950/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.75),0_16px_40px_rgba(219,39,119,0.5),0_0_24px_rgba(168,85,247,0.35)] [clip-path:circle(50%_at_50%_50%)] [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
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
              {/* Saturated and vivid liquid gradient rotating background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 via-fuchsia-600 via-pink-600 to-rose-500 opacity-100 animate-rotate-border" />
              
              {/* Breathing inner overlay for deep shifting colors */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-pink-500 via-purple-600 to-indigo-700 opacity-60 mix-blend-overlay animate-[pulse_3s_ease-in-out_infinite]" />

              {/* Spheroid volumetric radial highlight */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,transparent_60%)] pointer-events-none mix-blend-overlay" />

              {/* Shiny glass glare top overlay */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-full pointer-events-none" />
              
              {/* Saturated glowing concentric concentric breathing ring lines */}
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

              <Plus className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-transform duration-500" />
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function getRandomSongCardStyles(song: any) {
  const tType = song?.template || '1';
  let bgClasses = "bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#996515] text-white";
  let titleColor = "text-white group-hover:text-amber-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]";
  let singerColor = "text-amber-100 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]";
  let borderClass = "border-2 border-[#D4AF37]/50 hover:border-[#D4AF37]";
  let shadowClass = "shadow-[0_12px_45px_rgba(212,175,55,0.2)] hover:shadow-[0_16px_45px_rgba(212,175,55,0.3)] hover:scale-[1.015]";
  
  let isLightBg = false;
  let isRedBg = false;

  if (tType === '1' || tType === '4' || tType === '6' || tType === '7' || tType === '9' || tType === '17' || tType === '20') {
    isLightBg = true;
  } else if (tType === '5' || tType === '8') {
    isRedBg = true;
  }

  if (tType === '1') {
    bgClasses = "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 text-orange-950";
    titleColor = "text-[#1A1303] group-hover:text-orange-700";
    singerColor = "text-stone-600 font-bold";
    borderClass = "border-2 border-orange-200 hover:border-orange-400";
    shadowClass = "shadow-lg shadow-orange-100 hover:scale-[1.015]";
  } else if (tType === '2') {
    bgClasses = "bg-gradient-to-br from-[#1E052D] via-[#0D0114] to-[#1E052D] text-white animate-club-bg";
    titleColor = "text-white group-hover:text-fuchsia-300";
    singerColor = "text-fuchsia-200/80 font-semibold";
    borderClass = "border-2 border-fuchsia-500/40 hover:border-fuchsia-400";
    shadowClass = "shadow-[0_12px_32px_rgba(192,38,211,0.2)] hover:shadow-[0_16px_40px_rgba(192,38,211,0.35)] hover:scale-[1.015]";
  } else if (tType === '3') {
    bgClasses = "bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300";
    titleColor = "text-white group-hover:text-slate-300";
    singerColor = "text-slate-400 font-semibold";
    borderClass = "border-2 border-slate-700 hover:border-slate-500";
    shadowClass = "shadow-[0_12px_32px_rgba(30,41,59,0.25)] hover:shadow-[0_16px_40px_rgba(30,41,59,0.35)] hover:scale-[1.015]";
  } else if (tType === '4') {
    bgClasses = "bg-emerald-50 text-emerald-900 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:16px_16px]";
    titleColor = "text-emerald-900 group-hover:text-emerald-700";
    singerColor = "text-emerald-700/80 font-semibold";
    borderClass = "border-2 border-emerald-300/40 hover:border-emerald-400";
    shadowClass = "shadow-md shadow-emerald-100 hover:scale-[1.015]";
  } else if (tType === '5') {
    bgClasses = "bg-gradient-to-tr from-rose-500 via-red-500 to-rose-600 text-white";
    titleColor = "text-white group-hover:text-rose-200";
    singerColor = "text-rose-100/80 font-semibold";
    borderClass = "border-2 border-rose-400/40 hover:border-white/50";
    shadowClass = "shadow-[0_12px_32px_rgba(244,63,94,0.25)] hover:shadow-[0_16px_40px_rgba(244,63,94,0.35)] hover:scale-[1.015]";
  } else if (tType === '6') {
    bgClasses = "bg-gradient-to-br from-fuchsia-100 via-pink-50 to-pink-100 text-pink-950";
    titleColor = "text-pink-950 group-hover:text-pink-700";
    singerColor = "text-pink-700/80 font-semibold";
    borderClass = "border-2 border-pink-300/40 hover:border-pink-400";
  } else if (tType === '7') {
    bgClasses = "bg-[#faf9f6] text-stone-800 bg-notebook-light";
    titleColor = "text-stone-900 group-hover:text-stone-600";
    singerColor = "text-stone-500 font-semibold";
    borderClass = "border-2 border-stone-300 hover:border-stone-500";
  } else if (tType === '8') {
    bgClasses = "bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-yellow-100";
    titleColor = "text-yellow-100 group-hover:text-yellow-300";
    singerColor = "text-red-100/70 font-semibold";
    borderClass = "border-2 border-yellow-500/40 hover:border-yellow-400";
    shadowClass = "shadow-lg shadow-red-900/30 hover:scale-[1.015]";
  } else if (tType === '9') {
    bgClasses = "bg-gradient-to-br from-sky-200 via-white via-50% to-pink-100 text-sky-950";
    titleColor = "text-sky-950 group-hover:text-sky-700";
    singerColor = "text-sky-800/80 font-semibold";
    borderClass = "border-2 border-sky-300 hover:border-pink-300";
  } else if (tType === '10') {
    bgClasses = "bg-neutral-950 text-white bg-blend-multiply";
    titleColor = "text-white group-hover:text-neutral-300";
    singerColor = "text-neutral-400 font-semibold";
    borderClass = "border-2 border-neutral-800 hover:border-neutral-700";
  } else if (tType === '11') {
    bgClasses = "bg-[#090909] text-amber-100 font-serif";
    titleColor = "text-amber-100 group-hover:text-amber-400";
    singerColor = "text-amber-200/60 font-semibold";
    borderClass = "border-2 border-amber-500/30 hover:border-amber-400";
    shadowClass = "shadow-[0_12px_32px_rgba(212,175,55,0.1)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.25)] hover:scale-[1.015]";
  } else if (tType === '12') {
    bgClasses = "bg-gradient-to-br from-[#2D1B18] via-[#1A0C06] to-[#0A0402] text-[#EFEBE9] font-serif";
    titleColor = "text-white group-hover:text-[#A1887F]";
    singerColor = "text-[#D7CCC8]/80 font-semibold";
    borderClass = "border-2 border-[#8D6E63]/30 hover:border-[#8D6E63]";
  } else if (tType === '13') {
    bgClasses = "bg-gradient-to-b from-[#12102F] via-[#3B1275] to-[#B61242] text-white";
    titleColor = "text-white group-hover:text-rose-300";
    singerColor = "text-rose-200/80 font-semibold";
    borderClass = "border-2 border-purple-500/30 hover:border-rose-400";
    shadowClass = "shadow-[0_12px_32px_rgba(182,18,66,0.2)] hover:shadow-[0_16px_40px_rgba(182,18,66,0.35)] hover:scale-[1.015]";
  } else if (tType === '14') {
    bgClasses = "bg-gradient-to-b from-[#061A33] via-[#0E2E54] to-[#001D3D] text-white";
    titleColor = "text-white group-hover:text-sky-300";
    singerColor = "text-sky-200/80 font-semibold";
    borderClass = "border-2 border-sky-500/30 hover:border-sky-400";
  } else if (tType === '15') {
    bgClasses = "bg-[#05040B] text-emerald-400 font-mono tracking-tight";
    titleColor = "text-emerald-400 group-hover:text-emerald-200";
    singerColor = "text-emerald-500/80 font-semibold";
    borderClass = "border-2 border-[#10b981]/40 hover:border-[#10b981]";
  } else if (tType === '16') {
    bgClasses = "bg-gradient-to-tr from-[#12102F] via-[#2A053A] to-[#0A0A0E] text-white";
    titleColor = "text-white group-hover:text-pink-300";
    singerColor = "text-pink-200/80 font-semibold";
    borderClass = "border-2 border-purple-500/30 hover:border-pink-500";
    shadowClass = "shadow-[0_12px_32px_rgba(236,72,153,0.15)] hover:shadow-[0_16px_40px_rgba(236,72,153,0.3)] hover:scale-[1.015]";
  } else if (tType === '17') {
    bgClasses = "bg-sky-200 text-stone-900";
    titleColor = "text-stone-900 group-hover:text-sky-950";
    singerColor = "text-stone-600 font-semibold";
    borderClass = "border-2 border-white hover:border-sky-300";
  } else if (tType === '18') {
    bgClasses = "bg-[#0F172A] text-amber-50";
    titleColor = "text-amber-50 group-hover:text-amber-300";
    singerColor = "text-slate-400 font-semibold";
    borderClass = "border-2 border-amber-500/30 hover:border-amber-400";
  } else if (tType === '19') {
    bgClasses = "bg-gradient-to-br from-[#4D2D18] via-[#2D170B] to-[#120803] text-[#E5B582]";
    titleColor = "text-[#E5B582] group-hover:text-[#D95B16]";
    singerColor = "text-[#C29D75] font-semibold";
    borderClass = "border-2 border-[#D95B16]/30 hover:border-[#D95B16]";
  } else if (tType === '20') {
    bgClasses = "bg-gradient-to-br from-[#FAD2A8] via-[#F9A8D4] to-[#C4DAFA] text-[#1A0F1A]";
    titleColor = "text-[#1A0F1A] group-hover:text-pink-700";
    singerColor = "text-pink-900/70 font-semibold";
    borderClass = "border-2 border-pink-300/35 hover:border-pink-400";
  }

  if (song?.achievements && song.achievements.length > 0) {
    borderClass = "border-[3px] border-[#D4AF37]";
    shadowClass = "shadow-[0_12px_32px_rgba(170,124,17,0.25)] hover:shadow-[0_16px_40px_rgba(170,124,17,0.4)] hover:scale-[1.02]";
    if (tType === '1') {
      bgClasses = "bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] via-45% to-[#B38728] via-70% to-[#FBF5B7]";
      isLightBg = true;
    }
  }

  const customConfig = song?.templateConfigs?.find((c: any) => c.id === tType);
  const customStyle: React.CSSProperties = {};
  if (customConfig?.bgColor) {
    customStyle.backgroundColor = customConfig.bgColor;
    const hex = customConfig.bgColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness > 160) {
        isLightBg = true;
        isRedBg = false;
      } else {
        isLightBg = false;
        if (r > 160 && g < 110 && b < 110) {
          isRedBg = true;
        }
      }
    }
  }

  const bgMode: 'light' | 'red' | 'dark' = isLightBg ? 'light' : (isRedBg ? 'red' : 'dark');

  return { bgClasses, titleColor, singerColor, borderClass, shadowClass, customStyle, isLightBg, isRedBg, bgMode };
}

function renderContainedEffect(templateType: string) {
  switch(templateType) {
    case '1': // Vui vẻ (Ấm áp) - Happy / Warm
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Subtle Sunray Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15 text-amber-500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sunrays" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="24" cy="24" r="1.5" fill="currentColor" />
                <path d="M 24 0 L 24 48 M 0 24 L 48 24 M 7 7 L 41 41 M 7 41 L 41 7" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sunrays)" />
          </svg>
          {/* Sun outline and glowing organic blobs */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-2 right-8 w-12 h-12 rounded-full border border-amber-300/20 bg-gradient-to-tr from-amber-400/5 to-amber-200/20" />
          {/* Butterflies & Spars */}
          <div className="absolute inset-0 opacity-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={`l5435-bf-${i}`} 
                className="absolute text-lg animate-float-shape"
                style={{
                  left: `${(i * 22) % 75 + 10}%`,
                  top: `${(i * 17) % 65 + 15}%`,
                  animationDuration: `${i * 2 + 5}s`,
                  animationDelay: `-${i * 1.5}s`
                }}
              >
                {['🦋', '🌻', '✨', '🎈'][i % 4]}
              </div>
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`l5449-p-${i}`} 
                className="absolute bg-amber-400/35 rounded-full animate-pulse"
                style={{
                  left: `${(i * 15) % 85 + 5}%`,
                  top: `${(i * 21) % 70 + 15}%`,
                  width: `${(i % 3) * 2 + 3}px`,
                  height: `${(i % 3) * 2 + 3}px`,
                }}
              />
            ))}
          </div>
        </div>
      );

    case '2': // Căng Cực (Sôi động) - Electric / Club (Matches Image 5!)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Memphis High-Energy Geometric SVGs */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            {/* Top-Right and Bottom-Left Half-tone/Concentric Arcs */}
            <circle cx="95%" cy="5%" r="40" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="95%" cy="5%" r="60" fill="none" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="95%" cy="5%" r="80" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" />
            
            <circle cx="5%" cy="95%" r="30" fill="none" stroke="#ec4899" strokeWidth="1.5" />
            <circle cx="5%" cy="95%" r="50" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="5%" cy="95%" r="70" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Memphis lines with node endpoints */}
            <line x1="35%" y1="75%" x2="65%" y2="95%" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="35%" cy="75%" r="3" fill="#facc15" />
            <circle cx="65%" cy="95%" r="3" fill="#facc15" />

            <line x1="40%" y1="80%" x2="70%" y2="100%" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="40%" cy="80%" r="3" fill="#facc15" />
            <circle cx="70%" cy="100%" r="3" fill="#facc15" />

            {/* Neon Memphis Triangle */}
            <polygon points="85,30 115,80 55,70" fill="none" stroke="#f43f5e" strokeWidth="1.5" transform="scale(0.8) translate(50, 20)" />
            <polygon points="20,10 50,60 -10,50" fill="none" stroke="#38bdf8" strokeWidth="1.2" transform="scale(0.6) translate(400, 30)" />
          </svg>

          {/* Dotted Halftone Pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(244,63,94,0.12)_1px,transparent_1px)] bg-[size:16px_16px]" />

          {/* Floating Neon geometric elements */}
          <div className="absolute inset-0 opacity-40">
            {/* Yellow crosses and plus marks */}
            <div className="absolute top-4 left-1/3 text-yellow-400 font-bold text-xs rotate-45 animate-pulse">+</div>
            <div className="absolute bottom-6 left-1/4 text-pink-400 font-bold text-xs animate-bounce">×</div>
            <div className="absolute top-1/2 right-1/4 text-cyan-400 font-bold text-xs rotate-12 animate-pulse">+</div>
            <div className="absolute top-6 right-12 text-yellow-300 font-bold text-xs animate-bounce">×</div>
          </div>

          {/* Pulse lasers & Equalizers */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-fuchsia-950/15 to-pink-900/10 opacity-40 animate-pulse" />
          <div className="absolute bottom-0 right-4 flex items-end gap-1 opacity-30 h-10">
            {[14, 28, 20, 36, 16, 24, 8, 30, 18, 22].map((h, i) => (
              <div 
                key={`l5508-i-${i}`} 
                className="w-0.5 bg-fuchsia-400 rounded-t"
                style={{
                  height: `${h}%`,
                  animation: `pulse-wave ${1 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
                  animationDelay: `-${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      );

    case '3': // Buồn (Sâu lắng) - Sad / Deep
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Rain Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15 text-slate-500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sadlines" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="6" y2="40" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sadlines)" />
          </svg>
          {/* Dark blue clouds silhouettes */}
          <svg className="absolute bottom-0 right-0 left-0 h-16 w-full text-slate-950/40 opacity-50" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M 0,100 C 50,80 80,70 120,85 C 160,100 200,60 250,75 C 300,90 350,70 400,100 Z" fill="currentColor" />
            <path d="M 0,100 C 30,90 70,80 100,90 C 140,100 180,75 220,85 C 270,95 330,80 400,100 Z" fill="currentColor" className="opacity-60" />
          </svg>
          {/* Crescent Moon & Clouds */}
          <div className="absolute top-2 right-6 text-2xl opacity-20 animate-pulse">🌙</div>
          <div className="absolute top-1 left-4 text-lg opacity-[0.10] animate-[float-gentle_12s_ease-in-out_infinite]">☁️</div>
          <div className="absolute bottom-4 right-12 text-xl opacity-[0.06] animate-[float-gentle_16s_ease-in-out_infinite_reverse]">☁️</div>
          {/* Rain / Snow particles */}
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={`l5546-i-${i}`} 
                className="absolute text-[8px] sm:text-[10px] text-sky-100/60 animate-snow-contained"
                style={{
                  left: `${(i * 14) % 80 + 10}%`,
                  top: `-${(i * 8) % 30}%`,
                  animationDuration: `${3.2 + (i % 2) * 1.2}s`,
                  animationDelay: `-${i * 0.8}s`
                }}
              >
                {i % 2 === 0 ? '❄️' : '•'}
              </div>
            ))}
          </div>
        </div>
      );

    case '4': // Thư giãn (Nhẹ nhàng) - Relaxing / Gentle (Matches Image 4!)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Music Staff Grid Pattern & Fluid Wavy Curves */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="relaxgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.75" fill="#0d9488" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#relaxgrid)" />
            {/* Elegant fluid curved waves */}
            <path d="M 0,20 C 120,60 220,-20 320,30 C 420,80 520,30 620,60" fill="none" stroke="rgba(13,148,136,0.18)" strokeWidth="2.5" />
            <path d="M 0,40 C 100,80 250,10 350,50 C 450,90 550,20 650,40" fill="none" stroke="rgba(13,148,136,0.12)" strokeWidth="1.5" />
          </svg>

          {/* Treble clef outline in bottom left */}
          <div className="absolute left-4 bottom-2 text-3xl text-teal-600/10 select-none">🎼</div>
          
          {/* Geometric Memphis Details (From Image 4) */}
          <div className="absolute inset-0 opacity-30">
            {/* White floating crosses & squares */}
            <div className="absolute top-4 left-1/4 text-teal-600/20 text-xs font-bold rotate-12 animate-pulse">×</div>
            <div className="absolute bottom-3 right-1/4 text-teal-600/15 text-sm font-bold rotate-45">×</div>
            <div className="absolute top-1/2 left-8 w-3 h-3 border border-teal-600/15 rounded-xs animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute top-3 right-1/3 w-2 h-2 border border-teal-600/20 rotate-12" />
          </div>

          {/* Floating Notes */}
          <div className="absolute inset-0 opacity-35">
            {['♩', '♪', '♫', '♬', '♩', '♪'].map((note, i) => (
              <div 
                key={`l5594-i-${i}`} 
                className="absolute text-teal-600/35 font-bold text-sm animate-bounce"
                style={{
                  left: `${(i * 18) % 75 + 15}%`,
                  top: `${(i * 14) % 60 + 20}%`,
                  animationDuration: `${2.5 + (i % 3) * 0.8}s`,
                  animationDelay: `-${i * 1.2}s`
                }}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      );

    case '5': // Đáng yêu (Đỏ, Nhảy múa) - Cute / Red (Matches Image 2!)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Hearts Grid Pattern SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-10 text-rose-200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heartgrid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 18 8 C 18 8 15 2 9 2 C 3 2 3 8 3 11 C 3 16 11 22 18 28 C 25 22 33 16 33 11 C 33 8 33 2 27 2 C 21 2 18 8 18 8 Z" fill="none" stroke="currentColor" strokeWidth="0.5" transform="scale(0.4)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heartgrid)" />
          </svg>

          {/* Soft Organic Background Blobs (Exactly from Image 2!) */}
          <div className="absolute -left-6 top-1/4 w-20 h-16 bg-rose-400/20 rounded-[40%_60%_50%_50%] blur-sm animate-pulse" />
          <div className="absolute right-8 top-1/3 w-16 h-12 bg-orange-400/15 rounded-[60%_40%_70%_30%] blur-xs animate-bounce" style={{ animationDuration: '6s' }} />
          <div className="absolute left-1/3 bottom-4 w-24 h-12 bg-pink-400/15 rounded-full blur-md" />
          <div className="absolute right-4 bottom-2 w-14 h-14 bg-rose-400/20 rounded-full blur-sm" />

          {/* Sweets & Treats Icons with micro-shadows (From Image 2!) */}
          <div className="absolute inset-0 opacity-45">
            {[
              { icon: '🍬', left: '10%', top: '45%', rotate: '-12deg', anim: 'animate-bounce' },
              { icon: '🍭', left: '24%', top: '20%', rotate: '25deg', anim: 'animate-float-shape' },
              { icon: '🍫', left: '75%', top: '65%', rotate: '-45deg', anim: 'animate-pulse' },
              { icon: '🍡', left: '55%', top: '75%', rotate: '15deg', anim: 'animate-bounce' },
              { icon: '💖', left: '80%', top: '15%', rotate: '5deg', anim: 'animate-float-shape' },
              { icon: '🍬', left: '90%', top: '50%', rotate: '35deg', anim: 'animate-pulse' },
            ].map((item, i) => (
              <div 
                key={`l5640-i-${i}`} 
                className={`absolute text-sm drop-shadow-[0_2px_4px_rgba(225,29,72,0.4)] ${item.anim}`}
                style={{
                  left: item.left,
                  top: item.top,
                  transform: `rotate(${item.rotate})`,
                  animationDuration: `${2.5 + (i % 2) * 1.5}s`,
                  animationDelay: `-${i * 0.4}s`
                }}
              >
                {item.icon}
              </div>
            ))}
          </div>
        </div>
      );

    case '6': // Hạnh Phúc (Hồng, Hoa rơi) - Happy / Blossom
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Cherry blossoms pattern background */}
          <svg className="absolute inset-0 w-full h-full opacity-10 text-pink-400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cherrypattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 20 16 C 17 12 14 12 14 16 C 14 20 20 20 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <path d="M 20 16 C 23 12 26 12 26 16 C 26 20 20 20 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <path d="M 20 24 C 17 28 14 28 14 24 C 14 20 20 20 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <path d="M 20 24 C 23 28 26 28 26 24 C 26 20 20 20 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cherrypattern)" />
          </svg>
          {/* Silhouette Cherry Blossom Branches in top-right corners */}
          <svg className="absolute -top-4 -right-4 w-32 h-32 opacity-15 text-pink-500" viewBox="0 0 100 100">
            <path d="M100,0 Q80,20 60,30 Q40,40 20,42 M75,12 Q60,25 50,38 M88,6 Q75,14 65,10" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="60" cy="30" r="3" fill="currentColor" />
            <circle cx="50" cy="38" r="4" fill="currentColor" />
            <circle cx="65" cy="10" r="2" fill="currentColor" />
          </svg>
          {/* Drifting petals */}
          <div className="absolute inset-0 opacity-35">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`l5684-i-${i}`} 
                className="absolute text-sm animate-snow-contained"
                style={{
                  left: `${(i * 20) % 85 + 5}%`,
                  top: `-${(i * 8) % 30}%`,
                  animationDuration: `${3.5 + (i % 2) * 1.5}s`,
                  animationDelay: `-${i * 1.1}s`,
                  transform: `rotate(${i * 45}deg)`
                }}
              >
                🌸
              </div>
            ))}
          </div>
        </div>
      );

    case '7': // Học Đường (Trắng, Lá vàng rơi) - Schoolyard / Autumn
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Blue lined notebook pattern with margin */}
          <div className="absolute inset-y-0 left-6 w-[1px] bg-red-400/40 z-10" />
          <div className="absolute inset-0 bg-notebook-light opacity-40" />
          
          {/* Paper airplane sketch and falling leaves */}
          <div className="absolute top-3 left-10 text-sm opacity-20 select-none animate-[float-gentle_7s_infinite_alternate]">✈️</div>
          <div className="absolute bottom-2 right-8 text-xs opacity-15 select-none font-serif rotate-12">Music & Life 📖</div>
          
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`l5715-i-${i}`} 
                className="absolute text-sm animate-snow-contained"
                style={{
                  left: `${(i * 22) % 80 + 10}%`,
                  top: `-${(i * 10) % 25}%`,
                  animationDuration: `${4.0 + (i % 2) * 2.0}s`,
                  animationDelay: `-${i * 1.5}s`,
                  transform: `rotate(${i * 30}deg)`
                }}
              >
                {['🍁', '🍂', '🍃', '🎓'][i % 4]}
              </div>
            ))}
          </div>
        </div>
      );

    case '8': // Tổ Quốc (Đỏ, Cờ phấp phới) - Patriotism (Vietnam Flag: 1 single center gold star with flag wave & light loop)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Radial Golden Sunbeams pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15 text-yellow-300" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(100, 50)">
              {Array.from({ length: 16 }).map((_, i) => (
                <line 
                  key={`l5740-i-${i}`} 
                  x1="0" 
                  y1="0" 
                  x2="500" 
                  y2="0" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  transform={`rotate(${(360 / 16) * i})`} 
                />
              ))}
            </g>
          </svg>
          
          {/* Flag Waving Light Sweep Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/15 to-transparent animate-[shimmer-sweep_4s_easeInOut_infinite] pointer-events-none" />

          {/* EXACT SINGLE 5-POINTED GOLDEN STAR IN DEAD CENTER (Flag Waving & Light Pulse Animation) */}
          <motion.div 
            animate={{
              scale: [1, 1.05, 0.98, 1.03, 1],
              rotate: [-2, 2, -1, 1.5, -2],
              opacity: [0.88, 1.0, 0.88]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FFD700] select-none pointer-events-none filter drop-shadow-[0_0_35px_rgba(255,215,0,0.95)] drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]"
          >
            <svg className="w-32 h-32 sm:w-40 sm:h-40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.div>
        </div>
      );

    case '9': // Cầu Vồng - Rainbow
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Concentric rainbow arches */}
          <svg className="absolute inset-x-0 bottom-0 w-full h-[64px] opacity-15" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d="M 0 50 A 50 50 0 0 1 100 50" fill="none" stroke="#f43f5e" strokeWidth="4" />
            <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#fb923c" strokeWidth="4" />
            <path d="M 16 50 A 34 34 0 0 1 84 50" fill="none" stroke="#facc15" strokeWidth="4" />
            <path d="M 24 50 A 26 26 0 0 1 76 50" fill="none" stroke="#4ade80" strokeWidth="4" />
            <path d="M 32 50 A 18 18 0 0 1 68 50" fill="none" stroke="#60a5fa" strokeWidth="4" />
            <path d="M 40 50 A 10 10 0 0 1 60 50" fill="none" stroke="#a78bfa" strokeWidth="4" />
          </svg>
          {/* Colorful glossy bubbles and sparkles */}
          <div className="absolute inset-0 opacity-35">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`l5792-i-${i}`} 
                className="absolute rounded-full border border-pink-400/30 bg-gradient-to-tr from-sky-300/10 to-pink-300/15 animate-bounce"
                style={{
                  left: `${(i * 18) % 80 + 10}%`,
                  top: `${(i * 15) % 60 + 15}%`,
                  width: `${(i % 3) * 4 + 8}px`,
                  height: `${(i % 3) * 4 + 8}px`,
                  animationDuration: `${3.0 + (i % 2) * 1.5}s`,
                  animationDelay: `-${i * 0.6}s`
                }}
              />
            ))}
            <div className="absolute top-3 left-10 text-xs text-yellow-300 animate-pulse">✨</div>
            <div className="absolute top-8 right-16 text-sm text-pink-300 animate-pulse" style={{ animationDelay: '0.8s' }}>✨</div>
          </div>
        </div>
      );

    case '10': // Hip Hop (Đường phố) - Hip Hop
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Brick wall pattern layout */}
          <svg className="absolute inset-0 w-full h-full opacity-12 text-white" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="brickpattern" x="0" y="0" width="48" height="24" patternUnits="userSpaceOnUse">
                <rect width="48" height="24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <line x1="24" y1="0" x2="24" y2="12" stroke="currentColor" strokeWidth="0.5" />
                <line x1="0" y1="12" x2="48" y2="12" stroke="currentColor" strokeWidth="0.5" />
                <line x1="12" y1="12" x2="12" y2="24" stroke="currentColor" strokeWidth="0.5" />
                <line x1="36" y1="12" x2="36" y2="24" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brickpattern)" />
          </svg>
          {/* Neon Graffiti Spray Splatters & Crowns */}
          <div className="absolute top-2 right-6 text-sm opacity-20 select-none rotate-12">👑</div>
          <div className="absolute bottom-2 left-6 text-xl opacity-10 select-none -rotate-12">🔥</div>
          <div className="absolute inset-0 opacity-25">
            {['⛓️', '🎵', '⛓️', '🔥'].map((item, i) => (
              <div 
                key={`l5832-i-${i}`} 
                className="absolute text-sm animate-pulse"
                style={{
                  left: `${(i * 26) % 70 + 15}%`,
                  top: `${(i * 21) % 55 + 20}%`,
                  transform: `rotate(${i * 20}deg)`,
                  animationDuration: `${2.5 + (i % 2) * 1.2}s`,
                  animationDelay: `-${i * 0.4}s`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case '11': // Kỳ bí (Đen vàng, Trăng khói mưa) - Mystic / Mysterious
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Constellations Map Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15 text-amber-500" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="1.5" fill="currentColor" />
            <circle cx="130" cy="45" r="1" fill="currentColor" />
            <circle cx="220" cy="20" r="2" fill="currentColor" />
            <circle cx="80" cy="75" r="1.5" fill="currentColor" />
            <circle cx="190" cy="85" r="1.5" fill="currentColor" />
            <path d="M 30 30 L 80 75 M 130 45 L 190 85 L 220 20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" fill="none" />
          </svg>
          {/* Full Moon Outline & Golden dust */}
          <div className="absolute top-2 right-6 w-10 h-10 rounded-full bg-amber-400/5 border border-amber-300/20 blur-xs animate-pulse" />
          <div className="absolute top-3 right-7 text-sm opacity-35">🌕</div>
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={`l5867-i-${i}`} 
                className="absolute bg-amber-300/50 rounded-full animate-pulse"
                style={{
                  left: `${(i * 18) % 85 + 5}%`,
                  top: `${(i * 19) % 70 + 15}%`,
                  width: '2px',
                  height: '2px',
                  animationDelay: `-${i * 0.6}s`
                }}
              />
            ))}
          </div>
        </div>
      );

    case '12': // Cổ điển (Nâu, retro) - Classic / Retro Record
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Vinyl Record Grooves concentric circles */}
          <svg className="absolute -right-6 -top-6 w-36 h-36 opacity-[0.14] text-[#8D6E63] animate-[rotate-slow_12s_linear_infinite]" xmlns="http://www.w3.org/2000/svg">
            <circle cx="72" cy="72" r="68" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="72" cy="72" r="54" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="72" cy="72" r="40" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="72" cy="72" r="26" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="72" cy="72" r="14" fill="currentColor" />
          </svg>
          {/* Retro Warm halftone dotted pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(141,110,99,0.12)_1px,transparent_1px)] bg-[size:12px_12px]" />
          
          {/* Classic gold notes and Gramophone symbol */}
          <div className="absolute bottom-3 left-6 text-xl text-[#8D6E63]/25 rotate-12">🎼</div>
          <div className="absolute inset-0 opacity-25">
            {['♪', '♩', '♫', '♬'].map((note, i) => (
              <div 
                key={`l5901-i-${i}`} 
                className="absolute text-amber-700/40 font-serif text-sm animate-bounce"
                style={{
                  left: `${(i * 22) % 65 + 15}%`,
                  top: `${(i * 18) % 55 + 25}%`,
                  animationDuration: `${3.0 + i}s`,
                  animationDelay: `-${i * 0.8}s`
                }}
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      );

    case '13': // Hoàng hôn (Cam đỏ trời chiều) - Sunset
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Silhouetted mountain range at the bottom of sunset */}
          <svg className="absolute bottom-0 left-0 right-0 h-10 text-orange-950/40 opacity-40" viewBox="0 0 300 50" preserveAspectRatio="none">
            <path d="M0,50 L40,30 L90,45 L150,20 L210,40 L260,25 L300,50 Z" fill="currentColor" />
          </svg>
          {/* Sunset Horizon Sun outline */}
          <div className="absolute bottom-0 left-16 w-32 h-16 rounded-t-full bg-gradient-to-t from-orange-500/10 via-orange-400/5 to-transparent border-t border-orange-400/20" />
          <div className="absolute bottom-1 left-24 w-14 h-14 rounded-full bg-amber-400/25 blur-xs" />
          
          {/* Drifting warm clouds and birds */}
          <div className="absolute top-4 left-1/4 text-xs text-orange-400/15 select-none animate-[drift_24s_linear_infinite]">🕊️ 🕊️</div>
          <div className="absolute inset-0 opacity-25 bg-gradient-to-tr from-rose-500/5 via-orange-500/5 to-yellow-500/15" />
          <div className="absolute inset-0 opacity-25">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`l5934-i-${i}`} 
                className="absolute bg-orange-300/35 rounded-full animate-pulse"
                style={{
                  left: `${(i * 21) % 80 + 10}%`,
                  top: `${(i * 15) % 60 + 15}%`,
                  width: `${(i % 2) * 4 + 4}px`,
                  height: `${(i % 2) * 1 + 2}px`,
                }}
              />
            ))}
          </div>
        </div>
      );

    case '14': // Đại Dương (Sóng biển) - Ocean
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Sun shining down on water */}
          <div className="absolute top-2 right-12 w-10 h-10 rounded-full bg-amber-200/10 border border-amber-200/25 shadow-inner flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 rounded-full bg-amber-300/30 blur-xs" />
          </div>
          {/* Light sunbeam vectors stretching down */}
          <svg className="absolute inset-0 w-full h-full opacity-10 text-amber-100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="120,0 90,120 130,120" fill="currentColor" />
            <polygon points="140,0 120,120 180,120" fill="currentColor" />
            <polygon points="100,0 60,120 80,120" fill="currentColor" />
          </svg>

          {/* Sea bubbles rising & ocean background radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#0ea5e912,transparent_50%)]" />
          <div className="absolute inset-0 opacity-35">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`l5967-i-${i}`} 
                className="absolute rounded-full border border-sky-400/40 bg-sky-200/10 animate-bounce"
                style={{
                  left: `${(i * 22) % 75 + 10}%`,
                  top: `${(i * 19) % 65 + 15}%`,
                  width: `${(i % 2) * 2 + 5}px`,
                  height: `${(i % 2) * 2 + 5}px`,
                  animationDuration: `${2.5 + i}s`,
                  animationDelay: `-${i * 0.7}s`
                }}
              />
            ))}
            {/* Tiny Fish symbol swimming */}
            <div className="absolute bottom-4 left-6 text-xs text-sky-400/25 select-none animate-[drift_15s_linear_infinite]">🐟</div>
          </div>
          {/* Waves at the bottom of the card */}
          <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden opacity-25">
            <svg className="absolute bottom-0 w-[200%] h-full translate-x-0 animate-[wave_6s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z" fill="#0ea5e9" />
            </svg>
          </div>
        </div>
      );

    case '15': // Retro 8-Bit (Game) - 8-Bit
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Pixel grid blocks */}
          <svg className="absolute inset-0 w-full h-full opacity-12 text-emerald-400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pixelgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="currentColor" stroke="none" opacity="0.3" />
                <rect x="8" y="8" width="8" height="8" fill="currentColor" stroke="none" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pixelgrid)" />
          </svg>
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,_rgba(0,0,0,0.12)_50%)] bg-[size:100%_4px]" />
          {/* Jumping 8-bit game items */}
          <div className="absolute inset-0 opacity-40 font-mono text-xs">
            {['👾', '🍒', '⭐', '🪙', '❤️'].map((item, i) => (
              <div 
                key={`l6010-i-${i}`} 
                className="absolute animate-bounce"
                style={{
                  left: `${(i * 20) % 80 + 10}%`,
                  top: `${(i * 17) % 55 + 25}%`,
                  animationDuration: `${1.5 + (i % 2) * 0.8}s`,
                  animationDelay: `-${i * 0.4}s`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case '16': // Xếp hình Puzzle - Jigsaw
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Puzzle outline pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-12 text-purple-400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="puzzlepattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 C 5 20, 5 15, 10 15 C 15 15, 15 20, 20 20 L 20 40 L 0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 20 0 C 20 5, 25 5, 25 10 C 25 15, 20 15, 20 20 L 40 20 L 40 0 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#puzzlepattern)" />
          </svg>
          {/* Floating jigsaw pieces */}
          <div className="absolute inset-0 opacity-30">
            {['🧩', '🧩', '🧩'].map((puzzle, i) => (
              <div 
                key={`l6043-i-${i}`} 
                className="absolute text-sm animate-bounce"
                style={{
                  left: `${(i * 30) % 65 + 15}%`,
                  top: `${(i * 22) % 55 + 20}%`,
                  transform: `rotate(${i * 45}deg)`,
                  animationDuration: `${3.5 + i}s`,
                  animationDelay: `-${i * 1.2}s`
                }}
              >
                {puzzle}
              </div>
            ))}
          </div>
        </div>
      );

    case '17': // Cổ vũ (Mây, mặt trời) - Cheer / Sky (Matches Image 3 perfectly!)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Subtle Sun rays spinning background */}
          <div className="absolute top-2 left-6 w-16 h-16 rounded-full bg-amber-300/10 blur-md animate-pulse" />
          
          {/* Fluffy Overlapping Cloud Layers (Perfectly matching Image 3 layout!) */}
          <svg className="absolute bottom-0 left-0 right-0 w-full h-[80%] text-sky-400/15" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Cloud Layer 1 - Deep/Bottom */}
            <path d="M 0,200 L 0,160 Q 40,140 80,160 Q 120,130 160,160 Q 200,120 240,160 Q 280,140 320,170 Q 360,150 400,160 L 400,200 Z" fill="rgba(255,255,255,0.08)" />
            {/* Cloud Layer 2 - Middle */}
            <path d="M 0,200 L 0,175 Q 30,160 60,175 Q 100,145 140,175 Q 180,155 220,175 Q 260,160 300,180 Q 350,165 400,175 L 400,200 Z" fill="rgba(255,255,255,0.12)" />
            {/* Cloud Layer 3 - Topmost */}
            <path d="M 0,200 L 0,185 Q 50,175 100,185 Q 150,170 200,185 Q 250,175 300,188 Q 350,180 400,185 L 400,200 Z" fill="rgba(255,255,255,0.22)" />
          </svg>

          {/* Floating Party Elements (Confetti/Balloons) */}
          <div className="absolute top-1 right-8 text-sm opacity-20 select-none animate-[float-gentle_10s_infinite_alternate]">☁️</div>
          <div className="absolute bottom-10 left-16 text-lg opacity-10 select-none animate-[float-gentle_14s_infinite_alternate_reverse]">☁️</div>
          
          <div className="absolute inset-0 opacity-40">
            {['🎉', '✨', '🎈', '✨', '🎈'].map((item, i) => (
              <div 
                key={`l6083-i-${i}`} 
                className="absolute text-xs animate-bounce"
                style={{
                  left: `${(i * 21) % 80 + 10}%`,
                  top: `${(i * 18) % 50 + 15}%`,
                  animationDuration: `${2.0 + (i % 2) * 1.2}s`,
                  animationDelay: `-${i * 0.3}s`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case '18': // Pháo hoa (Năm mới) - Fireworks
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Starburst concentric patterns */}
          <svg className="absolute inset-0 w-full h-full opacity-12 text-amber-300" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="200" cy="70" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          </svg>
          {/* Multiple bursting firework stars */}
          <div className="absolute inset-0 opacity-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`l6111-c-${i}`} 
                className="absolute bg-cyan-400/40 rounded-full animate-ping"
                style={{
                  left: `${(i * 22) % 75 + 10}%`,
                  top: `${(i * 18) % 65 + 15}%`,
                  width: `${(i % 2) * 4 + 4}px`,
                  height: `${(i % 2) * 4 + 4}px`,
                  animationDuration: `${1.8 + (i % 3) * 0.6}s`,
                  animationDelay: `-${i * 0.4}s`
                }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`l6125-f-${i}`} 
                className="absolute bg-fuchsia-400/45 rounded-full animate-ping"
                style={{
                  left: `${(i * 27) % 70 + 15}%`,
                  top: `${(i * 15) % 60 + 20}%`,
                  width: `${(i % 2) * 3 + 3}px`,
                  height: `${(i % 2) * 3 + 3}px`,
                  animationDuration: `${2.2 + (i % 2) * 0.5}s`,
                  animationDelay: `-${i * 0.9}s`
                }}
              />
            ))}
          </div>
        </div>
      );

    case '19': // Mùa thu (Lá rơi) - Autumn / Fall
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Birch branch silhouette */}
          <svg className="absolute inset-0 w-full h-full opacity-10 text-amber-700" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 0 C 40 18, 80 12, 120 30 M 120 30 C 160 35, 200 18, 260 40" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 70 14 C 80 28, 100 38, 120 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          {/* Drifting maple leaves and acorns */}
          <div className="absolute inset-0 opacity-40">
            {['🍁', '🌰', '🍁', '🍂', '🍂'].map((item, i) => (
              <div 
                key={`l6153-i-${i}`} 
                className="absolute text-sm animate-snow-contained"
                style={{
                  left: `${(i * 20) % 80 + 10}%`,
                  top: `-${(i * 9) % 30}%`,
                  animationDuration: `${3.8 + (i % 2) * 1.5}s`,
                  animationDelay: `-${i * 1.2}s`,
                  transform: `rotate(${i * 45}deg)`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    case '20': // Ngọt ngào (Pastel) - Pastel Sweet (Matches Image 6!)
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Memphis Sweet Pastel Geometry SVGs (From Image 6!) */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            {/* Halftone dotted circle grid / matrix (From Image 6!) */}
            <defs>
              <pattern id="dotmatrix" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#2563eb" opacity="0.4" />
              </pattern>
            </defs>
            <rect x="15" y="15" width="80" height="80" fill="url(#dotmatrix)" transform="scale(0.8) translate(30, 10)" />

            {/* Zig-zag line (From Image 6!) */}
            <polyline points="200,15 220,30 240,15 260,30 280,15 300,30" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Blue Hexagon (From Image 6!) */}
            <polygon points="120,70 140,60 140,80 120,90 100,80 100,60" fill="#1d4ed8" opacity="0.35" transform="scale(0.7) translate(80, 20)" />

            {/* Light blue outlines of circles/squares */}
            <circle cx="45" cy="25" r="8" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.4" />
            <rect x="20" y="80" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
          </svg>

          {/* Diagonal pastel stripe pattern overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-10 text-pink-300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pastelstripes" x="0" y="0" width="24" height="24" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="24" stroke="currentColor" strokeWidth="2.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pastelstripes)" />
          </svg>

          {/* Sweet bubbles, clouds & pastel stars */}
          <div className="absolute top-2 left-8 text-sm opacity-20 select-none animate-[float-gentle_8s_infinite_alternate]">☁️</div>
          <div className="absolute inset-0 opacity-35">
            {['🫧', '⭐', '🫧', '✨', '💖'].map((item, i) => (
              <div 
                key={`l6209-i-${i}`} 
                className="absolute text-xs animate-bounce"
                style={{
                  left: `${(i * 22) % 80 + 10}%`,
                  top: `${(i * 18) % 60 + 20}%`,
                  animationDuration: `${2.2 + (i % 2) * 1}s`,
                  animationDelay: `-${i * 0.5}s`
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Subtle elegant dotted grid background so no theme has flat solid colors */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] text-amber-500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="defaultgrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.75" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#defaultgrid)" />
          </svg>
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={`l6240-i-${i}`} 
                className="absolute bg-amber-400/20 rounded-full animate-pulse"
                style={{
                  left: `${(i * 23) % 80 + 10}%`,
                  top: `${(i * 19) % 80 + 10}%`,
                  width: '4px',
                  height: '4px',
                }}
              />
            ))}
          </div>
        </div>
      );
  }
}

export default function App() {
  const [lang, setLang] = useState(() => {
    const isManual = localStorage.getItem('manualLangSelected') === 'true';
    if (isManual) {
      return localStorage.getItem('preferredLang') || 'vi';
    }
    // Auto-detect synchronously (crucial for Chrome DevTools Sensors testing)
    const browserLang = navigator.language || '';
    if (browserLang.startsWith('vi')) return 'vi';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('th')) return 'th';
    if (browserLang.startsWith('zh')) return 'zh';

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (tz.includes('Seoul') || tz.includes('Pyongyang')) return 'ko';
        if (tz.includes('Tokyo')) return 'ja';
        if (tz.includes('Bangkok')) return 'th';
        if (tz.includes('Taipei') || tz.includes('Shanghai') || tz.includes('Hong_Kong') || tz.includes('Beijing') || tz.includes('Chongqing')) return 'zh';
        if (tz.includes('Ho_Chi_Minh')) return 'vi';
      }
    } catch (e) {}

    return 'en';
  });
  const [artistData, setArtistData] = useState<any>(null);
  const [landingConfig, setLandingConfig] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('preferredLang', lang);
  }, [lang]);

  useEffect(() => {
    fetch('/api/public/landing-config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setLandingConfig(data);
        }
      })
      .catch(err => console.error("Error loading landing-config globally:", err));
  }, []);

  const handleLogout = async () => {
    if ((window as any).clearAllSessions) {
      await (window as any).clearAllSessions();
    } else {
      // fallback
      const keysToRemove = Object.keys(localStorage).filter(k => 
        k.includes('adminToken') || k.includes('activeAdmin') || k.includes('memberToken')
      );
      keysToRemove.forEach(k => {
        if ((window as any).__originalRemoveItem__) {
          (window as any).__originalRemoveItem__.call(localStorage, k);
        } else {
          localStorage.removeItem(k);
        }
      });
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (e) {}
    }
    window.location.href = getLogoutRedirectUrl();
  };

  useEffect(() => {
    const isManual = localStorage.getItem('manualLangSelected') === 'true';
    if (isManual) {
      const preferred = localStorage.getItem('preferredLang');
      if (preferred) {
        setLang(preferred);
      }
      return;
    }
    fetch('https://get.geojs.io/v1/ip/country.json').then(r=>r.json()).then(res => {
      const isManualCheck = localStorage.getItem('manualLangSelected') === 'true';
      if (isManualCheck) return;
      const code = res.country;
      if (code === 'KR') setLang('ko');
      else if (code === 'JP') setLang('ja');
      else if (code === 'TH') setLang('th');
      else if (code === 'CN' || code === 'TW') setLang('zh');
      else if (code === 'US' || code === 'GB' || code === 'AU' || code === 'CA') setLang('en');
      else setLang('vi');
    }).catch(() => {
      // Keep synchronous detection fallback if API fails
    });
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
    <LanguageContext.Provider value={{ lang, setLang, artistData, setArtistData, landingConfig, setLandingConfig }}>
      <BrowserRouter>
        <AdminFloatingControls onLogout={handleLogout} />
        <UnifiedArtistSessionFloatingWidget onLogout={handleLogout} />
        <AdminFloatingAddButton />
        <AnimatedRoutes />
      </BrowserRouter>
    </LanguageContext.Provider>
  );
}

// ---- HOME PAGE ----

const AutoTranslate = ({ text, className = "" }: { text: string; className?: string }) => {
  const { lang, artistData, landingConfig } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
     if (lang === 'vi') {
        setTranslated(text);
        return;
     }

     // 1. Check for specific artist static translation first
     let staticTr = artistData?.staticTranslations?.[lang]?.[text.trim()];
     if (!staticTr) {
        // 2. Fallback to general/common static translations (landingConfig)
        staticTr = landingConfig?.staticTranslations?.[lang]?.[text.trim()];
     }

     if (staticTr) {
        setTranslated(staticTr);
     } else {
        setTranslated(text);
     }
  }, [lang, text, artistData, landingConfig]);

  return <span className={className}>{translated}</span>;
};

const renderTextWithBannedKeywords = (textVal: string, keywords: string[], formatTextFn?: (t: string) => any) => {
  if (!textVal) return "";
  if (!keywords || keywords.length === 0) {
    return formatTextFn ? formatTextFn(textVal) : textVal;
  }
  const escaped = keywords
    .map(kw => kw.trim())
    .filter(Boolean)
    .map(kw => kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  if (escaped.length === 0) {
    return formatTextFn ? formatTextFn(textVal) : textVal;
  }
  try {
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = textVal.split(regex);
    return (
      <>
        {parts.map((part, idx) => {
          const isBanned = keywords.some(kw => kw.trim().toLowerCase() === part.trim().toLowerCase());
          if (isBanned) {
            return (
              <span
                key={`l6442-idx-3-${idx}`}
                className="select-none filter blur-[4.5px] hover:blur-[1.5px] transition-all duration-300 cursor-help inline-block bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mx-0.5"
                title="Từ khóa bị cấm"
              >
                {part}
              </span>
            );
          }
          return (
            <React.Fragment key={`rtbk-${idx}`}>
              {formatTextFn ? formatTextFn(part) : part}
            </React.Fragment>
          );
        })}
      </>
    );
  } catch (e) {
    return formatTextFn ? formatTextFn(textVal) : textVal;
  }
};

const HoverTranslate = ({ text, className = "", format = false, style, forceDark = false, bgMode }: { text: string; className?: string, format?: boolean, style?: React.CSSProperties, forceDark?: boolean, bgMode?: 'light' | 'red' | 'dark' }) => {
  const { lang, artistData, landingConfig } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
     if (lang === 'vi') {
        setTranslated(text);
        return;
     }

     // 1. Check for specific artist static translation first
     let staticTr = artistData?.staticTranslations?.[lang]?.[text.trim()];
     if (!staticTr) {
        // 2. Fallback to general/common static translations (landingConfig)
        staticTr = landingConfig?.staticTranslations?.[lang]?.[text.trim()];
     }

     if (staticTr) {
        setTranslated(staticTr);
     } else {
        setTranslated(text);
     }
  }, [lang, text, artistData, landingConfig]);

  const output = (isHovered && lang !== 'vi') ? translated : text;
  const keywords = landingConfig?.forbiddenKeywords || [];
  const isGold = forceDark ? false : artistData?.adminTheme === 'gold';

  return (
    <span 
      className={className} 
      style={style}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderTextWithBannedKeywords(output, keywords, format ? (t) => formatText(t, false, isGold, bgMode) : undefined)}
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

export const LanguageSwitcher = ({ isRelative = false, pushDown = false }: { isRelative?: boolean, pushDown?: boolean }) => {
  const { lang, setLang } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const langs = ['vi', 'en', 'ko', 'ja', 'th', 'zh'];

  return (
    <div className={isRelative ? "relative z-[9999]" : `fixed right-6 z-[9999] pointer-events-auto transition-all duration-500 ease-in-out top-6 sm:top-8`}>
      <div 
        className={`flex items-center gap-2 ${isRelative ? 'bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-850 h-10 px-3.5' : 'bg-black/30 hover:bg-black/50 border border-white/20 text-white px-4 py-2 shadow-lg'} rounded-full backdrop-blur-xl cursor-pointer transition-all hover:pr-5 group`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <Globe className={`w-4 h-4 ${isRelative ? 'text-stone-600 group-hover:text-stone-850' : 'text-white/90 group-hover:text-white'} transition-colors`} />
        <span className={`font-bold uppercase text-xs tracking-wider ${isRelative ? 'text-stone-800' : 'text-white'}`}>{lang}</span>
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute right-0 top-full mt-3 flex flex-col ${isRelative ? 'bg-white border border-stone-200 text-stone-800 shadow-xl' : 'bg-neutral-950/90 border border-white/10 text-white shadow-2xl'} rounded-2xl overflow-hidden origin-top-right z-[10000]`}
          >
            {langs.map(l => (
              <button 
                key={l}
                onClick={() => { 
                  setLang(l); 
                  localStorage.setItem('preferredLang', l);
                  localStorage.setItem('manualLangSelected', 'true');
                  setOpen(false); 
                }}
                className={`px-6 py-3.5 text-sm font-medium transition-colors text-left flex items-center justify-between min-w-[140px] ${isRelative ? 'border-b border-stone-100 last:border-0' : 'border-b border-white/5 last:border-0'} ${lang === l ? (isRelative ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-white/10 text-white') : (isRelative ? 'text-stone-600 hover:bg-stone-50 hover:text-stone-905' : 'text-neutral-400 hover:bg-white/5 hover:text-white')}`}
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

function AchievementBadge({ achievement, align = 'right', isLightBg = false }: { achievement: Achievement; align?: 'left' | 'right'; isLightBg?: boolean }) {
  const { lang } = useContext(LanguageContext);
  const dict: Record<string, Record<string, string>> = {
    vi: {
      "Về Tôi": "Về Tôi",
      "Tiểu Sử": "Tiểu Sử", "Tải Nhạc": "Tải Nhạc", "Đến Từ": "Đến Từ", "Sinh Sống": "Sinh Sống",
      "Quản lý Menu": "Quản lý Menu",
      "Giới thiệu nghệ sĩ": "Giới thiệu nghệ sĩ",
      "Tên Thật": "Tên Thật",
      "Ngày Sinh": "Ngày Sinh",
      "Địa Chỉ": "Đến Từ",
      "Công Ty": "Sinh Sống",
      "Danh Xưng": "Danh Xưng", "Ca nhạc sĩ, producer...": "Ca nhạc sĩ, producer...",
      "Email": "Email",
      "SĐT": "SĐT",
      "Học Vấn": "Học Vấn",
      "Kinh nghiệm": "Kinh nghiệm",
      "Thời gian": "Thời gian",
      "Sự Kiện": "Sự Kiện",
      
      "Thêm Menu Mới": "Thêm Menu Mới",
      "Tiêu Đề Menu": "Tiêu Đề Menu",
      "Đường Dẫn": "Đường Dẫn",
      "Thêm giai đoạn": "Thêm giai đoạn",
      trending: "Thịnh hành",
      views: "Lượt xem",
      streams: "Lượt nghe",
      viral: "Lan truyền"
    },
    en: { 
      trending: "Trending",
      views: "Views",
      streams: "Streams",
      viral: "Viral"
    },
    ko: { 
      trending: "인기 급상승",
      views: "조회수",
      streams: "스트리밍",
      viral: "바이럴"
    },
    ja: { 
      trending: "急上昇",
      views: "視聴回数",
      streams: "再生回数",
      viral: "バイラル"
    },
    th: { 
      trending: "มาแรง",
      views: "ยอดวิว",
      streams: "สตรีม",
      viral: "ไวรัล"
    },
    zh: { 
      trending: "热门趋势",
      views: "播放量",
      streams: "播放量",
      viral: "病毒传播"
    }
  };
  const t = (key: string) => {
    const l = dict[lang] || dict['vi'];
    return l[key] || key;
  };

  const isLeft = align !== 'right';
  const isCenter = align === 'center';
  const justifyClass = isCenter ? 'justify-center' : (isLeft ? 'justify-start' : 'justify-end');
  const type = achievement.type;

  if (type === 'youtube_trending' || type === 'youtube_views') {
    const isTrending = type === 'youtube_trending';
    const isTop1Trending = isTrending && (achievement.value?.toString().trim() === '1' || achievement.value?.toString().toLowerCase().trim() === 'top 1' || achievement.value?.toString().trim() === '#1');
    return (
      <div className={`flex flex-row items-center gap-1.5 sm:gap-2 w-full ${justifyClass} group/badge`}>
        <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#ff0f7b] to-[#f89b29] p-[1px] rounded-[4px] sm:rounded-xl shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-flicker-yt">
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-[3px] sm:rounded-[11px] flex items-center justify-center border border-red-400/20">
            <Play className="w-2 h-2 min-[360px]:w-2.5 min-[360px]:h-2.5 sm:w-4 sm:h-4 text-white ml-0.5 shadow-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" fill="currentColor" />
          </div>
        </div>
        <div className={`flex flex-col gap-0 sm:gap-0.5 items-start justify-center`}>
           <div className="flex border border-red-500 bg-red-500/10 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md items-center justify-center shadow-[0_0_4px_rgba(239,68,68,0.15)] animate-flicker-yt">
             <span className="text-[7px] min-[360px]:text-[7.5px] sm:text-[8px] font-black text-red-500 tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               YOUTUBE</span>
           </div>
           <h4 className={`text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white mt-0.5 flex flex-row items-center gap-0.5 ${isTop1Trending ? 'animate-yt-top1' : 'animate-slow-glow-yt'}`}>
             {isTrending ? (
               isLightBg ? (
                 <><span className="text-amber-800 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">TOP {achievement.value} </span><span className="text-stone-950 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">{t('trending')}</span></>
               ) : (
                 <><span className="text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)] whitespace-nowrap">TOP {achievement.value} </span><span className="text-stone-200 drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] whitespace-nowrap">{t('trending')}</span></>
               )
             ) : (
               isLightBg ? (
                 <><span className="text-red-700 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-950 font-black whitespace-nowrap">{t('views')}</span></span></>
               ) : (
                 <><span className="text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.3)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-200 whitespace-nowrap">{t('views')}</span></span></>
               )
             )}
           </h4>
        </div>
      </div>
    );
  }

  if (type === 'tiktok_viral') {
    return (
      <div className={`flex flex-row items-center gap-1.5 sm:gap-2 w-full ${justifyClass} group/badge`}>
        <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 bg-gradient-to-bl from-[#00f2fe] via-black to-[#fe0979] p-[1px] rounded-[4px] sm:rounded-xl shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-flicker-tt">
          <div className="w-full h-full bg-black rounded-[3px] sm:rounded-[11px] flex items-center justify-center border border-white/5">
            <TiktokIcon className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0 sm:gap-0.5 items-start justify-center`}>
           <div className="flex border border-teal-400 bg-teal-400/10 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md items-center justify-center shadow-[0_0_4px_rgba(20,184,166,0.15)] animate-flicker-tt">
             <span className="text-[7px] min-[360px]:text-[7.5px] sm:text-[8px] font-black text-teal-400 tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               TIKTOK</span>
           </div>
           <h4 className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white mt-0.5 animate-slow-glow-tt flex flex-row items-center">
             {isLightBg ? (
               <span className="text-stone-950 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">✨ {t('viral').toUpperCase()} ✨</span>
             ) : (
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] via-white to-[#fe0979] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] whitespace-nowrap">✨ {t('viral').toUpperCase()} ✨</span>
             )}
           </h4>
        </div>
      </div>
    );
  }

  if (type === 'spotify_streams') {
    return (
      <div className={`flex flex-row items-center gap-1.5 sm:gap-2 w-full ${justifyClass} group/badge`}>
        <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#1ED760] to-[#128a3c] p-[1px] rounded-full shrink-0 shadow-[0_0_10px_rgba(29,185,84,0.3)] animate-flicker-sp">
          <div className="w-full h-full bg-gradient-to-br from-[#1DB954] to-[#169c46] rounded-full flex items-center justify-center border border-white/20">
            <SpotifyIcon className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0 sm:gap-0.5 items-start justify-center`}>
           <div className="flex border border-[#1DB954] bg-[#1DB954]/10 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md items-center justify-center shadow-[0_0_4px_rgba(29,185,84,0.15)] animate-flicker-sp">
             <span className="text-[7px] min-[360px]:text-[7.5px] sm:text-[8px] font-black text-[#1DB954] tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               SPOTIFY</span>
           </div>
           <h4 className="text-[6.5px] min-[360px]:text-[7.5px] sm:text-[10px] font-black text-white mt-0.5 animate-slow-glow-sp flex flex-row items-center">
             {isLightBg ? (
               <span className="text-emerald-800 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-950 font-black whitespace-nowrap">{t('streams')}</span></span>
             ) : (
               <span className="text-[#1DB954] drop-shadow-[0_0_4px_rgba(29,185,84,0.5)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-200 whitespace-nowrap">{t('streams')}</span></span>
             )}
           </h4>
        </div>
      </div>
    );
  }

  if (type === 'zing_streams') {
    return (
      <div className={`flex flex-row items-center gap-1.5 sm:gap-2 w-full ${justifyClass} group/badge`}>
        <div className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#a855f7] to-[#6b21a8] p-[1px] rounded-full shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-flicker-zg">
          <div className="w-full h-full bg-gradient-to-br from-[#bc56fd] to-[#801bb6] rounded-full flex items-center justify-center border border-white/20 overflow-hidden">
            <ZingIcon className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-5 sm:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] scale-[1.8]" />
          </div>
        </div>
        <div className={`flex flex-col gap-0 sm:gap-0.5 items-start justify-center`}>
           <div className="flex border border-[#a855f7] bg-[#a855f7]/10 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md items-center justify-center shadow-[0_0_4px_rgba(168,85,247,0.15)] animate-flicker-zg">
             <span className="text-[7px] min-[360px]:text-[7.5px] sm:text-[8px] font-black text-[#bc56fd] tracking-widest uppercase text-center block" style={{ marginRight: '-0.1em' }}>
               ZING MP3</span>
           </div>
           <h4 className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-[10px] font-black text-white mt-0.5 animate-slow-glow-zg flex flex-row items-center">
             {isLightBg ? (
               <span className="text-purple-800 font-extrabold drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-950 font-black whitespace-nowrap">{t('streams')}</span></span>
             ) : (
               <span className="text-[#c084fc] drop-shadow-[0_0_4px_rgba(168,85,247,0.5)] whitespace-nowrap">&gt; {achievement.value} <span className="text-stone-200 whitespace-nowrap">{t('streams')}</span></span>
             )}
           </h4>
        </div>
      </div>
    );
  }

  return null;
}

function AchievementCycle({ achievements, align, isLightBg = false, prefix = 'ach' }: { achievements: any[]; align?: 'left' | 'right' | 'center'; isLightBg?: boolean; prefix?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const achievementsKey = useMemo(() => {
    return (achievements || []).map((a: any) => `${a.type || ''}-${a.value || ''}`).join(',');
  }, [achievements]);

  useEffect(() => {
    setCurrentIndex(0);
    if (!achievements || achievements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % achievements.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [achievementsKey]);

  if (!achievements || achievements.length === 0) return null;

  const isLeft = align !== 'right';
  const isCenter = align === 'center';
  const justifyClass = isCenter ? 'justify-center' : (isLeft ? 'justify-start' : 'justify-end');
  const curAch = achievements[currentIndex % achievements.length];

  return (
    <div className={`relative w-full h-full flex items-center ${justifyClass} overflow-visible`}>
      <AnimatePresence>
        <motion.div 
           key={`${prefix}-${curAch?.type || ''}-${curAch?.value || ''}-${currentIndex}`}
           initial={{ opacity: 0, y: 6 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -6 }}
           transition={{ duration: 0.25, ease: "easeInOut" }}
           className={`absolute inset-0 w-full h-full flex items-center ${justifyClass}`}
        >
           <AchievementBadge achievement={curAch} align={align} isLightBg={isLightBg} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SmartYouTubePlayer({
  videoId,
  title,
  className = "w-full h-full",
  autoPlay = true
}: {
  videoId: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ytLink = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    setHasError(false);
    if (!videoId) return;

    let player: any = null;
    let isMounted = true;

    const handleMessage = (e: MessageEvent) => {
      if (!isMounted) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data) {
          if (data.event === 'onError' || (data.info && data.info.error)) {
            const errCode = data.info?.error || data.info;
            if ([2, 5, 100, 101, 150].includes(errCode)) {
              setHasError(true);
            }
          }
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);

    const initPlayer = () => {
      if (!containerRef.current || !(window as any).YT || !(window as any).YT.Player) return;
      try {
        const elemId = `yt-player-container-${videoId}-${Math.random().toString(36).substring(2, 7)}`;
        containerRef.current.innerHTML = `<div id="${elemId}" class="w-full h-full"></div>`;
        player = new (window as any).YT.Player(elemId, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (evt: any) => {
              if (autoPlay && evt.target && evt.target.playVideo) {
                try {
                  evt.target.playVideo();
                } catch (e) {}
              }
            },
            onError: (evt: any) => {
              console.warn("YouTube player error:", evt.data);
              if (isMounted) {
                setHasError(true);
              }
            }
          }
        });
      } catch (err) {
        console.warn("Error creating YT Player:", err);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prevReady = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {}
      }
    };
  }, [videoId, autoPlay]);

  if (hasError) {
    return (
      <a 
        href={ytLink} 
        target="_blank" 
        rel="noreferrer" 
        className="w-full h-full relative bg-neutral-950 group overflow-hidden flex flex-col items-center justify-center cursor-pointer p-4 text-decoration-none"
        title="Bấm để phát trực tiếp trên YouTube"
      >
        <img 
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
          onError={(e) => {
            e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
          alt={title || "YouTube Video"} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/50 group-hover:via-black/50 transition-all duration-300" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg gap-3 p-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/90 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center text-white shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all duration-300 group-hover:scale-110 relative">
            <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-40"></span>
            <Play className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white translate-x-0.5" />
          </div>

          <div className="flex flex-col gap-2 items-center">
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide group-hover:text-red-400 transition-colors drop-shadow-md">
              Bấm để mở & phát trực tiếp trên YouTube ↗
            </h4>
            <p className="text-xs sm:text-sm font-medium text-stone-200 bg-red-950/80 border border-red-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md max-w-md shadow-lg">
              Video này bị chủ sở hữu/YouTube giới hạn phát nhúng trên trang web. Vui lòng bấm vào đây để mở và xem trực tiếp trên YouTube.
            </p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <div className={`relative ${className} bg-neutral-950`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

function RandomSongCard({ 
  randomSong, 
  data, 
  isGoldTheme, 
  isMusicianTheme,
  activeListTab, 
  getSongCoverUrl, 
  isMobile, 
  formatText, 
  getArtistLink, 
  setActiveBioSong, 
  t 
}: { 
  randomSong: any; 
  data: any; 
  isGoldTheme: boolean; 
  isMusicianTheme?: boolean;
  activeListTab: string; 
  getSongCoverUrl: (url?: string) => string; 
  isMobile: boolean; 
  formatText: (text: string, flag?: boolean, goldThemeFlag?: boolean, bgMode?: 'light' | 'red' | 'dark' | boolean) => any; 
  getArtistLink: (path: string) => string; 
  setActiveBioSong: (song: any) => void; 
  t: any; 
}) {
  const [displaySong, setDisplaySong] = useState(randomSong);
  const [prevSong, setPrevSong] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (randomSong && randomSong.id !== displaySong?.id) {
      setPrevSong(displaySong);
      setDisplaySong(randomSong);
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevSong(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [randomSong?.id, displaySong?.id]);

  const randStylesCurrent = getRandomSongCardStyles(displaySong);
  const prevKey = prevSong ? (prevSong.id || prevSong.slug || prevSong.title || 'prev') : '';
  const currKey = displaySong ? (displaySong.id || displaySong.slug || displaySong.title || 'curr') : '';
  const hasRandomSongAchievements = displaySong?.achievements && displaySong.achievements.length > 0;
  const activeRandomSongAchievements = hasRandomSongAchievements;

  if (!displaySong) return null;

  return (
    <motion.div
      layout
      transition={{
        layout: { type: "spring", stiffness: 280, damping: 28 }
      }}
      className="w-full relative rounded-[20px]"
    >
      <Link
        to={activeListTab === 'released' ? getArtistLink(`/playlist/released?song=${displaySong.slug || displaySong.id}`) : getArtistLink(`/song/${displaySong.slug || displaySong.id}`)}
        onClick={(e) => {
          if (displaySong.linkType === 'indirect') {
            e.preventDefault();
            const indirectLinks = [
              displaySong.linkSpotify,
              displaySong.linkApple,
              displaySong.linkZing,
              displaySong.linkYoutubeMusic,
              displaySong.linkYoutube
            ].filter(l => !!l);
            
            if (indirectLinks.length === 1 && indirectLinks[0]) {
              window.open(indirectLinks[0], '_blank');
            } else {
              setActiveBioSong(displaySong);
            }
          }
        }}
        className="group relative overflow-visible rounded-[20px] p-2.5 sm:p-3 flex flex-row items-center justify-between gap-2.5 sm:gap-4 w-full sm:hover:scale-[1.015] sm:hover:-translate-y-0.5 transition-all duration-300 ease-out"
        style={{ minHeight: '112px' }}
      >
        {/* PC Version Card Ambient Animation for PC */}
        <div className="hidden sm:block absolute inset-0 rounded-[20px] pointer-events-none overflow-hidden z-[2] select-none">
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent skew-x-12"
          />
        </div>
        {/* Background transitions */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Prev background layer fading out */}
          {prevSong && (
            <motion.div 
              layout
              key={`${prevKey}_bg_prev`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut", layout: { type: "spring", stiffness: 280, damping: 28 } }}
              style={getRandomSongCardStyles(prevSong).customStyle}
              className={`absolute inset-0 rounded-[20px] ${getRandomSongCardStyles(prevSong).bgClasses} ${isMusicianTheme ? 'border-0' : `${getRandomSongCardStyles(prevSong).borderClass} ${getRandomSongCardStyles(prevSong).shadowClass}`}`}
            />
          )}
          {/* Current background layer fading in */}
          <motion.div 
            layout
            key={`${currKey}_bg`}
            initial={prevSong ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut", layout: { type: "spring", stiffness: 280, damping: 28 } }}
            style={randStylesCurrent.customStyle}
            className={`absolute inset-0 rounded-[20px] ${randStylesCurrent.bgClasses} ${isMusicianTheme ? 'border-0' : `${randStylesCurrent.borderClass} ${randStylesCurrent.shadowClass}`}`}
          />
        </div>

        {/* Dynamic theme-specific background and effects */}
        <div className="absolute inset-0 overflow-hidden rounded-[20px] z-[1] pointer-events-none">
          {renderContainedEffect(displaySong.template || '1')}
        </div>

        {/* Glossy overlay effect for cards with achievements */}
        {activeRandomSongAchievements && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/20 to-transparent pointer-events-none mix-blend-overlay z-[2]" />
        )}
        
        {/* Left-middle area: Cover Image and Text info */}
        <motion.div 
          layout 
          transition={{ layout: { type: "spring", stiffness: 280, damping: 28 } }}
          className="flex flex-row items-center gap-4 flex-1 min-w-0 relative z-10"
        >
          {/* Song Cover Image Container (Left side) */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden relative border border-[#D4AF37]/25 group-hover:border-[#D4AF37] transition-colors select-none shadow-md bg-stone-900/10">
            {/* Previous cover */}
            {prevSong && getSongCoverUrl(prevSong.thumbUrl || prevSong.coverUrl) && (
              <img 
                key={`${prevKey}_cover_prev`}
                src={getSongCoverUrl(prevSong.thumbUrl || prevSong.coverUrl)} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt=""
                referrerPolicy="no-referrer"
              />
            )}
            {/* Current cover with fade-in */}
            <motion.img 
              key={`${currKey}_cover`}
              src={getSongCoverUrl(displaySong.thumbUrl || displaySong.coverUrl) || ''} 
              initial={prevSong ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" 
              alt={displaySong.title} 
              referrerPolicy="no-referrer"
            />

            {/* Sweeping light effect during transition */}
            {isTransitioning && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 z-20 pointer-events-none"
              />
            )}

            {/* Play hover effect */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <div className="w-8 h-8 rounded-full bg-[#AA7C11] flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Year Badge inside the Image */}
            {displaySong.releaseYear && (
              <div className="absolute bottom-1 left-1 bg-black/55 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 z-20">
                {displaySong.releaseYear}
              </div>
            )}
          </div>

          {/* Song Content Details (Middle area) */}
          <motion.div 
            layout 
            transition={{ layout: { type: "spring", stiffness: 280, damping: 28 } }}
            className="flex-1 min-w-0 flex flex-col justify-center items-start text-left relative overflow-hidden py-1 min-h-[3.5rem]"
          >
            {/* Previous Text fading out */}
            {prevSong && (
              <motion.div
                key={`${prevKey}_text_prev`}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full flex flex-col justify-center items-start text-left z-0 pointer-events-none"
              >
                <h3 className={`font-black text-sm sm:text-base tracking-tight line-clamp-2 leading-tight ${getRandomSongCardStyles(prevSong).titleColor}`}>
                  {prevSong.title}
                </h3>
                <div className={`text-[11px] sm:text-xs mt-0.5 w-full truncate ${getRandomSongCardStyles(prevSong).singerColor}`}>
                  {prevSong.singer || prevSong.author || data?.artistName || 'Nghệ sĩ'}
                </div>
              </motion.div>
            )}

            {/* Current Text fading in */}
            <motion.div
              key={`${currKey}_text`}
              initial={prevSong ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex flex-col justify-center items-start text-left z-10 relative"
            >
              {/* Song Title */}
              <h3 className={`font-black text-sm sm:text-base tracking-tight line-clamp-2 leading-tight transition-colors ${randStylesCurrent.titleColor}`} title={displaySong.title}>
                <HoverTranslate text={displaySong.title} format={true} forceDark={displaySong.isBrand} bgMode={randStylesCurrent.bgMode} />
              </h3>
              {/* Artist/Singer */}
              <MarqueeText className={`text-[11px] sm:text-xs mt-0.5 w-full ${randStylesCurrent.singerColor}`}>
                {formatText(displaySong.singer || displaySong.author || data?.artistName || 'Nghệ sĩ', true, displaySong.isBrand ? false : isGoldTheme, randStylesCurrent.bgMode)}
              </MarqueeText>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right area: Achievements */}
        <AnimatePresence mode="popLayout">
          {activeRandomSongAchievements && (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.85, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.85, width: 0 }}
              transition={{ 
                layout: { type: "spring", stiffness: 280, damping: 28 },
                opacity: { duration: 0.35 },
                scale: { duration: 0.35 }
              }}
              className="hidden sm:flex shrink-0 items-center justify-end pl-2 sm:pl-3 relative z-20 py-1.5 overflow-visible"
            >
              {/* Responsive Achievement Badge Container */}
              <motion.div 
                animate={{ 
                  y: [0, -1.5, 0, 1.5, 0],
                  rotate: [0, -0.3, 0, 0.3, 0]
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-auto min-w-[140px] sm:min-w-[185px] md:min-w-[200px] h-12 sm:h-14 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#160E08] via-[#2F1C0D] to-[#160E08] border border-[#D4AF37]/45 flex items-center justify-center px-3 sm:px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.35)] shrink-0"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.25),transparent_70%)] animate-pulse" />
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent skew-x-12 pointer-events-none"
                />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <AchievementCycle achievements={displaySong.achievements} align="left" isLightBg={false} prefix="rnd-badge" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

function Home() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/fallback-cover.png';
  };
  const { lang, setLang, setArtistData, landingConfig, artistData } = useContext(LanguageContext);
  const t = useMemo(() => {
    const baseDict = translations[lang] || translations['vi'];
    const viDict = translations['vi'];
    const result: Record<string, string> = {};
    Object.keys(viDict).forEach((key) => {
      const originalValue = viDict[key];
      let customTr = artistData?.staticTranslations?.[lang]?.[originalValue];
      if (!customTr) {
        customTr = landingConfig?.staticTranslations?.[lang]?.[originalValue];
      }
      result[key] = customTr || baseDict[key] || originalValue;
    });
    const fn: any = (k: string) => result[k] || k;
    Object.keys(result).forEach(key => {
      fn[key] = result[key];
    });
    return fn;
  }, [lang, landingConfig, artistData]);
  const [data, setData] = useState<AppData | null>(null);
  const [ytVideos, setYtVideos] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [spotifyInfo, setSpotifyInfo] = useState<any>(null);
  const [mvCurrentPage, setMvCurrentPage] = useState(1);
  const [mvPageSize, setMvPageSize] = useState(8);
  const [activeListTab, setActiveListTab] = useState<'demos'|'released'|'albums'>('released');
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 1024) ? 20 : 21);
  const [userHasChangedPageSize, setUserHasChangedPageSize] = useState(false);
  const [showArtist, setShowArtist] = useState(false);
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState('');
  const [activeBioSong, setActiveBioSong] = useState<any | null>(null);
  const [randomSong, setRandomSong] = useState<any>(null);
  const getSongCoverUrl = (songUrlOrObj?: string | any, thumbUrl?: string) => {
    if (typeof songUrlOrObj === 'object' && songUrlOrObj !== null) {
      return songUrlOrObj.thumbUrl || songUrlOrObj.coverUrl || songUrlOrObj.imageUrl || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
    }
    return thumbUrl || songUrlOrObj || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
  };
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const activeTheme = useMemo(() => {
    const rawTheme = data?.adminTheme;
    if (rawTheme === 'random') {
      const availableThemes = ['liquid-glass', 'gold', 'musician', 'musician2'];
      const randomIndex = Math.floor(Math.random() * availableThemes.length);
      return availableThemes[randomIndex];
    }
    return rawTheme || 'liquid-glass';
  }, [data?.adminTheme]);

  const isMusicianTheme = activeTheme === 'musician2';
  const isDreamyTheme = activeTheme === 'musician' || activeTheme === 'dreamy';
  const isGoldTheme = (activeTheme === 'gold' || activeTheme === 'gold2') && !isMusicianTheme && !isDreamyTheme;
  const isGold2Theme = (activeTheme === 'gold' || activeTheme === 'gold2') && !isMusicianTheme && !isDreamyTheme;

  useEffect(() => {
    if (!userHasChangedPageSize) {
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      // 2 columns per row (screen < 1024px): pageSize = 20 (20 % 2 = 0, no trailing orphan item!)
      // 3 columns per row (screen >= 1024px): pageSize = 21 (21 % 3 = 0, no trailing orphan item!)
      if (screenWidth < 1024) {
        setPageSize(20);
      } else {
        setPageSize(21);
      }
    }
  }, [isMobile, isMusicianTheme, isDreamyTheme, isGoldTheme, isGold2Theme, userHasChangedPageSize]);
  const [currentAvatarSlideIndex, setCurrentAvatarSlideIndex] = useState(0);
  const [wallLightboxImg, setWallLightboxImg] = useState<string | null>(null);

  const avatarCutoutRef = useRef<HTMLDivElement>(null);
  const [avatarRect, setAvatarRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [windowScrollY, setWindowScrollY] = useState(0);

  useEffect(() => {
    if (!isMusicianTheme) return;

    const handleScroll = () => {
      setWindowScrollY(window.scrollY || window.pageYOffset || 0);
    };

    const measureCutout = () => {
      if (avatarCutoutRef.current) {
        const rect = avatarCutoutRef.current.getBoundingClientRect();
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        setAvatarRect({
          top: rect.top + currentScrollY,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    measureCutout();
    const timer = setTimeout(measureCutout, 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measureCutout);
    window.addEventListener('orientationchange', measureCutout);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureCutout);
      window.removeEventListener('orientationchange', measureCutout);
    };
  }, [isMusicianTheme, data]);

  const avatarSlideshowImages = useMemo(() => {
    if (!data) return [];
    const bgUrls: string[] = [];
    if (data.homeCoverUrl) bgUrls.push(data.homeCoverUrl);
    
    if (data.slideshowImages && Array.isArray(data.slideshowImages)) {
      data.slideshowImages.forEach((img: string) => {
        if (img && !bgUrls.includes(img)) {
          bgUrls.push(img);
        }
      });
    }
    
    if (bgUrls.length > 0) {
      return bgUrls.filter(Boolean);
    }
    
    if (data.aboutMe?.avatarUrl) {
      return [data.aboutMe.avatarUrl];
    }
    
    return [];
  }, [data]);

  useEffect(() => {
    if (avatarSlideshowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAvatarSlideIndex(prev => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [avatarSlideshowImages]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);

  const [activeMenuTab, setActiveMenuTab] = useState<string>('');

  const observer = useRef<IntersectionObserver>();
  const [showBrandState, setShowBrandState] = useState(false);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const cycle = () => {
      setShowBrandState(false);
      timeoutId = setTimeout(() => {
        setShowBrandState(true);
        timeoutId = setTimeout(cycle, 2500);
      }, 3500);
    };
    cycle();
    return () => clearTimeout(timeoutId);
  }, []);

  const publicSongIdsKey = useMemo(() => {
    if (!data?.demos) return '';
    const includeDemo = data.includeDemoInRandomSong !== false;
    return data.demos
      .filter((d: any) => {
        if (d.status !== 'public' || d.isDraft || d.deleted) return false;
        if (!includeDemo && !d.isReleased && d.linkType !== 'indirect') return false;
        return true;
      })
      .map((d: any) => d.id)
      .join(',') + `_${includeDemo}`;
  }, [data?.demos, data?.includeDemoInRandomSong]);

  useEffect(() => {
    if (!data?.demos) return;
    const includeDemo = data.includeDemoInRandomSong !== false;
    const publicSongs = data.demos.filter((d: any) => {
      if (d.status !== 'public' || d.isDraft || d.deleted) return false;
      if (!includeDemo && !d.isReleased && d.linkType !== 'indirect') return false;
      return true;
    });
    if (publicSongs.length === 0) {
      setRandomSong(null);
      return;
    }
    
    // Choose initial random song if not already set or invalid
    setRandomSong((prevSong: any) => {
      if (prevSong && publicSongs.some((s: any) => s.id === prevSong.id)) {
        return prevSong;
      }
      const initialIndex = Math.floor(Math.random() * publicSongs.length);
      return publicSongs[initialIndex];
    });

    if (publicSongs.length <= 1) return;

    const interval = setInterval(() => {
      setRandomSong((prevSong: any) => {
        if (!publicSongs || publicSongs.length <= 1) return publicSongs[0];
        const currentIdx = publicSongs.findIndex((s: any) => s.id === prevSong?.id);
        let nextIdx = currentIdx >= 0 ? (currentIdx + 1) % publicSongs.length : 0;
        if (publicSongs.length > 2) {
          let attempts = 0;
          while (nextIdx === currentIdx && attempts < 10) {
            nextIdx = Math.floor(Math.random() * publicSongs.length);
            attempts++;
          }
        }
        return publicSongs[nextIdx];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [publicSongIdsKey]);

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
      const hasReleasedMatches = ((data?.demos || []).filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft)
        .filter(d => d.isReleased || d.linkType === 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasDemosMatches = ((data?.demos || []).filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft)
        .filter(d => !d.isReleased && d.linkType !== 'indirect') || [])
        .some(d => d.title.toLowerCase().includes(trimmed));

      const hasAlbumsMatches = (data?.playlists?.filter((playlist: any) => {
        const songsInPlaylist = (data?.demos || []).filter(d => !d.deleted && ((d.playlistIds && d.playlistIds.includes(playlist.id)) || (playlist.songIds && playlist.songIds.includes(d.id))));
        return songsInPlaylist.length > 0;
      }) || []).some((playlist: any) => {
        if (playlist.title.toLowerCase().includes(trimmed)) return true;
        const songsInPlaylist = (data?.demos || []).filter(d => !d.deleted && ((d.playlistIds && d.playlistIds.includes(playlist.id)) || (playlist.songIds && playlist.songIds.includes(d.id)))) || [];
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
  const slideshowLen = data?.slideshowImages?.length || 0;
  useEffect(() => {
    if (slideshowLen <= 1) return;
    const int = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideshowLen);
    }, 5000);
    return () => clearInterval(int);
  }, [slideshowLen]);



  const handleSharePlaylist = async (e: React.MouseEvent, playlistId: string) => {
    e.preventDefault();
    e.stopPropagation();
    let url = getArtistFullUrl('/playlist/' + playlistId);
    url = formatShareUrl(url);
    await copyToClipboard(url);
    setToast(t.toastCopy || 'Đã copy link!');
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (window as any).previewTheme = (themeId: string) => {
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, adminTheme: themeId };
      });
    };
    return () => {
      delete (window as any).previewTheme;
    };
  }, []);

  useEffect(() => {
    const processData = (data: any) => {
      if (!data || data.error === 'inactive' || data.error === 'Artist not found' || data.notFound) {
        const currentExt = getArtistExtensionFromUrl(window.location.pathname);
        const activeExt = localStorage.getItem('activeAdminExtension');
        if (data && data.error === 'inactive' && currentExt && activeExt && activeExt === currentExt) {
          window.location.href = getArtistAdminRedirect(currentExt, 'help');
        } else {
          if (window.location.pathname !== '/') {
            window.location.href = window.location.origin + '/';
          }
        }
        return;
      }
      setData(data);
      if (data) {
        if (setArtistData) setArtistData(data);
        const preferred = localStorage.getItem('preferredLang');
        if (!preferred && data.defaultLanguage && setLang) {
          setLang(data.defaultLanguage);
        }
        
        // Determine default menu tab from URL hash or fallback to first visible
        const allMenus = (data.menus && data.menus.length > 0) ? data.menus : [
          { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
          { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
          { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
        ];
        const hashMap: Record<string, string> = { '#music': 'vault', '#about': 'about', '#bio': 'bio' };
        const currentHash = window.location.hash.toLowerCase();
        const hashType = hashMap[currentHash];
        const matchedMenu = hashType ? allMenus.find((m: any) => m.type === hashType && m.isVisible) : null;
        if (matchedMenu) {
          setActiveMenuTab(matchedMenu.id);
        } else {
          const visibleMenus = allMenus.filter((m: any) => m.isVisible);
          setActiveMenuTab(visibleMenus.length > 0 ? visibleMenus[0].id : 'm1');
        }
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
    };

    // Use server-injected data if available, otherwise fetch from API
    if ((window as any).__INITIAL_DATA__) {
      const initialData = (window as any).__INITIAL_DATA__;
      delete (window as any).__INITIAL_DATA__; // Clean up to free memory
      processData(initialData);
    } else {
      fetch('/api/data').then(res => res.json()).then(processData);
    }
  }, [t.lDemos]);

  if (!data) return <LoadingScreen text={t.load} />;

  
  
  const defaultMenus = [
    { id: 'm1', type: 'vault', title: 'Kho Nhạc', isVisible: true },
    { id: 'm2', type: 'about', title: 'Về Tôi', isVisible: true },
    { id: 'm3', type: 'bio', title: 'Tiểu Sử', isVisible: true }
  ];
  const currentMenus = data.menus && data.menus.length > 0 ? data.menus : defaultMenus;
  const activeMenuObj = currentMenus.find((m: any) => m.id === activeMenuTab);

  const hasAbout = Boolean(data.aboutMe && Object.values(data.aboutMe).some(v => v));
  const hasBio = Boolean(data.biography && ((data.biography.education && data.biography.education.length > 0) || (data.biography.experience && data.biography.experience.length > 0)));
  
  const finalMenus = currentMenus.filter((m: any) => {
    if (m.type === 'about' && !hasAbout) return false;
    if (m.type === 'bio' && !hasBio) return false;
    return true;
  });
  const hasNavbar = finalMenus.filter((m: any) => m.isVisible).length > 1;
  const isVault = !hasNavbar || !activeMenuObj || activeMenuObj.type === 'vault';
  const isAbout = hasNavbar && activeMenuObj?.type === 'about';
  const isBio = hasNavbar && activeMenuObj?.type === 'bio';
  const pushDown = hasNavbar && !isScrolled;
  const effectiveCoverUrl = data.homeCoverUrl || data.aboutMe?.avatarUrl;

  const renderTitleSection = (isFirst: boolean) => {
    if (isGoldTheme) {
      return (
        <section key="title-gold" className={`relative ${isFirst ? 'pt-28 sm:pt-36' : 'pt-16 sm:pt-20'} pb-12 px-6 sm:px-12 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16`}>
          {/* Left Column: Spectacular Luxury Frame Profile Image with SuperEllipse Morphing Shape */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-56 sm:w-64 md:w-72 aspect-square shrink-0 group cursor-pointer"
          >
            {/* Spinning decorative golden compass/halo */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute inset-[-15px] border border-dashed border-[#D4AF37]/35 rounded-[48%_/_38%] group-hover:rounded-[36px] transition-all duration-700 ease-in-out"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              className="absolute inset-[-8px] border border-double border-[#AA7C11]/30 rounded-[48%_/_38%] group-hover:rounded-[32px] transition-all duration-700 ease-in-out"
            />
            
            {/* Soft gold backdrop blur glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#AA7C11] to-[#F3E5AB] rounded-[48%_/_38%] group-hover:rounded-[32px] blur-2xl opacity-40 -z-10 transition-all duration-700 ease-in-out" />
            
            {/* Overlapping golden ring borders with SuperEllipse morphing */}
            <div className="absolute inset-[-4px] rounded-[48%_/_38%] group-hover:rounded-[32px] p-[3px] bg-gradient-to-tr from-[#AA7C11] via-[#F3E5AB] to-[#D4AF37] shadow-[0_8px_30px_rgba(170,124,17,0.2)] group-hover:shadow-[0_16px_40px_rgba(212,175,55,0.4)] transition-all duration-700 ease-in-out">
              <div className="w-full h-full rounded-[48%_/_38%] group-hover:rounded-[30px] bg-[#FAF5E6] p-[2px] transition-all duration-700 ease-in-out">
                <div className="w-full h-full rounded-[48%_/_38%] group-hover:rounded-[28px] overflow-hidden relative border border-[#D4AF37]/30 bg-[#FAF5E6] transition-all duration-700 ease-in-out">
                  {avatarSlideshowImages && avatarSlideshowImages.length > 0 ? (
                    <>
                      {avatarSlideshowImages.map((imgUrl, idx) => {
                        const isActive = idx === (currentAvatarSlideIndex % avatarSlideshowImages.length);
                        return (
                          <img 
                            key={"avatar-slide-" + idx}
                            src={imgUrl}
                            alt={data.artistName}
                            className={`absolute inset-0 w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-all duration-[1500ms] ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            referrerPolicy="no-referrer"
                          />
                        );
                      })}
                    </>
                  ) : (
                    <img 
                      src={effectiveCoverUrl || data.aboutMe?.avatarUrl} 
                      alt={data.artistName} 
                      className="absolute inset-0 w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-all duration-700 ease-in-out"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Glass shimmer sweep effect */}
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", repeatDelay: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-10 pointer-events-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating badge for certified artist */}
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatDelay: 3.5,
                ease: "easeInOut"
              }}
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 bg-[#FAF5E6] border-2 border-[#D4AF37] p-1.5 sm:p-2 rounded-full shadow-lg group-hover:scale-110 transition-all duration-500"
            >
              <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#AA7C11] fill-amber-500/20" />
            </motion.div>
          </motion.div>

          {/* Right Column: Title details and premium stats */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              onAnimationComplete={() => setShowArtist(true)}
              className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-[#AA7C11] mb-3 flex items-center justify-center md:justify-start gap-2 max-w-full overflow-hidden"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
              </span>
              <div className="w-full max-w-[85vw] sm:max-w-xl overflow-hidden">
                <MarqueeText className="font-black uppercase tracking-[0.2em] text-[#AA7C11] whitespace-nowrap text-xs sm:text-sm">
                  <AutoTranslate text={(data.artistBio && data.artistBio.trim()) ? data.artistBio : `${t.dDesc || 'Thiên đường âm nhạc của'} ${data.artistName || ''}`} />
                </MarqueeText>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-[#1A1303] leading-none drop-shadow-xs"
            >
              {data.artistName}
            </motion.h1>
          </div>
        </section>
      );
    }

    if (isMusicianTheme || isDreamyTheme) {
      const artistAvatar = data?.avatarUrl || data?.aboutMe?.avatarUrl || effectiveCoverUrl || (data?.slideshowImages && data.slideshowImages.length > 0 ? data.slideshowImages[0] : '');
      const hasAvatar = Boolean(artistAvatar);

      return (
        <section key="title-musician" className={`relative ${isFirst ? 'pt-20 sm:pt-24' : 'pt-8 sm:pt-12'} pb-6 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col items-center justify-center text-center overflow-visible`}>
          {/* Main Header Box */}
          <div className={`relative z-10 w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 flex flex-col md:flex-row items-stretch justify-between h-auto md:h-[260px] max-h-[460px] md:max-h-[260px] ${
            isMusicianTheme
              ? 'border-amber-700/80 shadow-[0_16px_45px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.15)] bg-gradient-to-br from-[#2D160B] via-[#3B1E0F] to-[#241108]'
              : 'border-rose-300/60 shadow-[0_12px_35px_rgba(244,63,94,0.15)] bg-gradient-to-br from-[#FCE7F3] via-[#FCE7F3] to-[#FBCFE8] md:bg-gradient-to-r md:from-[#FCE7F3] md:via-[#FCE7F3]/95 md:to-[#FCE7F3]/90'
          }`}>
            {/* Turntable decoration for Musician theme */}
            {isMusicianTheme && (
              <>
                {/* Wood grain texture overlay on header */}
                <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl sm:rounded-[2.5rem] overflow-hidden css-wood-grain opacity-[0.18]" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-[1] opacity-20 sm:opacity-25 pointer-events-none hidden md:block">
                <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Turntable base */}
                  <rect x="5" y="5" width="150" height="150" rx="12" fill="#1A0B05" stroke="#92400E" strokeWidth="1.5" opacity="0.6"/>
                  {/* Platter ring */}
                  <circle cx="72" cy="80" r="58" fill="#0D0604" stroke="#78350F" strokeWidth="1"/>
                  <circle cx="72" cy="80" r="52" fill="none" stroke="#92400E" strokeWidth="0.5" opacity="0.4"/>
                  {/* Spinning vinyl grooves */}
                  <g className="animate-spin" style={{ transformOrigin: '72px 80px', animationDuration: '4s' }}>
                    <circle cx="72" cy="80" r="48" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.3"/>
                    <circle cx="72" cy="80" r="42" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.25"/>
                    <circle cx="72" cy="80" r="36" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.2"/>
                    <circle cx="72" cy="80" r="30" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.25"/>
                    <circle cx="72" cy="80" r="24" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.3"/>
                    <circle cx="72" cy="80" r="18" fill="none" stroke="#D97706" strokeWidth="0.3" opacity="0.35"/>
                    {/* Record label */}
                    <circle cx="72" cy="80" r="12" fill="#92400E" opacity="0.5"/>
                    <circle cx="72" cy="80" r="8" fill="#D97706" opacity="0.3"/>
                    {/* Spindle */}
                    <circle cx="72" cy="80" r="2.5" fill="#F59E0B" opacity="0.6"/>
                    {/* Light reflection on vinyl */}
                    <path d="M 40 55 Q 72 65 104 55" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.15"/>
                  </g>
                  {/* Tonearm pivot */}
                  <circle cx="138" cy="22" r="6" fill="#1A0B05" stroke="#92400E" strokeWidth="1" opacity="0.7"/>
                  <circle cx="138" cy="22" r="2.5" fill="#D97706" opacity="0.5"/>
                  {/* Tonearm */}
                  <line x1="136" y1="24" x2="85" y2="58" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
                  <line x1="85" y1="58" x2="78" y2="65" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                  {/* Cartridge/stylus */}
                  <rect x="74" y="63" width="8" height="5" rx="1" fill="#92400E" opacity="0.5" transform="rotate(-35 78 65.5)"/>
                  {/* Speed selector dots */}
                  <circle cx="142" cy="140" r="3" fill="#78350F" opacity="0.4"/>
                  <circle cx="152" cy="140" r="3" fill="#D97706" opacity="0.4"/>
                </svg>
              </div>
              </>
            )}
            {/* Animated Avatar Box with Loop & Hover Effects on Mobile & PC (order-1) */}
            <div 
              className={`relative z-10 w-full md:w-[44%] lg:w-[40%] h-[230px] sm:h-[260px] md:h-full shrink-0 overflow-hidden order-1 md:order-1 group/avatar cursor-pointer select-none ${
                isMusicianTheme ? 'bg-amber-950/40 border-b-2 md:border-b-0 md:border-r-2 border-amber-800/60' : 'bg-rose-100/50'
              }`}
            >
              {hasAvatar ? (
                <>
                  {/* Continuous gentle breathing scale + image zoom & brightness boost on hover */}
                  <motion.img 
                    src={artistAvatar}
                    alt={data.artistName || 'Avatar'}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full h-full object-cover object-top filter contrast-[1.02] group-hover/avatar:scale-115 group-hover/avatar:contrast-[1.08] group-hover/avatar:brightness-105 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Loop 1: Soft ambient color pulse layer (Rose to Amber glow loop) */}
                  <motion.div 
                    animate={{
                      opacity: [0.15, 0.45, 0.15],
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute inset-0 bg-gradient-to-tr ${
                      isMusicianTheme ? 'from-amber-600/20 via-yellow-500/10 to-amber-900/30' : 'from-rose-500/20 via-pink-300/10 to-amber-300/20'
                    } pointer-events-none z-10`}
                  />

                  {/* Loop 2: Glass shimmer sweep across avatar periodically */}
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", repeatDelay: 2.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 z-20 pointer-events-none"
                  />

                  {/* Hover 1: Dark gradient Vignette overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/45 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

                  {/* Hover 2: Glowing border outline on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover/avatar:border-rose-400/90 transition-all duration-500 z-30 pointer-events-none rounded-t-3xl sm:rounded-t-[2.5rem] md:rounded-l-[2.5rem] md:rounded-tr-none" />
                </>
              ) : (
                <div className={`w-full h-full ${isMusicianTheme ? 'bg-gradient-to-r from-[#2D160B] to-[#3B1E0F]' : 'bg-gradient-to-r from-rose-200 to-[#FCE7F3]'}`} />
              )}
            </div>

            {/* Bio Box: RIGHT side on PC (order-2), Bottom on mobile (order-2) */}
            <div className={`relative z-10 md:z-20 w-full md:w-auto flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left py-6 sm:py-8 px-6 sm:px-10 min-w-0 overflow-hidden rounded-b-3xl sm:rounded-b-[2.5rem] md:rounded-none order-2 md:order-2 shadow-sm ${
              isMusicianTheme 
                ? 'bg-gradient-to-br from-[#2D160B]/90 via-[#3B1E0F]/90 to-[#241108]/90 md:bg-transparent border-t border-amber-800/60 md:border-t-0' 
                : 'bg-gradient-to-br from-[#FCE7F3] via-[#FCE7F3] to-[#FBCFE8] md:bg-transparent border-t border-rose-200/60 md:border-t-0'
            }`}>
              {/* Subtitle / Description ABOVE Artist Name (1 line, ping-pong marquee only when text is long) */}
              {(() => {
                const bioTextStr = (data.artistBio && data.artistBio.trim()) ? data.artistBio : `${t.dDesc || 'Thiên đường âm nhạc của'} ${data.artistName || ''}`;
                const isBioLong = bioTextStr.length > 28;
                return (
                  <div className="w-full max-w-full overflow-hidden mb-2 sm:mb-2.5">
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                      className={`text-base sm:text-lg md:text-xl font-bold tracking-wide font-serif leading-normal ${
                        isMusicianTheme ? 'drop-shadow-md' : 'text-rose-900/80'
                      } ${isBioLong ? 'whitespace-nowrap animate-marquee-pingpong' : 'whitespace-nowrap truncate'}`}
                      style={isMusicianTheme ? {
                        color: '#E2C498',
                        textShadow: '-1px -1px 1px rgba(0,0,0,0.95), 1px 1px 1px rgba(255,235,190,0.35), 0 2px 4px rgba(0,0,0,0.9)'
                      } : undefined}
                    >
                      <AutoTranslate text={bioTextStr} />
                    </motion.p>
                  </div>
                );
              })()}

              {/* Artist Name with White-bordered Verified Badge */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                onAnimationComplete={() => setShowArtist(true)}
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none flex items-center justify-center md:justify-start gap-2.5 flex-wrap font-serif ${
                  isMusicianTheme ? '' : 'text-stone-900 drop-shadow-xs'
                }`}
                style={isMusicianTheme ? {
                  color: '#F7E7CE',
                  textShadow: '-1.5px -1.5px 2px rgba(0,0,0,0.98), 0px -2px 3px rgba(0,0,0,0.95), 1px 1.5px 1px rgba(255,240,200,0.45), 0 4px 10px rgba(0,0,0,0.9)'
                } : undefined}
              >
                <span>{data.artistName}</span>
                <div className="relative group inline-flex items-center justify-center align-middle ml-1 sm:ml-1.5">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 2 }} 
                    className={`flex items-center justify-center backdrop-blur-md border-2 p-1 sm:p-1.5 rounded-full shadow-md transition-all duration-300 ${
                      isMusicianTheme 
                        ? 'bg-[#2A140A] border-amber-500/80 group-hover:bg-amber-900/50 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                        : 'bg-white/95 border-rose-300/80 group-hover:bg-rose-50'
                    }`}
                  >
                    <BadgeCheck className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 shrink-0 cursor-pointer ${
                      isMusicianTheme ? 'text-amber-400 fill-amber-500/20' : 'text-rose-600 fill-rose-100'
                    }`} />
                  </motion.div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-stone-900 border border-stone-800 text-white text-[11px] font-sans font-medium tracking-normal normal-case leading-normal py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-50">
                    Nghệ sĩ đã xác thực
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-900" />
                  </div>
                </div>
              </motion.h1>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section key="title-normal" className={`relative ${isFirst ? 'pt-24 sm:pt-28' : 'pt-12 sm:pt-16'} pb-10 px-6 sm:px-12 flex flex-col items-center justify-center text-center min-h-[300px]`}>
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-4 sm:mt-6">
          <div className="w-full text-center">
            {effectiveCoverUrl ? (
              <div>
                <motion.p 
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  onAnimationComplete={() => setShowArtist(true)}
                  className="text-xl sm:text-2xl text-white font-medium max-w-3xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-6 sm:mb-8 md:mb-10"
                >
                  <AutoTranslate text={(data.artistBio && data.artistBio.trim()) ? data.artistBio : `${t.dDesc || 'Thiên đường âm nhạc của'} ${data.artistName || ''}`} />
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-black mb-4 tracking-tighter text-white drop-shadow-lg leading-[1.35] text-center max-w-full mt-3 sm:mt-4 pt-2 overflow-visible"
                >
                  {(data.artistName || '').split(' ').map((word: string, index: number, array: string[]) => {
                    if (index === array.length - 1) {
                      return (
                        <span key={`l7529-idx-${index}`} className="whitespace-nowrap"><span className={isGoldTheme ? "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] font-black py-1 inline-block overflow-visible" : "animate-text-shine drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] py-1 inline-block overflow-visible"}>{word}</span><div className="relative group inline-flex items-center justify-center align-middle ml-1 sm:ml-2 md:ml-3 -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8">
                            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 2 }} className="flex items-center justify-center">
                              <BadgeCheck className={`w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${isGoldTheme ? 'text-amber-400 fill-amber-400/20' : 'text-blue-500 fill-blue-500/20'} shrink-0 cursor-pointer`} />
                            </motion.div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-neutral-900 border border-white/10 text-white text-[11px] sm:text-xs font-sans font-medium py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-50 tracking-normal normal-case leading-normal">
                              Nghệ sĩ đã xác thực
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                            </div>
                          </div>
                        </span>
                      );
                    }
                    return <React.Fragment key={`l7541-idx-${index}`}><span className={isGoldTheme ? "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] font-black py-1 inline-block overflow-visible" : "animate-text-shine drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] py-1 inline-block overflow-visible"}>{word}</span>{' '}</React.Fragment>;
                  })}
                </motion.h1>
              </div>
            ) : (
              <div className="w-full max-w-3xl p-10 mx-auto mb-8">
                <motion.p 
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  onAnimationComplete={() => setShowArtist(true)}
                  className="text-lg sm:text-xl text-white font-medium mb-6 sm:mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  <AutoTranslate text={(data.artistBio && data.artistBio.trim()) ? data.artistBio : `${t.dDesc || 'Thiên đường âm nhạc của'} ${data.artistName || ''}`} />
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="text-3xl sm:text-5xl md:text-6xl font-black mb-0 tracking-tight leading-[1.35] text-center max-w-full mt-2 sm:mt-3 pt-2 overflow-visible"
                >
                  {(data.artistName || '').split(' ').map((word: string, index: number, array: string[]) => {
                    if (index === array.length - 1) {
                      return (
                        <span key={`l7565-idx-${index}`} className="whitespace-nowrap"><span className={isGoldTheme ? "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] font-black py-1 inline-block overflow-visible" : "animate-text-shine drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] py-1 inline-block overflow-visible"}>{word}</span><div className="relative group inline-flex items-center justify-center align-middle ml-1 sm:ml-2 md:ml-3 -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8">
                            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 2 }} className="flex items-center justify-center">
                              <BadgeCheck className={`w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${isGoldTheme ? 'text-amber-400 fill-amber-400/20' : 'text-blue-500 fill-blue-500/20'} shrink-0 cursor-pointer`} />
                            </motion.div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-neutral-900 border border-white/10 text-white text-[11px] sm:text-xs font-sans font-medium py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl pointer-events-none z-50 tracking-normal normal-case leading-normal">
                              Nghệ sĩ đã xác thực
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                            </div>
                          </div>
                        </span>
                      );
                    }
                    return <React.Fragment key={`l7577-idx-${index}`}><span className={isGoldTheme ? "bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] font-black py-1 inline-block overflow-visible" : "animate-text-shine drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] py-1 inline-block overflow-visible"}>{word}</span>{' '}</React.Fragment>;
                  })}
                </motion.h1>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderRandomSongSection = (isFirst: boolean) => {
    if (!randomSong) return null;

    const cardContent = (
      <div className="w-full relative overflow-visible">
        <div className={`font-bold text-xs uppercase tracking-widest mb-2.5 flex items-center gap-1.5 justify-center select-none ${isMusicianTheme ? 'text-amber-100 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : (isGoldTheme || isDreamyTheme) ? 'text-stone-800 font-extrabold' : 'text-stone-300'}`}>
          <Sparkles className={`w-4 h-4 ${isMusicianTheme ? 'text-amber-400' : isDreamyTheme ? 'text-rose-600' : isGoldTheme ? 'text-[#AA7C11]' : 'text-amber-400'} animate-pulse`} />
          <span>{t("Bài Hát Ngẫu Nhiên") || "Bài Hát Ngẫu Nhiên"}</span>
        </div>
        <div className="w-full relative overflow-visible">
          <RandomSongCard
            randomSong={randomSong}
            data={data}
            isGoldTheme={isGoldTheme}
            isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme}
            activeListTab={activeListTab}
            getSongCoverUrl={getSongCoverUrl}
            isMobile={isMobile}
            formatText={formatText}
            getArtistLink={getArtistLink}
            setActiveBioSong={setActiveBioSong}
            t={t}
          />

          {/* Released / Demo Badge */}
          <motion.div
            animate={{ 
              rotate: [15, 11, 19, 11, 15],
              scale: [1, 1.05, 0.95, 1.05, 1]
            }}
            transition={{ 
              duration: 4.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -top-2 -right-2 z-40 select-none pointer-events-none"
          >
            {randomSong.isReleased ? (
              <span className="bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.8)] text-[8px] font-black text-white px-2.5 py-0.5 rounded border border-emerald-400/50 block">
                {t.lReleasedMark || 'RELEASED'}
              </span>
            ) : (
              <span className="bg-[#1A1303] text-[#FAF5E6] border border-[#D4AF37] shadow-md text-[8px] font-black px-2.5 py-0.5 rounded block">
                {randomSong.linkType === 'indirect' ? 'Landing Page' : (t.lDemoMark || 'DEMO')}
              </span>
            )}
          </motion.div>
        </div>
      </div>
    );

    if (isMusicianTheme) {
      return (
        <section key="random-song-sec" className={`w-full max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-8 ${isFirst ? 'pt-24 sm:pt-28' : 'pt-4 sm:pt-6'} pb-10`}>
          {/* ── 3D WOODEN SHELF / CRATE CONTAINER ── */}
          <div className="relative w-full group/shelf">

            {/* Ambient golden glow behind shelf */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-amber-900/30 via-amber-800/20 to-transparent blur-2xl pointer-events-none" />

            {/* ── MAIN CRATE BODY ── */}
            <div
              className="relative w-full rounded-2xl overflow-visible"
              style={{
                background: `linear-gradient(160deg,
                  #321605 0%, #441E07 6%, #2B1103 12%,
                  #3C1B06 18%, #280E02 24%, #3A1805 30%,
                  #280E02 36%, #3C1B06 42%, #2B1103 48%,
                  #321605 54%, #441E07 60%, #280E02 66%,
                  #3A1805 72%, #3C1B06 78%, #280E02 84%,
                  #321605 90%, #2B1103 100%
                )`,
                border: '2px solid rgba(135,80,22,0.55)',
                boxShadow: `
                  0 30px 60px rgba(0,0,0,0.98),
                  0 10px 20px rgba(0,0,0,0.8),
                  inset 0 1px 0 rgba(255,200,80,0.12),
                  inset 0 -2px 6px rgba(0,0,0,0.9)
                `,
              }}
            >
              {/* ── WOOD GRAIN OVERLAY (horizontal lines for realism) ── */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 8px,
                    rgba(0,0,0,0.15) 8px,
                    rgba(0,0,0,0.15) 9px
                  )`,
                }}
              />

              {/* ── LEFT & RIGHT INNER SHADOW (depth inside crate) ── */}
              <div className="absolute inset-y-0 left-0 w-8 rounded-l-2xl pointer-events-none"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55), transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-8 rounded-r-2xl pointer-events-none"
                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.55), transparent)' }} />

              {/* ── GOLDEN BORDER HIGHLIGHT (top rim glow) ── */}
              <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl pointer-events-none"
                style={{ background: 'linear-gradient(to right, transparent, rgba(255,200,80,0.5) 20%, rgba(255,220,100,0.7) 50%, rgba(255,200,80,0.5) 80%, transparent)' }} />

              {/* ── BRASS CORNER BOLTS ── */}
              {[
                { pos: 'top-2.5 left-3' },
                { pos: 'top-2.5 right-3' },
                { pos: 'bottom-2.5 left-3' },
                { pos: 'bottom-2.5 right-3' },
              ].map(({ pos }, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-3 h-3 rounded-full z-10 pointer-events-none`}
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #f5d060, #b8860b 55%, #7a5500)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,235,100,0.5)',
                    border: '1px solid rgba(255,200,60,0.4)',
                  }}
                />
              ))}

              {/* ── INNER CONTENT AREA ── */}
              <div className="relative px-5 py-5 sm:px-7 sm:py-6">
                {cardContent}
              </div>
            </div>

            {/* Drop shadow on the "floor" beneath the shelf */}
            <div
              className="absolute -bottom-5 left-[10%] right-[10%] h-5 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 80%)',
                filter: 'blur(6px)',
              }}
            />
          </div>
        </section>
      );
    }

    return (
      <section key="random-song-sec" className={`w-full max-w-2xl sm:max-w-3xl mx-auto px-6 sm:px-12 ${isFirst ? 'pt-24 sm:pt-28' : 'pt-4 sm:pt-6'} pb-6`}>
        {cardContent}
      </section>
    );
  };

  const renderSpotifySection = (isFirst: boolean) => {
    if (!data.spotifyUrl) return null;
    return (
      <section key="spotify" className={`w-full max-w-5xl mx-auto px-6 sm:px-12 ${isFirst ? 'pt-24 sm:pt-28 pb-10' : 'pb-6'}`}>
        <div className="w-full relative z-10 max-w-4xl mx-auto">
          {(() => {
            const spMatch = data.spotifyUrl.match(/(artist|playlist|album|track)[\/:]+([a-zA-Z0-9]+)/);
            if (spMatch) {
              return (
                <motion.div 
                  key="spotify-embed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="w-full bg-white/5 p-2 sm:p-4 md:p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-4 text-left"
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
                       <a href={data.spotifyUrl} target="_blank" rel="noreferrer" className="hidden sm:flex ml-auto items-center gap-2 bg-[#1DB954] text-white px-4 py-2 rounded-full transition-transform font-bold text-sm">
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
                      loading="eager" 
                      onLoad={() => setSpotifyLoaded(true)}
                      className={`w-full bg-neutral-900 transition-opacity duration-1000 ${spotifyLoaded ? 'opacity-100' : 'opacity-0'}`}
                    ></iframe>
                  </div>
                </motion.div>
              );
            }
            return (
             <div className="flex justify-center">
               <a href={data.spotifyUrl} target="_blank" rel="noreferrer" className="inline-flex transition-transform hover:scale-105 active:scale-95">
                 <span className="flex items-center gap-2 bg-[#1DB954] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#1DB954]/20 text-lg">
                   <SpotifyIcon className="w-5 h-5" /> {t.btnSpot}
                 </span>
               </a>
             </div>
            );
          })()}
        </div>
      </section>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`min-h-screen flex flex-col ${
        isMusicianTheme
          ? 'text-stone-100 selection:bg-amber-600 selection:text-white font-sans'
          : isDreamyTheme 
            ? 'bg-gradient-to-br from-[#FFF5F7] via-[#F8F2FC] via-[#FAF5FF] to-[#FFF7ED] text-stone-900 selection:bg-rose-400 selection:text-white font-sans' 
            : isGoldTheme 
              ? 'bg-gradient-to-b from-[#F9F5EA] via-[#FCF9F2] to-[#FAF5E6] text-[#2C1E03] selection:bg-amber-500 selection:text-stone-950 font-sans' 
              : 'bg-neutral-950 text-white selection:bg-rose-500 selection:text-white font-sans bg-notebook-dark'
      } relative z-0`}
      style={undefined}
    >
      <SocialCarousel data={data} pushDown={pushDown} isGoldTheme={isGoldTheme} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} />
      
      {isMusicianTheme ? (
        <>
          {/* Realistic Wood Grain Background with 3D Cabinet Overlays */}
          <div className="fixed inset-0 z-[-1] pointer-events-none select-none overflow-hidden css-wood-grain">
            {/* Layer 2: Subtle warm color overlay to unify tone */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                background: 'linear-gradient(180deg, rgba(45,22,11,0.3) 0%, rgba(24,10,4,0) 50%, rgba(45,22,11,0.4) 100%)',
                mixBlendMode: 'multiply'
              }}
            />
          </div>

          {/* Fixed Ambient Studio Lighting & Brass Trim Overlay */}
          <div className="fixed inset-0 z-[1] pointer-events-none select-none">
            {/* Warm Vignette Overlay for focus & readability */}
            <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.92)] pointer-events-none z-10" />

            {/* Display Cabinet Overhead Warm Golden Spotlight Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.22),transparent_70%)] blur-2xl pointer-events-none" />
          </div>

          {/* Wall Hanging Picture Frames for Musician Theme */}
          <MusicianWallFrames data={data} setWallLightboxImg={setWallLightboxImg} t={t} />
        </>
      ) : isDreamyTheme ? (
        <div className="absolute inset-0 z-[-2] overflow-hidden pointer-events-none select-none">
          {/* Background Slideshow for Musician Theme (Low Opacity, Crisp - No Blur) */}
          {data?.slideshowImages && data.slideshowImages.length > 0 && (
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
              {data.slideshowImages.map((src: string, idx: number) => {
                const isActive = idx === (currentSlide % data.slideshowImages.length);
                return (
                  <div
                    key={`musician-bg-slide-${idx}`}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-25 z-10' : 'opacity-0 z-0'}`}
                    style={{ 
                      backgroundImage: `url(${src})`, 
                      backgroundPosition: 'center 20%',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 100%)', 
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 100%)' 
                    }}
                  />
                );
              })}
            </div>
          )}
          <div className="absolute top-[-10%] left-[-10%] w-[55%] aspect-square bg-pink-300/35 rounded-full blur-[140px]" />
          <div className="absolute top-[25%] right-[-10%] w-[45%] aspect-square bg-purple-300/30 rounded-full blur-[130px]" />
          <div className="absolute bottom-[10%] left-[20%] w-[50%] aspect-square bg-amber-200/40 rounded-full blur-[140px]" />
          {/* Subtle Tactile SVG Grain & Dots Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.045] mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='23' cy='23' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
      ) : isGoldTheme ? (
        <div className="absolute inset-0 z-[-2] overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F9F5EA] via-[#FCF9F2] to-[#FAF5E6]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-[#E8DCC4] opacity-30 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] right-[-10%] w-[40%] aspect-square bg-[#E0D1B4] opacity-25 rounded-full blur-[100px]" />
          <svg className="absolute top-0 left-0 w-full h-[600px] opacity-40" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 80 C 200 40, 400 120, 600 50 C 800 -20, 1100 10, 1500 20" stroke="url(#gold-grad-1)" strokeWidth="1.5" strokeDasharray="3,3" />
            <path d="M-100 95 C 200 55, 400 135, 600 65 C 800 -5, 1100 25, 1500 35" stroke="url(#gold-grad-1)" strokeWidth="1.5" />
            <path d="M-100 110 C 200 70, 400 150, 600 80 C 800 10, 1100 40, 1500 50" stroke="url(#gold-grad-2)" strokeWidth="1.5" />
            <path d="M-100 125 C 200 85, 400 165, 600 95 C 800 25, 1100 55, 1500 65" stroke="url(#gold-grad-1)" strokeWidth="1.5" />
            <path d="M-100 140 C 200 100, 400 180, 600 110 C 800 40, 1100 70, 1500 80" stroke="url(#gold-grad-2)" strokeWidth="1" strokeDasharray="5,5" />
            <path d="M-50 0 C 100 150, 50 350, -50 500" stroke="url(#gold-grad-3)" strokeWidth="4" opacity="0.3" />
            <path d="M-20 0 C 150 130, 80 320, -20 500" stroke="url(#gold-grad-3)" strokeWidth="1.5" opacity="0.5" />
            <path d="M10 0 C 200 100, 120 300, 10 500" stroke="url(#gold-grad-4)" strokeWidth="0.75" opacity="0.7" />
            <defs>
              <linearGradient id="gold-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#AA7C11" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F3E5AB" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gold-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#AA7C11" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#AA7C11" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="gold-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#AA7C11" />
                <stop offset="70%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F3E5AB" />
              </linearGradient>
              <linearGradient id="gold-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F3E5AB" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 right-0 w-full h-[400px] opacity-35" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 350 C 300 320, 600 380, 900 300 C 1100 240, 1300 280, 1540 260" stroke="url(#gold-grad-2)" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M-100 365 C 300 335, 600 395, 900 315 C 1100 255, 1300 295, 1540 275" stroke="url(#gold-grad-1)" strokeWidth="1" />
            <path d="M-100 380 C 300 350, 600 410, 900 330 C 1100 270, 1300 310, 1540 290" stroke="url(#gold-grad-2)" strokeWidth="1.5" />
          </svg>
        </div>
      ) : data.slideshowImages && data.slideshowImages.length > 0 ? (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-neutral-950 overflow-hidden">
          {data.slideshowImages.map((src: string, idx: number) => {
            const isActive = idx === (currentSlide % data.slideshowImages.length);
            return (
              <div
                key={`bg-slide-${idx}`}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-80 z-10' : 'opacity-0 z-0'}`}
                style={{ 
                  backgroundImage: `url(${src})`, 
                  backgroundPosition: 'center 20%', 
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)', 
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)' 
                }}
              />
            );
          })}
        </div>
      ) : effectiveCoverUrl ? (
        <div className="fixed inset-0 z-[-1] pointer-events-none relative_mask bg-neutral-950">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${effectiveCoverUrl})`, backgroundPosition: 'center 20%', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)' }}></div>
        </div>
      ) : (
        <div className={`fixed inset-0 z-[-1] pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isGoldTheme ? 'from-amber-900/40 via-stone-950 to-stone-950' : 'from-rose-900 via-neutral-950 to-neutral-950'}`}></div>
      )}
      <LanguageSwitcher pushDown={pushDown} />
      {playingVideo && (() => {
        const activeSong = ytVideos.find(song => song.videoId === playingVideo);
        const activeTitle = activeSong ? activeSong.title : "MV / Video";
        const ytLink = `https://www.youtube.com/watch?v=${playingVideo}`;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-pointer" onClick={() => setPlayingVideo(null)}>
            {/* Slideshow background behind main overlay player */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {data && data.slideshowImages && data.slideshowImages.length > 0 ? (
                <>
                  {data.slideshowImages.map((imgUrl, idx) => {
                    const isActive = idx === (currentSlide % data.slideshowImages.length);
                    return (
                      <div
                        key={"vid-bg-" + idx}
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        style={{ 
                          backgroundImage: `url(${imgUrl})`,
                          backgroundPosition: 'center 20%'
                        }}
                      />
                    );
                  })}
                </>
              ) : data && effectiveCoverUrl ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${effectiveCoverUrl})`,
                    backgroundPosition: 'center 20%'
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/50 to-neutral-950/80" />
              )}
              {/* Soft dimming and minimal blurring of the background slideshow */}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
            </div>

            <div className="relative w-full max-w-4xl aspect-video bg-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/15 flex flex-col z-10 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-3.5 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3 text-xs sm:text-sm text-neutral-350 relative z-10">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0"></span>
                  <span className="font-bold text-white text-[11px] sm:text-sm tracking-tight break-words line-clamp-2 sm:line-clamp-none leading-normal">
                    {activeTitle}
                    </span>
                </div>
                <div className="flex items-center gap-3 justify-end shrink-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${playingVideo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-300 bg-white/10 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-white/10"
                    title="Mở trên trang YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>Mở trên YouTube</span>
                  </a>
                  <button 
                    className="text-neutral-400 hover:text-white px-2.5 py-0.5 font-bold transition-colors text-base sm:text-lg shrink-0 cursor-pointer"
                    onClick={() => setPlayingVideo(null)}
                    title={t("Đóng")}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-full relative bg-neutral-950">
                <SmartYouTubePlayer videoId={playingVideo} title={activeTitle} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-6 sm:pt-8">
        {hasNavbar && <PublicNavbar menus={finalMenus} activeTab={activeMenuTab} setActiveTab={setActiveMenuTab} t={t} isGoldTheme={isGoldTheme} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} />}
      </div>

      {isVault && (() => {
        const layoutOrder: string[] = data?.layoutSections || landingConfig?.globalLayoutSections || ['title', 'random_song', 'vault', 'mv', 'spotify'];
        const finalLayoutOrder = Array.from(new Set(layoutOrder));
        if (!finalLayoutOrder.includes('random_song')) {
          const tIdx = finalLayoutOrder.indexOf('title');
          if (tIdx !== -1) finalLayoutOrder.splice(tIdx + 1, 0, 'random_song');
          else finalLayoutOrder.splice(1, 0, 'random_song');
        }

        const hiddenSections = data?.hiddenSections || [];
        const isSectionVisible = (secKey: string) => {
          if (secKey === 'vault') return true; // Kho Nhạc không bao giờ bị ẩn
          return !hiddenSections.includes(secKey);
        };

        const titleOrder = finalLayoutOrder.indexOf('title') !== -1 ? finalLayoutOrder.indexOf('title') : 0;
        const randomSongOrder = finalLayoutOrder.indexOf('random_song') !== -1 ? finalLayoutOrder.indexOf('random_song') : 1;
        const vaultOrder = finalLayoutOrder.indexOf('vault') !== -1 ? finalLayoutOrder.indexOf('vault') : 2;
        const mvOrder = finalLayoutOrder.indexOf('mv') !== -1 ? finalLayoutOrder.indexOf('mv') : 3;
        const spotifyOrder = finalLayoutOrder.indexOf('spotify') !== -1 ? finalLayoutOrder.indexOf('spotify') : 4;

        const visibleSectionsInOrder = finalLayoutOrder.filter(secKey => isSectionVisible(secKey));
        const firstVisibleSection = visibleSectionsInOrder[0] || 'title';

        return (
          <main className="flex-1 w-full flex flex-col pb-32">
            {isSectionVisible('title') && (
              <div style={{ order: titleOrder }} className="w-full">
                {renderTitleSection(firstVisibleSection === 'title')}
              </div>
            )}

            {isSectionVisible('random_song') && randomSong && (
              <div style={{ order: randomSongOrder }} className="w-full">
                {renderRandomSongSection(firstVisibleSection === 'random_song')}
              </div>
            )}

            {isSectionVisible('spotify') && data.spotifyUrl && (
              <div style={{ order: spotifyOrder }} className="w-full">
                {renderSpotifySection(firstVisibleSection === 'spotify')}
              </div>
            )}

            <div style={{ order: vaultOrder }} className="w-full">
              {/* Demos Section */}
              <section id="music-tabs-section" className={`scroll-mt-24 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-10 ${firstVisibleSection === 'vault' ? 'pt-24 sm:pt-28' : ''}`}>
          {/* Header Row with compact Search Box */}
          <div className="flex items-center justify-between mb-4">
            <div className={`${isHomeSearchExpanded ? 'hidden sm:flex' : 'flex'} text-base sm:text-lg font-bold tracking-tight ${isMusicianTheme ? 'text-amber-100 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : isDreamyTheme ? 'text-stone-950 font-black' : isGoldTheme ? 'text-stone-950 font-black' : 'text-white/95'} items-center gap-2 shrink-0`}>
              <span className={`w-1.5 h-4 ${isMusicianTheme ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]' : isDreamyTheme ? 'bg-rose-500 shadow-sm' : isGoldTheme ? 'bg-amber-600 shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'bg-emerald-500'} rounded-full`} />
              <span>{t.mVault || "Kho Nhạc"}</span>
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
                      placeholder={t.searchSong || "Tìm kiếm bài hát..."}
                      className={`w-full ${isMusicianTheme ? 'bg-stone-900/90 border-amber-800/80 text-amber-100 focus:ring-amber-500 placeholder:text-amber-300/50 shadow-md' : (isGoldTheme || isDreamyTheme) ? 'bg-white/90 border-purple-200 text-stone-900 focus:ring-rose-400 placeholder:text-stone-400 shadow-xs' : 'bg-neutral-900/60 border border-white/10 text-white focus:ring-emerald-500 placeholder:text-stone-500'} border rounded-xl py-2 text-xs focus:outline-none focus:ring-1 font-medium ${searchQuery ? 'pl-3' : 'pl-9'} ${searchQuery ? 'pr-3 sm:pr-8' : 'pr-3'}`}
                      autoFocus
                    />
                    {!searchQuery && (
                      <span className="absolute left-3 text-stone-400">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                    )}
                    
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                        }}
                        className={`absolute right-3 ${(isGoldTheme || isDreamyTheme) ? 'text-stone-500 hover:text-stone-900' : 'text-stone-400 hover:text-white'} sm:block hidden`}
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
                className={`p-2.5 rounded-xl transition-all ${
                  isHomeSearchExpanded 
                    ? (isMusicianTheme ? 'text-amber-300 hover:text-amber-100 ml-2 sm:block hidden' : (isGoldTheme || isDreamyTheme) ? 'text-stone-500 hover:text-stone-900 ml-2 sm:block hidden' : 'text-stone-400 hover:text-white ml-2 sm:block hidden')
                    : (isMusicianTheme 
                        ? 'bg-gradient-to-b from-[#4A2411] via-[#35180A] to-[#210D04] border-2 border-[#8C4A1C] text-amber-300 hover:border-amber-400 hover:text-amber-100 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] shadow-md' 
                        : (isGoldTheme || isDreamyTheme) ? 'bg-white/90 border border-purple-200 text-stone-700 hover:text-stone-900 shadow-xs' : 'bg-neutral-900/50 border border-white/5 hover:bg-neutral-800/80 text-stone-400 hover:text-white')
                }`}
                title={isHomeSearchExpanded ? (t.closeSearch || "Đóng tìm kiếm") : (t.searchTitle || "Tìm kiếm bài hát")}
              >
                {isHomeSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className={`relative flex items-center gap-2 mb-6 ${
            isMusicianTheme 
              ? 'bg-gradient-to-r from-[#2A150A] via-[#3D2011] to-[#2A150A] border-2 border-amber-800/80 shadow-[0_12px_35px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.15)] rounded-2xl sm:rounded-full p-1.5' 
              : isDreamyTheme 
                ? 'bg-white/60 border-2 border-purple-200/80 shadow-[0_8px_30px_rgba(244,63,94,0.15)] rounded-full p-1.5' 
                : isGoldTheme 
                  ? 'bg-[#FAF5E6]/90 border border-[#D4AF37]/35 shadow-md rounded-full p-1.5' 
                  : 'bg-black/50 border border-white/10 shadow-2xl backdrop-blur-2xl p-1.5 rounded-2xl'
          } w-full sm:w-auto max-w-fit mx-auto sm:mx-0 flex-nowrap overflow-x-auto custom-scrollbar z-10`}>
             <button 
               onClick={() => { setActiveListTab('released'); setCurrentPage(1); }} 
               className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 ${
                 (isMusicianTheme || isGoldTheme) ? 'rounded-full' : 'rounded-xl'
               } text-xs sm:text-base font-bold tracking-tight transition-colors duration-300 ${
                 activeListTab === 'released' 
                   ? (isMusicianTheme ? 'text-yellow-100 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]' : isDreamyTheme ? 'text-amber-950 font-black' : isGoldTheme ? 'text-[#1A1303] font-black' : 'text-white font-black') 
                   : (isMusicianTheme ? 'text-amber-200/80 hover:text-amber-100' : isDreamyTheme ? 'text-stone-600 hover:text-amber-900' : isGoldTheme ? 'text-[#1A1303]/70 hover:text-[#1A1303]' : 'text-stone-300 hover:text-white')
               }`}
             >
                {activeListTab === 'released' && (
                  <motion.div 
                    layoutId="music-active-tab-glow" 
                    className={`absolute inset-0 ${
                      isMusicianTheme
                        ? 'rounded-full bg-amber-400/35 backdrop-blur-md border border-amber-300/80 shadow-[0_0_22px_rgba(251,191,36,0.65),inset_0_1px_2px_rgba(255,255,255,0.6)] before:absolute before:-top-6 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-8 before:bg-gradient-to-b before:from-amber-200/40 before:to-transparent before:blur-xs pointer-events-none'
                        : isDreamyTheme 
                          ? 'rounded-full bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-2 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.4)]' 
                          : isGoldTheme
                            ? 'rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-[#FCF6BA]/60 to-[#D4AF37]/40 border border-[#D4AF37] shadow-md'
                            : 'rounded-xl bg-[#143325]/90 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    } z-0`}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeListTab === 'released' ? (isMusicianTheme ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]' : isDreamyTheme ? 'text-amber-700' : isGoldTheme ? 'text-[#1A1303]' : 'text-emerald-400') : (isMusicianTheme ? 'text-amber-300/70' : 'text-stone-400')}`} />
                <span className="whitespace-nowrap relative z-10">{data?.tab1Name?.trim() || t('lReleased') || "Ra Rồi"}</span>
             </button>
             
             <button 
               onClick={() => { setActiveListTab('demos'); setCurrentPage(1); }} 
               className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 ${
                 (isMusicianTheme || isGoldTheme) ? 'rounded-full' : 'rounded-xl'
               } text-xs sm:text-base font-bold tracking-tight transition-colors duration-300 ${
                 activeListTab === 'demos' 
                   ? (isMusicianTheme ? 'text-yellow-100 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]' : isDreamyTheme ? 'text-rose-950 font-black' : isGoldTheme ? 'text-[#1A1303] font-black' : 'text-white font-black') 
                   : (isMusicianTheme ? 'text-amber-200/80 hover:text-amber-100' : isDreamyTheme ? 'text-stone-600 hover:text-rose-900' : isGoldTheme ? 'text-[#1A1303]/70 hover:text-[#1A1303]' : 'text-stone-300 hover:text-white')
               }`}
             >
                {activeListTab === 'demos' && (
                  <motion.div 
                    layoutId="music-active-tab-glow" 
                    className={`absolute inset-0 ${
                      isMusicianTheme
                        ? 'rounded-full bg-amber-400/35 backdrop-blur-md border border-amber-300/80 shadow-[0_0_22px_rgba(251,191,36,0.65),inset_0_1px_2px_rgba(255,255,255,0.6)] before:absolute before:-top-6 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-8 before:bg-gradient-to-b before:from-amber-200/40 before:to-transparent before:blur-xs pointer-events-none'
                        : isDreamyTheme 
                          ? 'rounded-full bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 border-2 border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.4)]' 
                          : isGoldTheme
                            ? 'rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-[#FCF6BA]/60 to-[#D4AF37]/40 border border-[#D4AF37] shadow-md'
                            : 'rounded-xl bg-[#39151e]/90 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    } z-0`}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <Disc3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeListTab === 'demos' ? (isMusicianTheme ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]' : isDreamyTheme ? 'text-rose-700' : isGoldTheme ? 'text-[#1A1303]' : 'text-rose-400') : (isMusicianTheme ? 'text-amber-300/70' : 'text-stone-400')}`} />
                <span className="whitespace-nowrap relative z-10">{data?.tab2Name?.trim() || t('lDemos') || "Đề Mô"}</span>
             </button>
             
             {data?.playlists && data.playlists.length > 0 && (
               <button 
                 onClick={() => { setActiveListTab('albums'); setCurrentPage(1); }} 
                 className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 ${
                   (isMusicianTheme || isGoldTheme) ? 'rounded-full' : 'rounded-xl'
                 } text-xs sm:text-base font-bold tracking-tight transition-colors duration-300 ${
                   activeListTab === 'albums' 
                     ? (isMusicianTheme ? 'text-yellow-100 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]' : isDreamyTheme ? 'text-purple-950 font-black' : isGoldTheme ? 'text-[#1A1303] font-black' : 'text-white font-black') 
                     : (isMusicianTheme ? 'text-amber-200/80 hover:text-amber-100' : isDreamyTheme ? 'text-stone-600 hover:text-purple-900' : isGoldTheme ? 'text-[#1A1303]/70 hover:text-[#1A1303]' : 'text-stone-300 hover:text-white')
                 }`}
               >
                  {activeListTab === 'albums' && (
                    <motion.div 
                      layoutId="music-active-tab-glow" 
                      className={`absolute inset-0 ${
                        isMusicianTheme
                          ? 'rounded-full bg-amber-400/35 backdrop-blur-md border border-amber-300/80 shadow-[0_0_22px_rgba(251,191,36,0.65),inset_0_1px_2px_rgba(255,255,255,0.6)] before:absolute before:-top-6 before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-8 before:bg-gradient-to-b before:from-amber-200/40 before:to-transparent before:blur-xs pointer-events-none'
                          : isDreamyTheme 
                            ? 'rounded-full bg-gradient-to-r from-purple-200 via-indigo-100 to-purple-200 border-2 border-purple-300 shadow-[0_4px_20px_rgba(168,85,247,0.4)]' 
                            : isGoldTheme
                              ? 'rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-[#FCF6BA]/60 to-[#D4AF37]/40 border border-[#D4AF37] shadow-md'
                              : 'rounded-xl bg-[#281539]/90 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      } z-0`}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <ListMusic className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeListTab === 'albums' ? (isMusicianTheme ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]' : isDreamyTheme ? 'text-purple-700' : isGoldTheme ? 'text-[#1A1303]' : 'text-purple-400') : (isMusicianTheme ? 'text-amber-300/70' : 'text-stone-400')}`} />
                  <span className="whitespace-nowrap relative z-10">{data?.tab3Name || t('Tab 3 (Album/EP)') || "Album/EP"}</span>
               </button>
             )}
          </div>
          
          {(() => {
            let currentListItems = activeListTab === 'albums' 
              ? (data?.playlists?.filter((playlist: any) => {
                  const songsInPlaylist = (data?.demos || []).filter(d => !d.deleted && ((d.playlistIds && d.playlistIds.includes(playlist.id)) || (playlist.songIds && playlist.songIds.includes(d.id))));
                  return songsInPlaylist.length > 0;
                }) || [])
              : ((data?.demos || []).filter(d => (d.linkType === 'indirect' || d.status === 'public') && !d.isDraft).filter(d => activeListTab === 'demos' ? (!d.isReleased && d.linkType !== 'indirect') : (d.isReleased || d.linkType === 'indirect')) || []);

            if (searchQuery.trim()) {
              const query = searchQuery.trim().toLowerCase();
              if (activeListTab === 'albums') {
                currentListItems = currentListItems.filter((playlist: any) => {
                  if (playlist.title.toLowerCase().includes(query)) return true;
                  const songsInPlaylist = (data?.demos || []).filter(d => !d.deleted && ((d.playlistIds && d.playlistIds.includes(playlist.id)) || (playlist.songIds && playlist.songIds.includes(d.id)))) || [];
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

            const activeColorClass = isGoldTheme
              ? 'bg-[#1A1303] text-[#FAF5E6] hover:bg-[#AA7C11] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
              : activeListTab === 'released' 
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
              <div className="w-full min-h-[550px] sm:min-h-[700px] relative">
                <AnimatePresence mode="popLayout">
                {totalItems === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`col-span-full py-16 px-4 text-center rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                      isGoldTheme 
                        ? 'bg-[#FAF5E6] border-[#D4AF37]/30 shadow-md shadow-[#D4AF37]/5' 
                        : 'bg-neutral-900/40 border-white/5 backdrop-blur-md shadow-lg'
                    }`}
                  >
                    <Disc3 className={`w-12 h-12 animate-spin-slow mb-4 ${isGoldTheme ? 'text-[#AA7C11]' : 'text-neutral-600'}`} />
                    <p className={`text-lg font-black ${isGoldTheme ? 'text-[#1A1303]' : 'text-neutral-300'}`}>{t.noSongs || "Chưa có bài hát nào"}</p>
                    <p className={`text-sm mt-1 ${isGoldTheme ? 'text-stone-500 font-medium' : 'text-neutral-500'}`}>{t.noSongsDesc || "Danh sách đang được cập nhật, bạn vui lòng quay lại sau nhé!"}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={`${activeListTab}-page-${currentPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className={activeListTab === 'albums' ? "grid grid-cols-1 gap-3.5 sm:gap-4 max-w-3xl mx-auto w-full" : isMusicianTheme ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-[88px] sm:gap-y-[100px] gap-x-3 sm:gap-x-8 max-w-[1400px] mx-auto pt-[96px] sm:pt-[64px]" : isGold2Theme ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" : (isGoldTheme && !isMobile) ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : isDreamyTheme ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 max-w-[1400px] mx-auto" : "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1400px] mx-auto"}
                  >
                    {activeListTab === 'albums' ? (
                      paginatedItems.map((playlist: any, idx: number) => {
                        const songsInPlaylist = (data?.demos || []).filter(d => !d.deleted && ((d.playlistIds && d.playlistIds.includes(playlist.id)) || (playlist.songIds && playlist.songIds.includes(d.id))));
                        if (songsInPlaylist.length === 0) return <React.Fragment key={`l8086-${playlist.id || ''}-${idx}`} />;
                        
                        const firstSong = songsInPlaylist[0];
                        const firstSongCover = firstSong ? (firstSong.thumbUrl || firstSong.coverUrl || (firstSong as any).image || '') : '';
                        const rawCover = (playlist.coverUrl && playlist.coverUrl.trim() !== '') ? playlist.coverUrl : firstSongCover;
                        let coverUrl = getThumbUrl(rawCover) || '';
                        if (!coverUrl && firstSongCover) {
                           coverUrl = getThumbUrl(firstSongCover) || firstSongCover;
                        }
                        if (!coverUrl && data.slideshowImages && data.slideshowImages.length > 0) {
                           const hash = Array.from(playlist.id as string).reduce((sum: number, char: any) => sum + char.charCodeAt(0), 0);
                           coverUrl = getThumbUrl(data.slideshowImages[hash % data.slideshowImages.length]) || '';
                        }

                        return (
                          <motion.div
                            key={`l8096-${playlist.id || ''}-${idx}`}
                            variants={{
                              hidden: {  opacity: 0, y: 15 },
                              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                            }}
                          >
                            {(() => {
                              const discCount = Math.min(3, songsInPlaylist.length);
                              const discOffsets = [
                                { rest: 'translate-x-3', hover: 'group-hover:translate-x-7 sm:group-hover:translate-x-9', z: 'z-10' },
                                { rest: 'translate-x-6', hover: 'group-hover:translate-x-14 sm:group-hover:translate-x-18', z: 'z-0' },
                                { rest: 'translate-x-9', hover: 'group-hover:translate-x-20 sm:group-hover:translate-x-26', z: '-z-10' }
                              ];

                              return (
                                <Link 
                                  to={getArtistLink(`/playlist/${playlist.id}`)} 
                                  className={`group relative border rounded-3xl p-3 sm:p-5 transition-all duration-500 overflow-hidden flex flex-row items-center gap-4 sm:gap-6 w-full ${
                                    isMusicianTheme 
                                      ? 'bg-gradient-to-br from-[#2D180C]/95 via-[#231208]/98 to-[#190C05]/95 border-amber-700/60 hover:border-amber-400 shadow-[0_12px_35px_rgba(0,0,0,0.85)] hover:shadow-[0_18px_45px_rgba(245,158,11,0.3)] backdrop-blur-md' 
                                      : isGoldTheme
                                      ? 'bg-[#FAF5E6] border-[#D4AF37]/35 hover:border-[#D4AF37] hover:shadow-[0_12px_45px_rgba(212,175,55,0.18)]' 
                                      : isDreamyTheme
                                      ? 'bg-white/85 border-2 border-pink-200/90 hover:border-pink-400 shadow-[0_10px_30px_rgba(244,63,94,0.12)] hover:shadow-[0_16px_40px_rgba(244,63,94,0.22)] backdrop-blur-md'
                                      : 'bg-neutral-900/50 border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]'
                                  }`}
                                >
                                  {/* Left Container: Square Album Sleeve + Vinyl Discs Sticking Out */}
                                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-start select-none">
                                    {/* Vinyl Discs Sticking Out to the Right */}
                                    {Array.from({ length: discCount }).map((_, dIdx) => {
                                      const offset = discOffsets[dIdx % discOffsets.length];
                                      const targetSong = songsInPlaylist[dIdx];
                                      const discCoverUrl = (targetSong && getSongCoverUrl(targetSong.thumbUrl || targetSong.coverUrl)) || coverUrl;

                                      return (
                                        <div 
                                          key={`disc-${dIdx}`}
                                          className={`absolute left-2 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-neutral-900/40 shadow-xl overflow-hidden pointer-events-none transition-transform duration-700 ease-out ${offset.rest} ${offset.hover} ${offset.z}`}
                                        >
                                          {/* Spinning Vinyl Record on Hover */}
                                          <div className="w-full h-full relative group-hover:animate-[spin_4s_linear_infinite]">
                                            {/* Vinyl Disc Background & Distinct Song Cover Art */}
                                            {discCoverUrl ? (
                                              <img src={discCoverUrl} className="w-full h-full object-cover rounded-full filter brightness-90" alt="" referrerPolicy="no-referrer" />
                                            ) : (
                                              <div className="w-full h-full bg-neutral-900 rounded-full" />
                                            )}
                                            {/* Grooves & Conic Shine */}
                                            <div 
                                              className="absolute inset-0 rounded-full pointer-events-none opacity-50 mix-blend-overlay"
                                              style={{ background: 'conic-gradient(from 0deg, rgba(255,255,255,0.4) 0deg, rgba(0,0,0,0.85) 90deg, rgba(255,255,255,0.4) 180deg, rgba(0,0,0,0.85) 270deg, rgba(255,255,255,0.4) 360deg)' }}
                                            />
                                            <div className="absolute inset-0 rounded-full border-[8px] sm:border-[10px] border-black/25 pointer-events-none" />
                                            
                                            {/* Center Label Badge */}
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full shadow-md border border-white flex items-center justify-center text-[6px] font-black text-stone-900 uppercase tracking-tighter">
                                              CD
                                            </div>
                                            {/* Transparent Cutout Hole */}
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-stone-800 bg-transparent shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Square Album Cover Sleeve */}
                                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden relative z-20 shadow-[0_8px_25px_rgba(0,0,0,0.3)] border-2 border-amber-600/40 group-hover:scale-[1.02] transition-transform duration-500 bg-stone-900 shrink-0">
                                      {coverUrl ? (
                                        <img src={coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={playlist.title} referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-full h-full bg-neutral-800 text-neutral-400 flex items-center justify-center">
                                          <ListMusic className="w-8 h-8" />
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className={`w-10 h-10 rounded-full ${isMusicianTheme ? 'bg-amber-500 hover:bg-amber-400 text-stone-950' : isGoldTheme ? 'bg-[#AA7C11]' : 'bg-purple-500'} flex items-center justify-center scale-80 group-hover:scale-100 transition-transform shadow-lg`}>
                                          <Play className={`w-4 h-4 ${isMusicianTheme ? 'text-stone-950 ml-0.5' : 'text-white ml-0.5'}`} fill="currentColor" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Container: Album Details */}
                                  <div className="flex-1 min-w-0 relative z-20 pr-6 sm:pr-8 pl-4 sm:pl-8">
                                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-1.5 ${
                                      isMusicianTheme 
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                        : 'bg-rose-500/10 text-rose-600 border border-rose-200/80'
                                    }`}>
                                      <Disc3 className={`w-3 h-3 ${isMusicianTheme ? 'text-amber-400' : 'text-rose-500'} animate-spin-slow`} />
                                      ALBUM / EP
                                    </div>
                                    <h3 className={`text-lg sm:text-xl font-black transition-colors line-clamp-2 leading-snug break-words ${
                                      isMusicianTheme ? 'text-amber-100 group-hover:text-amber-300' : isGoldTheme ? 'text-[#1A1303] group-hover:text-[#AA7C11]' : isDreamyTheme ? 'text-stone-900 group-hover:text-rose-600' : 'group-hover:text-purple-400 text-white'
                                    }`}>
                                      {playlist.title}
                                    </h3>
                                    <p className={`text-xs sm:text-sm mt-1.5 font-bold ${isMusicianTheme ? 'text-amber-200/70' : isGoldTheme ? 'text-stone-500' : isDreamyTheme ? 'text-stone-600' : 'text-neutral-400'}`}>
                                      {songsInPlaylist.length} bài hát
                                    </p>
                                  </div>

                                  {/* Share Button */}
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      let url = getArtistFullUrl(`/playlist/${playlist.id}`);
                                      url = formatShareUrl(url);
                                      await copyToClipboard(url);
                                      setToast('Đã copy link playlist!');
                                      setTimeout(() => setToast(''), 3000);
                                    }}
                                    className={`absolute bottom-3 right-3 z-20 ${
                                      isMusicianTheme
                                        ? 'bg-stone-900/80 border border-amber-600/40 text-amber-300 hover:bg-amber-500 hover:text-stone-950'
                                        : isGoldTheme 
                                        ? 'bg-[#FAF5E6] border border-[#D4AF37]/35 text-[#AA7C11] hover:text-[#1A1303]' 
                                        : 'bg-black/40 border border-white/10 text-white/80 hover:text-white'
                                    } p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 active:scale-90`}
                                    title="Chia sẻ playlist"
                                  >
                                    <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                  </button>
                                </Link>
                              );
                            })()}
                          </motion.div>
                        );
                      })
                    ) : (
                      paginatedItems.map((demo: any, idx: number) => (
                        <BrandLogoColorExtractor 
                          key={`l8164-demo-${demo.id || ""}-${idx}`} 
                          logoUrl={demo.isBrand ? demo.brandLogoUrl : undefined} 
                          defaultColor={demo.brandColor}
                        >
                          {(activeBrandColors) => (
                            <motion.div
                              key={`song-card-motion-${activeListTab}-${currentPage}-${demo.id || idx}`}
                              initial={isDreamyTheme ? { opacity: 0, y: 16, scale: 0.97 } : { opacity: 0, y: 10 }}
                              animate={isDreamyTheme ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={
                                isDreamyTheme 
                                  ? { 
                                      duration: 0.35, 
                                      delay: (idx % 6) * 0.04, 
                                      ease: [0.25, 0.46, 0.45, 0.94] 
                                    } 
                                  : { 
                                      duration: 0.25, 
                                      delay: Math.min(idx, 5) * 0.03, 
                                      ease: [0.25, 0.46, 0.45, 0.94] 
                                    }
                              }
                              className="relative overflow-visible w-full h-full"
                            >
                              {isMusicianTheme ? (
                                <MusicianSongCard 
                                  key={`musician-card-${demo.id || idx}`}
                                  demo={demo} 
                                  idx={idx} 
                                  activeListTab={activeListTab} 
                                  getArtistLink={getArtistLink} 
                                  t={t} 
                                  data={data}
                                  formatShareUrl={formatShareUrl}
                                  copyToClipboard={copyToClipboard}
                                  setToast={setToast}
                                  setActiveBioSong={setActiveBioSong}
                                />
                              ) : isDreamyTheme ? (
                                 <DreamySongCard 
                                   key={`dreamy-card-${demo.id || idx}`}
                                   demo={demo} 
                                   idx={idx} 
                                   activeListTab={activeListTab} 
                                   getArtistLink={getArtistLink} 
                                   t={t} 
                                   data={data}
                                   formatShareUrl={formatShareUrl}
                                   copyToClipboard={copyToClipboard}
                                   setToast={setToast}
                                   setActiveBioSong={setActiveBioSong}
                                   hasRowAchievement={paginatedItems.slice(Math.floor(idx / ((typeof window !== "undefined" && window.innerWidth < 1024) ? 2 : 3)) * ((typeof window !== "undefined" && window.innerWidth < 1024) ? 2 : 3), Math.floor(idx / ((typeof window !== "undefined" && window.innerWidth < 1024) ? 2 : 3)) * ((typeof window !== "undefined" && window.innerWidth < 1024) ? 2 : 3) + ((typeof window !== "undefined" && window.innerWidth < 1024) ? 2 : 3)).some((item: any) => (item.achievements && item.achievements.length > 0) || item.achievement || item.achievements || item.achievementText || item.award || item.youtubeViews || item.ytViews || item.viewsCount || item.spotifyListens || item.spListens || item.streamsCount)}
                                 />
                              ) : (isGold2Theme || (isGoldTheme && !isMobile)) ? (
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
                                  className={`group relative overflow-hidden rounded-[24px] p-2.5 sm:p-3 transition-all duration-300 flex flex-col items-stretch text-center h-full w-full ${
                                    demo.achievements && demo.achievements.length > 0
                                      ? 'border-[3px] border-[#D4AF37] shadow-[0_12px_32px_rgba(170,124,17,0.25)] hover:shadow-[0_16px_40px_rgba(170,124,17,0.4)] hover:scale-[1.02] bg-gradient-to-tr from-[#BF953F] via-[#FCF6BA] via-45% to-[#B38728] via-70% to-[#FBF5B7]'
                                      : 'border-2 border-[#D4AF37]/35 hover:border-[#D4AF37] shadow-[0_12px_45px_rgba(212,175,55,0.06)] hover:shadow-[0_16px_45px_rgba(212,175,55,0.16)] hover:scale-[1.015] bg-[#FAF5E6]'
                                  }`}
                                  style={demo.isBrand && activeBrandColors.primary && (!demo.achievements || demo.achievements.length === 0) ? {
                                    background: `linear-gradient(135deg, ${activeBrandColors.primary}1A 0%, ${activeBrandColors.secondary}15 100%)`,
                                    borderColor: `${activeBrandColors.primary}45`
                                  } : {}}
                                >
                                  {/* Animated Brand Logo Background */}
                                  {demo.isBrand && demo.brandLogoUrl && (
                                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700 flex items-center justify-center mix-blend-multiply">
                                      <motion.img
                                        src={demo.brandLogoUrl}
                                        alt="brand background"
                                        className="w-[140%] h-[140%] object-contain filter blur-[1px]"
                                        animate={{ 
                                          rotate: [0, 5, -5, 0],
                                          scale: [1, 1.05, 1]
                                        }}
                                        transition={{ 
                                          duration: 15, 
                                          repeat: Infinity, 
                                          ease: "easeInOut" 
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Glossy overlay effect for cards with achievements */}
                                  {demo.achievements && demo.achievements.length > 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/20 to-transparent pointer-events-none mix-blend-overlay z-0" />
                                  )}

                                  {/* 1. Song Cover Image Container */}
                                  <div className="w-full aspect-square rounded-2xl overflow-hidden relative border border-[#D4AF37]/25 group-hover:border-[#D4AF37] transition-colors select-none shadow-md z-10 bg-[#FAF5E6]">
                                    <AnimatePresence>
                                      {demo.isBrand && showBrandState && demo.brandLogoUrl ? (
                                        <motion.div
                                          key="brand-logo-vert"
                                          initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 6 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full flex items-center justify-center p-4 bg-[#FAF5E6]"
                                        >
                                          <motion.img 
                                            src={demo.brandLogoUrl} 
                                            animate={{ 
                                              scale: [1, 1.06, 1],
                                              rotate: [0, 1.5, -1.5, 0]
                                            }}
                                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-700" 
                                            alt={demo.brandName || ''} 
                                            referrerPolicy="no-referrer" 
                                          />
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          key="normal-cover-vert"
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          transition={{ duration: 0.45, ease: "easeOut" }}
                                          className="absolute inset-0 w-full h-full"
                                        >
                                          {getSongCoverUrl(demo.thumbUrl || demo.coverUrl) ? (
                                            <img 
                                              src={getSongCoverUrl(demo.thumbUrl || demo.coverUrl)} 
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                              alt={demo.title} 
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-[#FAF5E6] text-stone-400 group-hover:text-[#AA7C11] flex items-center justify-center transition-colors">
                                              <Disc3 className="w-10 h-10 animate-spin-slow" />
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Play hover effect */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                      <div className="w-11 h-11 rounded-full bg-[#AA7C11] flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg">
                                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                                      </div>
                                    </div>

                                    {/* Year Badge inside the Image (bottom left) as seen in Image 1 */}
                                    {demo.releaseYear && (
                                      <div className="absolute bottom-2.5 left-2.5 bg-black/50 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 z-20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                        {demo.releaseYear}
                                      </div>
                                    )}

                                    {/* Share Button inside the Image (top right) */}
                                    {demo.isReleased && (
                                      <button
                                        key={`l8265-share-btn-top-${demo.id || ''}-${idx}`}
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          let url = getArtistFullUrl(`/playlist/released?song=${demo.slug || demo.id}`);
                                          url = formatShareUrl(url);
                                          await copyToClipboard(url);
                                          setToast('Đã copy link bài hát!');
                                          setTimeout(() => setToast(''), 3000);
                                        }}
                                        className="absolute top-2.5 right-2.5 z-30 bg-[#FAF5E6]/95 hover:bg-white border border-[#D4AF37]/50 text-[#AA7C11] hover:text-[#1A1303] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 active:scale-90"
                                        title="Chia sẻ bài hát"
                                      >
                                        <Share2 className="w-3.5 h-3.5 stroke-[2]" />
                                      </button>
                                    )}

                                    {/* Lock badge inside the Image (top left) */}
                                    {(demo.password || data?.globalPassword) && !demo.isReleased && demo.linkType !== 'indirect' && (
                                      <div className="absolute top-2.5 left-2.5 z-30 bg-[#FAF5E6]/90 border border-[#D4AF37]/30 p-1.5 rounded-full shadow-md">
                                        <Lock className="w-3.5 h-3.5 text-yellow-500" />
                                      </div>
                                    )}
                                  </div>

                                  {/* 2. Song Title */}
                                   <div className="mt-2.5 sm:mt-3 min-h-[44px] flex items-center justify-center text-center px-1 z-10 w-full relative">
                                     <AnimatePresence mode="wait">
                                       {demo.isBrand && showBrandState && demo.brandName ? (
                                         <motion.h3 
                                           key="brand-title-vert"
                                           initial={{ opacity: 0, y: 6 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           exit={{ opacity: 0, y: -6 }}
                                           transition={{ duration: 0.35 }}
                                           className="w-full px-2 font-black text-[#AA7C11] text-sm sm:text-base tracking-tight leading-tight flex items-center justify-center gap-1 flex-wrap"
                                         >
                                           <span className="bg-[#D4AF37]/25 text-[#AA7C11] text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0">{t("Thương hiệu")}</span>
                                           <span className="truncate">{demo.brandName}</span>
                                         </motion.h3>
                                       ) : (
                                         <motion.h3 
                                           key="song-title-vert"
                                           initial={{ opacity: 0, y: -6 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           exit={{ opacity: 0, y: 6 }}
                                           transition={{ duration: 0.35 }}
                                           className="w-full px-2 flex items-center justify-center font-black text-[#1A1303] group-hover:text-[#AA7C11] text-sm sm:text-base tracking-tight leading-tight transition-colors" 
                                           title={demo.title}
                                         >
                                           <HoverTranslate text={demo.title} format={true} />
                                         </motion.h3>
                                       )}
                                     </AnimatePresence>
                                   </div>

                                   {/* 3. Artist/Singer */}
                                   <div className="mb-2 sm:mb-2.5 mt-0.5 z-10 w-full px-2 min-h-[18px] relative">
                                     <AnimatePresence mode="wait">
                                       {demo.isBrand && showBrandState ? (
                                         <motion.div
                                           key="brand-brief-vert"
                                           initial={{ opacity: 0 }}
                                           animate={{ opacity: 1 }}
                                           exit={{ opacity: 0 }}
                                           transition={{ duration: 0.35 }}
                                           className="w-full text-xs text-[#5C3E14] font-bold text-center justify-center flex items-center gap-1.5"
                                         >
                                           <span className="w-1.5 h-1.5 rounded-full bg-[#AA7C11] animate-pulse shrink-0"></span>
                                           <span>{t("Nhạc Thương Hiệu")}</span>
                                         </motion.div>
                                       ) : (
                                         <motion.div key="artist-name-vert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="w-full flex items-center justify-center">
                                           <MarqueeText className={`${
                                             demo.achievements && demo.achievements.length > 0
                                               ? 'text-[#5C3E14] font-black'
                                               : 'text-stone-500 font-semibold'
                                           } text-xs text-center justify-center w-full`}>
                                             {formatText(demo.singer || demo.author || data?.artistName || 'Nghệ sĩ', true)}
                                           </MarqueeText>
                                         </motion.div>
                                       )}
                                     </AnimatePresence>
                                   </div>

                                   {/* 4. Bottom Achievement/Platform Bar (as seen in Image 1) with float/wobble */}
                                  {demo.achievements && demo.achievements.length > 0 && (
                                    <div className="w-full mt-auto pt-3 border-t border-[#D4AF37]/15 z-10">
                                      <motion.div 
                                        animate={{ 
                                          y: [0, -1.5, 0, 1.5, 0],
                                          rotate: [0, -0.3, 0, 0.3, 0]
                                        }}
                                        transition={{
                                          duration: 5.5,
                                          repeat: Infinity,
                                          ease: "easeInOut"
                                        }}
                                        className="w-full h-14 relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-950 via-[#1E1505] to-stone-950 border border-[#D4AF37]/45 flex items-center justify-between px-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.35)]"
                                      >
                                        {/* Subtle looping golden pulse glow */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.22),transparent_70%)] animate-pulse" />
                                        {/* Golden shine loop sweep */}
                                        <motion.div 
                                          animate={{ x: ['-100%', '200%'] }}
                                          transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                                          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent skew-x-12 pointer-events-none"
                                        />
                                        <div className="relative z-10 w-full h-full flex items-center justify-between">
                                          <AchievementCycle achievements={demo.achievements} align="left" />
                                        </div>
                                      </motion.div>
                                    </div>
                                  )}

                                </Link>
                              ) : (
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
                                  className={`group relative rounded-2xl p-1.5 sm:p-4 transition-all duration-500 flex items-center gap-2 sm:gap-3 w-full ${
                                    demo.isBrand 
                                      ? 'hover:border-white/10' 
                                      : isGoldTheme
                                        ? 'border border-[#D4AF37]/35 shadow-[0_12px_45px_rgba(212,175,55,0.06)] hover:border-[#D4AF37] hover:shadow-[0_15px_45px_rgba(212,175,55,0.16)] hover:scale-[1.015]'
                                        : demo.achievements?.length 
                                          ? 'hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]' 
                                          : 'hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]'
                                  }`}
                                  style={demo.isBrand ? {
                                    boxShadow: `0 10px 30px -10px ${activeBrandColors.primary}30`
                                  } as React.CSSProperties : undefined}
                                >
                                  {demo.isBrand ? (
                                    <div 
                                      className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 bg-neutral-950/65 border transition-all duration-500"
                                      style={{
                                        borderColor: `${activeBrandColors.primary}20`,
                                      }}
                                    >
                                      {demo.brandLogoUrl && (
                                        <>
                                          <img 
                                            src={demo.brandLogoUrl} 
                                            className="absolute inset-0 w-full h-full object-cover rounded-full opacity-[0.15] blur-2xl scale-150 transition-transform duration-1000 ease-out group-hover:scale-[1.75]" 
                                            alt="" 
                                            referrerPolicy="no-referrer"
                                          />
                                          <img 
                                            src={demo.brandLogoUrl} 
                                            className="absolute -right-2 -bottom-2 w-32 h-20 object-contain opacity-[0.25] blur-[0.5px] animate-brand-logo-float transition-all duration-1000 ease-out group-hover:opacity-[0.45]"
                                            alt="" 
                                            referrerPolicy="no-referrer"
                                          />
                                        </>
                                      )}
                                      <div 
                                        className="absolute inset-0 transition-opacity duration-700 opacity-40 group-hover:opacity-80"
                                        style={{
                                          background: `radial-gradient(circle at bottom right, ${activeBrandColors.primary}20, transparent 65%)`
                                        }}
                                      />
                                    </div>
                                  ) : demo.achievements && demo.achievements.length > 0 ? (
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                                      <div className={`absolute inset-[-50%] ${isGoldTheme ? 'bg-[conic-gradient(from_0deg,transparent_0_280deg,#AA7C11_360deg)]' : 'bg-[conic-gradient(from_0deg,transparent_0_280deg,theme(colors.amber.500)_360deg)]'} animate-rotate-border z-0 opacity-80`} />
                                      <div className={`absolute inset-[1px] rounded-[15px] ${isGoldTheme ? 'bg-[#140F03]/95 backdrop-blur-xl' : 'bg-neutral-900/80 backdrop-blur-md'} z-0`} />
                                      <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-br from-amber-950/10 to-transparent z-0" />
                                      <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full animate-shimmer-sweep z-0 pointer-events-none skew-x-[-20deg]" />
                                    </div>
                                  ) : (
                                    <div className={`absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none z-0 border transition-all duration-300 ${
                                      isGoldTheme 
                                        ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border-[#D4AF37]/35 group-hover:border-[#D4AF37]' 
                                        : 'bg-neutral-900/50 border-white/5 group-hover:border-rose-500/50'
                                    }`}>
                                      {isGoldTheme && !isMobile ? (
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/5 transition-all duration-500 z-0"></div>
                                      ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/10 transition-all duration-500 z-0"></div>
                                      )}
                                    </div>
                                  )}
                                  <div className="w-20 h-20 sm:w-20 sm:h-20 shrink-0 relative z-10 select-none">
                                    <div className={`w-full h-full rounded-xl overflow-hidden relative border ${isGoldTheme ? 'border-[#D4AF37]/35 group-hover:border-[#D4AF37]' : 'border-white/10 group-hover:border-rose-500/30'} transition-colors`}>
                                      <AnimatePresence mode="wait">
                                        {demo.isBrand && showBrandState && demo.brandLogoUrl ? (
                                          <motion.div
                                            key="brand-logo"
                                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="absolute inset-0 w-full h-full flex items-center justify-center p-1 bg-transparent"
                                          >
                                            <img src={demo.brandLogoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 shadow-sm" alt={demo.brandName} referrerPolicy="no-referrer" />
                                          </motion.div>
                                        ) : (
                                          <motion.div
                                            key="normal-cover"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.45, ease: "easeOut" }}
                                            className="absolute inset-0 w-full h-full"
                                          >
                                            {getSongCoverUrl(demo.thumbUrl || demo.coverUrl) ? (
                                               <img src={getSongCoverUrl(demo.thumbUrl || demo.coverUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={demo.title} />
                                            ) : (
                                               <div className={`w-full h-full ${isGoldTheme ? 'bg-[#FAF5E6] text-stone-400 group-hover:text-[#AA7C11]' : 'bg-neutral-800 text-neutral-600 group-hover:text-rose-500'} flex items-center justify-center transition-colors`}>
                                                  <Disc3 className="w-6 h-6 sm:w-8 sm:h-8" />
                                               </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                        <div className={`w-8 h-8 rounded-full ${isGoldTheme ? 'bg-[#AA7C11]' : 'bg-rose-500'} flex items-center justify-center scale-75 group-hover:scale-100 transition-transform shadow-lg`}>
                                          <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {(() => {
                                    const hasAchievements = demo.achievements && demo.achievements.length > 0;
                                    const titleLength = demo.title?.length || 0;
                                    const artistLength = demo.singer?.length || demo.author?.length || 0;
                                    const isTitleLong = titleLength > 28;
const activeAchievements = hasAchievements;
                                    
                                    return (
                                      <>
                                        <div className={`flex-1 min-w-0 relative z-10 flex flex-col justify-center h-full overflow-visible ${activeAchievements ? 'pr-1.5' : 'pr-1.5 sm:pr-3'}`}>
                                          <AnimatePresence mode="wait">
                                            {demo.isBrand && showBrandState && demo.brandName ? (
                                              <motion.div
                                                key="brand-text"
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -3 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="relative flex flex-col justify-center w-full min-w-0"
                                              >
                                                <h3 
                                                  className="font-bold text-[8px] xs:text-[9px] sm:text-lg truncate filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)] whitespace-normal max-w-full"
                                                >
                                                  <HoverTranslate text="Đối Tác: " style={{ color: activeBrandColors.secondary }} />
                                                  <HoverTranslate text={demo.brandName} style={{ color: activeBrandColors.primary }} />
                                                </h3>
                                                <p className="text-white font-bold text-[8.5px] xs:text-[10px] sm:text-xs mt-0.5 truncate tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                                                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeBrandColors.secondary }}></span>
                                                  {t("Nhạc Thương Hiệu")}
                                                </p>
                                              </motion.div>
                                            ) : (
                                              <motion.div
                                                key="normal-text"
                                                initial={{ opacity: 0, y: -3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 3 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="relative flex flex-col justify-center w-full min-w-0"
                                              >
                                                <h3 className={`font-bold transition-colors ${
  activeAchievements
     ? `text-[11px] sm:text-[13px] ${demo.isBrand ? 'text-white group-hover:text-amber-400' : (isGoldTheme ? 'text-white group-hover:text-[#D4AF37]' : 'text-white group-hover:text-amber-400')} leading-tight whitespace-normal break-words line-clamp-2`
     : `${titleLength > 35 ? 'text-xs sm:text-base' : 'text-sm sm:text-lg'} ${demo.isBrand ? 'text-white group-hover:text-amber-400' : (isGoldTheme ? 'text-[#1A1303] group-hover:text-black' : 'group-hover:text-rose-400')} leading-tight whitespace-normal break-words line-clamp-2`
}`} title={demo.title}>
  <span className="relative inline overflow-visible">
    <HoverTranslate text={demo.title} format={true} forceDark={demo.isBrand} />
  </span>
</h3>
<MarqueeText className={`${
  demo.isBrand
     ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-xs'
     : (isGoldTheme
         ? (activeAchievements ? 'text-amber-200/80 font-bold' : 'text-stone-500 font-bold')
         : 'text-neutral-400')
} mt-0.5 ${activeAchievements ? 'text-[9.5px]' : 'text-[11px]'} w-full`}>
  {formatText(demo.singer || demo.author || data?.artistName || 'Nghệ sĩ', true, demo.isBrand ? false : isGoldTheme)}
</MarqueeText>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                        {activeAchievements && (
                                          <div className="relative z-10 shrink-0 w-[125px] sm:w-[150px] pr-1 sm:pr-3">
                                             <AchievementCycle achievements={demo.achievements} />
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                  {demo.isReleased && (
                                    <button
                                      key={`l8531-share-btn-bottom-${demo.id || ''}-${idx}`}
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        let url = getArtistFullUrl(`/song/${demo.slug || demo.id}`);
                                        url = formatShareUrl(url);
                                        await copyToClipboard(url);
                                        setToast('Đã copy link bài hát!');
                                        setTimeout(() => setToast(''), 3000);
                                      }}
                                      className={`absolute bottom-3 right-3 z-20 ${
                                        isGoldTheme 
                                          ? 'bg-[#FAF5E6] border border-[#D4AF37]/35 text-[#AA7C11] hover:text-[#1A1303]' 
                                          : 'bg-black/40 border border-white/10 text-white/80 hover:text-white'
                                      } p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 active:scale-90`}
                                      title="Chia sẻ bài hát"
                                    >
                                      <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                    </button>
                                  )}
                                  {(demo.password || data?.globalPassword) && !demo.isReleased && demo.linkType !== 'indirect' && (
                                    <div className={`absolute bottom-3 right-3 z-20 ${isGoldTheme ? 'bg-[#FAF5E6] border border-[#D4AF37]/30' : 'bg-black/60 border border-white/10'} p-1.5 rounded-full shadow-md`}>
                                       <Lock className="w-3.5 h-3.5 text-yellow-500" />
                                    </div>
                                  )}
                                  {demo.releaseYear && (
                                    <div className={`absolute bottom-0 left-0 ${
                                      isGoldTheme 
                                        ? 'bg-gradient-to-tr from-[#FAF5E6] to-[#EADCB9] text-[#8C6B1B] border-t border-r border-[#D4AF37]/30 shadow-xs' 
                                        : 'bg-gradient-to-tr from-rose-950/90 via-stone-900/90 to-amber-950/85 text-rose-200 border-t border-r border-rose-500/30'
                                    } backdrop-blur-[4px] text-[8px] sm:text-[9.5px] font-mono font-black px-3 py-0.5 rounded-tr-xl rounded-bl-[15px] z-20 transition-all duration-300 group-hover:from-[#AA7C11] group-hover:to-[#D4AF37] group-hover:text-[#FAF5E6] group-hover:border-[#D4AF37]/50 pointer-events-none select-none tracking-widest flex items-center gap-1.5`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isGoldTheme ? 'bg-[#AA7C11] group-hover:bg-[#FAF5E6]' : 'bg-rose-500'} animate-pulse group-hover:bg-white shrink-0`}></span>
                                      {demo.releaseYear}
                                    </div>
                                  )}
                                </Link>
                              )}

                              {/* Wobbling outer badge (only for non-musician themes) */}
                              {!isMusicianTheme && !isDreamyTheme && (
                                <motion.div
                                  animate={{ 
                                    rotate: [15, 11, 19, 11, 15],
                                    scale: [1, 1.05, 0.95, 1.05, 1]
                                  }}
                                  transition={{ 
                                    duration: 4.5, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                  }}
                                  className="absolute -top-2.5 -right-2.5 z-40 select-none pointer-events-none"
                                >
                                  {demo.isReleased ? (
                                    <span className="bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.8)] text-[9px] font-black text-white px-2.5 py-0.5 rounded border border-emerald-400/50 block">
                                      {t.lReleasedMark || 'RELEASED'}
                                    </span>
                                  ) : (
                                    <span className={`shadow-md text-[9px] font-black px-2.5 py-0.5 rounded block ${
                                      isGoldTheme 
                                        ? 'bg-[#1A1303] text-[#FAF5E6] border border-[#D4AF37]' 
                                        : demo.linkType === 'indirect' 
                                          ? 'bg-indigo-600 text-white border border-white/20 shadow-[0_0_12px_rgba(79,70,229,0.5)]' 
                                          : 'bg-rose-600 text-white border border-white/20 shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                                    }`}>
                                      {demo.linkType === 'indirect' ? 'Landing Page' : (t.lDemoMark || 'DEMO')}
                                    </span>
                                  )}
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </BrandLogoColorExtractor>
                      ))
                    )}
                  </motion.div>
                )}

                {totalItems > 0 && (
                  <div className={`col-span-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t ${isMusicianTheme ? 'border-amber-800/60' : isDreamyTheme ? 'border-purple-200/80' : isGoldTheme ? 'border-[#D4AF37]/35' : 'border-white/10'}`}>
                    <div className={`flex items-center gap-2 text-xs sm:text-sm ${isMusicianTheme ? 'text-amber-100/90 font-serif font-bold drop-shadow-xs' : isDreamyTheme ? 'text-stone-900 font-extrabold' : isGoldTheme ? 'text-[#1A1303] font-semibold' : 'text-neutral-300'}`}>
                      <span>{t("Hiển thị")}</span>
                      <BeautifulSelect 
                        value={pageSize} 
                        onChange={(val) => {
                          setUserHasChangedPageSize(true);
                          setPageSize(val);
                          setCurrentPage(1);
                        }}
                        options={(typeof window !== 'undefined' && window.innerWidth < 1024) ? [20, 50, 100] : [21, 50, 100]}
                        isGoldTheme={isGoldTheme || isMusicianTheme}
                        isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme}
                      />
                      <span>{t("bài / trang")} ({t("Tổng")}: {totalItems})</span>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                            const el = document.getElementById('music-tabs-section');
                            if (el && el.getBoundingClientRect().top < 0) {
                              window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md relative overflow-hidden ${
                            currentPage === 1 
                              ? isMusicianTheme
                                ? 'bg-[#1A0B05]/60 border-amber-950/60 text-amber-200/30 cursor-not-allowed select-none'
                                : isDreamyTheme
                                  ? 'bg-white/60 border border-purple-200 text-stone-400 cursor-not-allowed select-none'
                                  : isGoldTheme
                                    ? 'bg-neutral-100/50 border-neutral-200 text-neutral-300 cursor-not-allowed select-none' 
                                    : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                              : isMusicianTheme
                                ? 'border-amber-800/80 text-amber-100 hover:border-amber-400 hover:text-amber-200 shadow-md font-bold'
                                : isDreamyTheme
                                  ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs'
                                  : isGoldTheme 
                                    ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                    : `bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 ${activeHoverBorderColor}`
                          }`}
                        >
                          {isMusicianTheme && currentPage !== 1 && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                          <span className="relative z-[2]">{t("Trước")}</span>
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
                                key={`l8658-page-btn-1-${page}`}
                                onClick={() => {
                                  setCurrentPage(page);
                                  const el = document.getElementById('music-tabs-section');
                                  if (el && el.getBoundingClientRect().top < 0) {
                                    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                                  }
                                }}
                                className={`w-9 h-9 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md flex items-center justify-center relative overflow-hidden ${
                                  isCurrent 
                                    ? isMusicianTheme
                                      ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                      : isDreamyTheme
                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black border-rose-400 shadow-md'
                                        : activeColorClass 
                                    : isMusicianTheme
                                      ? 'border-amber-800/80 text-amber-100 font-bold hover:border-amber-400 shadow-md'
                                      : isDreamyTheme
                                        ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs'
                                        : isGoldTheme 
                                          ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                          : `bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/15 ${activeHoverBorderColor}`
                                }`}
                              >
                                {isMusicianTheme && !isCurrent && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                                <span className="relative z-[2]">{page}</span>
                              </button>
                            );
                          });
                        })()}
                        
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                            const el = document.getElementById('music-tabs-section');
                            if (el && el.getBoundingClientRect().top < 0) {
                              window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md relative overflow-hidden ${
                            currentPage === totalPages 
                              ? isMusicianTheme
                                ? 'bg-[#1A0B05]/60 border-amber-950/60 text-amber-200/30 cursor-not-allowed select-none'
                                : isDreamyTheme
                                  ? 'bg-white/60 border border-purple-200 text-stone-400 cursor-not-allowed select-none'
                                  : isGoldTheme
                                    ? 'bg-neutral-100/50 border-neutral-200 text-neutral-300 cursor-not-allowed select-none' 
                                    : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                              : isMusicianTheme
                                ? 'border-amber-800/80 text-amber-100 hover:border-amber-400 hover:text-amber-200 shadow-md font-bold'
                                : isDreamyTheme
                                  ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs'
                                  : isGoldTheme 
                                    ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                    : `bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 ${activeHoverBorderColor}`
                          }`}
                        >
                          {isMusicianTheme && currentPage !== totalPages && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                          <span className="relative z-[2]">{t("Sau")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
          })()}
        </section>
            </div>

            {(() => {
              const fallbackYtFromSongs = [
                ...(data.releasedSongs || []),
                ...(data.demos || [])
              ].filter((s: any) => s.linkYoutube).map((s: any) => {
                const match = String(s.linkYoutube).match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                return {
                  title: s.title,
                  videoId: match ? match[1] : '',
                  youtubeUrl: s.linkYoutube
                };
              }).filter((v: any) => v.videoId);

              const effectiveMvs = (ytVideos && ytVideos.length > 0) ? ytVideos : fallbackYtFromSongs;

              if (!isSectionVisible('mv') || effectiveMvs.length === 0) return null;

              const mvTotalItems = effectiveMvs.length;
              const mvTotalPages = Math.ceil(mvTotalItems / mvPageSize);
              const mvStartIndex = (mvCurrentPage - 1) * mvPageSize;
              const paginatedMVs = effectiveMvs.slice(mvStartIndex, mvStartIndex + mvPageSize);
              
              return (
                <div style={{ order: mvOrder }} className={`w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 ${firstVisibleSection === 'mv' ? 'pt-24 sm:pt-28' : ''}`}>
                  <section id="mv-section" className="mt-12">
                    <div className={`flex items-center gap-3 mb-8 px-4 border-b pb-4 ${isMusicianTheme ? 'border-amber-800/60' : (isGoldTheme || isDreamyTheme) ? 'border-purple-200/80' : 'border-white/10'}`}>
                      <Music className={`w-6 h-6 ${isMusicianTheme ? 'text-amber-400' : isDreamyTheme ? 'text-rose-500' : isGoldTheme ? 'text-[#AA7C11]' : 'text-emerald-500'}`} />
                      <h2 className={`text-2xl font-bold tracking-tight ${isMusicianTheme ? 'text-amber-100 font-serif font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : (isGoldTheme || isDreamyTheme) ? 'text-stone-950 font-black' : 'text-white'}`}>{t.rMv}</h2>
                    </div>
                    <motion.div 
                      key={`mv-page-${mvCurrentPage}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      {paginatedMVs.map((song: any, idx: number) => (
                        <button 
                          onClick={() => setPlayingVideo(song.videoId)} key={`l8724-${song.videoId || ''}-${song.id || ''}-${idx}`} 
                          className={`w-full text-left flex items-center gap-4 rounded-2xl p-3.5 shadow-lg transition-all duration-300 group border relative overflow-hidden ${
                            isMusicianTheme
                              ? 'border-amber-800/80 hover:border-amber-500/90 shadow-[0_8px_25px_rgba(0,0,0,0.8)]'
                              : isDreamyTheme
                                ? 'bg-white/95 border-2 border-rose-200/90 hover:bg-white hover:border-rose-400 shadow-[0_4px_20px_rgba(244,63,94,0.12)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.22)]'
                                : isGoldTheme 
                                  ? 'bg-[#FAF5E6] border-[#D4AF37]/35 hover:bg-white hover:border-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.06)]' 
                                  : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20 shadow-black/10'
                          }`}
                        >
                          {/* Wood grain texture for MV items */}
                          {isMusicianTheme && (
                            <>
                              <div className="absolute inset-0 z-0 css-wood-grain-dark" />
                              <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/30 via-transparent to-black/30" />
                            </>
                          )}
                          <div className={`w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 relative z-[2] border ${isMusicianTheme ? 'border-amber-700/60' : isDreamyTheme ? 'border-2 border-rose-300' : isGoldTheme ? 'border-[#D4AF37]/20' : 'border-white/5'}`}>
                            <img src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`} alt={song.title} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                              <div className={`p-2 backdrop-blur-md border rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.3)] opacity-90 group-hover:opacity-100 scale-90 group-hover:scale-105 transition-all duration-300 flex items-center justify-center ${
                                isMusicianTheme ? 'bg-amber-600/90 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : isDreamyTheme ? 'bg-rose-500/80 border-rose-300' : isGoldTheme ? 'bg-[#AA7C11]/20 border-[#D4AF37]' : 'bg-white/10 border-white/30'
                              }`}>
                                <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                          <h3 className={`text-base sm:text-lg font-bold pr-2 break-words transition-colors relative z-[2] ${
                            isMusicianTheme ? 'text-amber-100 group-hover:text-amber-300 font-serif font-extrabold' : isDreamyTheme ? 'text-stone-900 group-hover:text-rose-600 font-extrabold' : isGoldTheme ? 'text-[#1A1303] group-hover:text-[#AA7C11]' : 'text-white/90 group-hover:text-white'
                          }`}>{song.title}</h3>
                        </button>
                      ))}
                    </motion.div>

              {/* Pagination controls for MV */}
              {mvTotalItems > 0 && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-6 border-t ${isMusicianTheme ? 'border-amber-800/60' : isDreamyTheme ? 'border-purple-200/80' : isGoldTheme ? 'border-[#D4AF37]/35' : 'border-white/10'}`}>
                  <div className={`flex items-center gap-2 text-xs sm:text-sm ${isMusicianTheme ? 'text-amber-100/90 font-serif font-bold drop-shadow-xs' : isDreamyTheme ? 'text-stone-900 font-extrabold' : isGoldTheme ? 'text-[#1A1303] font-semibold' : 'text-neutral-300'}`}>
                    <span>{t("Hiển thị")}</span>
                    <BeautifulSelect 
                      value={mvPageSize} 
                      onChange={(val) => {
                        setMvPageSize(val);
                        setMvCurrentPage(1);
                      }}
                      options={[8, 20, 50]}
                      isGoldTheme={isGoldTheme || isMusicianTheme}
                      isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme}
                    />
                    <span>{t("bài / trang")} ({t("Tổng")}: {mvTotalItems})</span>
                  </div>

                  {mvTotalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={mvCurrentPage === 1}
                        onClick={() => {
                          setMvCurrentPage(prev => Math.max(prev - 1, 1));
                          const el = document.getElementById('mv-section');
                          if (el && el.getBoundingClientRect().top < 0) {
                            window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md relative overflow-hidden ${
                          mvCurrentPage === 1 
                            ? isMusicianTheme
                              ? 'bg-[#1A0B05]/60 border-amber-950/60 text-amber-200/30 cursor-not-allowed select-none'
                              : isDreamyTheme 
                                ? 'bg-white/60 border border-purple-200 text-stone-400 cursor-not-allowed select-none' 
                                : isGoldTheme 
                                  ? 'bg-neutral-100/50 border-neutral-200 text-neutral-300 cursor-not-allowed select-none' 
                                  : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                            : isMusicianTheme
                              ? 'border-amber-800/80 text-amber-100 hover:border-amber-400 hover:text-amber-200 shadow-md font-bold'
                              : isDreamyTheme 
                                ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs' 
                                : isGoldTheme 
                                  ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                  : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-emerald-500/50'
                        }`}
                      >
                        {isMusicianTheme && mvCurrentPage !== 1 && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                        <span className="relative z-[2]">{t("Trước")}</span>
                      </button>
                      
                      {(() => {
                        const pages: number[] = [];
                        let startPage = Math.max(1, mvCurrentPage - 2);
                        let endPage = Math.min(mvTotalPages, startPage + 4);
                        if (endPage - startPage < 4) {
                          startPage = Math.max(1, endPage - 4);
                        }
                        for (let p = startPage; p <= endPage; p++) {
                          pages.push(p);
                        }
                        return pages.map(page => {
                          const isCurrent = mvCurrentPage === page;
                          return (
                            <button
                              key={`l8801-page-btn-2-${page}`}
                              onClick={() => {
                                setMvCurrentPage(page);
                                const el = document.getElementById('mv-section');
                                if (el && el.getBoundingClientRect().top < 0) {
                                  window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                                }
                              }}
                              className={`w-9 h-9 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md flex items-center justify-center relative overflow-hidden ${
                                isCurrent 
                                  ? isMusicianTheme
                                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                    : isDreamyTheme 
                                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black shadow-md border-rose-400' 
                                      : isGoldTheme 
                                        ? 'bg-[#AA7C11] text-white shadow-[0_0_15px_rgba(170,124,17,0.45)] border-[#AA7C11]' 
                                        : 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] border-emerald-500' 
                                  : isMusicianTheme
                                    ? 'border-amber-800/80 text-amber-100 font-bold hover:border-amber-400 hover:text-amber-200 shadow-md'
                                    : isDreamyTheme 
                                      ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs' 
                                      : isGoldTheme 
                                        ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/15 hover:border-emerald-500/50'
                              }`}
                            >
                              {isMusicianTheme && !isCurrent && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                              <span className="relative z-[2]">{page}</span>
                            </button>
                          );
                        });
                      })()}
                      
                      <button
                        disabled={mvCurrentPage === mvTotalPages}
                        onClick={() => {
                          setMvCurrentPage(prev => Math.min(prev + 1, mvTotalPages));
                          const el = document.getElementById('mv-section');
                          if (el && el.getBoundingClientRect().top < 0) {
                            window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-300 shadow-md relative overflow-hidden ${
                          mvCurrentPage === mvTotalPages 
                            ? isMusicianTheme
                              ? 'bg-[#1A0B05]/60 border-amber-950/60 text-amber-200/30 cursor-not-allowed select-none'
                              : isDreamyTheme 
                                ? 'bg-white/60 border border-purple-200 text-stone-400 cursor-not-allowed select-none' 
                                : isGoldTheme 
                                  ? 'bg-neutral-100/50 border-neutral-200 text-neutral-300 cursor-not-allowed select-none' 
                                  : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed select-none' 
                            : isMusicianTheme
                              ? 'border-amber-800/80 text-amber-100 hover:border-amber-400 hover:text-amber-200 shadow-md font-bold'
                              : isDreamyTheme 
                                ? 'bg-white border-2 border-purple-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs' 
                                : isGoldTheme 
                                  ? 'bg-[#FAF5E6] border-[#D4AF37]/35 text-[#1A1303] hover:bg-white hover:border-[#D4AF37]' 
                                  : 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-emerald-500/50'
                        }`}
                      >
                        {isMusicianTheme && mvCurrentPage !== mvTotalPages && <div className="absolute inset-0 z-0 css-wood-grain-dark" />}
                        <span className="relative z-[2]">{t("Sau")}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
                    </section>
                  </div>
                );
              })()}
          </main>
        );
      })()}

      {!isVault && (
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 pb-32 pt-24 sm:pt-28">
          {isAbout && <PublicAboutView aboutMe={data.aboutMe} data={data} t={t} onGoToVault={() => setActiveMenuTab(data.menus?.find((m: any) => m.type === 'vault')?.id || 'm1')} isAdmin={!!getAdminToken()} artistExtension={getArtistExtensionFromUrl()} isGoldTheme={isGoldTheme} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} />}
          {isBio && <PublicBioView biography={data.biography} t={t} isAdmin={!!getAdminToken()} artistExtension={getArtistExtensionFromUrl()} isGoldTheme={isGoldTheme} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} />}
        </main>
      )}

      <footer className="py-8 text-center text-sm border-t border-white/10 relative z-10">
        <a href="https://Chorus.vn" target="_blank" rel="noopener noreferrer" className={`font-bold tracking-wider ${isGoldTheme ? 'text-amber-500 hover:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-rose-500/80 hover:text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'} transition-all`}>
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
          <IndirectBioCard key="indirect-bio-card" 
            demo={{...activeBioSong, coverUrl: getPreviewUrl(getSongCoverUrl(activeBioSong.thumbUrl || activeBioSong.coverUrl))}} 
            onClose={() => setActiveBioSong(null)} 
            isStandalone={false}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Wall Photo Lightbox Modal */}
      <AnimatePresence>
        {wallLightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
            onClick={() => setWallLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-4xl max-h-[85vh] p-2.5 sm:p-4 rounded-2xl bg-[#2D160B] border-4 border-amber-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setWallLightboxImg(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-amber-200 border border-amber-500/40 flex items-center justify-center transition-all cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={wallLightboxImg}
                alt="Framed wall photo preview"
                className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// [CODE-SPLIT] resolveUploadUrl, copyToClipboard, getAudioPlayUrl moved to src/utils/shared.ts

function Seek10BackwardIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" />
      <text x="12" y="16" fontSize="8" fontWeight="800" textAnchor="middle" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif">10</text>
    </svg>
  );
}

function Seek10ForwardIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" fill="currentColor" />
      <text x="12" y="16" fontSize="8" fontWeight="800" textAnchor="middle" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif">10</text>
    </svg>
  );
}

function YouTubeSeekOverlay({ side, seconds }: { side: 'left' | 'right'; seconds: number }) {
  return (
    <motion.div
      key={`seek-overlay-${side}-${seconds}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`absolute inset-y-1 ${side === 'left' ? 'left-1 rounded-r-[100%]' : 'right-1 rounded-l-[100%]'} w-1/3 bg-black/45 backdrop-blur-md flex items-center justify-center z-[250] pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.4)] overflow-hidden`}
    >
      <div className="flex items-center gap-1 text-white/90 drop-shadow-md select-none">
        {side === 'left' ? (
          <>
            <span className="text-base sm:text-lg font-black font-mono tracking-tight">-{seconds}s</span>
            <div className="flex items-center text-white animate-pulse">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </div>
          </>
        ) : (
          <>
            <span className="text-base sm:text-lg font-black font-mono tracking-tight">+{seconds}s</span>
            <div className="flex items-center text-white animate-pulse">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CustomAudioPlayer({ src, backupAudioUrl, template, onEnded, onAlmostEnded, playlistContext, isPreview, lyricsColor, waveColor, showDownload, title, singer, isReleased }: { src: string, backupAudioUrl?: string, template: string, onEnded?: () => void, onAlmostEnded?: () => void, playlistContext?: any, isPreview?: boolean, lyricsColor?: string, waveColor?: string, showDownload?: boolean, title?: string, singer?: string, isReleased?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(!isPreview);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const almostEndedTriggered = useRef(false);
  const [currentSrc, setCurrentSrc] = useState(getAudioPlayUrl(src));
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRepeat, setIsRepeat] = useState(false);

  const [seekState, setSeekState] = useState<{ side: 'left' | 'right'; seconds: number; key: number } | null>(null);
  const seekTimeoutRef = useRef<any>(null);
  const lastTouchTimeRef = useRef<number>(0);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' }>({ time: 0, side: 'left' });

  const handleSeekRelative = useCallback((delta: number) => {
    if (!audioRef.current) return;
    const side: 'left' | 'right' = delta > 0 ? 'right' : 'left';
    const targetTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);

    setSeekState((prev) => {
      if (prev && prev.side === side) {
        return { side, seconds: prev.seconds + Math.abs(delta), key: Date.now() };
      }
      return { side, seconds: Math.abs(delta), key: Date.now() };
    });

    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    seekTimeoutRef.current = setTimeout(() => {
      setSeekState(null);
    }, 750);
  }, []);

  useEffect(() => {
    const handleGlobalSeek = (e: CustomEvent) => {
      if (typeof e.detail?.delta === 'number') {
        handleSeekRelative(e.detail.delta);
      }
    };
    window.addEventListener('crvn-seek-audio', handleGlobalSeek as EventListener);
    return () => {
      window.removeEventListener('crvn-seek-audio', handleGlobalSeek as EventListener);
    };
  }, [handleSeekRelative]);

  const processPlayerTap = (clientX: number, target: HTMLElement, currentTarget: HTMLElement) => {
    if (target.closest('button, input, a, [role="button"]')) return;

    const rect = currentTarget.getBoundingClientRect();
    const relX = clientX - rect.left;
    const side: 'left' | 'right' = relX < rect.width / 2 ? 'left' : 'right';
    const delta = side === 'right' ? 10 : -10;
    const now = Date.now();
    const timeDiff = now - lastTapRef.current.time;

    if (timeDiff >= 40 && timeDiff <= 500 && lastTapRef.current.side === side) {
      handleSeekRelative(delta);
      lastTapRef.current = { time: 0, side };
    } else {
      lastTapRef.current = { time: now, side };
    }
  };

  const handlePlayerTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    lastTouchTimeRef.current = Date.now();
    processPlayerTap(touch.clientX, e.target as HTMLElement, e.currentTarget as HTMLElement);
  };

  const handlePlayerClick = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTimeRef.current < 800) return;
    processPlayerTap(e.clientX, e.target as HTMLElement, e.currentTarget as HTMLElement);
  };

  useEffect(() => {
    if (playlistContext && typeof playlistContext.setIsPlaying === 'function') {
      playlistContext.setIsPlaying(isPlaying);
    }
  }, [isPlaying, playlistContext]);

  useEffect(() => {
    setCurrentSrc(getAudioPlayUrl(src));
    setAudioError(null);
  }, [src]);

  useEffect(() => {
    almostEndedTriggered.current = false;
    if (audioRef.current && !isPreview) {
      stopGlobalPreviewAudio();
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
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        stopGlobalPreviewAudio();
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

  useEffect(() => {
    const handleTogglePlay = () => {
      togglePlay();
    };
    document.addEventListener('toggle-playlist-play', handleTogglePlay);
    return () => {
      document.removeEventListener('toggle-playlist-play', handleTogglePlay);
    };
  }, []);

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

  const isLight = ['1', '4', '6', '7', '9', '17', '20'].includes(template);
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
  if (template === '20') waveColorClass = "bg-[#FF5E7E]";

  const shouldAnimateWave = isPlaying || isPreview;

  return (
    <div 
      className={`flex flex-col w-full gap-2 md:gap-4 relative select-none pb-1 ${isLight ? 'text-stone-900 font-extrabold drop-shadow-sm' : 'text-white font-extrabold drop-shadow-md'}`}
      style={lyricsColor ? { color: lyricsColor } : undefined}
    >
      <AnimatePresence>
        {seekState && (
          <YouTubeSeekOverlay side={seekState.side} seconds={seekState.seconds} />
        )}
      </AnimatePresence>
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
        loop={playlistContext ? playlistContext.repeat === 2 : isRepeat}
      />
      
      {/* Wave visualizer */}
      <div 
        className="flex items-end justify-between h-4 md:h-5 w-full mb-0"
      >
        {waves.map((_, i) => {
          const randDur = 0.5 + Math.random() * 0.8;
          return (
             <div 
              key={`l9131-i-${i}`} 
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
          <div className="flex items-center gap-2.5 sm:gap-3.5">
             <button onClick={() => playlistContext.setShuffle(!playlistContext.shuffle)} className={`opacity-60 hover:opacity-100 ${playlistContext.shuffle ? 'text-blue-400 opacity-100' : ''}`} title="Phát ngẫu nhiên"><Shuffle className="w-4 h-4 md:w-5 md:h-5" /></button>
             <button onClick={playlistContext.handlePrev} className="opacity-80 hover:opacity-100 hover:scale-110 transition" title="Bài trước"><SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" /></button>
             <button 
               onClick={() => handleSeekRelative(-10)} 
               className="opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-current" 
               title="Lùi 10 giây (-10s)"
             >
               <Seek10BackwardIcon className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <button 
               onClick={togglePlay}
               className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center ${isLight ? 'bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] shadow-[0_0_20px_rgba(0,0,0,0.15)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'} rounded-full transition-all outline-none`}
             >
               {isPlaying ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
               )}
             </button>
             <button 
               onClick={() => handleSeekRelative(10)} 
               className="opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-current" 
               title="Tua 10 giây (+10s)"
             >
               <Seek10ForwardIcon className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <button onClick={playlistContext.handleNext} className="opacity-80 hover:opacity-100 hover:scale-110 transition" title="Bài tiếp"><SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" /></button>
             <button onClick={() => playlistContext.setRepeat((playlistContext.repeat + 1) % 3)} className={`opacity-60 hover:opacity-100 ${playlistContext.repeat > 0 ? 'text-blue-400 opacity-100' : ''}`} title="Lặp lại">
               {playlistContext.repeat === 2 ? <Repeat1 className="w-4 h-4 md:w-5 md:h-5" /> : <Repeat className="w-4 h-4 md:w-5 md:h-5" />}
             </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 sm:gap-4">
             <button 
               onClick={() => setIsRepeat(!isRepeat)} 
               className={`opacity-60 hover:opacity-100 transition-all ${isRepeat ? (isLight ? 'text-indigo-600' : 'text-blue-400') + ' opacity-100 scale-110' : ''}`}
               title="Lặp lại bài hát"
             >
               <Repeat className="w-4 h-4 md:w-5 md:h-5" />
             </button>
             <button 
               onClick={() => handleSeekRelative(-10)} 
               className="opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-current" 
               title="Lùi 10 giây (-10s)"
             >
               <Seek10BackwardIcon className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <button 
               onClick={togglePlay}
               className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center ${isLight ? 'bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] shadow-[0_0_20px_rgba(0,0,0,0.15)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'} rounded-full transition-all outline-none`}
             >
               {isPlaying ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
               )}
             </button>
             <button 
               onClick={() => handleSeekRelative(10)} 
               className="opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 transition-all flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 text-current" 
               title="Tua 10 giây (+10s)"
             >
               <Seek10ForwardIcon className="w-5 h-5 md:w-6 md:h-6" />
             </button>
             <div className="w-4 h-4 md:w-5 md:h-5 opacity-0 pointer-events-none"></div>
          </div>
        )}

        <div className="w-20 md:w-24 flex justify-end">
           {showDownload && (
              <a 
                href={src} 
                className={`opacity-60 hover:opacity-100 transition-all ${isLight ? 'hover:text-stone-900' : 'hover:text-white'}`}
                title="Tải Nhạc"
                onClick={(e) => {
                   e.preventDefault();
                   fetch(src)
                     .then(res => res.blob())
                     .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const sStr = singer ? ' - ' + singer : '';
                        const rStr = isReleased ? '' : ' (Demo)';
                        a.download = `${(title || 'song').trim()}${sStr}${rStr}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                     })
                     .catch(() => window.open(src, '_blank'));
                }}
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </a>
           )}
        </div>
      </div>
    </div>
  );
}

function ButterflyEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[30] opacity-60">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={`l9260-i-${i}`} 
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
          key={`l9282-i-${i}`} 
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
            key={`l9317-i-${i}`} 
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
          key={`l9339-i-${i}`} 
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
          key={`l9361-i-${i}`} 
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
          key={`l9381-i-${i}`} 
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
          key={`l9401-i-${i}`} 
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
          key={`l9422-i-${i}`} 
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
          key={`l9443-i-${i}`} 
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
          key={`l9465-i-${i}`} 
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
                  key={`l9568-idx-4-${idx}`}
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
          key={`l9598-idx-5-${idx}`}
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
          key={`l9660-i-${i}`} 
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
          key={`l9693-i-${i}`} 
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
          key={`l9753-i-${i}`}
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
          key={`l9782-i-${i}`} 
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
            key={`l9822-i-${i}`} 
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
              key={`l9967-${wave.id}-${i}`}
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
              key={`l9992-${burst.id}-${i}`}
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


function AutumnLeavesEffect() {
  const leaves = ['🍂', '🍁', '🍃', '🌾'];
  
  // Stains configuration for "loang lổ của cuốn phim cũ"
  const stains = [
    { left: '10%', top: '15%', size: '300px', color: 'rgba(88, 48, 20, 0.45)' },
    { left: '75%', top: '25%', size: '400px', color: 'rgba(67, 35, 17, 0.5)' },
    { left: '30%', top: '65%', size: '350px', color: 'rgba(92, 53, 23, 0.4)' },
    { left: '80%', top: '80%', size: '280px', color: 'rgba(58, 28, 10, 0.55)' },
    { left: '5%', top: '85%', size: '320px', color: 'rgba(75, 38, 15, 0.48)' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Styles injected directly for robust old film styling */}
      <style>{`
        @keyframes old-film-flicker {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          15% { opacity: 0.25; }
          30% { opacity: 0.12; transform: scale(1.002) translate(1px, -1px); }
          45% { opacity: 0.3; }
          60% { opacity: 0.18; transform: scale(0.998) translate(-1px, 1px); }
          75% { opacity: 0.22; }
          90% { opacity: 0.12; }
        }
        @keyframes vertical-film-roll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes old-scratch-x {
          0%, 100% { transform: translateX(0); opacity: 0; }
          4% { transform: translateX(10vw); opacity: 0.15; }
          8% { transform: translateX(45vw); opacity: 0.25; }
          12% { transform: translateX(85vw); opacity: 0; }
          50% { transform: translateX(30vw); opacity: 0.3; }
          55% { transform: translateX(70vw); opacity: 0.1; }
          60% { transform: translateX(20vw); opacity: 0; }
        }
        .animate-old-flicker {
          animation: old-film-flicker 0.18s infinite;
        }
        .animate-film-roll-fast {
          animation: vertical-film-roll 6s linear infinite;
        }
        .animate-scratch-slow {
          animation: old-scratch-x 4s steps(1) infinite;
        }
      `}</style>

      {/* Main retro stained sepia-tint film-base background layer */}
      <div className="absolute inset-0 bg-[#351C0C]/35 mix-blend-color-burn z-[1]" />
      
      {/* Rỉ sét và vết ố thời gian dọc theo viền và góc màn hình bên ngoài (Full viewport borders & corners) */}
      <div className="absolute inset-0 border-[16px] md:border-[24px] border-[#5c2a07]/30 pointer-events-none z-[2] mix-blend-multiply" />
      <div className="absolute top-0 left-0 w-[30vw] h-[30vh] bg-[radial-gradient(circle_at_top_left,rgba(92,42,7,0.85),transparent_75%)] pointer-events-none z-[2] mix-blend-multiply" />
      <div className="absolute top-0 right-0 w-[30vw] h-[30vh] bg-[radial-gradient(circle_at_top_right,rgba(92,42,7,0.85),transparent_75%)] pointer-events-none z-[2] mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-[radial-gradient(circle_at_bottom_left,rgba(92,42,7,0.85),transparent_75%)] pointer-events-none z-[2] mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vh] bg-[radial-gradient(circle_at_bottom_right,rgba(92,42,7,0.85),transparent_75%)] pointer-events-none z-[2] mix-blend-multiply" />
      
      {/* Vết rỉ sét loang lổ ngẫu nhiên ở viền màn hình ngoài */}
      <div className="absolute top-[20%] left-0 w-[15vw] h-[25vh] bg-[radial-gradient(ellipse_at_left,rgba(115,50,8,0.75),transparent_70%)] pointer-events-none z-[2] mix-blend-color-burn" />
      <div className="absolute bottom-[25%] right-0 w-[15vw] h-[30vh] bg-[radial-gradient(ellipse_at_right,rgba(115,50,8,0.75),transparent_70%)] pointer-events-none z-[2] mix-blend-color-burn" />
      <div className="absolute top-0 left-[35%] w-[30vw] h-[15vh] bg-[radial-gradient(ellipse_at_top,rgba(115,50,8,0.7),transparent_70%)] pointer-events-none z-[2] mix-blend-color-burn" />
      <div className="absolute bottom-0 left-[45%] w-[25vw] h-[12vh] bg-[radial-gradient(ellipse_at_bottom,rgba(115,50,8,0.7),transparent_70%)] pointer-events-none z-[2] mix-blend-color-burn" />

      {/* Hiệu ứng nứt nẻ (Cracks/fractures) của thước phim cổ cực kì chân thực trải khắp background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2] opacity-85 mix-blend-color-burn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Crack 1 - Top Left */}
        <path d="M 0 10 L 15 15 L 22 12 L 32 18 L 38 12 M 15 15 L 18 25 M 22 12 L 20 2" stroke="#1A0D03" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Crack 2 - Bottom Right */}
        <path d="M 100 90 L 85 82 L 80 68 L 68 72 L 62 58 M 85 82 L 78 90 M 80 68 L 88 62" stroke="#1A0D03" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Crack 3 - Top Right */}
        <path d="M 100 15 L 88 20 L 85 30 L 72 25 M 88 20 L 92 8" stroke="#1A0D03" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Crack 4 - Bottom Left */}
        <path d="M 0 85 L 10 80 L 12 68 L 25 72 M 10 80 L 8 92" stroke="#1A0D03" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Large Central/Side Fracture Lines for extra drama */}
        <path d="M 5 45 L 18 48 L 24 42 L 35 52 L 40 48 M 18 48 L 16 60 M 24 42 L 28 32" stroke="#1A0D03" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 95 45 L 82 48 L 76 42 L 65 52 L 60 48 M 82 48 L 84 60 M 76 42 L 72 32" stroke="#1A0D03" strokeWidth="0.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      
      {/* Uneven vintage stains (loang lổ) */}
      {stains.map((stain, idx) => (
        <div
          key={`l10104-stain-${idx}`}
          className="absolute rounded-full filter blur-[60px] opacity-70 mix-blend-multiply"
          style={{
            left: stain.left,
            top: stain.top,
            width: stain.size,
            height: stain.size,
            backgroundColor: stain.color,
            transition: 'all 5s ease-in-out',
          }}
        />
      ))}

      {/* Film Projector flickering overlay light */}
      <div className="absolute inset-0 bg-[#E5B582]/12 mix-blend-color-dodge pointer-events-none z-[1] animate-old-flicker" />

      {/* Vintage vertical scratch lines moving horizontally */}
      <div className="absolute top-0 bottom-0 w-[1px] bg-white/20 animate-scratch-slow z-[2]" />
      <div className="absolute top-0 bottom-0 w-[1.5px] bg-amber-950/20 animate-scratch-slow z-[2]" style={{ animationDelay: '1.5s' }} />

      {/* Falling dried leaves */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={`l10127-i-${i}`} 
          className="absolute text-xl sm:text-2xl animate-snow will-change-transform drop-shadow-md mix-blend-overlay z-[3]"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${Math.random() * 100 - 20}%`,
            animationDuration: `${Math.random() * 10 + 15}s`,
            animationDelay: `${Math.random() * -20}s`,
            fontSize: `${Math.random() * 1 + 0.8}rem`
          }}
        >
          {leaves[i % leaves.length]}
        </div>
      ))}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(217,91,22,0.18),transparent_60%)] mix-blend-screen opacity-50 animate-[pulse_6s_ease-in-out_infinite] z-[1]" />
    </div>
  );
}

function PastelShapesEffect() {
  const shapes = ['⭐', '🌟', '☁️', '🍭', '🎵', '🎶', '✨', '💖'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-90 select-none">
      {/* 1. Slow Rotating Dashed Circle (Photo 3 element) */}
      <div className="absolute right-[10%] bottom-[15%] w-64 h-64 opacity-25 animate-[spin_100s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse" style={{ animationDuration: '4s' }}>
          <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="1" strokeDasharray="3 4" fill="none" />
        </svg>
      </div>
      <div className="absolute left-[5%] top-[25%] w-40 h-40 opacity-15 animate-[spin_80s_linear_infinite_reverse]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="1" strokeDasharray="2 3" fill="none" />
        </svg>
      </div>

      {/* 2. Top-Right Thin Elegant Wavy Curve (Photo 3 element) */}
      <div className="absolute right-[-10%] top-[8%] w-[60%] h-32 opacity-25 animate-float-gentle" style={{ animationDuration: '8s' }}>
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M 0 50 Q 100 20 200 50 T 400 50" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* 3. Bottom-Left Pink Soft Wavy Curve (Photo 3 element) */}
      <div className="absolute left-[-5%] bottom-[8%] w-[55%] h-32 opacity-35 animate-float-gentle" style={{ animationDuration: '10s' }}>
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M 0 50 Q 100 80 200 50 T 400 50" stroke="#FF809B" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* 4. Translucent Floating Pastel Triangles */}
      <div 
        className="absolute left-[15%] top-[12%] w-16 h-16 bg-white/10 rounded-lg opacity-30 animate-float-gentle"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(15deg)', animationDuration: '7s' }}
      />
      <div 
        className="absolute right-[25%] bottom-[12%] w-24 h-24 bg-pink-100/10 rounded-lg opacity-25 animate-float-gentle"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(-25deg)', animationDuration: '9s' }}
      />

      {/* 5. Cute Floating Balloons with Strings (Photo 3 element) */}
      <div className="absolute left-[8%] bottom-[20%] w-12 h-24 opacity-30 animate-[float-gentle_6s_ease-in-out_infinite]">
        <svg viewBox="0 0 50 100" className="w-full h-full">
          <ellipse cx="25" cy="30" rx="15" ry="18" fill="white" />
          <path d="M 25 48 Q 20 65 25 85" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <div className="absolute right-[12%] top-[18%] w-10 h-20 opacity-25 animate-[float-gentle_8s_ease-in-out_infinite]" style={{ animationDelay: '-2s' }}>
        <svg viewBox="0 0 50 100" className="w-full h-full">
          <ellipse cx="25" cy="30" rx="15" ry="18" fill="#FF809B" />
          <path d="M 25 48 Q 30 65 25 85" stroke="#FF809B" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* 6. Falling Sparkles, Stars, Sweets, and Hearts */}
      {Array.from({ length: 28 }).map((_, i) => (
        <div 
          key={`l10202-i-${i}`} 
          className="absolute text-xl sm:text-2xl animate-snow will-change-transform drop-shadow-[0_2px_4px_rgba(255,182,193,0.4)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100 - 20}%`,
            animationDuration: `${Math.random() * 8 + 6}s`,
            animationDelay: `${Math.random() * -12}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          {shapes[i % shapes.length]}
        </div>
      ))}
    </div>
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
            key={`l10236-i-${i}`}
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
            <div key={`l10264-i-${i}`} className="bg-[#0a0a0a] border-t border-white/5 mx-[1px]" style={{
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
  const { lang, landingConfig, artistData } = useContext(LanguageContext);
  const t = useMemo(() => {
    const baseDict = translations[lang] || translations['vi'];
    const viDict = translations['vi'];
    const result: Record<string, string> = {};
    Object.keys(viDict).forEach((key) => {
      const originalValue = viDict[key];
      let customTr = artistData?.staticTranslations?.[lang]?.[originalValue];
      if (!customTr) {
        customTr = landingConfig?.staticTranslations?.[lang]?.[originalValue];
      }
      result[key] = customTr || baseDict[key] || originalValue;
    });
    const fn: any = (k: string) => result[k] || k;
    Object.keys(result).forEach(key => {
      fn[key] = result[key];
    });
    return fn;
  }, [lang, landingConfig, artistData]);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<0 | 1 | 2>(0); // 0: off, 1: playlist, 2: one
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState('');
  
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
  const getSongCoverUrl = (songUrlOrObj?: string | any, thumbUrl?: string) => {
    if (typeof songUrlOrObj === 'object' && songUrlOrObj !== null) {
      return songUrlOrObj.thumbUrl || songUrlOrObj.coverUrl || songUrlOrObj.imageUrl || artistData?.aboutMe?.avatarUrl || artistData?.homeCoverUrl || '';
    }
    return thumbUrl || songUrlOrObj || artistData?.aboutMe?.avatarUrl || artistData?.homeCoverUrl || '';
  };


  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data && data.error === 'inactive') {
        const currentExt = getArtistExtensionFromUrl(window.location.pathname);
        const activeExt = localStorage.getItem('activeAdminExtension');
        if (currentExt && activeExt && activeExt === currentExt) {
          window.location.href = getArtistAdminRedirect(currentExt, 'help');
        } else {
          window.location.href = '/';
        }
      }
    }).catch(() => {});
  }, []);

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
      const targetSongId = urlParams.get('song');
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
        let startIdx = 0;
        if (targetSongId && data.songs && data.songs.length > 0) {
          const matchedIdx = data.songs.findIndex((d: any) => String(d.id) === targetSongId || d.slug === targetSongId);
          if (matchedIdx !== -1) {
            startIdx = matchedIdx;
          }
        }
        setCurrentIndex(startIdx);
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
    if (location.state?.fromAdmin) {
      navigate(-1);
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const ext = protectedInfo?.artistExtension || playlist?.artistExtension || (playlist as any)?.extension || getArtistExtensionFromUrl();
      if (ext) {
        navigate(`/${ext}`);
      } else {
        navigate('/');
      }
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
     if (id && currentSong) {
       const searchParams = new URLSearchParams(window.location.search);
       const songSlugOrId = currentSong.slug || currentSong.id;
       if (searchParams.get('song') !== songSlugOrId) {
         const secret = searchParams.get('secret');
         const token = searchParams.get('token');
         let sub = id === 'released' ? `/playlist/released?song=${songSlugOrId}` : `/playlist/${id}?song=${songSlugOrId}`;
         if (secret) sub += `&secret=${encodeURIComponent(secret)}`;
         if (token) sub += `&token=${encodeURIComponent(token)}`;
         window.history.replaceState(null, '', getArtistLink(sub));
       }
     }
  }, [id, currentSong]);

  if (loading) return <LoadingScreen text={t.load} />;
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
          <h2 className="text-xl font-bold text-white text-center mb-2">{t("Playlist được bảo vệ")}</h2>
          {protectedInfo.title && <p className="text-stone-400 text-sm text-center mb-6">{protectedInfo.title}</p>}
          <form onSubmit={verifyPassword} className="space-y-4">
             <div>
                <PasswordInput value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Nhập mật khẩu playlist..." autoFocus className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-center pr-12" />
             </div>
             <button type="submit" disabled={verifying || !password} className="w-full bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-stone-200 transition-colors">
                {verifying ? 'Đang kiểm tra...' : 'Truy cập'}
             </button>
             <p className="text-stone-500 text-xs text-center">{t("Hoặc sử dụng Secret Link nếu có.")}</p>
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
            <DemoPlayer songIdP={currentSong.slug || currentSong.id} playlistId={id} onEnd={handleEnd} onAlmostEnded={handleAlmostEnded} playlistSongs={songs} playlistContext={{ handlePrev, handleNext, shuffle, setShuffle, repeat, setRepeat, isPlaying, setIsPlaying }} />
         </div>
      )}

      {/* Frame on top */}
      <AnimatePresence>
         {!isMinimized && (
            <motion.div key="not-minimized"
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
                         key={`l10613-${song.id || ''}-${i}`} 
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
                         <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (i === currentIndex) {
                                document.dispatchEvent(new CustomEvent('toggle-playlist-play'));
                              } else {
                                setCurrentIndex(i);
                              }
                            }}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden border border-white/5 relative z-10 transition-transform cursor-pointer group/cover"
                            title={i === currentIndex ? (isPlaying ? t("Tạm dừng") : t("Phát nhạc")) : t("Phát bài này")}
                          >
                             {getSongCoverUrl(song.thumbUrl || song.coverUrl) ? (
                               <img src={getSongCoverUrl(song.thumbUrl || song.coverUrl)} className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform" />
                             ) : (
                               <Music className="w-4 h-4 m-3 sm:m-3.5 text-neutral-500" />
                             )}

                             {/* Audio Spectrum when active and playing */}
                             {i === currentIndex && isPlaying && (
                               <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-[2.5px] z-10 group-hover/cover:opacity-0 transition-opacity">
                                 <div className="w-[3px] h-3 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_0ms]" />
                                 <div className="w-[3px] h-4 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_150ms]" />
                                 <div className="w-[3px] h-2 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
                                 <div className="w-[3px] h-3.5 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_450ms]" />
                               </div>
                             )}

                             {/* Hover Play/Pause Overlay */}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center z-20 transition-opacity">
                               {i === currentIndex && isPlaying ? (
                                 <Pause className="w-4 h-4 text-white fill-white" />
                               ) : (
                                 <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                               )}
                             </div>
                          </div>
                         <div className={`flex-1 min-w-0 flex flex-col justify-center relative z-10 ${song.achievements?.length ? 'pr-2' : 'pr-4'}`}>
                            <MarqueeText className={`font-bold transition-colors w-full ${i === currentIndex ? 'text-purple-400' : (song.achievements?.length ? 'text-amber-100 hover:text-amber-300' : 'text-white')} ${song.achievements?.length ? 'text-[10px] sm:text-[11px]' : 'text-xs sm:text-sm'}`}>
                               <HoverTranslate text={song.title} format={true} />
                             </MarqueeText>
                            <MarqueeText className={`text-neutral-400 mt-0.5 ${song.achievements?.length ? 'text-[8.5px] sm:text-[9px] leading-tight opacity-90' : 'text-xs'} w-full`}>{formatText(song.singer || song.composer || 'Đang cập nhật', true, false)}</MarqueeText>
                         </div>
                         
                         {song.achievements && song.achievements.length > 0 && (
                            <div className="relative z-10 shrink-0 w-[100px] sm:w-[130px] pr-2 transform scale-[0.8] sm:scale-100 origin-right">
                               <AchievementCycle achievements={song.achievements} />
                            </div>
                         )}

                         {song.requiresPassword && !song.achievements?.length && (
                           <Lock className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 relative z-10 mr-0.5" title={t("Bài hát được bảo vệ")} />
                         )}
                         <button
                           type="button"
                           onClick={async (e) => {
                             e.stopPropagation();
                             const songSlugOrId = song.slug || song.id;
                             let shareUrl = getArtistFullUrl(`/playlist/${id}?song=${songSlugOrId}`);
                             const searchParams = new URLSearchParams(window.location.search);
                             const secret = searchParams.get('secret');
                             const token = searchParams.get('token');
                             if (secret) shareUrl += `&secret=${encodeURIComponent(secret)}`;
                             if (token) shareUrl += `&token=${encodeURIComponent(token)}`;
                             await copyToClipboard(shareUrl);
                             setToast(t("Đã copy link playlist bài hát!"));
                             setTimeout(() => setToast(''), 3000);
                           }}
                           className="opacity-70 hover:opacity-100 p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex-shrink-0 relative z-10 transition-all active:scale-90 cursor-pointer"
                           title={t("Sao chép link bài hát này trong playlist")}
                         >
                           <Share2 className="w-3.5 h-3.5" />
                         </button>
                      </button>
                   ))}
                 </div>
              </div>
            </motion.div>
         )}
      </AnimatePresence>

      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl text-sm animate-bounce flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}
    <AnimatePresence>
         {isMinimized && (
            <motion.div key="minimized"
               initial={{ opacity: 0, scale: 0.5, y: -20, x: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
               exit={{ opacity: 0, scale: 0.5, y: -20, x: 20 }}
               transition={{ duration: 0.2 }}
               className={`absolute top-6 right-6 z-[100] transition-transform duration-500 ease-in-out ${isPlaying ? 'translate-x-[150%] md:translate-x-0' : 'translate-x-0'}`}
            >
               <button 
                  onClick={(e) => {
                     e.stopPropagation();
                     setIsMinimized(false);
                     resetTimer();
                  }}
                  className="w-14 h-14 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:bg-black/90 transition-all group relative animate-heartbeat"
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

function formatBriefText(text: string | null | undefined) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`l10687-idx-6-${idx}`} className="h-2" />;
    }
    
    // Check if line matches a list with bullet (- or * or + or •)
    const bulletMatch = line.match(/^(\s*)([-*•+])\s+(.*)$/);
    if (bulletMatch) {
      const leadingSpaces = bulletMatch[1];
      const content = bulletMatch[3];
      const indentClass = leadingSpaces.length > 0 ? "pl-8" : "pl-4";
      return (
        <div key={`l10697-idx-7-${idx}`} className={`flex items-start gap-2 ${indentClass} py-0.5 leading-relaxed text-left`}>
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
          <div key={`l10714-idx-8-${idx}`} className={`flex items-start gap-2 ${indentClass} py-0.5 leading-relaxed text-left`}>
            <span className="text-indigo-400 font-bold font-mono select-none shrink-0">{num}{separator || '.'}</span>
            <span className="text-left">{content}</span>
          </div>
        );
      }
    }

    // Fallback regular line
    return (
      <p key={`l10724-idx-9-${idx}`} className="leading-relaxed py-0.5 text-left">
        {line}
      </p>
    );
  });
}

export function DemoPlayer({ songIdP, playlistId, playlistSongs, setNextSong, onEnd, onAlmostEnded, playlistContext, previewConfig, previewData }: any = {}) {
  const { lang, landingConfig, artistData } = useContext(LanguageContext);
  const t = useMemo(() => {
    const baseDict = translations[lang] || translations['vi'];
    const viDict = translations['vi'];
    const result: Record<string, string> = {};
    Object.keys(viDict).forEach((key) => {
      const originalValue = viDict[key];
      let customTr = artistData?.staticTranslations?.[lang]?.[originalValue];
      if (!customTr) {
        customTr = landingConfig?.staticTranslations?.[lang]?.[originalValue];
      }
      result[key] = customTr || baseDict[key] || originalValue;
    });
    const fn: any = (k: string) => result[k] || k;
    Object.keys(result).forEach(key => {
      fn[key] = result[key];
    });
    return fn;
  }, [lang, landingConfig, artistData]);
  const paramsId = useParams().id;
  const id = songIdP || paramsId;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('secret');
  const { activeExt, activeToken } = getActiveAdminSession();
  const [demo, setDemo] = useState<DemoSong | null>(null);
  const pageArtistExt = (getArtistExtensionFromUrl() || (demo as any)?.artistExtension || (demo as any)?.extension || '').toLowerCase().trim();
  const isAdmin = !!getAdminToken() && (
    !pageArtistExt || 
    !activeExt || 
    activeExt.toLowerCase().trim() === pageArtistExt
  );

  const songArtistExt = (
    (demo as any)?.artistExtension || 
    (demo as any)?.extension || 
    (demo as any)?.artist_extension || 
    (demo as any)?.artistId || 
    pageArtistExt || 
    ''
  ).toLowerCase().trim();

  const isArtistOwner = !!activeToken && !!activeExt && !!songArtistExt && (
    activeExt.toLowerCase().trim() === songArtistExt
  );
  const memberTokenForArtist = songArtistExt ? getMemberToken(songArtistExt) : null;
  const isOwnerMember = !!memberTokenForArtist && !!songArtistExt && (
    !activeExt || activeExt.toLowerCase().trim() === songArtistExt
  );
  const canDownloadSong = isArtistOwner || isOwnerMember;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const isGoldTheme = previewData?.adminTheme === 'gold';

  // Drag-to-scroll for mobile preview on PC
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTopPos, setScrollTopPos] = useState(0);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTopPos(scrollRef.current.scrollTop);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    scrollRef.current.scrollTop = scrollTopPos - walk;
  };
  
  // Report Popup State inside DemoPlayer
  const [reportSong, setReportSong] = useState<any | null>(null);
  const [reportType, setReportType] = useState<'remove' | 'edit'>('edit');
  const [reportDesc, setReportDesc] = useState('');

  const handleCreateReport = async () => {
    if (!reportSong || !reportDesc) return;
    const activeExt = localStorage.getItem('activeAdminExtension');
    const activeToken = activeExt ? localStorage.getItem(`adminToken_${activeExt}`) : null;
    try {
      const res = await fetch('/api/admin/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-artist-extension': activeExt || '',
          'Authorization': `Bearer ${activeToken || ''}`
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
        setToast(t("Đã gửi báo cáo thành công!"));
        setReportSong(null);
        setReportDesc('');
        setTimeout(() => setToast(''), 3000);
      } else {
        const err = await res.json();
        setToast(`Lỗi: ${err.error || t("Gửi báo cáo thất bại")}`);
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      setToast(t("Lỗi kết nối máy chủ!"));
      setTimeout(() => setToast(''), 3000);
    }
  };
  const [displayCoverUrl, setDisplayCoverUrl] = useState<string>('');
  const [triedRelative, setTriedRelative] = useState(false);
  const [triedAbsolute, setTriedAbsolute] = useState(false);
  const [triedRandom, setTriedRandom] = useState(false);
  const [systemArtists, setSystemArtists] = useState<any[]>([]);
  const [showBrandBrief, setShowBrandBrief] = useState(false);
  const [showBrandVideos, setShowBrandVideos] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const brandColors = useBrandColors(demo?.isBrand ? demo.brandLogoUrl : undefined, (demo as any)?.brandColor);

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

  useEffect(() => {
    if (previewConfig || window.location.pathname.includes('/help')) return;
    fetch('/api/data').then(res => res.json()).then(data => {
      if (data && data.error === 'inactive') {
        const currentExt = getArtistExtensionFromUrl(window.location.pathname);
        const activeExt = localStorage.getItem('activeAdminExtension');
        if (currentExt && activeExt && activeExt === currentExt) {
          window.location.href = getArtistAdminRedirect(currentExt, 'help');
        } else {
          window.location.href = '/';
        }
      }
    }).catch(() => {});
  }, [previewConfig]);

  // Initialize displayCoverUrl whenever song or previewConfig updates
  useEffect(() => {
    const primaryUrl = demo?.coverUrl || demo?.globalCoverUrl || (previewConfig && previewConfig.coverUrl) || artistData?.aboutMe?.avatarUrl || artistData?.homeCoverUrl || '';
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
    let lyricsToProcess = rawLyrics;
    const hasAnnotation = /^\[?\s*(pre-?chorus|chorus(?:\s*\d+)?|vers?e?(?:\s*\d+)?|bridge|drop|ending|coda|intro|outro|rap|dk|đk|pk)\s*\]?[:]*$/im.test(lyricsToProcess) || /\[.*?\]/.test(lyricsToProcess);
    if (!hasAnnotation) {
      lyricsToProcess = `[Verse]\n${lyricsToProcess}`;
    }
    const lines = lyricsToProcess.split(/\r?\n/);
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
      } else if (/^\[?\s*vers?\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*vers?\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[1] ? `Verse ${match[1]}` : "Verse";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^rap[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^rap[:]*\s*/i, "Rap");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      }

      const isAnn = /^\[?\s*(pre-?chorus|chorus(?:\s*\d+)?|vers?e?(?:\s*\d+)?|bridge|drop|ending|coda|intro|outro|rap|dk|đk|pk)\s*\]?[:]*$/i.test(lower);
      if (isAnn) {
        let annotation = trimmed;
        if (lower.includes("pre")) annotation = "Pre-Chorus";
        else if (lower.includes("chorus")) annotation = "Chorus";
        else if (lower.includes("vers")) {
          const match = trimmed.match(/vers(?:e)?\s*(\d+)?/i);
          annotation = match?.[1] ? `Verse ${match[1]}` : "Verse";
        } else if (lower.includes("bridge")) annotation = "Bridge";
        else if (lower.includes("drop")) annotation = "Drop";
        else if (lower.includes("ending")) annotation = "Ending";
        else if (lower.includes("coda")) annotation = "Coda";
        else if (lower.includes("rap")) annotation = "Rap";
        else if (lower.includes("intro")) annotation = "Intro";
        else if (lower.includes("outro")) annotation = "Outro";
        
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
    let lyricsToProcess = rawLyrics;
    const hasAnnotation = /^\[?\s*(pre-?chorus|chorus(?:\s*\d+)?|vers?e?(?:\s*\d+)?|bridge|drop|ending|coda|intro|outro|rap|dk|đk|pk)\s*\]?[:]*$/im.test(lyricsToProcess) || /\[.*?\]/.test(lyricsToProcess);
    if (!hasAnnotation) {
      lyricsToProcess = `[Verse]\n${lyricsToProcess}`;
    }
    const lines = lyricsToProcess.split(/\r?\n/);
    
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
      } else if (/^\[?\s*vers?\s*(\d+)?\s*\]?[:]*\s*$/i.test(lower)) {
        const match = trimmed.match(/^\[?\s*vers?\s*(\d+)?\s*\]?[:]*\s*$/i);
        textLine = match?.[1] ? `Verse ${match[1]}` : "Verse";
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      } else if (/^rap[:]*\s*$/i.test(lower)) {
        textLine = trimmed.replace(/^rap[:]*\s*/i, "Rap");
        trimmed = textLine.trim();
        lower = trimmed.toLowerCase();
      }
      const isAnn = /^\[?\s*(pre-?chorus|chorus(?:\s*\d+)?|vers?e?(?:\s*\d+)?|bridge|drop|ending|coda|intro|outro|rap|dk|đk|pk)\s*\]?[:]*$/i.test(lower);
                    
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
        {cleanedLines.map(({ text, origIdx }, arrIdx) => {
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
          } else if (lower.includes("vers")) {
            const match = trimmed.match(/vers(?:e)?\s*(\d+)?/i);
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
              ? "bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold" 
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
          } else if (lower.includes("intro")) {
            annotation = "Intro";
            badgeClass = isLight 
               ? "bg-slate-50 text-slate-900 border border-slate-300 font-bold" 
               : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("outro")) {
            annotation = "Outro";
            badgeClass = isLight 
               ? "bg-stone-50 text-stone-900 border border-stone-300 font-bold" 
               : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          } else if (lower.includes("rap")) {
            annotation = "Rap";
            badgeClass = isLight 
              ? "bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-300 font-bold" 
              : "bg-white/10 text-white border border-white/65 font-black backdrop-blur-sm shadow-sm";
          }
          
          if (annotation) {
            return (
              <div key={`l11123-lyr-${origIdx}-1-${arrIdx}`} className="flex items-center my-6 select-none animate-fade-in">
                <span className={`text-[10px] md:text-sm font-black tracking-widest uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                  {annotation}
                </span>
                
                <div className={`flex-1 border-t border-dashed ${isLight ? 'border-neutral-400/20' : 'border-neutral-500/25'} ml-3 opacity-30`} />
              </div>
            );
          }
          
          if (trimmed === "") {
            return <div key={`l11134-lyr-${origIdx}-2-${arrIdx}`} className="h-4" />;
          }
          
          return (
            <div 
              key={`l11139-lyr-${origIdx}-3-${arrIdx}`} 
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

  const previewDataStr = previewData ? JSON.stringify(previewData) : '';
  const playlistSongsStr = playlistSongs ? JSON.stringify(playlistSongs.map((s: any) => s.id)) : '';

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
  }, [id, isAdmin, playlistSongsStr, previewDataStr, playlistId]);

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
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const ext = (demo as any)?.artistExtension || (demo as any)?.extension || (demo as any)?.artist_extension || (demo as any)?.artistId || getArtistExtensionFromUrl();
      if (ext) {
        navigate(`/${ext}`);
      } else {
        navigate('/');
      }
    }
  };

  const demoLastTouchTimeRef = useRef<number>(0);
  const demoLastTapRef = useRef<{ time: number; side: 'left' | 'right' }>({ time: 0, side: 'left' });
  const [demoSeekState, setDemoSeekState] = useState<{ side: 'left' | 'right'; seconds: number; key: number } | null>(null);
  const demoSeekTimeoutRef = useRef<any>(null);

  const processDemoTap = (clientX: number, target: HTMLElement) => {
    if (target.closest('button, a, [role="button"], input, label, select, textarea, iframe')) return;

    const screenWidth = window.innerWidth || document.documentElement.clientWidth || 360;
    const isLeftSide = clientX < screenWidth / 2;
    const side: 'left' | 'right' = isLeftSide ? 'left' : 'right';
    const delta = side === 'right' ? 10 : -10;
    const now = Date.now();
    const timeDiff = now - demoLastTapRef.current.time;

    if (timeDiff >= 40 && timeDiff <= 500 && demoLastTapRef.current.side === side) {
      window.dispatchEvent(new CustomEvent('crvn-seek-audio', { detail: { delta } }));
      
      setDemoSeekState((prev) => {
        if (prev && prev.side === side) {
          return { side, seconds: prev.seconds + 10, key: Date.now() };
        }
        return { side, seconds: 10, key: Date.now() };
      });

      if (demoSeekTimeoutRef.current) clearTimeout(demoSeekTimeoutRef.current);
      demoSeekTimeoutRef.current = setTimeout(() => {
        setDemoSeekState(null);
      }, 750);

      demoLastTapRef.current = { time: 0, side };
    } else {
      demoLastTapRef.current = { time: now, side };
    }
  };

  const handleDemoTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    demoLastTouchTimeRef.current = Date.now();
    processDemoTap(touch.clientX, e.target as HTMLElement);
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    if (Date.now() - demoLastTouchTimeRef.current < 800) return;
    processDemoTap(e.clientX, e.target as HTMLElement);
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

  if (loading) return <LoadingScreen text={t.load} />;
  if (!demo) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t.noDemoFound || "Không tìm thấy demo"}</div>;

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

  const currentActiveAdminExt = localStorage.getItem('activeAdminExtension');
  const isOtherArtistSong = currentActiveAdminExt && songArtistExt && currentActiveAdminExt !== songArtistExt;

  if (demo?.linkType === 'indirect') {
    return <IndirectBioCard demo={{...demo, coverUrl: finalDisplayCover}} isStandalone={true} lang={lang} canDownload={canDownloadSong} />;
  }

  // Templates
  const templateType = (previewConfig && previewConfig.id) ? previewConfig.id : (demo.template || '1');
  const customConfig = previewConfig || demo.templateConfigs?.find((c: any) => c.id === templateType);
  const isPreview = !!previewConfig;
  const forceMobile = isPreview && !previewConfig.isPCPreviewMode;
  const forcePC = isPreview && previewConfig.isPCPreviewMode;
  const isLight = templateType === '1' || templateType === '4' || templateType === '6' || templateType === '7' || templateType === '9' || templateType === '17' || templateType === '20';
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
  } else if (templateType === '19') {
    themeClasses = "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C4827] via-[#432311] to-[#1F0E05] text-[#E5B582] font-sans";
    accentClass = "bg-[#D95B16] hover:bg-[#C24E11] text-white rounded-full font-bold shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase tracking-wider";
  } else if (templateType === '20') {
    themeClasses = "bg-gradient-to-br from-[#FAD2A8] via-[#F9A8D4] to-[#C4DAFA] text-[#1A0F1A] font-sans";
    accentClass = "bg-[#FF9B00] hover:bg-[#E88C00] text-white rounded-full font-bold shadow-[0_4px_10px_rgba(255,155,0,0.4)] uppercase tracking-wider";
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
        {templateType === '19' && <AutumnLeavesEffect />}
        {templateType === '20' && <PastelShapesEffect />}
        
        {pageBgUrl && templateType !== '9' && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-md scale-105 pointer-events-none z-0"
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
          {demo.isBrand && demo.brandName && (() => {
            const badgeStyle = getBrandBadgeStyle(brandColors.primary, isGoldTheme);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`my-3 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl border shadow-md w-fit mx-auto ${demo.brandBrief ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                style={{
                  borderColor: badgeStyle.borderColor,
                  backgroundColor: badgeStyle.backgroundColor,
                  boxShadow: badgeStyle.boxShadow
                }}
                onClick={() => demo.brandBrief ? setShowBrandBrief(true) : undefined}
                title={demo.brandBrief ? "Bấm để xem Brief Khách hàng" : undefined}
              >
                {demo.brandLogoUrl && (
                  <img 
                    src={demo.brandLogoUrl} 
                    className="h-3.5 sm:h-4 max-h-4 w-auto object-contain rounded shrink-0 filter contrast-125 saturate-110" 
                    alt={demo.brandName || ''} 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1">
                  <span style={{ color: badgeStyle.labelColor }}>{t.pPartner || "Đối tác:"}</span>
                  <span style={{ color: badgeStyle.valueColor }}>{demo.brandName}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5" style={{ backgroundColor: badgeStyle.dotColor }}></span>
              </motion.div>
            );
          })()}
          <p className="text-sm font-medium text-center mb-6 opacity-80">
             {renderArtistNameWithLinks(demo.singer || demo.author || (demo as any)?.defaultArtistName || (t.nArtist || 'Nghệ sĩ'), systemArtists)}
             <span className="block text-xs mt-1 opacity-70">{t.sAuth || 'Sáng tác:'} {renderArtistNameWithLinks(demo.composer || (demo as any)?.defaultArtistName || (t.nArtist || 'Nghệ sĩ'), systemArtists)}</span>
          </p>
          
          <p className="text-center mb-6 text-sm font-semibold opacity-70">
             {t.pPrompt2}
             {playlistSongs && <span className="block mt-2 italic text-xs">{t.pAutoNext || "Sẽ tự động chuyển bài nếu không nhập mật khẩu"}</span>}
          </p>
          
          <form onSubmit={handleUnlock} onClick={(e) => e.stopPropagation()} className="space-y-4">
            <PasswordInput 
              placeholder="***" 
              value={password}
              onFocus={() => { pwdTouchedRef.current = true; }}
              onChange={(e: any) => {
                setPassword(e.target.value);
                pwdTouchedRef.current = true;
              }}
              className={`w-full ${isLight ? 'bg-white/60 focus:bg-white text-stone-900 placeholder:text-stone-400' : 'bg-black/40 focus:bg-black/60 text-white placeholder:text-stone-500'} border-none px-4 py-3.5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-center tracking-widest font-mono text-lg shadow-inner`}
            />
            {error && <p className="text-red-500 text-sm text-center font-bold drop-shadow-sm">{error}</p>}
            <button type="submit" className={`w-full ${isLight ? 'bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] hover:bg-stone-800' : 'bg-white text-black hover:bg-stone-200'} font-bold py-3.5 rounded-xl transition-colors shadow-lg`}>
              {t.unlock}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      onMouseDown={forceMobile ? handleMouseDown : undefined}
      onMouseLeave={forceMobile ? handleMouseLeave : undefined}
      onMouseUp={forceMobile ? handleMouseUp : undefined}
      onMouseMove={forceMobile ? handleMouseMove : undefined}
      onTouchEnd={handleDemoTouchEnd}
      onClick={handleDemoClick}
      className={`min-h-[100dvh] min-w-full px-4 py-8 ${themeClasses} transition-colors duration-1000 relative touch-manipulation ${forceMobile ? 'overflow-y-auto overflow-x-hidden no-scrollbar select-none' : ''}`}
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
      {templateType === '19' && <AutumnLeavesEffect />}
      {templateType === '20' && <PastelShapesEffect />}
      
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

          <div className={`fixed top-6 left-6 flex items-center gap-3 z-[300] ${isLight ? 'text-stone-900' : 'text-white'} ${templateType === '20' ? 'hidden' : ''}`}>
            <button onClick={handleBack} className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current" title={t.back}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={async () => {
                if (!demo) return;
                const baseUrl = '/song/';
                const dynamicId = demo.slug || demo.id;
                let url = getArtistFullUrl(baseUrl + dynamicId);
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
            {isOtherArtistSong && (
              <button
                onClick={() => {
                  const matchedArtist = systemArtists.find(a => a.extension === (demo?.artistExtension || getArtistExtensionFromUrl()));
                  setReportSong({
                    id: demo.id,
                    title: demo.title,
                    sourceArtist: {
                      username: demo.artistExtension || getArtistExtensionFromUrl() || '',
                      name: matchedArtist?.artistName || matchedArtist?.name || demo.singer || demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ'
                    }
                  });
                }}
                className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current"
                title={t("Báo cáo & Yêu cầu bài hát")}
              >
                <AlertTriangle className="w-4.5 h-4.5 text-red-500 animate-[pulse_2s_infinite]" />
              </button>
            )}
            {isAdmin && demo?.secretKey && (demo?.password || demo?.hasPassword) && (
              <button
                onClick={async () => {
                  if (!demo) return;
                  const baseUrl = '/song/';
                  const dynamicId = demo.slug || demo.id;
                  let url = getArtistFullUrl(baseUrl + dynamicId);
                  url = formatShareUrl(url);
                  url += `?secret=${demo.secretKey}`;
                  await copyToClipboard(url);
                  setToast('Đã copy Secret Link!');
                  setTimeout(() => setToast(''), 3000);
                }}
                className="opacity-60 hover:opacity-100 p-2 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-current"
                title="Copy Secret Link"
              >
                <Unlock className="w-4.5 h-4.5" />
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
            <div 
              className={`relative ${
              templateType === '12' ? 'w-full max-w-[280px] md:max-w-[340px]' : 
              templateType === '19' ? 'w-full max-w-[260px] md:max-w-[320px]' :
              templateType === '20' ? 'w-full max-w-[280px] md:max-w-[340px]' :
              'w-full max-w-[260px] md:max-w-[320px]'
            } ${
              templateType === '19' ? 'aspect-[4/5]' :
              templateType === '20' ? 'aspect-[4/3]' : 'aspect-square'
            } mb-4 mt-2 md:mt-0 z-10 mx-auto overflow-visible select-none`}
            >
              {demo.achievements && demo.achievements.length > 0 && (
                <motion.div 
                  animate={{ 
                    y: [0, -5, 1, -4, 0],
                    rotate: [0, 1.5, -1.5, 1, 0],
                    scale: [0.96, 1.02, 0.94, 1.02, 0.96]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-2 left-2 -translate-x-[12%] translate-y-[12%] z-50 transform scale-[0.82] md:scale-95 origin-center pointer-events-none"
                >
                  <div className="relative overflow-hidden pl-2.5 pr-4.5 md:pl-3 md:pr-5 py-1.5 bg-gradient-to-r from-[#2F1A0F]/95 via-[#1E110A]/95 to-[#3D2214]/95 border-2 border-[#D4AF37] rounded-2xl shadow-[0_10px_28px_rgba(0,0,0,0.65),0_0_15px_rgba(212,175,55,0.35),inset_0_1px_2px_rgba(255,255,255,0.25)] flex items-center justify-start w-fit min-w-[140px] sm:min-w-[165px] h-[48px] sm:h-[56px]">
                    {/* Glowing golden pulse backdrop */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.25),transparent_75%)] animate-pulse" />
                    {/* Golden shine loop sweep */}
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent skew-x-12 pointer-events-none"
                    />
                    <div className="relative z-10 w-full h-full flex items-center">
                      <AchievementCycle achievements={demo.achievements} align="left" />
                    </div>
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
                    
                    {/* Spindle hole & metallic center rim with dead-center 3D cut-out "thủng" effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-stone-300 via-stone-700 to-stone-900 p-[1.5px] z-20 shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#080808] border border-stone-950 shadow-[inset_0_2px_4px_rgba(0,0,0,1)] flex items-center justify-center">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,1)] border border-stone-900/80" />
                      </div>
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
                  ['9', '16', '19', '20'].includes(templateType) ? 'overflow-visible' : 'overflow-hidden'
                } ${
                  templateType === '1' ? 'shadow-glow-1 animate-[bounce_6s_infinite] rounded-3xl border-4' :
                  templateType === '2' ? 'shadow-glow-2 scale-105 rounded-3xl border-4' :
                  templateType === '3' ? 'shadow-2xl animate-sway rounded-lg border-[12px] opacity-90' :
                  templateType === '4' ? 'shadow-[0_20px_45px_rgba(16,185,129,0.25)] rounded-[2rem] border-[6px] border-emerald-500 hover:rotate-1 transition-transform duration-500 bg-emerald-50' : 
                  templateType === '5' ? 'shadow-xl rounded-full border-4 animate-[bounce_2s_infinite] shadow-red-900/50' : 
                  templateType === '6' ? 'shadow-[12px_12px_0_rgba(244,114,182,0.3)] rounded-l-sm rounded-r-3xl border-l-[20px] border-l-pink-400 border-pink-200 rotate-2 hover:rotate-0 transition-transform bg-white' :
                  templateType === '7' ? 'shadow-[8px_8px_0px_rgba(0,0,0,0.8)] rounded-xl border-4 border-stone-800 rotate-2 hover:rotate-0 transition-transform' : 
                  templateType === '8' ? 'shadow-[0_0_40px_rgba(250,204,21,0.6)] rounded-full border-4 border-yellow-400' :
                  templateType === '9' ? 'shadow-xl shadow-sky-300 rounded-[2rem] border-4 border-white/80 animate-[bounce_4s_infinite]' : 
                  templateType === '10' ? 'shadow-[8px_8px_0_rgba(234,179,8,1)] border-[4px] border-black rounded-sm skew-x-[-2deg] scale-[1.02] bg-zinc-900' : 
                  templateType === '11' ? 'shadow-[0_0_30px_rgba(212,175,55,0.2)] rounded-2xl border-2 border-stone-800' :
                  templateType === '13' ? 'shadow-[0_0_40px_rgba(244,63,94,0.3)] bg-black/40 border border-[#f43f5e]/20 rounded-[2.5rem] transition-transform duration-500' : 
                  templateType === '14' ? 'shadow-[0_0_50px_rgba(14,165,233,0.35)] bg-gradient-to-b from-[#134074] to-[#0B2545] border-4 border-sky-400/50 rounded-[2rem] hover:scale-102 transition-transform duration-500' : 
                  templateType === '15' ? 'border-[6px] border-[#ec4899] rounded-none shadow-[6px_6px_0_#10b981] bg-black transition-transform duration-300' : 
                  templateType === '16' ? 'rounded-none overflow-visible transition-transform duration-500 max-w-[280px] md:max-w-[340px]' : 
                  templateType === '17' ? 'shadow-[0_0_50px_rgba(250,204,21,0.5)] border-[8px] border-white rounded-3xl rotate-2 hover:rotate-0 transition-transform duration-500' : 
                  templateType === '18' ? 'shadow-[0_0_60px_rgba(251,191,36,0.3)] border-2 border-amber-500/50 rounded-full transition-transform duration-500' :
                  ['19', '20'].includes(templateType) ? 'shadow-none border-0 bg-transparent rounded-none' : 'shadow-2xl rounded-3xl border-4'
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
                  ) : templateType === '19' ? (
                    <div className="relative w-full aspect-[4/5] bg-[#E2DCD2] p-4 flex flex-col justify-center items-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden border border-[#D1C6B7]">
                      {/* Falling Vintage Dust and Dried Leaves Inside Card */}
                      <div className="absolute inset-0 pointer-events-none z-30">
                        {Array.from({ length: 8 }).map((_, i) => {
                          const dustChars = ['🍂', '🍁', '✨', '•', '·', '🍂'];
                          return (
                            <div 
                              key={`l11872-dust-${i}`} 
                              className="absolute text-amber-800/40 animate-dust-fall select-none"
                              style={{
                                left: `${15 + Math.random() * 70}%`,
                                top: `-${10 + Math.random() * 15}%`,
                                fontSize: `${Math.random() * 0.8 + 0.4}rem`,
                                animationDuration: `${Math.random() * 4 + 4}s`,
                                animationDelay: `${Math.random() * -5}s`,
                              }}
                            >
                              {dustChars[i % dustChars.length]}
                            </div>
                          );
                        })}
                      </div>

                      {/* Film center projection screen with film-strip borders */}
                      <div className="w-[85%] aspect-square flex items-center justify-center bg-black relative z-20 rounded-lg overflow-hidden shadow-2xl border-4 border-stone-800">
                        <div className="relative w-full h-full bg-[#1F0E05] overflow-hidden group px-[12%] flex items-center justify-center">
                           {/* Left Film Sprocket Strip inside the photo frame */}
                           <div className="absolute top-0 bottom-0 left-0 w-[12%] bg-[#151515] border-r border-[#2c2c2c] z-20 flex flex-col justify-around py-1.5 shadow-lg select-none">
                             {Array.from({length: 6}).map((_, i) => (
                               <div key={`l11894-sprocket-l-${i}`} className="w-[45%] aspect-square bg-[#E2DCD2]/20 mx-auto rounded-[1.5px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.9)]"></div>
                             ))}
                             <div className="absolute top-[25%] left-1/2 -translate-x-1/2 text-white/10 text-[6px] font-mono tracking-widest font-black select-none pointer-events-none rotate-90 scale-90">KODAK</div>
                           </div>

                           {/* Right Film Sprocket Strip inside the photo frame */}
                           <div className="absolute top-0 bottom-0 right-0 w-[12%] bg-[#151515] border-l border-[#2c2c2c] z-20 flex flex-col justify-around py-1.5 shadow-lg select-none">
                             {Array.from({length: 6}).map((_, i) => (
                               <div key={`l11902-sprocket-r-${i}`} className="w-[45%] aspect-square bg-[#E2DCD2]/20 mx-auto rounded-[1.5px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.9)]"></div>
                             ))}
                             <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-white/10 text-[6px] font-mono tracking-widest font-black select-none pointer-events-none rotate-90 scale-90">500T</div>
                           </div>

                           {/* Main centered Cover Image */}
                           <div className="w-full h-full relative z-10 overflow-hidden">
                             {displayCoverUrl ? (
                                <img src={displayCoverUrl} alt="Cover" className="w-full h-full object-cover sepia-[0.35] brightness-90 contrast-[1.05] animate-film-pan-zoom" />
                             ) : (
                                <div className="w-full h-full flex flex-col justify-center items-center">
                                  <Music className="w-12 h-12 text-[#E5B582] opacity-80 animate-pulse" />
                                </div>
                             )}
                           </div>
                           
                           {/* Vintage Lens Flicker Overlay */}
                           <div className="absolute inset-0 bg-white/5 pointer-events-none mix-blend-color-dodge animate-crt-flicker z-15"></div>
                           {/* Retro scratch lines */}
                           <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[linear-gradient(90deg,transparent_49%,#fff_50%,transparent_51%)] bg-[length:200px_100%] animate-[marquee_2s_linear_infinite] z-15"></div>
                           <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/40 via-transparent to-orange-800/20 mix-blend-multiply pointer-events-none z-15"></div>
                        </div>
                      </div>

                      {/* Card Caption / Subtle branding */}
                      <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.3em] text-stone-600/80 font-bold select-none relative z-20 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-600 animate-ping"></span>
                        Nostalgia Player
                      </div>
                    </div>
                  ) : templateType === '20' ? (
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#FFA9BD] to-[#FF809B] rounded-[2.5rem] p-5 border-[8px] border-[#FFF0F4] shadow-[0_15px_35px_rgba(216,67,107,0.4),_inset_0_-12px_24px_rgba(180,30,70,0.3),_inset_0_4px_12px_rgba(255,255,255,0.6)] flex items-center justify-between overflow-visible relative animate-tv-sway">
                      
                      {/* TV Antenna (3D-like, animated wiggling metal rods with cute glowing balls) */}
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none z-0">
                         {/* Left Rod */}
                         <div className="absolute bottom-0 left-[45%] w-1.5 h-16 bg-gradient-to-t from-gray-400 to-gray-200 origin-bottom animate-wiggle-antenna-l rounded-full shadow-sm">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse"></div>
                         </div>
                         {/* Right Rod */}
                         <div className="absolute bottom-0 left-[55%] w-1.5 h-20 bg-gradient-to-t from-gray-400 to-gray-200 origin-bottom animate-wiggle-antenna-r rounded-full shadow-sm">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-400 rounded-full border-2 border-white shadow-[0_0_8px_rgba(244,143,177,0.8)] animate-pulse"></div>
                         </div>
                         {/* Antenna Base */}
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-4 bg-gray-700 rounded-t-full border-t border-white/20"></div>
                      </div>

                      {/* TV Legs (Adorably supporting the TV) */}
                      <div className="absolute -bottom-3 left-[15%] w-5 h-4 bg-stone-800 rounded-b-xl border-t-2 border-stone-900 shadow-md"></div>
                      <div className="absolute -bottom-3 right-[15%] w-5 h-4 bg-stone-800 rounded-b-xl border-t-2 border-stone-900 shadow-md"></div>

                      {/* TV Screen Container (Slightly larger, dark frame) */}
                      <div className="w-[74%] h-[94%] bg-stone-950 rounded-[2rem] border-[6px] border-stone-900 shadow-[0_4px_15px_rgba(0,0,0,0.6),_inset_0_4px_15px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center animate-tv-glow">
                         
                         {/* CRT Screen Reflection Glare */}
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20 skew-y-[-12deg] origin-top-left"></div>

                         {/* Screen Content */}
                         <div className="relative w-[92%] h-[92%] rounded-2xl overflow-hidden flex items-center justify-center bg-stone-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                            {displayCoverUrl ? (
                              <img src={displayCoverUrl} alt="Cover" className="w-full h-full object-cover animate-[fade-in_0.5s_ease-out]" />
                            ) : (
                              <Music className="w-16 h-16 text-pink-400 opacity-60 animate-bounce" />
                            )}

                            {/* CRT TV lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] pointer-events-none z-10 animate-crt-flicker"></div>
                         </div>
                      </div>

                      {/* Control Panel (Adjusted 24% width) - Dials, buttons and speakers */}
                      <div className="w-[24%] h-full flex flex-col justify-between items-center py-2 pl-2">
                         
                         {/* Knobs Area */}
                         <div className="flex flex-col gap-3.5 items-center w-full">
                            {/* Knob 1 */}
                            <div className="group/knob flex flex-col items-center">
                               <div className="w-10 h-10 bg-gradient-to-br from-[#ECECEC] via-white to-gray-300 rounded-full border-2 border-pink-200 shadow-[0_3px_6px_rgba(0,0,0,0.15),_inset_0_2px_4px_white] flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 group-hover/knob:rotate-[65deg]">
                                  {/* Pointer indicator line */}
                                  <div className="w-1.5 h-5 bg-[#FF5E7E] rounded-full origin-bottom -translate-y-1"></div>
                               </div>
                               <span className="text-[7px] font-mono tracking-widest text-[#FFF0F4]/80 mt-0.5 uppercase font-bold">VOLUME</span>
                            </div>

                            {/* Knob 2 */}
                            <div className="group/knob flex flex-col items-center">
                               <div className="w-10 h-10 bg-gradient-to-br from-[#ECECEC] via-white to-gray-300 rounded-full border-2 border-pink-200 shadow-[0_3px_6px_rgba(0,0,0,0.15),_inset_0_2px_4px_white] flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 group-hover/knob:-rotate-[40deg]">
                                  {/* Pointer indicator line */}
                                  <div className="w-1.5 h-5 bg-[#FF5E7E] rounded-full origin-bottom -translate-y-1"></div>
                               </div>
                               <span className="text-[7px] font-mono tracking-widest text-[#FFF0F4]/80 mt-0.5 uppercase font-bold">TUNING</span>
                            </div>
                         </div>

                         {/* Sound Speaker Grille (Physical-looking dots with pulsing notes) */}
                         <div className="relative flex flex-col gap-1 w-11 py-1.5 px-2 bg-black/10 rounded-lg shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
                            <div className="flex justify-between">{[1,2,3,4].map(n=><div key={`l11998-g1-${n}`} className="w-1 h-1 rounded-full bg-[#B31D45]/40 shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"></div>)}</div>
                            <div className="flex justify-between">{[1,2,3,4].map(n=><div key={`l11999-g2-${n}`} className="w-1 h-1 rounded-full bg-[#B31D45]/40 shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"></div>)}</div>
                            <div className="flex justify-between">{[1,2,3,4].map(n=><div key={`l12000-g3-${n}`} className="w-1 h-1 rounded-full bg-[#B31D45]/40 shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"></div>)}</div>
                            <div className="flex justify-between">{[1,2,3,4].map(n=><div key={`l12001-g4-${n}`} className="w-1 h-1 rounded-full bg-[#B31D45]/40 shadow-[0_0.5px_0_rgba(255,255,255,0.2)]"></div>)}</div>
                         </div>


                      </div>
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
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent ${templateType === '4' || templateType === '9' ? 'rounded-[1.7rem]' : (templateType === '5' || templateType === '8' || templateType === '18' ? 'rounded-full' : '')} ${templateType === '6' ? 'opacity-30' : ''} ${templateType === '16' || templateType === '19' || templateType === '20' ? 'hidden' : ''}`}></div>
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
                        templateType === '19' ? 'bg-[#D95B16] text-white border border-[#D95B16] font-sans tracking-widest rounded-full' :
                        templateType === '20' ? 'bg-[#FF9B00] text-white border-2 border-white rounded-full font-sans -rotate-3' :
                        'bg-rose-600/95 text-white border border-white/25 rounded-md tracking-wider'
                      }`}
                    >
                      {demo.releaseYear}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
            
              
          <div className="relative w-full py-4 -my-4 flex flex-col items-center">
            
            
          <h1 
            className="text-xl md:text-2xl font-black text-center mb-1 drop-shadow-sm flex items-center justify-center relative z-30"
            style={{ color: customConfig?.titleColor || undefined }}
          >
            <span className="relative inline-flex items-center">
              <HoverTranslate text={demo.title} format={true} />
              <span className="inline-block w-5 md:w-7"></span>
              {demo.linkType === 'indirect' ? (
                <div className="absolute top-0 right-0 translate-x-[105%] -translate-y-[25%] rotate-[10deg] bg-indigo-600 text-[7px] md:text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-[pulse_2s_ease-in-out_infinite] tracking-widest border border-white/20 select-none z-50 whitespace-nowrap">
                  Landing Page
                </div>
              ) : demo.isReleased ? (
                <div className="absolute top-0 right-0 translate-x-[105%] -translate-y-[25%] rotate-[10deg] bg-emerald-600 text-[7px] md:text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(5,150,105,0.8)] tracking-widest border border-emerald-400/50 select-none animate-released-wiggle z-50 whitespace-nowrap">
                  {t.lReleasedMark || 'RELEASED'}
                </div>
              ) : (
                <div className="absolute top-0 right-0 translate-x-[105%] -translate-y-[25%] rotate-[10deg] bg-rose-600 text-[7px] md:text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(225,29,72,0.8)] animate-[pulse_2s_ease-in-out_infinite] tracking-widest border border-white/20 select-none z-50 whitespace-nowrap">
                  {t.lDemoMark || 'DEMO'}
                </div>
              )}
            </span>
          </h1>
          {demo.isBrand && demo.brandName && (() => {
            const badgeStyle = getBrandBadgeStyle(brandColors.primary, isGoldTheme);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`my-3 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl border shadow-md w-fit mx-auto relative z-30 ${demo.brandBrief ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                style={{
                  borderColor: badgeStyle.borderColor,
                  backgroundColor: badgeStyle.backgroundColor,
                  boxShadow: badgeStyle.boxShadow
                }}
                onClick={() => demo.brandBrief ? setShowBrandBrief(true) : undefined}
                title={demo.brandBrief ? "Bấm để xem Brief Khách hàng" : undefined}
              >
                {demo.brandLogoUrl && (
                  <img 
                    src={demo.brandLogoUrl} 
                    className="h-3.5 sm:h-4 max-h-4 w-auto object-contain rounded shrink-0 filter contrast-125 saturate-110" 
                    alt={demo.brandName || ''} 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1">
                  <span style={{ color: badgeStyle.labelColor }}>{t.pPartner || "Đối tác:"}</span>
                  <span style={{ color: badgeStyle.valueColor }}>{demo.brandName}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5" style={{ backgroundColor: badgeStyle.dotColor }}></span>
              </motion.div>
            );
          })()}
          <p 
            className="text-lg md:text-xl font-medium text-center mb-0 relative z-30"
            style={{
              opacity: isLight ? 0.85 : 0.95,
              textShadow: isLight ? '0 1px 1.5px rgba(255,255,255,0.7)' : '0 1.5px 3px rgba(0,0,0,0.85)',
            }}
          >
            {renderArtistNameWithLinks(demo.singer || demo.author || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}
          </p>
          <p 
            className={`text-xs md:text-sm text-center mb-1 md:mb-6 relative z-30 ${templateType === '6' ? 'font-semibold text-pink-700' : templateType === '19' ? 'font-semibold text-[#D95B16]' : templateType === '20' ? 'font-semibold text-[#3B82F6]' : 'font-medium opacity-60'}`}
            style={{ color: customConfig?.authorColor || undefined }}
          >
            {t.sAuth} {renderArtistNameWithLinks(demo.composer || (demo as any)?.defaultArtistName || 'Nghệ sĩ', systemArtists)}
          </p>
          </div>
          </motion.div>
          
          <div 
            className={`rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border ${templateType === '20' ? 'border-pink-200/50 shadow-[0_20px_40px_rgba(216,67,107,0.15)]' : (isLight ? 'border-black/10' : 'border-white/20')} z-[200] overflow-hidden animate-fade-in ${forceMobile ? 'fixed bottom-4 w-[calc(100%-2rem)] inset-x-0 mx-auto' : forcePC ? 'relative bottom-auto w-full inset-x-auto mx-0' : 'fixed md:relative bottom-4 md:bottom-auto w-[calc(100%-2rem)] md:w-full inset-x-0 md:inset-x-auto mx-auto md:mx-0'}`}
          >
            {/* Background with blur and mask */}
            <div 
              className="absolute inset-0 backdrop-blur-xl"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 25%, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 25%, black 100%)' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-t ${templateType === '20' ? 'from-[#FFF0F4]/95 via-[#FFF6F8]/85 to-[#FFE6EC]/50' : (templateType === '2' || templateType === '5' || templateType === '8') ? 'from-black/70 via-black/30' : (isLight ? 'from-white/90 via-white/50' : 'from-black/90 via-black/50')} to-transparent`}></div>
              {displayCoverUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay saturate-150"
                  style={{ backgroundImage: `url(${displayCoverUrl})` }}
                ></div>
              )}
            </div>
            <div className="relative z-10 px-4 pt-2 pb-3 md:px-5 md:pt-3 md:pb-4">
               <CustomAudioPlayer src={demo.audioUrl} backupAudioUrl={demo.backupAudioUrl} template={templateType} onEnded={onEnd} onAlmostEnded={onAlmostEnded} playlistContext={playlistContext} isPreview={isPreview} lyricsColor={customConfig?.lyricsColor} waveColor={customConfig?.waveColor} showDownload={canDownloadSong} title={demo.title} singer={demo.singer || demo.composer} isReleased={demo.isReleased} />
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
          {demo?.isBrand && templateType !== '20' && (demo?.brandBrief || (demo?.brandReferenceVideos && demo.brandReferenceVideos.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 ml-4 pr-4">
              {demo?.brandBrief && (
                <button 
                  onClick={() => setShowBrandBrief(true)} 
                  className="px-3.5 py-1.5 rounded-full bg-indigo-500/80 text-white hover:bg-indigo-600 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-xs font-bold whitespace-nowrap shadow-sm" 
                  title="Brief khách hàng"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Brief
                </button>
              )}
              {demo?.brandReferenceVideos && demo.brandReferenceVideos.length > 0 && (
                <button 
                  onClick={() => setShowBrandVideos(true)} 
                  className="px-3.5 py-1.5 rounded-full bg-rose-500/80 text-white hover:bg-rose-600 flex items-center justify-center transition-all drop-shadow-md cursor-pointer text-xs font-bold whitespace-nowrap shadow-sm" 
                  title="Video Tham Khảo"
                >
                  <Youtube className="w-3.5 h-3.5 mr-1.5" /> Tham Khảo
                </button>
              )}
            </div>
          )}
          <div className={`flex items-center justify-between mb-4 ml-4 pr-4 ${forceMobile ? 'mt-0' : 'mt-0 md:mt-0'} ${templateType === '6' ? '' : 'opacity-50'}`}>
            <h3 
              className={`text-[11px] md:text-sm uppercase tracking-widest ${templateType === '6' ? 'font-black text-pink-700' : 'font-bold'}`}
              style={{ color: customConfig?.authorColor || undefined }}
            >
              {t.lyric}
            </h3>
            <div className="flex items-center gap-4">
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
                  className={`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${templateType === '6' ? 'hover:scale-105 text-[11px] md:text-xs font-black text-pink-700' : 'hover:opacity-100 text-xs font-bold'}`}
                  style={{ color: customConfig?.authorColor || undefined }}
                  title="Copy lời bài hát"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              )}
              {canDownloadSong && demo.linkDrive && (
                <a
                  href={demo.linkDrive}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${templateType === '6' ? 'hover:scale-105 text-[11px] md:text-xs font-black text-pink-700' : 'hover:opacity-100 text-xs font-bold'}`}
                  style={{ color: customConfig?.authorColor || undefined }}
                  title="Tải nhạc từ Google Drive"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
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

      {/* Brand Popups */}
      {showBrandBrief && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowBrandBrief(false)}>
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl max-w-lg w-full text-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <motion.div 
              className="absolute inset-0 pointer-events-none z-0 opacity-45 blur-3xl rounded-2xl"
              style={{
                background: `radial-gradient(circle, ${(brandColors?.primary || '#6366f1')}40 0%, transparent 70%)`
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
            
            {demo?.brandLogoUrl && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10 select-none"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 1.5, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src={demo.brandLogoUrl} 
                  className="w-56 h-56 object-contain filter saturate-110" 
                  alt="" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            )}
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {demo?.brandLogoUrl && (
                    <img src={demo.brandLogoUrl} className="w-6 h-6 object-contain rounded-md" alt="" referrerPolicy="no-referrer" />
                  )}
                  <FileText className="w-5 h-5 text-indigo-400" /> Brief khách hàng
                </h3>
                <button onClick={() => setShowBrandBrief(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="text-sm text-stone-200 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1">{formatBriefText(demo?.brandBrief)}</div>
            </div>
          </div>
        </div>
      )}
      {showBrandVideos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" onClick={() => setShowBrandVideos(false)}>
          <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl max-w-2xl w-full text-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <motion.div 
              className="absolute inset-0 pointer-events-none z-0 opacity-45 blur-3xl rounded-2xl"
              style={{
                background: `radial-gradient(circle, ${(brandColors?.primary || '#6366f1')}40 0%, transparent 70%)`
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
            
            {demo?.brandLogoUrl && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10 select-none"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 1.5, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src={demo.brandLogoUrl} 
                  className="w-72 h-72 object-contain filter saturate-110" 
                  alt="" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            )}
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {demo?.brandLogoUrl && (
                    <img src={demo.brandLogoUrl} className="w-6 h-6 object-contain rounded-md" alt="" referrerPolicy="no-referrer" />
                  )}
                  <Youtube className="w-5 h-5 text-rose-400" /> {t.vRef || "Video Tham Khảo"}
                </h3>
                <button onClick={() => setShowBrandVideos(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                {demo?.brandReferenceVideos?.map((vid, idx) => {
                  const videoId = getYoutubeId(vid);

                  return (
                    <button
                      key={`brand-vid-${idx}`}
                      onClick={() => {
                        if (videoId) {
                          setShowBrandVideos(false);
                          setPlayingVideo(videoId);
                        } else if (vid) {
                          window.open(vid, '_blank');
                        }
                      }}
                      className="w-full flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-rose-400/50 transition-all text-left group cursor-pointer shadow-md"
                    >
                      <div className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden relative shrink-0 border border-white/20 bg-black">
                        {videoId ? (
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                            <Youtube className="w-6 h-6 text-stone-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[10px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider">
                          Video tham khảo #{idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white truncate group-hover:text-rose-200 transition-colors">
                          {demo?.title ? `${demo.title} - Ref #${idx + 1}` : `Video Tham Khảo ${idx + 1}`}
                        </h4>
                        <span className="text-[11px] text-stone-300/80 flex items-center gap-1 mt-0.5">
                          <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">Bấm để phát video</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Song Modal */}
      {reportSong && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-150 animate-in fade-in zoom-in duration-200 text-stone-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-stone-100 rounded-xl">
                <Bell className="w-6 h-6 text-stone-700 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-900">{t("Báo cáo & Yêu cầu bài hát")}</h3>
                <p className="text-xs text-stone-500">{t("Gửi yêu cầu gỡ hoặc chỉnh sửa cho bài hát này")}</p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-150 rounded-xl p-3 mb-4 text-xs">
              <div className="font-bold text-stone-800 truncate">Bài: {reportSong.title}</div>
              <div className="text-stone-500 mt-0.5">Uploader: <strong>{reportSong.sourceArtist.name}</strong> (@{reportSong.sourceArtist.username})</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Loại yêu cầu")}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportType('edit')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${reportType === 'edit' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'}`}
                  >
                    <span className={`font-bold text-xs ${reportType === 'edit' ? 'text-blue-700' : 'text-blue-600'}`}>{t("Yêu cầu chỉnh sửa")}</span>
                    <span className={`text-[10px] leading-tight ${reportType === 'edit' ? 'text-blue-600' : 'text-stone-500'}`}>{t("Trao đổi với người đăng để cập nhật nội dung")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('remove')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${reportType === 'remove' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-red-200 bg-red-50/30 hover:bg-red-50'}`}
                  >
                    <span className={`font-bold text-xs ${reportType === 'remove' ? 'text-red-700' : 'text-red-600'}`}>{t("Yêu cầu gỡ")}</span>
                    <span className={`text-[10px] leading-tight ${reportType === 'remove' ? 'text-red-600' : 'text-stone-500'}`}>{t("Tố cáo bài viết vi phạm.")}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Mô tả lý do / Chi tiết")}</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder={t("Mô tả cụ thể lý do yêu cầu (ví dụ: Vi phạm bản quyền, sai thông tin ca sĩ, nhạc sĩ...)")}
                  rows={4}
                  className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent text-stone-900 bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-stone-150">
              <button
                type="button"
                onClick={() => { setReportSong(null); setReportDesc(''); }}
                className="px-4 py-2 border rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 text-sm transition-all cursor-pointer"
              >
                {t("Hủy bỏ")}
              </button>
              <button
                type="button"
                onClick={handleCreateReport}
                disabled={!reportDesc.trim()}
                className="px-4 py-2 rounded-xl font-bold bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
              >
                {t("Gửi báo cáo")}
              </button>
            </div>
          </div>
        </div>
      )}

      {playingVideo && (() => {
        const activeTitle = demo?.title ? `${demo.title} - Video` : "Video Tham Khảo";
        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 cursor-pointer bg-black/80 backdrop-blur-md" onClick={() => setPlayingVideo(null)}>
            <div 
              className="relative w-full max-w-4xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="font-bold text-white text-sm truncate">{activeTitle}</span>
                </div>
                <div className="flex items-center gap-3 justify-end shrink-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${playingVideo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-300 bg-white/10 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-white/10"
                    title="Mở trên trang YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>Mở trên YouTube</span>
                  </a>
                  <button 
                    className="text-neutral-400 hover:text-white px-2.5 py-0.5 font-bold transition-colors text-base sm:text-lg shrink-0 cursor-pointer"
                    onClick={() => setPlayingVideo(null)}
                    title={t("Đóng")}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full h-full relative bg-neutral-950">
                <SmartYouTubePlayer videoId={playingVideo} title={activeTitle} />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ---- SOCIAL CAROUSEL ----
function formatSocialLink(url: string, platform: string) {
  if (!url) return '';
  url = url.trim();
  
  // If it already has http:// or https://, return it directly
  if (/^https?:\/\//i.test(url)) return url;
  
  // If it starts with www. or directly includes the domain (e.g. facebook.com/user)
  if (/^(www\.)?(facebook|instagram|youtube|tiktok|soundcloud)\.com/i.test(url)) {
    return `https://${url}`;
  }
  
  // Otherwise, it's just plain text, prepend the domain
  if (platform === 'fb') return `https://facebook.com/${url}`;
  if (platform === 'ig') return `https://instagram.com/${url}`;
  if (platform === 'yt') return `https://youtube.com/@${url.replace(/^@/, '')}`;
  if (platform === 'tk') return `https://tiktok.com/@${url.replace(/^@/, '')}`;
  if (platform === 'sc') return `https://soundcloud.com/${url}`;
  return url;
}

const FollowIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4a2 2 0 0 1 10 0v2H7V4zM5 8a2 2 0 0 1 14 0v2H5V8z" opacity="0.6"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6 9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3H6zm5 4a1 1 0 0 1 2 0v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2v-2z" />
  </svg>
);

function SocialCarousel({ data, pushDown = false, isGoldTheme = false, isMusicianTheme = false }: { data: AppData, pushDown?: boolean, isGoldTheme?: boolean, isMusicianTheme?: boolean }) {
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
    <div className={`fixed left-6 z-[105] flex flex-col items-center gap-3 transition-all duration-500 ease-in-out top-6 sm:top-8`}>
      <button 
        onClick={() => { setIsOpen(!isOpen); console.log('Clicked, new state:', !isOpen); }}
        className={`relative flex items-center justify-center w-10.5 h-10.5 rounded-full ${
          isMusicianTheme 
            ? 'bg-gradient-to-b from-[#4A2411] via-[#35180A] to-[#210D04] border-2 border-[#8C4A1C] text-amber-300 shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,220,150,0.3)] hover:border-amber-400 hover:scale-110 hover:text-amber-100 hover:shadow-[0_0_20px_rgba(245,158,11,0.6)]' 
            : isGoldTheme 
            ? 'bg-[#1A1303] border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-[#D4AF37] hover:text-amber-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
            : 'bg-[#9C7989]/85 border border-white/50 text-white hover:bg-[#886575] hover:scale-110 shadow-md backdrop-blur-md'
        } backdrop-blur-md border hover:scale-110 shadow-md transition-all cursor-pointer`}
        title="Follow"
      >
        <AnimatePresence>
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
          <motion.div key="is-open"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {  opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-col gap-3"
          >
            {socials.map((social, idx) => {
              const IconComponent = social.Icon;
              return (
                <motion.a
                  key={`l12599-${social.id || ''}-${idx}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: {  opacity: 0, y: -10, scale: 0.8 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  className={`flex items-center justify-center w-10.5 h-10.5 rounded-full backdrop-blur-md border hover:scale-110 shadow-lg transition-all ${
                    isMusicianTheme 
                      ? 'bg-gradient-to-b from-[#4A2411] via-[#35180A] to-[#210D04] border-2 border-[#8C4A1C] text-amber-300 hover:border-amber-400 hover:text-amber-100 hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] shadow-md' 
                      : isGoldTheme 
                      ? 'bg-[#1A1303] border-[#D4AF37]/40 text-[#D4AF37] ' + social.color.replace('hover:bg-', 'hover:text-white hover:bg-') 
                      : 'bg-[#9C7989]/85 border border-white/50 text-white hover:bg-rose-600 hover:scale-110 shadow-md backdrop-blur-md'
                  }`}
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
const DEFAULT_VI_NAMES: Record<string, string> = {
  '1': 'Vui vẻ (Ấm áp)',
  '2': 'Căng Cực (Sôi động)',
  '3': 'Buồn (Sâu lắng)',
  '4': 'Thư giãn (Nhẹ nhàng)',
  '5': 'Đáng yêu (Đỏ, Nhảy múa)',
  '6': 'Hạnh Phúc (Hồng, Hoa rơi)',
  '7': 'Học Đường (Trắng, Lá vàng rơi)',
  '8': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
  '9': 'Cầu Vồng',
  '10': 'Hip Hop (Đường phố)',
  '11': 'Kỳ bí (Đen vàng, Trăng khói mưa)',
  '12': 'Cổ điển (Nâu, retro)',
  '13': 'Hoàng hôn (Cam đỏ trời chiều)',
  '14': 'Đại Dương (Sóng biển)',
  '15': 'Retro 8-Bit (Game)',
  '16': 'Xếp hình Puzzle',
  '17': 'Cổ vũ (Mây, mặt trời)',
  '18': 'Pháo hoa (Năm mới)'
};

const translateTemplateName = (nameOrId: string, customNames?: Record<string, string>, id?: string) => {
  if (id && customNames?.[id]) return customNames[id];
  if (customNames && customNames[nameOrId]) return customNames[nameOrId];
  const map: Record<string, string> = {
    '1': 'Vui vẻ (Ấm áp)',
    '2': 'Căng Cực (Sôi động)',
    '3': 'Buồn (Sâu lắng)',
    '4': 'Thư giãn (Nhẹ nhàng)',
    '5': 'Đáng yêu (Đỏ, Nhảy múa)',
    '6': 'Hạnh Phúc (Hồng, Hoa rơi)',
    '7': 'Học Đường (Trắng, Lá vàng rơi)',
    '8': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
    '9': 'Cầu Vồng',
    '10': 'Hip Hop (Đường phố)',
    '11': 'Kỳ bí (Đen vàng, Trăng khói mưa)',
    '12': 'Cổ điển (Nâu, retro)',
    '13': 'Hoàng hôn (Cam đỏ trời chiều)',
    '14': 'Đại Dương (Sóng biển)',
    '15': 'Retro 8-Bit (Game)',
    '16': 'Xếp hình Puzzle',
    '17': 'Cổ vũ (Mây, mặt trời)',
    '18': 'Pháo hoa (Năm mới)',
    'Vui vẻ (Ấm áp)': 'Vui vẻ (Ấm áp)',
    'Căng Cực (Sôi động)': 'Căng Cực (Sôi động)',
    'Buồn (Sâu lắng)': 'Buồn (Sâu lắng)',
    'Thư giãn (Nhẹ nhàng)': 'Thư giãn (Nhẹ nhàng)',
    'Đáng yêu (Đỏ, Nhảy múa)': 'Đáng yêu (Đỏ, Nhảy múa)',
    'Hạnh Phúc (Hồng, Hoa rơi)': 'Hạnh Phúc (Hồng, Hoa rơi)',
    'Học Đường (Trắng, Lá vàng rơi)': 'Học Đường (Trắng, Lá vàng rơi)',
    'Tổ Quốc (Đỏ, Cờ phấp phới)': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
    'Vietnam (Red, waving flag)': 'Tổ Quốc (Đỏ, Cờ phấp phới)',
    'Cầu Vồng': 'Cầu Vồng',
    'Hip Hop (Đường phố)': 'Hip Hop (Đường phố)',
    'Kỳ bí (Đen vàng, Trăng khói mưa)': 'Kỳ bí (Đen vàng, Trăng khói mưa)',
    'Cổ điển (Nâu, retro)': 'Cổ điển (Nâu, retro)',
    'Hoàng hôn (Cam đỏ trời chiều)': 'Hoàng hôn (Cam đỏ trời chiều)',
    'Đại Dương (Sóng biển)': 'Đại Dương (Sóng biển)',
    'Retro 8-Bit (Game)': 'Retro 8-Bit (Game)',
    'Xếp hình Puzzle': 'Xếp hình Puzzle',
    'Cổ vũ (Mây, mặt trời)': 'Cổ vũ (Mây, mặt trời)',
    'Pháo hoa (Năm mới)': 'Pháo hoa (Năm mới)',
    };
  return map[nameOrId] || nameOrId;
};

function AdminTemplatesSettings({ isPCPreviewMode, setIsPCPreviewMode }: { isPCPreviewMode?: boolean, setIsPCPreviewMode?: (b: boolean) => void }) {
  const { t } = useAdminTranslation();
  const { landingConfig } = useContext(LanguageContext);
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
        const defaultNames = [
          'Vui vẻ (Ấm áp)', 'Căng Cực (Sôi động)', 'Buồn (Sâu lắng)', 'Thư giãn (Nhẹ nhàng)',
          'Đáng yêu (Đỏ, Nhảy múa)', 'Hạnh Phúc (Hồng, Hoa rơi)', 'Học Đường (Trắng, Lá vàng rơi)',
          'Tổ Quốc (Đỏ, Cờ phấp phới)', 'Cầu Vồng', 'Hip Hop (Đường phố)',
          'Kỳ bí (Đen vàng, Trăng khói mưa)', 'Cổ điển (Nâu, retro)', 'Hoàng hôn (Cam đỏ trời chiều)',
          'Đại Dương (Sóng biển)', 'Retro 8-Bit (Game)', 'Xếp hình Puzzle', 'Cổ vũ (Mây, mặt trời)', 'Pháo hoa (Năm mới)'
        ];
        let merged: any[] = [];
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          merged = data.templateConfigs.map((c: any) => ({
            ...c,
            name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id))
          }));
        }
        for (let i = 1; i <= 18; i++) {
           const exist = merged.find((c: any) => c.id === String(i));
           if (!exist) {
             merged.push({ id: String(i), name: translateTemplateName(defaultNames[i - 1], landingConfig?.templateNames, String(i)), order: i });
           } else {
             exist.name = translateTemplateName(exist.name || String(i), landingConfig?.templateNames, String(i));
           }
        }
        merged.sort((a: any, b: any) => a.order - b.order);
        setTemplateConfigs(merged);
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
    setToast(t('Đã lưu cấu hình!'));
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

  if (isLoading) return <div>{t("Đang tải...")}</div>;

  if (editingId) {
    return <AdminTemplateEdit 
             config={templateConfigs.find(c => c.id === editingId)!} 
             demos={demos}
             templateName={landingConfig?.templateNames?.[editingId]}
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-rose-500 animate-[pulse_2.5s_infinite]" />
            {t("Chỉnh Sửa Chủ Đề")}
          </h2>
          <p className="text-xs text-stone-500 mt-1">{t("Kéo thả để sắp xếp lại thứ tự hiển thị của chủ đề khi chọn. Nhấn vào Chủ Đề để chỉnh sửa chi tiết.")}</p>
        </div>
        {toast && <span className="bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm animate-pulse">{toast}</span>}
      </div>
      
      <div className="space-y-3">
        {templateConfigs.map((config, idx) => {
          const isExpanded = expandedTemplateIds.includes(config.id);
          const activeDemos = demos.filter(d => (d.template || '1') === config.id);
          return (
          <div key={`l12836-${config.id || ''}-${idx}`} className="space-y-1">
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
               <span className="text-sm sm:text-base font-bold truncate">{landingConfig?.templateNames?.[config.id] || (DEFAULT_VI_NAMES[config.id] ? t(DEFAULT_VI_NAMES[config.id]) : config.name)}</span>
               {landingConfig?.templateVip?.[config.id] && (
                 <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
               )}
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
               {activeDemos.map((d, idx) => (
                 <div key={`l12865-${d.id || ''}-${idx}`} className="text-sm font-medium text-stone-600 flex items-center gap-2 truncate">
                   <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0"></span>
                   <span className="truncate">{d.title}</span>
                 </div>
               ))}
            </div>
          )}
          {isExpanded && activeDemos.length === 0 && (
            <div className="pl-14 pr-4 py-2 bg-stone-50/50 rounded-xl border border-stone-100 text-sm italic text-stone-400">
               {t("Chưa có bài hát nào dùng chủ đề này")}
            </div>
          )}
          </div>
        ); })}
      </div>
    </div>
  );
}

function AdminTemplateEdit({ config, demos, onBack, onSave, isPCPreviewMode, setIsPCPreviewMode, templateName }: any) {
    const { t } = useAdminTranslation();
    const { lang } = useContext(LanguageContext);
    const [name, setName] = useState(config.name);
    const [bgColor, setBgColor] = useState(config.bgColor || '');
    const [titleColor, setTitleColor] = useState(config.titleColor || '');
    const [lyricsColor, setLyricsColor] = useState(config.lyricsColor || '');
    const [authorColor, setAuthorColor] = useState(config.authorColor || '');
    const [waveColor, setWaveColor] = useState(config.waveColor || '');
    const [previewSongId, setPreviewSongId] = useState(demos[0]?.id || '');

    const currentConfig = { ...config, name, bgColor, titleColor, lyricsColor, authorColor, waveColor };

    const authorColorLabel = lang === 'en' ? "Composer color" : 
                             lang === 'ko' ? "작곡가 색상" : 
                             lang === 'ja' ? "作曲家カラー" : 
                             lang === 'th' ? "สีของผู้แต่ง" : 
                             lang === 'zh' ? "作曲家颜色" : "Màu Tên tác giả";

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
          <label className={`block font-semibold text-stone-700 mb-1 ${isPCPreviewMode ? 'text-xs' : 'text-sm'}`}>{t(label)}</label>
          <div className="flex gap-2 items-center animate-fade-in">
            <input 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              className={`flex-1 border border-stone-200 rounded-xl px-4 ${isPCPreviewMode ? 'py-2 text-sm' : 'py-3 text-base'} bg-stone-50/50 hover:bg-stone-50 outline-none focus:ring-2 focus:ring-emerald-500/25 transition-all`} 
              placeholder={placeholder} 
            />
            <div className="relative w-10 h-10 md:w-12 md:h-12 border border-stone-200 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-transform flex items-center justify-center bg-stone-50">
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
      <div className={`flex flex-col fixed inset-0 md:relative md:inset-auto bg-zinc-900 z-[101] md:z-40 ${isPCPreviewMode ? 'w-full h-full' : 'md:h-[calc(100vh-128px)] md:-m-8'}`}>
         <div className="bg-white p-4 border-b flex justify-between items-center z-10 shrink-0">
             <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium font-sans">
                 <ArrowLeft className="w-5 h-5"/> {t("Trở về")}
             </button>
             <div className="flex items-center gap-4">
                 <button 
                     onClick={() => setIsPCPreviewMode && setIsPCPreviewMode(!isPCPreviewMode)} 
                     className={`hidden md:flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${isPCPreviewMode ? 'border-stone-800 bg-stone-100 text-stone-900' : 'border-stone-200 bg-transparent text-stone-450 hover:text-stone-700 hover:border-stone-400'} shadow-sm`}
                     title={t("Chủ đề xem trên máy tính")}
                 >
                     <Monitor className="w-5 h-5 stroke-[1.5]" />
                 </button>
                 <button onClick={() => onSave(currentConfig)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors shadow">
                     {t("Lưu cài đặt")}
                 </button>
             </div>
         </div>
         <div className="flex flex-1 flex-col md:flex-row overflow-y-auto md:overflow-hidden relative border-t-0">
             <div className={`w-full h-auto md:h-full ${isPCPreviewMode ? 'md:w-[260px] p-4 space-y-4' : 'md:w-[400px] p-6 md:p-8 space-y-6'} bg-white flex-shrink-0 border-b md:border-b-0 md:border-r overflow-visible md:overflow-y-auto custom-scrollbar`}>
                 <div>
                     <h3 className={`${isPCPreviewMode ? 'text-lg' : 'text-2xl'} font-black mb-1`}>{t("Chỉnh sửa")}</h3>
                     <p className="inline-block bg-stone-100 text-stone-500 font-mono text-xs px-2 py-0.5 rounded-md mt-1">{t("Chủ đề")} #{config.id} - {templateName || (DEFAULT_VI_NAMES[config.id] ? t(DEFAULT_VI_NAMES[config.id]) : config.name)}</p>
                 </div>
                 
                 <div>
                    <label className={`${isPCPreviewMode ? 'text-xs' : 'text-sm'} block font-semibold text-stone-700 mb-2`}>{t("Bài hát Preview")}</label>
                    <div className="relative">
                       <select className={`w-full border border-stone-300 rounded-xl pl-4 pr-10 ${isPCPreviewMode ? 'py-2 text-sm' : 'py-3'} bg-white shadow-xs appearance-none cursor-pointer hover:border-stone-400 transition-colors`} value={previewSongId} onChange={e => setPreviewSongId(e.target.value)}>
                          {demos.map((d: any, idx: number) => (
                              <option key={`l12967-${d.id || ''}-${idx}`} value={d.id}>{d.title}</option>
                          ))}
                       </select>
                       <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                    </div>
                 </div>

                 <div className={`space-y-4 pt-4 border-t border-stone-200 ${isPCPreviewMode ? 'text-sm' : ''}`}>
                    {renderColorPickerField("Màu nền tùy chỉnh", bgColor, setBgColor, "VD: #111827")}
                    {renderColorPickerField("Màu chữ tiêu đề", titleColor, setTitleColor, "VD: #ffffff")}
                    {renderColorPickerField(authorColorLabel, authorColor, setAuthorColor, "VD: #fef08a")}
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
                    <div className="text-stone-500 bg-stone-900 h-full w-full flex items-center justify-center font-medium">{t("Hãy chọn bài hát để xem.")}</div>
                )}
             </div>
         </div>
      </div>
    );
}

function AdminDatabaseSettings({ artistUsername }: { artistUsername?: string }) {
  const { t } = useAdminTranslation();
  const [configsData, setConfigsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [mediaSyncing, setMediaSyncing] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSyncMediaFirebase = async () => {
    const globalConfirm = (window as any).globalShowConfirm;
    if (globalConfirm && !(await globalConfirm('Hệ thống sẽ tải toàn bộ tệp tin nhạc (mp3) và hình ảnh (ảnh bìa, ảnh chạy slideshow, ảnh đại diện, banner) từ Firebase/Google Drive về lưu trữ trực tiếp trên ổ cứng Server, sau đó đồng bộ hóa đường dẫn nội bộ. Bạn có muốn tiếp tục?', 'Tải Media & Đồng Bộ về Server', 'confirm'))) {
      return;
    }

    setMediaSyncing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/firebase-media-sync', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Tải media và đồng bộ hóa từ Firebase thành công!');
        if ((window as any).loadData) {
          (window as any).loadData();
        }
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tải media và đồng bộ.');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setMediaSyncing(false);
    }
  };

  const handleSyncFirebase = async () => {
    if (!configsData || !configsData.configs || configsData.configs.length === 0) {
      setError('Bạn chưa cấu hình Firebase Database nào!');
      return;
    }
    const globalConfirm = (window as any).globalShowConfirm;
    if (globalConfirm && !(await globalConfirm('Bạn có chắc chắn muốn đồng bộ toàn bộ dữ liệu từ Firebase cũ về Server mới? Tất cả bài hát, danh sách phát và cài đặt hiện tại trên Server của bạn sẽ được ghi đè bằng dữ liệu từ Firebase.', 'Đồng bộ Firebase', 'confirm'))) {
      return;
    }

    setSyncing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/firebase-sync', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Đồng bộ dữ liệu từ Firebase thành công! Vui lòng tải lại trang để thấy dữ liệu mới.');
        if ((window as any).loadData) {
          (window as any).loadData();
        }
      } else {
        setError(data.error || 'Có lỗi xảy ra khi đồng bộ.');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setSyncing(false);
    }
  };

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

  if (loading && !configsData) return <div className="text-stone-500">{t("Đang tải...")}</div>;

  if (editingConfigId && editForm) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => { setEditingConfigId(null); setEditForm(null); }} className="p-2 hover:bg-stone-200 rounded-lg text-stone-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-stone-900">{editingConfigId === 'new' ? t('Thêm cấu hình mới') : t('Chỉnh sửa cấu hình')}</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">{t("Tên gợi nhớ (VD: DB cũ, Mặc định...)")}</label>
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
              <label className="block text-sm font-medium text-stone-700 mb-1">{t("Firestore Database ID (mặc định là default)")}</label>
              <input type="text" value={editForm.config.firestoreDatabaseId || ''} onChange={e => setEditForm({...editForm, config: {...editForm.config, firestoreDatabaseId: e.target.value}})} placeholder="default" className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          
          <div className="pt-4 flex gap-3">
            <button disabled={loading} onClick={handleSaveEdit} className="px-6 py-2 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50">
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
          <h2 className="text-2xl font-bold mb-2 text-stone-900">{t("Quản Lý Cơ Sở Dữ Liệu")}</h2>
          <p className="text-sm text-stone-500">{t("Chuyển đổi giữa các Firebase config (DB mới / DB cũ) an toàn.")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => {
            if (globalShowConfirm && await globalShowConfirm('CẢNH BÁO: Hành động này sẽ XÓA SẠCH toàn bộ dữ liệu (bài hát, playlist, cài đặt) trong Database ĐANG DÙNG. Bạn có chắc chắn muốn làm mới Database này?', 'Cảnh báo xóa sạch dữ liệu', 'danger')) {
              setLoading(true);
              try {
                const res = await fetch('/api/admin/firebase-wipe', {
                  method: 'POST',
                  headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
 'Authorization': `Bearer ${getAdminToken()}` }
                });
                if (res.ok) {
                  setSuccess('{t("Đã xóa sạch dữ liệu trong DB hiện tại. Vui lòng tải lại trang!")}');
                } else {
                  setError('{t("Lỗi khi xóa DB")}');
                }
              } catch (e) {
                setError('Lỗi kết nối máy chủ');
              } finally {
                setLoading(false);
              }
            }
          }} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 text-sm">
            <Trash2 className="w-4 h-4" /> {t("Làm mới DB này")}
          </button>
          <button onClick={() => {
            setEditingConfigId('new');
            setEditForm({ name: '', config: { projectId: '', apiKey: '', appId: '', authDomain: '', storageBucket: '', messagingSenderId: '', measurementId: '', firestoreDatabaseId: 'default' } });
          }} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl font-bold hover:bg-stone-800 text-sm">
            <Plus className="w-4 h-4" /> {t("Thêm DB mới")}
          </button>
          <button
            disabled={syncing || loading}
            onClick={handleSyncFirebase}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white shadow-md hover:shadow-xl hover:shadow-amber-600/20 hover:-translate-y-0.5 border border-transparent hover:bg-amber-700 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl font-bold hover:bg-amber-800 text-sm"
          >
            {syncing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("Đang đồng bộ...")}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>{t("Đồng bộ từ Firebase cũ")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {success && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium">{success}</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">{error}</div>}

      {(getArtistExtensionFromUrl() === 'acxuantai' || artistUsername === 'acxuantai') && (
        <div className="bg-stone-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                Đồng Bộ Toàn Bộ Dữ Liệu & Tải Media Về Server Chính
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-3xl">
                Dành riêng cho tài khoản đặc biệt: Tải trực tiếp toàn bộ các tệp tin âm thanh (.mp3) và hình ảnh (ảnh bìa, slideshow, avatar, banner) từ Firebase Database/Storage về ổ đĩa cứng của Server chính này, tự động tối ưu hóa đường dẫn nội bộ cục bộ để cả hai nơi đều lưu trữ đầy đủ tài nguyên một cách độc lập và đồng bộ.
              </p>
            </div>
            <button
              type="button"
              disabled={mediaSyncing || loading}
              onClick={handleSyncMediaFirebase}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-stone-950 font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] shrink-0 cursor-pointer self-start md:self-auto"
            >
              {mediaSyncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin"></div>
                  <span>Đang tải tệp tin...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải & Đồng bộ Media</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configsData?.configs?.map((c: any, idx: number) => {
          const isActive = c.id === configsData.activeId;
          return (
            <div key={`l13349-${c.id || ''}-${idx}`} className={`p-5 rounded-2xl border-2 transition-all ${isActive ? 'border-blue-500 bg-blue-50/30' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                    {t(c.name)} {isActive && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{t("Đang dùng")}</span>}
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



const getAdminTabAndSubtabFromPath = (pathname: string, search: string, hash: string) => {
  const allSegments = pathname.split('/').filter(Boolean);
  const adminIdx = allSegments.indexOf('admin');
  const pathSegments = adminIdx !== -1 ? allSegments.slice(adminIdx + 1) : allSegments;
  const searchParams = new URLSearchParams(search);

  let tab = pathSegments[0] || searchParams.get('tab') || hash.replace('#', '') || '';
  let sub = pathSegments[1] || searchParams.get('subtab') || '';

  if (tab === 'playlists') {
    return { tab: 'demos', subtab: 'playlists' };
  }
  if (tab === 'kho-nhac' || tab === 'songs') {
    return { tab: 'demos', subtab: sub || 'released' };
  }
  if (['released', 'demos', 'drafts', 'trash', 'landing_pages', 'brands'].includes(tab)) {
    return { tab: 'demos', subtab: tab };
  }

  const validTabs = ['demos', 'profile', 'about', 'bio', 'menus', 'socials', 'security', 'templates', 'database', 'reposts', 'tickets', 'layout', 'vouchers', 'admin_theme', 'kho-nhac', 'songs'];
  const validSubtabs = ['released', 'demos', 'drafts', 'playlists', 'trash', 'landing_pages', 'brands'];

  const finalTab = validTabs.includes(tab) ? (tab === 'kho-nhac' || tab === 'songs' ? 'demos' : tab) : 'demos';
  const finalSub = validSubtabs.includes(sub) ? sub : (searchParams.get('subtab') || 'released');

  return { tab: finalTab, subtab: finalSub };
};




function AdminAboutEdit({ data, t, onSave, uploadWithProgress, getPreviewUrl, onPreviewAvatar }: any) {
  const [aboutData, setAboutData] = useState(() => {
    const initialAbout = data.aboutMe || {};
    const resolvedAvatar = initialAbout.avatarUrl || data.avatarUrl || data.homeCoverUrl || '';
    const resolvedIntro = initialAbout.intro || initialAbout.bio || initialAbout.bio1 || '';
    return {
      ...initialAbout,
      avatarUrl: resolvedAvatar,
      intro: resolvedIntro
    };
  });
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarPreviewObjectUrl, setAvatarPreviewObjectUrl] = useState('');
  const [avatarSaving, setAvatarSaving] = useState(false);
  const initialAvatarUrlRef = useRef(data.aboutMe?.avatarUrl || data.avatarUrl || data.homeCoverUrl || '');
  const isAvatarDirty = aboutData.avatarUrl !== initialAvatarUrlRef.current;
  const [socials, setSocials] = useState({
    socialFacebook: data.socialFacebook || '',
    socialInstagram: data.socialInstagram || '',
    socialYoutube: data.socialYoutube || '',
    socialTiktok: data.socialTiktok || '',
  });
  
  const handleSave = (e: any) => {
    e.preventDefault();
    onSave({ 
      aboutMe: aboutData,
      ...socials
    });
    initialAvatarUrlRef.current = aboutData.avatarUrl;
  };

  const handleQuickSaveAvatar = async () => {
    setAvatarSaving(true);
    try {
      await onSave({ aboutMe: { ...aboutData }, ...socials });
      initialAvatarUrlRef.current = aboutData.avatarUrl;
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleChange = (field: string) => (e: any) => {
    setAboutData({ ...aboutData, [field]: e.target.value });
  };

  
  
  
  return (
    <motion.div key="about" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
      <div className="max-w-2xl pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
              {t("Về Tôi")}
            </h2>
            <p className="text-xs text-stone-500 mt-1">{t("Cài đặt thông tin giới thiệu và câu chuyện nghệ sĩ của bạn")}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Avatar Nghệ Sĩ")}</label>
            <div 
              className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={async (e) => {
                  e.preventDefault(); e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                      setAvatarPreviewObjectUrl(URL.createObjectURL(file));
                      try {
                          const result = await uploadWithProgress(file, setAvatarProgress);
                          const url = typeof result === 'string' ? result : result.url;
                          setAboutData({ ...aboutData, avatarUrl: url });
                          if (onPreviewAvatar) onPreviewAvatar(url);
                          if (avatarPreviewObjectUrl) URL.revokeObjectURL(avatarPreviewObjectUrl);
                          setAvatarPreviewObjectUrl('');
                      } catch (err) {
                          alert(t("Lỗi upload"));
                          setAvatarProgress(0);
                          if (avatarPreviewObjectUrl) URL.revokeObjectURL(avatarPreviewObjectUrl);
                          setAvatarPreviewObjectUrl('');
                      }
                  }
              }}
            >
              <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-stone-900 border shadow-md relative shrink-0 transition-all ${isAvatarDirty ? 'border-amber-400 ring-2 ring-amber-300/50 animate-[pulse_1.5s_ease-in-out_infinite]' : 'border-stone-400'}`}>
                {(avatarProgress > 0 && avatarProgress < 100 && avatarPreviewObjectUrl) ? (
                  <>
                    <img src={avatarPreviewObjectUrl} className="w-full h-full object-cover opacity-60 blur-[1px]" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                      <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin" />
                      <span className="text-xs font-black drop-shadow text-white">{avatarProgress}%</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300" style={{ width: `${avatarProgress}%` }} />
                    </div>
                  </>
                ) : aboutData.avatarUrl ? (
                  <img src={getPreviewUrl(getThumbUrl(aboutData.avatarUrl))} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500"><Image className="w-8 h-8" /></div>
                )}
                {isAvatarDirty && avatarProgress !== 100 && !(avatarProgress > 0 && avatarProgress < 100) && (
                  <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>
              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2">
                  <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${avatarProgress === 100 || aboutData.avatarUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('aboutAvatarUpload')?.click()}>
                      <Upload className="w-4 h-4"/>
                      <span className="max-w-[150px] truncate">{avatarProgress > 0 && avatarProgress < 100 ? `Đang tải ${avatarProgress}%` : (aboutData.avatarUrl ? t("Thay đổi") : t("Chọn ảnh"))}</span>
                  </button>
                  {avatarProgress > 0 && avatarProgress < 100 ? (
                    <button type="button" onClick={() => { setAvatarProgress(0); if (avatarPreviewObjectUrl) { URL.revokeObjectURL(avatarPreviewObjectUrl); setAvatarPreviewObjectUrl(''); } }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                  ) : (aboutData.avatarUrl ? (
                    <>
                      {isAvatarDirty && (
                        <button type="button" onClick={handleQuickSaveAvatar} disabled={avatarSaving} className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-all shrink-0 hover:scale-110 shadow-sm" title={t("Lưu avatar ngay")}>
                          {avatarSaving ? <div className="w-4 h-4 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                      )}
                      <button type="button" onClick={() => { setAboutData({ ...aboutData, avatarUrl: '' }); setAvatarProgress(0); (document.getElementById('aboutAvatarUpload') as HTMLInputElement).value = ''; if (onPreviewAvatar) onPreviewAvatar(''); }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                    </>
                  ) : null)}
                </div>
                {isAvatarDirty && (
                  <p className="text-[11px] text-amber-600 font-semibold mt-1 animate-pulse">
                    ⚠ {t("Chưa lưu — nhấn ✓ hoặc Lưu bên dưới")}
                  </p>
                )}
                <p className="text-[11px] text-stone-400 mt-1 truncate max-w-full">
                  {t("Kéo thả ảnh trực tiếp vào ô này")}
                </p>
              </div>
              <input type="file" id="aboutAvatarUpload" className="hidden" accept="image/*" onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                const file = e.target.files[0];
                const compressedFile = file.type?.startsWith('image/') ? await compressImageInBrowser(file, 800, 0.75) : file;
                setAvatarPreviewObjectUrl(URL.createObjectURL(compressedFile));
                try {
                  const result = await uploadWithProgress(compressedFile, setAvatarProgress);
                  const url = typeof result === 'string' ? result : result.url;
                  setAboutData({ ...aboutData, avatarUrl: url });
                  if (onPreviewAvatar) onPreviewAvatar(url);
                  if (avatarPreviewObjectUrl) URL.revokeObjectURL(avatarPreviewObjectUrl);
                  setAvatarPreviewObjectUrl('');
                } catch (err) {
                  alert(t("Lỗi upload"));
                  setAvatarProgress(0);
                  if (avatarPreviewObjectUrl) URL.revokeObjectURL(avatarPreviewObjectUrl);
                  setAvatarPreviewObjectUrl('');
                }
              }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Danh Xưng")}</label>
            <input value={aboutData.role || ''} onChange={handleChange('role')} placeholder={t("Ca nhạc sĩ, producer...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tự bạch")}</label>
            <textarea value={aboutData.intro || ''} onChange={handleChange('intro')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all min-h-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên Thật")}</label>
              <input value={aboutData.realName || ''} onChange={handleChange('realName')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ngày Sinh")}</label>
              <input value={aboutData.dob || ''} onChange={handleChange('dob')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Đến Từ")}</label>
              <input value={aboutData.address || ''} onChange={handleChange('address')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Sinh Sống")}</label>
              <input value={aboutData.company || ''} onChange={handleChange('company')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Email")}</label>
              <input value={aboutData.email || ''} onChange={handleChange('email')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("SĐT")}</label>
              <input value={aboutData.phone || ''} onChange={handleChange('phone')} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>
          </div>

          {/* Mạng Xã Hội */}
          <div className="pt-6 border-t border-stone-100 mt-4">
            <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600 animate-[pulse_2s_infinite]" />
              {t("Mạng xã hội")}
            </h3>
            <p className="text-xs text-stone-500 mb-4">{t("Liên kết các kênh mạng xã hội chính thức của bạn")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Facebook</label>
                <input 
                  value={socials.socialFacebook} 
                  onChange={(e) => setSocials({ ...socials, socialFacebook: e.target.value })} 
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" 
                  placeholder="https://facebook.com/..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Instagram</label>
                <input 
                  value={socials.socialInstagram} 
                  onChange={(e) => setSocials({ ...socials, socialInstagram: e.target.value })} 
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" 
                  placeholder="https://instagram.com/..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube</label>
                <input 
                  value={socials.socialYoutube} 
                  onChange={(e) => setSocials({ ...socials, socialYoutube: e.target.value })} 
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" 
                  placeholder="https://youtube.com/..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">TikTok</label>
                <input 
                  value={socials.socialTiktok} 
                  onChange={(e) => setSocials({ ...socials, socialTiktok: e.target.value })} 
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" 
                  placeholder="https://tiktok.com/@..." 
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-t border-stone-100 pt-6 mt-6">
            <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">
              {t("Lưu cài đặt")}
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
}

function MultiImageDropzone({ values = [], onChange, onRemove, onReorder, t }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const handleDrag = (e: any) => { 
    e.preventDefault(); e.stopPropagation(); 
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true); 
    else setIsDragging(false); 
  };
  
  const handleDrop = async (e: any) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); 
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      for (const file of files) {
        if (values.length >= 4) break;
        await onChange(file);
      }
      setIsUploading(false);
    }
  };

  const handleChange = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      for (const file of files) {
        if (values.length >= 4) break;
        await onChange(file);
      }
      setIsUploading(false);
    }
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDrop = (e: any, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newValues = [...values];
    const [draggedItem] = newValues.splice(draggedIndex, 1);
    newValues.splice(index, 0, draggedItem);

    if (onReorder) {
      onReorder(newValues);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* List of uploaded images */}
      {values.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {values.map((url: string, index: number) => (
            <div 
              key={`l21421-idx-${index}`} 
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleItemDrop(e, index)}
              className={`relative aspect-square bg-stone-100 rounded-xl overflow-hidden border transition-all duration-200 group cursor-grab active:cursor-grabbing ${
                draggedIndex === index ? 'opacity-40 scale-95 border-indigo-400' : 
                dragOverIndex === index ? 'border-indigo-500 scale-105 bg-indigo-50/10' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <img src={url} className="w-full h-full object-cover pointer-events-none" />
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }} 
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer flex items-center justify-center z-10"
                title={t("Xóa ảnh")}
              >
                <X className="w-4 h-4 pointer-events-none" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-[9px] font-bold select-none pointer-events-none z-10">
                #{index + 1}
              </div>
              
              {/* Overlay with subtle drag text on hover */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-0">
                <span className="text-[9px] text-white font-semibold bg-black/50 px-1.5 py-0.5 rounded select-none">
                  {t('Kéo để đổi vị trí') || 'Kéo để đổi vị trí'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger */}
      {values.length < 4 && (
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'}`}>
          <label className="flex-1 flex flex-col items-center justify-center cursor-pointer py-2">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
            ) : (
              <Upload className="w-5 h-5 text-stone-400 mb-2" />
            )}
            <span className="text-xs text-stone-500 font-medium">{isUploading ? t('Đang tải...') || 'Đang tải...' : `${t("Kéo thả hoặc Click để tải ảnh")} (${values.length}/4)`}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleChange} disabled={isUploading} />
          </label>
        </div>
      )}
    </div>
  );
}

function ImageDropzone({ value, onChange, onRemove, t }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDrag = (e: any) => { 
    e.preventDefault(); e.stopPropagation(); 
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true); 
    else setIsDragging(false); 
  };
  
  const handleDrop = async (e: any) => { 
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); 
    const file = e.dataTransfer.files?.[0]; 
    if (file) {
      setIsUploading(true);
      await onChange(file);
      setIsUploading(false);
    }
  };

  const handleChange = async (e: any) => {
    const file = e.target.files?.[0]; 
    if (file) {
      setIsUploading(true);
      await onChange(file);
      setIsUploading(false);
    }
  };

  return (
    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'}`}>
      {value ? (
        <>
          <img src={value} className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0" />
          <div className="flex-1 min-w-0 flex items-center justify-between">
             <span className="text-sm text-stone-500 truncate max-w-[150px] sm:max-w-[200px]">Đã tải lên</span>
             <button type="button" onClick={onRemove} className="text-red-500 text-sm font-bold px-3 py-2 bg-red-50 rounded-xl hover:bg-red-100 transition-colors w-auto">{t("Xóa ảnh")}</button>
          </div>
        </>
      ) : (
        <label className="flex-1 flex flex-col items-center justify-center cursor-pointer py-2">
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
          ) : (
            <Upload className="w-5 h-5 text-stone-400 mb-2" />
          )}
          <span className="text-xs text-stone-500 font-medium">{isUploading ? t('Đang tải...') || 'Đang tải...' : t("Kéo thả hoặc Click để tải ảnh (JPG/PNG)")}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={isUploading} />
        </label>
      )}
    </div>
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

  const updateEdu = (idx: number, field: string, val: any) => {
    const newEdu = [...education];
    newEdu[idx][field] = val;
    setEducation(newEdu);
  };
  
  const updateExp = (idx: number, field: string, val: any) => {
    const newExp = [...experience];
    newExp[idx][field] = val;
    setExperience(newExp);
  };

  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const removeExp = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));

  
  
  
  return (
    <motion.div key="bio" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
      <div className="max-w-4xl pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
              {t("Tiểu Sử")}
            </h2>
            <p className="text-xs text-stone-500 mt-1">{t("Quản lý học vấn và kinh nghiệm hoạt động nghệ thuật của bạn")}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Education section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-800">{t('Học Vấn')}</h3>
              <button type="button" onClick={addEdu} className="flex items-center gap-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> {t("Thêm giai đoạn")}
              </button>
            </div>
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={`l21589-idx-17-${idx}`} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-4 relative">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeEdu(idx)} className="text-stone-400 hover:text-red-500 p-2 cursor-pointer">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Thời gian")}</label>
                        <input value={edu.time} onChange={(e) => updateEdu(idx, 'time', e.target.value)} maxLength={22} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" placeholder="VD: 2009-2012" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Sự Kiện")}</label>
                        <input value={edu.title} onChange={(e) => updateEdu(idx, 'title', e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="VD: THPT Chuyên..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">{t("Mô tả")}</label>
                      <textarea value={edu.description} onChange={(e) => updateEdu(idx, 'description', e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all min-h-[60px]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-2">{t("Hình ảnh minh họa (Tối đa 4 ảnh)")}</label>
                      <MultiImageDropzone 
                        values={edu.imageUrls && Array.isArray(edu.imageUrls) ? edu.imageUrls : (edu.imageUrl ? [edu.imageUrl] : [])} 
                        onChange={async (file: any) => {
                          try {
                            const jpg = await compressImageToJPG(file, 1000);
                            const url = await uploadGlobal(jpg);
                            const currentUrls = edu.imageUrls && Array.isArray(edu.imageUrls) ? [...edu.imageUrls] : (edu.imageUrl ? [edu.imageUrl] : []);
                            if (currentUrls.length < 4) {
                              const newUrls = [...currentUrls, url];
                              updateEdu(idx, 'imageUrls', newUrls);
                              updateEdu(idx, 'imageUrl', newUrls[0] || '');
                            }
                          } catch (e) { alert("Error uploading"); }
                        }} 
                        onRemove={(imgIdx: number) => {
                          const currentUrls = edu.imageUrls && Array.isArray(edu.imageUrls) ? [...edu.imageUrls] : (edu.imageUrl ? [edu.imageUrl] : []);
                          const newUrls = currentUrls.filter((_, i) => i !== imgIdx);
                          updateEdu(idx, 'imageUrls', newUrls);
                          updateEdu(idx, 'imageUrl', newUrls[0] || '');
                        }} 
                        onReorder={(newUrls: string[]) => {
                          updateEdu(idx, 'imageUrls', newUrls);
                          updateEdu(idx, 'imageUrl', newUrls[0] || '');
                        }}
                        t={t} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-stone-800">{t('Kinh nghiệm')}</h3>
              <button type="button" onClick={addExp} className="flex items-center gap-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg cursor-pointer">
                <Plus className="w-4 h-4" /> {t("Thêm giai đoạn")}
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={`l21655-idx-18-${idx}`} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-4 relative">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeExp(idx)} className="text-stone-400 hover:text-red-500 p-2 cursor-pointer">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Thời gian")}</label>
                        <input value={exp.time} onChange={(e) => updateExp(idx, 'time', e.target.value)} maxLength={22} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" placeholder="VD: 2025" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 mb-1">{t("Sự Kiện")}</label>
                        <input value={exp.title} onChange={(e) => updateExp(idx, 'title', e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">{t("Mô tả")}</label>
                      <textarea value={exp.description} onChange={(e) => updateExp(idx, 'description', e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all min-h-[60px]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-2">{t("Hình ảnh minh họa (Tối đa 4 ảnh)")}</label>
                      <MultiImageDropzone 
                        values={exp.imageUrls && Array.isArray(exp.imageUrls) ? exp.imageUrls : (exp.imageUrl ? [exp.imageUrl] : [])} 
                        onChange={async (file: any) => {
                          try {
                            const jpg = await compressImageToJPG(file, 1000);
                            const url = await uploadGlobal(jpg);
                            const currentUrls = exp.imageUrls && Array.isArray(exp.imageUrls) ? [...exp.imageUrls] : (exp.imageUrl ? [exp.imageUrl] : []);
                            if (currentUrls.length < 4) {
                              const newUrls = [...currentUrls, url];
                              updateExp(idx, 'imageUrls', newUrls);
                              updateExp(idx, 'imageUrl', newUrls[0] || '');
                            }
                          } catch (e) { alert("Error uploading"); }
                        }} 
                        onRemove={(imgIdx: number) => {
                          const currentUrls = exp.imageUrls && Array.isArray(exp.imageUrls) ? [...exp.imageUrls] : (exp.imageUrl ? [exp.imageUrl] : []);
                          const newUrls = currentUrls.filter((_, i) => i !== imgIdx);
                          updateExp(idx, 'imageUrls', newUrls);
                          updateExp(idx, 'imageUrl', newUrls[0] || '');
                        }} 
                        onReorder={(newUrls: string[]) => {
                          updateExp(idx, 'imageUrls', newUrls);
                          updateExp(idx, 'imageUrl', newUrls[0] || '');
                        }}
                        t={t} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-stone-100 pt-6 mt-4">
            <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">
              {t("Lưu cài đặt")}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function AdminMenuEdit({ data, t, onSave }: any) {
  const { landingConfig } = useContext(LanguageContext);
  const getMenuTitle = (m: any) => {
    if (m.type === 'vault') return landingConfig?.menuVaultVi || "Kho Nhạc";
    if (m.type === 'about') return landingConfig?.menuAboutVi || "Về Tôi";
    if (m.type === 'bio') return landingConfig?.menuBioVi || "Tiểu Sử";
    return m.title;
  };

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
    <div className="py-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <List className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
            {t("Quản lý Menu")}
          </h2>
          <p className="text-xs text-stone-500 mt-1">{t("Kéo thả để sắp xếp thứ tự ưu tiên. Tab đầu tiên sẽ là trang hiển thị mặc định. Hỗ trợ tạo tối đa 3 custom tab.")}</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {menus.map((m: any, i: number) => (
          <div 
            key={`l21788-${m.id || ''}-${i}`} 
            draggable 
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
            className="flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-xl p-3 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="text-stone-400 w-5 h-5 shrink-0" />
            <div className="flex-1 flex gap-4 items-center">
              {m.type === 'custom' ? (
                <input 
                  value={m.title} 
                  onChange={(e) => updateMenu(i, 'title', e.target.value)} 
                  className="font-bold bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                  placeholder={t("Tiêu Đề Menu")}
                />
              ) : (
                <div className="font-bold bg-stone-100 text-stone-600 border border-stone-200 rounded-lg px-3 py-1.5 text-sm cursor-not-allowed select-none">
                  {t(getMenuTitle(m))}
                </div>
              )}
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
                 {t("Hiển thị")}
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
      
      <div className="flex items-center gap-4 border-t border-stone-100 pt-6 mt-6">
        <button type="button" onClick={addCustomMenu} className="btn-white-glass-smoke px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.01] cursor-pointer">
          <Plus className="w-4 h-4 text-stone-500" /> {t("Thêm Menu Mới")}
        </button>
        <button type="button" onClick={handleSave} className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">
          {t("Lưu Menu")}
        </button>
      </div>
    </div>
  );
}


function AdminLayoutEdit({ data, t, onSave }: any) {
  const defaultSections = ['title', 'random_song', 'about', 'bio', 'vault', 'mv', 'spotify'];
  const rawSections = data.layoutSections && Array.isArray(data.layoutSections) ? data.layoutSections : defaultSections;
  const initialSections = Array.from(new Set(rawSections));
  if (!initialSections.includes('random_song')) {
    const titleIdx = initialSections.indexOf('title');
    if (titleIdx !== -1) {
      initialSections.splice(titleIdx + 1, 0, 'random_song');
    } else {
      initialSections.splice(1, 0, 'random_song');
    }
  }

  const [layoutSections, setLayoutSections] = useState<string[]>(initialSections);
  const [hiddenSections, setHiddenSections] = useState<string[]>(data.hiddenSections || []);
  const [includeDemoInRandomSong, setIncludeDemoInRandomSong] = useState<boolean>(data.includeDemoInRandomSong !== false);

  const toggleVisibility = (sec: string) => {
    if (sec === 'vault') return; // Kho Nhạc không được ẩn
    setHiddenSections(prev => 
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  const getSectionName = (sec: string) => {
    if (sec === 'title') return t("Tiêu Đề (Tên & Giới thiệu ngắn)");
    if (sec === 'random_song') return t("Bài Hát Ngẫu Nhiên");
    if (sec === 'about') return t("Về Tôi");
    if (sec === 'bio') return t("Tiểu Sử");
    if (sec === 'spotify') return t("Spotify Playlist / Album");
    if (sec === 'vault') return t("Kho Nhạc (Danh sách Đề mô / Ra Rồi)");
    if (sec === 'mv') return t("MV Đã Phát Hành (YouTube Videos)");
    return sec;
  };

  const handleDragStart = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: any, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;
    const newList = [...layoutSections];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    setLayoutSections(newList);
  };

  const handleSave = () => {
    onSave({ layoutSections, hiddenSections, includeDemoInRandomSong });
  };

  return (
    <div className="py-1">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-teal-600 animate-[pulse_2.5s_infinite]" />
            {t("Bố Cục Trang Chủ")}
          </h2>
          <p className="text-xs text-stone-500 mt-1">{t("Kéo thả các phần bên dưới để sắp xếp thứ tự hiển thị và tích chọn để bật/tắt hiển thị ở trang chủ nghệ sĩ.")}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {layoutSections.map((sec, i) => {
          const isHidden = hiddenSections.includes(sec);
          const isVault = sec === 'vault';
          return (
            <div 
              key={`l21892-${sec}-${i}`} 
              className={`flex flex-col border rounded-xl p-4 transition-all hover:shadow-sm select-none ${
                isHidden ? 'bg-stone-100/60 border-stone-200 opacity-60' : 'bg-stone-50 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                className="flex items-center gap-4 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="text-stone-400 w-5 h-5 shrink-0" />

                {/* Visibility Checkbox Tick */}
                <label 
                  className={`flex items-center gap-2.5 shrink-0 cursor-pointer ${isVault ? 'cursor-not-allowed opacity-90' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input 
                    type="checkbox" 
                    checked={isVault ? true : !isHidden}
                    disabled={isVault}
                    onChange={() => toggleVisibility(sec)}
                    className="w-4 h-4 rounded text-teal-600 border-stone-300 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isHidden ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                      {getSectionName(sec)}
                    </span>
                    {isVault && (
                      <span className="text-[10px] font-extrabold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {t("Bắt buộc")}
                      </span>
                    )}
                    {isHidden && !isVault && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {t("Đã ẩn")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {sec === 'title' && t("Phần hiển thị tên nghệ sĩ, dấu tích xanh và lời giới thiệu ngắn.")}
                    {sec === 'random_song' && t("Hiển thị thẻ bài hát ngẫu nhiên xoay tua linh hoạt.")}
                    {sec === 'about' && t("Phần giới thiệu bản thân, hình ảnh nghệ sĩ và thông tin nổi bật.")}
                    {sec === 'bio' && t("Phần tiểu sử âm nhạc, hành trình nghệ thuật và các cột mốc sự nghiệp.")}
                    {sec === 'spotify' && t("Khung phát nhạc nhúng trực tiếp từ Spotify (nếu được cấu hình).")}
                    {sec === 'vault' && t("Phần danh sách bài hát chính chia theo tab Đề mô / Ra Rồi (Bắt buộc hiển thị).")}
                    {sec === 'mv' && t("Phần hiển thị các MV Youtube đã phát hành và trình phát video popup.")}
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full bg-stone-200/80 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                  {i + 1}
                </div>
              </div>

              {sec === 'random_song' && (
                <div className="mt-3 pt-3 border-t border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-9 cursor-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      {t("Hiển thị demo trong bài hát ngẫu nhiên ?")}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {includeDemoInRandomSong ? t("Đang Bật - Bao gồm cả các bài Đề mô chưa phát hành") : t("Đang Tắt - Chỉ hiển thị các bài đã Ra Rồi (Phát hành chính thức)")}
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeDemoInRandomSong}
                    onClick={() => setIncludeDemoInRandomSong(prev => !prev)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      includeDemoInRandomSong ? 'bg-teal-600' : 'bg-stone-300'
                    }`}
                  >
                    <span className="sr-only">{t("Hiển thị demo trong bài hát ngẫu nhiên ?")}</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        includeDemoInRandomSong ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 border-t border-stone-100 pt-6 mt-6">
        <button 
          type="button" 
          onClick={handleSave} 
          className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer"
        >
          {t("Lưu Bố Cục")}
        </button>
      </div>
    </div>
  );
}


function BeautifulSelect({ 
  value, 
  onChange, 
  options, 
  isGoldTheme,
  isMusicianTheme,
  isDreamyTheme
}: { 
  value: number, 
  onChange: (val: number) => void, 
  options: number[], 
  isGoldTheme?: boolean,
  isMusicianTheme?: boolean,
  isDreamyTheme?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block z-30" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md transition-all duration-300 focus:outline-none text-xs sm:text-sm shadow-md rounded-xl px-3 py-1.5 border min-w-[60px] font-bold relative overflow-hidden ${
          isMusicianTheme
            ? 'border-amber-600/80 text-amber-100 hover:border-amber-400'
            : isDreamyTheme
              ? 'bg-white/95 border-2 border-rose-200 text-stone-900 font-extrabold hover:bg-rose-50 hover:border-rose-400 shadow-xs'
              : isGoldTheme 
                ? 'bg-[#FAF5E6] border-[#D4AF37] text-[#1A1303] hover:bg-white hover:border-[#AA7C11] hover:shadow-lg' 
                : 'bg-[#18181b]/95 border-white/20 text-white hover:bg-[#27272a]/95 hover:border-white/45'
        }`}
      >
        {isMusicianTheme && (
          <>
            <div className="absolute inset-0 z-0 css-wood-grain-dark" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/10 to-black/20" />
          </>
        )}
        <span className="relative z-[2] tabular-nums text-center">{value}</span>
        <svg 
          className={`w-3 h-3 transition-transform duration-200 relative z-[2] ${isOpen ? 'rotate-180' : ''} ${isMusicianTheme ? 'text-amber-400' : isDreamyTheme ? 'text-rose-500' : isGoldTheme ? 'text-[#AA7C11]' : 'text-neutral-400'}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute bottom-full left-0 mb-1.5 w-full min-w-[65px] rounded-xl shadow-2xl border backdrop-blur-lg overflow-hidden py-1 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isMusicianTheme
              ? 'border-amber-700/80 shadow-[0_8px_30px_rgba(0,0,0,0.9)] css-wood-grain-dark'
              : isDreamyTheme
                ? 'bg-white/95 border-2 border-rose-200 shadow-xl'
                : isGoldTheme 
                  ? 'bg-[#FAF5E6]/95 border-[#D4AF37] shadow-[0_8px_30px_rgba(170,124,17,0.2)]' 
                  : 'bg-[#18181b]/95 border-white/10 shadow-black/80'
          }`}
        >
          {options.map((opt, optIdx) => (
            <button
              key={`l21991-${opt}-${optIdx}`}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-center px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer tabular-nums ${
                opt === value
                  ? isMusicianTheme
                    ? 'bg-amber-600/40 text-amber-200 font-bold'
                    : isDreamyTheme
                      ? 'bg-rose-500 text-white font-black'
                      : isGoldTheme
                        ? 'bg-[#D4AF37]/20 text-[#1A1303] font-bold'
                        : 'bg-white/15 text-white font-bold'
                  : isMusicianTheme
                    ? 'text-amber-100/70 hover:bg-amber-800/40 hover:text-amber-100'
                    : isDreamyTheme
                      ? 'text-stone-800 font-bold hover:bg-rose-50 hover:text-rose-600'
                      : isGoldTheme
                        ? 'text-stone-600 hover:bg-[#D4AF37]/10 hover:text-[#1A1303]'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function PublicNavbar({ menus, activeTab, setActiveTab, t, isGoldTheme, isMusicianTheme, isDreamyTheme }: any) {
  const { landingConfig } = useContext(LanguageContext);
  if (!menus || menus.length === 0) return null;
  const visibleMenus = menus.filter((m: any) => m.isVisible);
  if (visibleMenus.length <= 1) return null;

  const getMenuTitle = (m: any) => {
    if (m.type === 'vault') return landingConfig?.menuVaultVi || "Kho Nhạc";
    if (m.type === 'about') return landingConfig?.menuAboutVi || "Về Tôi";
    if (m.type === 'bio') return landingConfig?.menuBioVi || "Tiểu Sử";
    return m.title;
  };

  return (
    <div className={`w-full max-w-5xl mx-auto px-6 sm:px-12 mb-12 flex items-center justify-center gap-6 sm:gap-10 border-b pb-4 ${isMusicianTheme ? 'border-amber-800/60' : isDreamyTheme ? 'border-purple-200/80' : isGoldTheme ? 'border-stone-200/60' : 'border-white/10'}`}>
      {visibleMenus.map((m: any, i: number) => (
        <button
          key={`l22034-${m.id || ''}-${i}`}
          onClick={() => {
            if (m.type === 'custom' && m.link) {
              window.open(m.link, '_blank');
            } else {
              setActiveTab(m.id);
              const typeToHash: Record<string, string> = { vault: '#music', about: '#about', bio: '#bio' };
              const newHash = typeToHash[m.type] || '';
              if (newHash) window.history.replaceState(null, '', newHash);
            }
          }}
          className={`font-bold transition-all relative text-sm sm:text-base ${
            activeTab === m.id 
              ? (isMusicianTheme ? 'text-amber-100 font-black scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : isDreamyTheme ? 'text-stone-950 font-black scale-102' : isGoldTheme ? 'text-[#AA7C11] font-black scale-102' : 'text-white') 
              : (isMusicianTheme ? 'text-amber-200/80 hover:text-amber-100 font-bold' : isDreamyTheme ? 'text-stone-700 hover:text-stone-950 font-bold' : isGoldTheme ? 'text-stone-500 hover:text-[#AA7C11]' : 'text-white/80 hover:text-white')
          }`}
        >
          {t(getMenuTitle(m))}
          {activeTab === m.id && (
            <motion.div layoutId="nav-indicator" className={`absolute -bottom-[17px] left-0 right-0 h-[2.5px] ${isMusicianTheme ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : isDreamyTheme ? 'bg-rose-500' : isGoldTheme ? 'bg-[#AA7C11]' : 'bg-emerald-500'}`} />
          )}
        </button>
      ))}
    </div>
  );
}

function PublicAboutView({ aboutMe, data, t, onGoToVault, isAdmin, artistExtension, isGoldTheme, isMusicianTheme, isDreamyTheme }: any) {
  if (!aboutMe) return null;
  
  const avatar = aboutMe.avatarUrl || data?.homeCoverUrl;
  const isLiquidGlassTheme = !isGoldTheme && !isMusicianTheme && !isDreamyTheme;
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full mx-auto backdrop-blur-2xl border rounded-[2.5rem] p-6 sm:p-10 mt-4 sm:mt-8 mb-20 relative z-10 max-w-6xl flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start overflow-hidden ${
      isMusicianTheme
        ? 'bg-gradient-to-br from-[#2D160B]/95 via-[#210E06]/95 to-[#160803]/98 border-amber-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-amber-50' 
        : isDreamyTheme 
          ? 'bg-slate-950/40 border-rose-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(244,63,94,0.2)] text-white' 
          : isGoldTheme 
            ? 'bg-gradient-to-br from-stone-900/95 via-amber-950/40 to-stone-900/95 border-amber-500/30 shadow-[0_8px_32px_0_rgba(251,191,36,0.2)] text-white' 
            : 'bg-slate-950/40 border-cyan-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(6,182,212,0.2)] text-white'
    }`}>
      {/* Background ambient lighting */}
      {isDreamyTheme && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-transparent pointer-events-none rounded-[2.5rem]" />
      )}
      {isMusicianTheme && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none rounded-[2.5rem]" />
      )}
      {isGoldTheme && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none rounded-[2.5rem]" />
      )}
      {isLiquidGlassTheme && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent pointer-events-none rounded-[2.5rem]" />
      )}

      {isAdmin && (
        <a href={getAdminLink('about')} className={`absolute top-6 right-6 p-3 ${isMusicianTheme ? 'bg-amber-900/60 text-amber-200 hover:bg-amber-800/80 hover:text-white' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'} rounded-full transition-colors z-20`} title={t("Chỉnh sửa")}>
          <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      )}

      {/* Left Side: Avatar floating */}
      {avatar && (
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-[16rem] sm:max-w-xs lg:max-w-[22rem] shrink-0 relative group mx-auto lg:mx-0 mt-2 lg:mt-0"
        >
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-tr ${isMusicianTheme ? 'from-amber-600 via-orange-500 to-amber-300' : isDreamyTheme ? 'from-rose-500 via-purple-500 to-pink-300' : isGoldTheme ? 'from-amber-600 via-yellow-500 to-amber-400' : 'from-cyan-500 via-teal-500 to-emerald-400'} rounded-[2.5rem] translate-x-4 translate-y-4 sm:translate-x-5 sm:translate-y-5 -z-10 opacity-70 blur-md group-hover:blur-lg transition-all duration-700`}
          ></motion.div>
          <motion.div 
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${isMusicianTheme ? 'from-orange-500 via-amber-400 to-yellow-300' : isDreamyTheme ? 'from-pink-500 via-rose-400 to-purple-300' : isGoldTheme ? 'from-yellow-600 via-amber-500 to-yellow-400' : 'from-teal-400 via-cyan-400 to-emerald-300'} rounded-[2.5rem] translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 -z-10 opacity-60`}
          ></motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/50 border border-white/20 shadow-2xl relative z-10"
          >
            <img src={avatar} alt="Profile" className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </motion.div>
      )}
      
      {/* Details */}
      <div className={`w-full ${avatar ? "lg:flex-1" : "max-w-3xl mx-auto"} flex flex-col justify-center space-y-1 sm:space-y-2 z-10 relative mt-6 lg:mt-0`}>
        <span className={`font-black text-xs sm:text-sm px-3.5 py-1 rounded-full tracking-widest uppercase inline-block text-center lg:text-left mb-2.5 border w-max mx-auto lg:mx-0 shadow-xs ${
          isMusicianTheme
            ? 'text-amber-300 bg-amber-950/80 border-amber-600/40'
            : isDreamyTheme
              ? 'text-rose-300 bg-rose-950/80 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
              : isGoldTheme
                ? 'text-amber-400 bg-amber-950/80 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
        }`}>
          {aboutMe.role || 'Profile Card'}
        </span>
        <h2 className={`text-[clamp(1.75rem,4vw,2.75rem)] font-black drop-shadow-md mb-4 sm:mb-6 leading-tight text-center lg:text-left break-words ${
          isMusicianTheme
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-orange-200'
            : isDreamyTheme
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200'
              : isGoldTheme
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200'
        }`}>
          {data?.artistName || t('Về Tôi') || 'Về Tôi'}
        </h2>
          
          {aboutMe.intro && (
            <div className={`mb-6 text-[clamp(0.925rem,3.5vw,1.2rem)] leading-relaxed whitespace-pre-line drop-shadow-sm font-medium ${
              isMusicianTheme
                ? 'text-amber-100/95'
                : isDreamyTheme
                  ? 'text-rose-100/95'
                  : isGoldTheme
                    ? 'text-stone-100'
                    : 'text-slate-100'
            }`}>
              {aboutMe.intro}
            </div>
          )}
          
          <div className="space-y-3 mb-6 text-lg">
            {aboutMe.realName && <InfoField label={t("Tên Thật") || "Tên Thật"} value={aboutMe.realName} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
            {aboutMe.dob && <InfoField label={t("Ngày Sinh") || "Ngày Sinh"} value={aboutMe.dob} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
            {aboutMe.address && <InfoField label={t("Đến Từ") || "Đến Từ"} value={aboutMe.address} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
            {aboutMe.company && <InfoField label={t("Sinh Sống") || "Sinh Sống"} value={aboutMe.company} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
            {aboutMe.email && <InfoField label={t("Email") || "Email"} value={aboutMe.email} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
            {aboutMe.phone && <InfoField label={t("SĐT") || "SĐT"} value={aboutMe.phone} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {data?.socialFacebook && (
               <a href={formatSocialLink(data.socialFacebook, 'fb')} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
               </a>
            )}
            {data?.socialYoutube && (
               <a href={formatSocialLink(data.socialYoutube, 'yt')} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#FF0000] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
               </a>
            )}
            {data?.socialTiktok && (
               <a href={formatSocialLink(data.socialTiktok, 'tk')} target="_blank" rel="noreferrer" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.39.81-4.78 2.62-6.19 1.83-1.47 4.31-1.84 6.54-1.16l-.1 4.18c-1.3-.23-2.67-.18-3.79.52-1.07.69-1.67 1.92-1.57 3.18.11 1.4 1.16 2.61 2.53 2.94 1.34.33 2.82.02 3.86-.88.94-.8 1.4-2.01 1.43-3.26.04-4.8.01-9.61.02-14.41z"/></svg>
               </a>
            )}
            {data?.socialInstagram && (
               <a href={formatSocialLink(data.socialInstagram, 'ig')} target="_blank" rel="noreferrer" className="w-10 h-10 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform overflow-hidden" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
               </a>
            )}
            {data?.socialSoundcloud && (
               <a href={formatSocialLink(data.socialSoundcloud, 'sc')} target="_blank" rel="noreferrer" className="w-10 h-10 bg-[#ff5500] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.758 15.864V8.895c.27-.058.536-.089.8-.089.704 0 1.258.219 1.663.655.405.436.608 1.054.608 1.854v4.549h-3.071zm9.896-1.503c0 1.139-.395 2.112-1.187 2.918-.792.807-1.748 1.21-2.868 1.21H15.11v-7.616c0-.987-.272-1.792-.816-2.414-.544-.622-1.267-.933-2.171-.933-.427 0-.822.062-1.186.187v-1.12c0-.521-.141-1.042-.423-1.564-.282-.522-.72-1.002-1.314-1.441-1.116-.838-2.39-1.258-3.82-1.258-1.517 0-2.809.537-3.879 1.611-1.07 1.074-1.605 2.366-1.605 3.875 0 .204.015.421.044.653-.787.218-1.439.638-1.956 1.26-.518.622-.777 1.348-.777 2.179 0 .91.319 1.685.956 2.325.637.639 1.411.959 2.322.959h10.963c.691 0 1.285-.245 1.78-.735.495-.49.743-1.082.743-1.776z"/></svg>
               </a>
            )}
          </div>
          
          <div className="flex justify-end pt-8 mt-auto w-full">
             <motion.button 
                animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                onClick={onGoToVault} 
                className={`bg-[length:200%_100%] font-bold py-3 px-10 rounded-full transition-all hover:scale-105 active:scale-95 text-lg cursor-pointer border ${
                  isMusicianTheme
                    ? 'bg-[linear-gradient(110deg,#d97706,45%,#fef08a,55%,#d97706)] text-stone-950 border-amber-400/50 hover:shadow-[0_8px_20px_rgba(217,119,6,0.5)] font-black'
                    : isDreamyTheme
                      ? 'bg-[linear-gradient(110deg,#e11d48,45%,#fbcfe8,55%,#e11d48)] text-white border-rose-400/50 hover:shadow-[0_8px_20px_rgba(225,29,72,0.5)] font-black'
                      : isGoldTheme 
                        ? 'bg-[linear-gradient(110deg,#f59e0b,45%,#fef08a,55%,#f59e0b)] text-stone-950 border-yellow-400/50 hover:shadow-[0_8px_20px_rgba(245,158,11,0.5)] font-black' 
                        : 'bg-[linear-gradient(110deg,#06b6d4,45%,#a5f3fc,55%,#06b6d4)] text-stone-950 border-cyan-400/50 hover:shadow-[0_8px_20px_rgba(6,182,212,0.5)] font-black'
                }`}
             >
                {t("Kho Nhạc")}
             </motion.button>
          </div>
        </div>
    </motion.div>
  );
}

function InfoField({ label, value, isMusicianTheme, isDreamyTheme, isGoldTheme }: { label: string, value: string, isMusicianTheme?: boolean, isDreamyTheme?: boolean, isGoldTheme?: boolean }) {
  return (
    <div className="flex items-center font-medium text-[clamp(0.85rem,3.5vw,1.125rem)] w-full py-0.5">
      <span className={`font-bold w-[35%] max-w-[160px] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis ${
        isMusicianTheme
          ? 'text-amber-300/90'
          : isDreamyTheme
            ? 'text-rose-200/90'
            : isGoldTheme
              ? 'text-amber-300/90'
              : 'text-cyan-200/90'
      }`}>{label}</span>
      <span className={`mx-1 sm:mx-2 shrink-0 font-bold ${
        isMusicianTheme ? 'text-amber-500' : isDreamyTheme ? 'text-rose-400' : isGoldTheme ? 'text-amber-400' : 'text-cyan-400'
      }`}>:</span>
      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-extrabold text-white drop-shadow-xs">{value}</span>
    </div>
  );
}

function PublicBioView({ biography, t, isAdmin, artistExtension, isGoldTheme, isMusicianTheme, isDreamyTheme }: any) {
  if (!biography) return null;
  
  const hasEdu = biography.education?.length > 0;
  const hasExp = biography.experience?.length > 0;
  
  if (!hasEdu && !hasExp) return null;
  const isLiquidGlassTheme = !isGoldTheme && !isMusicianTheme && !isDreamyTheme;
  
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`w-full mx-auto mt-4 sm:mt-8 mb-20 relative z-10 px-4 sm:px-8 lg:px-12 backdrop-blur-2xl border rounded-[2.5rem] py-12 max-w-7xl overflow-hidden ${
      hasEdu && hasExp ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16' : 'flex flex-col'
    } ${
      isMusicianTheme
        ? 'bg-gradient-to-br from-[#2D160B]/95 via-[#210E06]/95 to-[#160803]/98 border-amber-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-amber-50' 
        : isDreamyTheme 
          ? 'bg-slate-950/40 border-rose-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(244,63,94,0.2)] text-white' 
          : isGoldTheme 
            ? 'bg-gradient-to-br from-stone-900/95 via-amber-950/40 to-stone-900/95 border-amber-500/30 shadow-[0_8px_32px_0_rgba(251,191,36,0.2)] text-white' 
            : 'bg-slate-950/40 border-cyan-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(6,182,212,0.2)] text-white'
    }`}>
      {/* Background ambient lighting */}
      {isDreamyTheme && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-transparent pointer-events-none rounded-[2.5rem]" />
      )}
      {isMusicianTheme && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none rounded-[2.5rem]" />
      )}
      {isGoldTheme && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none rounded-[2.5rem]" />
      )}
      {isLiquidGlassTheme && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent pointer-events-none rounded-[2.5rem]" />
      )}

      {isAdmin && (
        <a href={getAdminLink('bio')} className={`absolute top-6 right-6 p-3 ${isMusicianTheme ? 'bg-amber-900/60 text-amber-200 hover:bg-amber-800/80 hover:text-white' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'} rounded-full transition-colors z-20`} title={t("Chỉnh sửa")}>
          <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      )}
      {hasEdu && (
        <div className="w-full relative z-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-8 sm:mb-10 tracking-tight flex items-center justify-start pl-4 sm:pl-6 lg:pl-8 ${
            isMusicianTheme
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400'
              : isDreamyTheme
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-300'
                : isGoldTheme
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-300'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-300'
          }`}>
            {t('Học Vấn') || 'Học Vấn'}
          </h2>
          <div className="space-y-8 relative">
            <motion.div 
              initial={{ height: 0 }} 
              whileInView={{ height: '100%' }} 
              viewport={{ once: true }} 
              transition={{ duration: 1.5, ease: 'easeOut' }} 
              className={`absolute top-0 bottom-0 left-0 -translate-x-px w-0.5 ${
                isMusicianTheme ? 'bg-amber-500/50' : isDreamyTheme ? 'bg-rose-500/50' : isGoldTheme ? 'bg-amber-500/50' : 'bg-cyan-500/50'
              } origin-top z-0`} 
            />
            {biography.education.map((item: any, idx: number) => (
              <TimelineItem key={`l22207-idx-19-${idx}`} item={item} isSplit={true} color="emerald" index={idx} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />
            ))}
          </div>
        </div>
      )}
      
      {hasExp && (
        <div className="w-full relative z-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-8 sm:mb-10 tracking-tight flex items-center justify-start pl-4 sm:pl-6 lg:pl-8 ${
            isMusicianTheme
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400'
              : isDreamyTheme
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-pink-300'
                : isGoldTheme
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-300'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-300'
          }`}>
            {t('Kinh nghiệm') || 'Kinh nghiệm'}
          </h2>
          <div className="space-y-8 relative">
            <motion.div 
              initial={{ height: 0 }} 
              whileInView={{ height: '100%' }} 
              viewport={{ once: true }} 
              transition={{ duration: 1.5, ease: 'easeOut' }} 
              className={`absolute top-0 bottom-0 left-0 -translate-x-px w-0.5 ${
                isMusicianTheme ? 'bg-amber-500/50' : isDreamyTheme ? 'bg-rose-500/50' : isGoldTheme ? 'bg-amber-500/50' : 'bg-cyan-500/50'
              } origin-top z-0`} 
            />
            {biography.experience.map((item: any, idx: number) => (
              <TimelineItem key={`l22227-idx-20-${idx}`} item={item} isSplit={true} color="blue" index={idx} isMusicianTheme={isMusicianTheme} isDreamyTheme={isDreamyTheme} isGoldTheme={isGoldTheme} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TimelineItem({ item, isSplit = false, color = "emerald", index = 0, isMusicianTheme = false, isDreamyTheme = false, isGoldTheme = false }: { item: any, isSplit?: boolean, color?: "emerald" | "blue", key?: number | string, index?: number, isMusicianTheme?: boolean, isDreamyTheme?: boolean, isGoldTheme?: boolean }) {
  const isEmerald = color === "emerald";
  const [isImgOpen, setIsImgOpen] = useState(false);
  
  // Resolve multiple images from data
  const images = useMemo(() => {
    if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      return item.imageUrls.filter(Boolean);
    }
    return item.imageUrl ? [item.imageUrl] : [];
  }, [item.imageUrls, item.imageUrl]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeModalIdx, setActiveModalIdx] = useState(0);

  // Outer slideshow (auto transition 3s)
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Open modal handler
  const handleOpenModal = () => {
    setActiveModalIdx(activeImgIdx);
    setIsImgOpen(true);
  };

  // Modal manual control with timer reset
  const handlePrev = (e: any) => {
    e.stopPropagation();
    setActiveModalIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: any) => {
    e.stopPropagation();
    setActiveModalIdx((prev) => (prev + 1) % images.length);
  };

  // Modal auto transition (auto transition 3s)
  useEffect(() => {
    if (!isImgOpen || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveModalIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isImgOpen, images.length, activeModalIdx]); // reset timer on activeModalIdx change

  const hasImages = images.length > 0;

  return (
    <>
      <div className={`relative flex items-start justify-between md:justify-normal ${!isSplit ? 'md:odd:flex-row-reverse' : ''} group is-active cursor-default`}>
        {/* Timeline dot */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.3, type: 'spring' }}
          className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white/90 backdrop-blur-md ${
            isMusicianTheme
              ? 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.6)]'
              : isDreamyTheme
                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : isGoldTheme
                  ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
          } text-white shadow-md shrink-0 relative z-10 ${!isSplit ? 'md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2' : '-ml-3 sm:-ml-[14px] mt-1 sm:mt-0.5'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isEmerald ? (
              <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>
            ) : (
              <><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
            )}
          </svg>
        </motion.div>
        
        {/* Content box */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.4, duration: 0.5, ease: 'easeOut' }}
          className={`flex-1 pt-0 pb-8 transition-colors ${!isSplit ? 'md:flex-none md:w-[calc(50%-2.5rem)] text-left md:group-odd:text-right' : 'ml-2 sm:ml-3'} relative flex flex-row items-start justify-between gap-0 sm:gap-2 md:gap-0 p-4 -mt-4 rounded-xl hover:bg-white/5 hover:scale-[1.02] duration-300 group`}
        >
          {/* Text content - dynamically adjust width based on hasImages */}
          <div className={`${hasImages ? 'w-[85%] md:w-[85%] lg:w-[82%] md:pr-6' : 'w-full'} relative z-0`}>
            <div className={`flex flex-col mb-1 ${!isSplit && hasImages ? 'md:group-odd:items-end' : ''}`}>
              <div className="mb-2">
                <span className={`text-xs sm:text-sm font-extrabold inline-block px-3 py-1.5 rounded-lg border transition-all duration-300 shadow-sm ${
                  isMusicianTheme 
                    ? 'text-amber-300 border-amber-600/40 bg-amber-950/80' 
                    : isDreamyTheme 
                      ? 'text-rose-300 border-rose-500/40 bg-rose-950/80 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                      : isGoldTheme
                        ? 'text-amber-300 border-amber-500/40 bg-amber-950/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'text-cyan-300 border-cyan-500/40 bg-cyan-950/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                }`}>{item.time}</span>
              </div>
              <h3 className="font-black text-white drop-shadow-sm text-base sm:text-lg leading-snug">{item.title}</h3>
            </div>
            {/* Auto-detect bullet points/lists and render with proper indentation */}
            <div className="space-y-2 mt-2">
              {item.description ? item.description.split('\n').map((line: string, idx: number) => {
                const trimmed = line.trim();
                const bulletMatch = trimmed.match(/^([-*+•–—]|\d+[.)])\s*(.*)/);
                if (bulletMatch) {
                  const bullet = bulletMatch[1];
                  const content = bulletMatch[2];
                  const isNumber = /^\d+/.test(bullet);
                  return (
                    <div key={`l22334-idx-21-${idx}`} className={`flex items-start gap-2.5 pl-3 text-sm leading-relaxed ${
                      isMusicianTheme ? 'text-amber-100/90 font-medium' : isDreamyTheme ? 'text-rose-100/90 font-medium' : 'text-slate-200 font-medium'
                    }`}>
                      <span className={`shrink-0 select-none ${isNumber ? 'font-bold text-xs mt-0.5' : 'text-base -mt-0.5'} ${
                        isMusicianTheme ? 'text-amber-400' : isDreamyTheme ? 'text-rose-400' : isGoldTheme ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {isNumber ? bullet : '•'}
                      </span>
                      <span className="flex-1">{content}</span>
                    </div>
                  );
                }
                return (
                  <p key={`l22343-idx-22-${idx}`} className={`text-sm leading-relaxed min-h-[1rem] ${
                    isMusicianTheme ? 'text-amber-100/90 font-medium' : isDreamyTheme ? 'text-rose-100/90 font-medium' : 'text-slate-200 font-medium'
                  }`}>
                    {line}
                  </p>
                );
              }) : null}
            </div>
          </div>

          {/* Image Container */}
          {hasImages && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: !isSplit ? [-2, 3, -1, 2, -2] : [2, -3, 1, -2, 2] }}
              viewport={{ once: true }}
              transition={{ 
                opacity: { delay: index * 0.3 + 0.6, duration: 0.6 },
                scale: { delay: index * 0.3 + 0.6, duration: 0.6 },
                rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
              }}
              style={{ transformOrigin: 'top center' }}
              className={`shrink-0 absolute top-0 -right-2 sm:-right-4 md:-right-10 bg-[#fdfbf7] p-1 pb-3 sm:p-1.5 sm:pb-5 shadow-[2px_4px_15px_rgba(0,0,0,0.15)] border border-stone-200/80 rounded-sm cursor-pointer hover:z-20 hover:scale-105 transition-all z-10 ${!isSplit ? 'md:group-odd:left-auto md:group-odd:right-auto md:group-odd:-left-10 lg:group-odd:-left-12' : ''}`}
              onClick={handleOpenModal}
            >
              {/* Tape effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-3 sm:h-4 bg-white/60 backdrop-blur-sm shadow-sm rotate-[4deg] z-10 border border-white/40"></div>
              
              {/* Image with preserved aspect ratio */}
              <div className="w-14 sm:w-20 md:w-24 flex items-center justify-center overflow-hidden bg-stone-50 rounded-sm relative" style={{aspectRatio: "1/1"}}>
                {images.map((imgUrl, idx) => {
                  const isActive = idx === activeImgIdx;
                  return (
                    <img
                      key={"timeline-img-" + idx}
                      src={imgUrl}
                      className={`absolute inset-0 w-full h-full object-contain rounded-sm border border-stone-100 transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                      alt={item.title}
                    />
                  );
                })}
              </div>

              {/* Indicator dots for multiple images on miniature Polaroid */}
              {images.length > 1 && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 pointer-events-none">
                  {images.map((_, i) => (
                    <div 
                      key={`l22383-i-${i}`} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${i === activeImgIdx ? 'bg-amber-500 scale-125' : 'bg-stone-300'}`} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal Zoom Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isImgOpen && (
            <motion.div key="img-open"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-md" 
              onClick={() => setIsImgOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20, rotate: -2 }} 
                animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20, rotate: 2 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative inline-flex flex-col bg-[#fdfbf7] p-3 sm:p-5 pb-5 sm:pb-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-stone-200/90 rounded-sm cursor-auto max-w-[95vw] sm:max-w-[90vw]" 
                onClick={e => e.stopPropagation()}
              >
                {/* Tape effect */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-5 sm:h-7 bg-white/70 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 border border-white/50"></div>
                
                {/* Close Button */}
                <div className="absolute -top-4 -right-4 z-30">
                  <button 
                    type="button" 
                    onClick={() => setIsImgOpen(false)} 
                    className="text-stone-500 hover:text-stone-800 transition-colors p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-full shadow-md cursor-pointer"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Slideshow Display Section */}
                <div className="relative flex items-center justify-center overflow-hidden border border-stone-200/50 bg-stone-50/50 p-1 rounded-sm max-w-[85vw] max-h-[65vh] md:max-w-[65vw] md:max-h-[65vh]">
                  {/* Left Arrow Button */}
                  {images.length > 1 && (
                    <button 
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md backdrop-blur-xs transition-all duration-200 cursor-pointer active:scale-95"
                      title="Quay lại"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Right Arrow Button */}
                  {images.length > 1 && (
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md backdrop-blur-xs transition-all duration-200 cursor-pointer active:scale-95"
                      title="Tiếp theo"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Image with preserved aspect ratio */}
                  <div className="relative inline-block leading-none">
                    <img 
                      src={images[activeModalIdx]} 
                      className="max-w-[80vw] max-h-[60vh] md:max-w-[60vw] md:max-h-[60vh] min-w-[200px] min-h-[200px] object-contain shadow-xs cursor-pointer select-none" 
                      alt={item.title} 
                      onClick={() => setIsImgOpen(false)} 
                    />
                    
                    {/* Vintage Date Overlay */}
                    <div 
                      className="absolute bottom-3 sm:bottom-5 left-4 sm:left-6 z-10 text-[#ffb800] text-[14px] sm:text-2xl font-bold tracking-widest opacity-90 pointer-events-none select-none" 
                      style={{ 
                        fontFamily: '"Courier New", Courier, monospace', 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>

                {/* Dots indicator for multiple images in Modal */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3 select-none">
                    {images.map((_, i) => (
                      <button
                        key={`l22480-i-${i}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalIdx(i);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeModalIdx ? 'bg-amber-500 scale-125' : 'bg-stone-300 hover:bg-stone-400'} cursor-pointer`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Handwriting Caption */}
                <div className="w-full px-2 mt-3 sm:mt-4 text-center flex items-center justify-center select-none">
                  <h3 className="text-sm sm:text-xl text-stone-800 font-medium italic -rotate-1 line-clamp-2 leading-tight px-1 max-w-full">
                    {item.title} {images.length > 1 && <span className="text-stone-400 font-sans font-light not-italic text-xs sm:text-sm ml-1">({activeModalIdx + 1}/{images.length})</span>}
                  </h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}



// [CODE-SPLIT] Admin components moved to src/AdminModule.tsx
