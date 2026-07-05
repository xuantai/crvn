import React from 'react';
import { motion } from 'motion/react';

export const ChorusLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg 
      className={`select-none pointer-events-none transition-all duration-300 ${className}`}
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Definitions for split masking or clipping */}
      <defs>
        <clipPath id="leftHalf">
          <rect x="0" y="0" width="60" height="120" />
        </clipPath>
        <clipPath id="rightHalf">
          <rect x="60" y="0" width="60" height="120" />
        </clipPath>
      </defs>

      {/* ROTATING VINYL DISC GROUP */}
      <motion.g
        id="vinyl-disc"
        style={{ transformOrigin: "60px 60px" }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 4, 
          ease: "linear", 
          repeat: Infinity, 
          delay: 1.5 
        }}
      >
        {/* 1. Base Black/Dark Tracks for the "C" shape */}
        <g stroke="#1c1917" strokeWidth="9" strokeLinecap="round">
          <path d="M 79.66 73.77 A 24 24 0 1 1 79.66 46.23" />
          <path d="M 85.40 77.78 A 31 31 0 1 1 85.40 42.22" />
          <path d="M 91.13 81.80 A 38 38 0 1 1 91.13 38.20" />
          <path d="M 96.86 85.81 A 45 45 0 1 1 96.86 34.19" />
          <path d="M 102.60 89.83 A 52 52 0 1 1 102.60 30.17" />
        </g>
        {/* 2. Blue Fill on the Left Half of the tracks to prevent blending with background */}
        <g stroke="#2563eb" strokeWidth="4.5" strokeLinecap="round" clipPath="url(#leftHalf)">
          <path d="M 79.66 73.77 A 24 24 0 1 1 79.66 46.23" />
          <path d="M 85.40 77.78 A 31 31 0 1 1 85.40 42.22" />
          <path d="M 91.13 81.80 A 38 38 0 1 1 91.13 38.20" />
          <path d="M 96.86 85.81 A 45 45 0 1 1 96.86 34.19" />
          <path d="M 102.60 89.83 A 52 52 0 1 1 102.60 30.17" />
        </g>
        {/* 3. Gold Fill on the Right Half of the tracks */}
        <g stroke="#dca134" strokeWidth="4.5" strokeLinecap="round" clipPath="url(#rightHalf)">
          <path d="M 79.66 73.77 A 24 24 0 1 1 79.66 46.23" />
          <path d="M 85.40 77.78 A 31 31 0 1 1 85.40 42.22" />
          <path d="M 91.13 81.80 A 38 38 0 1 1 91.13 38.20" />
          <path d="M 96.86 85.81 A 45 45 0 1 1 96.86 34.19" />
          <path d="M 102.60 89.83 A 52 52 0 1 1 102.60 30.17" />
        </g>
        {/* 4. Center Gold Disc with Black Outline */}
        <circle cx="60" cy="60" r="17" fill="#dca134" stroke="#1c1917" strokeWidth="4.5" />
        {/* 5. Small White Spindle Hole in the middle */}
        <circle cx="60" cy="60" r="4" fill="#ffffff" />
      </motion.g>

      {/* 6. Stylized "r"-shaped Tonearm/Stylus dropping onto the record */}
      <motion.g
        id="tonearm"
        style={{ transformOrigin: "105px 15px" }}
        initial={{ rotate: -32, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Pivot base (tiny metallic circle) */}
        <circle cx="105" cy="15" r="4.5" fill="#1c1917" stroke="#ffffff" strokeWidth="1" />
        <circle cx="105" cy="15" r="1.5" fill="#dca134" />
        {/* Vertical stem of the "r" shape */}
        <line x1="105" y1="15" x2="105" y2="42" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="105" y1="15" x2="105" y2="42" stroke="#dca134" strokeWidth="2.2" strokeLinecap="round" />
        {/* Arched arm of the "r" shape reaching over to the record */}
        <path 
          d="M 105 23 C 94 13, 80 20, 75 48" 
          stroke="#1c1917" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 105 23 C 94 13, 80 20, 75 48" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Stylus needle head shell (bright ruby red) touching the tracks */}
        <rect x="71" y="45" width="8" height="5" rx="1.5" fill="#e11d48" stroke="#1c1917" strokeWidth="1" />
        {/* Subtle needle line */}
        <line x1="75" y1="50" x2="74" y2="53" stroke="#1c1917" strokeWidth="1.5" />
      </motion.g>
    </svg>
  );
};
