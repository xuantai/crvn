import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChorusLogo } from './ChorusLogo';
import { Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X, LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home, Upload, MessageSquare, Send, AlertTriangle, Disc3, Bell, ChevronLeft, Mail, Palette, LayoutTemplate, GripVertical, Type } from 'lucide-react';


interface Artist {
  artistName: string;
  username: string;
  extension: string;
  password: string;
  verified: boolean;
  isPublic?: boolean;
  dbConfig?: string;
  pendingNameChange?: string;
  pendingUsernameChange?: string;
  pendingExtensionChange?: string;
  hasExternalWebsite?: boolean;
  externalWebsiteUrl?: string;
  customDomain?: string;
  defaultLanguage?: string;
  artistBio?: string;
  isSpecial?: boolean;
  extraUsernames?: string;
}

const DEFAULT_TEMPLATE_NAMES: Record<string, string> = {
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

export default function ACPControlPanel() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('masterToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [landingConfig, setLandingConfig] = useState<any>({});

  // ACP Navigation / Tab system
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

  const showConfirm = (message: string, title = 'Xác nhận', type: 'confirm' | 'danger' | 'success' | 'alert' = 'confirm'): Promise<boolean> => {
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
  const [activeTab, setActiveTab] = useState<'artists' | 'landing' | 'tickets' | 'templates' | 'faq' | 'keywords' | 'content' | 'roles'>('artists');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [artistCurrentPage, setArtistCurrentPage] = useState(0);
  const [artistPageSize, setArtistPageSize] = useState<number>(20); // 20, 50, 100

  // Email states
  const [mailRecipientType, setMailRecipientType] = useState<'all' | 'verified' | 'unverified' | 'registered_after'>('all');
  const [mailRegisteredAfterDate, setMailRegisteredAfterDate] = useState('');
  const [mailTitle, setMailTitle] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailSending, setMailSending] = useState(false);
  const [mailSuccess, setMailSuccess] = useState('');
  const [mailError, setMailError] = useState('');
  const [sentMails, setSentMails] = useState<any[]>([]);

  // ACP data
  const [artists, setArtists] = useState<Artist[]>([]);
  const [newArtistCreatedInfo, setNewArtistCreatedInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

  // Tickets states
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [chatText, setChatText] = useState('');
  const [isHandlingTicketAction, setIsHandlingTicketAction] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  // Form states (Artist)
  const [artistName, setArtistName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistUsername, setArtistUsername] = useState('');
  const [artistExtension, setArtistExtension] = useState('');
  const [artistPassword, setArtistPassword] = useState('');
  const [artistVerified, setArtistVerified] = useState(true);
  const [artistIsPublic, setArtistIsPublic] = useState(true);
  const [artistDbConfig, setArtistDbConfig] = useState('');
  const [artistHasExternalWebsite, setArtistHasExternalWebsite] = useState(false);
  const [artistExternalWebsiteUrl, setArtistExternalWebsiteUrl] = useState('');
  const [formErr, setFormErr] = useState('');
  const [artistDefaultLanguage, setArtistDefaultLanguage] = useState('vi');
  const [isTranslatingArtist, setIsTranslatingArtist] = useState(false);
  const [artistBio, setArtistBio] = useState('');
  const [artistIsSpecial, setArtistIsSpecial] = useState(false);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  // Form states (Landing Config)
  const [landingTagline, setLandingTagline] = useState('');
  const [landingHeroTitle, setLandingHeroTitle] = useState('');
  const [landingHeroSubtitle, setLandingHeroSubtitle] = useState('');
  const [landingHeroDesc, setLandingHeroDesc] = useState('');
  const [landingFooterText, setLandingFooterText] = useState('');
  const [systemIp, setSystemIp] = useState('');
  const [adminUsername, setAdminUsername] = useState('acxuantai');
  const [adminPassword, setAdminPassword] = useState('MatKhauDay123');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [templateNames, setTemplateNames] = useState<Record<string, string>>({});
  const [templateVip, setTemplateVip] = useState<Record<string, boolean>>({});
  const [demoSongTitle, setDemoSongTitle] = useState("");
  const [demoSongArtist, setDemoSongArtist] = useState("");
  const [demoSongLyrics, setDemoSongLyrics] = useState("");

  // Metadata & Custom sharing states
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingOgImageUrl, setLandingOgImageUrl] = useState('');
  const [landingFaviconUrl, setLandingFaviconUrl] = useState('');
  const [faviconProgress, setFaviconProgress] = useState(0);
  const [ogImageProgress, setOgImageProgress] = useState(0);
  
  // Feature section states
  const [feature1Title, setFeature1Title] = useState('');
  const [feature1Desc, setFeature1Desc] = useState('');
  const [feature2Title, setFeature2Title] = useState('');
  const [feature2Desc, setFeature2Desc] = useState('');
  const [feature3Title, setFeature3Title] = useState('');
  const [feature3Desc, setFeature3Desc] = useState('');
  const [feature4Title, setFeature4Title] = useState('');
  const [feature4Desc, setFeature4Desc] = useState('');
  
  // Interface labels
  const [menuVaultVi, setMenuVaultVi] = useState('Kho Nhạc');
  const [menuAboutVi, setMenuAboutVi] = useState('Về Tôi');
  const [menuBioVi, setMenuBioVi] = useState('Tiểu Sử');
  const [featuresTitle, setFeaturesTitle] = useState('');
  const [featuresSub, setFeaturesSub] = useState('');
  const [globalLayoutSections, setGlobalLayoutSections] = useState<string[]>(['title', 'spotify', 'vault', 'mv']);
  const [statusBadge, setStatusBadge] = useState('');

  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [isTranslatingLanding, setIsTranslatingLanding] = useState(false);
  const [isTranslatingTemplates, setIsTranslatingTemplates] = useState(false);
  const [landingSuccessMsg, setLandingSuccessMsg] = useState('');
  const [subscribers, setSubscribers] = useState<string[]>([]);

  // FAQ & Terms States
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);

  // Forbidden Keywords States
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  // Content Management States (Flagged songs)
  const [flaggedSongs, setFlaggedSongs] = useState<any[]>([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongLyrics, setEditSongLyrics] = useState('');
  const [submittingSongEdit, setSubmittingSongEdit] = useState(false);

  // Roles & Permissions States
  const [roles, setRoles] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [editingRoleIdx, setEditingRoleIdx] = useState<number | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleMaxPosts, setRoleMaxPosts] = useState(10);
  const [roleAccessControl, setRoleAccessControl] = useState(false);
  const [roleDemoPassword, setRoleDemoPassword] = useState(false);
  const [roleSecretLink, setRoleSecretLink] = useState(false);
  const [roleCustomDomain, setRoleCustomDomain] = useState(false);
  const [roleBio, setRoleBio] = useState(false);
  const [roleAboutMe, setRoleAboutMe] = useState(false);
  const [roleUiEdit, setRoleUiEdit] = useState(false);
  const [roleExclusiveUi, setRoleExclusiveUi] = useState(false);
  const [roleDatabase, setRoleDatabase] = useState(false);
  const [roleSubscriptionPricing, setRoleSubscriptionPricing] = useState(false);
  const [rolePrice, setRolePrice] = useState('');

  // Artist Role ID
  const [artistRoleId, setArtistRoleId] = useState('');
  const [artistMaxSongs, setArtistMaxSongs] = useState<number | ''>('');
  const [artistExtraUsernames, setArtistExtraUsernames] = useState('');

  const uploadWithProgress = (file: File, setProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${token || ''}`);
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
    if (token) {
      fetchArtists();
      fetchLandingConfig();
      fetchSubscribers();
      fetchTickets();

      const interval = setInterval(() => {
        fetchTickets();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (token && showComposeModal) {
      fetchSentMails();
    }
  }, [token, showComposeModal]);

  useEffect(() => {
    setArtistCurrentPage(0);
  }, [searchQuery, artistPageSize]);

  
  const getLayoutSectionName = (sec: string) => {
    if (sec === 'title') return "Tiêu Đề (Tên & Giới thiệu ngắn)";
    if (sec === 'spotify') return "Spotify Playlist / Album";
    if (sec === 'vault') return "Kho Nhạc (Danh sách Đề mô / Ra Rồi)";
    if (sec === 'mv') return "MV Đã Phát Hành (YouTube Videos)";
    return sec;
  };
  const handleDragStartLayout = (e: any, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDropLayout = (e: any, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;
    const newList = [...globalLayoutSections];
    const draggedItem = newList[dragIndex];
    newList.splice(dragIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    setGlobalLayoutSections(newList);
  };

  const fetchSentMails = async () => {
    try {
      const res = await fetch('/api/acp/sent-mails', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSentMails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        setAdminUsername(data.adminUsername || 'acxuantai');
        setAdminPassword(data.adminPassword || 'MatKhauDay123');
        setCloudSyncEnabled(data.cloudSyncEnabled !== false);
        setTemplateNames(data.templateNames || {});
        setTemplateVip(data.templateVip || {});
        setDemoSongTitle(data.demoSongInfo?.title || "");
        setDemoSongArtist(data.demoSongInfo?.artist || "");
        setDemoSongLyrics(data.demoSongInfo?.lyrics || "");
        setLandingPageTitle(data.pageTitle || '');
        setLandingOgImageUrl(data.ogImageUrl || '');
        setLandingFaviconUrl(data.faviconUrl || '');
        setStatusBadge(data.statusBadge || '');
        setFeaturesTitle(data.featuresTitle || 'Được thiết kế cho trải nghiệm đỉnh cao');
        setFeaturesSub(data.featuresSub || 'Tích hợp những công nghệ hiện đại nhất để tối ưu hóa quy trình phân phối và lưu trữ nội bộ.');
        setFeature1Title(data.feature1Title || 'Bảo mật demo & tuyển tập');
        setFeature1Desc(data.feature1Desc || 'Thiết lập mật mã cho từng tác phẩm chưa công bố, ngăn chặn nghe trộm hoặc chia sẻ trái phép. Gửi link demo bảo mật cho ca sĩ, nhạc sĩ phối khí và các đối tác đáng tin cậy.');
        setFeature2Title(data.feature2Title || 'Dịch thuật thông minh (AI Translation)');
        setFeature2Desc(data.feature2Desc || 'Nhận diện vị trí địa lý của khán giả quốc tế để hiển thị tiêu đề và nội dung mô tả sản phẩm bằng ngôn ngữ bản địa phù hợp nhất (Anh, Nhật, Trung, Hàn...).');
        setFeature3Title(data.feature3Title || 'Đồng bộ Cloud & Cache cục bộ');
        setFeature3Desc(data.feature3Desc || 'Lưu trữ dữ liệu kép trên Cloud Firestore chất lượng cao kết hợp cơ chế dự phòng cục bộ. Cam kết phát nhạc ổn định, tốc độ load nhanh ngay cả khi internet quốc tế gặp sự cố.');
        setFeature4Title(data.feature4Title || 'Bố cục mang đậm dấu ấn cá nhân');
        setFeature4Desc(data.feature4Desc || 'Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.');
        setMenuVaultVi(data.menuVaultVi || 'Kho Nhạc');
        setMenuAboutVi(data.menuAboutVi || 'Về Tôi');
        setMenuBioVi(data.menuBioVi || 'Tiểu Sử');
        setGlobalLayoutSections(data.globalLayoutSections || ['title', 'spotify', 'vault', 'mv']);
        setFaqs(data.faq || []);
        setKeywords(data.forbiddenKeywords || []);
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/acp/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleSendTicketMessage = async () => {
    if (!selectedTicket || !chatText.trim()) return;
    setIsHandlingTicketAction(true);
    try {
      const res = await fetch(`/api/acp/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: chatText })
      });
      if (res.ok) {
        const result = await res.json();
        setChatText('');
        setSelectedTicket(result.ticket);
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể gửi tin nhắn'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Mở lại yêu cầu",
      message: "Bạn có chắc chắn muốn mở lại ticket này không?",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/reopen`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã mở lại ticket thành công!");
            fetchTickets();
          } else {
            const err = await res.json();
            setToast(`Lỗi: ${err.error}`);
          }
        } catch (e) {
          console.error(e);
          setToast("Lỗi kết nối");
        } finally {
          setIsHandlingTicketAction(false);
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
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/resolve`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã đóng ticket thành công!");
            fetchTickets();
          } else {
            const err = await res.json();
            alert(`Lỗi: ${err.error || 'Không thể đóng ticket'}`);
          }
        } catch (e: any) {
          alert(`Lỗi: ${e.message}`);
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };
  const handleResolveTicketOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/acp/tickets/${ticketId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedTicket(result.ticket);
        setToast("Đã đóng ticket thành công!");
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể đóng ticket'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
    }
  };

  const handleAdminRemoveSong = async (ticketId: string) => {
    setActionConfirm({
      isOpen: true,
      title: "Gỡ bài hát",
      message: "Bạn có chắc chắn muốn GỠ bài hát này khỏi hệ thống? Quyết định này không thể hoàn tác!",
      onConfirm: async () => {
        setIsHandlingTicketAction(true);
        try {
          const res = await fetch(`/api/acp/tickets/${ticketId}/remove-song`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setSelectedTicket(result.ticket);
            setToast("Đã gỡ bài hát và đóng ticket!");
            fetchTickets();
          } else {
            const err = await res.json();
            alert(`Lỗi: ${err.error || 'Không thể gỡ bài hát'}`);
          }
        } catch (e: any) {
          alert(`Lỗi: ${e.message}`);
        } finally {
          setIsHandlingTicketAction(false);
        }
      }
    });
  };
  const handleAdminRemoveSongOriginal = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/acp/tickets/${ticketId}/remove-song`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedTicket(result.ticket);
        setToast("Đã ra quyết định gỡ bài hát và đóng ticket!");
        fetchTickets();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || 'Không thể gỡ bài hát'}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsHandlingTicketAction(false);
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
    
    if (!artistName || !artistUsername || !artistExtension || !artistPassword || !artistEmail) {
      setFormErr('Vui lòng điền đầy đủ thông tin bắt buộc (Bao gồm Email)!');
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
          email: artistEmail,
          password: artistPassword,
          verified: artistVerified,
          isPublic: artistIsPublic,
          dbConfig: artistDbConfig,
          hasExternalWebsite: artistHasExternalWebsite,
          externalWebsiteUrl: artistExternalWebsiteUrl,
          defaultLanguage: artistDefaultLanguage,
          artistBio,
          isSpecial: artistIsSpecial,
          roleId: artistRoleId,
          maxSongs: artistMaxSongs === '' ? null : artistMaxSongs,
          extraUsernames: artistExtraUsernames
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNewArtistCreatedInfo({
          name: artistName,
          extension: artistExtension,
          username: artistUsername,
          password: artistPassword
        });
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

  const handleAITranslateArtist = async () => {
    if (!editingArtist) return;
    if (!(await showConfirm('Hệ thống sẽ sử dụng AI (Gemini) để dịch phần Bio, tiêu đề trang, tên các tabs, thông tin brief/thương hiệu, tên & mô tả các danh sách phát của nghệ sĩ này sang 5 ngôn ngữ khác (Anh, Hàn, Nhật, Thái, Trung).\n\nLưu ý: Để giữ nguyên bản sắc nghệ thuật, hệ thống sẽ KHÔNG DỊCH tên bài hát, lời bài hát, tên ca sĩ và tác giả.\n\nBạn có muốn tiếp tục?', 'Dịch thuật AI', 'confirm'))) {
      return;
    }

    setIsTranslatingArtist(true);
    setFormErr('');
    try {
      const res = await fetch('/api/acp/artists/translate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editingArtist.username
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await showConfirm('Dịch thuật thành công! Toàn bộ các thông tin hỗ trợ đã được dịch sang 5 ngôn ngữ và lưu trên máy chủ.', 'Thành công', 'success');
      } else {
        setFormErr(result.error || 'Có lỗi xảy ra khi thực hiện dịch thuật AI.');
      }
    } catch (err: any) {
      setFormErr('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsTranslatingArtist(false);
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
          externalWebsiteUrl: artistExternalWebsiteUrl,
          defaultLanguage: artistDefaultLanguage,
          artistBio,
          isSpecial: artistIsSpecial,
          roleId: artistRoleId,
          extraUsernames: artistExtraUsernames
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

  const handleSyncFirebaseData = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn đồng bộ dữ liệu của nghệ sĩ này từ Firebase cũ về Server mới?\nTất cả bài hát, danh sách phát và cấu hình trên Server của nghệ sĩ này sẽ được thay thế bằng dữ liệu từ Firebase cũ.', 'Đồng bộ Firebase', 'confirm'))) {
      return;
    }

    setIsSyncing(prev => ({ ...prev, [username]: true }));
    try {
      const res = await fetch('/api/acp/artists/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        setToast(data.message || 'Đồng bộ dữ liệu thành công!');
        setTimeout(() => setToast(''), 3000);
        setShowEditModal(false);
        setEditingArtist(null);
        resetForm();
        fetchArtists();
      } else {
        await showConfirm(data.error || 'Có lỗi xảy ra khi đồng bộ.', 'Lỗi đồng bộ', 'alert');
      }
    } catch (err: any) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi kết nối', 'alert');
    } finally {
      setIsSyncing(prev => ({ ...prev, [username]: false }));
    }
  };

  const handleApproveNameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi tên này?', 'Xác nhận duyệt'))) return;
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
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectNameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi tên này?', 'Xác nhận từ chối', 'danger'))) return;
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
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleApproveUsernameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi username này? Sẽ thay đổi đường dẫn của nghệ sĩ!', 'Xác nhận duyệt'))) return;
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
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleApproveExtensionChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi Sub-domain này?', 'Xác nhận duyệt'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, approveExtensionChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã duyệt yêu cầu đổi Sub-domain!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể duyệt yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectExtensionChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn từ chối yêu cầu thay đổi Sub-domain này?', 'Xác nhận từ chối', 'danger'))) return;
    try {
      const res = await fetch('/api/acp/artists/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ originalUsername: username, rejectExtensionChange: true })
      });
      if (res.ok) {
        fetchArtists();
        setToast('Đã từ chối yêu cầu đổi Sub-domain!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const data = await res.json();
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleRejectUsernameChange = async (username: string) => {
    if (!(await showConfirm('Bạn có chắc chắn muốn TỪ CHỐI yêu cầu thay đổi username này?', 'Xác nhận từ chối', 'danger'))) return;
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
        await showConfirm(data.error || 'Không thể từ chối yêu cầu', 'Thông báo', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
    }
  };

  const handleDeleteArtist = async (username: string) => {
    if (username === 'acxuantai') {
      await showConfirm('Không thể xóa tài khoản master acxuantai!', 'Thông báo', 'alert');
      return;
    }
    if (!(await showConfirm(`Bạn có chắc chắn muốn XÓA nghệ sĩ "${username}"? Toàn bộ file cấu hình của họ sẽ bị xóa.`, 'Xác nhận xóa', 'danger'))) return;

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
        await showConfirm(data.error || 'Lỗi khi xóa nghệ sĩ', 'Lỗi', 'alert');
      }
    } catch (err) {
      await showConfirm('Lỗi kết nối máy chủ!', 'Lỗi', 'alert');
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
          adminUsername,
          adminPassword,
          pageTitle: landingPageTitle,
          ogImageUrl: landingOgImageUrl,
          faviconUrl: landingFaviconUrl,
          statusBadge,
          featuresTitle,
          featuresSub,
          feature1Title,
          feature1Desc,
          feature2Title,
          feature2Desc,
          feature3Title,
          feature3Desc,
          feature4Title,
          feature4Desc,
          menuVaultVi,
          menuAboutVi,
          menuBioVi,
          globalLayoutSections,
          cloudSyncEnabled,
          demoSongInfo: { title: demoSongTitle, artist: demoSongArtist, lyrics: demoSongLyrics },
          templateNames,
          templateVip
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

  const handleTranslateLanding = async () => {
    setIsTranslatingLanding(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config/translate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã dịch tự động toàn bộ trang chủ & các thành phần chung thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 5000);
        fetchLandingConfig();
      } else {
        const data = await res.json();
        alert('Lỗi biên dịch: ' + (data.error || 'Vui lòng thử lại sau.'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsTranslatingLanding(false);
    }
  };

  const handleTranslateTemplates = async () => {
    setIsTranslatingTemplates(true);
    setLandingSuccessMsg('');
    try {
      const res = await fetch('/api/acp/landing-config/translate-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLandingSuccessMsg('Đã tự động dịch thuật và cập nhật tên giao diện mới cho các ngôn ngữ khác thành công!');
        setTimeout(() => setLandingSuccessMsg(''), 5000);
        fetchLandingConfig();
      } else {
        const data = await res.json();
        alert('Lỗi biên dịch: ' + (data.error || 'Vui lòng thử lại sau.'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setIsTranslatingTemplates(false);
    }
  };

  // --- FAQ & Terms Handlers ---
  const handleSaveFaq = async (updatedFaqs: any[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ faq: updatedFaqs })
      });
      if (res.ok) {
        setFaqs(updatedFaqs);
        setToast('Đã lưu FAQ thành công!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu FAQ');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddOrEditFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ.trim() || !faqA.trim()) return;
    let newFaqs = [...faqs];
    if (editingFaqIdx !== null) {
      newFaqs[editingFaqIdx] = { q: faqQ, a: faqA };
      setEditingFaqIdx(null);
    } else {
      newFaqs.push({ q: faqQ, a: faqA });
    }
    setFaqQ('');
    setFaqA('');
    handleSaveFaq(newFaqs);
  };

  const handleDeleteFaq = (idx: number) => {
    const newFaqs = faqs.filter((_, i) => i !== idx);
    handleSaveFaq(newFaqs);
  };

  // --- Forbidden Keywords Handlers ---
  const handleSaveKeywords = async (updatedKeywords: string[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ forbiddenKeywords: updatedKeywords })
      });
      if (res.ok) {
        setKeywords(updatedKeywords);
        setToast('Đã cập nhật danh sách từ khóa bị cấm!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu từ khóa');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const word = newKeyword.trim().toLowerCase();
    if (keywords.includes(word)) {
      setToast('Từ khóa đã tồn tại!');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const updated = [...keywords, word];
    setNewKeyword('');
    handleSaveKeywords(updated);
  };

  const handleDeleteKeyword = (word: string) => {
    const updated = keywords.filter(w => w !== word);
    handleSaveKeywords(updated);
  };

  // --- Content Moderation Handlers (Flagged Songs) ---
  const fetchFlaggedSongs = async () => {
    setLoadingFlagged(true);
    try {
      const res = await fetch('/api/acp/flagged-songs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedSongs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFlagged(false);
    }
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    setSubmittingSongEdit(true);
    try {
      const res = await fetch('/api/acp/songs/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editingSong.username,
          songId: editingSong.songId,
          title: editSongTitle,
          lyrics: editSongLyrics
        })
      });
      if (res.ok) {
        setToast('Đã cập nhật bài hát thành công!');
        setEditingSong(null);
        fetchFlaggedSongs();
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi cập nhật bài hát');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmittingSongEdit(false);
    }
  };

  const handleDeleteSong = async (song: any) => {
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn gỡ bỏ bài hát "${song.title}" của nghệ sĩ ${song.artistName}? Hệ thống sẽ tự động gửi thư cảnh báo cho thành viên này.`,
      'Gỡ bỏ bài hát'
    );
    if (!ok) return;

    try {
      const res = await fetch('/api/acp/songs/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: song.username,
          songId: song.songId,
          songTitle: song.title,
          flaggedKeywords: song.matchingKeywords
        })
      });
      if (res.ok) {
        setToast('Đã gỡ bài hát và gửi thông báo thành công!');
        fetchFlaggedSongs();
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi gỡ bài hát');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  // --- Roles & Permissions Handlers ---
  const handleSaveRoles = async (updatedRoles: any[]) => {
    try {
      const res = await fetch('/api/acp/landing-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roles: updatedRoles })
      });
      if (res.ok) {
        setRoles(updatedRoles);
        setToast('Đã lưu cấu hình phân quyền!');
        setTimeout(() => setToast(null), 3000);
      } else {
        const d = await res.json();
        setToast(d.error || 'Lỗi khi lưu phân quyền');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast('Lỗi kết nối máy chủ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSaveRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    const newRole = {
      name: roleName.trim(),
      maxPosts: Number(roleMaxPosts),
      accessControl: roleAccessControl,
      demoPassword: roleDemoPassword,
      secretLink: roleSecretLink,
      customDomain: roleCustomDomain,
      bio: roleBio,
      aboutMe: roleAboutMe,
      uiEdit: roleUiEdit,
      exclusiveUi: roleExclusiveUi,
      database: roleDatabase,
      subscriptionPricing: roleSubscriptionPricing,
      price: rolePrice.trim()
    };

    let updatedRoles = [...roles];
    if (editingRoleIdx !== null) {
      updatedRoles[editingRoleIdx] = newRole;
      setEditingRoleIdx(null);
    } else {
      updatedRoles.push(newRole);
    }
    setShowRoleModal(false);
    handleSaveRoles(updatedRoles);
  };

  useEffect(() => {
    if (token && activeTab === 'content') {
      fetchFlaggedSongs();
    }
  }, [token, activeTab]);

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistName(artist.artistName);
    setArtistUsername(artist.username);
    setArtistExtension(artist.extension);
    setArtistPassword('');
    setArtistVerified(artist.verified);
    setArtistIsPublic(artist.isPublic !== false);
    setArtistDbConfig(artist.dbConfig || '');
    setArtistHasExternalWebsite(!!artist.hasExternalWebsite);
    setArtistExternalWebsiteUrl(artist.externalWebsiteUrl || '');
    setArtistDefaultLanguage(artist.defaultLanguage || 'vi');
    setArtistBio(artist.artistBio || '');
    setArtistIsSpecial(!!artist.isSpecial);
    setArtistRoleId((artist as any).roleId || '');
    setArtistMaxSongs((artist as any).maxSongs || '');
    setArtistExtraUsernames(artist.extraUsernames || '');
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
    setArtistDefaultLanguage('vi');
    setArtistBio('');
    setArtistIsSpecial(false);
    setArtistRoleId('');
    setArtistMaxSongs('');
    setArtistExtraUsernames('');
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
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Login to System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900/50 border-r border-white/5 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            ADMIN PANEL
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'artists'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Nghệ Sĩ & Thành Viên</span>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-4.5 h-4.5" />
            <span>Trang Chủ & SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Hỗ trợ (Tickets)</span>
            </div>
            {tickets.filter(t => t.status !== 'resolved').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== 'resolved').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4.5 h-4.5" />
            <span>Tên Giao Diện</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>FAQ (Hỏi Đáp)</span>
          </button>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'keywords'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-4.5 h-4.5" />
            <span>Từ Khoá Cấm</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Edit2 className="w-4.5 h-4.5" />
            <span>Quản Lý Duyệt Bài</span>
          </button>

          <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4.5 h-4.5" />
              <span>Phân Quyền (Roles)</span>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-xs transition-all text-left cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4.5 h-4.5" />
              <span>Voucher</span>
            </button>
        </div>
      </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 min-w-0">
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
                <>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-neutral-900/50">
                        <th className="p-4 pl-6 text-xs text-neutral-400 uppercase font-bold tracking-wider">Nghệ Sĩ</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Role</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Trạng Thái Duyệt</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Bài/Demo</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Email</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider text-right pr-6">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredArtists.slice(artistCurrentPage * artistPageSize, (artistCurrentPage + 1) * artistPageSize).map((artist) => (
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
                                  {artist.isSpecial && (
                                    <span className="bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-amber-500/25">
                                      Đặc biệt
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
                                {artist.pendingExtensionChange && (
                                  <div className="mt-1.5 flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 py-1 px-2.5 rounded-lg text-[10px] font-bold">
                                    <span>Đang muốn đổi Sub-domain thành: "{artist.pendingExtensionChange}"</span>
                                    <button 
                                      onClick={() => handleApproveExtensionChange(artist.username)}
                                      className="bg-emerald-500 text-white p-0.5 rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
                                      title="Duyệt"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectExtensionChange(artist.username)}
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
                          
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  if (!artist.roleId || artist.roleId === 'free') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'free' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer ${(!artist.roleId || artist.roleId === 'free') ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                FREE
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'pro') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'pro' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer ${artist.roleId === 'pro' ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                PRO
                              </button>
                              <button
                                onClick={async () => {
                                  if (artist.roleId === 'vip') return;
                                  try {
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({ originalUsername: artist.username, roleId: 'vip' })
                                    });
                                    if (res.ok) fetchArtists();
                                  } catch (e) {}
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1 ${artist.roleId === 'vip' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' : 'bg-neutral-800 text-neutral-500 border-white/5 hover:bg-neutral-700'}`}
                              >
                                {artist.roleId === 'vip' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>}
                                VIP
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <a 
                                href={`/${artist.extension}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-purple-400 hover:underline flex items-center gap-1 font-medium group text-xs"
                              >
                                /{artist.extension}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              {artist.extraUsernames && (
                                <span className="text-[10px] text-neutral-500 font-mono" title="Username bổ sung">
                                  Alias: {artist.extraUsernames}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {artist.activated !== false ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] ml-2" title="Hoạt Động"></div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse ml-2" title="Chờ Duyệt"></div>
                              )}
                              <button
                                onClick={async () => {
                                  try {
                                    const nextActivatedStatus = artist.activated === false ? true : false;
                                    const res = await fetch('/api/acp/artists/update', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({
                                        originalUsername: artist.username,
                                        activated: nextActivatedStatus
                                      })
                                    });
                                    if (res.ok) {
                                      fetchArtists();
                                    } else {
                                      alert("Lỗi khi thay đổi trạng thái kích hoạt!");
                                    }
                                  } catch (e) {
                                    alert("Lỗi kết nối mạng!");
                                  }
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                                  artist.activated !== false
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-white/5'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500/50'
                                }`}
                              >
                                {artist.activated !== false ? 'Khóa' : 'Kích hoạt'}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg text-xs font-bold font-mono">
                              {(artist as any).releasedCount || 0} / {(artist as any).demoCount || 0}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-400">
                            {artist.email ? (
                              <a href={`mailto:${artist.email}`} className="hover:text-white transition-colors">{artist.email}</a>
                            ) : (
                              <span className="text-neutral-600 italic">Trống</span>
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

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-white/5 text-xs text-neutral-400 bg-neutral-950/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span>Hiển thị</span>
                    <select
                      value={artistPageSize}
                      onChange={(e) => {
                        setArtistPageSize(Number(e.target.value));
                        setArtistCurrentPage(0);
                      }}
                      className="bg-neutral-800 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>nghệ sĩ mỗi trang</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={artistCurrentPage === 0}
                      onClick={() => setArtistCurrentPage(prev => Math.max(0, prev - 1))}
                      className="px-3 py-1.5 rounded-lg bg-neutral-850 border border-white/5 hover:bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Trước
                    </button>
                    
                    <span className="font-mono text-neutral-400">
                      Trang <span className="text-white font-bold">{artistCurrentPage + 1}</span> / {Math.max(1, Math.ceil(filteredArtists.length / artistPageSize))}
                    </span>

                    <button
                      disabled={artistCurrentPage >= Math.ceil(filteredArtists.length / artistPageSize) - 1}
                      onClick={() => setArtistCurrentPage(prev => prev + 1)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-850 border border-white/5 hover:bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : activeTab === 'landing' ? (
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

              {/* Layout settings */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-4 sm:p-6 mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-black flex items-center gap-2 text-teal-400">
                    <LayoutTemplate className="w-5 h-5" />
                    <span>Bố cục nghệ sĩ mặc định</span>
                  </h2>
                  <p className="text-neutral-400 text-xs mt-1">
                    Kéo thả các phần dưới đây để sắp xếp thứ tự hiển thị mặc định của trang chủ nghệ sĩ. (Áp dụng cho nghệ sĩ chưa tự tùy chỉnh).
                  </p>
                </div>
                
                <div className="space-y-2">
                  {globalLayoutSections.map((sec, i) => (
                    <div 
                      key={sec} 
                      draggable 
                      onDragStart={(e) => handleDragStartLayout(e, i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropLayout(e, i)}
                      className="flex items-center gap-4 bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm select-none"
                    >
                      <GripVertical className="text-neutral-500 w-4 h-4 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold text-neutral-200 text-xs">
                          {getLayoutSectionName(sec)}
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveLandingConfig} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Huy hiệu trạng thái góc phải (Status Badge)
                    </label>
                    <input 
                      type="text" 
                      value={statusBadge}
                      onChange={(e) => setStatusBadge(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Đang hoạt động thử nghiệm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Dòng giới thiệu nhỏ nổi bật (Tagline)
                    </label>
                    <input 
                      type="text" 
                      value={landingTagline}
                      onChange={(e) => setLandingTagline(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Kho lưu trữ và chia sẻ âm nhạc"
                    />
                  </div>
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

                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-widest mb-4">
                    Tài khoản Quản trị (ACP Login)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tên đăng nhập
                      </label>
                      <input 
                        type="text" 
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Mật khẩu
                      </label>
                      <input 
                        type="password" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-rose-300/70 text-[11px] mt-1.5 leading-relaxed bg-rose-500/10 p-2 rounded-lg">
                    Tài khoản và mật khẩu này dùng để đăng nhập vào trang quản trị ACP (đường dẫn /acp). Hãy đổi mật khẩu thường xuyên để bảo vệ hệ thống.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6 space-y-6">
                  <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest mb-4">
                    Cấu hình chia sẻ & Metadata (SEO)
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tiêu đề chia sẻ (Sharing Title)
                    </label>
                    <input 
                      type="text" 
                      value={landingPageTitle}
                      onChange={(e) => setLandingPageTitle(e.target.value)}
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="VD: Chorus.vn - Nơi những ca khúc bắt đầu"
                    />
                    <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed">
                      Tiêu đề hiển thị trên tab trình duyệt và tiêu đề khi chia sẻ liên kết lên mạng xã hội.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        Favicon (Icon tab trình duyệt)
                      </label>
                      <div className="flex items-center gap-4">
                        {landingFaviconUrl && (
                          <img src={landingFaviconUrl} className="w-12 h-12 bg-black/20 rounded-xl object-contain border border-white/10 shadow-sm" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('landingFaviconUpload')?.click()}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all border shadow-sm ${
                            faviconProgress === 100 
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer'
                          }`}
                        >
                          {faviconProgress > 0 && faviconProgress < 100 ? (
                            <span className="text-[10px] font-bold">{faviconProgress}%</span>
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </button>
                        {landingFaviconUrl && (
                          <button 
                            type="button" 
                            onClick={() => { setLandingFaviconUrl(''); setFaviconProgress(0); }} 
                            className="w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input 
                          type="file" 
                          id="landingFaviconUpload" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            try {
                              const url = await uploadWithProgress(e.target.files[0], setFaviconProgress);
                              setLandingFaviconUrl(url);
                            } catch (err) {
                              alert('Lỗi upload icon!');
                              setFaviconProgress(0);
                            }
                          }} 
                        />
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1.5">
                        Ảnh icon vuông định dạng .png hoặc .ico hiển thị trên tab trình duyệt.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        Custom Thumbnail (Ảnh đại diện chia sẻ)
                      </label>
                      <div className="flex items-center gap-4">
                        {landingOgImageUrl && (
                          <img src={landingOgImageUrl} className="w-20 h-12 bg-black/20 rounded-xl object-cover border border-white/10 shadow-sm" />
                        )}
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('landingOgUpload')?.click()}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden transition-all border shadow-sm ${
                            ogImageProgress === 100 
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer'
                          }`}
                        >
                          {ogImageProgress > 0 && ogImageProgress < 100 ? (
                            <span className="text-[10px] font-bold">{ogImageProgress}%</span>
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </button>
                        {landingOgImageUrl && (
                          <button 
                            type="button" 
                            onClick={() => { setLandingOgImageUrl(''); setOgImageProgress(0); }} 
                            className="w-8 h-8 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <input 
                          type="file" 
                          id="landingOgUpload" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            try {
                              const url = await uploadWithProgress(e.target.files[0], setOgImageProgress);
                              setLandingOgImageUrl(url);
                            } catch (err) {
                              alert('Lỗi upload thumbnail!');
                              setOgImageProgress(0);
                            }
                          }} 
                        />
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1.5">
                        Ảnh dùng làm banner khi chia sẻ link lên Facebook, Zalo, Twitter.
                      </p>
                    </div>
                  </div>
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
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-widest">
                      Cấu hình các tính năng nổi bật ở Trang chủ
                    </h3>
                    <p className="text-neutral-400 text-xs">
                      Tùy chỉnh tiêu đề chính và phụ đề cho phần tính năng nổi bật trên trang chủ (Ảnh 2).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tiêu đề khu vực tính năng
                      </label>
                      <input 
                        type="text" 
                        required
                        value={featuresTitle}
                        onChange={(e) => setFeaturesTitle(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Được thiết kế cho trải nghiệm đỉnh cao"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Dòng phụ đề tính năng
                      </label>
                      <input 
                        type="text" 
                        required
                        value={featuresSub}
                        onChange={(e) => setFeaturesSub(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Tích hợp những công nghệ hiện đại nhất..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                
                <div className="border-t border-white/10 pt-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 1 (Kho Nhạc)
                      </label>
                      <input 
                        type="text" 
                        value={menuVaultVi}
                        onChange={(e) => setMenuVaultVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Kho Nhạc"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 2 (Về Tôi)
                      </label>
                      <input 
                        type="text" 
                        value={menuAboutVi}
                        onChange={(e) => setMenuAboutVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Về Tôi"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Tab 3 (Tiểu Sử)
                      </label>
                      <input 
                        type="text" 
                        value={menuBioVi}
                        onChange={(e) => setMenuBioVi(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                        placeholder="Tiểu Sử"
                      />
                    </div>
                  </div>
                </div>

                {landingSuccessMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{landingSuccessMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    disabled={isTranslatingLanding || isSavingLanding}
                    onClick={handleTranslateLanding}
                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-extrabold py-3.5 px-6 rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{isTranslatingLanding ? 'Đang dịch thuật...' : 'Biên dịch trang chủ & phần chung (AI)'}</span>
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingLanding || isTranslatingLanding}
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
        ) : activeTab === 'tickets' ? (
          /* Tickets (Inbox) Tab */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2 text-white">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                  <span>Hộp Thư Yêu Cầu Gỡ Bài</span>
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Xem xét, trao đổi và ra quyết định xử lý các tranh chấp bản quyền hoặc yêu cầu gỡ sản phẩm âm nhạc.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposeModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md tracking-wider uppercase transition-all duration-200 shrink-0 self-start sm:self-center active:scale-95 border border-purple-500/20"
              >
                <Mail className="w-4 h-4 text-purple-200" />
                <span>Soạn Thư Hệ Thống</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[650px]">
              {/* Tickets List Column */}
              <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col h-full overflow-hidden">
                <h3 className="text-sm font-black text-neutral-200 mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
                  <span>Danh sách yêu cầu ({tickets.length})</span>
                  <button 
                    onClick={fetchTickets}
                    className="p-1 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </h3>

                {tickets.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 my-auto flex flex-col items-center justify-center">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-10" />
                    <p className="text-xs">Chưa có yêu cầu nào.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2 pr-1">
                    {tickets.map((ticket: any) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const lastMsg = ticket.messages[ticket.messages.length - 1];
                      
                      return (
                        <button
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/10 border-purple-500/30 text-white'
                              : 'bg-black/30 border-white/5 hover:border-white/10 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            {ticket.type === 'remove' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/15">
                                Yêu cầu gỡ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/15">
                                Yêu cầu sửa
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              ticket.status === 'open' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                : ticket.status === 'removed'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {ticket.status === 'open' ? 'Đang xử lý' : ticket.status === 'removed' ? 'Đã gỡ bài' : 'Đã đóng'}
                            </span>
                          </div>

                          <div className="font-bold text-sm text-neutral-100 truncate w-full flex items-center gap-1.5">
                            <Disc3 className={`w-3.5 h-3.5 shrink-0 ${ticket.status === 'open' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                            <span className="truncate">{ticket.songTitle}</span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex flex-col gap-0.5 w-full">
                            <div className="truncate">Người yêu cầu: <strong className="text-neutral-200">@{ticket.reporter.username}</strong></div>
                          </div>

                          {lastMsg && (
                            <div className="text-[10px] text-neutral-500 border-t border-white/5 pt-1.5 mt-0.5 truncate w-full italic">
                              {lastMsg.senderName}: {lastMsg.text}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Chat / Moderation Panel */}
              <div className={`lg:col-span-2 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex-col h-full overflow-hidden min-h-0 ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                {selectedTicket ? (
                  <div className="flex flex-col h-full overflow-hidden min-h-0">
                    {/* Header */}
                    <div className="pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{selectedTicket.songTitle}</h3>
                          {selectedTicket.type === 'remove' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/15">
                              Yêu cầu gỡ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                              Yêu cầu sửa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          <span className="hidden sm:inline">Người yêu cầu: </span><strong className="text-neutral-200">{selectedTicket.reporter.name}</strong><span className="hidden sm:inline"> (@{selectedTicket.reporter.username})</span> | Kênh uploader: <strong className="text-neutral-200">{selectedTicket.sourceArtist}</strong>
                        </p>
                      </div>

                      {selectedTicket.status === 'open' && (
                        <div className="flex items-center gap-2">
                          {selectedTicket.type === 'remove' && (
                            <button
                              onClick={() => handleAdminRemoveSong(selectedTicket.id)}
                              disabled={isHandlingTicketAction}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/10 transition-all active:scale-95"
                              title="Gỡ Bài Hát"
                            >
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline font-bold whitespace-nowrap">Đồng Ý</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleResolveTicket(selectedTicket.id)}
                            disabled={isHandlingTicketAction}
                            className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 hover:text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all active:scale-95"
                            title="Từ Chối"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Từ Chối</span>
                          </button>
                        </div>
                      )}
                      {selectedTicket.status !== 'open' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReopenTicket(selectedTicket.id)}
                            disabled={isHandlingTicketAction}
                            className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 hover:text-white font-bold p-2 sm:px-3 sm:py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all active:scale-95"
                            title="Mở Lại"
                          >
                            <span className="hidden sm:inline font-bold whitespace-nowrap">Mở Lại</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar my-4 space-y-4 pr-1">
                      {/* Reason Box */}
                      <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-xs leading-relaxed">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {selectedTicket.type === 'remove' ? 'Lý do yêu cầu gỡ' : 'Lý do yêu cầu sửa'}
                        </div>
                        <p className="whitespace-pre-wrap italic text-neutral-300">"{selectedTicket.description}"</p>
                        <p className="text-neutral-500 text-[10px] text-right mt-1.5">{new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</p>
                      </div>

                      {/* Messages loop */}
                      {selectedTicket.messages.map((msg: any, idx: number) => {
                        let senderUsername = msg.sender;
                        if (msg.sender === 'admin' && msg.senderName !== 'Hệ thống' && msg.senderName !== 'Admin hệ thống' && msg.senderName !== 'Admin') {
                          const found = artists.find(a => a.artistName === msg.senderName);
                          if (found) senderUsername = found.username;
                        }
                        if (msg.sender === 'reporter' || msg.role === 'reporter') senderUsername = selectedTicket.reporter.username;
                        if (msg.sender === 'source' || msg.role === 'target') senderUsername = selectedTicket.sourceArtist;
                        
                        const isSystemAdmin = msg.senderName === 'Hệ thống' || msg.senderName === 'Admin hệ thống' || (msg.sender === 'admin' && msg.senderName === 'Admin');
                        // In ACP, the viewer is the System Admin
                        const isMe = isSystemAdmin;
                        const isReporter = !isSystemAdmin && (msg.sender === 'reporter' || msg.role === 'reporter' || senderUsername === selectedTicket.reporter.username || msg.senderName === selectedTicket.reporter.name);
                        
                        const initial = (msg.senderName || senderUsername || '?').charAt(0).toUpperCase();
                        
                        let avatarBg = 'bg-gradient-to-tr from-neutral-600 to-neutral-700';
                        if (isSystemAdmin) {
                          avatarBg = 'bg-gradient-to-tr from-rose-500 to-amber-500';
                        } else if (isReporter) {
                          avatarBg = 'bg-gradient-to-tr from-sky-500 to-blue-600';
                        } else {
                          avatarBg = 'bg-gradient-to-tr from-emerald-500 to-teal-600';
                        }
                        
                        const artistAvatar = isSystemAdmin ? landingFaviconUrl : artists.find(a => a.extension === senderUsername || a.username === senderUsername)?.homeCoverUrl;

                        return (
                          <div 
                            key={msg.id || idx} 
                            className={`flex gap-3 items-end w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-4`}
                          >
                            {/* Avatar */}
                            {!isSystemAdmin && (
                              <Link to={`/${senderUsername}`} target="_blank" className={`w-8 h-8 rounded-full ${artistAvatar ? 'bg-transparent' : avatarBg} text-white flex items-center justify-center text-xs font-extrabold shadow-md shrink-0 mb-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity`}>
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
                              {/* Sender Name & Role Badge */}
                              <div className="text-[10px] text-neutral-400 mb-1 px-1 flex items-center gap-1.5">
                                <span className="font-semibold">{msg.senderName}</span>
                                {isSystemAdmin ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    Admin
                                  </span>
                                ) : isReporter ? (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Reporter
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Uploader
                                  </span>
                                )}
                              </div>

                              {/* Bubble Box */}
                              <div 
                                title={msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md transition-all relative ${
                                isMe 
                                  ? 'bg-rose-600 text-white rounded-br-none font-medium shadow-rose-500/20' 
                                  : 'bg-neutral-800 border border-white/10 text-neutral-100 rounded-bl-none'
                              }`}>
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              </div>

                              {/* Timestamp */}
                              <span className="text-[9px] text-neutral-500 mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    {selectedTicket.type === 'edit' ? (
                      <div className="text-center py-4 border-t border-white/5 bg-white/5 rounded-xl shrink-0 mt-2">
                        <p className="text-xs text-neutral-400 font-semibold italic">Admin không tham gia vào yêu cầu chỉnh sửa (chỉ 2 bên trao đổi).</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 shrink-0 border-t border-white/5 pt-4">
                        {selectedTicket.status !== 'open' && (
                          <p className="text-[11px] text-neutral-400 italic text-center mb-1 bg-white/5 py-1 rounded-lg">
                            Yêu cầu này đã đóng/giải quyết xong nhưng bạn vẫn có thể tiếp tục nhắn tin trao đổi.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendTicketMessage()}
                            placeholder="Nhập tin nhắn hệ thống gửi đến các bên..."
                            disabled={isHandlingTicketAction}
                            className="flex-1 bg-black/40 text-xs text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            onClick={handleSendTicketMessage}
                            disabled={isHandlingTicketAction || !chatText.trim()}
                            className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-white transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-lg active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500">
                    <MessageSquare className="w-16 h-16 mb-2 opacity-5" />
                    <p className="text-xs">Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi và xử lý.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'templates' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Quản lý tên Giao Diện
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">Đổi tên hiển thị cho các giao diện và dịch tự động.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTranslateTemplates}
                    disabled={isTranslatingTemplates || isSavingLanding}
                    className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-purple-300 border border-purple-500/20 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-purple-400" />
                    {isTranslatingTemplates ? 'Đang dịch...' : 'Dịch tên giao diện (AI)'}
                  </button>
                  <button
                    onClick={handleSaveLandingConfig}
                    disabled={isSavingLanding || isTranslatingTemplates}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingLanding ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
              {landingSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{landingSuccessMsg}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({length: 18}).map((_, i) => {
                  const id = String(i + 1);
                  return (
                    <div key={id} className="bg-neutral-800/50 p-4 rounded-xl border border-white/5">
                      
                      <label className="block text-xs font-bold text-neutral-400 mb-2 flex items-center justify-between">
                        <span>Giao diện #{id} - {templateNames[id] || DEFAULT_TEMPLATE_NAMES[id]}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!templateVip[id]}
                            onChange={(e) => setTemplateVip({...templateVip, [id]: e.target.checked})}
                            className="w-3 h-3 text-yellow-500 rounded focus:ring-yellow-500 bg-neutral-900 border-white/10"
                          />
                          <span className="text-[10px] text-yellow-500 font-bold">VIP</span>
                        </label>
                      </label>

                      <input 
                        value={templateNames[id] || ''} 
                        onChange={(e) => setTemplateNames({...templateNames, [id]: e.target.value})} 
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" 
                        placeholder={DEFAULT_TEMPLATE_NAMES[id] || `Tên giao diện ${id}`} 
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 border-t border-white/5 pt-8">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  Cấu hình Bài Hát Mẫu (Demo)
                </h3>
                <p className="text-sm text-neutral-400 mb-6">Thông tin này sẽ được hiển thị khi người dùng xem trước giao diện chưa có dữ liệu thực tế.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">Tên bài hát mẫu</label>
                      <input value={demoSongTitle} onChange={e => setDemoSongTitle(e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="VD: Bài Hát Mẫu Demo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 mb-2">Tên tác giả / Nghệ sĩ mẫu</label>
                      <input value={demoSongArtist} onChange={e => setDemoSongArtist(e.target.value)} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="VD: Admin" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 mb-2">Lời bài hát mẫu (Lyrics)</label>
                    <textarea value={demoSongLyrics} onChange={e => setDemoSongLyrics(e.target.value)} rows={12} className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono" placeholder="Nhập lời bài hát mẫu có kèm tag [Verse 1], [Chorus]..."></textarea>
                  </div>
                </div>
              </div>
          </div>
        ) : activeTab === 'faq' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  Quản lý FAQ & Điều khoản sử dụng
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Thiết lập câu hỏi thường gặp và quy định sử dụng dịch vụ của hệ thống.</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4.5 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-400 font-bold mb-1">CHÚ TRỌNG VẤN ĐỀ BẢN QUYỀN & CHÍNH TRỊ:</strong>
                Nội dung điều khoản phải ghi rõ uploader hoàn toàn chịu trách nhiệm về bản quyền tác phẩm đã đăng tải. Nghiêm cấm mọi hình thức đăng tải thông tin tiêu cực, chống phá đảng và nhà nước, xuyên tạc chính trị hoặc vi phạm thuần phong mỹ tục.
              </div>
            </div>

            <form onSubmit={handleAddOrEditFaq} className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-purple-300">
                {editingFaqIdx !== null ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Câu hỏi (Q)</label>
                  <input
                    type="text"
                    required
                    value={faqQ}
                    onChange={(e) => setFaqQ(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ví dụ: Quy định về bản quyền trên Chorus.vn là gì?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Câu trả lời (A)</label>
                  <textarea
                    required
                    rows={3}
                    value={faqA}
                    onChange={(e) => setFaqA(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="Nêu rõ quy định uploader chịu toàn bộ trách nhiệm..."
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {editingFaqIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqIdx(null);
                      setFaqQ('');
                      setFaqA('');
                    }}
                    className="bg-neutral-800 text-neutral-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-700 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingFaqIdx !== null ? 'Cập nhật' : 'Thêm vào danh sách'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-neutral-300 px-1">Danh sách câu hỏi ({faqs.length})</h3>
              {faqs.length === 0 ? (
                <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-8 text-center text-neutral-500 text-xs">
                  Chưa có nội dung FAQ nào được cấu hình. Các mục mặc định quy định uploader chịu trách nhiệm và bản quyền sẽ tự động hiển thị ở Trang chủ nếu để trống.
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((f: any, idx: number) => (
                    <div key={idx} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="text-purple-400 font-mono">Q:</span> {f.q}
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed pl-5 whitespace-pre-wrap">
                          <span className="text-neutral-500 font-bold font-mono">A:</span> {f.a}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingFaqIdx(idx);
                            setFaqQ(f.q);
                            setFaqA(f.a);
                          }}
                          className="p-2 bg-neutral-800/60 hover:bg-neutral-700/60 text-purple-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(idx)}
                          className="p-2 bg-neutral-800/60 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bỏ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'keywords' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  Mục từ khóa bị cấm
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Quản lý các từ ngữ nhạy cảm. Hệ thống sẽ tự động làm mờ các từ khóa này trong Lyrics của thành viên.</p>
              </div>
            </div>

            <form onSubmit={handleAddKeyword} className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-purple-300">Thêm từ khóa mới</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ví dụ: bạo lực, chính trị, vi-phạm"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm từ khóa
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                * Từ khóa sẽ được phân tách tự động và chuẩn hóa viết thường để khớp chính xác không phân biệt hoa thường.
              </p>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-neutral-300 px-1">Tất cả từ khóa ({keywords.length})</h3>
              {keywords.length === 0 ? (
                <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-8 text-center text-neutral-500 text-xs">
                  Chưa có từ khóa bị cấm nào. Vui lòng thêm từ khóa để kích hoạt tính năng kiểm duyệt tự động.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 bg-black/20 border border-white/5 rounded-2xl p-5">
                  {keywords.map((kw: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-neutral-800 border border-white/5 text-white pl-3.5 pr-2.5 py-1.5 rounded-full text-xs font-bold shadow-sm hover:border-rose-500/30 hover:bg-rose-950/20 group transition-all"
                    >
                      <span className="font-mono">{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(kw)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 rounded-full hover:bg-neutral-700/50 transition-colors cursor-pointer"
                        title="Xóa từ khóa này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'content' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-purple-400" />
                  Quản lý nội dung & Kiểm duyệt demo
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Danh sách các demo chứa từ khóa bị cấm tự động phát hiện trên toàn hệ thống.</p>
              </div>
              <button
                onClick={fetchFlaggedSongs}
                disabled={loadingFlagged}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 h-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFlagged ? 'animate-spin' : ''}`} />
                Làm mới danh sách
              </button>
            </div>

            {loadingFlagged ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-xs text-neutral-400">Đang rà soát toàn bộ tác phẩm trên hệ thống...</p>
              </div>
            ) : flaggedSongs.length === 0 ? (
              <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-12 text-center text-neutral-500 text-xs flex flex-col items-center justify-center gap-3">
                <Check className="w-10 h-10 text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full" />
                <span>Không phát hiện bài hát vi phạm từ khóa nào trên hệ thống!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedSongs.map((song: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900/40 border border-rose-500/15 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
                          <span className="text-white">{song.title}</span>
                          <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-black">
                            Vi phạm từ khóa
                          </span>
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1">
                          Nghệ sĩ sở hữu: <strong className="text-white">{song.artistName}</strong> (@{song.username})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSong(song);
                            setEditSongTitle(song.title);
                            setEditSongLyrics(song.lyrics || '');
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Sửa bài hát
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song)}
                          className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/15 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ bài hát
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Từ khóa bị dính:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {song.matchingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 font-mono line-clamp-2 bg-black/10 rounded-lg p-2.5">
                      {song.lyrics || "(Không có lời bài hát)"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSong && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setEditingSong(null)}
                    className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-purple-400" /> Chỉnh sửa bài hát vi phạm
                  </h3>
                  <form onSubmit={handleUpdateSong} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tiêu đề bài hát *</label>
                      <input
                        type="text"
                        required
                        value={editSongTitle}
                        onChange={(e) => setEditSongTitle(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Lời bài hát (Lyrics) *</label>
                      <textarea
                        required
                        rows={10}
                        value={editSongLyrics}
                        onChange={(e) => setEditSongLyrics(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submittingSongEdit}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer flex items-center gap-2"
                      >
                        {submittingSongEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        
        ) : activeTab === 'vouchers' ? (
          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" /> Quản lý Voucher
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Tạo và quản lý các mã quà tặng</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch('/api/acp/vouchers/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ 
                    code: (document.getElementById('new-voucher-code') as HTMLInputElement).value,
                    increaseSongs: (document.getElementById('new-voucher-songs') as HTMLInputElement).value,
                    increaseTemplates: (document.getElementById('new-voucher-templates') as HTMLInputElement).value,
                    vipMonths: (document.getElementById('new-voucher-vip') as HTMLInputElement).value
                  })
                });
                if (res.ok) {
                  const newVoucher = await res.json();
                  setVouchers(prev => [...prev, newVoucher]);
                  (document.getElementById('new-voucher-code') as HTMLInputElement).value = '';
                  (document.getElementById('new-voucher-songs') as HTMLInputElement).value = '0';
                  (document.getElementById('new-voucher-templates') as HTMLInputElement).value = '0';
                  (document.getElementById('new-voucher-vip') as HTMLInputElement).value = '0';
                } else {
                  const data = await res.json();
                  alert(data.error || 'Lỗi');
                }
              } catch(err) {
                alert('Lỗi');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mã Voucher *</label>
                  <input type="text" id="new-voucher-code" required placeholder="Nhập mã..." className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng số bài</label>
                  <input type="number" id="new-voucher-songs" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tăng Giao diện</label>
                  <input type="number" id="new-voucher-templates" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tháng VIP</label>
                  <input type="number" id="new-voucher-vip" defaultValue="0" className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl">Thêm Voucher</button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-neutral-900/50">
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Mã Voucher</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Quyền lợi</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Số lần SD</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold">Ngày tạo</th>
                    <th className="p-4 text-xs text-neutral-400 uppercase font-bold text-right pr-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers?.map(v => (
                    <tr key={v.id} className="border-b border-white/5">
                      <td className="p-4 text-sm font-mono text-purple-400">{v.code}</td>
                      <td className="p-4 text-sm text-neutral-300">
                        {v.increaseSongs > 0 && <span className="block">+ {v.increaseSongs} bài</span>}
                        {v.increaseTemplates > 0 && <span className="block">+ {v.increaseTemplates} giao diện</span>}
                        {v.vipMonths > 0 && <span className="block">+ {v.vipMonths} tháng VIP</span>}
                      </td>
                      <td className="p-4 text-sm text-neutral-300">{v.usedBy?.length || 0} lần</td>
                      <td className="p-4 text-sm text-neutral-400">{new Date(v.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-right pr-6">
                        <button onClick={async () => {
                          if (confirm('Xóa mã này?')) {
                            const res = await fetch('/api/acp/vouchers/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ id: v.id })
                            });
                            if (res.ok) setVouchers(prev => prev.filter(x => x.id !== v.id));
                          }
                        }} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {(!vouchers || vouchers.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">Chưa có voucher nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'roles' ? (

          <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Hệ thống Phân quyền & Vai trò (Roles)
                </h2>
                <p className="text-sm text-neutral-400 mt-1">Thiết lập các nhóm phân quyền giới hạn tính năng và số lượng bài hát upload cho thành viên.</p>
              </div>
              <button
                onClick={() => {
                  setEditingRoleIdx(null);
                  setRoleName('');
                  setRolePrice('');
                  setRoleMaxPosts(10);
                  setRoleAccessControl(false);
                  setRoleDemoPassword(false);
                  setRoleSecretLink(false);
                  setRoleCustomDomain(false);
                  setRoleBio(false);
                  setRoleAboutMe(false);
                  setRoleUiEdit(false);
                  setRoleExclusiveUi(false);
                  setRoleDatabase(false);
                  setRoleSubscriptionPricing(false);
                  setShowRoleModal(true);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Tạo gói phân quyền mới
              </button>
            </div>

            {roles.length === 0 ? (
              <div className="bg-neutral-900/10 border border-dashed border-white/5 rounded-2xl p-12 text-center text-neutral-500 text-xs flex flex-col items-center justify-center gap-3">
                <Shield className="w-10 h-10 text-neutral-600" />
                <span>Chưa có gói phân quyền tùy chỉnh nào được thiết lập.</span>
                <p className="max-w-md text-[11px] leading-relaxed">
                  Tất cả thành viên mặc định sẽ hoạt động ở chế độ toàn quyền không giới hạn cho đến khi bạn tạo các gói phân quyền giới hạn ở đây và gắn cho họ.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((r: any, idx: number) => (
                  <div key={idx} className="bg-neutral-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 space-y-4 transition-all relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-400" /> {r.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1">
                          Giới hạn tải nhạc: <strong className="text-purple-300">{r.maxPosts === -1 || r.maxPosts === 'unlimited' ? 'Không giới hạn' : `${r.maxPosts} bài`}</strong>
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Giá gói: <strong className="text-amber-400">{r.price || 'Miễn phí'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingRoleIdx(idx);
                            setRoleName(r.name);
                            setRolePrice(r.price || '');
                            setRoleMaxPosts(r.maxPosts === -1 || r.maxPosts === 'unlimited' ? -1 : Number(r.maxPosts));
                            setRoleAccessControl(!!r.accessControl);
                            setRoleDemoPassword(!!r.demoPassword);
                            setRoleSecretLink(!!r.secretLink);
                            setRoleCustomDomain(!!r.customDomain);
                            setRoleBio(!!r.bio);
                            setRoleAboutMe(!!r.aboutMe);
                            setRoleUiEdit(!!r.uiEdit);
                            setRoleExclusiveUi(!!r.exclusiveUi);
                            setRoleDatabase(!!r.database);
                            setRoleSubscriptionPricing(!!r.subscriptionPricing);
                            setShowRoleModal(true);
                          }}
                          className="p-1.5 bg-neutral-800/60 hover:bg-neutral-700/60 text-purple-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Sửa phân quyền"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const newRoles = roles.filter((_, i) => i !== idx);
                            handleSaveRoles(newRoles);
                          }}
                          className="p-1.5 bg-neutral-800/60 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Xóa phân quyền"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3.5 space-y-2">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Tính năng được mở khóa:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.accessControl && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Mật khẩu kho nhạc</span>}
                        {r.demoPassword && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Mật khẩu demo</span>}
                        {r.secretLink && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Link bí mật</span>}
                        {r.customDomain && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Tên miền riêng</span>}
                        {r.bio && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Bio/Tiểu sử</span>}
                        {r.aboutMe && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">About me/Giới thiệu</span>}
                        {r.uiEdit && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Tùy biến giao diện</span>}
                        {r.exclusiveUi && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Giao diện độc quyền</span>}
                        {r.database && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Sao lưu DB</span>}
                        {r.subscriptionPricing && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Bán nhạc/Hội viên</span>}
                        {!r.accessControl && !r.demoPassword && !r.secretLink && !r.customDomain && !r.bio && !r.aboutMe && !r.uiEdit && !r.exclusiveUi && !r.database && !r.subscriptionPricing && (
                          <span className="text-[10px] text-neutral-500 italic">Không có tính năng nâng cao nào</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showRoleModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    {editingRoleIdx !== null ? 'Chỉnh sửa gói phân quyền' : 'Tạo gói phân quyền mới'}
                  </h3>
                  <form onSubmit={handleSaveRoleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Tên gói phân quyền *</label>
                      <input
                        type="text"
                        required
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                        placeholder="vd: Silver, Gold, Platinum..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Giá tiền (vd: Miễn phí, 99.000đ/tháng...)</label>
                      <input
                        type="text"
                        value={rolePrice}
                        onChange={(e) => setRolePrice(e.target.value)}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                        placeholder="vd: 99.000đ/tháng hoặc Miễn phí..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Giới hạn số lượng tải nhạc</label>
                      <select
                        value={roleMaxPosts}
                        onChange={(e) => setRoleMaxPosts(Number(e.target.value))}
                        className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                      >
                        <option value={10}>Tối đa 10 bài hát</option>
                        <option value={20}>Tối đa 20 bài hát</option>
                        <option value={50}>Tối đa 50 bài hát</option>
                        <option value={100}>Tối đa 100 bài hát</option>
                        <option value={-1}>Không giới hạn bài hát (-1)</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Mở khóa tính năng nâng cao</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-4 rounded-xl border border-white/5 text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleAccessControl} onChange={(e) => setRoleAccessControl(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Mật khẩu kho nhạc</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleDemoPassword} onChange={(e) => setRoleDemoPassword(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Mật khẩu demo</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleSecretLink} onChange={(e) => setRoleSecretLink(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Đường link bí mật</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleCustomDomain} onChange={(e) => setRoleCustomDomain(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Hỗ trợ Tên miền riêng</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleBio} onChange={(e) => setRoleBio(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Tiểu sử/Bio phong phú</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleAboutMe} onChange={(e) => setRoleAboutMe(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Giới thiệu/About me</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleUiEdit} onChange={(e) => setRoleUiEdit(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Tùy biến Giao diện</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleExclusiveUi} onChange={(e) => setRoleExclusiveUi(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Giao diện Độc quyền</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleDatabase} onChange={(e) => setRoleDatabase(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Sao lưu DB cá nhân</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                          <input type="checkbox" checked={roleSubscriptionPricing} onChange={(e) => setRoleSubscriptionPricing(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 bg-black/50 border-white/10" />
                          <span>Bán nhạc/Gói hội viên</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowRoleModal(false)}
                        className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-xs font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 px-6 rounded-xl transition-all text-xs font-bold cursor-pointer"
                      >
                        Lưu gói phân quyền
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* New Artist Info Modal */}
      {newArtistCreatedInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-white/5 rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" /> Tạo nghệ sĩ thành công!
            </h3>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm text-neutral-300 relative group mb-6">
              <button 
                onClick={() => {
                  const textToCopy = `Thông tin kho nhạc nghệ sĩ ${newArtistCreatedInfo.name}
Nghệ danh: ${newArtistCreatedInfo.name}
Username: ${newArtistCreatedInfo.username}
Website: ${newArtistCreatedInfo.extension}.chorus.vn
Admin: ${newArtistCreatedInfo.extension}.chorus.vn/admin
Admin User: ${newArtistCreatedInfo.username}
Admin Password: ${newArtistCreatedInfo.password}`;
                  navigator.clipboard.writeText(textToCopy);
                  setToast('Đã copy thông tin!');
                  setTimeout(() => setToast(null), 3000);
                }}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Copy thông tin"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              
              <div className="space-y-1.5 whitespace-pre-wrap pr-10">
                <span className="text-white font-bold block mb-3 border-b border-white/10 pb-2">Thông tin kho nhạc nghệ sĩ {newArtistCreatedInfo.name}</span>
                <p>Nghệ danh: <span className="text-white">{newArtistCreatedInfo.name}</span></p>
                <p>Username: <span className="text-white">{newArtistCreatedInfo.username}</span></p>
                <p>Website: <span className="text-emerald-400">{newArtistCreatedInfo.extension}.chorus.vn</span></p>
                <p>Admin: <span className="text-emerald-400">{newArtistCreatedInfo.extension}.chorus.vn/admin</span></p>
                <p>Admin User: <span className="text-white">{newArtistCreatedInfo.username}</span></p>
                <p>Admin Password: <span className="text-white">{newArtistCreatedInfo.password}</span></p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setNewArtistCreatedInfo(null)}
                className="bg-neutral-800 text-neutral-300 py-3 px-6 rounded-xl hover:bg-neutral-700 transition-all text-sm font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mô tả ngắn / Tagline (Bio) - Để trống để tự động hiển thị mặc định</label>
                <input 
                  type="text" 
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Thiên đường nhạc của..."
                />
              </div>

              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">FREE (Mặc định)</option>
                  <option value="vip" className="bg-neutral-900 text-white">VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số bài tối đa (Để trống: theo hạng)</label>
                <input 
                  type="number"
                  value={artistMaxSongs}
                  onChange={(e) => setArtistMaxSongs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Để trống sẽ áp dụng giới hạn theo Hạng thành viên"
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email (Đăng nhập & Bảo mật) *</label>
                <input 
                  type="email" 
                  required
                  value={artistEmail}
                  onChange={(e) => setArtistEmail(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: artist@example.com"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username phụ / bổ sung (Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={artistExtraUsernames}
                  onChange={(e) => setArtistExtraUsernames(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="vd: tai, taicute"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Cho phép thành viên sử dụng thêm nhiều username khác nhau (ví dụ: truy cập qua <strong>tai.chorus.vn</strong> cũng như <strong>acxuantai.chorus.vn</strong>). Phân tách các username bằng dấu phẩy.
                </p>
              </div>

                            <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu *</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="password" 
                  required
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Mật khẩu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
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
                    Trang chủ
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="add-special"
                    checked={artistIsSpecial}
                    onChange={(e) => setArtistIsSpecial(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded border-white/10"
                  />
                  <label htmlFor="add-special" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Đặc biệt (ACP riêng)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Ngôn ngữ mặc định *</label>
                <select 
                  value={artistDefaultLanguage}
                  onChange={(e) => setArtistDefaultLanguage(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-sans"
                >
                  <option value="vi" className="bg-neutral-900">Tiếng Việt</option>
                  <option value="en" className="bg-neutral-900">English</option>
                  <option value="ko" className="bg-neutral-900">한국어</option>
                  <option value="ja" className="bg-neutral-900">日本語</option>
                  <option value="th" className="bg-neutral-900">ไทย</option>
                  <option value="zh" className="bg-neutral-900">中文</option>
                </select>
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
                  Tạo nghệ sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              <UserPlus className="w-5 h-5 text-purple-400" /> Cập nhật nghệ sĩ
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mô tả ngắn / Tagline (Bio) - Để trống để tự động hiển thị mặc định</label>
                <input 
                  type="text" 
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="vd: Thiên đường nhạc của..."
                />
              </div>

              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Hạng Thành Viên (Role)</label>
                <select
                  value={artistRoleId}
                  onChange={(e) => setArtistRoleId(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="" className="bg-neutral-900 text-white">FREE (Mặc định)</option>
                  <option value="vip" className="bg-neutral-900 text-white">VIP</option>
                  <option value="pro" className="bg-neutral-900 text-white">PRO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Số bài tối đa (Để trống: theo hạng)</label>
                <input 
                  type="number"
                  value={artistMaxSongs}
                  onChange={(e) => setArtistMaxSongs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Để trống sẽ áp dụng giới hạn theo Hạng thành viên"
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 opacity-50">Username (Đăng nhập) *</label>
                  <input 
                    type="text" 
                    disabled
                    readOnly
                    value={artistUsername}
                    className="w-full bg-black/20 text-neutral-400 border border-white/5 px-4 py-3 rounded-xl focus:outline-none font-mono cursor-not-allowed"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Username phụ / bổ sung (Phân tách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  value={artistExtraUsernames}
                  onChange={(e) => setArtistExtraUsernames(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="vd: tai, taicute"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Cho phép thành viên sử dụng thêm nhiều username khác nhau (ví dụ: truy cập qua <strong>tai.chorus.vn</strong> cũng như <strong>acxuantai.chorus.vn</strong>). Phân tách các username bằng dấu phẩy.
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <button type="button" onClick={() => setArtistPassword(Math.random().toString(36).slice(-8))} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 uppercase tracking-wider"><Sparkles className="w-3 h-3" /> Random</button>
                </div>
                <input 
                  type="password" 
                  value={artistPassword}
                  onChange={(e) => setArtistPassword(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none"
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
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
                    Trang chủ
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="edit-special"
                    checked={artistIsSpecial}
                    onChange={(e) => setArtistIsSpecial(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded border-white/10"
                  />
                  <label htmlFor="edit-special" className="text-sm font-bold select-none cursor-pointer text-amber-400">
                    Đặc biệt (ACP riêng)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Ngôn ngữ mặc định *</label>
                <select 
                  value={artistDefaultLanguage}
                  onChange={(e) => setArtistDefaultLanguage(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none font-sans"
                >
                  <option value="vi" className="bg-neutral-900">Tiếng Việt</option>
                  <option value="en" className="bg-neutral-900">English</option>
                  <option value="ko" className="bg-neutral-900">한국어</option>
                  <option value="ja" className="bg-neutral-900">日本語</option>
                  <option value="th" className="bg-neutral-900">ไทย</option>
                  <option value="zh" className="bg-neutral-900">中文</option>
                </select>
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
                {artistIsSpecial && (
                  <button
                    type="button"
                    disabled={isSyncing[artistUsername]}
                    onClick={() => handleSyncFirebaseData(artistUsername)}
                    className="mt-2 w-full bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-850 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {isSyncing[artistUsername] ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang đồng bộ dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Đồng bộ toàn bộ dữ liệu từ Firebase cũ</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Biên dịch tự động bằng AI (Gemini)</h4>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Tự động dịch phần giới thiệu (Bio), tiêu đề trang, tên các danh mục (Tabs), và thông tin Brief/Tên thương hiệu nhạc, tên/mô tả danh sách phát sang 5 ngôn ngữ khác (Anh, Hàn, Nhật, Thái, Trung).
                      <br />
                      <span className="text-amber-350">Không biên dịch:</span> Tên bài hát, lời bài hát, tên ca sĩ và tác giả để giữ nguyên tác gốc.
                    </p>
                  </div>
                </div>
                <button
                   type="button"
                   onClick={handleAITranslateArtist}
                   disabled={isTranslatingArtist}
                   className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-850 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                   {isTranslatingArtist ? (
                     <>
                       <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       <span>Đang tiến hành dịch thuật bằng AI...</span>
                     </>
                   ) : (
                     <>
                       <Globe className="w-3.5 h-3.5" />
                       <span>Biên dịch hồ sơ nghệ sĩ này</span>
                     </>
                   )}
                </button>
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
      {actionConfirm?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[1.5rem] p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-black border border-stone-150 relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 font-sans">
                  {actionConfirm.title}
                </h3>
                {actionConfirm.isAlertOnly && (
                  <button 
                    onClick={() => {
                      if (actionConfirm.onCancel) actionConfirm.onCancel();
                      if (confirmResolverRef.current) {
                        confirmResolverRef.current(false);
                        confirmResolverRef.current = null;
                      }
                      setActionConfirm(null);
                    }}
                    className="text-neutral-400 hover:text-black bg-neutral-100 hover:bg-neutral-200/60 p-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
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
                    Hủy
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
                  {actionConfirm.isAlertOnly ? 'Đóng' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Mail Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] w-full max-w-6xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto shadow-2xl custom-scrollbar flex flex-col">
            <button 
              onClick={() => setShowComposeModal(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white bg-white/5 p-2 rounded-xl transition-all cursor-pointer hover:bg-white/10"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black flex items-center gap-2 text-white">
                <Mail className="w-5.5 h-5.5 text-purple-400" />
                <span>Soạn Thư Hệ Thống</span>
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Gửi thông báo điện tử đến các nhóm nghệ sĩ trên hệ thống Chorus.vn.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Compose Form */}
              <div className="lg:col-span-3 bg-black/20 border border-white/5 rounded-3xl p-6">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setMailError('');
                    setMailSuccess('');
                    setMailSending(true);
                    try {
                      const res = await fetch('/api/acp/send-mail', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          recipientType: mailRecipientType,
                          registeredAfter: mailRecipientType === 'registered_after' ? mailRegisteredAfterDate : undefined,
                          title: mailTitle,
                          content: mailContent
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setMailSuccess(data.message || 'Gửi thư thành công!');
                        setMailTitle('');
                        setMailContent('');
                        fetchSentMails(); // Refresh history
                      } else {
                        setMailError(data.error || 'Có lỗi xảy ra khi gửi thư!');
                      }
                    } catch (err) {
                      setMailError('Lỗi kết nối máy chủ!');
                    } finally {
                      setMailSending(false);
                    }
                  }}
                  className="space-y-6"
                >
                  {mailSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                      {mailSuccess}
                    </div>
                  )}
                  {mailError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      {mailError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Đối tượng nhận thư
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMailRecipientType('all')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'all'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Toàn bộ nghệ sĩ</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Gửi đến tất cả tài khoản nghệ sĩ</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('verified')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'verified'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Đã xác thực Email</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Chỉ nghệ sĩ đã xác minh địa chỉ email</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('unverified')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'unverified'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Chưa xác thực Email</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Nghệ sĩ đăng ký nhưng chưa xác minh email</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMailRecipientType('registered_after')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          mailRecipientType === 'registered_after'
                            ? 'bg-purple-500/10 border-purple-500 text-white font-black'
                            : 'bg-black/20 border-white/5 text-neutral-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <div className="text-xs font-bold mb-0.5">Đăng ký sau ngày</div>
                        <div className="text-[10px] text-neutral-400 font-medium">Lọc nghệ sĩ theo mốc thời gian đăng ký</div>
                      </button>
                    </div>
                  </div>

                  {mailRecipientType === 'registered_after' && (
                    <div className="space-y-2 bg-black/20 border border-white/5 p-4 rounded-2xl">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                        Chọn ngày đăng ký sau mốc
                      </label>
                      <input
                        type="date"
                        required
                        value={mailRegisteredAfterDate}
                        onChange={(e) => setMailRegisteredAfterDate(e.target.value)}
                        className="bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-bold font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Tiêu đề thư
                    </label>
                    <input
                      type="text"
                      required
                      value={mailTitle}
                      onChange={(e) => setMailTitle(e.target.value)}
                      placeholder="Nhập tiêu đề email thông báo..."
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                      Nội dung thư (Hỗ trợ định dạng văn bản thường)
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={mailContent}
                      onChange={(e) => setMailContent(e.target.value)}
                      placeholder="Nhập nội dung thư gửi..."
                      className="w-full bg-black/40 text-white border border-white/10 px-4 py-3 rounded-xl focus:border-purple-500 focus:outline-none text-xs leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mailSending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-md tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {mailSending ? 'Đang gửi...' : 'GỬI THƯ HỆ THỐNG'}
                  </button>
                </form>
              </div>

              {/* Right Column: Sent Emails History */}
              <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col max-h-[650px] overflow-hidden">
                <h3 className="text-sm font-black text-neutral-200 mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span>Lịch Sử Thư Đã Gửi</span>
                  <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-neutral-400 font-mono">
                    {sentMails.length}
                  </span>
                </h3>

                {sentMails.length === 0 ? (
                  <div className="py-24 text-center text-neutral-500 flex flex-col items-center justify-center flex-grow">
                    <Database className="w-10 h-10 mb-2 opacity-10" />
                    <p className="text-xs font-bold">Chưa gửi thư nào.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto custom-scrollbar space-y-3 flex-grow pr-1">
                    {sentMails.map((mail, idx) => (
                      <div
                        key={idx}
                        className="bg-black/30 border border-white/5 p-4 rounded-2xl space-y-2 hover:border-pink-500/20 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                            {mail.recipientType === 'all' && 'Toàn bộ nghệ sĩ'}
                            {mail.recipientType === 'verified' && 'Đã xác thực email'}
                            {mail.recipientType === 'unverified' && 'Chưa xác thực email'}
                            {mail.recipientType === 'registered_after' && `Đăng ký sau ${mail.registeredAfter}`}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {new Date(mail.sentAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate">{mail.title}</h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed whitespace-pre-wrap font-medium">
                          {mail.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
