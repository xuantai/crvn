import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, BadgeCheck, Lock, Globe, ArrowRight, Sparkles, Disc3, CheckCircle2, ListMusic, X, AlertCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChorusLogo } from './ChorusLogo';

interface LandingArtist {
  artistName: string;
  extension: string;
  verified: boolean;
  pageTitle: string;
  artistBio: string;
  homeCoverUrl: string;
  demoCount: number;
  trackCount?: number;
  playlistCount: number;
  customDomain?: string;
  hasExternalWebsite?: boolean;
  externalWebsiteUrl?: string;
  slideshowImages?: string[];
}

interface LandingConfig {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  footerText: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  feature4Title?: string;
  feature4Desc?: string;
}

const dict = {
  vi: {
    statusBadge: 'ĐANG PHÁT TRIỂN',
    tagline: '✧ SẮP RA MẮT',
    heroSubTitle: 'Nơi những ca khúc khởi đầu.',
    placeholderEmail: 'Địa chỉ email của bạn...',
    buttonNotify: 'NHẬN THÔNG BÁO',
    successNotify: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm.',
    artistsTitle: 'Kho nhạc cá nhân đã kích hoạt',
    artistsSub: 'Danh sách các nghệ sĩ chính thức đang chia sẻ các bản demo và tuyển tập bài hát độc quyền của họ.',
    artistCount: 'Tổng cộng',
    artistUnit: 'nghệ sĩ',
    accessStore: 'Truy cập kho nhạc',
    featuresTitle: 'Được thiết kế cho trải nghiệm đỉnh cao',
    featuresSub: 'Tích hợp những công nghệ hiện đại nhất để tối ưu hóa quy trình phân phối và lưu trữ nội bộ.',
    noArtists: 'Chưa có trang nhạc nào',
    noArtistsDesc: 'Các nghệ sĩ đang chuẩn bị kho lưu trữ của họ. Vui lòng quay lại sau!',
    totalTracks: 'bản ghi',
    totalPlaylists: 'Playlist',
    langSelect: 'Chọn ngôn ngữ',
    feature1Title: 'Bảo mật demo & tuyển tập',
    feature1Desc: 'Thiết lập mật mã cho từng tác phẩm chưa công bố, ngăn chặn nghe trộm hoặc chia sẻ trái phép. Gửi link demo bảo mật cho ca sĩ, nhạc sĩ phối khí và các đối tác đáng tin cậy.',
    feature2Title: 'Dịch thuật thông minh (AI Translation)',
    feature2Desc: 'Nhận diện vị trí địa lý của khán giả quốc tế để hiển thị tiêu đề và nội dung mô tả sản phẩm bằng ngôn ngữ bản địa phù hợp nhất (Anh, Nhật, Trung, Hàn...).',
    feature3Title: 'Đồng bộ Cloud & Cache cục bộ',
    feature3Desc: 'Lưu trữ dữ liệu kép trên Cloud Firestore chất lượng cao kết hợp cơ chế dự phòng cục bộ. Cam kết phát nhạc ổn định, tốc độ load nhanh ngay cả khi internet quốc tế gặp sự cố.',
    feature4Title: 'Bố cục mang đậm dấu ấn cá nhân',
    feature4Desc: 'Tùy chỉnh ảnh bìa đại diện, màu sắc chủ đạo, ảnh đại diện, viết bio, cập nhật danh sách mạng xã hội. Trang cá nhân hoạt động độc lập như một website thu nhỏ của riêng bạn.',
    betaTitle: 'Thử nghiệm giới hạn',
    betaSubtitle: 'BETA TESTING ONLY',
    betaDesc: 'Chúng tôi đang hoạt động thử nghiệm và chưa mở đăng ký rộng rãi cho công chúng.',
    betaSubDesc: 'Hệ thống chỉ cung cấp tài khoản nội bộ cho các nghệ sĩ trong chương trình thử nghiệm. Mọi thông tin liên hệ xin gửi về ban quản trị.',
    betaBtn: 'Đã hiểu, đóng lại'
  },
  en: {
    statusBadge: 'IN DEVELOPMENT',
    tagline: '✧ COMING SOON',
    heroSubTitle: 'Where melodies begin.',
    placeholderEmail: 'Your email address...',
    buttonNotify: 'GET NOTIFIED',
    successNotify: 'Subscribed successfully! Thank you for your interest.',
    artistsTitle: 'Activated Personal Music Vaults',
    artistsSub: 'Official artists sharing their exclusive demos and custom playlists.',
    artistCount: 'Total',
    artistUnit: 'artists',
    accessStore: 'Access Vault',
    featuresTitle: 'Engineered for Ultimate Experience',
    featuresSub: 'Integrated with top-tier technology to streamline delivery and secure local archiving.',
    noArtists: 'No Music Spaces Yet',
    noArtistsDesc: 'Artists are preparing their vaults. Please check back later!',
    totalTracks: 'tracks',
    totalPlaylists: 'playlists',
    langSelect: 'Language',
    feature1Title: 'Secure Demos & Playlists',
    feature1Desc: 'Set passwords for unreleased tracks to prevent unauthorized leaks. Send secure demo links to vocalists, arrangers, and trusted partners.',
    feature2Title: 'Intelligent Translation',
    feature2Desc: 'Detect listener geographic location to display track titles and descriptions in the most suitable native language (English, Japanese, Chinese, Korean...).',
    feature3Title: 'Cloud Sync & Local Cache',
    feature3Desc: 'Dual-store data on high-quality Cloud Firestore combined with local caching mechanism. Ensures stable music playback even during international network disruptions.',
    feature4Title: 'Personalized Vault Branding',
    feature4Desc: 'Customize covers, primary colors, profile pictures, bios, and social media links. Your page operates independently as your personal micro-site.',
    betaTitle: 'Limited Testing',
    betaSubtitle: 'BETA TESTING ONLY',
    betaDesc: 'We are currently operating in a closed test and have not opened registration to the public.',
    betaSubDesc: 'The system only provides internal accounts for artists in the testing program. Please send inquiries to the administrator.',
    betaBtn: 'Understood, Close'
  },
  ko: {
    statusBadge: '개발 중',
    tagline: '✧ 출시 예정',
    heroSubTitle: '노래가 시작되는 곳.',
    placeholderEmail: '귀하의 이메일 주소...',
    buttonNotify: '알림 신청',
    successNotify: '구독 성공! 관심 가져주셔서 감사합니다.',
    artistsTitle: '활성화된 개인 음악 아카이브',
    artistsSub: '독점 데모와 맞춤형 재생 목록을 공유하는 공식 아티스트 목록입니다.',
    artistCount: '총',
    artistUnit: '명',
    accessStore: '음악 보관함 방문',
    featuresTitle: '최상의 경험을 위한 설계',
    featuresSub: '내부 배포 및 스토리지 프로세스를 최적화하기 위한 현대적인 기술 적용.',
    noArtists: '등록된 음악 페이지가 없습니다',
    noArtistsDesc: '아티스트가 보관함을 준비 중입니다. 나중에 다시 확인해 주세요!',
    totalTracks: '트랙',
    totalPlaylists: '재생 목록',
    langSelect: '언어',
    feature1Title: '데모 및 아카이브 보안',
    feature1Desc: '미발표 트랙에 비밀번호를 설정하여 무단 유출을 방지합니다. 보컬리스트, 편곡자 및 신뢰할 수 있는 파트너에게 보안 데모 링크를 전송하십시오.',
    feature2Title: '지능형 서비스 번역',
    feature2Desc: '청취자의 지리적 위치를 감지하여 트랙 제목과 설명을 가장 적절한 모국어(영어, 일본어, 중국어, 한국어...)로 표시합니다.',
    feature3Title: '클라우드 동기화 및 로컬 캐시',
    feature3Desc: '로컬 캐싱 메커니즘과 결합된 고품질 Cloud Firestore에 데이터를 이중 저장합니다. 국제 네트워크 장애 시에도 안정적인 음악 재생을 보장합니다.',
    feature4Title: '고유한 브랜딩 레이아웃',
    feature4Desc: '커버 이미지, 기본 색상, 프로필 사진, 소개글 및 소셜 미디어 링크를 맞춤 설정하세요. 귀하의 페이지는 개인 마이크로 사이트로 독립적으로 운영됩니다.',
    betaTitle: '제한된 테스트 진행 중',
    betaSubtitle: 'BETA TESTING ONLY',
    betaDesc: '현재 비공개 테스트 운영 중이며 일반 대중에게는 회원 가입을 개방하지 않았습니다.',
    betaSubDesc: '본 시스템은 테스트 프로그램에 참여하는 아티스트들을 위해 내부 계정만 제공합니다. 모든 문의 사항은 관리자에게 보내주시기 바랍니다.',
    betaBtn: '이해했습니다, 닫기'
  }
};

