import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Music, BadgeCheck, Lock, Globe, ArrowRight, Sparkles, Disc3, CheckCircle2, ListMusic, X, AlertCircle, Mail, ChevronLeft, ChevronRight, UserPlus, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChorusLogo } from './ChorusLogo';

interface LandingArtist {
  artistName: string;
  extension: string;
  verified: boolean;
  pageTitle: string;
  artistBio: string;
  homeCoverUrl: string;
  avatarUrl?: string;
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
  statusBadge?: string;
  featuresTitle?: string;
  featuresSub?: string;
}

const dict = {
  vi: {
    registerSuccessApproval: "Sau khi được duyệt, thông tin quản trị của bạn sẽ là:",
    registerSuccessInfoTitle: "Thông tin kho nhạc nghệ sĩ {artistName}",
    registerSuccessArtistName: "Nghệ danh",
    registerSuccessUsername: "Username",
    registerSuccessWebsite: "Website",
    registerSuccessAdmin: "Admin",
    registerSuccessAdminUser: "Admin User",
    statusBadge: 'Đang hoạt động thử nghiệm',
    tagline: '✧ SẮP RA MẮT',
    heroSubTitle: 'Nơi những ca khúc khởi đầu.',
    placeholderEmail: 'Địa chỉ email của bạn...',
    buttonNotify: 'NHẬN THÔNG BÁO',
    successNotify: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm.',
    artistsTitle: 'Kho nhạc cá nhân đã kích hoạt',
    artistsSub: '',
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
    betaBtn: 'Đã hiểu, đóng lại',
    searchPlaceholder: 'Tìm kiếm nghệ sĩ...',
    noArtistsFound: 'Không tìm thấy nghệ sĩ',
    noArtistsFoundDesc: 'Không tìm thấy nghệ sĩ nào khớp với từ khoá "{query}". Hãy thử lại bằng từ khoá khác!',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    pageIndicator: 'Trang',
    registerTitle: 'Đăng ký thành viên',
    registerSubTitle: 'Become a Chorus Member',
    registerSuccessTitle: 'Đăng ký hoàn tất!',
    registerSuccessDesc1: 'Tài khoản {username} đã đăng ký thành công.',
    registerSuccessDesc2: 'Quản trị viên sẽ xác thực tài khoản của bạn. Sau khi được duyệt, trang nghệ sĩ {extension}.chorus.vn sẽ chính thức hoạt động!',
    closeWindow: 'Đóng cửa sổ',
    artistNameLabel: 'Tên nghệ sĩ',
    artistNamePlaceholder: 'Nghệ danh của bạn',
    usernameLabel: 'Tên đăng nhập',
    usernamePlaceholder: 'ten-dang-nhap-admin',
    usernameNote: '* Chỉ gồm chữ thường không dấu, số, dấu gạch dưới.',
    extensionLabel: 'Phần Mở Rộng',
    extensionPlaceholder: 'nghesi',
    extensionNote: 'Link kho nhạc của bạn sẽ là {extension}.chorus.vn ( tự động lấy phần trên để điền vào )',
    emailLabel: 'Địa chỉ Email',
    passwordLabel: 'Mật khẩu quản trị',
    passwordPlaceholder: 'Nhập mật khẩu...',
    captchaLabel: 'Mã xác nhận bảo vệ (Captcha)',
    captchaPlaceholder: 'Nhập chữ...',
    submitting: 'Đang gửi...',
    submitButton: 'ĐĂNG KÝ THÀNH VIÊN',
    loading: 'Đang tải...',
    captchaClickTooltip: 'Click để đổi mã khác',
    captchaReloadTooltip: 'Tải lại Captcha'
  },
  en: {
    registerSuccessApproval: "Once approved, your administration details will be:",
    registerSuccessInfoTitle: "Music Vault Info for {artistName}",
    registerSuccessArtistName: "Artist Name",
    registerSuccessUsername: "Username",
    registerSuccessWebsite: "Website",
    registerSuccessAdmin: "Admin",
    registerSuccessAdminUser: "Admin User",
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
    betaBtn: 'Understood, Close',
    searchPlaceholder: 'Search artists...',
    noArtistsFound: 'No artists found',
    noArtistsFoundDesc: 'No artists match the keyword "{query}". Please try again with another keyword!',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    pageIndicator: 'Page',
    registerTitle: 'Member Registration',
    registerSubTitle: 'Become a Chorus Member',
    registerSuccessTitle: 'Registration Completed!',
    registerSuccessDesc1: 'Account {username} has been registered successfully.',
    registerSuccessDesc2: 'The administrator will verify your account. Once approved, your artist page {extension}.chorus.vn will officially go live!',
    closeWindow: 'Close window',
    artistNameLabel: 'Artist Name',
    artistNamePlaceholder: 'Your stage name',
    usernameLabel: 'Username',
    usernamePlaceholder: 'admin-username',
    usernameNote: '* Lowercase letters without accents, numbers, and underscores only.',
    extensionLabel: 'Subdomain Extension',
    extensionPlaceholder: 'artist',
    extensionNote: 'Your music vault link will be {extension}.chorus.vn (automatically filled based on artist name)',
    emailLabel: 'Email Address',
    passwordLabel: 'Admin Password',
    passwordPlaceholder: 'Enter password...',
    captchaLabel: 'Security Verification (Captcha)',
    captchaPlaceholder: 'Enter letters...',
    submitting: 'Submitting...',
    submitButton: 'REGISTER MEMBER',
    loading: 'Loading...',
    captchaClickTooltip: 'Click to change code',
    captchaReloadTooltip: 'Reload Captcha'
  },
  ko: {
    registerSuccessApproval: "승인되면 관리 세부 정보는 다음과 같습니다:",
    registerSuccessInfoTitle: "{artistName}의 음악 보관소 정보",
    registerSuccessArtistName: "아티스트 이름",
    registerSuccessUsername: "사용자 이름",
    registerSuccessWebsite: "웹사이트",
    registerSuccessAdmin: "관리자",
    registerSuccessAdminUser: "관리자 사용자",
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
    betaBtn: '이해했습니다, 닫기',
    searchPlaceholder: '아티스트 검색...',
    noArtistsFound: '아티스트를 찾을 수 없습니다',
    noArtistsFoundDesc: '"{query}"와 일치하는 아티스트를 찾을 수 없습니다. 다른 키워드로 다시 시도해 주세요!',
    prevPage: '이전 페이지',
    nextPage: '다음 페이지',
    pageIndicator: '페이지',
    registerTitle: '회원 가입',
    registerSubTitle: 'Become a Chorus Member',
    registerSuccessTitle: '가입 완료!',
    registerSuccessDesc1: '계정 {username}이(g) 성공적으로 등록되었습니다.',
    registerSuccessDesc2: '관리자가 귀하의 계정을 확인해 드립니다. 승인되면 아티스트 페이지 {extension}.chorus.vn이 정식 출시됩니다!',
    closeWindow: '창 닫기',
    artistNameLabel: '아티스트 이름',
    artistNamePlaceholder: '귀하의 예명',
    usernameLabel: '사용자 이름 (ID)',
    usernamePlaceholder: 'admin-username',
    usernameNote: '* 영문 소문자, 숫자, 밑줄(_)만 사용할 수 있습니다.',
    extensionLabel: '서브도메인 확장자',
    extensionPlaceholder: 'artist',
    extensionNote: '귀하의 음악 보관함 링크는 {extension}.chorus.vn이 됩니다 (아티스트 이름에 따라 자동 생성됨)',
    emailLabel: '이메일 주소',
    passwordLabel: '관리자 비밀번호',
    passwordPlaceholder: '비밀번호를 입력하세요...',
    captchaLabel: '보안 문자 (Captcha)',
    captchaPlaceholder: '문자를 입력하세요...',
    submitting: '제출 중...',
    submitButton: '회원 등록',
    loading: '로딩 중...',
    captchaClickTooltip: '클릭하여 다른 코드로 변경',
    captchaReloadTooltip: '보안 문자 새로고침'
  }
};

