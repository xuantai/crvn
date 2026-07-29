import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const FLOATING_NOTES = [
  { id: 1, symbol: '♪', left: '15%', floatX: -14, delay: 0 },
  { id: 2, symbol: '♫', left: '38%', floatX: 8, delay: 0.2 },
  { id: 3, symbol: '♬', left: '62%', floatX: 16, delay: 0.4 },
  { id: 4, symbol: '♩', left: '28%', floatX: -10, delay: 0.6 },
  { id: 5, symbol: '♪', left: '78%', floatX: 12, delay: 0.8 },
];

export const BBBLogo = ({ className = "w-10 h-10", animate = true }: { className?: string; animate?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative inline-block cursor-pointer group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating mini musical notes on hover */}
      <AnimatePresence>
        {isHovered && FLOATING_NOTES.map((note) => (
          <motion.span
            key={`float-note-${note.id}`}
            initial={{ opacity: 0, y: 10, x: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -50, 
              x: note.floatX, 
              scale: [0.5, 1.3, 0.8],
              rotate: [0, -18, 18, 0]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.4, 
              repeat: Infinity, 
              delay: note.delay,
              ease: "easeOut" 
            }}
            className="absolute top-0 text-cyan-400 font-bold text-base pointer-events-none select-none drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] z-30"
            style={{ left: note.left }}
          >
            {note.symbol}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main BBB SVG Logo with Wiggle/Shake on Hover */}
      <motion.div
        animate={isHovered ? { 
          rotate: [0, -7, 7, -4, 4, -2, 0],
          scale: [1, 1.08, 1.03, 1.06, 1],
          y: [0, -4, 2, -2, 0]
        } : { rotate: 0, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.65, 
          ease: "easeInOut",
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.1
        }}
        className="inline-block"
      >
        <svg 
          className={`select-none pointer-events-none transition-all duration-300 ${className}`}
          viewBox="0 0 140 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bbbLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="45%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          <g stroke="url(#bbbLogoGradient)" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Connecting Slanted Beam */}
            <motion.path
              d="M 20 36 L 102 16"
              strokeWidth="10"
              initial={animate ? { opacity: 0, pathLength: 0 } : false}
              animate={animate ? { opacity: 1, pathLength: 1 } : false}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Note 1 (First 'b') */}
            <motion.g
              initial={animate ? { opacity: 0, y: -25 } : false}
              animate={animate ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <path
                d="M 20 36 L 20 70 A 13 13 0 1 0 46 70 A 13 13 0 1 0 20 70 Z"
                strokeWidth="10"
                fill="none"
              />
            </motion.g>

            {/* Note 2 (Second 'b') */}
            <motion.g
              initial={animate ? { opacity: 0, y: -25 } : false}
              animate={animate ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <path
                d="M 61 26 L 61 70 A 13 13 0 1 0 87 70 A 13 13 0 1 0 61 70 Z"
                strokeWidth="10"
                fill="none"
              />
            </motion.g>

            {/* Note 3 (Third 'b') */}
            <motion.g
              initial={animate ? { opacity: 0, y: -25 } : false}
              animate={animate ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <path
                d="M 102 16 L 102 70 A 13 13 0 1 0 128 70 A 13 13 0 1 0 102 70 Z"
                strokeWidth="10"
                fill="none"
              />
            </motion.g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
