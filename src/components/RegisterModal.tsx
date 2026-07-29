import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const PasswordInput = (props: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center">
      <input
        {...props}
        type={show ? 'text' : 'password'}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-3 text-[11px] font-bold text-neutral-400 hover:text-neutral-700 px-1.5 py-1 rounded cursor-pointer select-none"
      >
        {show ? 'ẨN' : 'HIỆN'}
      </button>
    </div>
  );
};

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoogleEmail?: string;
  initialGoogleName?: string;
  initialIsGoogleVerified?: boolean;
  onSuccess?: (data: any) => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  initialGoogleEmail = '',
  initialGoogleName = '',
  initialIsGoogleVerified = false,
  onSuccess
}: RegisterModalProps) {
  const [regArtistName, setRegArtistName] = useState(initialGoogleName || '');
  const [regUsername, setRegUsername] = useState('');
  const [regExtension, setRegExtension] = useState('');
  const [regEmail, setRegEmail] = useState(initialGoogleEmail || '');
  const [regPassword, setRegPassword] = useState('');
  const [isGoogleEmailVerified, setIsGoogleEmailVerified] = useState(initialIsGoogleVerified);

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [extensionTouched, setExtensionTouched] = useState(false);

  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Initialize values when initial props change or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialGoogleEmail) {
        setRegEmail(initialGoogleEmail);
        setIsGoogleEmailVerified(true);
      } else {
        setIsGoogleEmailVerified(initialIsGoogleVerified);
      }
      if (initialGoogleName) {
        setRegArtistName(initialGoogleName);
        const slug = removeAccents(initialGoogleName);
        setRegUsername(slug.replace(/[^a-z0-9_]/g, ''));
        setRegExtension(slug.replace(/[^a-z0-9_-]/g, ''));
      }
      fetchCaptcha();
    }
  }, [isOpen, initialGoogleEmail, initialGoogleName, initialIsGoogleVerified]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/public/captcha');
      const data = await res.json();
      if (data.token && data.svg) {
        setCaptchaToken(data.token);
        setCaptchaSvg(data.svg);
        setCaptchaAnswer('');
      }
    } catch (e) {
      console.error('Error fetching captcha:', e);
    }
  };

  const handleGoogleSyncForRegister = () => {
    const googleClientId = "578858946574-opa9vfj5t2tmb9sr5jregbur9qa4tdac.apps.googleusercontent.com";
    setRegError('');
    if ((window as any).google?.accounts?.id) {
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
                  if (data.token) {
                    localStorage.setItem('memberToken', data.token);
                  }
                  if (data.user) {
                    localStorage.setItem('googleUser', JSON.stringify(data.user));
                  }

                  if (data.isArtist && data.adminToken && data.artistExtension) {
                    localStorage.setItem('adminToken', data.adminToken);
                    localStorage.setItem('activeAdminExtension', data.artistExtension);
                    localStorage.setItem('activeAdminName', data.artistName || data.artistExtension);
                    window.location.href = `/${data.artistExtension}`;
                    return;
                  }

                  if (data.user && data.user.email) {
                    setRegEmail(data.user.email);
                    setIsGoogleEmailVerified(true);
                    if (data.user.name) {
                      const gName = data.user.name;
                      setRegArtistName(gName);
                      const slug = removeAccents(gName);
                      setRegUsername(slug.replace(/[^a-z0-9_]/g, ''));
                      setRegExtension(slug.replace(/[^a-z0-9_-]/g, ''));
                    }
                  }
                } else {
                  const errData = await res.json();
                  setRegError(errData.error || 'Lỗi xác thực với Google.');
                }
              } catch (e: any) {
                setRegError('Không thể đồng bộ dữ liệu từ Google.');
              }
            }
          }
        });
        (window as any).google.accounts.id.prompt();
      } catch (e: any) {
        setRegError(e?.message || 'Lỗi kết nối Google');
      }
    } else {
      setRegError('Đang nạp thư viện Google, vui lòng thử lại sau vài giây!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSubmitting(true);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    try {
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
          captchaToken,
          isGoogleEmailVerified: isGoogleEmailVerified === true
        })
      });
      const data = await res.json();

      if (res.ok) {
        try {
          localStorage.setItem('pendingRegistrationInfo', JSON.stringify({
            artistName: regArtistName,
            username: regUsername,
            extension: regExtension,
            email: regEmail,
            emailVerified: data.emailVerified === true || isGoogleEmailVerified === true
          }));
        } catch (e) {}

        if (data.token && data.extension) {
          const avatar = data.artist?.aboutMe?.avatarUrl || data.artist?.homeCoverUrl || '';
          if ((window as any).syncLoginSession) {
            (window as any).syncLoginSession(
              data.token,
              data.extension,
              data.artist?.artistName || data.artist?.username || data.extension,
              avatar,
              false
            );
          } else {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('activeAdminExtension', data.extension);
            localStorage.setItem('activeAdminName', data.artist?.artistName || data.artist?.username || data.extension);
            localStorage.setItem('activeAdminAvatar', avatar);
            localStorage.setItem('activeAdminActivated', 'false');
          }
          window.dispatchEvent(new Event('admin-session-change'));
        }

        if (data.requiresVerification && !isGoogleEmailVerified) {
          setShowOtpStep(true);
          setOtpEmail(data.email || regEmail);
          setOtpDigits(['', '', '', '', '', '']);
          setOtpError('');
          setOtpSuccess('');
          setResendTimer(60);
        } else {
          setRegSuccess(data.message || 'Đăng ký tài khoản nghệ sĩ thành công!');
          if (onSuccess) onSuccess(data);
        }
      } else {
        setRegError(data.error || 'Có lỗi xảy ra, vui lòng thử lại!');
        fetchCaptcha();
      }
    } catch (err) {
      setRegError('Lỗi kết nối máy chủ!');
      fetchCaptcha();
    } finally {
      setRegSubmitting(false);
      setTimeout(() => {
        modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { if (!regSubmitting) onClose(); }}
          className="fixed inset-0 bg-neutral-950/45 backdrop-blur-sm"
        />

        <motion.div
          ref={modalBodyRef}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-[2rem] p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10 custom-scrollbar text-left my-auto"
        >
          <button
            disabled={regSubmitting}
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-black bg-neutral-100 hover:bg-neutral-200/60 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4 relative z-10">
            <div className="space-y-0.5 pr-12">
              <h3 className="text-lg md:text-xl font-black text-neutral-900">Đăng Ký Thành Viên</h3>
              <p className="text-neutral-400 font-mono text-[9px] font-black uppercase tracking-wider">
                Chorus Artist Registration
              </p>
            </div>

            {showOtpStep ? (
              <div className="space-y-5 text-center py-2">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
                    ✉️
                  </div>
                  <h4 className="text-xl font-black text-neutral-900 text-center">Xác Thực Email Tài Khoản</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed text-center">
                    Hệ thống đã gửi <b>mã OTP 6 số</b> và <b>link kích hoạt</b> tới email:<br/>
                    <span className="font-bold text-amber-600 text-sm break-all">{otpEmail || regEmail}</span>
                  </p>
                </div>

                {otpError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-xs font-semibold text-center">
                    {otpError}
                  </div>
                )}

                {otpSuccess ? (
                  <div className="space-y-4 text-center py-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold text-center space-y-2">
                      <div>✓ {otpSuccess}</div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                    >
                      Hoàn Tất & Khám Phá
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block text-center mb-2">
                        Nhập 6 chữ số OTP từ email của bạn
                      </label>
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5 mx-auto w-full text-center">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={`modal-otp-${idx}`}
                            id={`modal-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newDigits = [...otpDigits];
                              newDigits[idx] = val;
                              setOtpDigits(newDigits);
                              if (val && idx < 5) {
                                const nextInput = document.getElementById(`modal-otp-${idx + 1}`);
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                                const prevInput = document.getElementById(`modal-otp-${idx - 1}`);
                                if (prevInput) prevInput.focus();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasteData = e.clipboardData.getData('text').trim();
                              if (/^\d{6}$/.test(pasteData)) {
                                setOtpDigits(pasteData.split(''));
                                const lastInput = document.getElementById('modal-otp-5');
                                if (lastInput) lastInput.focus();
                              }
                            }}
                            className="w-10 h-12 text-center text-xl font-black bg-neutral-100 text-neutral-900 border-2 border-neutral-300 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-none transition-all shadow-inner"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={otpSubmitting || otpDigits.join('').length !== 6}
                      onClick={async () => {
                        setOtpError('');
                        setOtpSubmitting(true);
                        try {
                          const res = await fetch('/api/public/verify-otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email: otpEmail || regEmail,
                              otpCode: otpDigits.join('')
                            })
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            const aName = data.artistName || regArtistName || 'mới';
                            setOtpSuccess(`Kích hoạt tài khoản nghệ sĩ ${aName} thành công!`);
                            try {
                              const existingInfo = localStorage.getItem('pendingRegistrationInfo');
                              const parsed = existingInfo ? JSON.parse(existingInfo) : {};
                              parsed.emailVerified = true;
                              localStorage.setItem('pendingRegistrationInfo', JSON.stringify(parsed));
                            } catch (e) {}
                          } else {
                            setOtpError(data.error || 'Mã OTP không chính xác!');
                          }
                        } catch (e) {
                          setOtpError('Lỗi kết nối máy chủ!');
                        } finally {
                          setOtpSubmitting(false);
                        }
                      }}
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {otpSubmitting ? 'Đang xác thực...' : 'Xác Nhận Kích Hoạt OTP'}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 mt-2">
                      <button
                        type="button"
                        disabled={resendTimer > 0}
                        onClick={async () => {
                          setResendTimer(60);
                          setOtpError('');
                          try {
                            const res = await fetch('/api/public/resend-verification', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: otpEmail || regEmail })
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              setOtpError(data.error || 'Lỗi gửi lại mã!');
                            }
                          } catch (e) {
                            setOtpError('Lỗi kết nối máy chủ!');
                          }
                        }}
                        className="text-amber-600 hover:text-amber-700 font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {resendTimer > 0 ? `Gửi lại mã OTP (${resendTimer}s)` : 'Gửi lại mã OTP mới'}
                      </button>
                      <span className="text-neutral-400 text-[11px]">
                        Hoặc bấm link kích hoạt trong Email
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : regSuccess ? (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-4 text-center bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                  <h4 className="text-xl font-black text-neutral-900 text-center">Đăng ký thành công.</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed text-center">
                    Trong thời gian chờ quản trị viên kích hoạt tài khoản, bạn có thể khám phá các tính năng của Chorus.vn nhé.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  Khám Phá Ngay
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {regError && (
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-semibold">
                    {regError}
                  </div>
                )}

                {!isGoogleEmailVerified && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={handleGoogleSyncForRegister}
                      className="w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 hover:border-neutral-400"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Đăng ký nhanh bằng Gmail</span>
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                    Nghệ Danh
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
                    placeholder="Tên nghệ danh của bạn"
                    className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                      Username Đăng Nhập
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
                      placeholder="admin-username"
                      className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                      Phần Mở Rộng
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
                      placeholder="artist"
                      className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                      Email Đăng Ký
                    </label>
                    {isGoogleEmailVerified && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        ✓ Đã Đồng Bộ Google
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    {isGoogleEmailVerified && (
                      <div className="absolute left-3.5 flex items-center pointer-events-none z-10">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="email"
                      required
                      disabled={regSubmitting}
                      readOnly={isGoogleEmailVerified}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="artist@gmail.com"
                      className={`w-full border rounded-xl py-3 text-xs font-medium focus:outline-none transition-all font-sans ${
                        isGoogleEmailVerified
                          ? 'pl-10 pr-4 bg-emerald-50/70 border-emerald-300 text-emerald-950 font-black cursor-not-allowed'
                          : 'px-4 bg-neutral-50 border-neutral-200/80 text-neutral-800 focus:border-neutral-400 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                    Mật Khẩu Quản Trị
                  </label>
                  <PasswordInput
                    required
                    disabled={regSubmitting}
                    value={regPassword}
                    onChange={(e: any) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-3 pr-12 text-neutral-800 text-xs font-medium focus:outline-none focus:border-neutral-400 focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Captcha Block */}
                <div className="space-y-1.5 bg-neutral-50 border border-neutral-200/60 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                    Mã Bảo Mật (Captcha)
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl overflow-hidden border border-neutral-200 shrink-0 bg-neutral-900 select-none cursor-pointer flex items-center justify-center text-[10px] text-neutral-400 font-mono"
                      style={{ width: '130px', height: '45px' }}
                      onClick={fetchCaptcha}
                      title="Nhấp để tải mã captcha mới"
                    >
                      {captchaSvg ? (
                        <div dangerouslySetInnerHTML={{ __html: captchaSvg }} className="w-full h-full" />
                      ) : (
                        <span className="animate-pulse">Đang tải...</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      disabled={regSubmitting}
                      className="p-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      title="Tải lại captcha"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      required
                      disabled={regSubmitting}
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Nhập mã..."
                      className="w-full bg-white border border-neutral-200/80 rounded-xl px-4 py-3 text-neutral-850 text-xs font-black tracking-widest uppercase focus:outline-none focus:border-neutral-400 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold py-4 px-6 rounded-xl text-xs transition-all cursor-pointer shadow-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {regSubmitting ? 'Đang Đăng Ký...' : 'Đăng Ký Kho Nhạc Mới'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