const FALLBACK_SLIDESHOW = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80"
];

const defaultFaqs: Record<'vi' | 'en' | 'ko', Array<{ q: string; a: string }>> = {
  vi: [
    {
      q: "Tôi có thể tải nhạc/demo lên Chorus.vn bằng cách nào?",
      a: "Để đảm bảo chất lượng hệ thống trong giai đoạn thử nghiệm giới hạn, hiện tại chúng tôi chỉ cấp tài khoản cho các nghệ sĩ tham gia chương trình thử nghiệm nội bộ. Khi tài khoản của bạn được ban quản trị phê duyệt, bạn sẽ có trang cá nhân riêng dưới dạng tennghesi.chorus.vn để tự do đăng tải và quản lý các tác phẩm âm nhạc của mình."
    },
    {
      q: "Quy định về bản quyền và trách nhiệm người đăng tải (uploader) như thế nào?",
      a: "Người đăng tải (uploader) hoàn toàn chịu trách nhiệm trước pháp luật về bản quyền của tất cả tác phẩm âm nhạc, hình ảnh và thông tin đã tải lên hệ thống. Chorus.vn nghiêm cấm mọi hình thức đăng tải thông tin tiêu cực, chống phá, xuyên tạc chính trị hoặc vi phạm thuần phong mỹ tục."
    },
    {
      q: "Làm thế nào để bảo mật các bản thu demo chưa phát hành?",
      a: "Chorus.vn hỗ trợ tính năng thiết lập mật mã bảo vệ riêng biệt cho từng bản ghi demo. Ngoài ra, bạn có thể tạo và gửi đường liên kết chia sẻ trực tiếp (Secret Link) bảo mật cho đối tác, ca sĩ, nhạc sĩ phối khí để họ nghe thử trực tiếp mà không cần nhập mật khẩu."
    },
    {
      q: "Hệ thống có tự động dịch thông tin sang các ngôn ngữ khác không?",
      a: "Có! Hệ thống tích hợp công nghệ AI thông minh (Gemini) tự động dịch toàn bộ thông tin hồ sơ, tiêu đề bài hát, phần mô tả, lời nhạc (lyrics) sang 5 ngôn ngữ phổ biến (Anh, Nhật, Hàn, Trung, Thái). Khán giả quốc tế truy cập từ quốc gia nào sẽ tự động nhìn thấy ngôn ngữ tương ứng."
    }
  ],
  en: [
    {
      q: "How can I upload music/demos to Chorus.vn?",
      a: "To ensure system quality during this limited testing phase, we currently only provision accounts for artists in our internal testing program. Once approved by the administration, you will have your own profile page at yourname.chorus.vn to freely upload and manage your music works."
    },
    {
      q: "What are the rules regarding copyright and uploader responsibility?",
      a: "Uploaders are fully legally responsible for the copyrights of all music works, images, and information uploaded to the system. Chorus.vn strictly prohibits any form of posting negative content, subversive political materials, or anything violating fine customs and traditions."
    },
    {
      q: "How can I secure unreleased demos?",
      a: "Chorus.vn supports password protection settings for each demo recording. Additionally, you can generate and share a secure direct link (Secret Link) for partners, singers, and arrangers to listen directly without entering a password."
    },
    {
      q: "Does the system automatically translate information into other languages?",
      a: "Yes! The system integrates intelligent AI technology (Gemini) to automatically translate all profile information, song titles, descriptions, and lyrics into 5 popular languages (English, Japanese, Korean, Chinese, Thai). International visitors will automatically see their corresponding native language based on their country of origin."
    }
  ],
  ko: [
    {
      q: "Chorus.vn에 음악/데모를 어떻게 업로드할 수 있나요?",
      a: "제한된 테스트 기간 동안 시스템 품질을 보장하기 위해 현재 내부 테스트 프로그램 참여 아티스트에게만 계정을 발급하고 있습니다. 운영진의 승인을 받으면 본인의 개인 페이지(예: tennghesi.chorus.vn)를 가질 수 있으며, 이곳에서 자유롭게 음악 저작물을 업로드하고 관리할 수 있습니다."
    },
    {
      q: "저작권 및 업로더(uploader) 책임에 대한 규정은 어떻게 되나요?",
      a: "업로더(uploader)는 시스템에 올린 모든 음악 작품, 이미지, 정보의 저작권에 대해 법적으로 전적인 책임을 집니다. Chorus.vn은 부정적인 정보, 파괴 행위, 정치적 선동 또는 미풍양속을 해치는 내용의 업로드를 엄격히 금지합니다."
    },
    {
      q: "미발표 데모 레코딩을 어떻게 안전하게 보호하나요?",
      a: "Chorus.vn은 각 데모 레코딩에 대해 개별 비밀번호 보호 설정 기능을 지원합니다. 또한 파트너, 가수, 편곡자 등이 비밀번호 입력 없이 즉시 들을 수 있도록 보안 다이렉트 공유 링크(Secret Link)를 생성하여 전달할 수 있습니다."
    },
    {
      q: "시스템이 자동으로 정보를 다른 언어로 번역해 주나요?",
      a: "네! 시스템에는 인공지능(Gemini) 기술이 탑재되어 아티스트 프로필 정보, 노래 제목, 설명, 가사 등을 5개 주요 언어(영어, 일본어, 한국어, 중국어, 태국어)로 자동 번역합니다. 해외 관객이 접속하면 해당 국가의 언어가 자동으로 노출됩니다."
    }
  ]
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0
  })
};

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
      className="group relative h-[420px] rounded-[2.5rem] overflow-hidden border border-neutral-200/40 shadow-lg hover:shadow-2xl transition-all duration-300 bg-neutral-950 flex flex-col justify-between"
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
      <div className="p-6 relative z-20 flex justify-between items-start w-full">
        {/* Frosted domain badge */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider text-neutral-200 shadow-sm uppercase mt-1">
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
            {artist.avatarUrl || artist.homeCoverUrl ? (
              <img
                src={artist.avatarUrl || artist.homeCoverUrl}
                alt={artist.artistName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ChorusLogo className="w-12 h-12" />
            )}
          </motion.div>
          {/* Active status pulse badge */}
          <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-2 border-neutral-950 rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        </div>
      </div>

      {/* Overlaid Info - text over cover, optimized vertical footprint, elegant typography */}
      <div className="px-6 pb-4 pt-0 relative z-20 w-full flex flex-col justify-end space-y-2.5">
        <div className="space-y-1">
          <p className="text-neutral-200 text-xs line-clamp-1 font-serif italic tracking-wide drop-shadow-sm mb-1">
            {artist.artistBio || `Thiên đường nhạc của`}
          </p>
          <h3 className={`font-black tracking-tight text-white drop-shadow-md min-w-0 pt-0.5 leading-[1.35] min-h-0 ${artist.artistName.length > 15 ? 'text-2xl' : 'text-3xl'}`}>
            {artist.artistName.split(' ').map((word, index, array) => {
              if (index === array.length - 1) {
                return (
                  <span key={index} className="whitespace-nowrap">
                    {word}
                    {artist.verified && (
                      <motion.span 
                        animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                        className="inline-flex items-center align-baseline ml-2 bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-full shadow-sm shrink-0 relative top-[2px]"
                      >
                        <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-450 shrink-0" title="Tài khoản xác thực" />
                      </motion.span>
                    )}
                  </span>
                );
              }
              return word + ' ';
            })}
          </h3>
        </div>

        {/* Count Pill badges & Action Button */}
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-white/15">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold text-neutral-200">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg">
                <Music className="w-3.5 h-3.5 text-neutral-300" />
                <span>{artist.trackCount || 0} {t('totalTracks')}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                <span>{artist.demoCount || 0} Demo</span>
              </div>
            </div>
          </div>

          {/* Solid elegant action button (Bottom Right) */}
          <div className="shrink-0 relative group/btn">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-black py-2.5 px-4 rounded-2xl transition-all duration-300 border border-white/20 shadow-lg active:scale-95 z-10"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-0 pointer-events-none"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 2 }}
                />
                <span className="text-[10px] uppercase tracking-wider relative z-10">{t('accessStore')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover/btn:translate-x-1 transition-transform stroke-[2.5] relative z-10" />
              </a>
            ) : (
              <Link
                to={href}
                className="relative overflow-hidden inline-flex items-center justify-center bg-white text-black hover:bg-black hover:text-white font-black py-2.5 px-4 rounded-2xl transition-all duration-300 border border-white/20 shadow-lg active:scale-95 z-10"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-0 pointer-events-none"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 2 }}
                />
                <span className="text-[10px] uppercase tracking-wider relative z-10">{t('accessStore')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover/btn:translate-x-1 transition-transform stroke-[2.5] relative z-10" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ArtistLandingMobileItem({ artist }: { artist: any; key?: any }) {
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

  const linkProps = isExternal ? { href, target: "_blank", rel: "noopener noreferrer" } : { to: href };
  const LinkComponent = isExternal ? 'a' : Link;

  return (
    <LinkComponent
      {...(linkProps as any)}
      className="flex flex-col items-center gap-2 group w-full"
    >
      <div className="relative w-16 h-16 group-active:scale-95 transition-all duration-300">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-neutral-300 shadow-md">
          <img
            src={artist.homeCoverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80"}
            alt={artist.artistName}
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>
        {artist.verified && (
          <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border border-white z-10 shadow-sm">
            <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold text-neutral-800 text-center line-clamp-2 leading-tight group-hover:text-black transition-colors w-full break-words px-0.5">
        {artist.artistName}
      </span>
    </LinkComponent>
  );
}

const preloadImages = (imageUrls: string[]): Promise<void> => {
  const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));
  if (uniqueUrls.length === 0) return Promise.resolve();

  let loadedCount = 0;
  return new Promise<void>((resolve) => {
    uniqueUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === uniqueUrls.length) {
          resolve();
        }
      };
    });
    // Fallback safety timeout after 4 seconds
    setTimeout(() => resolve(), 4000);
  });
};

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '') // Keep alphanumeric, spaces, hyphens, underscores
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with hyphens
};

