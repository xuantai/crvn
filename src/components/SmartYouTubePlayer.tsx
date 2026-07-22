import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function SmartYouTubePlayer({
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
            if ([2, 5, 100, 101, 150, 153].includes(errCode)) {
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
              Video này bị giới hạn phát nhúng trên trang web. Vui lòng bấm vào đây để mở và xem trực tiếp trên YouTube.
            </p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <div ref={containerRef} className={className} />
  );
}
