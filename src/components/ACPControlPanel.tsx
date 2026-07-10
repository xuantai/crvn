import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChorusLogo } from './ChorusLogo';
import { Users, Search, UserPlus, Shield, Database, Edit2, Trash2, Check, X, LogOut, Plus, Music, HelpCircle, Lock, RefreshCw, CheckCircle, ExternalLink, Globe, Layout, Save, CheckCircle2, Sparkles, Home, Upload, MessageSquare, Send, AlertTriangle, Disc3, Bell, ChevronLeft, Mail } from 'lucide-react';


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
  const [actionConfirm, setActionConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'artists' | 'landing' | 'tickets' | 'compose-mail'>('artists');
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
  const [adminUsername, setAdminUsername] = useState('acxuantai');
  const [adminPassword, setAdminPassword] = useState('MatKhauDay123');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

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
  const [featuresTitle, setFeaturesTitle] = useState('');
  const [featuresSub, setFeaturesSub] = useState('');

  const [isSavingLanding, setIsSavingLanding] = useState(false);
  const [landingSuccessMsg, setLandingSuccessMsg] = useState('');
  const [subscribers, setSubscribers] = useState<string[]>([]);

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
    if (token && activeTab === 'compose-mail') {
      fetchSentMails();
    }
  }, [token, activeTab]);

  useEffect(() => {
    setArtistCurrentPage(0);
  }, [searchQuery, artistPageSize]);

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
        setLandingPageTitle(data.pageTitle || '');
        setLandingOgImageUrl(data.ogImageUrl || '');
        setLandingFaviconUrl(data.faviconUrl || '');
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

  const handleApproveExtensionChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu thay đổi Sub-domain này?')) return;
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
        alert(data.error || 'Không thể duyệt yêu cầu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleRejectExtensionChange = async (username: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu thay đổi Sub-domain này?')) return;
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
        alert(data.error || 'Không thể từ chối yêu cầu');
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
          adminUsername,
          adminPassword,
          pageTitle: landingPageTitle,
          ogImageUrl: landingOgImageUrl,
          faviconUrl: landingFaviconUrl,
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
    setArtistPassword('');
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
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-4 px-6 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'tickets'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Hộp Thư</span>
            {tickets.filter(t => t.type === 'remove' && t.status === 'open').length > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('compose-mail')}
            className={`py-4 px-6 text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'compose-mail'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 text-purple-400" />
            <span>Soạn thư</span>
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
                <>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-neutral-900/50">
                        <th className="p-4 pl-6 text-xs text-neutral-400 uppercase font-bold tracking-wider">Nghệ Sĩ</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Username</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Đường dẫn</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Hiển thị</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Trạng Thái Duyệt</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Mật khẩu</th>
                        <th className="p-4 text-xs text-neutral-400 uppercase font-bold tracking-wider">Database</th>
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
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {artist.activated !== false ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  Hoạt Động
                                </span>
                              ) : (
                                <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg text-[10px] font-bold animate-pulse">
                                  Chờ Duyệt
                                </span>
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
                          <td className="p-4 text-sm font-mono text-neutral-400">••••••••</td>
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
        ) : activeTab === 'compose-mail' ? (
          /* Compose Mail Tab */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Mail className="w-5.5 h-5.5 text-purple-400" />
                  <span>Soạn Thư Hệ Thống</span>
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                  Gửi thông báo điện tử đến các nhóm nghệ sĩ trên hệ thống Chorus.vn.
                </p>
              </div>

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
                    rows={10}
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

            {/* Sent Emails History Column */}
            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col h-full max-h-[800px]">
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
        ) : (
          /* Tickets (Inbox) Tab */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                <span>Hộp Thư Yêu Cầu Gỡ Bài</span>
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Xem xét, trao đổi và ra quyết định xử lý các tranh chấp bản quyền hoặc yêu cầu gỡ sản phẩm âm nhạc.
              </p>
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
        )}
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
                  type="password" 
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
      {actionConfirm?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up text-black">
            <h3 className="text-xl font-bold mb-2">{actionConfirm.title}</h3>
            <p className="text-stone-600 mb-6">{actionConfirm.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setActionConfirm(null)} 
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={() => { actionConfirm.onConfirm(); setActionConfirm(null); }} 
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Xác nhận
              </button>
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