const cleanForSearch = (str: string) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
};


const PasswordInput = (props: any) => {
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

export default function ChorusVNLanding() {
  const [artists, setArtists] = useState<LandingArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pageSize = isMobile ? 4 : 3;

  useEffect(() => {
    setCurrentPage(0);
  }, [pageSize]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regArtistName, setRegArtistName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regExtension, setRegExtension] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [extensionTouched, setExtensionTouched] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const registerModalBodyRef = useRef<HTMLDivElement>(null);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/public/captcha');
      const data = await res.json();
      setCaptchaToken(data.token);
      setCaptchaSvg(data.svg);
    } catch (e) {
      console.error("Failed to load captcha:", e);
    }
  };

  useEffect(() => {
    if (showRegisterModal) {
      fetchCaptcha();
      setRegArtistName('');
      setRegUsername('');
      setRegExtension('');
      setRegEmail('');
      setRegPassword('');
      setCaptchaAnswer('');
      setRegError('');
      setRegSuccess('');
    }
  }, [showRegisterModal]);

  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');
  const [lang, setLang] = useState<'vi' | 'en' | 'ko'>(
    (localStorage.getItem('preferredLang') as 'vi' | 'en' | 'ko') || 'vi'
  );

  useEffect(() => {
    const cached = localStorage.getItem('preferredLang');
    if (!cached) {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          const country = data.country_code;
          if (country === 'VN') {
            setLang('vi');
            localStorage.setItem('preferredLang', 'vi');
          } else if (country === 'KR') {
            setLang('ko');
            localStorage.setItem('preferredLang', 'ko');
          } else {
            setLang('en');
            localStorage.setItem('preferredLang', 'en');
          }
        })
        .catch(() => {
          const browserLang = navigator.language || '';
          let defaultL: 'vi' | 'en' | 'ko' = 'en';
          if (browserLang.startsWith('vi')) {
            defaultL = 'vi';
          } else if (browserLang.startsWith('ko')) {
            defaultL = 'ko';
          }
          setLang(defaultL);
          localStorage.setItem('preferredLang', defaultL);
        });
    }
  }, []);

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
    feature4Desc: '',
    statusBadge: '',
    featuresTitle: '',
    featuresSub: ''
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
      .then(async (data) => {
        if (Array.isArray(data)) {
          setArtists(data);
          
          // Preload images
          const urls: string[] = [];
          data.forEach((artist: any) => {
            if (artist.homeCoverUrl) urls.push(artist.homeCoverUrl);
            if (artist.slideshowImages && Array.isArray(artist.slideshowImages)) {
              artist.slideshowImages.forEach((img: string) => {
                if (img) urls.push(img);
              });
            }
          });
          FALLBACK_SLIDESHOW.forEach((img) => urls.push(img));

          await preloadImages(urls);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching public artists:', err);
        setLoading(false);
      });
  }, []);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;
    const cleanQuery = cleanForSearch(searchQuery);
    return artists.filter((artist) => {
      return (
        cleanForSearch(artist.artistName).includes(cleanQuery) ||
        cleanForSearch(artist.username).includes(cleanQuery) ||
        cleanForSearch(artist.extension).includes(cleanQuery)
      );
    });
  }, [artists, searchQuery]);

  const totalPages = Math.ceil(filteredArtists.length / pageSize);

  const getArtistsForPage = (pageIndex: number, list: LandingArtist[]) => {
    if (list.length <= pageSize) return list;
    let start = pageIndex * pageSize;
    if (start + pageSize > list.length) {
      start = list.length - pageSize;
    }
    return list.slice(start, start + pageSize);
  };

  const handlePageChange = async (nextPageIdx: number) => {
    if (nextPageIdx === currentPage || isPreloading) return;
    setIsPreloading(true);
    
    const targetArtists = getArtistsForPage(nextPageIdx, filteredArtists);
    
    // Collect all image URLs to preload
    const urlsToPreload: string[] = [];
    targetArtists.forEach((artist) => {
      if (artist.homeCoverUrl) {
        urlsToPreload.push(artist.homeCoverUrl);
      }
      if (artist.slideshowImages && artist.slideshowImages.length > 0) {
        artist.slideshowImages.forEach((img) => urlsToPreload.push(img));
      } else {
        FALLBACK_SLIDESHOW.forEach((img) => urlsToPreload.push(img));
      }
    });
    
    try {
      await Promise.race([
        preloadImages(urlsToPreload),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);
    } catch (e) {
      console.warn("Preloading error:", e);
    }
    
    setSlideDirection(nextPageIdx > currentPage ? 1 : -1);
    setCurrentPage(nextPageIdx);
    setIsPreloading(false);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (totalPages <= 1 || searchQuery.trim() !== '' || isPreloading) return;
    const interval = setInterval(() => {
      const nextIdx = (currentPage + 1) % totalPages;
      handlePageChange(nextIdx);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentPage, totalPages, searchQuery, isPreloading]);

  // Preload next page's assets in the background 3s before transition (at 5000ms of current page's 8000ms cycle)
  useEffect(() => {
    if (totalPages <= 1 || searchQuery.trim() !== '') return;
    
    const preloadTimer = setTimeout(() => {
      const nextIdx = (currentPage + 1) % totalPages;
      const targetArtists = getArtistsForPage(nextIdx, filteredArtists);
      
      const urlsToPreload: string[] = [];
      targetArtists.forEach((artist) => {
        if (artist.homeCoverUrl) {
          urlsToPreload.push(artist.homeCoverUrl);
        }
        if (artist.slideshowImages && artist.slideshowImages.length > 0) {
          artist.slideshowImages.forEach((img) => urlsToPreload.push(img));
        } else {
          FALLBACK_SLIDESHOW.forEach((img) => urlsToPreload.push(img));
        }
      });
      
      preloadImages(urlsToPreload).catch(err => console.warn("Background preload failed:", err));
    }, 5000); // 3 seconds before the 8-second auto-slide interval
    
    return () => clearTimeout(preloadTimer);
  }, [currentPage, totalPages, searchQuery, filteredArtists]);

  const t = (key: string) => {
    const originalValue = (dict['vi'] as any)[key];
    if (originalValue) {
      const staticTr = (config as any)?.staticTranslations?.[lang]?.[originalValue];
      if (staticTr) return staticTr;
    }
    const tr = (dict[lang] as any)[key] || (dict['vi'] as any)[key] || '';
    return tr;
  };

  const translateHomeText = (text: string | undefined): string => {
    if (!text) return '';
    if (lang === 'vi') return text;
    const staticTr = (config as any)?.staticTranslations?.[lang]?.[text.trim()];
    if (staticTr) return staticTr;
    return text;
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
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#faf9f6] flex flex-col items-center justify-center"
          >
            {/* Subtle dot background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e2dd_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none opacity-80" />
            
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              {/* Pulsating premium vinyl-like outer circle */}
              <div className="relative mb-8">
                <motion.div
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="w-24 h-24 rounded-full border border-neutral-300 flex items-center justify-center relative bg-white shadow-xl"
                >
                  {/* Grooves on vinyl */}
                  <div className="absolute inset-2 rounded-full border border-dashed border-neutral-200" />
                  <div className="absolute inset-4 rounded-full border border-neutral-200" />
                  <div className="absolute inset-6 rounded-full border border-dashed border-neutral-150" />
                  <div className="absolute inset-8 rounded-full border border-neutral-200" />
                  
                  {/* Music icon */}
                  <Music className="w-8 h-8 text-neutral-800" />
                </motion.div>
                
                {/* Ambient glowing pulses */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-4 bg-purple-500/10 rounded-full -z-10 blur-xl"
                />
              </div>

              {/* Letter-spaced Title with smooth glow */}
              <div className="flex items-baseline mb-3 gap-0.5 select-none justify-center">
                <span className="font-sans font-black text-neutral-950 tracking-tight text-2xl leading-none">Chorus</span>
                <span className="font-serif italic font-light text-neutral-400 text-2xl leading-none">.vn</span>
              </div>
              
              <div className="flex items-center gap-2 text-neutral-500 text-xs font-serif italic">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-450 animate-ping" />
                <span>Đang tải trang...</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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
          <Link to="/" className="flex items-center gap-2 group select-none">
            <ChorusLogo className="w-10 h-10 select-none group-hover:scale-105 transition-all duration-300" />
            <div className="flex items-baseline mt-0.5">
              <span className="font-sans font-black text-neutral-950 tracking-tight text-xl leading-none group-hover:text-neutral-700 transition-colors">Chorus</span>
              <span className="font-serif italic font-light text-neutral-400 text-xl leading-none group-hover:text-neutral-500 transition-colors">.vn</span>
            </div>
          </Link>

          {/* Action Header: Status Badge & Language Segmented Toggler */}
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            {config.statusBadge !== '' && (
              <div className="hidden md:flex items-center gap-2 bg-white/60 border border-neutral-200/60 px-4 py-2 rounded-full text-[10px] font-black text-neutral-600 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{translateHomeText(config.statusBadge) || t('statusBadge')}</span>
              </div>
            )}

            {/* Language Selection Segmented Bar */}
            <div className="flex items-center gap-0.5 bg-neutral-200/50 border border-neutral-200/50 p-1 rounded-xl relative">
              {(['vi', 'en', 'ko'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    localStorage.setItem('preferredLang', l);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer relative z-10 ${
                    lang === l
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-200/30'
                  }`}
                >
                  {lang === l && (
                    <motion.span
                      layoutId="activeLangBg"
                      className="absolute inset-0 bg-black rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
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
            {translateHomeText(config.heroSubtitle) || t('heroSubTitle')}
          </p>

          {/* Thin horizontal elegant divider line */}
          <div className="w-16 h-[1px] bg-neutral-300/60 mx-auto my-6" />

          {/* Subtitle Description */}
          <p className="text-neutral-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans font-normal">
            {translateHomeText(config.heroDescription) || t('heroDescription')}
          </p>
        </motion.div>

        {/* Dynamic Email Registration Bar -> Now Custom TẠO KHO NHẠC CÁ NHÂN NGAY. Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <motion.button
            onClick={() => setShowRegisterModal(true)}
            animate={{ 
              boxShadow: ['0px 0px 0px 0px rgba(0,0,0,0.8)', '0px 0px 20px 6px rgba(0,0,0,0.25)', '0px 0px 0px 0px rgba(0,0,0,0.8)'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white font-black text-sm md:text-base py-5 px-10 rounded-full uppercase tracking-wider flex items-center gap-2.5 cursor-pointer relative overflow-hidden group shadow-lg border border-neutral-800"
          >
            {/* Subtle animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">
              {lang === 'vi' ? 'TẠO KHO NHẠC CÁ NHÂN NGAY.' : (lang === 'ko' ? '지금 나만의 음악 보관소 만들기' : 'CREATE PERSONAL MUSIC VAULT NOW')}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </section>

      {/* Main Content & Activated Music Stores Showcase List */}
      <section id="artist-showcase" className="py-12 md:py-24 px-6 sm:px-10 max-w-7xl mx-auto border-t border-neutral-200/40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>{t('statusBadge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 font-sans">
              {t('artistsTitle')}
            </h2>
            {t('artistsSub') && (
              <p className="text-neutral-500 text-sm max-w-xl font-medium leading-relaxed">
                {t('artistsSub')}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
            {/* Search Input Box */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Tìm kiếm nghệ sĩ...'}
                className="w-full bg-white border border-neutral-200/85 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400/20 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dynamic Count Badge */}
            <div className="flex items-center gap-2 bg-white border border-neutral-200/60 rounded-2xl px-5 py-3 text-[10px] font-black text-neutral-500 uppercase tracking-widest shadow-sm w-full sm:w-auto justify-center shrink-0">
              {t('artistCount')}: <span className="text-neutral-900 font-extrabold">{filteredArtists.length} {t('artistUnit')}</span>
            </div>
          </div>
        </div>

        {artists.length === 0 ? (
          <div className="bg-white/60 border border-dashed border-neutral-200 rounded-[3rem] p-16 text-center max-w-md mx-auto">
            <Disc3 className="w-14 h-14 text-neutral-300 mx-auto mb-4 animate-spin" style={{ animationDuration: '8s' }} />
            <h3 className="text-lg font-black text-neutral-800">{t('noArtists')}</h3>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
              {t('noArtistsDesc')}
            </p>
          </div>
        ) : (
          <div>
            {filteredArtists.length === 0 ? (
              <div className="bg-white/60 border border-dashed border-neutral-200 rounded-[3rem] p-16 text-center max-w-md mx-auto">
                <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-neutral-800">{t('noArtistsFound')}</h3>
                <p className="text-neutral-500 text-xs mt-2 leading-relaxed">
                  {(t('noArtistsFoundDesc') || '').replace('{query}', searchQuery)}
                </p>
              </div>
            ) : (
              <div>
                <div className={isMobile ? "relative overflow-hidden" : "relative min-h-[500px] overflow-hidden"}>
                  {isPreloading && (
                    <div className="absolute inset-0 bg-[#faf9f6]/30 backdrop-blur-[2px] flex items-center justify-center z-30 transition-all duration-300 rounded-[2.5rem]">
                      <div className="flex items-center gap-3 bg-white/90 px-5 py-3 rounded-2xl border border-neutral-200/50 shadow-md">
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span className="text-[10px] font-black tracking-widest text-neutral-500 uppercase">
                          {lang === 'vi' ? 'Đang chuẩn bị...' : 'LOADING...'}
                        </span>
                      </div>
                    </div>
                  )}
                  <AnimatePresence mode="popLayout" custom={slideDirection}>
                    <motion.div
                      key={currentPage}
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ 
                        x: { type: "spring", stiffness: 150, damping: 22 },
                        opacity: { duration: 0.4 }
                      }}
                      className={isMobile ? "grid grid-cols-4 gap-3 w-full max-w-sm mx-auto px-1 justify-items-center" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}
                    >
                      {getArtistsForPage(currentPage, filteredArtists).map((artist) => (
                        isMobile ? (
                          <ArtistLandingMobileItem key={artist.extension} artist={artist} />
                        ) : (
                          <ArtistLandingCard key={artist.extension} artist={artist} t={t} />
                        )
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-6 md:mt-16 bg-white/60 border border-neutral-200/50 py-2.5 px-4 md:py-3.5 md:px-6 rounded-3xl w-fit mx-auto shadow-sm backdrop-blur-sm relative z-20">
                    <button
                      type="button"
                      onClick={() => handlePageChange((currentPage - 1 + totalPages) % totalPages)}
                      className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-black transition-all cursor-pointer"
                      title={t('prevPage')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePageChange(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentPage === idx
                              ? 'w-6 bg-black'
                              : 'w-2.5 bg-neutral-300 hover:bg-neutral-450'
                          }`}
                          title={`${t('pageIndicator')} ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePageChange((currentPage + 1) % totalPages)}
                      className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-black transition-all cursor-pointer"
                      title={t('nextPage')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Features Showcase Grid */}
      <section className="py-12 md:py-24 bg-white/40 border-t border-b border-neutral-200/40 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 font-sans">
              {translateHomeText(config.featuresTitle) || t('featuresTitle')}
            </h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              {translateHomeText(config.featuresSub) || t('featuresSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{translateHomeText(config.feature1Title) || t('feature1Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {translateHomeText(config.feature1Desc) || t('feature1Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{translateHomeText(config.feature2Title) || t('feature2Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {translateHomeText(config.feature2Desc) || t('feature2Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{translateHomeText(config.feature3Title) || t('feature3Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {translateHomeText(config.feature3Desc) || t('feature3Desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-8 bg-white border border-neutral-200/60 rounded-[2rem] hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                <Disc3 className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-neutral-900">{translateHomeText(config.feature4Title) || t('feature4Title')}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {translateHomeText(config.feature4Desc) || t('feature4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-24 relative bg-neutral-50/50 border-b border-neutral-200/40">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 font-sans">
              {lang === 'vi' ? 'Câu hỏi thường gặp (FAQ)' : lang === 'ko' ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="text-neutral-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
              {lang === 'vi' 
                ? 'Giải đáp những thắc mắc phổ biến về quy trình đăng tải, bảo mật và quyền sở hữu tác phẩm.' 
                : lang === 'ko' 
                ? '업로드 절차, 보안 및 저작권에 대한 자주 묻는 질문을 확인하세요.' 
                : 'Answers to common questions about uploading, security, and content ownership.'}
            </p>
          </div>

          <div className="space-y-4">
            {(config as any).faq && (config as any).faq.length > 0 ? (config as any).faq.map((faq: any, idx: number) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-neutral-200/60 rounded-2xl md:rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:border-neutral-300 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-extrabold text-neutral-900 hover:text-black focus:outline-none transition-colors cursor-pointer select-none"
                  >
                    <span className="text-sm md:text-base leading-snug">{faq.q}</span>
                    <span className={`text-neutral-400 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-45 text-neutral-900' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 text-neutral-550 text-xs sm:text-sm leading-relaxed border-t border-neutral-100 pt-4 bg-neutral-50/40 whitespace-pre-wrap">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }) : (defaultFaqs[lang as 'vi' | 'en' | 'ko'] || defaultFaqs['vi']).map((faq: any, idx: number) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-neutral-200/60 rounded-2xl md:rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:border-neutral-300 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-extrabold text-neutral-900 hover:text-black focus:outline-none transition-colors cursor-pointer select-none"
                  >
                    <span className="text-sm md:text-base leading-snug">{faq.q}</span>
                    <span className={`text-neutral-400 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-45 text-neutral-900' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 text-neutral-500 text-xs sm:text-sm leading-relaxed border-t border-neutral-100 pt-4 bg-neutral-50/40 whitespace-pre-wrap">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200/40 py-16 px-6 sm:px-10 text-center text-xs">
        <div className="max-w-7xl mx-auto">
          <p className="font-extrabold text-neutral-800 text-sm tracking-wide">
            {translateHomeText(config.footerText) || t('footer')}
          </p>
        </div>
      </footer>
    </motion.div>
  )}

      {/* Interactive Beta Registration Modal */}
      <AnimatePresence>
        {showBetaModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBetaModal(false)}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center z-10 my-auto"
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

      {/* Member Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!regSubmitting) setShowRegisterModal(false); }}
              className="fixed inset-0 bg-neutral-950/45 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              ref={registerModalBodyRef}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-[2rem] p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10 custom-scrollbar text-left my-auto"
            >
              {/* Close Button */}
              <button
                disabled={regSubmitting}
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-black bg-neutral-100 hover:bg-neutral-200/60 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4 relative z-10">
                <div className="space-y-0.5 pr-12">
                  <h3 className="text-lg md:text-xl font-black text-neutral-900">{t('registerTitle')}</h3>
                  <p className="text-neutral-400 font-mono text-[9px] font-black uppercase tracking-wider">
                    {t('registerSubTitle')}
                  </p>
                </div>

                {regSuccess ? (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                                        <div className="space-y-4 text-left bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                      <h4 className="text-base font-bold text-neutral-900 text-center mb-2">{t('registerSuccessTitle')}</h4>
                      <p className="text-neutral-600 text-sm leading-relaxed text-center mb-4">
                        {t('registerSuccessApproval')}
                      </p>
                      
                      <div className="space-y-2 text-sm text-neutral-700 bg-white p-4 rounded-xl border border-neutral-200 text-left">
                        <p className="font-bold text-emerald-700 text-center border-b border-neutral-100 pb-2 mb-3">
                          {t('registerSuccessInfoTitle').replace('{artistName}', regArtistName)}
                        </p>
                        <p><span className="font-medium">{t('registerSuccessArtistName')}:</span> {regArtistName}</p>
                        <p><span className="font-medium">{t('registerSuccessUsername')}:</span> {regUsername}</p>
                        <p><span className="font-medium">{t('registerSuccessWebsite')}:</span> <span className="font-mono text-emerald-600">{regExtension}.chorus.vn</span></p>
                        <p><span className="font-medium">{t('registerSuccessAdmin')}:</span> <span className="font-mono text-blue-600">{regExtension}.chorus.vn/admin</span></p>
                        <p><span className="font-medium">{t('registerSuccessAdminUser')}:</span> {regUsername}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRegisterModal(false)}
                      className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                    >
                      {t('closeWindow')}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setRegError('');
                      setRegSubmitting(true);
                      // Scroll to top immediately to show submitting state / keep focus on feedback area
                      registerModalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      
                      try {
                        console.log('[Registration] Sending register payload:', {
                          artistName: regArtistName,
                          username: regUsername,
                          extension: regExtension,
                          email: regEmail
                        });

                        const res = await fetch('/api/public/register', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            artistName: regArtistName,
                            username: regUsername,
                            extension: regExtension,
                            email: regEmail,
                            password: regPassword,
                            captchaAnswer,
                            captchaToken
                          })
                        });
                        const data = await res.json();
                        console.log('[Registration] Received response:', data);

                        if (res.ok) {
                          setRegSuccess(data.message || 'Đăng ký thành công!');
                          console.log('%c[Registration Success] Approve this user in /acp control panel', 'color: green; font-weight: bold;');
                        } else {
                          setRegError(data.error || 'Có lỗi xảy ra, vui lòng thử lại!');
                          fetchCaptcha(); // reload captcha on error
                        }
                      } catch (err) {
                        console.error('[Registration] Network error:', err);
                        setRegError('Lỗi kết nối máy chủ!');
                        fetchCaptcha();
                      } finally {
                        setRegSubmitting(false);
                        // Ensure it stays at top to display success or error
                        setTimeout(() => {
                          registerModalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 50);
                      }
                    }}
                    className="space-y-4"
                  >
                    {regError && (
                      <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-semibold">
                        {regError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                        {t('artistNameLabel')}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={regSubmitting}
                        value={regArtistName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegArtistName(val);
                          const slug = removeAccents(val);
                          if (!usernameTouched) {
                            setRegUsername(slug.replace(/[^a-z0-9_]/g, ''));
                          }
                          if (!extensionTouched) {
                            setRegExtension(slug.replace(/[^a-z0-9_-]/g, ''));
                          }
                        }}
                        placeholder={t('artistNamePlaceholder')}
                        className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                          {t('usernameLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={regSubmitting}
                          value={regUsername}
                          onChange={(e) => {
                            setUsernameTouched(true);
                            setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          }}
                          placeholder={regArtistName ? removeAccents(regArtistName).replace(/[^a-z0-9_]/g, '') : t('usernamePlaceholder')}
                          className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                        />
                        <span className="text-[9px] text-neutral-400 block mt-0.5 leading-tight">
                          {t('usernameNote')}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                          {t('extensionLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={regSubmitting}
                          value={regExtension}
                          onChange={(e) => {
                            setExtensionTouched(true);
                            setRegExtension(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                          }}
                          placeholder={regArtistName ? removeAccents(regArtistName).replace(/[^a-z0-9_-]/g, '') : t('extensionPlaceholder')}
                          className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                        />
                        <span className="text-[9px] text-neutral-400 block mt-0.5 leading-tight">
                          {t('extensionNote').replace('{extension}', regExtension || 'xxx')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                        {t('emailLabel')}
                      </label>
                      <input
                        type="email"
                        required
                        disabled={regSubmitting}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="artist@gmail.com"
                        className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                        {t('passwordLabel')}
                      </label>
                                            <PasswordInput
                        required
                        disabled={regSubmitting}
                        value={regPassword}
                        onChange={(e: any) => setRegPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 pr-12 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                      />
                    </div>

                    {/* Captcha Block */}
                    <div className="space-y-1.5 bg-neutral-50 border border-neutral-200/60 p-4 rounded-2xl">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                        {t('captchaLabel')}
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-xl overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900 select-none cursor-pointer flex items-center justify-center text-[10px] text-neutral-400 font-mono"
                          style={{ width: '130px', height: '45px' }}
                          onClick={fetchCaptcha}
                          title={t('captchaClickTooltip')}
                        >
                          {captchaSvg ? (
                            <div dangerouslySetInnerHTML={{ __html: captchaSvg }} className="w-full h-full" />
                          ) : (
                            <span className="animate-pulse">{t('loading')}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={fetchCaptcha}
                          disabled={regSubmitting}
                          className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                          title={t('captchaReloadTooltip')}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          required
                          disabled={regSubmitting}
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder={t('captchaPlaceholder')}
                          className="w-full bg-white border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-850 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-neutral-400 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {regError && (
                      <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-semibold animate-pulse">
                        {regError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-4 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {regSubmitting ? t('submitting') : t('submitButton')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