const FALLBACK_SLIDESHOW = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80"
];

function ArtistLandingCard({ artist, t }: { artist: any; t: any; key?: any }) {
  // Determine images to use for the background slideshow
  let bgImages = artist.slideshowImages && artist.slideshowImages.length > 0
    ? artist.slideshowImages
    : [];

  // Filter out the homeCoverUrl ONLY if there are other images (chia ra)
  const otherImages = bgImages.filter(img => img !== artist.homeCoverUrl);
  if (otherImages.length > 0) {
    bgImages = otherImages;
  } else if (artist.homeCoverUrl) {
    // If only one image exists, use it for both purposes (dùng hình đó cho cả 2 mục đích)
    bgImages = [artist.homeCoverUrl];
  } else {
    // If empty, fall back to premium stock music backgrounds
    bgImages = FALLBACK_SLIDESHOW;
  }

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (bgImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % bgImages.length);
    }, 5000); // 5s crossfade transition
    return () => clearInterval(timer);
  }, [bgImages]);

  // Route URL calculations
  const isProduction = window.location.hostname.includes('chorus.vn');
  let href = `/${artist.extension}`;
  let isExternal = false;

  if (artist.hasExternalWebsite && artist.externalWebsiteUrl) {
    const cleanUrl = artist.externalWebsiteUrl.trim().replace(/^https?:\/\//i, '');
    href = `https://${cleanUrl}`;
    isExternal = true;
  } else if (artist.customDomain) {
    const cleanUrl = artist.customDomain.trim().replace(/^https?:\/\//i, '');
    href = `https://${cleanUrl}`;
    isExternal = true;
  } else if (isProduction) {
    href = `https://${artist.extension}.chorus.vn`;
    isExternal = true;
  }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-[480px] rounded-[2.5rem] overflow-hidden border border-neutral-200/40 shadow-lg hover:shadow-2xl transition-all duration-300 bg-neutral-950 flex flex-col justify-between"
    >
      {/* Slideshow background with cross-fade & Ken Burns zoom transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.55, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={bgImages[activeIdx]}
              alt={`${artist.artistName} cover slide`}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Dark Gradient & ambient blur to ensure white text is perfectly scannable and beautiful */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10 z-10" />
        <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-[1px] z-10" />

        {/* Animated Wavy Music Staff & Notes SVG Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15 opacity-40 select-none">
          <svg className="w-full h-full" viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Five undulating staff lines */}
            <g className="stroke-white/15" strokeWidth="1">
              <motion.path
                d="M -50,180 C 100,100 200,280 450,140"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.2, ease: "easeInOut" }}
              />
              <motion.path
                d="M -50,188 C 100,108 200,288 450,148"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.3, ease: "easeInOut" }}
              />
              <motion.path
                d="M -50,196 C 100,116 200,296 450,156"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.4, ease: "easeInOut" }}
              />
              <motion.path
                d="M -50,204 C 100,124 200,304 450,164"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M -50,212 C 100,132 200,312 450,172"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 0.6, ease: "easeInOut" }}
              />
            </g>

            {/* G-Clef (Khóa Sol) - styled elegantly, fade in and draw */}
            <motion.text
              x="30"
              y="225"
              className="fill-white/30 font-serif text-[72px]"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 0.35, scale: 1, rotate: 0 }}
              transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
            >
              𝄞
            </motion.text>

            {/* Floating Music Notes */}
            <motion.text
              x="160"
              y="210"
              className="fill-white/35 font-sans text-2xl select-none"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 0.45, 0.45, 0], y: [15, -15, -35, -55], x: [0, 8, -8, 4] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
            >
              ♪
            </motion.text>

            <motion.text
              x="250"
              y="180"
              className="fill-white/35 font-sans text-3xl select-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0.4, 0.4, 0], y: [20, -20, -45, -65], x: [0, -10, 10, -5] }}
              transition={{ duration: 7, repeat: Infinity, delay: 3.2, ease: "easeInOut" }}
            >
              ♫
            </motion.text>

            <motion.text
              x="190"
              y="240"
              className="fill-white/30 font-sans text-3xl select-none"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: [0, 0.35, 0.35, 0], y: [25, -10, -35, -50], x: [0, 12, -12, 6] }}
              transition={{ duration: 8, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
            >
              ♬
            </motion.text>

            <motion.text
              x="310"
              y="220"
              className="fill-white/35 font-sans text-2xl select-none"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 0.45, 0.45, 0], y: [15, -15, -35, -50], x: [0, -6, 6, -3] }}
              transition={{ duration: 6.5, repeat: Infinity, delay: 4.8, ease: "easeInOut" }}
            >
              ♩
            </motion.text>
          </svg>
        </div>
      </div>

      {/* Card Header Row */}
      <div className="p-8 relative z-20 flex justify-between items-center w-full">
        {/* Pulsing ring around the circular avatar */}
        <div className="relative">
          <motion.div 
            animate={{ 
              boxShadow: [
                "0 0 0 0px rgba(255, 255, 255, 0.2)",
                "0 0 0 8px rgba(255, 255, 255, 0)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full border-2 border-white bg-white/15 backdrop-blur-md shadow-lg overflow-hidden shrink-0 flex items-center justify-center"
          >
            {artist.homeCoverUrl ? (
              <img
                src={artist.homeCoverUrl}
                alt={artist.artistName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Music className="w-5 h-5 text-white" />
            )}
          </motion.div>
          {/* Active status pulse badge */}
          <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-2 border-neutral-950 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        </div>

        {/* Frosted domain badge */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider text-neutral-200 shadow-sm uppercase">
          <Globe className="w-3.5 h-3.5 text-rose-450 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
          <span>
            {artist.hasExternalWebsite && artist.externalWebsiteUrl ? (
              artist.externalWebsiteUrl.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '')
            ) : artist.customDomain ? (
              artist.customDomain.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '')
            ) : (
              `${artist.extension}.chorus.vn`
            )}
          </span>
        </div>
      </div>

      {/* Overlaid Info - text over cover, optimized vertical footprint, elegant typography */}
      <div className="p-8 relative z-20 w-full flex flex-col justify-end space-y-6">
        <div className="space-y-1">
          <p className="text-neutral-200 text-xs line-clamp-1 font-serif italic tracking-wide drop-shadow-sm">
            {artist.artistBio || `Thiên đường nhạc của`}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
              {artist.artistName}
            </h3>
            {artist.verified && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-full shadow-sm shrink-0">
                <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-450 shrink-0" title="Tài khoản xác thực" />
              </div>
            )}
          </div>
        </div>

        {/* Count Pill badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold text-neutral-200">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg">
              <Music className="w-3.5 h-3.5 text-neutral-300" />
              <span>{artist.trackCount || 0} {t('totalTracks')}</span>
            </div>
            
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
              <span>{artist.demoCount || 0} Demo</span>
            </div>

            {artist.playlistCount > 0 && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg">
                <ListMusic className="w-3.5 h-3.5 text-purple-300" />
                <span>{artist.playlistCount} {t('totalPlaylists')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Solid elegant action button */}
        <div>
          {isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between bg-white text-black hover:bg-black hover:text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 border border-white/20 shadow-lg active:scale-95"
            >
              <span className="text-[10px] uppercase tracking-wider">{t('accessStore')}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
            </a>
          ) : (
            <Link
              to={href}
              className="w-full flex items-center justify-between bg-white text-black hover:bg-black hover:text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 border border-white/20 shadow-lg active:scale-95"
            >
              <span className="text-[10px] uppercase tracking-wider">{t('accessStore')}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChorusVNLanding() {
  const [artists, setArtists] = useState<LandingArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');
  const [lang, setLang] = useState<'vi' | 'en' | 'ko'>(
    (localStorage.getItem('preferredLang') as 'vi' | 'en' | 'ko') || 'vi'
  );

  const [config, setConfig] = useState<LandingConfig>({
    tagline: '✧ SẮP RA MẮT',
    heroTitle: 'Chorus',
    heroSubtitle: 'Nơi những ca khúc khởi đầu.',
    heroDescription: 'Chúng tôi đang xây dựng một không gian trực tuyến, nơi các nhạc sĩ, ca sĩ, nhà sản xuất âm nhạc, quản lý nghệ sĩ, thương hiệu... có thể chia sẻ các ca khúc đã phát hành và demo chưa ra mắt của mình.',
    footerText: 'CHORUS.VN © 2026 - Nơi những ca khúc bắt đầu.',
    feature1Title: '',
    feature1Desc: '',
    feature2Title: '',
    feature2Desc: '',
    feature3Title: '',
    feature3Desc: '',
    feature4Title: '',
    feature4Desc: ''
  });

  useEffect(() => {
    localStorage.setItem('preferredLang', lang);
  }, [lang]);

  useEffect(() => {
    // Load config
    fetch('/api/public/landing-config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setConfig((prev) => ({ ...prev, ...data }));
          if (data.pageTitle) {
            document.title = data.pageTitle;
          }
          if (data.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.faviconUrl;
          }
        }
      })
      .catch((err) => console.error('Error fetching landing config:', err));

    // Load public artists
    fetch('/api/public/artists')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtists(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching public artists:', err);
        setLoading(false);
      });
  }, []);

  const t = (key: string) => {
    const tr = (dict[lang] as any)[key] || (dict['vi'] as any)[key] || '';
    return tr;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    setIsSubmitting(true);
    setSubscribeError('');
    setSubscribeSuccess(false);

    try {
      const res = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriberEmail.trim() })
      });
      if (res.ok) {
        setSubscribeSuccess(true);
        setSubscriberEmail('');
        setTimeout(() => setSubscribeSuccess(false), 5000);
      } else {
        const data = await res.json();
        setSubscribeError(data.error || 'Đăng ký thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      setSubscribeError('Lỗi kết nối máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 font-sans selection:bg-neutral-900/10 relative overflow-x-hidden">
      {/* Delicate Radial Dot Grid Pattern Background matching the screenshot texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e2dd_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none opacity-80" />

      {/* Animated Wavy Music Staff & Notes Global Background */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none z-0 overflow-hidden select-none">
        <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1920 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="globalStaffGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e5e5e5" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.22" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#e5e5e5" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* 5 undulating stairway-to-heaven staff lines drawing left-to-right */}
          <g stroke="url(#globalStaffGradient)" strokeWidth="1.5">
            <motion.path
              d="M -100,730 C 300,680 600,430 960,380 C 1320,330 1600,180 2020,130"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 4.5, ease: "easeInOut", delay: 0.1 }}
            />
            <motion.path
              d="M -100,740 C 300,690 600,440 960,390 C 1320,340 1600,190 2020,140"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 4.5, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.path
              d="M -100,750 C 300,700 600,450 960,400 C 1320,350 1600,200 2020,150"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 4.5, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.path
              d="M -100,760 C 300,710 600,460 960,410 C 1320,360 1600,210 2020,160"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 4.5, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.path
              d="M -100,770 C 300,720 600,470 960,420 C 1320,370 1600,220 2020,170"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 4.5, ease: "easeInOut", delay: 0.5 }}
            />
          </g>

          {/* Elegant G-Clef (Khóa Sol) appearing gradually */}
          <motion.text
            x="200"
            y="615"
            className="fill-purple-500/25 font-serif text-[110px]"
            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
            animate={{ opacity: 0.35, scale: 1, rotate: 0 }}
            transition={{ duration: 2, delay: 1.8, ease: "easeOut" }}
          >
            𝄞
          </motion.text>

          {/* Floating Music Notes appearing gradually with continuous animations */}
          <motion.text
            x="500"
            y="430"
            className="fill-purple-400/25 font-sans text-5xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.3, 
              scale: 1,
              y: [430, 410, 430],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              opacity: { delay: 2.2, duration: 1.2 },
              scale: { delay: 2.2, duration: 1.2 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 7, ease: "easeInOut" }
            }}
          >
            ♫
          </motion.text>

          <motion.text
            x="650"
            y="410"
            className="fill-rose-400/20 font-sans text-4xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.25, 
              scale: 1,
              y: [410, 395, 410],
              rotate: [0, -8, 8, 0]
            }}
            transition={{
              opacity: { delay: 2.6, duration: 1.2 },
              scale: { delay: 2.6, duration: 1.2 },
              y: { repeat: Infinity, duration: 5.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 6.5, ease: "easeInOut" }
            }}
          >
            ♪
          </motion.text>

          <motion.text
            x="850"
            y="360"
            className="fill-rose-500/25 font-sans text-5xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.32, 
              scale: 1,
              y: [360, 340, 360],
              rotate: [0, 12, -12, 0]
            }}
            transition={{
              opacity: { delay: 2.8, duration: 1.2 },
              scale: { delay: 2.8, duration: 1.2 },
              y: { repeat: Infinity, duration: 6.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
            }}
          >
            ♬
          </motion.text>

          <motion.text
            x="1150"
            y="300"
            className="fill-blue-400/25 font-sans text-4xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.28, 
              scale: 1,
              y: [300, 280, 300],
              rotate: [0, -10, 10, 0]
            }}
            transition={{
              opacity: { delay: 3.2, duration: 1.2 },
              scale: { delay: 3.2, duration: 1.2 },
              y: { repeat: Infinity, duration: 7, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 7.5, ease: "easeInOut" }
            }}
          >
            ♩
          </motion.text>

          <motion.text
            x="1450"
            y="220"
            className="fill-purple-500/20 font-sans text-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.22, 
              scale: 1,
              y: [220, 205, 220],
              rotate: [0, 8, -8, 0]
            }}
            transition={{
              opacity: { delay: 3.5, duration: 1.2 },
              scale: { delay: 3.5, duration: 1.2 },
              y: { repeat: Infinity, duration: 5.8, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 6.2, ease: "easeInOut" }
            }}
          >
            ♭
          </motion.text>

          <motion.text
            x="1750"
            y="160"
            className="fill-rose-400/25 font-sans text-4xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 0.26, 
              scale: 1,
              y: [160, 145, 160],
              rotate: [0, -12, 12, 0]
            }}
            transition={{
              opacity: { delay: 3.8, duration: 1.2 },
              scale: { delay: 3.8, duration: 1.2 },
              y: { repeat: Infinity, duration: 6.2, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 6.8, ease: "easeInOut" }
            }}
          >
            ♯
          </motion.text>
        </svg>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#faf9f6]/80 border-b border-neutral-200/40 px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <ChorusLogo className="w-10 h-10 select-none group-hover:scale-105 transition-all duration-300" />
            <span className="text-sm font-black tracking-[0.2em] font-sans text-black group-hover:text-neutral-700 transition-colors">
              CHORUS.VN
            </span>
          </Link>

          {/* Action Header: Status Badge & Language Segmented Toggler */}
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-white/60 border border-neutral-200/60 px-4 py-2 rounded-full text-[10px] font-black text-neutral-600 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('statusBadge')}</span>
            </div>

            {/* Language Selection Segmented Bar */}
            <div className="flex items-center gap-0.5 bg-neutral-200/50 border border-neutral-200/50 p-1 rounded-xl">
              {(['vi', 'en', 'ko'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    lang === l
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-200/30'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 sm:px-10 max-w-7xl mx-auto text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/60 border border-neutral-200/60 px-4 py-1.5 rounded-full text-[10px] font-extrabold text-neutral-500 tracking-wider">
            <span>{config.tagline || t('tagline')}</span>
          </div>

          {/* Brand Title: Chorus.vn (Classic Bold & Serif Italic pairing with staggered letter animation) */}
          <h1 className="text-6xl sm:text-[5.5rem] font-bold tracking-tight text-neutral-950 flex flex-wrap items-center justify-center font-sans gap-x-1 sm:gap-x-2 select-none overflow-visible py-2">
            <span className="flex">
              {"Chorus".split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 35, scale: 0.7, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1], // Custom ultra-premium easeOutExpo
                  }}
                  whileHover={{ 
                    scale: 1.18, 
                    y: -4,
                    color: '#8b5cf6', // Violet accent
                    textShadow: '0 0 25px rgba(139, 92, 246, 0.7)' 
                  }}
                  className="cursor-default inline-block origin-bottom transition-colors duration-200"
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial={{ opacity: 0, x: -30, scale: 0.7, rotate: -10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 1.3,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ 
                scale: 1.18, 
                rotate: 6,
                color: '#f43f5e', // Rose accent
                textShadow: '0 0 25px rgba(244, 63, 94, 0.7)' 
              }}
              className="font-serif italic font-light text-neutral-400 cursor-default inline-block origin-center transition-all duration-300"
            >
              .vn
            </motion.span>
          </h1>

          {/* Slogan */}
          <p className="font-serif italic text-xl sm:text-2xl text-neutral-500 tracking-wide font-light">
            {config.heroSubtitle || t('heroSubTitle')}
          </p>

          {/* Thin horizontal elegant divider line */}
          <div className="w-16 h-[1px] bg-neutral-300/60 mx-auto my-6" />

          {/* Subtitle Description */}
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            {config.heroDescription || t('heroDescription')}
          </p>
        </motion.div>

        {/* Dynamic Email Registration Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="max-w-lg mx-auto"
        >
          <form onSubmit={handleSubscribe} className="relative bg-white border border-neutral-200/80 rounded-full p-1.5 pl-5 flex items-center shadow-sm hover:border-neutral-300 transition-all focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400">
            <Mail className="w-4 h-4 text-neutral-400 shrink-0 mr-3" />
            <input
              type="email"
              required
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              placeholder={t('placeholderEmail')}
              className="bg-transparent text-neutral-800 text-sm focus:outline-none flex-grow mr-2 w-full font-sans"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              animate={{ 
                boxShadow: ['0px 0px 0px 0px rgba(0,0,0,0.8)', '0px 0px 15px 4px rgba(0,0,0,0.3)', '0px 0px 0px 0px rgba(0,0,0,0.8)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white font-black text-[10px] py-3.5 px-6 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1 cursor-pointer relative overflow-hidden group"
            >
              {/* Subtle animated gradient overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">{isSubmitting ? '...' : t('buttonNotify')}</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5] relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          {/* Message alerts */}
          <AnimatePresence mode="wait">
            {subscribeSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-emerald-600 text-xs font-bold mt-4 bg-emerald-50 border border-emerald-100 py-2.5 px-4 rounded-xl"
              >
                {t('successNotify')}
              </motion.p>
            )}

            {subscribeError && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-rose-600 text-xs font-bold mt-4 bg-rose-50 border border-rose-100 py-2.5 px-4 rounded-xl"
              >
                {subscribeError}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Main Content & Activated Music Stores Showcase List */}
      <section id="artist-showcase" className="py-24 px-6 sm:px-10 max-w-7xl mx-auto border-t border-neutral-200/40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>{t('statusBadge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 font-sans">
              {t('artistsTitle')}
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl font-medium leading-relaxed">
              {t('artistsSub')}
            </p>
          </div>
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white border border-neutral-200/60 rounded-2xl px-5 py-3 shrink-0 shadow-sm">
            {t('artistCount')}: <span className="text-neutral-900 font-extrabold">{artists.length} {t('artistUnit')}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-neutral-200/50 rounded-[2.5rem] p-8 h-[280px] animate-pulse flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="h-6 w-1/2 bg-neutral-200 rounded-lg"></div>
                  <div className="h-4 w-5/6 bg-neutral-200 rounded-lg"></div>
                  <div className="h-4 w-2/3 bg-neutral-200 rounded-lg"></div>
                </div>
                <div className="h-12 w-full bg-neutral-100 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="bg-white/60 border border-dashed border-neutral-200 rounded-[3rem] p-16 text-center max-w-md mx-auto">
            <Disc3 className="w-14 h-14 text-neutral-300 mx-auto mb-4 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-lg font-black text-neutral-800">{t('noArtists')}</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              {t('noArtistsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <ArtistLandingCard key={artist.extension} artist={artist} t={t} />
            ))}
          </div>
        )}
      </section>

      {/* Features Showcase Grid */}
      <section className="py-24 bg-white/40 border-t border-b border-neutral-200/40 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 font-sans">
              {t('featuresTitle')}
            </h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              {t('featuresSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{config.feature1Title || t('feature1Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {config.feature1Desc || t('feature1Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{config.feature2Title || t('feature2Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {config.feature2Desc || t('feature2Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{config.feature3Title || t('feature3Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {config.feature3Desc || t('feature3Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Disc3 className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{config.feature4Title || t('feature4Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {config.feature4Desc || t('feature4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200/40 py-16 px-6 sm:px-10 text-center text-xs">
        <div className="max-w-7xl mx-auto">
          <p className="font-extrabold text-neutral-800 text-sm tracking-wide">
            {config.footerText || t('footer')}
          </p>
        </div>
      </footer>

      {/* Interactive Beta Registration Modal */}
      <AnimatePresence>
        {showBetaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBetaModal(false)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowBetaModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-black bg-neutral-100 hover:bg-neutral-200/60 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center mx-auto text-neutral-800">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-neutral-900">{t('betaTitle')}</h3>
                  <p className="text-neutral-400 font-mono text-[9px] font-black uppercase tracking-wider">
                    {t('betaSubtitle')}
                  </p>
                </div>

                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  {t('betaDesc')}
                </p>

                <p className="text-neutral-400 text-[10px] sm:text-xs leading-relaxed">
                  {t('betaSubDesc')}
                </p>

                <button
                  onClick={() => setShowBetaModal(false)}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  {t('betaBtn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
