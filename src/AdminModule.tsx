// AdminModule.tsx - Admin components extracted from App.tsx for code splitting
import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { UserCircle, BookOpen, User, Settings, Play, Pause, Music, Lock, Unlock, ArrowLeft, ArrowRight, Upload, Disc3, Plus, Trash2, Edit3, Globe, Camera, X, FileAudio, Share2, ListMusic, List, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Facebook, Instagram, Youtube, GripVertical, LogOut, ChevronRight, RefreshCw, Monitor, Home as HomeIcon, PanelLeftClose, PanelLeftOpen, Eye, EyeOff, FileText, Sparkles, Copy, ExternalLink, Database, BadgeCheck, Search, Download, FolderDown, RotateCcw, Image, MessageSquare, Bell, Send, AlertCircle, AlertTriangle, CheckCircle, Info, Check, ChevronLeft, ChevronDown, Menu, Palette, LayoutTemplate, Award, History, HelpCircle, Paintbrush, CheckCircle2, XCircle, ShieldCheck, LogIn, Calendar } from "lucide-react";
import { toPng } from "html-to-image";
import { AppData, DemoSong, TemplateConfig, Achievement } from "./types";
import { useAdminTranslation, LanguageContext, translations } from "./i18n";
import { formatShareUrl, getThumbUrl, handleImageError, getArtistExtensionFromUrl, getAdminLink, getArtistLink, getArtistFullUrl, getAdminToken, setAdminToken, removeAdminToken, copyToClipboard, getGlobalCookie, sanitizePlaylistPassword, resolveUploadUrl, getAudioPlayUrl, isArtistContext, getActiveAdminSession, setGlobalCookie, removeGlobalCookie, getAdminTokenKey } from "./utils/shared";
import { uploadGlobal, compressImageInBrowser, compressImageToJPG, formatFileName } from "./utils/adminUtils";
import { getArtistSubdomainUrl, getPlatformDomain, formatPlatformText } from "./utils/platform";
import { Portal, MarqueeText, MarqueeTitle, LanguageSwitcher, PasswordInput, DemoPlayer, getGlobalShowConfirm, setGlobalShowConfirm } from "./App";
import { ChorusLogo } from "./components/ChorusLogo";
import { getYoutubeId } from "./components/SmartYouTubePlayer";
export function AdminDashboard() {
  const { t } = useAdminTranslation();
  const location = useLocation();
  const [data, setData] = useState<AppData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const getSongCoverUrl = (songUrlOrObj?: string | any, thumbUrl?: string) => {
    if (typeof songUrlOrObj === 'object' && songUrlOrObj !== null) {
      return songUrlOrObj.thumbUrl || songUrlOrObj.coverUrl || songUrlOrObj.imageUrl || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
    }
    return thumbUrl || songUrlOrObj || data?.aboutMe?.avatarUrl || data?.homeCoverUrl || '';
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initialUrlState = getAdminTabAndSubtabFromPath(window.location.pathname, window.location.search, window.location.hash);
  const [activeTab, setActiveTab] = useState<'demos'|'playlists'|'profile'|'about'|'bio'|'menus'|'socials'|'security'|'templates'|'database'|'reposts'|'tickets'|'layout'|'vouchers'|'admin_theme'>(
    initialUrlState.tab as any
  );
  const [demosSubTab, setDemosSubTab] = useState<'released' | 'demos' | 'drafts' | 'playlists' | 'trash' | 'landing_pages' | 'brands'>(
    initialUrlState.subtab as any
  );

  const navigate = useNavigate();

  const isDemosActive = activeTab === 'demos' && demosSubTab !== 'playlists';
  const isPlaylistActive = activeTab === 'demos' && demosSubTab === 'playlists';
  const isTemplatesActive = activeTab === 'templates';
  const isRepostsActive = activeTab === 'reposts';
  const isTicketsActive = activeTab === 'tickets';
  const isProfileActive = activeTab === 'profile';
  const isSocialsActive = activeTab === 'socials';
  const isSecurityActive = activeTab === 'security';
  const isAboutActive = activeTab === 'about';
  const isBioActive = activeTab === 'bio';
  const isMenusActive = activeTab === 'menus';
  const isLayoutActive = activeTab === 'layout';

  // Sync state when location changes (e.g. Browser Back/Forward navigation)
  useEffect(() => {
    const { tab, subtab } = getAdminTabAndSubtabFromPath(location.pathname, location.search, location.hash);
    if (tab && tab !== activeTab) setActiveTab(tab as any);
    if (subtab && subtab !== demosSubTab) setDemosSubTab(subtab as any);
  }, [location.pathname, location.search, location.hash]);

  // Sync browser URL with activeTab & demosSubTab state without reloading component
  useEffect(() => {
    let targetPath = '/admin/songs';
    if (activeTab === 'demos') {
      if (demosSubTab === 'playlists') {
        targetPath = '/admin/playlists';
      } else if (demosSubTab && demosSubTab !== 'released') {
        targetPath = `/admin/${demosSubTab}`;
      } else {
        targetPath = '/admin/songs';
      }
    } else {
      targetPath = `/admin/${activeTab}`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [activeTab, demosSubTab]);
  
  // Chorus Repost & Ticket States
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipBillingCycle, setMembershipBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [otherSongs, setOtherSongs] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [themeSelectError, setThemeSelectError] = useState<string | null>(null);
  
  // General Feedback Popup State
  const [showCreateFeedbackModal, setShowCreateFeedbackModal] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'account'>('bug');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Create Playlist Modal State
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const [defaultLang, setDefaultLang] = useState('vi');
  useEffect(() => {
    if (data?.defaultLanguage) {
      setDefaultLang(data.defaultLanguage);
    }
  }, [data?.defaultLanguage]);

  const getTicketTypeStyle = (type: string) => {
    switch (type) {
      case 'remove':
        return { label: t("Yêu cầu gỡ"), className: 'bg-red-50 text-red-600 border border-red-100' };
      case 'edit':
        return { label: t("Yêu cầu sửa"), className: 'bg-amber-50 text-amber-600 border border-amber-100' };
      case 'bug':
        return { label: t("Báo Lỗi"), className: 'bg-rose-50 text-rose-600 border border-rose-100' };
      case 'feature':
        return { label: t("Góp ý tính năng"), className: 'bg-purple-50 text-purple-650 border border-purple-100' };
      case 'account':
        return { label: t("Báo cáo tài khoản"), className: 'bg-slate-100 text-slate-700 border border-slate-200' };
      default:
        return { label: type || t("Khác"), className: 'bg-stone-50 text-stone-600 border border-stone-150' };
    }
  };
  
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
  const [publicPricing, setPublicPricing] = useState<any>(null);
  const [publicFeatures, setPublicFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/pricing')
      .then(res => res.json())
      .then(data => { if (data && !data.error) setPublicPricing(data); })
      .catch(() => {});

    fetch('/api/public/features')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPublicFeatures(data); })
      .catch(() => {});
  }, []);
  const [showBrandBrief, setShowBrandBrief] = useState(false);
  const [showBrandVideos, setShowBrandVideos] = useState(false);
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
        setExternalError(dataRes.error || t("Có lỗi xảy ra khi kiểm tra bài hát!"));
      } else {
        setExternalSuccess(t("Thêm bài hát đăng lại ngoài thành công!"));
        setExternalUrl('');
        // Refresh other songs
        await fetchOtherSongs();
        setTimeout(() => setShowExternalUrlInput(false), 2000);
      }
    } catch (err: any) {
      setExternalError(t("Lỗi kết nối: ") + err.message);
    } finally {
      setIsCheckingExternalUrl(false);
    }
  };

  const handleRemoveExternalRepost = async (id: string) => {
    if (!(await showConfirm(t("Bạn có chắc chắn muốn xóa bài hát ngoài này khỏi danh sách Đăng lại?"), t("Xác nhận xóa đăng lại"), 'danger'))) return;
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
        await showConfirm(dataRes.error || t("Lỗi khi xóa bài hát ngoài!"), t("Lỗi"), 'alert');
      }
    } catch (err: any) {
      await showConfirm(t("Lỗi kết nối: ") + err.message, t("Lỗi"), 'alert');
    }
  };

  const handleTranslateAll = async () => {
    if (!(await showConfirm(t("Hệ thống sẽ tự động sử dụng AI (Gemini) để dịch tất cả thông tin hồ sơ, tiêu đề, mô tả, các đề mô (tên, lyrics, tác giả, ca sĩ) và danh sách phát sang 5 ngôn ngữ khác (Anh, Hàn, Nhật, Thái, Trung). Quá trình này có thể mất khoảng 5-10 giây. Bạn có muốn tiếp tục?"), t("Tự động dịch thuật"), 'confirm'))) {
      return;
    }
    
    setIsTranslatingAll(true);
    try {
      const res = await fetch('/api/admin/translate-all', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          const dataRes = await fetch('/api/admin/data', {
            headers: { 'Authorization': `Bearer ${getAdminToken() || ''}`, 'x-artist-extension': getArtistExtensionFromUrl() }
          });
          if (dataRes.ok) {
            setData(await dataRes.json());
          }
        }
        await showConfirm(t("Dịch thuật thành công! Toàn bộ thông tin hồ sơ và danh sách nhạc đã được dịch sang tất cả ngôn ngữ."), t("Thành công"), 'success');
      } else {
        const errData = await res.json();
        await showConfirm(errData.error || t("Có lỗi xảy ra khi dịch thuật!"), t("Lỗi"), 'alert');
      }
    } catch (err: any) {
      await showConfirm(t("Lỗi kết nối: ") + err.message, t("Lỗi"), 'alert');
    } finally {
      setIsTranslatingAll(false);
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
        setToast(t("Đã gửi báo cáo thành công!"));
        setReportSong(null);
        setReportDesc('');
        fetchTickets();
      } else {
        const err = await res.json();
        setToast(`Lỗi: ${err.error || t("Gửi báo cáo thất bại")}`);
      }
    } catch (e: any) {
      setToast(`Lỗi: ${e.message}`);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackDesc.trim()) {
      setToast(t("Vui lòng điền đầy đủ tiêu đề và mô tả!"));
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/admin/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({
          songId: 'feedback',
          songTitle: feedbackTitle.trim(),
          sourceArtist: 'system',
          type: feedbackType,
          description: feedbackDesc.trim()
        })
      });
      if (res.ok) {
        setToast(t("Đã gửi feedback thành công!"));
        setShowCreateFeedbackModal(false);
        setFeedbackTitle('');
        setFeedbackDesc('');
        setFeedbackType('bug');
        fetchTickets();
      } else {
        const err = await res.json();
        setToast(`Lỗi: ${err.error || t("Gửi feedback thất bại")}`);
      }
    } catch (e: any) {
      setToast(`Lỗi: ${e.message}`);
    } finally {
      setIsSubmittingFeedback(false);
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
        setToast(`Không thể gửi tin nhắn: ${errorData.error || t("Lỗi không xác định")}`);
      }
    } catch (e: any) {
      console.error("Exception sending message:", e);
      setToast(`Đã xảy ra lỗi: ${e.message}`);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: t("Mở lại yêu cầu"),
      message: t("Bạn có chắc chắn muốn mở lại ticket này không?"),
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
            setToast(t("Đã mở lại ticket thành công!"));
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
      title: t("Từ chối yêu cầu"),
      message: t("Bạn có chắc chắn muốn từ chối yêu cầu và đóng ticket này?"),
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
            setToast(t("Đã đóng ticket thành công!"));
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
        setToast(t("Đã đóng ticket thành công!"));
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminRemoveSong = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: t("Xác nhận gỡ bài"),
      message: t("Bạn có chắc chắn gỡ bài hát này khỏi trang của mình theo yêu cầu của đối tác không?"),
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
            setToast(t("Đã ra quyết định gỡ bài hát và đóng ticket!"));
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
        setToast(t("Đã ra quyết định gỡ bài hát và đóng ticket!"));
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
    onCancel?: () => void;
    isAlertOnly?: boolean;
    type?: 'confirm' | 'alert' | 'error' | 'success' | 'danger';
  } | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const showConfirm = (message: string, title = t("Xác nhận"), type: 'confirm' | 'danger' | 'success' | 'alert' = 'confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setActionConfirm({
        isOpen: true,
        title,
        message,
        isAlertOnly: type === 'alert',
        type,
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });
  };

  useEffect(() => {
    setGlobalShowConfirm(showConfirm);
    return () => {
      setGlobalShowConfirm(null);
    };
  }, []);
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
  const [adminEmail, setAdminEmail] = useState('');
  const [adminEmailError, setAdminEmailError] = useState('');
  const [adminEmailSuccess, setAdminEmailSuccess] = useState('');

  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminPassError, setAdminPassError] = useState('');
  const [adminPassSuccess, setAdminPassSuccess] = useState('');

  const [memberPassInput, setMemberPassInput] = useState('');
  const [memberPassError, setMemberPassError] = useState('');
  const [memberPassSuccess, setMemberPassSuccess] = useState('');
  
  const [isPCPreviewMode, setIsPCPreviewMode] = useState(false);
  const showFullBleed = isPCPreviewMode && (activeTab === 'demos' || activeTab === 'templates');
  const effectiveSidebarCollapsed = isSidebarCollapsed || showFullBleed;

  useEffect(() => {
    setCurrentPage(1);
  }, [demosSubTab]);

  const loadData = () => {
    setDataError(null);
    fetch('/api/admin/data', {
      headers: {
        'x-artist-extension': getArtistExtensionFromUrl(),
        'Authorization': `Bearer ${getAdminToken() || ''}`
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            removeAdminToken();
            window.location.href = getAdminLink();
            throw new Error('Unauthorized');
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(resData => {
        if (resData && !resData.error) {
          setData(resData);
          if (resData.customDomain) setCustomDomain(resData.customDomain);
          if (resData.slideshowImages) setSlideshowImages(resData.slideshowImages);
          if (resData.homeCoverUrl) setHomeCoverUrlPreview(resData.homeCoverUrl);
          if (resData.faviconUrl) setFaviconUrlPreview(resData.faviconUrl);
          if (resData.ogImageUrl) setOgImageUrlPreview(resData.ogImageUrl);
          if (resData.memberPassword) setMemberPassInput(resData.memberPassword);
          if (resData.email) setAdminEmail(resData.email);
        } else {
          setDataError(resData?.error || t("Không thể tải thông tin quản trị!"));
        }
      })
      .catch(err => {
        console.error(t("Lỗi tải thông tin quản trị:"), err);
        setDataError(err.message || t("Lỗi kết nối máy chủ!"));
      });
  };

  useEffect(() => { loadData(); }, []);

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  // getThumbUrl is now a global function (top-level)

  const uploadWithProgress = async (file: File, setProgress: (p: number) => void): Promise<{url: string, thumbUrl: string}> => {
    const fileToUpload = (file.type && file.type.startsWith('image/')) ? await compressImageInBrowser(file) : file;
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
          resolve({ url: res.url, thumbUrl: res.thumbUrl || res.url });
        } else {
          let msg = 'Tải ảnh lên thất bại!';
          try {
            const errRes = JSON.parse(xhr.responseText);
            if (errRes.message || errRes.error) msg = errRes.message || errRes.error;
          } catch(e) {}
          if (xhr.status === 401) {
            msg = 'Phiên đăng nhập Admin đã hết hạn (Lỗi 401 Unauthorized). Vui lòng đăng nhập lại!';
          }
          reject(new Error(msg));
        }
      };
      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải tệp lên!'));
      xhr.send(formData);
    });
  };

  const handleShare = async (slugOrId: string) => {
    let url = getArtistFullUrl('/song/' + slugOrId);
    url = formatShareUrl(url);
    await copyToClipboard(url);
    setToast(t("Đã copy link!"));
    setTimeout(() => setToast(''), 3000);
  };

  const handleShareSecret = async (demoItem: any) => {
    let url = getArtistFullUrl('/song/' + (demoItem.slug || demoItem.id));
    url = formatShareUrl(url);
    url += `?secret=${demoItem.secretKey}`;
    await copyToClipboard(url);
    setToast(t("Đã copy Secret Link!"));
    setTimeout(() => setToast(''), 3000);
  };

  const handleShareAdminPlaylist = async (playlistId: string) => {
    let url = getArtistFullUrl('/playlist/' + playlistId);
    url = formatShareUrl(url);
    await copyToClipboard(url);
    setToast(t("Đã copy link playlist!"));
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
    setToast(type === 'song' ? t("Đã di chuyển bài hát vào Thùng rác!") : t("Đã di chuyển playlist vào Thùng rác!"));
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
          setToast(t("Đã tạo bản sao thành công! Đang chuyển hướng..."));
          setTimeout(() => {
            setToast('');
            navigate(getAdminLink(`/edit/${newDemo.id}`));
          }, 1000);
       } else {
          alert(t("Lỗi khi duplicate bản ghi."));
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
    
    setToast(type === 'song' ? t("Đã khôi phục bài hát!") : t("Đã khôi phục playlist!"));
    setTimeout(() => setToast(''), 3000);
    loadData();
  };

  const handleCancelRequest = async (type: 'name' | 'username' | 'extension') => {
    if (!(await showConfirm(t("Bạn có chắc muốn hủy yêu cầu này?"), t("Xác nhận hủy yêu cầu")))) return;
    try {
      // Optimistically clear the pending status so the inputs unlock immediately
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pendingNameChange: type === 'name' ? undefined : prev.pendingNameChange,
          pendingUsernameChange: type === 'username' ? undefined : prev.pendingUsernameChange,
          pendingExtensionChange: type === 'extension' ? undefined : prev.pendingExtensionChange
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
        setToast(t("Đã hủy yêu cầu!"));
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

  const handleCustomSave = async (payload: any) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedData = await res.json();
        setData(updatedData);
        setToast(t("Đã lưu thông tin thành công!"));
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast(t("Lỗi khi lưu thông tin!"));
        setTimeout(() => setToast(''), 3000);
      }
    } catch (e) {
      setToast(t("Lỗi kết nối máy chủ!"));
      setTimeout(() => setToast(''), 3000);
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
          extension: payload.extension,
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
          tab3Name: payload.tab3Name,
          defaultLanguage: payload.defaultLanguage
        }),
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        setData(updatedData);
        setToast(t("Đã lưu thông tin thành công!"));
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast(t("Lỗi khi lưu thông tin!"));
        setTimeout(() => setToast(''), 3000);
      }
    } catch (error) {
      setToast(t("Lỗi kết nối máy chủ!"));
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError('');
    setAdminPassSuccess('');

    if (!oldAdminPass || !newAdminPass || !confirmAdminPass) {
      setAdminPassError(t("Vui lòng điền đầy đủ các trường!"));
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setAdminPassError(t("Xác nhận mật khẩu mới không khớp!"));
      return;
    }
    if (newAdminPass.length < 4) {
      setAdminPassError(t("Mật khẩu mới phải từ 4 ký tự trở lên!"));
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
        setAdminPassSuccess(t("Đổi mật khẩu quản trị thành công!"));
        setOldAdminPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
        setToast(t("Đổi mật khẩu quản trị thành công!"));
        setTimeout(() => setToast(''), 3000);
      } else {
        setAdminPassError(resData.error || t("Đã có lỗi xảy ra!"));
      }
    } catch (err) {
      setAdminPassError(t("Lỗi kết nối máy chủ!"));
    }
  };

  const handleAdminEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminEmailError('');
    setAdminEmailSuccess('');
    
    if (!adminEmail) {
      setAdminEmailError(t("Vui lòng nhập địa chỉ email!"));
      return;
    }
    
    try {
      const res = await fetch('/api/admin/change-email', {
        method: 'POST',
        headers: {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken() || ''}`
        },
        body: JSON.stringify({ email: adminEmail })
      });
      const resData = await res.json();
      
      if (res.ok) {
        setAdminEmail(resData.email);
        setAdminEmailSuccess(t("Cập nhật email thành công!"));
        setToast(t("Cập nhật email thành công!"));
        setTimeout(() => setToast(''), 3000);
      } else {
        setAdminEmailError(resData.error || t("Đã có lỗi xảy ra!"));
      }
    } catch (err) {
      setAdminEmailError(t("Lỗi kết nối máy chủ!"));
    }
  };

  const handleMemberPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberPassError('');
    setMemberPassSuccess('');

    if (!memberPassInput || memberPassInput.length < 4) {
      setMemberPassError(t("Mật khẩu thành viên tối thiểu phải từ 4 ký tự!"));
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
        setMemberPassSuccess(t("Cập nhật mật khẩu thành viên thành công!"));
        setToast(t("Đã cập nhật mật khẩu thành viên!"));
        setTimeout(() => setToast(''), 3000);
        loadData();
      } else {
        setMemberPassError(resData.error || t("Đã có lỗi xảy ra!"));
      }
    } catch (err) {
      setMemberPassError(t("Lỗi kết nối máy chủ!"));
    }
  };

  if (dataError) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-950/40 border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">!</div>
          <h2 className="text-xl font-bold mb-2">{t("Không thể tải bảng quản trị")}</h2>
          <p className="text-stone-400 text-sm mb-6">{dataError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => loadData()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
            >
              {t("Thử lại")}
            </button>
            <button
              onClick={() => { removeAdminToken(); window.location.href = getAdminLink(); }}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-sm transition-all border border-stone-700 cursor-pointer"
            >
              {t("Đăng nhập lại")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <LoadingScreen text={t("Đang tải AdminCP...")} />;

  const userRole = (data.roles || []).find((r: any) => String(r.id || r.name).toLowerCase() === String(data.roleId || '').toLowerCase());
  const effectiveTheme = data.adminTheme || userRole?.defaultTheme || 'liquid-glass';
  const isGoldTheme = effectiveTheme === 'gold';

  return (
    <div className={`min-h-screen font-sans relative transition-all duration-500 ${isGoldTheme ? 'bg-[#FAF6F0] text-stone-900' : 'bg-stone-100 text-stone-900'}`}>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl font-bold z-50 animate-[bounce_1s_ease-in-out]">
          {toast}
        </div>
      )}

      {/* Modal So sánh Gói Thành Viên */}
      <AnimatePresence>
        {showMembershipModal && (
          <div key="membership-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-stone-200 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-4xl relative max-h-[90vh] flex flex-col justify-between"
            >
              <button
                onClick={() => setShowMembershipModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 mb-1 flex items-center gap-2">
                      <Award className="w-6 h-6 text-amber-500" />
                      {t("So Sánh Gói Thành Viên")}
                    </h3>
                    <p className="text-xs text-stone-500">{t("Xem và so sánh quyền lợi giữa các gói thành viên của bạn.")}</p>
                  </div>

                  {/* Billing Cycle Switcher: Hàng Tháng / Theo Năm */}
                  <div className="inline-flex items-center p-1.5 rounded-full border-2 border-neutral-300 bg-neutral-200/60 shadow-inner gap-1 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setMembershipBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                        membershipBillingCycle === 'monthly'
                          ? 'bg-neutral-900 text-white shadow-md'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-300/60'
                      }`}
                    >
                      {t('Hàng Tháng')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMembershipBillingCycle('yearly')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                        membershipBillingCycle === 'yearly'
                          ? 'bg-neutral-900 text-white shadow-md'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-300/60'
                      }`}
                    >
                      <span>{t('Theo Năm')}</span>
                      {(() => {
                        const proM = Number(publicPricing?.pro?.monthlySalePrice || 99000);
                        const proY = Number(publicPricing?.pro?.yearlySalePrice || 890000);
                        const maxSavings = proM > 0 && proY > 0 ? Math.max(0, Math.round((1 - proY / (proM * 12)) * 100)) : 25;
                        return (
                          <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                            {t(`TIẾT KIỆM TỚI ${maxSavings}%`)}
                          </span>
                        );
                      })()}
                    </button>
                  </div>
                </div>

                {/* Grid of plans dynamically synced with publicPricing and publicFeatures */}
                {(() => {
                  const getPriceInfo = (id: string) => {
                    if (id === 'free') {
                      return { sale: t('Miễn Phí'), orig: '', period: '', savings: 0 };
                    }
                    const tier = publicPricing?.[id] || {};
                    const isYearly = membershipBillingCycle === 'yearly';
                    const origVal = isYearly ? Number(tier.yearlyOriginalPrice || 0) : Number(tier.monthlyOriginalPrice || 0);
                    const saleVal = isYearly ? Number(tier.yearlySalePrice || 0) : Number(tier.monthlySalePrice || 0);
                    const mSale = Number(tier.monthlySalePrice || 0);
                    const ySale = Number(tier.yearlySalePrice || 0);
                    const savingsPct = (mSale * 12) > 0 && ySale > 0 ? Math.max(0, Math.round((1 - ySale / (mSale * 12)) * 100)) : 0;
                    
                    const fmt = (num: number) => num > 0 ? `${num.toLocaleString('vi-VN')}đ` : '';
                    let defaultSale = id === 'pro' ? (isYearly ? '890.000đ' : '99.000đ') : (isYearly ? '1.990.000đ' : '249.000đ');

                    return {
                      sale: saleVal > 0 ? fmt(saleVal) : defaultSale,
                      orig: origVal > saleVal ? fmt(origVal) : '',
                      period: isYearly ? '/năm' : '/tháng',
                      savings: isYearly ? savingsPct : 0
                    };
                  };

                  const buildTierFeatures = (tierId: 'free' | 'pro' | 'vip', defaults: { text: string; active: boolean }[]) => {
                    if (Array.isArray(publicFeatures) && publicFeatures.length > 0) {
                      return publicFeatures.map(f => {
                        const isCheck = tierId === 'free' ? !!f.free : tierId === 'pro' ? !!f.pro : !!f.vip;
                        const customText = tierId === 'free' ? f.freeText : tierId === 'pro' ? f.proText : f.vipText;
                        const text = (customText && customText.trim()) ? customText : f.name;
                        return { text, active: isCheck };
                      });
                    }
                    return defaults;
                  };

                  const membershipTiers = [
                    {
                      id: 'free',
                      name: t('Gói Miễn Phí'),
                      priceInfo: getPriceInfo('free'),
                      cardBorder: 'border-stone-200 bg-stone-50/50',
                      badgeStyle: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
                      badgeText: t('CƠ BẢN'),
                      features: buildTierFeatures('free', [
                        { text: 'Số Bài Hát Tối Đa: 5', active: true },
                        { text: 'Giao Diện Kho Nhạc: 1', active: true },
                        { text: 'Template Chủ Đề Tiêu Chuẩn', active: true },
                        { text: 'Backup 24/7', active: true },
                        { text: 'Trang tiểu sử (Bio)', active: false },
                        { text: 'Mật khẩu bảo vệ Demo & Kho nhạc', active: false },
                        { text: 'Tạo đường dẫn chia sẻ bí mật', active: false },
                        { text: 'Tùy chỉnh tên miền riêng', active: false },
                        { text: 'Template Độc Quyền', active: false },
                        { text: 'Hỗ trợ ưu tiên 1:1', active: false },
                      ])
                    },
                    {
                      id: 'pro',
                      name: t('Gói Pro'),
                      priceInfo: getPriceInfo('pro'),
                      cardBorder: 'border-purple-300 bg-purple-50/30',
                      badgeStyle: 'bg-purple-600 text-white shadow-sm',
                      badgeText: t('PHỔ BIẾN NHẤT'),
                      features: buildTierFeatures('pro', [
                        { text: 'Số Bài Hát Tối Đa: 50', active: true },
                        { text: 'Giao Diện Kho Nhạc: Đầy đủ Pro', active: true },
                        { text: 'Template Chủ Đề Tiêu Chuẩn', active: true },
                        { text: 'Backup 24/7', active: true },
                        { text: 'Trang tiểu sử (Bio)', active: true },
                        { text: 'Mật khẩu bảo vệ Demo & Kho nhạc', active: true },
                        { text: 'Tạo đường dẫn chia sẻ bí mật', active: true },
                        { text: 'Tùy chỉnh tên miền riêng', active: false },
                        { text: 'Template Độc Quyền', active: false },
                        { text: 'Hỗ trợ ưu tiên 1:1', active: false },
                      ])
                    },
                    {
                      id: 'vip',
                      name: t('Gói VIP'),
                      priceInfo: getPriceInfo('vip'),
                      cardBorder: 'border-amber-300 bg-amber-50/40',
                      badgeStyle: 'bg-amber-100 text-amber-800 border border-amber-300 font-black',
                      badgeText: t('ĐỘC QUYỀN VIP'),
                      features: buildTierFeatures('vip', [
                        { text: 'Số Bài Hát: KHÔNG GIỚI HẠN', active: true },
                        { text: 'Giao Diện Kho Nhạc: Không giới hạn', active: true },
                        { text: 'Template Chủ Đề (Bao gồm VIP)', active: true },
                        { text: 'Backup 24/7', active: true },
                        { text: 'Trang tiểu sử (Bio)', active: true },
                        { text: 'Mật khẩu bảo vệ Demo & Kho nhạc', active: true },
                        { text: 'Tạo đường dẫn chia sẻ bí mật', active: true },
                        { text: 'Tùy chỉnh tên miền riêng', active: true },
                        { text: 'Template Độc Quyền', active: true },
                        { text: 'Hỗ trợ ưu tiên 1:1', active: true },
                      ])
                    }
                  ];

                  const currentRole = String((data as any)?.roleId || (data as any)?.role || '').toLowerCase();

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[60vh] overflow-y-auto pr-1 pt-3">
                      {membershipTiers.map((tier) => {
                        const userTierIndex = (currentRole === 'vip' || (data as any)?.isSpecial || (data as any)?.isMasterAdmin) ? 2 :
                                              (currentRole === 'pro' || currentRole === 'member') ? 1 : 0;
                        const tierIndex = tier.id === 'free' ? 0 : tier.id === 'pro' ? 1 : 2;
                        const isActive = userTierIndex === tierIndex;
                        const isUpgrade = userTierIndex < tierIndex;
                        const isDowngrade = userTierIndex > tierIndex;

                        let buttonLabel = '';
                        if (isActive) {
                          buttonLabel = t('Gói Của Bạn');
                        } else if (isUpgrade) {
                          buttonLabel = t('Nâng Cấp');
                        } else if (isDowngrade) {
                          buttonLabel = t('Hạ Cấp');
                        } else {
                          buttonLabel = t('Đăng Ký Ngay');
                        }

                        return (
                          <div
                            key={tier.id}
                            className={`border-2 p-5 rounded-3xl flex flex-col justify-between transition-all relative ${
                              isActive
                                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/30 shadow-md'
                                : tier.cardBorder
                            }`}
                          >
                            {isActive && (
                              <span className="absolute -top-3.5 right-4 bg-emerald-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-20">
                                {t("Gói Của Bạn")}
                              </span>
                            )}
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${tier.badgeStyle}`}>
                                  {tier.badgeText}
                                </span>
                                {tier.priceInfo.savings > 0 && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                    -{tier.priceInfo.savings}%
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-stone-900 text-lg mb-1">{tier.name}</h4>
                              <div className="flex items-baseline gap-1.5 mb-4 flex-wrap">
                                {tier.priceInfo.orig && (
                                  <span className="text-sm font-bold text-stone-400 line-through">
                                    {tier.priceInfo.orig}
                                  </span>
                                )}
                                <span className="text-2xl font-black text-stone-900">
                                  {tier.priceInfo.sale}
                                </span>
                                {tier.priceInfo.period && <span className="text-xs text-stone-500 font-bold">{tier.priceInfo.period}</span>}
                              </div>
                              <button 
                                type="button" 
                                className={`w-full py-2.5 rounded-xl font-bold text-xs mb-5 transition-all ${
                                  isActive
                                    ? 'bg-emerald-600 text-white shadow-md cursor-default'
                                    : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer shadow-sm active:scale-[0.98]'
                                }`}
                                onClick={() => {
                                   if (!isActive) {
                                      setToast(`Vui lòng đăng ký nâng cấp gói tại trang chủ!`);
                                      setTimeout(() => setToast(''), 3000);
                                   }
                                }}
                              >
                                {buttonLabel}
                              </button>

                              {/* Features list dynamically from featuresMatrix */}
                              <ul className="space-y-2 text-xs">
                                {tier.features.map((feat, idx) => (
                                  <li key={`feat-${tier.id}-${idx}`} className={`flex items-start gap-2 ${feat.active ? 'text-stone-800 font-medium' : 'text-stone-400 line-through opacity-60'}`}>
                                    {feat.active ? (
                                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                                    ) : (
                                      <XCircle className="w-4 h-4 shrink-0 text-stone-300 mt-0.5" />
                                    )}
                                    <span>{feat.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-stone-200/60 mt-6 pt-4 flex justify-end">
                <button
                  onClick={() => setShowMembershipModal(false)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t("Đóng")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Lịch sử Kích Hoạt */}
      <AnimatePresence>
        {showHistoryModal && (
          <div key="history-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-stone-200 shadow-2xl rounded-3xl p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-stone-900 mb-2 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                {t("Lịch Sử Kích Hoạt & Nâng Cấp")}
              </h3>
              <p className="text-xs text-stone-500 mb-6">{t("Thông tin ngày đăng ký kích hoạt tài khoản và lịch sử thay đổi gói dịch vụ.")}</p>

              {/* Timeline list */}
              <div className="space-y-6 relative before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-stone-200/80">
                {/* 1. Ngày kích hoạt thành viên */}
                <div className="flex gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shrink-0 z-10">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm">{t("Kích Hoạt Thành Viên")}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {t("Ngày kích hoạt:")}{" "}
                      <strong className="text-stone-800">
                        {data?.activatedAt 
                          ? new Date(data.activatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : (data?.createdAt 
                              ? new Date(data.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                              : '16/07/2026')}
                      </strong>
                    </p>
                    <span className="inline-block text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-2 uppercase tracking-wide">
                      {t("Hoạt động")}
                    </span>
                  </div>
                </div>

                {/* 2. Ngày nâng cấp gói */}
                <div className="flex gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0 z-10">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-[pulse_2s_infinite]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm">{t("Nâng Cấp Gói")}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {t("Ngày cập nhật gói gần nhất:")}{" "}
                      <strong className="text-stone-800">
                        {data?.roleUpgradedAt 
                          ? new Date(data.roleUpgradedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : t("Chưa nâng cấp")}
                      </strong>
                    </p>
                    {(() => {
                    const roleIdStr = String(data?.roleId || 'free').toLowerCase();
                    const isVip = roleIdStr === 'vip';
                    const isPro = roleIdStr === 'pro' || roleIdStr === 'chuyên nghiệp' || roleIdStr === 'gói chuyên nghiệp';
                    let badgeClasses = "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border inline-block mt-2 ";
                    if (isVip) {
                      badgeClasses += "bg-gradient-to-r from-yellow-200 to-amber-300 text-amber-900 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-[pulse_2s_infinite]";
                    } else if (isPro) {
                      badgeClasses += "text-emerald-700 bg-emerald-100 border-emerald-300";
                    } else {
                      badgeClasses += "text-indigo-600 bg-indigo-50 border-indigo-100";
                    }
                    const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                    return <span className={badgeClasses}>{matchedRole ? matchedRole.name : (data?.roleId || 'Thành viên')}</span>;
                  })()}
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200/60 mt-6 pt-4 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t("Đóng")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className={`sticky top-0 z-[100] transition-all duration-500 ${isGoldTheme ? 'bg-white/80 backdrop-blur-md border-b border-amber-200/60 text-amber-950 shadow-xs shadow-amber-500/5' : 'bg-white border-b border-stone-200 shadow-xs'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 w-full flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 select-none shrink-0">
            <ChorusLogo className="w-9 h-9 shrink-0" />
            <div className="hidden md:flex items-baseline mt-0.5">
              <span className={`font-sans font-black tracking-tight text-xl leading-none ${isGoldTheme ? 'bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent font-black drop-shadow-[0_1px_2px_rgba(245,158,11,0.2)]' : 'text-stone-950'}`}>Chorus</span>
              <span className={`font-serif italic font-light text-xl leading-none ${isGoldTheme ? 'text-amber-600' : 'text-stone-400'}`}>.vn</span>
              <span className={`ml-2 font-mono text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-xs ${isGoldTheme ? 'text-amber-800 bg-amber-100/70 border border-amber-200' : 'text-stone-500 bg-stone-100 border border-stone-200/60'}`}>Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LanguageSwitcher isRelative={true} />
            {data?.activated !== false && (
              <Link 
                to={getArtistLink("/help")} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
                title={t("Trợ giúp / Quản lý tài khoản")}
              >
                <HelpCircle className="w-4 h-4 stroke-[2]" />
              </Link>
            )}
            {(() => {
              const artistExt = data?.artistExtension || data?.extension || data?.username || (typeof localStorage !== 'undefined' ? localStorage.getItem('activeAdminExtension') : null) || getGlobalCookie('activeAdminExtension') || getArtistExtensionFromUrl();
              const host = window.location.hostname.replace(/^www\./, '').toLowerCase().trim();
              const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
              let targetUrl = '/';
              if (artistExt && !isLocal && (host === 'chorus.vn' || host.endsWith('.chorus.vn'))) {
                targetUrl = `https://${artistExt}.chorus.vn/`;
              } else if (artistExt) {
                targetUrl = `/${artistExt}`;
              }
              const isExternal = targetUrl.startsWith('http');
              if (isExternal) {
                return (
                  <a 
                    href={targetUrl} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
                    title={t("Trang chủ nghệ sĩ")}
                    id="admin-top-home-btn"
                  >
                    <HomeIcon className="w-4 h-4 stroke-[2]" />
                  </a>
                );
              }
              return (
                <Link 
                  to={targetUrl} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-all duration-300 animate-[fade-in_0.3s_ease-out]"
                  title={t("Trang chủ nghệ sĩ")}
                  id="admin-top-home-btn"
                >
                  <HomeIcon className="w-4 h-4 stroke-[2]" />
                </Link>
              );
            })()}
            <button 
              onClick={handleLogoutAdmin}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm transition-all duration-300 cursor-pointer animate-[fade-in_0.3s_ease-out]"
              title={t("Đăng xuất")}
              id="admin-top-logout-btn"
            >
              <LogOut className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      <div className={`mx-auto ${showFullBleed ? 'w-full px-0 py-0 flex-1 flex overflow-hidden' : 'w-full px-4 md:px-6 py-4 flex flex-col md:flex-row gap-5'}`}>
        <aside className={`${
          effectiveSidebarCollapsed 
            ? (showFullBleed 
                ? `flex flex-col w-16 shrink-0 py-4 items-center space-y-4 relative shadow-xs border-r ${isGoldTheme ? 'bg-white border-amber-200/30 text-amber-900' : 'bg-white border-stone-200 text-stone-900'}` 
                : `hidden md:flex flex-col w-16 shrink-0 py-4 items-center space-y-4 relative shadow-xs border-r ${isGoldTheme ? 'bg-white border-amber-200/30 text-amber-900' : 'bg-white border-stone-200 text-stone-900'}`)
            : `w-full md:w-64 shrink-0 flex flex-col md:sticky md:top-[88px] self-start relative md:rounded-[2rem] md:p-5 md:backdrop-blur-md md:gap-5 ${
                isGoldTheme 
                  ? 'md:bg-white md:border md:border-amber-200/60 md:shadow-[0_8px_30px_rgba(245,158,11,0.06)] text-amber-900' 
                  : 'md:bg-white md:border md:border-stone-200/60 md:shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-stone-900'
              }`
        }`}>
          {/* Mobile Header Menu Card with Animated Active Icon & Dropdown (Mobile Only) */}
          <div className="md:hidden w-full bg-white border border-stone-200 rounded-2xl p-3 shadow-xs relative mb-3 z-30">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Selected Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer select-none shrink-0 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Dynamic Active Section Animated Icon */}
                  <div className="shrink-0 flex items-center justify-center">
                    {activeTab === 'demos' && demosSubTab !== 'playlists' && (
                      <motion.div animate={{ y: [-0.8, 0.8, -0.8], x: [-0.4, 0.4, -0.4] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}>
                        <Disc3 className="w-4.5 h-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.65)] animate-[spin_4s_linear_infinite]" />
                      </motion.div>
                    )}
                    {activeTab === 'demos' && demosSubTab === 'playlists' && (
                      <motion.div animate={{ rotate: [-5, 5, -5], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
                        <ListMusic className="w-4.5 h-4.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'templates' && (
                      <motion.div animate={{ rotate: [-5, 5, -5], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                        <Palette className="w-4.5 h-4.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'reposts' && (
                      <motion.div animate={{ rotate: [-6, 6, -6], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
                        <Repeat className="w-4.5 h-4.5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'profile' && (
                      <motion.div animate={{ rotate: [-6, 6, -6], y: [-0.8, 0.8, -0.8] }} transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}>
                        <Settings className="w-4.5 h-4.5 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'layout' && (
                      <motion.div animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <LayoutTemplate className="w-4.5 h-4.5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'about' && (
                      <motion.div animate={{ rotate: [-6, 6, -6], y: [-0.8, 0.8, -0.8] }} transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}>
                        <UserCircle className="w-4.5 h-4.5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'bio' && (
                      <motion.div animate={{ rotate: [-6, 6, -6], y: [-0.8, 0.8, -0.8] }} transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}>
                        <BookOpen className="w-4.5 h-4.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'menus' && (
                      <motion.div animate={{ rotate: [-6, 6, -6], y: [-0.8, 0.8, -0.8] }} transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}>
                        <List className="w-4.5 h-4.5 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'tickets' && (
                      <motion.div animate={{ rotate: [-5, 5, -5], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}>
                        <MessageSquare className="w-4.5 h-4.5 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'admin_theme' && (
                      <motion.div animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Paintbrush className="w-4.5 h-4.5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]" />
                      </motion.div>
                    )}
                    {activeTab === 'vouchers' && (
                      <Award className="w-4.5 h-4.5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]" />
                    )}
                    {activeTab === 'security' && (
                      <Lock className="w-4.5 h-4.5 text-stone-400" />
                    )}
                  </div>

                  {/* Main section title - strictly main category name */}
                  <span className="truncate text-white font-black text-xs sm:text-sm">
                    {activeTab === 'demos' && demosSubTab !== 'playlists' ? t("Kho Nhạc") :
                     activeTab === 'demos' && demosSubTab === 'playlists' ? t("Playlist") :
                     activeTab === 'templates' ? t("Chủ Đề") :
                     activeTab === 'reposts' ? t("Đăng lại") :
                     activeTab === 'profile' ? t("Trang Chủ") :
                     activeTab === 'layout' ? t("Bố Cục") :
                     activeTab === 'about' ? t("Về Tôi") :
                     activeTab === 'bio' ? t("Tiểu Sử") :
                     activeTab === 'menus' ? t("Danh Mục") :
                     activeTab === 'tickets' ? t("Hộp thư") :
                     activeTab === 'admin_theme' ? t("Giao Diện") :
                     activeTab === 'vouchers' ? t("Voucher") :
                     activeTab === 'security' ? t("Bảo Mật & Email") :
                     t("Kho Nhạc")}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ml-0.5 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Right: Compact Artist Profile Header */}
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <span className="text-xs sm:text-sm font-black text-stone-850 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px]">
                  {data?.artistName || 'Nghệ Sĩ'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={`w-9 h-9 rounded-full overflow-hidden border shrink-0 shadow-xs cursor-pointer transition-all ${previewAvatar !== null ? 'border-amber-400 ring-2 ring-amber-300/50 animate-[pulse_1.5s_ease-in-out_infinite]' : 'border-stone-200'}`}
                  title={t("Về Tôi")}
                >
                  <img
                    src={getThumbUrl((previewAvatar !== null ? previewAvatar : (data?.aboutMe?.avatarUrl || data?.homeCoverUrl)) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80")}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>

            {/* Mobile Navigation Dropdown Menu Panel */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden flex flex-col gap-1"
                >
                  {/* Item 1: Kho Nhạc */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('demos'); setDemosSubTab('released'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'demos' && demosSubTab !== 'playlists' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Disc3 className={`w-4.5 h-4.5 animate-[spin_4s_linear_infinite] ${activeTab === 'demos' && demosSubTab !== 'playlists' ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{t("Kho Nhạc")}</span>
                  </button>

                  {/* Item 2: Playlist */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('demos'); setDemosSubTab('playlists'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'demos' && demosSubTab === 'playlists' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <ListMusic className={`w-4.5 h-4.5 ${activeTab === 'demos' && demosSubTab === 'playlists' ? 'text-emerald-400' : 'text-stone-400'}`} />
                    <span>{t("Playlist")}</span>
                  </button>

                  {/* Item 3: Chủ Đề */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('templates'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'templates' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Palette className={`w-4.5 h-4.5 ${activeTab === 'templates' ? 'text-cyan-400' : 'text-stone-400'}`} />
                    <span>{t("Chủ Đề")}</span>
                  </button>

                  {/* Item 4: Đăng lại */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('reposts'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'reposts' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Repeat className={`w-4.5 h-4.5 ${activeTab === 'reposts' ? 'text-sky-400' : 'text-stone-400'}`} />
                      <span>{t("Đăng lại")}</span>
                    </div>
                    {otherSongs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">{otherSongs.length}</span>
                    )}
                  </button>

                  {/* Item 5: Trang Chủ */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'profile' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Settings className={`w-4.5 h-4.5 ${activeTab === 'profile' ? 'text-teal-400' : 'text-stone-400'}`} />
                    <span>{t("Trang Chủ")}</span>
                  </button>

                  {/* Item 6: Bố Cục */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('layout'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'layout' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <LayoutTemplate className={`w-4.5 h-4.5 ${activeTab === 'layout' ? 'text-yellow-400' : 'text-stone-400'}`} />
                    <span>{t("Bố Cục")}</span>
                  </button>

                  {/* Item 7: Về Tôi */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'about' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <UserCircle className={`w-4.5 h-4.5 ${activeTab === 'about' ? 'text-violet-400' : 'text-stone-400'}`} />
                    <span>{t("Về Tôi")}</span>
                  </button>

                  {/* Item 8: Tiểu Sử */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('bio'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'bio' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <BookOpen className={`w-4.5 h-4.5 ${activeTab === 'bio' ? 'text-cyan-400' : 'text-stone-400'}`} />
                    <span>{t("Tiểu Sử")}</span>
                  </button>

                  {/* Item 9: Danh Mục */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('menus'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'menus' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <List className={`w-4.5 h-4.5 ${activeTab === 'menus' ? 'text-teal-400' : 'text-stone-400'}`} />
                    <span>{t("Danh Mục")}</span>
                  </button>

                  {/* Item 10: Hộp thư */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('tickets'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'tickets' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className={`w-4.5 h-4.5 ${activeTab === 'tickets' ? 'text-rose-400' : 'text-stone-400'}`} />
                      <span>{t("Hộp thư")}</span>
                    </div>
                    {bellCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">{bellCount}</span>
                    )}
                  </button>

                  {/* Item 11: Giao Diện */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('admin_theme'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'admin_theme' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Paintbrush className={`w-4.5 h-4.5 ${activeTab === 'admin_theme' ? 'text-yellow-400' : 'text-stone-400'}`} />
                    <span>{t("Giao Diện")}</span>
                  </button>

                  {/* Item 12: Voucher */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('vouchers'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-left transition-all ${
                      activeTab === 'vouchers' ? 'bg-stone-900 text-white font-black' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Award className={`w-4.5 h-4.5 ${activeTab === 'vouchers' ? 'text-yellow-400' : 'text-stone-400'}`} />
                    <span>{t("Voucher")}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Account Info & Menu Sidebar (Desktop Only) */}
          <div className="hidden md:flex flex-col w-full gap-5">
          {/* Khung Tài Khoản */}
          {!effectiveSidebarCollapsed && (
            <div className={`rounded-2xl p-4 relative group select-none ${isGoldTheme ? 'bg-amber-50/50 border border-amber-200 text-amber-900' : 'bg-stone-50 border border-stone-200/80'}`}>
              <div className="flex flex-col items-center text-center">
                <div className={`relative w-16 h-16 mb-2 rounded-full overflow-hidden border shadow-sm cursor-pointer group/avatar transition-all ${previewAvatar !== null ? 'border-amber-400 ring-2 ring-amber-300/50 animate-[pulse_1.5s_ease-in-out_infinite]' : 'border-stone-200'}`}>
                  <img
                    src={getThumbUrl((previewAvatar !== null ? previewAvatar : (data?.aboutMe?.avatarUrl || data?.homeCoverUrl)) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80")}
                    alt="Artist Avatar"
                    className="w-full h-full object-cover transition-all group-hover/avatar:brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  {/* Nút đổi ava hiện ra khi rê chuột */}
                  <button
                    onClick={() => setActiveTab('about')}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 text-[10px] font-bold"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Đổi ảnh</span>
                  </button>
                </div>

                <h4 className={`text-sm font-black leading-tight ${isGoldTheme ? 'text-amber-950' : 'text-stone-900'}`}>
                  {data?.artistName || 'Nghệ Sĩ'}
                </h4>
                
                {(() => {
                    const roleIdStr = String(data?.roleId || 'free').toLowerCase();
                    const isVip = roleIdStr === 'vip';
                    const isPro = roleIdStr === 'pro' || roleIdStr === 'chuyên nghiệp' || roleIdStr === 'gói chuyên nghiệp';
                    let badgeClasses = "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border inline-block mt-1.5 ";
                    if (isVip) {
                      badgeClasses += "bg-gradient-to-r from-yellow-200 to-amber-300 text-amber-900 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-[pulse_2s_infinite]";
                    } else if (isPro) {
                      badgeClasses += "text-emerald-700 bg-emerald-100 border-emerald-300";
                    } else {
                      badgeClasses += "text-indigo-600 bg-indigo-50 border-indigo-100";
                    }
                    const matchedRole = (data as any)?.roles?.find((r: any) => r.id === data?.roleId || r.name === data?.roleId);
                    return <span className={badgeClasses}>{matchedRole ? matchedRole.name : (data?.roleId || t("Thành viên"))}</span>;
                  })()}

                {/* Gói Thành Viên & Lịch Sử & Bảo Mật Links */}
                <div className={`w-full border-t mt-4 pt-3 flex flex-col gap-2.5 text-xs font-bold ${isGoldTheme ? 'border-amber-200/60 text-amber-800' : 'border-stone-200/60 text-stone-500'}`}>
                  <button
                    onClick={() => setShowMembershipModal(true)}
                    className={`flex items-center gap-2 transition-colors w-full text-left ${isGoldTheme ? 'hover:text-amber-950' : 'hover:text-stone-900'}`}
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{t("Gói Thành Viên")}</span>
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className={`flex items-center gap-2 transition-colors w-full text-left ${isGoldTheme ? 'hover:text-amber-950' : 'hover:text-stone-900'}`}
                  >
                    <History className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{t("Lịch Sử Kích Hoạt")}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 transition-colors w-full text-left ${isGoldTheme ? (activeTab === 'security' ? 'text-amber-950 font-extrabold' : 'hover:text-amber-950') : (activeTab === 'security' ? 'text-indigo-600' : 'hover:text-stone-900')}`}
                  >
                    <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t("Bảo Mật & Email")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {effectiveSidebarCollapsed && (
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={() => setActiveTab('about')}
                className={`w-10 h-10 rounded-full overflow-hidden border hover:border-stone-400 transition-all cursor-pointer relative group ${previewAvatar !== null ? 'border-amber-400 ring-2 ring-amber-300/50 animate-[pulse_1.5s_ease-in-out_infinite]' : 'border-stone-200'}`}
                title={t("Tài Khoản (Bấm để chuyển về mục giới thiệu)")}
              >
                <img
                  src={getThumbUrl((previewAvatar !== null ? previewAvatar : (data?.aboutMe?.avatarUrl || data?.homeCoverUrl)) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80")}
                  alt="Artist Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          )}

          {!effectiveSidebarCollapsed && (
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-2 px-4 hidden md:block select-none opacity-80">
              {t("Quản lý")}
            </h3>
          )}
          {!showFullBleed && (
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`hidden md:flex absolute ${isSidebarCollapsed ? '-top-2 left-1/2 -translate-x-1/2 z-10' : '-top-2 right-2 z-10'} items-center justify-center p-1.5 text-stone-400 hover:text-stone-900 transition-all bg-white rounded-full border border-stone-200 shadow-sm`}
             >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
             </button>
          )}
          
          <LayoutGroup id="adminSidebarNav" layoutDependency={activeTab}>
                <div className={`${effectiveSidebarCollapsed ? 'flex flex-col gap-2 w-full px-2' : 'mb-3 flex flex-col gap-1'}`}>
                  <button
                    onClick={() => { setActiveTab('demos'); setDemosSubTab('released'); }}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isDemosActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Kho Nhạc")}
                  >
                    {isDemosActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isDemosActive ? {
                        y: [-0.8, 0.8, -0.8],
                        x: [-0.4, 0.4, -0.4]
                      } : { y: 0, x: 0 }}
                      transition={isDemosActive ? {
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <Disc3 className={`w-5 h-5 transition-colors animate-[spin_4s_linear_infinite] ${isDemosActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Kho Nhạc")}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveTab('demos'); setDemosSubTab('playlists'); }}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isPlaylistActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Playlist")}
                  >
                    {isPlaylistActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isPlaylistActive ? {
                        rotate: [-5, 5, -5],
                        y: [-1, 1, -1]
                      } : { rotate: 0, y: 0 }}
                      transition={isPlaylistActive ? {
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <ListMusic className={`w-5 h-5 transition-colors ${isPlaylistActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Playlist")}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveTab('templates')} 
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isTemplatesActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`} 
                    title={t("Chủ Đề")}
                  >
                    {isTemplatesActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isTemplatesActive ? {
                        rotate: [-5, 5, -5],
                        y: [-1, 1, -1]
                      } : { rotate: 0, y: 0 }}
                      transition={isTemplatesActive ? {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <Palette className={`w-5 h-5 transition-colors ${isTemplatesActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Chủ Đề")}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('reposts')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isRepostsActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={`${t("Đăng lại")} (${otherSongs.length})`}
                  >
                    {isRepostsActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isRepostsActive ? {
                        rotate: [-6, 6, -6],
                        y: [-1, 1, -1]
                      } : { rotate: 0, y: 0 }}
                      transition={isRepostsActive ? {
                        repeat: Infinity,
                        duration: 1.6,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative flex items-center justify-center z-10"
                    >
                      <Repeat className={`w-5 h-5 transition-colors ${isRepostsActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                      {effectiveSidebarCollapsed && otherSongs.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">{otherSongs.length}</span>
                      )}
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10 flex items-center justify-between w-full">
                        <span>{t("Đăng lại")}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${isRepostsActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200/80 group-hover:text-stone-900'}`}>{otherSongs.length}</span>
                      </span>
                    )}
                  </button>

                  {!effectiveSidebarCollapsed && (
                    <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest my-2 px-4 select-none opacity-80">
                      {t("Cài Đặt Hệ Thống")}
                    </h3>
                  )}

                  {/* 1. Trang Chủ (formerly Cài Đặt / Profile) */}
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isProfileActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Trang Chủ")}
                  >
                    {isProfileActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isProfileActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isProfileActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <Settings className={`w-5 h-5 transition-colors ${isProfileActive ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Trang Chủ")}
                      </span>
                    )}
                  </button>

                  {/* 2. Bố Cục */}
                  <button
                    onClick={() => setActiveTab('layout')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isLayoutActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Bố Cục")}
                  >
                    {isLayoutActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isLayoutActive ? {
                        scale: [1, 1.05, 1],
                        rotate: [-2, 2, -2]
                      } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <LayoutTemplate className={`w-5 h-5 transition-colors ${isLayoutActive ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Bố Cục")}
                      </span>
                    )}
                  </button>

                  {/* 3. Về Tôi */}
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isAboutActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Về Tôi")}
                  >
                    {isAboutActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isAboutActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isAboutActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <UserCircle className={`w-5 h-5 transition-colors ${isAboutActive ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Về Tôi")}
                      </span>
                    )}
                  </button>

                  {/* 4. Tiểu Sử */}
                  <button
                    onClick={() => setActiveTab('bio')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isBioActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Tiểu Sử")}
                  >
                    {isBioActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isBioActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isBioActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <BookOpen className={`w-5 h-5 transition-colors ${isBioActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Tiểu Sử")}
                      </span>
                    )}
                  </button>

                  {/* 5. Danh Mục */}
                  <button
                    onClick={() => setActiveTab('menus')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isMenusActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Danh Mục")}
                  >
                    {isMenusActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isMenusActive ? {
                        rotate: [-6, 6, -6],
                        y: [-0.8, 0.8, -0.8]
                      } : { rotate: 0, y: 0 }}
                      transition={isMenusActive ? {
                        repeat: Infinity,
                        duration: 2.3,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <List className={`w-5 h-5 transition-colors ${isMenusActive ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Danh Mục")}
                      </span>
                    )}
                  </button>

                  {/* 7. Hộp Thư */}
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      isTicketsActive ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Hộp thư")}
                  >
                    {isTicketsActive && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={isTicketsActive ? {
                        rotate: [-5, 5, -5],
                        y: [-1, 1, -1]
                      } : { rotate: 0, y: 0 }}
                      transition={isTicketsActive ? {
                        repeat: Infinity,
                        duration: 2.1,
                        ease: "easeInOut"
                      } : { duration: 0.2 }}
                      className="relative flex items-center justify-center z-10"
                    >
                      <MessageSquare className={`w-5 h-5 transition-colors ${isTicketsActive ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                      {effectiveSidebarCollapsed && bellCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">{bellCount}</span>
                      )}
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10 flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          {t("Hộp thư")} 
                          {bellCount > 0 && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />}
                        </span>
                        {bellCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                            {bellCount}
                          </span>
                        )}
                      </span>
                    )}
                  </button>

                  {data?.isSpecial && (
                    <button
                      onClick={() => setActiveTab('database')}
                      className={`flex items-center transition-colors relative group ${
                        effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                      } ${
                        activeTab === 'database' ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                      }`}
                      title={t("Cơ sở dữ liệu")}
                    >
                      {activeTab === 'database' && (
                        <motion.span
                          layoutId="adminSidebarActiveBg"
                          className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                          style={{ transition: 'none' }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <motion.div
                        animate={activeTab === 'database' ? {
                          scale: [1, 1.05, 1],
                        } : { scale: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="relative z-10 flex items-center justify-center"
                      >
                        <Database className={`w-5 h-5 relative z-10 transition-colors ${activeTab === 'database' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                      </motion.div>
                      {!effectiveSidebarCollapsed && (
                        <span className="relative z-10">
                          {t("Cơ sở dữ liệu")}
                        </span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('admin_theme')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      activeTab === 'admin_theme' ? 'text-white font-black' : (isGoldTheme ? 'hover:bg-amber-100/50 text-amber-800 hover:text-amber-950' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900')
                    }`}
                    title={t("Giao Diện")}
                  >
                    {activeTab === 'admin_theme' && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                      animate={activeTab === 'admin_theme' ? {
                        scale: [1, 1.05, 1],
                        rotate: [-2, 2, -2]
                      } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <Paintbrush className={`w-5 h-5 transition-colors ${activeTab === 'admin_theme' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Giao Diện")}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`flex items-center transition-colors relative group ${
                      effectiveSidebarCollapsed ? 'justify-center w-11 h-11 rounded-xl mx-auto' : 'justify-start w-full gap-3.5 px-4 py-3 rounded-xl font-bold text-sm'
                    } ${
                      activeTab === 'vouchers' ? 'text-white font-black' : 'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900'
                    }`}
                    title={t("Voucher")}
                  >
                    {activeTab === 'vouchers' && (
                      <motion.span
                        layoutId="adminSidebarActiveBg"
                        className="absolute inset-0 btn-black-gradient-blur rounded-xl z-0 group-hover:brightness-110"
                        style={{ transition: 'none' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <motion.div
                        className="relative z-10 flex items-center justify-center"
                      >
                      <Award className={`w-5 h-5 relative z-10 transition-colors ${activeTab === 'vouchers' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]' : 'text-stone-400 group-hover:text-stone-700'}`} />
                    </motion.div>
                    {!effectiveSidebarCollapsed && (
                      <span className="relative z-10">
                        {t("Voucher")}
                      </span>
                    )}
                  </button>
                </div>
              </LayoutGroup>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col transition-all duration-500 ${
          isGoldTheme 
            ? 'bg-white/95 text-stone-900 shadow-[0_8px_30px_rgba(245,158,11,0.04)]' 
            : 'bg-white text-stone-900'
        } ${
          showFullBleed 
            ? 'rounded-none border-0 shadow-none min-h-0 h-[calc(100vh-64px)] overflow-hidden p-4 md:p-6' 
            : `rounded-none md:rounded-3xl border-0 md:border shadow-none md:shadow-sm p-4 md:p-8 min-h-[calc(100vh-64px)] ${
                isGoldTheme ? 'md:border-amber-200/60' : 'md:border-stone-200'
              }`
        }`}>
          <AnimatePresence mode="wait">
          {activeTab === 'demos' && (
            <motion.div key="demos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            <div>
              {/* Header with Sub-tabs and Create button */}
              <div className="flex flex-col gap-4 mb-6 border-b border-stone-100 pb-4">
                {demosSubTab === 'playlists' ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                        <ListMusic className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
                        {t("Danh sách Playlist")}
                      </h2>
                      <p className="text-xs text-stone-500 mt-1">{t("Tạo, sắp xếp thứ tự ưu tiên và chỉnh sửa danh sách phát nhạc")}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 border border-stone-200 rounded-xl max-w-full overflow-x-auto custom-scrollbar flex-nowrap flex">
                    <button
                      type="button"
                      onClick={() => setDemosSubTab('released')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors relative ${
                        demosSubTab === 'released'
                          ? 'text-white'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {demosSubTab === 'released' && (
                        <motion.span
                          layoutId="adminSubTabActiveBg"
                          className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 relative z-10 ${demosSubTab === 'released' ? 'hidden sm:block' : ''}`} />
                      <span className={`relative z-10 ${demosSubTab === 'released' ? 'inline' : 'hidden sm:inline'}`}>{t("Đã phát hành")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs relative z-10 font-bold ${demosSubTab === 'released' ? 'bg-emerald-50 text-emerald-700 hidden sm:inline' : 'bg-stone-200/70 text-stone-600 hidden sm:inline'}`}>
                        {data.demos?.filter(d => d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect')
                          .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemosSubTab('demos')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors relative ${
                        demosSubTab === 'demos'
                          ? 'text-white'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {demosSubTab === 'demos' && (
                        <motion.span
                          layoutId="adminSubTabActiveBg"
                          className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <Disc3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 relative z-10 ${demosSubTab === 'demos' ? 'hidden sm:block' : ''}`} />
                      <span className={`relative z-10 ${demosSubTab === 'demos' ? 'inline' : 'hidden sm:inline'}`}>{t("Demo")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs relative z-10 font-bold ${demosSubTab === 'demos' ? 'bg-rose-50 text-rose-700 hidden sm:inline' : 'bg-stone-200/70 text-stone-600 hidden sm:inline'}`}>
                        {data.demos?.filter(d => !d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect')
                          .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemosSubTab('drafts')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors relative ${
                        demosSubTab === 'drafts'
                          ? 'text-white'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {demosSubTab === 'drafts' && (
                        <motion.span
                          layoutId="adminSubTabActiveBg"
                          className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 relative z-10 ${demosSubTab === 'drafts' ? 'hidden sm:block' : ''}`} />
                      <span className={`relative z-10 ${demosSubTab === 'drafts' ? 'inline' : 'hidden sm:inline'}`}>{t("Bản nháp")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs relative z-10 font-bold ${demosSubTab === 'drafts' ? 'bg-amber-50 text-amber-700 hidden sm:inline' : 'bg-stone-200/70 text-stone-600 hidden sm:inline'}`}>
                        {data.demos?.filter(d => d.isDraft && !d.deleted && d.linkType !== 'indirect')
                          .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemosSubTab('landing_pages')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors relative ${
                        demosSubTab === 'landing_pages'
                          ? 'text-white'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {demosSubTab === 'landing_pages' && (
                        <motion.span
                          layoutId="adminSubTabActiveBg"
                          className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <ExternalLink className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 relative z-10 ${demosSubTab === 'landing_pages' ? 'hidden sm:block' : ''}`} />
                      <span className={`relative z-10 ${demosSubTab === 'landing_pages' ? 'inline' : 'hidden sm:inline'}`}>{t("Landing Page")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs relative z-10 font-bold ${demosSubTab === 'landing_pages' ? 'bg-pink-50 text-pink-700 hidden sm:inline' : 'bg-stone-200/70 text-stone-600 hidden sm:inline'}`}>
                        {data.demos?.filter(d => d.linkType === 'indirect' && !d.deleted)
                          .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemosSubTab('brands')}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors relative ${
                        demosSubTab === 'brands'
                          ? 'text-white'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {demosSubTab === 'brands' && (
                        <motion.span
                          layoutId="adminSubTabActiveBg"
                          className="absolute inset-0 bg-stone-900 rounded-lg shadow-md z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <BadgeCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 relative z-10 ${demosSubTab === 'brands' ? 'hidden sm:block' : ''}`} />
                      <span className={`relative z-10 ${demosSubTab === 'brands' ? 'inline' : 'hidden sm:inline'}`}>{t("Nhạc Thương Hiệu")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs relative z-10 font-bold ${demosSubTab === 'brands' ? 'bg-indigo-50 text-indigo-700 hidden sm:inline' : 'bg-stone-200/70 text-stone-600 hidden sm:inline'}`}>
                        {data.demos?.filter(d => d.isBrand && !d.deleted)
                          .filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0}</span>
                    </button>
                  </div>
                )}

                {/* Row 2: Search, Pagination Limit and Trash Toggle */}
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3 w-full ${demosSubTab === 'playlists' ? 'justify-end' : 'sm:justify-between'}`}>
                  {/* Left part: Trash Toggle Button */}
                  {demosSubTab !== 'playlists' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDemosSubTab(demosSubTab === 'trash' ? 'released' : 'trash')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shadow-xs shrink-0 ${
                          demosSubTab === 'trash'
                            ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700'
                            : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${demosSubTab === 'trash' ? 'text-white' : 'text-stone-500'}`} />
                        <span>{t("Thùng rác")}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold ${
                          demosSubTab === 'trash' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {((data.demos?.filter(d => d.deleted).filter(d => !adminSearchQuery.trim() || d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0) + 
                           ((data.playlists || []).filter(p => p.deleted).filter(p => !adminSearchQuery.trim() || p.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase())).length || 0))}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Right part: Search and Pagination Limit */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Search box - full width on mobile, sm:w-64 on desktop */}
                    <div className="relative w-full sm:w-64 flex items-center bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus-within:ring-1 focus-within:ring-stone-400 placeholder:text-stone-400 font-medium shadow-xs transition-all">
                      <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        id="admin-search-input"
                        value={adminSearchQuery}
                        onChange={handleAdminSearchChange}
                        placeholder={t("Tìm kiếm...")}
                        className="w-full bg-transparent focus:outline-none"
                      />
                      {adminSearchQuery && (
                        <button
                          onClick={() => setAdminSearchQuery('')}
                          className="text-stone-400 hover:text-stone-800 ml-1 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Items per page selector and Action Button wrapper */}
                    <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto shrink-0 pr-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-medium">{t("Hiển thị")}:</span>
                        <div className="relative">
                          <select 
                            value={itemsPerPage} 
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                            className="bg-white border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-stone-700 outline-none hover:border-stone-300 transition-colors cursor-pointer min-w-[95px] appearance-none"
                          >
                            <option value={10}>{demosSubTab === 'playlists' ? t("10 mục") : t("10 bài")}</option>
                            <option value={20}>{demosSubTab === 'playlists' ? t("20 mục") : t("20 bài")}</option>
                            <option value={50}>{demosSubTab === 'playlists' ? t("50 mục") : t("50 bài")}</option>
                            <option value={100}>{demosSubTab === 'playlists' ? t("100 mục") : t("100 bài")}</option>
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      </div>
                      {demosSubTab === 'playlists' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setNewPlaylistTitle('');
                            setShowCreatePlaylistModal(true);
                          }}
                          className="group w-10 h-10 flex items-center justify-center bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:scale-110 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl hover:bg-stone-800 transition-colors shadow-sm shrink-0 cursor-pointer"
                          title={t("Tạo Playlist")}
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-500 ease-in-out" />
                        </button>
                      ) : demosSubTab !== 'trash' ? (
                        <Link to={getAdminLink('/new')} className="group w-10 h-10 flex items-center justify-center bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:scale-110 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-xl hover:bg-stone-800 transition-colors shadow-sm shrink-0" title={t("Thêm Mới Bài Hát")}>
                          <Plus className="w-5 h-5 group-hover:rotate-[360deg] transition-transform duration-500 ease-in-out" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action area for selected subtab */}
              <div className="overflow-x-auto min-h-[300px]">
<AnimatePresence mode="wait">
                {demosSubTab === 'landing_pages' && (<motion.div key="landing_pages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="w-full">{(() => {
                  let landingList = data.demos?.filter(d => d.linkType === 'indirect' && !d.deleted) || [];
                  if (adminSearchQuery.trim()) {
                    landingList = landingList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (landingList.length === 0) {
                     return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">{t('Chưa có Landing Page nào. Hãy tạo mới và chọn Loại Liên Kết là "Landing Page"!')}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả các dòng để sắp xếp thứ tự")}
                      </div>
                      {landingList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={`l15594-demo-${demo.id || ""}-${idx}`}
                          className="border border-stone-100 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight hidden sm:flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <Link to={getArtistLink(`/song/${demo.slug || demo.id}`)} state={{ fromAdmin: true }} className="hover:text-pink-600 font-bold text-stone-850 text-sm md:text-base block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[580px]">
                                {demo.title}
                              </Link>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs">
                                <span className="text-stone-500 font-medium">{t("Landing Page / Điều hướng")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Chia sẻ Link")}>
                               <Globe className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Nhân bản")}>
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t("Chỉnh sửa")}>
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title={t("Xóa")}>
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                         </div>
                        );
                      })}
                      {renderPagination(landingList.length)}
                    </div>
                  );
                })()}</motion.div>)}

                {demosSubTab === 'released' && (<motion.div key="released" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="w-full">{(() => {
                  let releasedList = data.demos?.filter(d => d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    releasedList = releasedList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (releasedList.length === 0) {
                     return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">{t('Chưa có bài hát đã phát hành nào. Hãy tạo mới và đặt trạng thái "Ra rồi"!')}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả các dòng bài hát để sắp xếp thứ tự hiển thị ưu tiên ngoài trang chủ")}
                      </div>
                      {releasedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={`l15647-demo-${demo.id || ""}-${idx}`}
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
                          className={`border border-stone-100 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-xs sm:text-sm w-6 sm:w-7 tracking-tight hidden sm:flex items-center justify-center bg-stone-100/80 rounded-md h-6 sm:h-7 shrink-0">#{idx + 1}</span>
                            {(demo.thumbUrl || demo.coverUrl || demo.imageUrl) ? (
                              <img src={getPreviewUrl(demo.thumbUrl || demo.coverUrl || demo.imageUrl)} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                                <Music className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <MarqueeText
                                text={demo.title || demo.name || t("Chưa đặt tên")}
                                to={getArtistLink(`/song/${demo.slug || demo.id}`)}
                                className="hover:text-blue-600 font-bold text-stone-850 text-sm md:text-base"
                              />
                              <div className="flex items-center gap-2 text-[10px] md:text-xs min-w-0">
                                {demo.status !== 'public' && (
                                  <span className="px-1.5 py-0.5 rounded font-semibold bg-stone-200 text-stone-600 text-[10px] flex items-center gap-1 shrink-0">
                                    <EyeOff className="w-3 h-3" /> Ẩn
                                  </span>
                                )}
                                {(demo.singer || demo.author) && (
                                  <div className="md:hidden flex-1 min-w-0">
                                    <MarqueeText
                                      text={demo.singer || demo.author || '---'}
                                      className="text-stone-500 font-medium text-[11px]"
                                    />
                                  </div>
                                )}
                                <div className="hidden md:flex items-center gap-2 text-stone-500 font-medium truncate text-xs">
                                  {demo.composer && <span>{t("Tác giả")}: {demo.composer}</span>}
                                  {demo.composer && (demo.singer || demo.author) && <span className="text-stone-300">•</span>}
                                  {(demo.singer || demo.author) && <span>{t("Ca sĩ")}: {demo.singer || demo.author}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-1.5 sm:p-2 rounded-lg transition-colors" title={t("Chia sẻ Link")}>
                               <Globe className="w-4 h-4" />
                            </button>
                            {demo.secretKey && (demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) && (
                              <button type="button" onClick={() => handleShareSecret(demo)} className="text-amber-600 hover:bg-amber-50 p-1.5 sm:p-2 rounded-lg transition-colors animate-[fade-in_0.3s_ease-out]" title="Copy Secret Link">
                                 <Unlock className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="hidden md:inline-flex text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Nhân bản")}>
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-1.5 sm:p-2 rounded-lg transition-colors" title={t("Chỉnh sửa")}>
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title || demo.name || t("Chưa đặt tên"))} className="hidden md:inline-flex text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title={t("Xóa")}>
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(releasedList.length)}
                    </div>
                  );
                })()}</motion.div>)}

                {demosSubTab === 'demos' && (<motion.div key="sub-demos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="w-full">{(() => {
                  let demoList = data.demos?.filter(d => !d.isReleased && !d.deleted && !d.isDraft && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    demoList = demoList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (demoList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">{t('Chưa có bài hát demo nào. Hãy tạo mới và đặt trạng thái "Đề mô"!')}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả các dòng bài hát để sắp xếp thứ tự hiển thị ưu tiên ngoài trang chủ")}
                      </div>
                      {demoList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={`l15739-demo-${demo.id || ""}-${idx}`}
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
                          className={`border border-stone-100 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-xs sm:text-sm w-6 sm:w-7 tracking-tight hidden sm:flex items-center justify-center bg-stone-100/80 rounded-md h-6 sm:h-7 shrink-0">#{idx + 1}</span>
                            {(demo.thumbUrl || demo.coverUrl || demo.imageUrl) ? (
                              <img src={getPreviewUrl(demo.thumbUrl || demo.coverUrl || demo.imageUrl)} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                                <Music className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <MarqueeText
                                text={demo.title || demo.name || t("Chưa đặt tên")}
                                to={getArtistLink(`/song/${demo.slug || demo.id}`)}
                                className="hover:text-blue-600 font-bold text-stone-850 text-sm md:text-base"
                              />
                              <div className="flex items-center gap-2 text-[10px] md:text-xs min-w-0">
                                {demo.status !== 'public' && (
                                  <span className="px-1.5 py-0.5 rounded font-semibold bg-stone-200 text-stone-600 text-[10px] flex items-center gap-1 shrink-0">
                                    <EyeOff className="w-3 h-3" />{t("Ẩn")}</span>
                                )}
                                {(demo.singer || demo.author) && (
                                  <div className="md:hidden flex-1 min-w-0">
                                    <MarqueeText
                                      text={demo.singer || demo.author || '---'}
                                      className="text-stone-500 font-medium text-[11px]"
                                    />
                                  </div>
                                )}
                                <div className="hidden md:flex items-center gap-2 text-stone-500 font-medium truncate text-xs">
                                  {demo.composer && <span>{t("Tác giả")}: {demo.composer}</span>}
                                  {demo.composer && (demo.singer || demo.author) && <span className="text-stone-300">•</span>}
                                  {(demo.singer || demo.author) && <span>{t("Ca sĩ")}: {demo.singer || demo.author}</span>}
                                </div>
                                {(demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) ? (
                                  <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 border border-stone-200 rounded flex items-center gap-1 text-[10px] md:text-xs shrink-0">
                                    <Lock className="w-3 h-3 text-stone-500" /> <span className="font-mono">{demo.password || `${t('Mật khẩu chung')}: ${data?.globalPassword}`}</span></span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-1.5 sm:p-2 rounded-lg transition-colors" title={t("Chia sẻ Link")}>
                               <Globe className="w-4 h-4" />
                            </button>
                            {demo.secretKey && (demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) && (
                              <button type="button" onClick={() => handleShareSecret(demo)} className="text-amber-600 hover:bg-amber-50 p-1.5 sm:p-2 rounded-lg transition-colors animate-[fade-in_0.3s_ease-out]" title="Copy Secret Link">
                                 <Unlock className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="hidden md:inline-flex text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Nhân bản")}>
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-1.5 sm:p-2 rounded-lg transition-colors" title={t("Chỉnh sửa")}>
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title || demo.name || t("Chưa đặt tên"))} className="hidden md:inline-flex text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title={t("Xóa")}>
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(demoList.length)}
                    </div>
                  );
                })()}</motion.div>)}

                {demosSubTab === 'brands' && (<motion.div key="brands" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="w-full">{(() => {
                  let brandList = data.demos?.filter(d => d.isBrand && !d.deleted) || [];
                  if (adminSearchQuery.trim()) {
                    brandList = brandList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (brandList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">{t('Chưa có bài hát thương hiệu nào. Hãy tạo mới và đánh dấu "Nhạc Thương Hiệu"!')}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả các dòng bài hát để sắp xếp thứ tự hiển thị ưu tiên ngoài trang chủ")}
                      </div>
                      {brandList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={`l15835-demo-${demo.id || ""}-${idx}`}
                          draggable
                          onDragStart={() => setDraggedItemIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setDraggedItemIdx(null)}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            if (draggedItemIdx === null || draggedItemIdx === idx) return;
                            const items = [...brandList];
                            const draggedItem = items.splice(draggedItemIdx, 1)[0];
                            items.splice(idx, 0, draggedItem);
                            setDraggedItemIdx(idx);

                            const remaining = (data.demos || []).filter(d => !d.isBrand || d.deleted);
                            const merged = [...items, ...remaining];
                            setData({ ...data, demos: merged });

                            fetch('/api/admin/reorder-demos', {
                              method: 'POST',
                              headers: {
                                'x-artist-extension': getArtistExtensionFromUrl(),
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${getAdminToken() || ''}`
                              },
                              body: JSON.stringify({ demos: merged })
                            }).catch(() => {});
                          }}
                          className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-200 hover:border-stone-900 transition-colors shadow-sm group cursor-move"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-stone-100 shrink-0 overflow-hidden relative shadow-sm border border-stone-200 group-hover:shadow-md transition-shadow">
                              {demo.brandLogoUrl ? (
                                <img src={demo.brandLogoUrl} alt="" className="w-full h-full object-cover" />
                              ) : getSongCoverUrl(demo.thumbUrl || demo.coverUrl) ? (
                                <img src={getSongCoverUrl(demo.thumbUrl || demo.coverUrl)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <Music className="w-6 h-6" />
                                </div>
                              )}
                              {demo.isDraft && (
                                <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{t("NHÁP")}</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-stone-900 truncate md:text-lg flex items-center gap-1.5">
                                {demo.title || demo.name || t("Chưa đặt tên")} {demo.password && !demo.isReleased && <Lock className="w-3 h-3 inline text-amber-500 mb-0.5" />}
                              </h4>
                              <p className="text-xs md:text-sm text-stone-500 truncate flex items-center gap-2">
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{t('Đối Tác')}: {demo.brandName || '---'}</span>
                                {demo.singer}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleShare(demo.slug || demo.id)} className="text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Chia sẻ Link")}>
                               <Globe className="w-4 h-4" />
                            </button>
                            {demo.secretKey && (demo.linkType === 'indirect' ? demo.password : (demo.password || (data?.globalPassword && !demo.isReleased))) && (
                              <button type="button" onClick={() => handleShareSecret(demo)} className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors animate-[fade-in_0.3s_ease-out]" title="Copy Secret Link">
                                 <Unlock className="w-4 h-4 text-amber-500" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="hidden md:inline-flex text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Nhân bản")}>
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t("Chỉnh sửa")}>
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title || demo.name || t("Chưa đặt tên"))} className="hidden md:inline-flex text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title={t("Xóa")}>
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(brandList.length)}
                    </div>
                  );
                })()}</motion.div>)}
                {demosSubTab === 'drafts' && (<motion.div key="drafts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full">{(() => {
                  let draftList = data.demos?.filter(d => d.isDraft && !d.deleted && d.linkType !== 'indirect') || [];
                  if (adminSearchQuery.trim()) {
                    draftList = draftList.filter(d => d.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (draftList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 italic border border-stone-200 rounded-xl bg-stone-50">{t("Chưa có bản nháp nào. Bản nháp được lưu từ màn hình tạo hoặc chỉnh sửa bài hát!")}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả để sắp xếp thứ tự hiển thị bản nháp")}
                      </div>
                      {draftList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((demo, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        return (
                        <div
                          key={`l15934-demo-${demo.id || ""}-${idx}`}
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
                          className={`border border-stone-100 rounded-xl p-3 flex items-center justify-between gap-3 bg-white hover:bg-stone-50/50 transition-all cursor-move select-none ${draggedItemIdx === idx ? 'opacity-40 border-dashed border-stone-300 bg-stone-50' : 'shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight hidden sm:flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                            {(demo.thumbUrl || demo.coverUrl || demo.imageUrl) ? (
                              <img src={getPreviewUrl(demo.thumbUrl || demo.coverUrl || demo.imageUrl)} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                                <Music className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <MarqueeTitle
                                text={demo.title || demo.name || t("(Chưa đặt tiêu đề)")}
                                to={getAdminLink(`/edit/${demo.id}`)}
                                className="hover:text-amber-600 font-bold text-stone-850 text-sm md:text-base"
                              />
                              <div className="flex items-center gap-2 text-[10px] md:text-xs min-w-0">
                                <span className="px-1.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-600 text-[10px] shrink-0">{t("Bản nháp")}</span>
                                {demo.singer && (
                                  <div className="md:hidden flex-1 min-w-0">
                                    <MarqueeTitle
                                      text={demo.singer}
                                      className="text-stone-500 font-medium text-[10px]"
                                    />
                                  </div>
                                )}
                                <div className="hidden md:flex items-center gap-2 text-stone-500 font-medium truncate text-xs">
                                  {demo.composer && <span>{t("Tác giả")}: {demo.composer}</span>}
                                  {demo.composer && demo.singer && <span className="text-stone-300">•</span>}
                                  {demo.singer && <span>{t("Ca sĩ")}: {demo.singer}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                            <button type="button" onClick={() => handleDuplicate(demo.id)} className="hidden md:inline-flex text-stone-500 hover:bg-stone-100 p-2 rounded-lg transition-colors" title={t("Nhân bản")}>
                               <Copy className="w-4 h-4" />
                            </button>
                            <Link to={getAdminLink(`/edit/${demo.id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t("Chỉnh sửa")}>
                               <Edit3 className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => handleDeleteClick('song', demo.id, demo.title || demo.name || t("Bản nháp"))} className="hidden md:inline-flex text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg" title={t("Xóa")}>
                              <X className="w-4 h-4 text-red-500 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      {renderPagination(draftList.length)}
                    </div>
                  );
                })()}</motion.div>)}

                {demosSubTab === 'playlists' && (<motion.div key="playlists" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full">{(() => {
                  let playlistList = (data.playlists || []).filter(p => !p.deleted);
                  if (adminSearchQuery.trim()) {
                    playlistList = playlistList.filter(p => p.title.toLowerCase().includes(adminSearchQuery.trim().toLowerCase()));
                  }
                  if (playlistList.length === 0) {
                    return <div className="py-12 text-center text-stone-500 border border-dashed border-stone-200 rounded-2xl italic bg-stone-50 font-medium text-sm">{t("Chưa có playlist nào. Hãy tạo mới một playlist bên trên!")}</div>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-stone-400 mb-2 italic px-1 flex items-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 shrink-0" /> {t("Kéo thả để sắp xếp thứ tự hiển thị playlist ưu tiên ngoài trang chủ")}
                      </div>
                      {playlistList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((pl, localIdx) => {
                        const idx = (currentPage - 1) * itemsPerPage + localIdx;
                        const songCount = (data.demos || []).filter(d => 
                           !d.deleted && ((d.playlistIds && d.playlistIds.includes(pl.id)) || 
                           (pl.songIds && pl.songIds.includes(d.id)))
                        ).length;

                        return (
                          <div
                            key={`l16019-${pl.id || ''}-${idx}`}
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
                              <span className="text-stone-500 font-mono font-bold text-sm w-7 tracking-tight hidden sm:flex items-center justify-center bg-stone-100/80 rounded-md h-7 shrink-0">#{idx + 1}</span>
                              <div className="flex flex-col flex-1 min-w-0">
                                <a
                                  href={getArtistFullUrl(`/playlist/${pl.id}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-bold text-stone-850 hover:text-emerald-600 transition-colors text-base hover:underline block truncate"
                                  title={t("Mở trang playlist công khai")}
                                >
                                  {pl.title}
                                </a>
                                <span className="text-xs text-stone-400 mt-0.5">{songCount} {t('bài nhạc')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareAdminPlaylist(pl.id);
                                }}
                                className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 p-2 rounded-lg transition-colors"
                                title={t("Sao chép link playlist")}
                              >
                                <Share2 className="w-4 h-4 text-stone-600" />
                              </button>
                              <Link to={getAdminLink(`/playlist/${pl.id}`)} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title={t("Chỉnh sửa playlist")}>
                                <Edit3 className="w-4 h-4 text-blue-600" />
                              </Link>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteClick('playlist', pl.id, pl.title); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold" title={t("Xóa playlist")}>
                                <X className="w-4 h-4 text-red-500 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {renderPagination(playlistList.length)}
                    </div>
                  );
                })()}</motion.div>)}

                {demosSubTab === 'trash' && (<motion.div key="trash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full">{(() => {
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
                        <span className="text-stone-500 italic font-medium text-sm">{t("Thùng rác trống rỗng.")}</span>
                      </div>
                    );
                  }
                  
                  const getRemainingDays = (deletedAt?: number) => {
                    if (!deletedAt) return t("30 ngày");
                    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                    const elapsed = Date.now() - deletedAt;
                    const remainingMs = thirtyDaysMs - elapsed;
                    if (remainingMs <= 0) return t("0 ngày ( sắp dọn dẹp )");
                    const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
                    return `Còn ${days} ngày`;
                  };

                  return (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 flex items-start gap-2.5 text-xs shadow-sm">
                        <span className="font-bold flex items-center justify-center p-1 bg-amber-200 rounded-full w-5 h-5 text-[10px] shrink-0 text-amber-800">⚠️</span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-850">{t("Lưu ý dọn dẹp thùng rác:")}</p>
                          <p className="opacity-90">{t("Hệ thống sẽ giữ tạm thời các mục trên tại đây tối đa 30 ngày. Quá thời gian này, các mục sẽ bị dọn dẹp và xóa vĩnh viễn không thể khôi phục.")}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2 px-1">{t('Các mục trong thùng rác')} ({allTrashed.length})</h4>
                        <div className="space-y-2">
                          {allTrashed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item: any, idx: number) => (
                            <div key={`l16121-${item._type}-${item.id || ''}-${idx}`} className="border border-stone-100 p-3 rounded-xl flex items-center justify-between gap-3 bg-white shadow-sm hover:bg-stone-50/30 transition-all">
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-stone-850 text-sm md:text-base truncate">{item.title || t("(Chưa đặt tiêu đề)")}</span>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                                  <span>{item._type === 'playlist' ? 'Playlist' : (item.isReleased ? t("Bài viết ra rồi") : t("Demo / Nháp"))}</span>
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
                })()}</motion.div>)}
</AnimatePresence>
              </div>
            </div>
            </motion.div>
          )}

          
          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
             <AdminAboutEdit 
  data={data} 
  t={t} 
  onSave={(newData: any) => { setPreviewAvatar(null); handleCustomSave(newData); }} 
  uploadWithProgress={uploadWithProgress} 
  getPreviewUrl={getPreviewUrl} 
  onPreviewAvatar={(url: string | null) => setPreviewAvatar(url)}
/>
            </motion.div>
          )}
          {activeTab === 'bio' && (
            <motion.div key="bio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
             <AdminBioEdit key="bio" data={data} t={t} onSave={handleCustomSave} />
            </motion.div>
          )}

          {activeTab === 'menus' && (
            <motion.div key="menus" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
              <div className="max-w-2xl py-1">
                <AdminMenuEdit data={data} t={t} onSave={handleCustomSave} />
              </div>
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div key="layout" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
              <div className="max-w-2xl py-1">
                <AdminLayoutEdit data={data} t={t} onSave={handleCustomSave} />
              </div>
            </motion.div>
          )}

          {activeTab === 'admin_theme' && (
            <motion.div key="admin_theme" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
              <div className="max-w-3xl pb-10">
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Palette className="w-6 h-6 text-yellow-500 animate-[pulse_2.5s_infinite]" />
                    {t("Giao Diện Bảng Điều Khiển")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Tùy chọn giao diện hiển thị cho trang quản trị của bạn.")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Liquid Glass Card */}
                  <div 
                    onClick={() => {
                      const cfg = data?.landingConfig?.adminThemesVip?.['liquid-glass'];
                      let isPro = false; let isVip = false;
                      if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                      else if (cfg === true) { isPro = true; isVip = true; }
                      
                      const userRoleId = String(data?.roleId || '').toLowerCase();
                      const isMaster = !!(data?.isSpecial || data?.isMasterAdmin || userRole?.exclusiveUi);

                      if (!isMaster) {
                        if (isVip && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                        if (isPro && userRoleId !== 'pro' && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                      }
                      setThemeSelectError(null);
                      handleCustomSave({ adminTheme: 'liquid-glass' });
                    }}
                    className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-64 hover:shadow-md ${
                      effectiveTheme === 'liquid-glass' 
                        ? 'border-teal-500 bg-teal-50/10 ring-2 ring-teal-500/20' 
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                     }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-stone-200 text-stone-700 rounded-full">
                          {t("Standard Theme")}
                        </span>
                        {(() => {
                          const cfg = data?.landingConfig?.adminThemesVip?.['liquid-glass'];
                          let isPro = false; let isVip = false;
                          if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                          else if (cfg === true) { isPro = true; isVip = true; }
                          if (isVip) return <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-500 text-stone-900 rounded-full flex items-center gap-1">VIP</span>;
                          if (isPro) return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full flex items-center gap-1">PRO</span>;
                          return null;
                        })()}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1">Liquid Glass</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {t("Giao diện kính mờ tinh tế kết hợp tông đen xám sang trọng và các hiệu ứng phát sáng nhẹ nhàng.")}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-stone-200/60 pt-4 mt-4">
                      <span className="text-xs text-stone-400 font-medium">
                        {effectiveTheme === 'liquid-glass' ? t("Đang áp dụng") : t("Bấm để áp dụng")}
                      </span>
                      {effectiveTheme === 'liquid-glass' && (
                        <Check className="w-5 h-5 text-teal-500" />
                      )}
                    </div>
                  </div>

                  {/* Gold Card */}
                  <div 
                    onClick={() => {
                      const cfg = data?.landingConfig?.adminThemesVip?.['gold'];
                      let isPro = true; let isVip = true;
                      if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                      else if (cfg === false) { isPro = false; isVip = false; }
                      
                      const userRoleId = String(data?.roleId || '').toLowerCase();
                      const isMaster = !!(data?.isSpecial || data?.isMasterAdmin || userRole?.exclusiveUi);

                      if (!isMaster) {
                        if (isVip && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                        if (isPro && userRoleId !== 'pro' && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                      }
                      setThemeSelectError(null);
                      handleCustomSave({ adminTheme: 'gold' });
                    }}
                    className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-64 hover:shadow-md ${
                      effectiveTheme === 'gold' 
                        ? 'border-yellow-600 bg-yellow-50/10 ring-2 ring-yellow-600/20' 
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-yellow-100 text-yellow-850 rounded-full">
                          {t("Luxury Theme")}
                        </span>
                        {(() => {
                          const cfg = data?.landingConfig?.adminThemesVip?.['gold'];
                          let isPro = true; let isVip = true;
                          if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                          else if (cfg === false) { isPro = false; isVip = false; }
                          if (isVip) return <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-500 text-stone-900 rounded-full flex items-center gap-1">VIP</span>;
                          if (isPro) return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full flex items-center gap-1">PRO</span>;
                          return null;
                        })()}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                        Gold <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {t("Giao diện Hoàng Gia sang trọng ngập tràn ánh vàng hoàng kim rực rỡ, mang lại sự may mắn và đẳng cấp.")}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-stone-200/60 pt-4 mt-4">
                      <span className="text-xs text-stone-400 font-medium">
                        {effectiveTheme === 'gold' ? t("Đang áp dụng") : t("Bấm để áp dụng")}
                      </span>
                      {effectiveTheme === 'gold' && (
                        <Check className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                  </div>

                  {/* Musician Card */}
                  <div 
                    onClick={() => {
                      const cfg = data?.landingConfig?.adminThemesVip?.['musician'];
                      let isPro = true; let isVip = false;
                      if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                      else if (cfg === true) { isPro = true; isVip = true; }
                      else if (cfg === false) { isPro = false; isVip = false; }
                      
                      const userRoleId = String(data?.roleId || '').toLowerCase();
                      const isMaster = !!(data?.isSpecial || data?.isMasterAdmin || userRole?.exclusiveUi);

                      if (!isMaster) {
                        if (isVip && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                        if (isPro && userRoleId !== 'pro' && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                      }
                      setThemeSelectError(null);
                      handleCustomSave({ adminTheme: 'musician' });
                    }}
                    className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-64 hover:shadow-md ${
                      effectiveTheme === 'musician' 
                        ? 'border-rose-500 bg-rose-50/10 ring-2 ring-rose-500/20' 
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full">
                          {t("Dreamy Theme")}
                        </span>
                        {(() => {
                          const cfg = data?.landingConfig?.adminThemesVip?.['musician'];
                          let isPro = true; let isVip = false;
                          if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                          else if (cfg === true) { isPro = true; isVip = true; }
                          else if (cfg === false) { isPro = false; isVip = false; }
                          if (isVip) return <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-500 text-stone-900 rounded-full flex items-center gap-1">VIP</span>;
                          if (isPro) return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full flex items-center gap-1">PRO</span>;
                          return null;
                        })()}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                        Dreamy <Music className="w-4 h-4 text-rose-500" />
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {t("Giao diện Mộng Mơ (Dreamy) quyến rũ với phong cách hiện đại, bố cục thẻ ngang thanh lịch và nổi bật.")}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-stone-200/60 pt-4 mt-4">
                      <span className="text-xs text-stone-400 font-medium">
                        {effectiveTheme === 'musician' ? t("Đang áp dụng") : t("Bấm để áp dụng")}
                      </span>
                      {effectiveTheme === 'musician' && (
                        <Check className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  </div>

                  {/* Musician v2 Card */}
                  <div 
                    onClick={() => {
                      const cfg = data?.landingConfig?.adminThemesVip?.['musician2'];
                      let isPro = true; let isVip = false;
                      if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                      else if (cfg === true) { isPro = true; isVip = true; }
                      else if (cfg === false) { isPro = false; isVip = false; }
                      
                      const userRoleId = String(data?.roleId || '').toLowerCase();
                      const isMaster = !!(data?.isSpecial || data?.isMasterAdmin || userRole?.exclusiveUi);

                      if (!isMaster) {
                        if (isVip && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                        if (isPro && userRoleId !== 'pro' && userRoleId !== 'vip') {
                          setThemeSelectError(t("đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.") || "đây là giao diện dành riêng cho thành viên PRO & VIP, nâng cấp gói để trải nghiệm.");
                          return;
                        }
                      }
                      setThemeSelectError(null);
                      handleCustomSave({ adminTheme: 'musician2' });
                    }}
                    className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-64 hover:shadow-md ${
                      effectiveTheme === 'musician2' 
                        ? 'border-amber-600 bg-amber-950/20 ring-2 ring-amber-600/30' 
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                          {t("Musician Theme")}
                        </span>
                        {(() => {
                          const cfg = data?.landingConfig?.adminThemesVip?.['musician2'];
                          let isPro = true; let isVip = false;
                          if (typeof cfg === 'object' && cfg !== null) { isVip = !!cfg.isVip; isPro = isVip || !!cfg.isPro; }
                          else if (cfg === true) { isPro = true; isVip = true; }
                          else if (cfg === false) { isPro = false; isVip = false; }
                          if (isVip) return <span className="px-2 py-0.5 text-[9px] font-bold bg-yellow-500 text-stone-900 rounded-full flex items-center gap-1">VIP</span>;
                          if (isPro) return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full flex items-center gap-1">PRO</span>;
                          return null;
                        })()}
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                        Musician <Disc3 className="w-4 h-4 text-amber-600" />
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        {t("Giao diện Nhạc Sĩ (Musician) với tủ đĩa gỗ cổ điển sang trọng, bài hát đặt trên kệ đĩa gỗ như một tủ sưu tầm âm nhạc chuyên nghiệp.")}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-stone-200/60 pt-4 mt-4">
                      <span className="text-xs text-stone-400 font-medium">
                        {effectiveTheme === 'musician2' ? t("Đang áp dụng") : t("Bấm để áp dụng")}
                      </span>
                      {effectiveTheme === 'musician2' && (
                        <Check className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                  </div>
                </div>

                {themeSelectError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs md:text-sm text-red-600 font-bold flex items-center gap-2 shadow-xs max-w-2xl">
                    <span>⚠️</span>
                    {themeSelectError}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'vouchers' && (
            <motion.div key="vouchers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
              <div className="max-w-xl bg-stone-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 mt-2">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3 text-stone-900">
                  <Award className="w-8 h-8 text-yellow-500 animate-pulse" /> {t("Sử dụng mã Voucher")}
                </h2>
                <p className="text-sm text-stone-500 mb-8 font-medium leading-relaxed">
                  {t("Nhập mã voucher để nhận thêm đặc quyền (tăng giới hạn đăng bài, giao diện VIP, ...).")}
                </p>
                
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  const codeVal = e.currentTarget.voucherCode.value;
                  if (!codeVal) return;
                  try {
                    const res = await fetch('/api/admin/vouchers/redeem', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAdminToken() || ''}`, 'x-artist-extension': getArtistExtensionFromUrl() },
                      body: JSON.stringify({ code: codeVal })
                    });
                    const json = await res.json();
                    if (res.ok) {
                      setToast(json.message || t("Áp dụng mã thành công!"));
                      setTimeout(() => window.location.reload(), 2000);
                    } else {
                      alert(json.error || 'Lỗi');
                    }
                  } catch(err) {
                    alert('Lỗi mạng');
                  }
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mã Voucher")}</label>
                    <input name="voucherCode" required placeholder={t("Nhập mã...")} className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white" />
                  </div>
                  <button type="submit" className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition-colors shadow-sm text-center cursor-pointer">
                    {t("Áp dụng Voucher")}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-2xl pb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <UserCircle className="w-6 h-6 text-teal-600 animate-[pulse_2.5s_infinite]" />
                    {t("Thông tin hồ sơ")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Cập nhật thông tin và cài đặt trang cá nhân của bạn")}</p>
                </div>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-6">

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Lời giới thiệu")}</label>
                  <input name="artistBio" defaultValue={data.artistBio || data.description || ''} placeholder={`Thiên đường âm nhạc của ${data.artistName || 'Nghệ Sĩ'}`} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên nghệ sĩ")}</label>
                  {data.pendingNameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between opacity-80 select-none">
                        <span>{t("Đang yêu cầu đổi thành:")}<strong>{data.pendingNameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('name')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3.5 py-2.5 text-sm rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="artistName" defaultValue={data.artistName} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Username đăng nhập")}</label>
                  {data.pendingUsernameChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between opacity-80 select-none">
                        <span>{t("Đang yêu cầu đổi thành:")}<strong>{data.pendingUsernameChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('username')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3.5 py-2.5 text-sm rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="username" defaultValue={data.username} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Phần mở rộng (Sub-domain)")}</label>
                  {data.pendingExtensionChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full border border-stone-200 bg-stone-100 text-stone-500 rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between opacity-80 select-none">
                        <span>{t("Đang yêu cầu đổi thành:")}<strong>{data.pendingExtensionChange}</strong></span>
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                      <button type="button" onClick={() => handleCancelRequest('extension')} className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3.5 py-2.5 text-sm rounded-xl font-bold transition-colors cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <input name="extension" defaultValue={data.extension} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
                  )}
                  <p className="text-xs text-stone-500 mt-1.5">
                    Link của bạn đang là <strong className="text-stone-700">{data.extension}.chorus.vn</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ngôn ngữ mặc định (Default Language)")}</label>
                  <CustomSelect
                    value={defaultLang}
                    onChange={(val) => setDefaultLang(val)}
                    options={[
                      { value: 'vi', label: t("Tiếng Việt") },
                      { value: 'en', label: 'English' },
                      { value: 'ko', label: '한국어' },
                      { value: 'ja', label: '日本語' },
                      { value: 'th', label: 'ไทย' },
                      { value: 'zh', label: '中文' }
                    ]}
                  />
                  <input type="hidden" name="defaultLanguage" value={defaultLang} />
                  <p className="text-xs text-stone-500 mt-1.5">{t("Ngôn ngữ mặc định ban đầu khi khách truy cập vào trang cá nhân của bạn.")}</p>
                </div>
                <div>



                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ảnh nền trang chủ ( Chọn nhiều ảnh để chạy slideshow )")}</label>
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
                             <button type="button" onClick={() => setSlideshowImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">{t("Xóa")}</button>
                          </div>
                       ))}
                       <button type="button" className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 flex flex-col items-center justify-center gap-1 transition-colors relative overflow-hidden" onClick={() => document.getElementById('slideUpload')?.click()}>
                          {slideProgress > 0 && slideProgress < 100 && <div className="absolute top-0 left-0 bottom-0 bg-stone-300 pointer-events-none" style={{ width: `${slideProgress}%` }}></div>}
                          <div className="text-2xl relative z-10">+</div>
                          <div className="text-xs font-semibold relative z-10 px-1 text-center">{slideProgress > 0 && slideProgress < 100 ? `${slideProgress}%` : t("Thêm ảnh")}</div>
                       </button>
                    </div>
                    <input type="file" id="slideUpload" className="hidden" accept="image/*" multiple onChange={async (e) => {
                      if (!e.target.files?.length) return;
                      const newUploads = [];
                      for (let i = 0; i < e.target.files.length; i++) {
                         try {
                           const result = await uploadWithProgress(e.target.files[i], setSlideProgress);
                           const url = typeof result === 'string' ? result : result.url;
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
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Favicon (Icon trên trình duyệt)")}</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const result = await uploadWithProgress(file, setFaviconProgress);
                                const url = typeof result === 'string' ? result : result.url;
                                setFaviconUrlPreview(url);
                            } catch (err) {
                                alert(t("Lỗi upload"));
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
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${faviconProgress === 100 || faviconUrlPreview ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('faviconUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{faviconProgress > 0 && faviconProgress < 100 ? `Đang tải ${faviconProgress}%` : (faviconUrlPreview ? t("Thay đổi") : t("Chọn ảnh"))}</span>
                        </button>
                        {faviconProgress > 0 && faviconProgress < 100 ? (
                          <button type="button" onClick={() => setFaviconProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                        {t("Kéo thả ảnh trực tiếp vào ô này")}
                      </p>
                    </div>
                    <input type="hidden" name="faviconUrl" value={faviconUrlPreview} />
                    <input type="file" id="faviconUpload" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const result = await uploadWithProgress(e.target.files[0], setFaviconProgress);
                        const url = typeof result === 'string' ? result : result.url;
                        setFaviconUrlPreview(url);
                      } catch (err) {
                        alert(t("Lỗi upload"));
                        setFaviconProgress(0);
                      }
                    }} />
                  </div>
                  
                </div>
  
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Thumbnail ( Ảnh minh họa khi chia sẻ Link )")}</label>
                  <div 
                    className="flex items-center gap-4 p-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                            try {
                                const result = await uploadWithProgress(file, setOgImageProgress);
                                const url = typeof result === 'string' ? result : result.url;
                                setOgImageUrlPreview(url);
                            } catch (err) {
                                alert(t("Lỗi upload"));
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
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${ogImageProgress === 100 || ogImageUrlPreview ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('ogImageUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{ogImageProgress > 0 && ogImageProgress < 100 ? `Đang tải ${ogImageProgress}%` : (ogImageUrlPreview ? t("Thay đổi") : t("Chọn ảnh"))}</span>
                        </button>
                        {ogImageProgress > 0 && ogImageProgress < 100 ? (
                          <button type="button" onClick={() => setOgImageProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                        {t("Kéo thả ảnh trực tiếp vào ô này")}
                      </p>
                    </div>
                    <input type="hidden" name="ogImageUrl" value={ogImageUrlPreview} />
                    <input type="file" id="ogImageUpload" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const result = await uploadWithProgress(e.target.files[0], setOgImageProgress);
                        const url = typeof result === 'string' ? result : result.url;
                        setOgImageUrlPreview(url);
                      } catch (err) {
                        alert(t("Lỗi upload"));
                        setOgImageProgress(0);
                      }
                    }} />
                  </div>
                  
                </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tiêu đề Website")}</label>
                  <input name="pageTitle" defaultValue={data.pageTitle} placeholder={t("Để trống sẽ dùng mặc định: Thiên Đường Demo của [Tên nghệ sĩ]")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
                </div>

<hr className="border-stone-200" />
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Link Playlist YouTube (Nhạc đã phát hành)")}</label>
                  <input name="youtubePlaylistUrl" defaultValue={data.youtubePlaylistUrl} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://youtube.com/playlist?list=..." />
                  <p className="text-sm text-stone-500 mt-2">{t("Sẽ tự động hiển thị 4 bài hát mới nhất từ playlist này.")}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Link Profile Spotify</label>
                  <input name="spotifyUrl" defaultValue={data.spotifyUrl} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://open.spotify.com/artist/..." />
                </div>
                {/* Cấu hình tên miền riêng (Custom Domain) */}
                {(data as any).isSpecial && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-extrabold text-stone-800 uppercase tracking-wider">
                          {t("Cấu hình tên miền riêng (Custom Domain)")}
                        </label>
                        <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm animate-pulse"></span>
                          <span className="text-xs">✨ VIP</span>
                        
                      </div>
                    </div>
                    
                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      {t("Sử dụng tên miền riêng của bạn (ví dụ:")} <code className="font-mono bg-stone-100 px-1 rounded">nghesi.com</code> {t("hoặc")} <code className="font-mono bg-stone-100 px-1 rounded">music.nghesi.com</code> {t(") thay vì sử dụng địa chỉ mặc định của hệ thống.")}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <input 
                          type="text" 
                          name="customDomain" 
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                          className="w-full border border-stone-300 bg-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm text-stone-900" 
                          placeholder={t("VD: nghesi.com")} 
                        />
                      </div>

                      {/* Show setup instructions if domain format looks okay */}
                      {customDomain.trim().length > 3 && /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(customDomain.trim()) ? (
                        <div className="bg-white border border-amber-200 rounded-xl p-5 space-y-3 shadow-inner text-stone-800">
                          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                            <span>{t("📋 Hướng dẫn cấu hình DNS")}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {t("Vui lòng truy cập trang quản lý tên miền của bạn (ví dụ: Cloudflare, GoDaddy, Nhân Hòa...) và thiết lập bản ghi sau để kết nối tên miền này:")}
                          </p>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-stone-200 text-stone-400">
                                  <th className="pb-2 font-semibold uppercase">{t("Loại bản ghi")}</th>
                                  <th className="pb-2 font-semibold uppercase">{t("Tên (Host)")}</th>
                                  <th className="pb-2 font-semibold uppercase">{t("Giá trị (Points to)")}</th>
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
                            <strong>{t("💡 Lưu ý:")}</strong> {t("Sau khi cấu hình xong, quá trình cập nhật DNS có thể mất từ vài phút đến tối đa 24 giờ tùy nhà đăng ký tên miền.")}
                          </div>
                        </div>
                      ) : customDomain.trim().length > 0 ? (
                        <div className="text-xs text-rose-500 font-medium">
                          ⚠️ {t("Định dạng tên miền không hợp lệ (ví dụ đúng: nghesi.com, sub.nghesi.com)")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

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
                    <label htmlFor="autoSwitchTabs" className="text-sm font-semibold text-stone-700 cursor-pointer select-none">
                      {t("Tự động chuyển tab ở trang chủ (Music / Demo / Playlist)")}
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
                    <label htmlFor="hideFromHomepage" className="text-sm font-semibold text-stone-700 cursor-pointer select-none">
                      {t("Ẩn khỏi danh sách nghệ sĩ trên trang chủ Chorus.vn")}
                    </label>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                  <h3 className="font-bold text-stone-800 text-sm">{t("Tên tùy chỉnh các Tab Danh Sách Nhạc")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">{t("Tab 1 (Nhạc phát hành)")}</label>
                      <input name="tab1Name" defaultValue={data.tab1Name} placeholder={t("Mặc định: Ra Rồi")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">{t("Tab 2 (Nhạc đề mô)")}</label>
                      <input name="tab2Name" defaultValue={data.tab2Name} placeholder={t("Mặc định: Đề Mô")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1.5">{t("Tab 3 (Album/EP)")}</label>
                      <input name="tab3Name" defaultValue={data.tab3Name} placeholder={t("Mặc định: Album/EP")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white" />
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-stone-100 pt-6 mt-6">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">
                      {t("Lưu thay đổi")}
                    </button>
                  </div>
              </form>
            </div>
            </motion.div>
          )}


          {activeTab === 'socials' && (
            <motion.div key="socials" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-2xl pb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
                    {t("Mạng xã hội")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Liên kết các kênh mạng xã hội chính thức của bạn")}</p>
                </div>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Facebook</label>
                  <input name="socialFacebook" defaultValue={data.socialFacebook} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Instagram</label>
                  <input name="socialInstagram" defaultValue={data.socialInstagram} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube</label>
                  <input name="socialYoutube" defaultValue={data.socialYoutube} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">TikTok</label>
                  <input name="socialTiktok" defaultValue={data.socialTiktok} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="https://tiktok.com/@..." />
                </div>
                
                <div className="flex items-center gap-4 border-t border-stone-100 pt-6 mt-6">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">{t("Lưu thay đổi")}</button>
                </div>
              </form>
            </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            <AdminTemplatesSettings isPCPreviewMode={isPCPreviewMode} setIsPCPreviewMode={setIsPCPreviewMode} />
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-2xl space-y-12 pb-10">
              <div>
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    {t("Mật khẩu chung và Bảo mật Demo")}
                  </h2>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu chung cho các Demo")}</label>
                    <input name="globalPassword" defaultValue={data.globalPassword} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" placeholder={t("Để trống nếu không muốn dùng mật khẩu chung")} autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" />
                    <p className="text-sm text-stone-500 mt-2">{t("Tất cả các link ở trang chủ nếu chưa đặt mật khẩu riêng thì sẽ được bảo vệ bởi mật khẩu chung này.")}</p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 mt-6 flex flex-wrap gap-4 items-center">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">{t("Lưu thay đổi")}</button>
                    <button type="button" onClick={async () => {
                      if (!confirm(t("Bạn có chắc muốn làm mới toàn bộ Secret Link? Các Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu."))) return;
                      const res = await fetch('/api/admin/reset-secret-links', {
                        method: 'POST',
                        headers: {
                          'x-artist-extension': getArtistExtensionFromUrl(),
                          'Authorization': `Bearer ${getAdminToken() || ''}`
                        }
                      });
                      if (res.ok) {
                        setToast(t("Đã reset toàn bộ Secret Link thành công!"));
                        setTimeout(() => setToast(''), 3000);
                        loadData();
                      }
                    }} className="text-red-500 hover:text-red-600 font-bold px-4 py-2 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl text-xs transition-all duration-200 cursor-pointer">{t("Reset Toàn Bộ Secret Link")}</button>
                  </div>
                </form>
              </div>
              <div className="h-px bg-stone-100 w-full"></div>
              <div>
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    {t("Cập Nhật Email Quản Trị")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Bạn sẽ dùng email này để đăng nhập vào trang quản trị thay cho username (nếu muốn).")}</p>
                </div>
                
                <form onSubmit={handleAdminEmailChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Địa chỉ Email")}</label>
                    <input 
                      type="email"
                      value={adminEmail}
                      onChange={(e: any) => setAdminEmail(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono"
                      placeholder={t("Nhập email...")}
                      required
                    />
                  </div>
                  
                  {adminEmailError && (
                    <p className="text-red-600 text-sm font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2">{adminEmailError}</p>
                  )}
                  {adminEmailSuccess && (
                    <p className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{adminEmailSuccess}</p>
                  )}
                  
                  <div className="pt-4 border-t border-stone-100 mt-6">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer">{t("Cập nhật Email")}</button>
                  </div>
                </form>
              </div>

              <div className="h-px bg-stone-100 w-full"></div>

              <div>
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
                    {t("Đổi Mật Khẩu Quản Trị (Admin)")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Bạn sẽ dùng mật khẩu này để đăng nhập vào trang quản trị AdminCP này.")}</p>
                </div>
                
                <form onSubmit={handleAdminPasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu cũ")}</label>
                    <PasswordInput 
                      value={oldAdminPass}
                      onChange={(e: any) => setOldAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono"
                      placeholder={t("Nhập mật khẩu hiện tại")}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-stone-700">{t("Mật khẩu mới")}</label>
                      <button type="button" onClick={() => { const p = Math.random().toString(36).slice(-8); setNewAdminPass(p); setConfirmAdminPass(p); }} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"><Sparkles className="w-3 h-3" />{t("Tự sinh Ngẫu Nhiên")}</button>
                    </div>
                    <PasswordInput 
                      value={newAdminPass}
                      onChange={(e: any) => setNewAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono"
                      placeholder={t("Mật khẩu mới (tối thiểu 4 ký tự)")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Xác nhận mật khẩu mới")}</label>
                    <PasswordInput 
                      value={confirmAdminPass}
                      onChange={(e: any) => setConfirmAdminPass(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono"
                      placeholder={t("Nhập lại mật khẩu mới")}
                    />
                  </div>

                  {adminPassError && (
                    <p className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2">{adminPassError}</p>
                  )}
                  {adminPassSuccess && (
                    <p className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{adminPassSuccess}</p>
                  )}

                  <div className="pt-4 border-t border-stone-100 mt-6">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-12 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer min-w-[180px]">
                      {t("Cập Nhật")}
                    </button>
                  </div>
                </form>
              </div>

              <div className="h-px bg-stone-100 w-full"></div>

              <div>
                <div className="flex flex-col gap-1 mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />
                    {t("Thiết Lập Mật Khẩu Thành Viên")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {t("Người dùng nhập mật khẩu này tại trang")}{" "}
                    <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-red-600 font-bold">
                      {`${data?.extension || getArtistExtensionFromUrl() || 'artist'}.chorus.vn/mem`}
                    </code>{" "}
                    {t("để nghe tự do mọi album/bài hát bị khóa mà không cần nhập mật khẩu.")}
                  </p>
                </div>
                
                <form onSubmit={handleMemberPasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <div className="flex items-center justify-end mb-2">
                      <button type="button" onClick={() => setMemberPassInput(Math.random().toString(36).slice(-8))} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"><Sparkles className="w-3 h-3" />{t("Tự sinh Ngẫu Nhiên")}</button>
                    </div>
                    <PasswordInput 
                      value={memberPassInput}
                      onChange={(e: any) => setMemberPassInput(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono"
                      placeholder={t("Mật khẩu thành viên")}
                    />
                  </div>

                  {memberPassError && (
                    <p className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 rounded-xl px-4 py-2">{memberPassError}</p>
                  )}
                  {memberPassSuccess && (
                    <p className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{memberPassSuccess}</p>
                  )}

                  <div className="pt-4 border-t border-stone-100 mt-6">
                    <button type="submit" className="bg-stone-900 text-white shadow-sm hover:shadow-md hover:bg-stone-800 active:scale-[0.98] px-12 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer min-w-[180px]">
                      {t("Cập Nhật")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div key="database" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            <AdminDatabaseSettings artistUsername={data?.username} />
            </motion.div>
          )}



          {activeTab === 'reposts' && (
            <motion.div key="reposts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            <div className="space-y-6 py-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2"><Share2 className="w-6 h-6 text-indigo-600 animate-[pulse_2.5s_infinite]" />{t("Đăng lại")} ({otherSongs.length})</h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Danh sách các bài hát của bạn đang được các nghệ sĩ khác đăng tải lên kênh của họ hoặc liên kết từ URL ngoài.")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExternalUrlInput(!showExternalUrlInput)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-xl font-bold text-sm inline-flex items-center gap-1.5 border border-stone-200 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-stone-500" />
                  {t("URL Ngoài")}
                </button>
              </div>

              {showExternalUrlInput && (
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-bold text-stone-850 text-sm">{t("Nhập link bài hát ngoài hệ thống")}</h3>
                  <form onSubmit={handleAddExternalSong} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder={t("Hỗ trợ các link bài hát chung cấu trúc với chorus.vn (ví dụ: https://tai.com/song/ten-bai-hat)")}
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white"
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
                        t("Kiểm tra & Thêm")
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
                  <h3 className="font-bold text-stone-850 mb-1">{t("Không tìm thấy bài hát nào")}</h3>
                  <p className="text-stone-500 text-sm max-w-sm mx-auto">{t("Hiện tại không có bài hát nào của bạn do nghệ sĩ khác đăng tải hoặc liên kết ngoài.")}</p>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Mobile Card View (block sm:hidden) */}
                  <div className="block sm:hidden divide-y divide-stone-150">
                    {otherSongs.map((song, idx) => {
                      const isSinger = song.singer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                      const isComposer = song.composer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                      
                      return (
                        <div key={`mob-repost-${song.id || ''}-${idx}`} className="p-3.5 bg-white space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5 flex-wrap">
                                <span>{song.title}</span>
                                {song.isExternal && (
                                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5" title={t("Bài hát ngoài hệ thống")}>
                                    <Globe className="w-2.5 h-2.5" /> {t("Ngoài")}
                                  </span>
                                )}
                              </div>
                              {/* Mobile: Display singer only without 'Ca sĩ:' prefix or composer */}
                              <div className="text-xs text-stone-600 font-medium mt-0.5 truncate">
                                {song.singer || t("Chưa rõ")}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => navigate(getAdminLink('/new'), { state: { repostFrom: song } })}
                                className="p-2 rounded-xl border border-stone-200 hover:border-stone-900 bg-white text-stone-700 transition-all shadow-sm cursor-pointer"
                                title={t("Đăng lại bài hát này lên kênh của bạn")}
                              >
                                <Repeat className="w-4 h-4" />
                              </button>
                              {song.isExternal ? (
                                <button
                                  onClick={() => handleRemoveExternalRepost(song.id)}
                                  className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-600 transition-all shadow-sm cursor-pointer"
                                  title={t("Xóa khỏi danh sách đăng lại")}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setReportSong(song)}
                                  className="px-2.5 py-1.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer"
                                  title={t("Gửi báo cáo / yêu cầu gỡ hoặc chỉnh sửa")}
                                >
                                  Report
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-500">
                            <div className="flex items-center gap-1 min-w-0 flex-1 mr-2">
                              <span className="text-stone-400 shrink-0">{t("Người đăng")}:</span>
                              <span className="font-semibold text-stone-800 truncate">{song.sourceArtist.artistName || song.sourceArtist.name}</span>
                              {song.isExternal ? (
                                <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-0.5 shrink-0">(<Globe className="w-2.5 h-2.5" />{t("Ngoại tuyến")})</span>
                              ) : (
                                <span className="text-[10px] text-stone-400 font-mono shrink-0">(@{song.sourceArtist.username})</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 shrink-0">
                              {isSinger && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">{t("Ca sĩ")}</span>}
                              {isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{t("Nhạc sĩ")}</span>}
                              {!isSinger && !isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">{t("Nghệ sĩ liên quan")}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View (hidden sm:block) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50/70 border-b border-stone-150 text-xs font-bold text-stone-500 uppercase tracking-wider">
                          <th className="px-6 py-4">{t("Bài hát")}</th>
                          <th className="px-6 py-4">{t("Vai trò của bạn")}</th>
                          <th className="px-6 py-4">{t("Người đăng")}</th>
                          <th className="px-6 py-4 text-right">{t("Hành động")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150 text-sm text-stone-700">
                        {otherSongs.map((song, idx) => {
                          const isSinger = song.singer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                          const isComposer = song.composer?.toLowerCase().includes(data?.artistName?.toLowerCase() || '');
                          
                          return (
                            <tr key={`l17062-${song.id || ''}-${idx}`} className="hover:bg-stone-50/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 flex items-center justify-center">
                                    {getSongCoverUrl(song.thumbUrl || song.coverUrl) ? (
                                      <img src={getSongCoverUrl(song.thumbUrl || song.coverUrl)} className="w-full h-full object-cover" alt={song.title} />
                                    ) : (
                                      <Disc3 className="w-5 h-5 text-stone-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                      {song.title}
                                      {song.isExternal && (
                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5" title={t("Bài hát ngoài hệ thống")}>
                                          <Globe className="w-2.5 h-2.5" /> {t("Ngoài")}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-0.5">{t("Ca sĩ")}: {song.singer || t("Chưa rõ")} | {t("Sáng tác")}: {song.composer || t("Chưa rõ")}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {isSinger && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">{t("Ca sĩ")}</span>}
                                  {isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{t("Nhạc sĩ")}</span>}
                                  {!isSinger && !isComposer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">{t("Nghệ sĩ liên quan")}</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-stone-850">{song.sourceArtist.artistName || song.sourceArtist.name}</div>
                                {song.isExternal ? (
                                  <div className="text-xs text-stone-400 font-mono flex items-center gap-1 mt-0.5">
                                    <Globe className="w-3 h-3 text-emerald-500" /> {t("Ngoại tuyến")}
                                  </div>
                                ) : (
                                  <div className="text-xs text-stone-400 font-mono">@{song.sourceArtist.username}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => navigate(getAdminLink('/new'), { state: { repostFrom: song } })}
                                    className="p-2 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-all shadow-sm cursor-pointer"
                                    title={t("Đăng lại bài hát này lên kênh của bạn")}
                                  >
                                    <Repeat className="w-4 h-4" />
                                  </button>
                                  {song.isExternal ? (
                                    <button
                                      onClick={() => handleRemoveExternalRepost(song.id)}
                                      className="p-2 rounded-xl border border-red-100 hover:border-red-500 bg-red-50 hover:bg-red-100 text-red-600 transition-all shadow-sm cursor-pointer"
                                      title={t("Xóa khỏi danh sách đăng lại")}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setReportSong(song)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 hover:bg-red-100/60 text-red-600 text-xs font-bold transition-all cursor-pointer"
                                      title={t("Gửi báo cáo / yêu cầu gỡ hoặc chỉnh sửa")}
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
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            <div className="space-y-6 py-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-amber-500 animate-[pulse_2.5s_infinite]" />
                    {t("Hộp thư Ticket")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">{t("Nơi trao đổi và giải quyết các vấn đề bản quyền, yêu cầu gỡ hoặc chỉnh sửa thông tin bài hát.")}</p>
                </div>
                <button
                  onClick={() => setShowCreateFeedbackModal(true)}
                  className="flex items-center gap-2 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] font-bold py-2.5 px-4 rounded-xl shadow-sm text-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> {t("Tạo Feedback / Báo lỗi")}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-stone-150 rounded-2xl overflow-hidden shadow-sm h-[650px]">
                {/* Tickets Sidebar */}
                <div className={`lg:col-span-4 border-r border-stone-150 flex-col h-full bg-stone-50/50 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="p-4 border-b border-stone-150 bg-white">
                    <h3 className="font-bold text-stone-800 text-sm">{t("Danh sách cuộc hội thoại")} ({ticketsList.length})</h3>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stone-150">
                    {ticketsList.length === 0 ? (
                      <div className="p-6 text-center text-stone-500 text-sm">
                        {t("Không có ticket nào hiện tại.")}
                      </div>
                    ) : (
                      ticketsList.map((ticket, idx) => {
                        const isSelected = selectedTicket?.id === ticket.id;
                        const lastMsg = ticket.messages[ticket.messages.length - 1];
                        
                        return (
                          <button
                            key={`l17179-${ticket.id || ''}-${idx}`}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`w-full p-4 text-left transition-all flex flex-col gap-2 hover:bg-stone-100/50 ${isSelected ? 'bg-white shadow-[inset_4px_0_0_0_#1c1917]' : ''}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getTicketTypeStyle(ticket.type).className}`}>
                                {getTicketTypeStyle(ticket.type).label}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ticket.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-200 text-stone-600'}`}>
                                {ticket.status === 'open' ? t("Đang xử lý") : t("Đã đóng")}
                              </span>
                            </div>
                            
                            <div className="font-bold text-stone-850 text-sm truncate w-full">
                              {ticket.songTitle}
                            </div>
                            
                            <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-2">
                              <span>{t("Bởi:")}<strong className="text-stone-700">{ticket.reporter.name}</strong></span>
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
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getTicketTypeStyle(selectedTicket.type).className}`}>
                                {getTicketTypeStyle(selectedTicket.type).label}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>{t("Người yêu cầu:")} <strong>{selectedTicket.reporter.name}</strong> <span className="text-stone-400 font-mono text-[10px]">(u/ {selectedTicket.reporter.username})</span></span>
                              {selectedTicket.sourceArtist && selectedTicket.sourceArtist !== 'system' && (
                                <>
                                  <span className="text-stone-300">|</span>
                                  <span>{t("Người đăng tải")}: <strong>{selectedTicket.uploader?.name || selectedTicket.sourceArtist}</strong> <span className="text-stone-400 font-mono text-[10px]">(u/ {selectedTicket.uploader?.username || selectedTicket.sourceArtist})</span></span>
                                </>
                              )}
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
                                  title={t("Duyệt Gỡ Bài")}
                                >
                                  <Check className="w-4 h-4" />
                                  <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">{t("Đồng Ý")}</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleResolveTicket(selectedTicket.id)}
                                className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title={t("Đóng Ticket")}
                              >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">{t("Đóng Ticket")}</span>
                              </button>
                            </>
                          )}
                          {(data?.username === 'acxuantai' || data?.isMasterAdmin) && selectedTicket.status !== 'open' && (
                             <button
                                onClick={() => handleReopenTicket(selectedTicket.id)}
                                className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] p-2 sm:px-3 sm:py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                title={t("Mở lại Ticket")}
                              >
                                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">{t("Mở Lại")}</span>
                              </button>
                          )}
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-stone-50/20">
                        {/* Initial system/description card */}
                        <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-3 text-stone-700 text-xs space-y-1 max-w-2xl">
                          <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">{t("Yêu cầu ban đầu:")}</p>
                          <p className="whitespace-pre-wrap italic">"{selectedTicket.description}"</p>
                          <p className="text-stone-400 text-[10px] text-right">{new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</p>
                        </div>

                        {selectedTicket.messages.map((msg: any, idx: number) => {
                          let senderUsername = msg.sender;
                          if (msg.sender === 'admin' && msg.senderName !== t("Hệ thống") && msg.senderName !== t("Admin hệ thống") && msg.senderName !== 'Admin') {
                            const found = systemArtists.find(a => a.artistName === msg.senderName);
                            if (found) senderUsername = found.username;
                          }
                          if (msg.sender === 'reporter' || msg.role === 'reporter') senderUsername = selectedTicket.reporter.username;
                          if (msg.sender === 'source' || msg.role === 'target') senderUsername = selectedTicket.sourceArtist;
                          
                          const isSystemAdmin = msg.senderName === t("Hệ thống") || msg.senderName === t("Admin hệ thống") || (msg.sender === 'admin' && msg.senderName === 'Admin');
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
                              key={`l17321-msg-${msg.id || idx}-${idx}`} 
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
                              placeholder={t("Nhập tin nhắn trao đổi...")}
                              className="flex-1 border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                            <button
                              onClick={handleSendTicketMessage}
                              className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
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
                      <h4 className="font-bold text-stone-800 mb-1">{t("Hộp hội thoại trống")}</h4>
                      <p className="text-sm max-w-xs">{t("Vui lòng chọn một cuộc hội thoại ticket từ danh sách bên trái để bắt đầu trao đổi.")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </motion.div>
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
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${reportType === 'edit' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'}`}
                      >
                        <span className={`font-bold text-xs ${reportType === 'edit' ? 'text-blue-700' : 'text-blue-600'}`}>{t("Yêu cầu chỉnh sửa")}</span>
                        <span className={`text-[10px] leading-tight ${reportType === 'edit' ? 'text-blue-600' : 'text-stone-500'}`}>{t("Trao đổi với người đăng để cập nhật nội dung")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('remove')}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${reportType === 'remove' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-red-200 bg-red-50/30 hover:bg-red-50'}`}
                      >
                        <span className={`font-bold text-xs ${reportType === 'remove' ? 'text-red-700' : 'text-red-600'}`}>{t("Yêu cầu gỡ")}</span>
                        <span className={`text-[10px] leading-tight ${reportType === 'remove' ? 'text-red-600' : 'text-stone-500'}`}>{t("Tố cáo bài viết vi phạm.")}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Mô tả lý do / Nội dung chi tiết")}</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder={t("Mô tả cụ thể lý do yêu cầu (ví dụ: Vi phạm bản quyền, sai thông tin ca sĩ, nhạc sĩ...)")}
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
                    {t("Hủy bỏ")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateReport}
                    disabled={!reportDesc.trim()}
                    className="px-4 py-2 rounded-xl font-bold bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] hover:bg-stone-800 disabled:opacity-50 disabled:pointer-events-none text-sm transition-all"
                  >
                    {t("Gửi báo cáo")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Playlist Modal */}
          {showCreatePlaylistModal && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newPlaylistTitle.trim() || isCreatingPlaylist) return;
                  setIsCreatingPlaylist(true);
                  try {
                    const res = await fetch('/api/playlists', {
                      method: 'POST',
                      headers: {
                        'x-artist-extension': getArtistExtensionFromUrl(),
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAdminToken()}`
                      },
                      body: JSON.stringify({ title: newPlaylistTitle.trim() })
                    });
                    if (res.ok) {
                      setToast(t("Tạo playlist thành công!"));
                      setTimeout(() => setToast(''), 3000);
                      loadData();
                      setShowCreatePlaylistModal(false);
                      setNewPlaylistTitle('');
                    } else {
                      const errData = await res.json().catch(() => ({}));
                      setToast(errData.error || t("Có lỗi xảy ra khi tạo playlist."));
                      setTimeout(() => setToast(''), 3000);
                    }
                  } catch (err) {
                    setToast(t("Có lỗi xảy ra khi kết nối máy chủ."));
                    setTimeout(() => setToast(''), 3000);
                  } finally {
                    setIsCreatingPlaylist(false);
                  }
                }} 
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-150 animate-in fade-in zoom-in duration-200" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 text-stone-900 mb-4">
                  <div className="p-2.5 bg-stone-100 rounded-xl">
                    <ListMusic className="w-6 h-6 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{t("Tạo Playlist Mới")}</h3>
                    <p className="text-xs text-stone-500">{t("Tạo danh sách phát nhạc để phân loại các bài hát của bạn")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Tên playlist")}</label>
                    <input
                      type="text"
                      value={newPlaylistTitle}
                      onChange={(e) => setNewPlaylistTitle(e.target.value)}
                      placeholder={t("Nhập tên playlist (ví dụ: Album Vol. 1, Single...)")}
                      required
                      autoFocus
                      className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => { setShowCreatePlaylistModal(false); setNewPlaylistTitle(''); }}
                    className="px-4 py-2 border rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 text-sm transition-all cursor-pointer"
                  >
                    {t("Hủy bỏ")}
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingPlaylist || !newPlaylistTitle.trim()}
                    className="px-4 py-2 rounded-xl font-bold bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCreatingPlaylist ? t("Đang tạo...") : t("Tạo Playlist")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Create Feedback Modal */}
          {showCreateFeedbackModal && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form onSubmit={handleCreateFeedback} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-150 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 text-stone-900 mb-4">
                  <div className="p-2.5 bg-stone-100 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{t("Gửi Feedback / Báo lỗi")}</h3>
                    <p className="text-xs text-stone-500">{t("Chúng tôi luôn lắng nghe ý kiến đóng góp từ bạn")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Loại feedback")}</label>
                    <div className="relative">
                      <select
                        value={feedbackType}
                        onChange={(e: any) => setFeedbackType(e.target.value)}
                        className="w-full text-sm border border-stone-300 rounded-xl pl-4 pr-10 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer hover:border-stone-400 transition-colors shadow-xs"
                      >
                        <option value="bug">{t("Báo Lỗi")}</option>
                        <option value="feature">{t("Góp ý tính năng")}</option>
                        <option value="account">{t("Báo Cáo Tài Khoản")}</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Tiêu đề")}</label>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder={t("Nhập tiêu đề ngắn gọn (ví dụ: Lỗi không phát được nhạc...)")}
                      required
                      className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{t("Nội dung mô tả")}</label>
                    <textarea
                      value={feedbackDesc}
                      onChange={(e) => setFeedbackDesc(e.target.value)}
                      placeholder={t("Mô tả cụ thể và chi tiết ý kiến hoặc lỗi bạn gặp phải...")}
                      required
                      rows={4}
                      className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => { setShowCreateFeedbackModal(false); setFeedbackTitle(''); setFeedbackDesc(''); setFeedbackType('bug'); }}
                    className="px-4 py-2 border rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 text-sm transition-all cursor-pointer"
                  >
                    {t("Hủy bỏ")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackTitle.trim() || !feedbackDesc.trim()}
                    className="px-4 py-2 rounded-xl font-bold bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] hover:bg-stone-800 disabled:opacity-50 disabled:pointer-events-none text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingFeedback ? t("Đang gửi...") : t("Gửi phản hồi")}
                  </button>
                </div>
              </form>
            </div>
          )}
          </AnimatePresence>
  </main>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {actionConfirm?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-black border border-stone-150 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 font-sans">
                  {actionConfirm.title}
                </h3>
              </div>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">{actionConfirm.message}</p>
              
              <div className="flex gap-2.5 justify-end mt-2">
                {!actionConfirm.isAlertOnly && (
                  <button 
                    onClick={() => {
                      if (actionConfirm.onCancel) actionConfirm.onCancel();
                      if (confirmResolverRef.current) {
                        confirmResolverRef.current(false);
                        confirmResolverRef.current = null;
                      }
                      setActionConfirm(null);
                    }} 
                    className="px-4 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    {t("Hủy")}
                  </button>
                )}
                <button 
                  onClick={() => {
                    actionConfirm.onConfirm();
                    if (confirmResolverRef.current) {
                      confirmResolverRef.current(true);
                      confirmResolverRef.current = null;
                    }
                    setActionConfirm(null);
                  }} 
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg ${
                    actionConfirm.type === 'danger' || actionConfirm.type === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                  }`}
                >
                  {actionConfirm.isAlertOnly ? t("Đóng") : t("Xác nhận")}
                </button>
              </div>
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
              <h3 className="font-bold text-lg text-stone-900">{t("Xác nhận xóa tạm thời")}</h3>
            </div>
            
            <div className="text-stone-700 text-sm mb-5 leading-relaxed bg-white">
              Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'song' ? t("bài hát") : 'playlist'}{' '}
              <span className="font-bold my-1.5 block px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-900 truncate">
                "{deleteConfirm.name}"
              </span>
              Mục này sẽ được chuyển vào <span className="font-bold text-stone-800">{t("Thùng rác tạm thời")}</span> và tự động xóa vĩnh viễn sau 30 ngày.
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
                className="px-4 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 text-sm transition-all"
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

interface CustomSelectOption {
  value: string;
  label: string;
  isVip?: boolean;
  disabled?: boolean;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  dropdownClassName = ''
}: {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-xl px-3.5 py-2.5 bg-white focus:outline-none transition-all cursor-pointer shadow-xs text-left ${isOpen ? 'border-stone-900 ring-2 ring-stone-900/15 shadow-sm' : 'border-stone-300 hover:border-stone-400'}`}
      >
        <span className="truncate text-stone-700 font-semibold text-sm flex items-center gap-2">
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption && selectedOption.isVip && (
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-[150] py-1.5 max-h-60 overflow-y-auto custom-scrollbar ${dropdownClassName}`}>
          {options.map((opt, idx) => (
            <button
              key={`l17827-${opt.value}-${idx}`}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                if (opt.disabled) return;
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between ${
                opt.value === value
                  ? 'bg-stone-900 text-white font-bold'
                  : opt.disabled
                  ? 'text-stone-400 opacity-60 cursor-not-allowed bg-stone-50'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                 <span className="truncate">{opt.label}</span>
                 {opt.isVip && (
                   <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 shrink-0">VIP</span>
                 )}
              </div>
              {opt.value === value && (
                <svg className={`w-4 h-4 ${opt.disabled ? 'text-stone-400' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaylistSelect({ selectedIds, onChange }: { selectedIds: string[], onChange: (ids: string[]) => void }) {
  const { t } = useAdminTranslation();
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
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all text-left text-sm h-[42px]">
        <span className="truncate text-stone-700 font-medium">{selectedIds.length > 0 ? `${selectedIds.length} playlist được chọn` : t("Chọn Playlist")}</span>
        <svg className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl z-[100] p-2 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              {playlists.map((p, idx) => (
                 <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors" key={`l17932-${p.id || ''}-${idx}`}>
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => toggle(p.id, e)} className="w-[18px] h-[18px] rounded border-stone-300 text-stone-900 focus:ring-stone-900" />
                    <span className="flex-1 truncate text-sm font-medium text-stone-800">{p.title}</span>
                 </label>
              ))}
              <div className="border-t border-stone-100 pt-2 mt-2 sticky bottom-0 bg-white pb-1 flex gap-2">
                 <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreate())} placeholder={t("Tên Playlist mới...")} className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
                 <button type="button" onClick={handleCreate} disabled={!newTitle.trim()} className="px-4 py-2 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-lg text-sm font-bold hover:bg-stone-800 disabled:opacity-50">{t("Tạo mới")}</button>
              </div>
           </div>
         )}
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
  const { t } = useAdminTranslation();
  const { landingConfig } = useContext(LanguageContext);
  const [selectedId, setSelectedId] = useState(defaultTemplateId || configs[0]?.id || '1');
  const [isPCPreviewMode, setIsPCPreviewMode] = useState(false);

  const selectedConfig = configs.find(c => c.id === selectedId) || configs[0];

  return (
    <div className="flex flex-col fixed inset-0 bg-zinc-900 z-[9999]">
      <div className="bg-white p-4 border-b border-stone-200 flex justify-between items-center z-10 shrink-0">
          <button type="button" onClick={onClose} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium font-sans">
              <ArrowLeft className="w-5 h-5"/> {t("Trở về")}
          </button>
          <div className="flex items-center gap-4">
              <button onClick={() => setIsPCPreviewMode(false)} className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${!isPCPreviewMode ? 'border-2 border-stone-850 bg-transparent text-stone-900' : 'border border-stone-200 bg-transparent text-stone-400 hover:text-stone-700 hover:border-stone-400'} shadow-sm`} title={t("Xem chủ đề điện thoại")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </button>
              <button onClick={() => setIsPCPreviewMode(true)} className={`hidden md:flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${isPCPreviewMode ? 'border-2 border-stone-850 bg-transparent text-stone-900' : 'border border-stone-200 bg-transparent text-stone-400 hover:text-stone-700 hover:border-stone-400'} shadow-sm`} title={t("Xem chủ đề máy tính")}>
                <Monitor className="w-5 h-5 stroke-[1.5]"/>
              </button>
              <button type="button" onClick={() => onSelect(selectedId)} className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] px-5 py-2 rounded-xl text-sm font-bold shadow hover:bg-stone-800">{t("Chọn")}</button>
          </div>
      </div>
      <div className="flex flex-1 flex-col md:flex-row overflow-y-auto md:overflow-hidden relative border-t-0">
         <div className={`w-full h-auto md:h-full ${isPCPreviewMode ? 'md:w-[260px] p-4 space-y-4' : 'md:w-[400px] p-6 md:p-8 space-y-6'} bg-white flex-shrink-0 border-b md:border-b-0 md:border-r overflow-visible md:overflow-y-auto custom-scrollbar`}>
            <h3 className="text-xl font-black mb-4">{t("Chọn Template")}</h3>
            <div className="space-y-2 pb-6">
               {configs.map((c, idx) => (
                  <button type="button" key={`l17990-${c.id || ''}-${idx}`} onClick={() => setSelectedId(c.id)} className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex justify-between items-center ${selectedId === c.id ? 'border-stone-900 bg-stone-50 font-bold' : 'border-transparent bg-white hover:bg-stone-100'}`}>
                      <span>{t(c.name)}</span>
                      {landingConfig?.templateVip?.[c.id] && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-200 ml-2">VIP</span>
                      )}
                  </button>
               ))}
            </div>
         </div>
         <div className="flex-1 w-full min-h-[500px] md:min-h-0 bg-stone-900 relative overflow-hidden flex items-center justify-center py-6 md:py-0 shrink-0">
            <div className="absolute top-4 right-4 z-[100] flex gap-2">
               <button onClick={() => setIsPCPreviewMode(false)} className={`flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${!isPCPreviewMode ? 'border-white/60 bg-transparent text-white' : 'border-white/20 bg-transparent text-white/40 hover:text-white/60 hover:border-white/40'} shadow-sm`} title={t("Xem chủ đề điện thoại")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
               </button>
               <button onClick={() => setIsPCPreviewMode(true)} className={`hidden md:flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${isPCPreviewMode ? 'border-white/60 bg-transparent text-white' : 'border-white/20 bg-transparent text-white/40 hover:text-white/60 hover:border-white/40'} shadow-sm`} title={t("Xem chủ đề máy tính")}>
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
                 <div className="text-stone-500 bg-stone-900 h-full w-full flex items-center justify-center font-medium">{t("Đang tải...")}</div>
            )}
         </div>
      </div>
    </div>
  )
}

const getAchievementTypes = (t: (key: string) => string) => ({
  youtube_trending: t('Top Trending YouTube'),
  tiktok_viral: t('Viral TikTok'),
  spotify_streams: t("Lượt Streams Spotify"),
  zing_streams: t("Lượt Streams Zing MP3"),
  youtube_views: t('Views YouTube'),
});

function AchievementEditor({ achievements, onChange }: { achievements: Achievement[], onChange: (a: Achievement[]) => void }) {
  const { t } = useAdminTranslation();
  const achievementTypes = getAchievementTypes(t);
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
        {t("Thành tích đặc sắc (Sử dụng để tạo điểm nhấn hiệu ứng ngoài Trang Chủ)")}
      </h3>
      {achievements.length > 0 && (
        <div className="space-y-4 mb-4">
          {achievements.map((ach, index) => (
            <div key={`l18063-idx-${index}`} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group items-end">
              <div className="w-full sm:w-[220px] shrink-0">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">{t("Loại thành tích")}</label>
                <CustomSelect
                  value={ach.type} 
                  onChange={val => handleUpdate(index, 'type', val)}
                  options={Object.entries(achievementTypes).map(([k, v]) => ({ value: k, label: v }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 w-full relative">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">{t("Giá trị / Nội dung chi tiết")}</label>
                <div className="flex w-full group-focus-within:ring-2 ring-stone-900 rounded-lg">
                  <input 
                    value={ach.value} 
                    onChange={e => handleUpdate(index, 'value', e.target.value)} 
                    placeholder={t("VD: 10M, Dành cho hiệu ứng TikTok...")}
                    className="w-full border border-stone-300 rounded-l-lg px-4 py-2.5 text-sm focus:outline-none focus:border-transparent group-focus-within:border-transparent transition-colors z-10 relative"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemove(index)} 
                    className="shrink-0 aspect-square w-11 flex items-center justify-center border border-l-0 border-stone-300 rounded-r-lg hover:bg-red-50 hover:text-red-600 transition-colors z-10 relative bg-white text-stone-400 hover:border-red-200" 
                    title={t("Xóa")}
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
        <Plus className="w-4 h-4" /> {t("Thêm thành tích")}
      </button>
    </div>
  );
}

// ---- ADMIN CREATE DEMO ----
export function AdminCreateDemo() {
  const { t } = useAdminTranslation();
  const { landingConfig } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(t("Đang xử lý..."));
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
          const sorted = data.templateConfigs.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          const fallbackList = [
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
            { id: '18', name: 'Pháo hoa (Năm mới)' },
            { id: '19', name: 'Ký Ức' },
            { id: '20', name: 'Ngọt Ngào' }
          ];
          setTemplateConfigs(fallbackList.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })));
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
  const [isBrand, setIsBrand] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandBrief, setBrandBrief] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [brandReferenceVideos, setBrandReferenceVideos] = useState<string[]>([]);
  const [brandLogoUploadProgress, setBrandLogoUploadProgress] = useState(0);
  const [uploadedBrandLogoUrl, setUploadedBrandLogoUrl] = useState("");
  const [uploadedBrandLogoName, setUploadedBrandLogoName] = useState("");
  const [coverPreviewObjectUrl, setCoverPreviewObjectUrl] = useState('');
  const [bgPreviewObjectUrl, setBgPreviewObjectUrl] = useState('');
  const [brandLogoPreviewObjectUrl, setBrandLogoPreviewObjectUrl] = useState('');


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
  const [musicProducer, setMusicProducer] = useState('');
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
  const [status, setStatus] = useState('public');

  const [linkType, setLinkType] = useState<'direct'|'indirect'>('direct');
  const [isReleased, setIsReleased] = useState(false);
  const [password, setPassword] = useState('');
  const [linkZing, setLinkZing] = useState('');
  const [linkSpotify, setLinkSpotify] = useState('');
  const [linkApple, setLinkApple] = useState('');
  const [linkYoutubeMusic, setLinkYoutubeMusic] = useState('');
  const [linkYoutube, setLinkYoutube] = useState('');

  useEffect(() => {
    if (location.state?.isBrand) {
      setIsBrand(true);
    }
    if (location.state?.repostFrom) {
      const sf = location.state.repostFrom;
      setTitle(sf.title || '');
      setSinger(sf.singer || '');
      setComposer(sf.composer || '');
      setMusicProducer(sf.musicProducer || '');
      setLyrics(sf.lyrics || '');
      setReleaseYear(sf.releaseYear || '');
      setIsReleased(sf.isReleased !== false);
      setLinkType(sf.linkType || 'direct');
      setLinkZing(sf.linkZing || '');
      setLinkSpotify(sf.linkSpotify || '');
      setLinkApple(sf.linkApple || '');
      setLinkYoutubeMusic(sf.linkYoutubeMusic || '');
      setLinkYoutube(sf.linkYoutube || '');
      setLinkDrive(sf.linkDrive || '');
      setIsBrand(sf.isBrand || false);
      setBrandName(sf.brandName || '');
      setBrandBrief(sf.brandBrief || '');
      setBrandColor(sf.brandColor || '');
      setUploadedBrandLogoUrl(sf.brandLogoUrl || '');
      if (sf.brandReferenceVideos) {
        setBrandReferenceVideos(sf.brandReferenceVideos);
      }
      if (sf.template) {
        setTemplate(sf.template);
      }
      
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

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

  const generateSlug = (text: string) => {
    return text.toString()
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
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
          const sorted = data.templateConfigs.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          // Fallback static
          const fallbackList = [
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
            { id: '18', name: 'Pháo hoa (Năm mới)' },
            { id: '19', name: 'Ký Ức' },
            { id: '20', name: 'Ngọt Ngào' }
          ];
          setTemplateConfigs(fallbackList.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })));
        }
      })
      .catch(console.error);
  }, []);

  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [isDraggingBrandLogo, setIsDraggingBrandLogo] = useState(false);

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

  const cancelUpload = (type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
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

  const uploadFileDirectly = async (file: File, type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
    if (type === 'audio') {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification(t("Dung lượng file nhạc quá lớn (") + (file.size / (1024 * 1024)).toFixed(1) + t("MB). Vui lòng tải lên file nhạc dưới 100MB để đảm bảo tốc độ xử lý của server."), 'warning', t("Tệp quá lớn"));
        const input = document.getElementById('audioCreateUpload') as HTMLInputElement;
        if (input) input.value = '';
        return;
      }
      setUploadedAudioName(file.name);
    } else {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification(t("Dung lượng file ảnh quá lớn. Vui lòng chọn file dưới 100MB."), 'warning', t("Ảnh quá lớn"));
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
        setCoverPreviewObjectUrl(URL.createObjectURL(file));
      } else if (type === 'background') {
        setUploadedBgName(file.name);
        setBgPreviewObjectUrl(URL.createObjectURL(file));
      } else if (type === 'brandLogo') {
        setBrandLogoPreviewObjectUrl(URL.createObjectURL(file));
      }
    }

    const fileToUpload = (file.type && file.type.startsWith('image/')) ? await compressImageInBrowser(file) : file;
    const formData = new FormData();
    formData.append('file', fileToUpload);

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
                if (coverPreviewObjectUrl) { URL.revokeObjectURL(coverPreviewObjectUrl); setCoverPreviewObjectUrl(''); }
            } else if (type === 'brandLogo') {
                setUploadedBrandLogoUrl(res.url);
                setBrandLogoUploadProgress(100);
                if (brandLogoPreviewObjectUrl) { URL.revokeObjectURL(brandLogoPreviewObjectUrl); setBrandLogoPreviewObjectUrl(''); }
            } else {
                setUploadedBgUrl(res.url);
                setBgUploadProgress(100);
                if (bgPreviewObjectUrl) { URL.revokeObjectURL(bgPreviewObjectUrl); setBgPreviewObjectUrl(''); }
            }
        } else {
            triggerNotification(xhr.status === 413 ? t("Hệ thống báo lỗi file quá lớn.") : t("Lỗi tải file. Vui lòng thử lại."), 'error', t("Tải tệp thất bại"));
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
                if (coverPreviewObjectUrl) { URL.revokeObjectURL(coverPreviewObjectUrl); setCoverPreviewObjectUrl(''); }
                const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else if (type === 'brandLogo') {
                setUploadedBrandLogoUrl('');
                setBrandLogoUploadProgress(0);
                if (brandLogoPreviewObjectUrl) { URL.revokeObjectURL(brandLogoPreviewObjectUrl); setBrandLogoPreviewObjectUrl(''); }
            } else {
                setUploadedBgName('');
                setUploadedBgUrl('');
                setBgUploadProgress(0);
                if (bgPreviewObjectUrl) { URL.revokeObjectURL(bgPreviewObjectUrl); setBgPreviewObjectUrl(''); }
                const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
                if (input) input.value = '';
            }
        }
    };
    
    xhr.onerror = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        triggerNotification(t("Lỗi kết nối. Có thể mạng yếu hoặc file quá khổng lồ."), 'error', t("Lỗi kết nối"));
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
            if (coverPreviewObjectUrl) { URL.revokeObjectURL(coverPreviewObjectUrl); setCoverPreviewObjectUrl(''); }
            const input = document.getElementById('coverCreateUpload') as HTMLInputElement;
            if (input) input.value = '';
        } else if (type === 'brandLogo') {
            setUploadedBrandLogoUrl('');
            setBrandLogoUploadProgress(0);
            if (brandLogoPreviewObjectUrl) { URL.revokeObjectURL(brandLogoPreviewObjectUrl); setBrandLogoPreviewObjectUrl(''); }
        } else {
            setUploadedBgName('');
            setUploadedBgUrl('');
            setBgUploadProgress(0);
            if (bgPreviewObjectUrl) { URL.revokeObjectURL(bgPreviewObjectUrl); setBgPreviewObjectUrl(''); }
            const input = document.getElementById('bgCreateUpload') as HTMLInputElement;
            if (input) input.value = '';
        }
    };

    xhr.send(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileDirectly(file, type);
  };

  const saveDemo = async (isDraft: boolean) => {
    if (!title.trim()) {
      triggerNotification(t("Vui lòng nhập tên bài hát!"), "warning", t("Thiếu thông tin"));
      return;
    }
    if (linkType === 'direct') {
      if (!isDraft && !uploadedAudioUrl) {
        triggerNotification(t("Vui lòng tải lên file nhạc!"), "warning", t("Chưa tải nhạc"));
        return;
      }
      if (audioUploadProgress > 0 && audioUploadProgress < 100) {
        triggerNotification(t("Vui lòng đợi file nhạc tải lên xong!"), "info", t("Đang tải lên"));
        return;
      }
      if (bgUploadProgress > 0 && bgUploadProgress < 100) {
        triggerNotification(t("Vui lòng đợi ảnh nền tải lên xong!"), "info", t("Đang tải lên"));
        return;
      }
    }
    if (coverUploadProgress > 0 && coverUploadProgress < 100) {
      triggerNotification(t("Vui lòng đợi ảnh bìa tải lên xong!"), "info", t("Đang tải lên"));
      return;
    }

    setLoadingText(isDraft ? t("Đang lưu bản nháp...") : t("Đang xuất bản bài hát..."));
    setLoading(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('slug', slug);
    formData.set('composer', composer);
    formData.set('musicProducer', musicProducer);
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

    formData.set('password', password);
    formData.set('status', status);
    formData.set('isReleased', isReleased ? 'true' : 'false');
    formData.set('isDraft', isDraft ? 'true' : 'false');
    formData.set('isBrand', isBrand ? 'true' : 'false');
    formData.set('brandName', brandName);
    formData.set('brandBrief', brandBrief);
    formData.set('brandColor', brandColor);
    formData.set('brandLogoUrl', uploadedBrandLogoUrl);
    formData.set('brandReferenceVideos', JSON.stringify(brandReferenceVideos));
    
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
               triggerNotification(t("Đã lưu bản nháp thành công!"), 'success', t("Thành công"), () => {
                 navigate(getAdminLink(`/edit/${newDemo.id}`));
               });
            } else {
               triggerNotification(t("Đăng bài hát thành công!"), 'success', t("Thành công"), () => {
                 navigate(getAdminLink() + (linkType === 'indirect' ? '?subtab=landing_pages' : ''));
               });
            }
        } else {
            triggerNotification(t("Lỗi tải lên bài hát!"), 'error', t("Thất bại"));
        }
    } catch (err) {
        triggerNotification(t("Lỗi mạng!"), 'error', t("Lỗi mạng"));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveDemo(false);
  };

  return (
    <motion.div 
      initial={{ clipPath: 'circle(0% at 92% 92%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 92% 92%)', opacity: 1 }}
      exit={{ clipPath: 'circle(0% at 92% 92%)', opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-stone-100 text-stone-900 font-sans py-6 px-4 origin-bottom-right"
    >
      <div className="max-w-2xl mx-auto">
        <Link to={getAdminLink() + (linkType === 'indirect' ? '?subtab=landing_pages' : '')} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /> {t("Trở về Dashboard")}
        </Link>
        
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50">
          
          <div className="flex bg-stone-100 p-1 rounded-xl mb-5 w-full max-w-xs mx-auto relative">
            <button
              type="button"
              onClick={() => setLinkType('direct')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative transition-colors z-10 ${
                linkType === 'direct' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {linkType === 'direct' && (
                <motion.span
                  layoutId="linkTypeActiveBgAdd"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs z-0"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                />
              )}
              <span className="relative z-10">{t("Trực Tiếp")}</span>
            </button>
            <button
              type="button"
              onClick={() => setLinkType('indirect')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative transition-colors z-10 ${
                linkType === 'indirect' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {linkType === 'indirect' && (
                <motion.span
                  layoutId="linkTypeActiveBgAdd"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs z-0"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                />
              )}
              <span className="relative z-10">Landing Page</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 create-demo-form">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên bài hát")}<span className="text-red-500">*</span></label>
              <input name="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder={t("Nhập tên bài hát mới...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Phần mở rộng (Link bài hát)")}</label>
              <div className="flex items-center gap-2 border border-stone-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/15 transition-all">
                <span className="text-stone-400 font-mono text-sm opacity-60 hidden sm:inline">/</span>
                <input name="slug" value={slug} onChange={e => {setSlug(generateSlug(e.target.value)); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent text-sm font-mono" />
              </div>
              <p className="text-xs text-stone-500 mt-2">{t("Sẽ tự động tạo dựa trên tên bài hát nếu bỏ trống.")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ca sĩ thể hiện")}</label>
                <input name="singer" value={singer} onChange={e => setSinger(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Sáng tác")}</label>
                <input name="composer" value={composer} onChange={e => setComposer(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Music Producer")}</label>
                <input name="musicProducer" value={musicProducer} onChange={e => setMusicProducer(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Bìa Đĩa (Dùng làm thumbnail)")}</label>
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
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-900 border border-stone-400 shadow-md relative shrink-0">
                    {(coverUploadProgress > 0 && coverUploadProgress < 100 && coverPreviewObjectUrl) ? (
                      <>
                        <img src={coverPreviewObjectUrl} className="w-full h-full object-cover opacity-60 blur-[1px]" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin" />
                          <span className="text-xs font-black drop-shadow text-white">{coverUploadProgress}%</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300" style={{ width: `${coverUploadProgress}%` }} />
                        </div>
                      </>
                    ) : uploadedCoverUrl ? (
                      <img src={getPreviewUrl(getThumbUrl(uploadedCoverUrl))} className="w-full h-full object-cover" />
                    ) : (appData?.aboutMe?.avatarUrl || appData?.slideshowImages?.[0]) ? (
                      <img src={getPreviewUrl(getThumbUrl(appData?.aboutMe?.avatarUrl || appData?.slideshowImages?.[0]))} className="w-full h-full object-cover opacity-30 blur-[0.5px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500"><Image className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${coverUploadProgress === 100 || uploadedCoverUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('coverCreateUpload')?.click()}>
                          <Upload className="w-4 h-4"/>
                          <span className="max-w-[150px] truncate">{coverUploadProgress > 0 && coverUploadProgress < 100 ? `Đang tải ${coverUploadProgress}%` : (uploadedCoverName ? formatFileName(uploadedCoverName) : t("Chọn bìa đĩa"))}</span>
                      </button>
                      {coverUploadProgress > 0 && coverUploadProgress < 100 ? (
                        <button type="button" onClick={() => cancelUpload('cover')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                      {uploadedCoverName ? `Tệp đã chọn: ${formatFileName(uploadedCoverName, 30)}` : t("Kéo thả bìa đĩa trực tiếp vào ô này")}
                    </p>
                  </div>
                  <input type="hidden" name="coverUrl" value={uploadedCoverUrl} />
                  <input type="file" id="coverCreateUpload" name="cover" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} className="hidden" />
                </div>
              </div>
 
              {linkType === 'direct' && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ảnh Nền (Nếu có)")}</label>
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
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden ${uploadedBgUrl || bgPreviewObjectUrl ? 'bg-stone-900 border border-stone-400' : 'bg-stone-100 border border-stone-300 text-stone-400'} shadow-md relative shrink-0`}>
                      {(bgUploadProgress > 0 && bgUploadProgress < 100 && bgPreviewObjectUrl) ? (
                        <>
                          <img src={bgPreviewObjectUrl} className="w-full h-full object-cover opacity-60 blur-[1px]" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                            <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin" />
                            <span className="text-xs font-black drop-shadow text-white">{bgUploadProgress}%</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300" style={{ width: `${bgUploadProgress}%` }} />
                          </div>
                        </>
                      ) : uploadedBgUrl ? (
                        <img src={getPreviewUrl(uploadedBgUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500"><Image className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${bgUploadProgress === 100 || uploadedBgUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('bgCreateUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate">{bgUploadProgress > 0 && bgUploadProgress < 100 ? `Đang tải ${bgUploadProgress}%` : (uploadedBgName ? formatFileName(uploadedBgName) : t("Chọn ảnh nền"))}</span>
                        </button>
                        {bgUploadProgress > 0 && bgUploadProgress < 100 ? (
                          <button type="button" onClick={() => cancelUpload('background')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                        {uploadedBgName ? `Tệp đã chọn: ${formatFileName(uploadedBgName, 30)}` : t("Kéo thả ảnh nền trực tiếp vào ô này")}
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
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("File Nhạc (Audio)")}<span className="text-red-500">*</span></label>
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
                          <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${audioUploadProgress === 100 || (uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com')) ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('audioCreateUpload')?.click()}>
                              <Upload className="w-4 h-4"/>
                              <span className="max-w-[200px] truncate">{audioUploadProgress > 0 && audioUploadProgress < 100 ? `Đang tải ${audioUploadProgress}%` : (uploadedAudioName ? formatFileName(uploadedAudioName) : t("Chọn file nhạc"))}</span>
                          </button>
                          {audioUploadProgress > 0 && audioUploadProgress < 100 ? (
                            <button type="button" onClick={() => cancelUpload('audio')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                          {uploadedAudioName ? `Tệp đã chọn: ${formatFileName(uploadedAudioName, 30)}` : t("Kéo thả file nhạc (.mp3, .wav, .m4a) trực tiếp vào ô này")}
                        </p>
                      </div>
                      <input type="file" id="audioCreateUpload" name="audio" accept="audio/mp3,audio/wav,audio/*" onChange={e => handleFileUpload(e, 'audio')} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="checkbox" id="isBrandCreateDirect" checked={isBrand} onChange={e => setIsBrand(e.target.checked)} className="w-5 h-5 accent-indigo-500 rounded border-stone-300 cursor-pointer" />
                    <label htmlFor="isBrandCreateDirect" className="font-semibold text-stone-700 text-sm cursor-pointer">{t("Là nhạc thương hiệu (Brand Music)")}</label>
                  </div>
                  <AnimatePresence>
                    {isBrand && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 pt-2">
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên đối tác")}<span className="text-red-500">*</span></label>
                            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="VD: Vingroup" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Brief khách hàng (nếu có)")}</label>
                            <textarea rows={3} value={brandBrief} onChange={e => setBrandBrief(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder={t("Nhập brief khách hàng...")} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2 flex justify-between items-center">
                              <span>{t("Video Tham Khảo (Tối đa 5 video)")}</span>
                              {brandReferenceVideos.length < 5 && (
                                <button type="button" onClick={() => setBrandReferenceVideos([...brandReferenceVideos, ""])} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200"><Plus className="w-3 h-3"/>{t("Thêm video")}</button>
                              )}
                            </label>
                            {brandReferenceVideos.map((vid, idx) => (
                              <div key={`l18921-idx-13-${idx}`} className="flex gap-2 mb-2">
                                <input type="text" value={vid} onChange={e => { const newVids = [...brandReferenceVideos]; newVids[idx] = e.target.value; setBrandReferenceVideos(newVids); }} className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" placeholder="Link video Youtube..." />
                                <button type="button" onClick={() => { const newVids = brandReferenceVideos.filter((_, i) => i !== idx); setBrandReferenceVideos(newVids); }} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Logo đối tác (Upload)")}</label>
                            <div 
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingBrandLogo(true); }}
                              onDragLeave={() => setIsDraggingBrandLogo(false)}
                              onDrop={(e) => { 
                                e.preventDefault(); 
                                setIsDraggingBrandLogo(false); 
                                const file = e.dataTransfer.files?.[0]; 
                                if (file && file.type.startsWith('image/')) {
                                   const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                                   setBrandLogoUploadProgress(10);
                                   fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                                   .then(res => res.json()).then(data => {
                                     setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                                   });
                                }
                              }}
                              className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                                isDraggingBrandLogo 
                                  ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                                  : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                              }`}
                            >
                              {uploadedBrandLogoUrl ? (
                                <img src={uploadedBrandLogoUrl} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                              ) : (
                                <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                                  <Image className="w-6 h-6" />
                                </div>
                              )}
                              <div className="flex-1 min-w-[150px]">
                                 <div className="flex items-center gap-2">
                                   <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${brandLogoUploadProgress === 100 || uploadedBrandLogoUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('brandLogoCreateDirectUpload')?.click()}>
                                       <Upload className="w-4 h-4"/>
                                       <span className="max-w-[150px] truncate">{brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? `Đang tải ${brandLogoUploadProgress}%` : (uploadedBrandLogoName ? formatFileName(uploadedBrandLogoName) : t("Chọn logo"))}</span>
                                   </button>
                                   {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? (
                                     <button type="button" onClick={() => setBrandLogoUploadProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                                   ) : (uploadedBrandLogoUrl ? (
                                     <button type="button" onClick={() => { setUploadedBrandLogoUrl(''); setBrandLogoUploadProgress(0); setUploadedBrandLogoName(''); (document.getElementById('brandLogoCreateDirectUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                                   ) : null)}
                                 </div>
                                 {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 && (
                                   <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                                     <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${brandLogoUploadProgress}%` }} />
                                   </div>
                                 )}
                                 <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                                   {uploadedBrandLogoName ? `Tệp đã chọn: ${formatFileName(uploadedBrandLogoName, 30)}` : t("Kéo thả logo trực tiếp vào ô này")}
                                 </p>
                              </div>
                              <input type="file" id="brandLogoCreateDirectUpload" name="brandLogo" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setBrandLogoUploadProgress(10);
                                  const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                                  fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                                  .then(res => res.json()).then(data => {
                                    setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                                  });
                                }
                              }} className="hidden" />
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="block text-sm font-semibold text-stone-700">{t("Lời bài hát")}</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {[
                        { label: 'Intro', value: 'Intro', className: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' },
                        { label: 'Verse', value: 'Verse', className: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
                        { label: 'Pre-Chorus', value: 'Pre-Chorus', className: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' },
                        { label: 'Chorus', value: 'Chorus', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
                        { label: 'Rap', value: 'Rap', className: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
                        { label: 'Drop', value: 'Drop', className: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
                        { label: 'Bridge', value: 'Bridge', className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                        { label: 'Outro', value: 'Outro', className: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' },
                        { label: 'Ending', value: 'Ending', className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' }
                      ].map((tag, tagIdx) => (
                        <button
                          key={`l19013-tag-badge-1-${tag.value}-${tagIdx}`}
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
                    placeholder={t("Nhập lời bài hát mới (nếu có)...")} 
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all leading-relaxed"
                  ></textarea>
                </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Template Chủ Đề")}</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <CustomSelect
                          value={template}
                          onChange={val => setTemplate(val)}
                          options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name), isVip: tc.isVip || tc.id === '2', disabled: (tc.isVip || tc.id === '2') && !(appData?.roleId === 'vip' || appData?.roleId === 'pro' || appData?.isSpecial || (appData?.maxTemplates && appData.maxTemplates > 0)) }))}
                          className="w-full"
                        />
                      </div>
                      <input type="hidden" name="templateCreate" value={template} />
                      <button 
                        type="button" 
                        disabled={!title.trim()}
                        onClick={() => setShowTemplatePicker(true)} 
                        className={`px-4 text-sm h-[42px] border border-transparent shrink-0 shadow-sm text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${(!title.trim()) ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'}`}
                      >
                        <Eye className="w-4 h-4" /> {t("Xem trước chủ đề")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {linkType === 'indirect' && (<>
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="checkbox" id="isBrandCreateIndirect" checked={isBrand} onChange={e => setIsBrand(e.target.checked)} className="w-5 h-5 accent-indigo-500 rounded border-stone-300 cursor-pointer" />
                    <label htmlFor="isBrandCreateIndirect" className="font-semibold text-stone-700 text-sm cursor-pointer">{t("Là nhạc thương hiệu (Brand Music)")}</label>
                  </div>
                  <AnimatePresence>
                    {isBrand && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 pt-2">
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên đối tác")}<span className="text-red-500">*</span></label>
                            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder="VD: Vingroup" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Brief khách hàng (nếu có)")}</label>
                            <textarea rows={3} value={brandBrief} onChange={e => setBrandBrief(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" placeholder={t("Nhập brief khách hàng...")} />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2 flex justify-between items-center">
                              <span>{t("Video Tham Khảo (Tối đa 5 video)")}</span>
                              {brandReferenceVideos.length < 5 && (
                                <button type="button" onClick={() => setBrandReferenceVideos([...brandReferenceVideos, ""])} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200"><Plus className="w-3 h-3"/>{t("Thêm video")}</button>
                              )}
                            </label>
                            {brandReferenceVideos.map((vid, idx) => (
                              <div key={`l19083-idx-14-${idx}`} className="flex gap-2 mb-2">
                                <input type="text" value={vid} onChange={e => { const newVids = [...brandReferenceVideos]; newVids[idx] = e.target.value; setBrandReferenceVideos(newVids); }} className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" placeholder="Link video Youtube..." />
                                <button type="button" onClick={() => { const newVids = brandReferenceVideos.filter((_, i) => i !== idx); setBrandReferenceVideos(newVids); }} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Logo đối tác (Upload)")}</label>
                            <div 
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingBrandLogo(true); }}
                              onDragLeave={() => setIsDraggingBrandLogo(false)}
                              onDrop={(e) => { 
                                e.preventDefault(); 
                                setIsDraggingBrandLogo(false); 
                                const file = e.dataTransfer.files?.[0]; 
                                if (file && file.type.startsWith('image/')) {
                                   const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                                   setBrandLogoUploadProgress(10);
                                   fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                                   .then(res => res.json()).then(data => {
                                     setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                                   });
                                }
                              }}
                              className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                                isDraggingBrandLogo 
                                  ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                                  : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                              }`}
                            >
                              {uploadedBrandLogoUrl ? (
                                <img src={uploadedBrandLogoUrl} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                              ) : (
                                <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                                  <Image className="w-6 h-6" />
                                </div>
                              )}
                              <div className="flex-1 min-w-[150px]">
                                 <div className="flex items-center gap-2">
                                   <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${brandLogoUploadProgress === 100 || uploadedBrandLogoUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('brandLogoCreateIndirectUpload')?.click()}>
                                       <Upload className="w-4 h-4"/>
                                       <span className="max-w-[150px] truncate">{brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? `Đang tải ${brandLogoUploadProgress}%` : (uploadedBrandLogoName ? formatFileName(uploadedBrandLogoName) : t("Chọn logo"))}</span>
                                   </button>
                                   {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? (
                                     <button type="button" onClick={() => setBrandLogoUploadProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                                   ) : (uploadedBrandLogoUrl ? (
                                     <button type="button" onClick={() => { setUploadedBrandLogoUrl(''); setBrandLogoUploadProgress(0); setUploadedBrandLogoName(''); (document.getElementById('brandLogoCreateIndirectUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                                   ) : null)}
                                 </div>
                                 {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 && (
                                   <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                                     <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${brandLogoUploadProgress}%` }} />
                                   </div>
                                 )}
                                 <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                                   {uploadedBrandLogoName ? `Tệp đã chọn: ${formatFileName(uploadedBrandLogoName, 30)}` : t("Kéo thả logo trực tiếp vào ô này")}
                                 </p>
                              </div>
                              <input type="file" id="brandLogoCreateIndirectUpload" name="brandLogo" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setBrandLogoUploadProgress(10);
                                  const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                                  fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                                  .then(res => res.json()).then(data => {
                                    setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                                  });
                                }
                              }} className="hidden" />
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 text-lg">{t("Liên kết phát nhạc")}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Zing MP3</label>
                    <input name="linkZing" value={linkZing} onChange={e => setLinkZing(e.target.value)} placeholder={t("Nhập link Zing MP3...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Spotify</label>
                    <input name="linkSpotify" value={linkSpotify} onChange={e => setLinkSpotify(e.target.value)} placeholder={t("Nhập link Spotify...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Apple Music</label>
                    <input name="linkApple" value={linkApple} onChange={e => setLinkApple(e.target.value)} placeholder={t("Nhập link Apple Music...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube Music</label>
                    <input name="linkYoutubeMusic" value={linkYoutubeMusic} onChange={e => setLinkYoutubeMusic(e.target.value)} placeholder={t("Nhập link YouTube Music...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube MV</label>
                    <input name="linkYoutube" value={linkYoutube} onChange={e => setLinkYoutube(e.target.value)} placeholder={t("Nhập link YouTube MV...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                </div>
              </div>
              </>
            )}

            {linkType !== 'indirect' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                  <div className="relative min-h-[70px]">
                    <AnimatePresence mode="wait">
                      {!isReleased ? (
                        <motion.div
                          key="password-slot-create"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu bảo vệ (tùy chọn)")}</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input 
                              name="password" 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              placeholder={t("Bỏ trống nếu không cần")} 
                              className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono bg-white" 
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="release-year-slot-create"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Năm phát hành")}</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input 
                              name="releaseYear" 
                              value={releaseYear} 
                              onChange={e => setReleaseYear(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                              placeholder={t("2026")} 
                              maxLength={4}
                              className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono bg-white" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Hiển thị (Trạng thái phát hành)")}</label>
                     <CustomSelect
                       value={status}
                       onChange={val => setStatus(val)}
                       options={[
                         { value: 'public', label: t("Công khai") },
                         { value: 'hidden', label: t("Ẩn") }
                       ]}
                     />
                     <input type="hidden" name="status" value={status} />
                  </div>
                </div>

                <AchievementEditor achievements={achievements} onChange={setAchievements} />

                <div className="mt-6 mb-6">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Link Google Drive tải nhạc")}</label>
                  <div className="relative">
                    <FolderDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input 
                      name="linkDrive" 
                      value={linkDrive} 
                      onChange={e => setLinkDrive(e.target.value)} 
                      placeholder="https://drive.google.com/file/d/.../view" 
                      className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono" 
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{t("Nếu nhập link, người dùng sẽ thấy icon tải nhạc (Download) ở trên phần lời bài hát để click tải.")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Trạng thái phát hành")}</label>
                    <div 
                      onClick={() => {
                        const checked = !isReleased;
                        setIsReleased(checked);
                        if (checked) {
                          setPassword('');
                          if (!releaseYear) setReleaseYear(new Date().getFullYear().toString());
                        }
                      }}
                      className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-stone-300 cursor-pointer h-[42px] hover:border-stone-400 transition-all select-none"
                    >
                      <span className="text-sm font-medium text-stone-700">
                        {isReleased ? t("Đã phát hành") : t("Chưa phát hành")}
                      </span>
                      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isReleased ? 'bg-stone-900' : 'bg-stone-200'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-300 ${isReleased ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" name="isReleased" checked={isReleased} readOnly className="sr-only" />
                    </div>
                  </div>

                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Playlist")}</label>
                    <PlaylistSelect selectedIds={playlistIds} onChange={setPlaylistIds} />
                   </div>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
              <button 
                disabled={loading} 
                type="button" 
                onClick={() => saveDemo(true)}
                className="btn-glass-draft text-stone-900 text-sm sm:text-base font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all duration-300 disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] shadow-sm sm:flex-initial sm:min-w-[150px]"
              >
                <FileText className="w-5 h-5 text-amber-500" />
                {loading ? t("Đang lưu...") : t("Lưu Nháp")}
              </button>
              
              <button 
                disabled={loading} 
                type="button" 
                onClick={() => saveDemo(false)}
                className="btn-black-gradient-blur text-white text-sm sm:text-base font-bold py-2.5 px-5 sm:px-6 rounded-xl disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] sm:flex-initial sm:min-w-[150px]"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {loading ? t("Đang xuất bản...") : t("Xuất Bản")}
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
              singer: singer || appData?.artistName || t("Nghệ sĩ"),
              composer: composer || appData?.artistName || t("Nghệ sĩ"),
              musicProducer: musicProducer || undefined,
              audioUrl: uploadedAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              coverUrl: uploadedCoverUrl || appData?.aboutMe?.avatarUrl || appData?.homeCoverUrl || randomSlideUrl || (slideshowImages && slideshowImages.length > 0 ? slideshowImages[0] : '') || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
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
            <p className="text-stone-400 text-xs leading-relaxed">{t("Vui lòng đợi trong giây lát. Hệ thống đang tối ưu hóa dữ liệu và lưu trữ an toàn trên cloud.")}</p>
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
            <h4 className="text-white font-black text-xl mb-2 tracking-tight">{notification.title || (notification.type === 'error' ? t("Lỗi xảy ra") : t("Thông báo"))}</h4>
            <p className="text-stone-400 text-xs leading-relaxed mb-6">{notification.message}</p>
            <button 
              type="button" 
              onClick={handleCloseNotification}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 px-6 rounded-xl transition-all shadow-md tracking-tight text-sm"
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ---- ADMIN EDIT DEMO ----
export function AdminEditDemo() {
  const { t } = useAdminTranslation();
  const { landingConfig } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(t("Đang xử lý..."));
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

  const getPreviewUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return url;
  };

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
  const [isBrand, setIsBrand] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandBrief, setBrandBrief] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [brandReferenceVideos, setBrandReferenceVideos] = useState<string[]>([]);
  const [brandLogoUploadProgress, setBrandLogoUploadProgress] = useState(0);
  const [uploadedBrandLogoUrl, setUploadedBrandLogoUrl] = useState("");
  const [uploadedBrandLogoName, setUploadedBrandLogoName] = useState("");
  const [composer, setComposer] = useState('');
  const [musicProducer, setMusicProducer] = useState('');
  const [singer, setSinger] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [template, setTemplate] = useState('1');
  const [releaseYear, setReleaseYear] = useState('');
  const [linkType, setLinkType] = useState<'direct' | 'indirect'>('direct');
  const [linkZing, setLinkZing] = useState('');
  const [linkSpotify, setLinkSpotify] = useState('');
  const [linkApple, setLinkApple] = useState('');
  const [linkYoutubeMusic, setLinkYoutubeMusic] = useState('');
  const [linkYoutube, setLinkYoutube] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [isReleased, setIsReleased] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingBrandLogo, setIsDraggingBrandLogo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [randomSlideUrl, setRandomSlideUrl] = useState<string>('');
  const [coverPreviewObjectUrl, setCoverPreviewObjectUrl] = useState('');
  const [bgPreviewObjectUrl, setBgPreviewObjectUrl] = useState('');
  const [brandLogoPreviewObjectUrl, setBrandLogoPreviewObjectUrl] = useState('');
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

  useEffect(() => {
    if (!id) return;
    const fetchDemo = async () => {
      try {
        const headers: any = {
          'x-artist-extension': getArtistExtensionFromUrl(),
          'Authorization': `Bearer ${getAdminToken() || ''}`
        };
        const res = await fetch(`/api/demos/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const d = data.demo || data;
          setDemo(d);
          setTitle(d.title || '');
          setSlug(d.slug || '');
          setComposer(d.composer || '');
          setMusicProducer(d.musicProducer || '');
          setSinger(d.singer || '');
          setLyrics(d.lyrics || '');
          setTemplate(d.template || '1');
          setUploadedAudioUrl(d.audioUrl || '');
          setUploadedCoverUrl(d.coverUrl || '');
          setUploadedBgUrl(d.backgroundUrl || '');
          setPlaylistIds(d.playlistIds || []);
          setAchievements(d.achievements || []);
          setReleaseYear(d.releaseYear || '');
          setLinkType(d.linkType || 'direct');
          setLinkZing(d.linkZing || '');
          setLinkSpotify(d.linkSpotify || '');
          setLinkApple(d.linkApple || '');
          setLinkYoutubeMusic(d.linkYoutubeMusic || '');
          setLinkYoutube(d.linkYoutube || '');
          setLinkDrive(d.linkDrive || '');
          setPassword(d.password || '');
          setStatus(d.status || 'active');
          setIsReleased(d.isReleased !== false);
          setIsDraft(d.isDraft || false);
          setIsBrand(d.isBrand || false);
          setBrandName(d.brandName || '');
          setBrandBrief(d.brandBrief || '');
          setBrandColor(d.brandColor || '');
          setUploadedBrandLogoUrl(d.brandLogoUrl || '');
          setBrandReferenceVideos(d.brandReferenceVideos || []);
        }
      } catch (err) {
        console.error("Failed to load demo", err);
      }
    };
    fetchDemo();

    fetch('/api/admin/data', {
      headers: { 'x-artist-extension': getArtistExtensionFromUrl(), 'Authorization': `Bearer ${getAdminToken() || ''}` }
    })
      .then(r => r.json())
      .then(data => {
        setAppData(data);
        if (data.slideshowImages && data.slideshowImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.slideshowImages.length);
          setRandomSlideUrl(data.slideshowImages[randomIndex]);
        }
        if (data.templateConfigs && data.templateConfigs.length > 0) {
          const sorted = data.templateConfigs.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })).sort((a: any, b: any) => a.order - b.order);
          setTemplateConfigs(sorted);
        } else {
          const fallbackList = [
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
            { id: '18', name: 'Pháo hoa (Năm mới)' },
            { id: '19', name: 'Ký Ức' },
            { id: '20', name: 'Ngọt Ngào' }
          ];
          setTemplateConfigs(fallbackList.map((c: any) => ({ ...c, name: translateTemplateName(c.name || String(c.id), landingConfig?.templateNames, String(c.id)) })));
        }
      })
      .catch(() => {});
  }, [id]);


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

  const cancelUpload = (type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
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

  const uploadFileDirectly = async (file: File, type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
    if (type === 'audio') {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification(t("Dung lượng file nhạc quá lớn (") + (file.size / (1024 * 1024)).toFixed(1) + t("MB). Vui lòng tải lên file nhạc dưới 100MB để đảm bảo tốc độ xử lý của server."), 'warning', t("Tệp quá lớn"));
        const input = document.getElementById('audioEditUpload') as HTMLInputElement;
        if (input) input.value = '';
        return;
      }
      setUploadedAudioName(file.name);
    } else {
      if (file.size > 100 * 1024 * 1024) {
        triggerNotification(t("Dung lượng file ảnh quá lớn. Vui lòng chọn file dưới 100MB."), 'warning', t("Ảnh quá lớn"));
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
        setCoverPreviewObjectUrl(URL.createObjectURL(file));
      } else if (type === 'background') {
        setUploadedBgName(file.name);
        setBgPreviewObjectUrl(URL.createObjectURL(file));
      } else if (type === 'brandLogo') {
        setBrandLogoPreviewObjectUrl(URL.createObjectURL(file));
      }
    }

    const fileToUpload = (file.type && file.type.startsWith('image/')) ? await compressImageInBrowser(file) : file;
    const formData = new FormData();
    formData.append('file', fileToUpload);

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
                if (coverPreviewObjectUrl) { URL.revokeObjectURL(coverPreviewObjectUrl); setCoverPreviewObjectUrl(''); }
            } else if (type === 'brandLogo') {
                setUploadedBrandLogoUrl(res.url);
                setBrandLogoUploadProgress(100);
                if (brandLogoPreviewObjectUrl) { URL.revokeObjectURL(brandLogoPreviewObjectUrl); setBrandLogoPreviewObjectUrl(''); }
            } else {
                setUploadedBgUrl(res.url);
                setBgUploadProgress(100);
                if (bgPreviewObjectUrl) { URL.revokeObjectURL(bgPreviewObjectUrl); setBgPreviewObjectUrl(''); }
            }
        } else {
            triggerNotification(xhr.status === 413 ? t("Hệ thống báo lỗi file quá lớn.") : t("Lỗi tải file. Vui lòng thử lại."), 'error', t("Tải tệp thất bại"));
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
                if (coverPreviewObjectUrl) { URL.revokeObjectURL(coverPreviewObjectUrl); setCoverPreviewObjectUrl(''); }
                const input = document.getElementById('coverEditUpload') as HTMLInputElement;
                if (input) input.value = '';
            } else if (type === 'brandLogo') {
                setUploadedBrandLogoUrl('');
                setBrandLogoUploadProgress(0);
                if (brandLogoPreviewObjectUrl) { URL.revokeObjectURL(brandLogoPreviewObjectUrl); setBrandLogoPreviewObjectUrl(''); }
            } else {
                setUploadedBgName('');
                setUploadedBgUrl('');
                setBgUploadProgress(0);
                if (bgPreviewObjectUrl) { URL.revokeObjectURL(bgPreviewObjectUrl); setBgPreviewObjectUrl(''); }
                const input = document.getElementById('bgEditUpload') as HTMLInputElement;
                if (input) input.value = '';
            }
        }
    };
    
    xhr.onerror = () => {
        if (type === 'audio') audioXhrRef.current = null;
        else if (type === 'cover') coverXhrRef.current = null;
        else if (type === 'background') bgXhrRef.current = null;

        triggerNotification(t("Lỗi kết nối. Có thể mạng yếu hoặc file quá khổng lồ."), 'error', t("Lỗi kết nối"));
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover' | 'background' | 'brandLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFileDirectly(file, type);
  };

  const saveDemo = async (isDraft: boolean) => {
    if (!title.trim()) {
      triggerNotification(t("Vui lòng nhập tên bài hát!"), "warning", t("Thiếu thông tin"));
      return;
    }
    if (linkType === 'direct') {
      const currentAudio = uploadedAudioUrl || demo?.audioUrl || '';
      if (!isDraft && !currentAudio) {
        triggerNotification(t("Vui lòng tải lên file nhạc!"), "warning", t("Chưa tải nhạc"));
        return;
      }
    }
    if (audioUploadProgress > 0 && audioUploadProgress < 100) {
      triggerNotification(t("Vui lòng đợi file nhạc tải lên xong!"), "info", t("Đang tải lên"));
      return;
    }
    if (coverUploadProgress > 0 && coverUploadProgress < 100) {
      triggerNotification(t("Vui lòng đợi ảnh bìa tải lên xong!"), "info", t("Đang tải lên"));
      return;
    }
    if (bgUploadProgress > 0 && bgUploadProgress < 100) {
      triggerNotification(t("Vui lòng đợi ảnh nền tải lên xong!"), "info", t("Đang tải lên"));
      return;
    }

    setLoadingText(isDraft ? t("Đang lưu bản nháp...") : t("Đang xuất bản bài hát..."));
    setLoading(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('slug', slug);
    formData.set('composer', composer);
    formData.set('musicProducer', musicProducer);
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

    formData.set('password', password);
    formData.set('status', status);
    formData.set('isReleased', isReleased ? 'true' : 'false');
    formData.set('isDraft', isDraft ? 'true' : 'false');
    formData.set('isBrand', isBrand ? 'true' : 'false');
    formData.set('brandName', brandName);
    formData.set('brandBrief', brandBrief);
    formData.set('brandColor', brandColor);
    formData.set('brandLogoUrl', uploadedBrandLogoUrl);
    formData.set('brandReferenceVideos', JSON.stringify(brandReferenceVideos));
    
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
            triggerNotification(isDraft ? t("Cập nhật bản nháp thành công!") : t("Cập nhật thành công!"), 'success', t("Thành công"), () => {
              navigate(getAdminLink() + (linkType === 'indirect' ? '?subtab=landing_pages' : (isDraft ? '?subtab=drafts' : (isReleased ? '?subtab=released' : '?subtab=demos'))));
            });
        } else {
            triggerNotification(t("Lỗi cập nhật. Thử tải lại trang và làm lại!"), 'error', t("Thất bại"));
        }
    } catch(err) {
        triggerNotification(t("Lỗi mạng!"), 'error', t("Lỗi mạng"));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveDemo(demo?.isDraft ? true : false);
  };

  if (!demo) return <LoadingScreen text={t("Đang tải dữ liệu bài hát...")} />;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to={getAdminLink() + (linkType === 'indirect' ? '?subtab=landing_pages' : (demo?.isDraft ? '?subtab=drafts' : (demo?.isReleased ? '?subtab=released' : '?subtab=demos')))} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">{t("Trở về Dashboard")}</span>
          </Link>
          <div className="flex gap-2 items-center">
            {demo?.audioUrl && (
              <a 
                href={demo.audioUrl} 
                className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition-colors shadow-sm font-bold text-sm"
                onClick={(e) => {
                   e.preventDefault();
                   fetch(demo.audioUrl)
                     .then(res => res.blob())
                     .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        const sStr = demo.singer || demo.composer ? ' - ' + (demo.singer || demo.composer) : '';
                        const rStr = demo.isReleased ? '' : ' (Demo)';
                        a.download = `${(demo.title || 'song').trim()}${sStr}${rStr}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                     })
                     .catch(() => window.open(demo.audioUrl, '_blank'));
                }}
              >
                <Download className="w-4 h-4" /> {t("Tải Nhạc")}
              </a>
            )}
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
                    setToast(t("Đã tạo bản sao thành công! Đang chuyển hướng..."));
                    setTimeout(() => {
                      setToast('');
                      navigate(getAdminLink(`/edit/${newDemo.id}`));
                    }, 1500);
                 } else {
                    alert(t("Lỗi khi duplicate bản ghi."));
                 }
              } catch (err) {
                 console.error(err);
              }
            }}
            className="bg-stone-200 text-stone-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-300 transition-colors shadow-sm font-bold text-sm"
          >
            <Copy className="w-4 h-4" /> {t("Nhân bản")}
          </button>
          </div>
        </div>
        
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/50">
          
          <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-full max-w-xs mx-auto relative">
            <button
              type="button"
              onClick={() => setLinkType('direct')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative transition-colors z-10 ${
                linkType === 'direct' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {linkType === 'direct' && (
                <motion.span
                  layoutId="linkTypeActiveBgEdit"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs z-0"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                />
              )}
              <span className="relative z-10">{t("Trực Tiếp")}</span>
            </button>
            <button
              type="button"
              onClick={() => setLinkType('indirect')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg relative transition-colors z-10 ${
                linkType === 'indirect' ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {linkType === 'indirect' && (
                <motion.span
                  layoutId="linkTypeActiveBgEdit"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs z-0"
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
                />
              )}
              <span className="relative z-10">Landing Page</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 edit-demo-form">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên bài hát")}<span className="text-red-500">*</span></label>
              <input name="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder={t("Nhập tên bài hát...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Phần mở rộng (Link bài hát)")}</label>
              <div className="flex items-center gap-2 border border-stone-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/15 transition-all">
                <span className="text-stone-400 font-mono text-sm opacity-60 hidden sm:inline">/</span>
                <input name="slug" value={slug} onChange={e => {setSlug(generateSlug(e.target.value)); setIsSlugEdited(true);}} placeholder="ten-bai-hat..." className="w-full focus:outline-none bg-transparent text-sm font-mono" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ca sĩ thể hiện")}</label>
                <input name="singer" value={singer} onChange={e => setSinger(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Sáng tác")}</label>
                <input name="composer" value={composer} onChange={e => setComposer(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Music Producer")}</label>
                <input name="musicProducer" value={musicProducer} onChange={e => setMusicProducer(e.target.value)} placeholder={appData?.artistName || t("Nghệ sĩ")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Bìa Đĩa (Dùng làm thumbnail)")}</label>
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
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-900 border border-stone-400 shadow-md relative shrink-0">
                    {(coverUploadProgress > 0 && coverUploadProgress < 100 && coverPreviewObjectUrl) ? (
                      <>
                        <img src={coverPreviewObjectUrl} className="w-full h-full object-cover opacity-60 blur-[1px]" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin" />
                          <span className="text-xs font-black drop-shadow text-white">{coverUploadProgress}%</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300" style={{ width: `${coverUploadProgress}%` }} />
                        </div>
                      </>
                    ) : (uploadedCoverUrl || demo?.coverUrl) ? (
                      <img src={getPreviewUrl(getThumbUrl(uploadedCoverUrl || demo?.coverUrl))} className="w-full h-full object-cover" />
                    ) : (appData?.aboutMe?.avatarUrl || appData?.slideshowImages?.[0] || randomSlideUrl) ? (
                      <img src={getPreviewUrl(getThumbUrl(appData?.aboutMe?.avatarUrl || appData?.slideshowImages?.[0] || randomSlideUrl))} className="w-full h-full object-cover opacity-30 blur-[0.5px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500"><Image className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${coverUploadProgress === 100 || uploadedCoverUrl || demo?.coverUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('coverEditUpload')?.click()}>
                          <Upload className="w-4 h-4"/>
                          <span className="max-w-[150px] truncate"></span>
                            {coverUploadProgress > 0 && coverUploadProgress < 100 
                              ? `Đang tải ${coverUploadProgress}%` 
                              : (uploadedCoverName ? formatFileName(uploadedCoverName) : (getFileNameFromUrl(uploadedCoverUrl || demo?.coverUrl) ? formatFileName(getFileNameFromUrl(uploadedCoverUrl || demo?.coverUrl)) : t("Chọn bìa đĩa")))}
                          
                      </button>
                      {coverUploadProgress > 0 && coverUploadProgress < 100 ? (
                        <button type="button" onClick={() => cancelUpload('cover')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                          : t("Kéo thả bìa đĩa trực tiếp vào ô này"))}
                    </p>
                  </div>
                  <input type="hidden" name="coverUrl" value={uploadedCoverUrl} />
                  <input type="file" id="coverEditUpload" name="cover" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} className="hidden" />
                </div>
              </div>
 
              {linkType === 'direct' && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ảnh Nền (Nếu có)")}</label>
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
                    <div className={`w-20 h-20 rounded-2xl overflow-hidden ${uploadedBgUrl || bgPreviewObjectUrl ? 'bg-stone-900 border border-stone-400' : 'bg-stone-100 border border-stone-300 text-stone-400'} shadow-md relative shrink-0`}>
                      {(bgUploadProgress > 0 && bgUploadProgress < 100 && bgPreviewObjectUrl) ? (
                        <>
                          <img src={bgPreviewObjectUrl} className="w-full h-full object-cover opacity-60 blur-[1px]" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                            <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-emerald-400 animate-spin" />
                            <span className="text-xs font-black drop-shadow text-white">{bgUploadProgress}%</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300" style={{ width: `${bgUploadProgress}%` }} />
                          </div>
                        </>
                      ) : (uploadedBgUrl || demo?.backgroundUrl) ? (
                        <img src={getPreviewUrl(uploadedBgUrl || demo?.backgroundUrl)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500"><Image className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${bgUploadProgress === 100 || uploadedBgUrl || demo?.backgroundUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('bgEditUpload')?.click()}>
                            <Upload className="w-4 h-4"/>
                            <span className="max-w-[150px] truncate"></span>
                              {bgUploadProgress > 0 && bgUploadProgress < 100 
                                ? `Đang tải ${bgUploadProgress}%` 
                                : (uploadedBgName ? formatFileName(uploadedBgName) : (getFileNameFromUrl(uploadedBgUrl || demo?.backgroundUrl) ? formatFileName(getFileNameFromUrl(uploadedBgUrl || demo?.backgroundUrl)) : t("Chọn ảnh nền")))}
                            
                        </button>
                        {bgUploadProgress > 0 && bgUploadProgress < 100 ? (
                          <button type="button" onClick={() => cancelUpload('background')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
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
                            : t("Kéo thả ảnh nền trực tiếp vào ô này"))}
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
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("File Nhạc (Audio)")}<span className="text-red-500">*</span></label>
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
                    {/* Google Drive Warning if applicable */}
                    {(() => {
                      const currentAudioUrl = uploadedAudioUrl || demo?.audioUrl || "";
                      if (currentAudioUrl && (currentAudioUrl.includes("drive.google.com") || currentAudioUrl.includes("docs.google.com"))) {
                        return (
                          <div className="text-xs text-stone-500 mb-2">
                            <span className="text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl text-[11px] inline-block leading-normal">
                              ⚠️ Link Google Drive cũ (Hệ thống đã tắt tính năng chạy link trực tiếp, vui lòng tải file nhạc lên để phát ổn định)
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex flex-wrap gap-4 items-center">
                      {(uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                        <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm"><FileAudio className="w-8 h-8"/></div>
                      )}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${audioUploadProgress === 100 || (uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com')) || (demo?.audioUrl && !uploadedAudioUrl) ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('audioEditUpload')?.click()}>
                              <Upload className="w-4 h-4"/>
                              <span className="max-w-[200px] truncate"></span>
                                {audioUploadProgress > 0 && audioUploadProgress < 100 
                                  ? `Đang tải ${audioUploadProgress}%` 
                                  : (uploadedAudioName ? formatFileName(uploadedAudioName) : (getFileNameFromUrl(uploadedAudioUrl || demo?.audioUrl) ? formatFileName(getFileNameFromUrl(uploadedAudioUrl || demo?.audioUrl)) : t("Chọn file nhạc")))}
                              
                          </button>
                          {audioUploadProgress > 0 && audioUploadProgress < 100 ? (
                            <button type="button" onClick={() => cancelUpload('audio')} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                          ) : ((uploadedAudioUrl && !uploadedAudioUrl.includes('drive.google.com') && !uploadedAudioUrl.includes('docs.google.com') || audioUploadProgress === 100) ? (
                            <button type="button" onClick={() => { setUploadedAudioUrl(''); setAudioUploadProgress(0); setUploadedAudioName(''); (document.getElementById('audioEditUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                          ) : null)}

                          {demo?.audioUrl && demo?.backupAudioUrl && demo?.backupAudioUrl !== demo?.audioUrl && (
                            <button
                              type="button"
                              disabled={isReverting}
                              onClick={handleRevertAudio}
                              className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-bold text-[11px] shadow-sm shrink-0 disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> 
                              {isReverting ? t("Đang khôi phục...") : t("Khôi phục bản cũ")}
                            </button>
                          )}
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
                              : t("Kéo thả file nhạc (.mp3, .wav, .m4a) trực tiếp vào ô này"))}
                        </p>
                      </div>
                      <input type="file" id="audioEditUpload" name="audio" accept="audio/mp3,audio/wav,audio/*" onChange={e => handleFileUpload(e, 'audio')} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="checkbox" id="isBrandEditDirect" checked={isBrand} onChange={e => setIsBrand(e.target.checked)} className="w-5 h-5 accent-indigo-500 rounded border-stone-300" />
                    <label htmlFor="isBrandEditDirect" className="font-semibold text-stone-700 text-sm cursor-pointer">{t("Là nhạc thương hiệu (Brand Music)")}</label>
                  </div>
                  {isBrand && (
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên đối tác")}<span className="text-red-500">*</span></label>
                        <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all shadow-sm" placeholder="VD: Vingroup" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Brief khách hàng (nếu có)")}</label>
                        <textarea rows={3} value={brandBrief} onChange={e => setBrandBrief(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all shadow-sm" placeholder={t("Nhập brief khách hàng...")} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2 flex justify-between items-center">
                          <span>{t("Video Tham Khảo (Tối đa 5 video)")}</span>
                          {brandReferenceVideos.length < 5 && (
                            <button type="button" onClick={() => setBrandReferenceVideos([...brandReferenceVideos, ""])} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200"><Plus className="w-3 h-3"/>{t("Thêm video")}</button>
                          )}
                        </label>
                        {brandReferenceVideos.map((vid, idx) => (
                          <div key={`l20264-idx-15-${idx}`} className="flex gap-2 mb-2">
                            <input type="text" value={vid} onChange={e => { const newVids = [...brandReferenceVideos]; newVids[idx] = e.target.value; setBrandReferenceVideos(newVids); }} className="flex-1 border border-stone-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-sm text-sm" placeholder="Link video Youtube..." />
                            <button type="button" onClick={() => { const newVids = brandReferenceVideos.filter((_, i) => i !== idx); setBrandReferenceVideos(newVids); }} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Logo đối tác (Upload)")}</label>
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingBrandLogo(true); }}
                          onDragLeave={() => setIsDraggingBrandLogo(false)}
                          onDrop={(e) => { 
                            e.preventDefault(); 
                            setIsDraggingBrandLogo(false); 
                            const file = e.dataTransfer.files?.[0]; 
                            if (file && file.type.startsWith('image/')) {
                               const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                               setBrandLogoUploadProgress(10);
                               fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                               .then(res => res.json()).then(data => {
                                 setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                               });
                            }
                          }}
                          className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                            isDraggingBrandLogo 
                              ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                              : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                          }`}
                        >
                          {uploadedBrandLogoUrl ? (
                            <img src={uploadedBrandLogoUrl} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                              <Image className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-[150px]">
                             <div className="flex items-center gap-2">
                               <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${brandLogoUploadProgress === 100 || uploadedBrandLogoUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('brandLogoEditUpload')?.click()}>
                                   <Upload className="w-4 h-4"/>
                                   <span className="max-w-[150px] truncate">{brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? `Đang tải ${brandLogoUploadProgress}%` : (uploadedBrandLogoName ? formatFileName(uploadedBrandLogoName) : t("Chọn logo"))}</span>
                               </button>
                               {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? (
                                 <button type="button" onClick={() => setBrandLogoUploadProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                               ) : (uploadedBrandLogoUrl ? (
                                 <button type="button" onClick={() => { setUploadedBrandLogoUrl(''); setBrandLogoUploadProgress(0); setUploadedBrandLogoName(''); (document.getElementById('brandLogoEditUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                               ) : null)}
                             </div>
                             {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 && (
                               <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                                 <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${brandLogoUploadProgress}%` }} />
                               </div>
                             )}
                             <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                               {uploadedBrandLogoName ? `Tệp đã chọn: ${formatFileName(uploadedBrandLogoName, 30)}` : t("Kéo thả logo trực tiếp vào ô này")}
                             </p>
                          </div>
                          <input type="file" id="brandLogoEditUpload" name="brandLogo" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBrandLogoUploadProgress(10);
                              const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                              fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                              .then(res => res.json()).then(data => {
                                setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                              });
                            }
                          }} className="hidden" />
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="block text-sm font-semibold text-stone-700">{t("Lời bài hát")}</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {[
                        { label: 'Intro', value: 'Intro', className: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' },
                        { label: 'Verse', value: 'Verse', className: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
                        { label: 'Pre-Chorus', value: 'Pre-Chorus', className: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' },
                        { label: 'Chorus', value: 'Chorus', className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
                        { label: 'Rap', value: 'Rap', className: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
                        { label: 'Drop', value: 'Drop', className: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
                        { label: 'Bridge', value: 'Bridge', className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                        { label: 'Outro', value: 'Outro', className: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200' },
                        { label: 'Ending', value: 'Ending', className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' }
                      ].map((tag, tagIdx) => (
                        <button
                          key={`l20356-tag-badge-2-${tag.value}-${tagIdx}`}
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
                    placeholder={t("Nhập lời bài hát chỉnh sửa (nếu có)...")} 
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all leading-relaxed"
                  ></textarea>
                </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Template Chủ Đề")}</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <CustomSelect
                          value={template}
                          onChange={val => setTemplate(val)}
                          options={templateConfigs.map((tc: any) => ({ value: tc.id, label: t(tc.name), isVip: tc.isVip || tc.id === '2', disabled: (tc.isVip || tc.id === '2') && !(appData?.roleId === 'vip' || appData?.roleId === 'pro' || appData?.isSpecial || (appData?.maxTemplates && appData.maxTemplates > 0)) }))}
                          className="w-full"
                        />
                      </div>
                      <input type="hidden" name="template" value={template} />
                      <button 
                        type="button" 
                        disabled={!title.trim()}
                        onClick={() => setShowTemplatePicker(true)} 
                        className={`px-4 text-sm h-[42px] border border-transparent shrink-0 shadow-sm text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${(!title.trim()) ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10'}`}
                      >
                        <Eye className="w-4 h-4" /> {t("Xem trước chủ đề")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {linkType === 'indirect' && (<>
                
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="checkbox" id="isBrandCreate" checked={isBrand} onChange={e => setIsBrand(e.target.checked)} className="w-5 h-5 accent-indigo-500 rounded border-stone-300" />
                    <label htmlFor="isBrandCreate" className="font-semibold text-stone-700 text-sm cursor-pointer">{t("Là nhạc thương hiệu (Brand Music)")}</label>
                  </div>
                  {isBrand && (
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên đối tác")}<span className="text-red-500">*</span></label>
                        <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all shadow-sm" placeholder="VD: Vingroup" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Brief khách hàng (nếu có)")}</label>
                        <textarea rows={3} value={brandBrief} onChange={e => setBrandBrief(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all shadow-sm" placeholder={t("Nhập brief khách hàng...")} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2 flex justify-between items-center">
                          <span>{t("Video Tham Khảo (Tối đa 5 video)")}</span>
                          {brandReferenceVideos.length < 5 && (
                            <button type="button" onClick={() => setBrandReferenceVideos([...brandReferenceVideos, ""])} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200"><Plus className="w-3 h-3"/>{t("Thêm video")}</button>
                          )}
                        </label>
                        {brandReferenceVideos.map((vid, idx) => (
                          <div key={`l20427-idx-16-${idx}`} className="flex gap-2 mb-2">
                            <input type="text" value={vid} onChange={e => { const newVids = [...brandReferenceVideos]; newVids[idx] = e.target.value; setBrandReferenceVideos(newVids); }} className="flex-1 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all shadow-sm" placeholder="Link video Youtube..." />
                            <button type="button" onClick={() => { const newVids = brandReferenceVideos.filter((_, i) => i !== idx); setBrandReferenceVideos(newVids); }} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                                            <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Logo đối tác (Upload)")}</label>
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingBrandLogo(true); }}
                          onDragLeave={() => setIsDraggingBrandLogo(false)}
                          onDrop={(e) => { 
                            e.preventDefault(); 
                            setIsDraggingBrandLogo(false); 
                            const file = e.dataTransfer.files?.[0]; 
                            if (file && file.type.startsWith('image/')) {
                               const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                               setBrandLogoUploadProgress(10);
                               fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                               .then(res => res.json()).then(data => {
                                 setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                               });
                            }
                          }}
                          className={`flex flex-wrap gap-4 items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                            isDraggingBrandLogo 
                              ? 'border-indigo-500 bg-indigo-50/50 border-dashed scale-[1.01]' 
                              : 'border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/30'
                          }`}
                        >
                          {uploadedBrandLogoUrl ? (
                            <img src={uploadedBrandLogoUrl} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 flex items-center justify-center bg-stone-100 text-stone-400">
                              <Image className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-[150px]">
                             <div className="flex items-center gap-2">
                               <button type="button" className={`px-4 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-colors border shadow-sm ${brandLogoUploadProgress === 100 || uploadedBrandLogoUrl ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} onClick={() => document.getElementById('brandLogoCreateUpload')?.click()}>
                                   <Upload className="w-4 h-4"/>
                                   <span className="max-w-[150px] truncate">{brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? `Đang tải ${brandLogoUploadProgress}%` : (uploadedBrandLogoName ? formatFileName(uploadedBrandLogoName) : t("Chọn logo"))}</span>
                               </button>
                               {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 ? (
                                 <button type="button" onClick={() => setBrandLogoUploadProgress(0)} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0 animate-pulse" title={t("Hủy tải lên")}><X className="w-4 h-4"/></button>
                               ) : (uploadedBrandLogoUrl ? (
                                 <button type="button" onClick={() => { setUploadedBrandLogoUrl(''); setBrandLogoUploadProgress(0); setUploadedBrandLogoName(''); (document.getElementById('brandLogoCreateUpload') as HTMLInputElement).value = ''; }} className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"><X className="w-4 h-4"/></button>
                               ) : null)}
                             </div>
                             {brandLogoUploadProgress > 0 && brandLogoUploadProgress < 100 && (
                               <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                                 <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${brandLogoUploadProgress}%` }} />
                               </div>
                             )}
                             <p className="text-[11px] text-stone-400 mt-1.5 truncate max-w-full">
                               {uploadedBrandLogoName ? `Tệp đã chọn: ${formatFileName(uploadedBrandLogoName, 30)}` : t("Kéo thả logo trực tiếp vào ô này")}
                             </p>
                          </div>
                          <input type="file" id="brandLogoCreateUpload" name="brandLogo" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBrandLogoUploadProgress(10);
                              const fd = new FormData(); fd.append("file", file); fd.append("type", "image");
                              fetch("/api/upload", { method: "POST", body: fd, headers: { "Authorization": `Bearer ${getAdminToken() || ""}`, "x-artist-extension": getArtistExtensionFromUrl() }})
                              .then(res => res.json()).then(data => {
                                setUploadedBrandLogoUrl(data.url); setUploadedBrandLogoName(file.name); setBrandLogoUploadProgress(100);
                              });
                            }
                          }} className="hidden" />
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-100">
                <h3 className="font-bold text-stone-800 text-lg">{t("Liên kết phát nhạc")}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Zing MP3</label>
                    <input name="linkZing" value={linkZing} onChange={e => setLinkZing(e.target.value)} placeholder={t("Nhập link Zing MP3...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Spotify</label>
                    <input name="linkSpotify" value={linkSpotify} onChange={e => setLinkSpotify(e.target.value)} placeholder={t("Nhập link Spotify...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Apple Music</label>
                    <input name="linkApple" value={linkApple} onChange={e => setLinkApple(e.target.value)} placeholder={t("Nhập link Apple Music...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube Music</label>
                    <input name="linkYoutubeMusic" value={linkYoutubeMusic} onChange={e => setLinkYoutubeMusic(e.target.value)} placeholder={t("Nhập link YouTube Music...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">YouTube MV</label>
                    <input name="linkYoutube" value={linkYoutube} onChange={e => setLinkYoutube(e.target.value)} placeholder={t("Nhập link YouTube MV...")} className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono" />
                  </div>
                </div>
              </div>
              </>
            )}

            {linkType !== 'indirect' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
                  <div className="relative min-h-[70px]">
                    <AnimatePresence mode="wait">
                      {!isReleased ? (
                        <motion.div
                          key="password-slot-edit"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu bảo vệ (tùy chọn)")}</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input 
                              name="password" 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              placeholder={t("Bỏ trống nếu không cần")} 
                              className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono bg-white" 
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="release-year-slot-edit"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Năm phát hành")}</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input 
                              name="releaseYear" 
                              value={releaseYear} 
                              onChange={e => setReleaseYear(e.target.value.replace(/\D/g, '').slice(0, 4))} 
                              placeholder={t("2026")} 
                              maxLength={4}
                              className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all font-mono bg-white" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Hiển thị (Trạng thái phát hành)")}</label>
                     <CustomSelect
                       value={status}
                       onChange={val => setStatus(val)}
                       options={[
                         { value: 'public', label: t("Công khai") },
                         { value: 'hidden', label: t("Ẩn") }
                       ]}
                     />
                     <input type="hidden" name="status" value={status} />
                  </div>
                </div>

                <AchievementEditor achievements={achievements} onChange={setAchievements} />

                <div className="mt-6 mb-6">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Link Google Drive tải nhạc")}</label>
                  <div className="relative">
                    <FolderDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input 
                      name="linkDrive" 
                      value={linkDrive} 
                      onChange={e => setLinkDrive(e.target.value)} 
                      placeholder="https://drive.google.com/file/d/.../view" 
                      className="w-full border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 transition-all bg-white font-mono" 
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-2">{t("Nếu nhập link, người dùng sẽ thấy icon tải nhạc (Download) ở trên phần lời bài hát để click tải.")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 items-start">
                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Trạng thái phát hành")}</label>
                    <div 
                      onClick={() => {
                        const checked = !isReleased;
                        setIsReleased(checked);
                        if (checked) {
                          setPassword('');
                          if (!releaseYear) setReleaseYear(new Date().getFullYear().toString());
                        }
                      }}
                      className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-stone-300 cursor-pointer h-[42px] hover:border-stone-400 transition-all select-none"
                    >
                      <span className="text-sm font-medium text-stone-700">
                        {isReleased ? t("Đã phát hành") : t("Chưa phát hành")}
                      </span>
                      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isReleased ? 'bg-stone-900' : 'bg-stone-200'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-300 ${isReleased ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" name="isReleased" checked={isReleased} readOnly className="sr-only" />
                    </div>
                  </div>

                   <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Playlist")}</label>
                    <PlaylistSelect selectedIds={playlistIds} onChange={setPlaylistIds} />
                   </div>
                </div>

                {demo && demo.secretKey && (demo.linkType === 'indirect' ? password : (password || (appData?.globalPassword && !isReleased))) && (
                  <div className="bg-amber-50 border border-amber-250/60 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 mt-6 animate-[fade-in_0.3s_ease-out] w-full min-w-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:flex-1 min-w-0">
                      <div className="w-12 h-12 bg-amber-100/75 text-amber-700 rounded-xl flex items-center justify-center font-bold shrink-0 mx-auto sm:mx-0 shadow-xs">
                        <Unlock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1 text-center sm:text-left flex flex-col items-center sm:items-start">
                        <div className="font-bold text-stone-800 text-sm tracking-tight">{t("Secret Link (Chia sẻ trực tiếp xem không hỏi mật khẩu)")}</div>
                        <div className="text-xs text-amber-800 font-mono select-all truncate w-full max-w-full mt-1.5 px-3 py-1.5 bg-amber-150/40 rounded-lg border border-amber-200/50">
                          {formatShareUrl(getArtistFullUrl('/song/' + (demo.slug || demo.id)) + '?secret=' + demo.secretKey)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const baseUrl = '/song/';
                        const dynamicId = demo.slug || demo.id;
                        let url = getArtistFullUrl(baseUrl + dynamicId);
                        url = formatShareUrl(url);
                        url += `?secret=${demo.secretKey}`;
                        await copyToClipboard(url);
                        setToast(t("Đã copy Secret Link!"));
                        setTimeout(() => setToast(''), 3000);
                      }}
                      className="w-full md:w-auto px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-sm"
                    >
                      <Unlock className="w-4 h-4" /> Copy Secret Link
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-4 mt-6">
              {demo.isDraft ? (
                <div className="flex flex-wrap items-center gap-3 w-full justify-between sm:justify-end">
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-200/80 text-sm sm:text-base font-bold py-2.5 px-4 sm:px-5 rounded-xl transition-all duration-300 disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] shadow-xs cursor-pointer mr-auto sm:mr-0"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    {t("Xóa Bài Hát")}
                  </button>

                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(true)}
                    className="btn-glass-draft text-stone-900 text-sm sm:text-base font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all duration-300 disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] shadow-sm sm:flex-initial sm:min-w-[150px]"
                  >
                    <FileText className="w-5 h-5 text-amber-500" />
                    {loading ? t("Đang lưu...") : t("Lưu Nháp")}
                  </button>
                  
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(false)}
                    className="btn-black-gradient-blur text-white text-sm sm:text-base font-bold py-2.5 px-5 sm:px-6 rounded-xl disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] sm:flex-initial sm:min-w-[150px]"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {loading ? t("Đang xuất bản...") : t("Xuất Bản")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 w-full justify-between sm:justify-end">
                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-200/80 text-sm sm:text-base font-bold py-2.5 px-4 sm:px-5 rounded-xl transition-all duration-300 disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] shadow-xs cursor-pointer mr-auto sm:mr-0"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    {t("Xóa Bài Hát")}
                  </button>

                  <button 
                    disabled={loading} 
                    type="button" 
                    onClick={() => saveDemo(false)}
                    className="btn-black-gradient-blur text-white text-sm sm:text-base font-bold py-2.5 px-5 sm:px-6 rounded-xl disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] sm:flex-initial sm:min-w-[150px]"
                  >
                    <FileText className="w-5 h-5 text-amber-500" />
                    {loading ? t("Đang lưu...") : t("Lưu Thay Đổi")}
                  </button>
                  {(demo.linkType === 'indirect' ? demo.password : (demo.password || (appData?.globalPassword && !demo.isReleased))) && (
                    <button 
                      disabled={loading} 
                      type="button" 
                      onClick={async () => {
                        if (!(globalShowConfirm && await globalShowConfirm(t("Bạn có chắc muốn làm mới Secret Link của bài này? Secret Link cũ sẽ không còn hoạt động, tự động chuyển về đường dẫn gốc yêu cầu mật khẩu."), "Reset Secret Link", "danger"))) return;
                        const res = await fetch(`/api/demos/${demo.id}/reset-secret`, {
                          method: 'POST',
                          headers: {
                            'x-artist-extension': getArtistExtensionFromUrl(),
                            'Authorization': `Bearer ${getAdminToken() || ''}`
                          }
                        });
                        if (res.ok) {
                          if (globalShowConfirm) {
                            await globalShowConfirm(t("Đã reset Secret Link thành công!"), t("Thông báo"), "alert");
                          }
                        }
                      }} 
                      className="border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm sm:text-base font-semibold py-2.5 px-5 sm:px-6 rounded-xl transition-all disabled:opacity-80 flex justify-center items-center gap-2 active:scale-[0.98] sm:flex-initial sm:min-w-[150px] shadow-sm"
                    >
                      <Unlock className="w-5 h-5 text-red-500" />
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
              singer: singer || appData?.artistName || t("Nghệ sĩ"),
              composer: composer || appData?.artistName || t("Nghệ sĩ"),
              musicProducer: musicProducer || undefined,
              audioUrl: uploadedAudioUrl || demo?.audioUrl,
              coverUrl: uploadedCoverUrl || demo?.coverUrl || appData?.aboutMe?.avatarUrl || appData?.homeCoverUrl || randomSlideUrl || (appData?.slideshowImages && appData.slideshowImages.length > 0 ? appData.slideshowImages[0] : '') || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
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

      {/* CUSTOM UI CONFIRMATION POPUP FOR DELETING SONG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-stone-950/95 border border-stone-800 p-6 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-white font-black text-lg sm:text-xl mb-2 tracking-tight">
              {t("Xóa bài hát này?")}
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6">
              {t("Bài hát \"")}<strong className="text-stone-200">{title || demo?.title}</strong>{t("\" sẽ được chuyển vào Thùng Rác. Bạn có thể khôi phục lại bất cứ lúc nào.")}
            </p>
            <div className="flex items-center gap-3 w-full">
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button 
                type="button" 
                disabled={loading}
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  if (!demo?.id) return;
                  setLoading(true);
                  setLoadingText(t("Đang chuyển vào Thùng rác..."));
                  try {
                    const res = await fetch(`/api/demos/${demo.id}/delete`, {
                      method: 'POST',
                      headers: {
                        'x-artist-extension': getArtistExtensionFromUrl(),
                        'Authorization': `Bearer ${getAdminToken() || ''}`
                      }
                    });
                    if (res.ok) {
                      navigate('/admin/songs/trash');
                    } else {
                      triggerNotification(t("Không thể xóa bài hát. Vui lòng thử lại."), 'error');
                    }
                  } catch (err) {
                    triggerNotification(t("Lỗi kết nối khi xóa bài hát."), 'error');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {t("Xóa bài hát")}
              </button>
            </div>
          </motion.div>
        </div>
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
            <p className="text-stone-400 text-xs leading-relaxed">{t("Vui lòng đợi trong giây lát. Hệ thống đang tối ưu hóa dữ liệu và lưu trữ an toàn trên cloud.")}</p>
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
            <h4 className="text-white font-black text-xl mb-2 tracking-tight">{notification.title || (notification.type === 'error' ? t("Lỗi xảy ra") : t("Thông báo"))}</h4>
            <p className="text-stone-400 text-xs leading-relaxed mb-6">{notification.message}</p>
            <button 
              type="button" 
              onClick={handleCloseNotification}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 px-6 rounded-xl transition-all shadow-md tracking-tight text-sm"
            >
              Đồng ý
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function AdminPlaylistEdit() {
  const { t } = useAdminTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  
  const getSongCoverUrl = (songUrlOrObj?: string | any, thumbUrl?: string) => {
    if (typeof songUrlOrObj === 'object' && songUrlOrObj !== null) {
      return songUrlOrObj.thumbUrl || songUrlOrObj.coverUrl || songUrlOrObj.imageUrl || appData?.aboutMe?.avatarUrl || appData?.homeCoverUrl || '';
    }
    return thumbUrl || songUrlOrObj || appData?.aboutMe?.avatarUrl || appData?.homeCoverUrl || '';
  };
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

  const uploadWithProgress = async (file: File, setProgress: (p: number) => void): Promise<{url: string, thumbUrl: string}> => {
    const fileToUpload = (file.type && file.type.startsWith('image/')) ? await compressImageInBrowser(file) : file;
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
          resolve({ url: res.url, thumbUrl: res.thumbUrl || res.url });
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
      setPassword(sanitizePlaylistPassword(playlistData.playlist.password));
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
      body: JSON.stringify({ 
        title, 
        coverUrl: coverUrlPreview, 
        songIds, 
        isDraft, 
        password: isDraft ? password : '', 
        secretLink: isDraft ? secretLink : '' 
      })
    });
    setToast(t("Đã lưu thành công!"));
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

  if (isLoading) return <LoadingScreen text={t("Đang tải dữ liệu playlist...")} />;

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
             <ArrowLeft className="w-4 h-4" /> {t("Quay lại")}
          </Link>
          <button onClick={handleSave} className="bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] px-4 py-2 rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-sm">{t("Lưu thay đổi")}</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Tên Playlist")}</label>
            <input 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold" 
            />
          </div>

          <div className={`grid grid-cols-1 ${isDraft ? 'md:grid-cols-2' : ''} gap-6 pt-4 border-t border-stone-100`}>
            <div>
               <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Hiển Thị")}</label>
               <div className="relative">
                 <select value={isDraft ? 'true' : 'false'} onChange={e => {
                      const nextIsDraft = e.target.value === 'true';
                      setIsDraft(nextIsDraft);
                      if (!nextIsDraft) { setPassword(''); setSecretLink(''); }
                      else { setPassword(prev => sanitizePlaylistPassword(prev)); }
                   }} className="w-full border border-stone-300 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white appearance-none cursor-pointer hover:border-stone-400 transition-colors font-medium">
                    <option value="false">{t("Công khai (hiện ở trang chủ)")}</option>
                    <option value="true">{t("Riêng tư / Bản nháp (ẩn khỏi trang chủ)")}</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                 </div>
               </div>
            </div>
            {isDraft && (
              <div>
                 <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Mật khẩu Playlist (tùy chọn)")}</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                   <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("Bỏ trống nếu không cần")} className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" />
                 </div>
              </div>
            )}
          </div>

          {isDraft && (
            <div className="pt-4 border-t border-stone-100">
               <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-stone-700">{t("Secret Link (Link Bí Mật)")}</label>
                  <button type="button" onClick={async () => {
                     if (!secretLink || (globalShowConfirm && await globalShowConfirm(t("Tạo mới Secret Link? Link cũ sẽ không thể truy cập nữa."), t("Xác nhận tạo mới")))) {
                        setSecretLink(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
                     }
                  }} className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg font-bold transition-colors">{t("Tạo Link Mới")}</button>
               </div>
               {secretLink ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                     <p className="text-emerald-800 text-sm font-medium mb-2">{t("Sử dụng link sau để truy cập trực tiếp (không cần nhập mật khẩu playlist):")}</p>
                     <div className="flex items-center gap-2">
                        <input readOnly value={getArtistFullUrl(`/playlist/${id}?secret=${secretLink}`)} className="flex-1 bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm text-emerald-900 focus:outline-none" />
                        <button type="button" onClick={async () => {
                           await copyToClipboard(getArtistFullUrl(`/playlist/${id}?secret=${secretLink}`));
                           setToast(t("Đã copy Secret Link!"));
                           setTimeout(() => setToast(''), 3000);
                        }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">Copy</button>
                        <button type="button" onClick={() => setSecretLink('')} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg font-bold text-sm hover:bg-red-200">{t("Xóa")}</button>
                     </div>
                  </div>
               ) : (
                  <p className="text-sm text-stone-500 italic">{t("Chưa tạo Secret Link cho Playlist này.")}</p>
               )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{t("Ảnh bìa Playlist (Kích thước vuông)")}</label>
            <div className="flex flex-wrap gap-4 items-center">
              {coverUrlPreview && <img src={getPreviewUrl(coverUrlPreview)} className="w-24 h-24 rounded-xl object-cover border border-stone-200 shadow-sm" />}
              <button 
                type="button" 
                className={`w-24 h-24 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors border shadow-sm ${coverProgress === 100 ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'btn-white-glass-smoke border-transparent hover:scale-[1.02]'}`} 
                onClick={() => document.getElementById('playlistCoverUpload')?.click()}
              >
                  {coverProgress > 0 && coverProgress < 100 && (
                    <div className="absolute left-0 bottom-0 right-0 bg-stone-200 transition-all duration-300" style={{ height: `${coverProgress}%` }}></div>
                  )}
                  <span className="relative z-10 font-bold text-[10px] flex flex-col items-center gap-1"></span>
                    <Upload className="w-5 h-5"/> {coverProgress > 0 && coverProgress < 100 ? `${coverProgress}%` : ''}
                  
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
                  const result = await uploadWithProgress(e.target.files[0], setCoverProgress);
                  const url = typeof result === 'string' ? result : result.url;
                  setCoverUrlPreview(url);
                } catch (err) {
                  alert(t("Lỗi upload"));
                  setCoverProgress(0);
                }
              }} />
            </div>
            <p className="text-xs text-stone-500 mt-2">{t("Dùng để làm ảnh đại diện cho Playlist khi chia sẻ.")}</p>
          </div>

          <div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-stone-700">{t("Danh sách bài hát (Kéo thả để sắp xếp)")}</h3>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] hover:bg-stone-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> {t("Thêm bài hát")}
                </button>
             </div>
             {songs.length === 0 ? (
               <div className="text-center py-8 text-stone-400 border-2 border-dashed rounded-xl">{t("Chưa có bài hát nào trong playlist này.")}</div>
             ) : (
               <div className="space-y-2">
                 {songs.map((song, i) => (
                     <div
                        key={`l21025-${song.id || ''}-${i}`}
                       draggable
                       onDragStart={() => handleDragStart(i)}
                       onDragEnter={() => handleDragEnter(i)}
                       onDragOver={(e) => e.preventDefault()}
                       onDragEnd={handleDragEnd}
                       className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${draggingIdx === i ? 'bg-stone-100 border-stone-400 opacity-50 relative z-10' : 'bg-white border-stone-200 hover:bg-stone-50'} cursor-grab active:cursor-grabbing`}
                    >
                       <GripVertical className="w-5 h-5 text-stone-400 shrink-0" />
                       {getSongCoverUrl(song.thumbUrl || song.coverUrl) ? (
                         <img src={getPreviewUrl(getSongCoverUrl(song.thumbUrl || song.coverUrl))} className="w-12 h-12 rounded object-cover border border-stone-200 shrink-0" alt="" />
                       ) : (
                         <div className="w-12 h-12 bg-stone-100 rounded flex items-center justify-center shrink-0 border border-stone-200">
                           <Disc3 className="w-6 h-6 text-stone-400" />
                         </div>
                       )}
                       <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate">{song.title}</h4>
                          <MarqueeText className="text-xs text-stone-500 w-full">{song.singer || song.author}</MarqueeText>
                       </div>
                       <div className="flex items-center gap-1 shrink-0">
                         <Link
                           to={getAdminLink(`/edit/${song.id}`)}
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                           title={t("Chỉnh sửa bài hát (Admin)")}
                         >
                           <Edit3 className="w-4 h-4" />
                         </Link>
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             e.preventDefault();
                             setSongs(songs.filter(s => s.id !== song.id));
                           }}
                           className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                           title={t("Xóa khỏi playlist")}
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
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
              <h3 className="font-bold text-lg text-stone-900">{t("Thêm bài hát vào playlist")}</h3>
              <button 
                type="button"
                onClick={() => { setShowAddModal(false); setSelectedNewSongIds([]); }} 
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {(() => {
                const currentSongIds = songs.map(s => s.id);
                const availableSongs = appData?.demos?.filter((d: any) => !currentSongIds.includes(d.id)) || [];
                if (availableSongs.length === 0) {
                  return <p className="text-center text-stone-500 py-8">{t("Tất cả bài hát đều đã ở trong playlist này rồi.")}</p>;
                }
                return availableSongs.map((song: any, i: number) => {
                  const isChecked = selectedNewSongIds.includes(song.id);
                  return (
                    <label 
                      key={`l21090-${song.id || ''}-${i}`} 
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
                      {getSongCoverUrl(song.thumbUrl || song.coverUrl) ? (
                         <img src={getPreviewUrl(getSongCoverUrl(song.thumbUrl || song.coverUrl))} className="w-10 h-10 rounded object-cover border shrink-0" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center shrink-0 border">
                          <Disc3 className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm truncate">{song.title}</p>
                        <MarqueeText className="text-xs text-stone-500 w-full">{song.singer || song.author}</MarqueeText>
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
                className="px-4 py-2 bg-stone-900 text-white shadow-md hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 border border-transparent hover:bg-stone-800 transition-all duration-300 ease-out active:scale-[0.98] rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("Thêm đã chọn")} ({selectedNewSongIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


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

