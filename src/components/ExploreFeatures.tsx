import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface ExploreDevice {
  type: 'iphone' | 'ipad' | 'macbook';
  imageUrl: string;
}

interface ExploreFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
  descriptionExtra?: string;
  deviceType?: 'iphone' | 'ipad' | 'macbook';
  imageUrl?: string;
  devices?: ExploreDevice[];
  layout: 'left' | 'right' | 'center';
  order: number;
}

// ─── Starfield Canvas Background ────────────────────────────────────
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; r: number; opacity: number; speed: number; twinkleSpeed: number; twinklePhase: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    // Create stars
    const starCount = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.4 + 0.6;
        const alpha = star.opacity * twinkle;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
        gradient.addColorStop(0, `rgba(200, 210, 255, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(150, 170, 255, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(100, 130, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 235, 255, ${alpha})`;
        ctx.fill();
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { resize(); };
    window.addEventListener('resize', handleResize);

    // Observe body height changes
    const resizeObserver = new ResizeObserver(() => { resize(); });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ─── Shooting Star ──────────────────────────────────────────────────
function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<{ id: number; top: number; left: number; angle: number; delay: number }[]>([]);
  
  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      setShootingStars(prev => [
        ...prev.slice(-3),
        {
          id: counter,
          top: Math.random() * 40,
          left: Math.random() * 80 + 10,
          angle: Math.random() * 30 + 15,
          delay: 0,
        }
      ]);
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {shootingStars.map(s => (
        <div
          key={s.id}
          className="absolute shooting-star-line"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            transform: `rotate(${s.angle}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Device Mockup Components ──────────────────────────────────────

import mockupIphone from '../assets/mockups/fr-iphone.webp';
import mockupIpad from '../assets/mockups/fr-ipad.webp';
import mockupMacbook from '../assets/mockups/fr-macbook.webp';

function IPhoneMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto filter drop-shadow-2xl flex items-center justify-center">
      <div className="absolute z-0 overflow-hidden bg-neutral-900" style={{ top: '8.5%', left: '6.9%', width: '86.2%', height: '88.5%', borderRadius: '32px' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <span className="text-white/20 text-sm">No Image</span>
          </div>
        )}
      </div>
      <img src={mockupIphone} alt="iPhone Frame" className="relative z-10 w-full h-auto pointer-events-none" />
    </div>
  );
}

function IPadMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative w-full max-w-[480px] mx-auto filter drop-shadow-2xl flex items-center justify-center">
      <div className="absolute z-0 overflow-hidden bg-neutral-900" style={{ top: '5.1%', left: '3.5%', width: '93%', height: '90%', borderRadius: '12px' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <span className="text-white/20 text-sm">No Image</span>
          </div>
        )}
      </div>
      <img src={mockupIpad} alt="iPad Frame" className="relative z-10 w-full h-auto pointer-events-none" />
    </div>
  );
}

function MacbookMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative w-full max-w-[640px] mx-auto filter drop-shadow-2xl flex flex-col items-center justify-center">
      <div className="absolute z-0 overflow-hidden bg-neutral-900" style={{ top: '14%', left: '11.5%', width: '77%', height: '75%', borderRadius: '4px' }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
            <span className="text-white/20 text-sm">No Image</span>
          </div>
        )}
      </div>
      <img src={mockupMacbook} alt="Macbook Frame" className="relative z-10 w-full h-auto pointer-events-none" />
    </div>
  );
}

function DeviceMockup({ type, imageUrl }: { type: 'iphone' | 'ipad' | 'macbook'; imageUrl: string }) {
  switch (type) {
    case 'iphone': return <IPhoneMockup imageUrl={imageUrl} />;
    case 'ipad': return <IPadMockup imageUrl={imageUrl} />;
    case 'macbook': return <MacbookMockup imageUrl={imageUrl} />;
    default: return <IPhoneMockup imageUrl={imageUrl} />;
  }
}

function DeviceComposition({ devices }: { devices: ExploreDevice[] }) {
  if (!devices || devices.length === 0) return null;

  if (devices.length === 1) {
    return (
      <div className="explore-float-1">
        <DeviceMockup type={devices[0].type} imageUrl={devices[0].imageUrl} />
      </div>
    );
  }

  if (devices.length === 2) {
    return (
      <div className="relative w-full max-w-[800px] mx-auto h-[350px] sm:h-[450px] md:h-[550px]">
        <div className="absolute w-[80%] left-[5%] top-[5%] explore-float-1">
          <DeviceMockup type={devices[0].type} imageUrl={devices[0].imageUrl} />
        </div>
        <div className="absolute w-[35%] right-[5%] bottom-[10%] explore-float-2 z-20">
          <DeviceMockup type={devices[1].type} imageUrl={devices[1].imageUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[900px] mx-auto h-[400px] sm:h-[500px] md:h-[650px]">
      <div className="absolute w-[70%] left-[15%] top-[5%] explore-float-1 z-10">
        <DeviceMockup type={devices[0].type} imageUrl={devices[0].imageUrl} />
      </div>
      <div className="absolute w-[50%] left-[0%] bottom-[15%] explore-float-2 z-20">
        <DeviceMockup type={devices[1].type} imageUrl={devices[1].imageUrl} />
      </div>
      <div className="absolute w-[25%] right-[5%] bottom-[5%] explore-float-3 z-30">
        <DeviceMockup type={devices[2].type} imageUrl={devices[2].imageUrl} />
      </div>
    </div>
  );
}

// ─── Scroll Reveal Hook ─────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// ─── Feature Section Component ──────────────────────────────────────
function FeatureSection({ feature, index }: { feature: ExploreFeature; index: number }) {
  const { ref, isVisible } = useScrollReveal();
  const isReversed = feature.layout === 'right' || (feature.layout !== 'center' && index % 2 === 1);
  const isCentered = feature.layout === 'center';

  const devices = feature.devices && feature.devices.length > 0
    ? feature.devices
    : (feature.imageUrl ? [{ type: feature.deviceType || 'iphone', imageUrl: feature.imageUrl }] : []);

  if (isCentered) {
    return (
      <div
        ref={ref}
        className={`explore-section explore-section-center ${isVisible ? 'explore-visible' : ''}`}
      >
        {/* Badge */}
        {feature.badge && (
          <div className="explore-badge">
            <span>{feature.badge}</span>
          </div>
        )}
        {/* Title */}
        <h2 className="explore-title text-center" style={{ whiteSpace: 'pre-line' }}>
          {feature.title}
        </h2>
        {/* Description */}
        {feature.description && (
          <p className="explore-desc text-center max-w-3xl mx-auto">
            {feature.description}
          </p>
        )}
        {feature.descriptionExtra && (
          <p className="explore-desc-extra text-center max-w-3xl mx-auto">
            {feature.descriptionExtra}
          </p>
        )}
        {/* Device */}
        {devices.length > 0 && (
          <div className="explore-device-center mt-10">
            <DeviceComposition devices={devices} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`explore-section ${isReversed ? 'explore-section-reversed' : ''} ${isVisible ? 'explore-visible' : ''}`}
    >
      {/* Text side */}
      <div className={`explore-text ${isReversed ? 'explore-text-right' : 'explore-text-left'}`}>
        {/* Badge */}
        {feature.badge && (
          <div className="explore-badge">
            <span>{feature.badge}</span>
          </div>
        )}
        {/* Title */}
        <h2 className="explore-title" style={{ whiteSpace: 'pre-line' }}>
          {feature.title}
        </h2>
        {/* Description */}
        {feature.description && (
          <p className="explore-desc">
            {feature.description}
          </p>
        )}
        {feature.descriptionExtra && (
          <p className="explore-desc-extra">
            {feature.descriptionExtra}
          </p>
        )}
      </div>

      {/* Device side */}
      <div className={`explore-device ${isReversed ? 'explore-device-left' : 'explore-device-right'}`}>
        <DeviceComposition devices={devices} />
      </div>
    </div>
  );
}

// ─── Main Explore Features Page ─────────────────────────────────────
export default function ExploreFeatures() {
  const [features, setFeatures] = useState<ExploreFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/public/explore-features')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatures(data.sort((a: ExploreFeature, b: ExploreFeature) => a.order - b.order));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById('explore-features-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="explore-page">
      {/* Background */}
      <div className="explore-bg" />
      <StarfieldCanvas />
      <ShootingStars />

      {/* Floating nebula blurs */}
      <div className="explore-nebula explore-nebula-1" />
      <div className="explore-nebula explore-nebula-2" />
      <div className="explore-nebula explore-nebula-3" />

      {/* Header */}
      <header className="explore-header">
        <Link to="/" className="explore-back-btn">
          <ArrowLeft className="w-4 h-4" />
          <span>Trang chủ</span>
        </Link>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="explore-hero">
        <div className="explore-hero-badge">✦ CHORUS.VN</div>
        <h1 className="explore-hero-title">
          Khám Phá<br />
          <span className="explore-hero-gradient">Chorus.</span>
        </h1>
        <p className="explore-hero-sub">
          Nền tảng phân phối, lưu trữ và chia sẻ âm nhạc nội bộ.<br />
          Được thiết kế cho nghệ sĩ và nhà sản xuất âm nhạc Việt Nam.
        </p>
        {features.length > 0 && (
          <button onClick={scrollToFeatures} className="explore-scroll-btn">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        )}
      </section>

      {/* Features List */}
      <div id="explore-features-list" className="explore-features-container">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-32 text-white/30 text-lg">
            Chưa có tính năng nào được thêm.
          </div>
        ) : (
          features.map((feature, i) => (
            <FeatureSection key={feature.id} feature={feature} index={i} />
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="explore-footer">
        <p>© {new Date().getFullYear()} Chorus.VN — Tất cả quyền được bảo lưu.</p>
      </footer>

      {/* Inline Styles */}
      <style>{`
        /* ── Page & Background ── */
        .explore-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background: linear-gradient(180deg, #0a0930 0%, #0d0c35 15%, #12103f 40%, #0f0d38 70%, #0a0930 100%);
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .explore-bg {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(88, 80, 200, 0.15) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 50%, rgba(120, 60, 180, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 20% 80%, rgba(60, 80, 200, 0.1) 0%, transparent 50%);
          z-index: 0;
        }

        /* ── Nebula blurs ── */
        .explore-nebula {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }
        .explore-nebula-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(100, 60, 255, 0.4), transparent);
          top: -100px; left: -200px;
          animation: nebula-float 20s ease-in-out infinite;
        }
        .explore-nebula-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(180, 60, 200, 0.3), transparent);
          top: 40%; right: -150px;
          animation: nebula-float 25s ease-in-out infinite reverse;
        }
        .explore-nebula-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(60, 100, 255, 0.3), transparent);
          bottom: 10%; left: 30%;
          animation: nebula-float 18s ease-in-out infinite;
        }
        @keyframes nebula-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }

        /* ── Floating Animations ── */
        .explore-float-1 {
          animation: device-float-1 6s ease-in-out infinite;
        }
        .explore-float-2 {
          animation: device-float-2 7s ease-in-out infinite;
        }
        .explore-float-3 {
          animation: device-float-3 5s ease-in-out infinite;
        }

        @keyframes device-float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes device-float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-1deg); }
        }
        @keyframes device-float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1.5deg); }
        }

        /* ── Shooting Stars ── */
        .shooting-star-line {
          width: 120px;
          height: 1.5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0));
          animation: shoot-across 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes shoot-across {
          0% { opacity: 0; transform: translateX(0) scaleX(0.3); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translateX(300px) scaleX(1); }
        }

        /* ── Header ── */
        .explore-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 1.5rem;
          background: linear-gradient(180deg, rgba(10, 9, 48, 0.9) 0%, transparent 100%);
          backdrop-filter: blur(12px);
        }
        .explore-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .explore-back-btn:hover { color: #fff; background: rgba(255,255,255,0.12); }

        /* ── Hero ── */
        .explore-hero {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 6rem 1.5rem 3rem;
          text-align: center;
        }
        .explore-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: rgba(180, 170, 255, 0.9);
          background: rgba(100, 80, 200, 0.15);
          border: 1px solid rgba(120, 100, 220, 0.25);
          padding: 0.4rem 1rem;
          border-radius: 999px;
          margin-bottom: 2rem;
          backdrop-filter: blur(8px);
        }
        .explore-hero-title {
          font-size: clamp(2.5rem, 7vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .explore-hero-gradient {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #6366f1, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .explore-hero-sub {
          font-size: clamp(0.95rem, 2vw, 1.15rem);
          color: rgba(200, 200, 230, 0.7);
          max-width: 600px;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .explore-scroll-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
        }
        .explore-scroll-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
          transform: translateY(2px);
        }

        /* ── Features Container ── */
        .explore-features-container {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 6rem;
        }

        /* ── Feature Section ── */
        .explore-section {
          display: flex;
          align-items: center;
          gap: 3rem;
          padding: 5rem 0;
          opacity: 0;
          transform: translateY(60px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .explore-section.explore-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .explore-section-reversed {
          flex-direction: row-reverse;
        }
        .explore-section-center {
          flex-direction: column;
          text-align: center;
        }

        /* ── Text ── */
        .explore-text {
          flex: 1;
          min-width: 0;
        }
        .explore-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: rgba(180, 175, 255, 0.95);
          background: rgba(80, 70, 160, 0.25);
          border: 1px solid rgba(120, 110, 200, 0.3);
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          margin-bottom: 1.2rem;
          backdrop-filter: blur(6px);
          text-transform: uppercase;
        }
        .explore-title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1.2rem;
          color: #fff;
        }
        .explore-desc {
          font-size: clamp(0.9rem, 1.5vw, 1.05rem);
          color: rgba(200, 200, 230, 0.7);
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .explore-desc-extra {
          font-size: clamp(0.85rem, 1.3vw, 0.95rem);
          color: rgba(170, 170, 210, 0.5);
          line-height: 1.7;
          font-style: italic;
        }

        /* ── Device Side ── */
        .explore-device {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── iPhone Mockup ── */
        .iphone-mockup {
          width: 280px;
          filter: drop-shadow(0 25px 60px rgba(80, 60, 200, 0.3));
        }
        .iphone-frame {
          position: relative;
          background: linear-gradient(145deg, #1a1a2e, #2d2d44, #1a1a2e);
          border-radius: 44px;
          padding: 14px;
          box-shadow: 
            inset 0 0 0 2px rgba(255,255,255,0.08),
            0 0 0 1px rgba(0,0,0,0.5),
            0 20px 60px rgba(0,0,0,0.5);
        }
        .iphone-notch {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 28px;
          background: #111;
          border-radius: 0 0 18px 18px;
          z-index: 10;
        }
        .iphone-notch::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #1a1a3a, #0a0a1a);
          border-radius: 50%;
          box-shadow: inset 0 0 2px rgba(100, 100, 200, 0.3);
        }
        .iphone-screen {
          width: 100%;
          aspect-ratio: 9/19.5;
          border-radius: 32px;
          overflow: hidden;
          background: #0a0a1a;
        }
        .iphone-home-indicator {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
          z-index: 10;
        }

        /* ── iPad Mockup ── */
        .ipad-mockup {
          width: 460px;
          max-width: 90vw;
          filter: drop-shadow(0 25px 60px rgba(80, 60, 200, 0.3));
        }
        .ipad-frame {
          position: relative;
          background: linear-gradient(145deg, #1a1a2e, #2d2d44, #1a1a2e);
          border-radius: 28px;
          padding: 18px;
          box-shadow:
            inset 0 0 0 2px rgba(255,255,255,0.08),
            0 0 0 1px rgba(0,0,0,0.5),
            0 20px 60px rgba(0,0,0,0.5);
        }
        .ipad-camera {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: radial-gradient(circle, #1a1a3a, #0a0a1a);
          border-radius: 50%;
          z-index: 10;
          box-shadow: inset 0 0 2px rgba(100, 100, 200, 0.3);
        }
        .ipad-screen {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          background: #0a0a1a;
        }

        /* ── MacBook Mockup ── */
        .macbook-mockup {
          width: 520px;
          max-width: 90vw;
          filter: drop-shadow(0 25px 60px rgba(80, 60, 200, 0.3));
        }
        .macbook-lid {
          position: relative;
          background: linear-gradient(145deg, #1a1a2e, #2d2d44, #1a1a2e);
          border-radius: 14px 14px 0 0;
          padding: 16px 16px 10px;
          box-shadow:
            inset 0 0 0 2px rgba(255,255,255,0.08),
            0 0 0 1px rgba(0,0,0,0.5);
        }
        .macbook-camera {
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #1a1a3a, #0a0a1a);
          border-radius: 50%;
          z-index: 10;
          box-shadow: inset 0 0 2px rgba(100, 100, 200, 0.3);
        }
        .macbook-screen {
          width: 100%;
          aspect-ratio: 16/10;
          border-radius: 4px;
          overflow: hidden;
          background: #0a0a1a;
        }
        .macbook-base {
          background: linear-gradient(180deg, #2a2a40, #1e1e32);
          height: 14px;
          border-radius: 0 0 8px 8px;
          position: relative;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.06),
            0 4px 12px rgba(0,0,0,0.3);
        }
        .macbook-notch-bottom {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 0 0 4px 4px;
        }

        /* ── Footer ── */
        .explore-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 3rem 1.5rem;
          color: rgba(255,255,255,0.25);
          font-size: 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .explore-section,
          .explore-section-reversed {
            flex-direction: column !important;
            gap: 2rem;
            padding: 3rem 0;
          }
          .explore-device {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .iphone-mockup { width: 220px; }
          .ipad-mockup { width: 340px; }
          .macbook-mockup { width: 380px; }
          .explore-hero { min-height: 80vh; padding-top: 5rem; }
          .explore-hero-title { margin-bottom: 1rem; }
        }
      `}</style>
    </div>
  );
}
