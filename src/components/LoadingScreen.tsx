import React from 'react';
import { Music } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = 'Đang tải trang...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 font-sans flex flex-col items-center justify-center relative overflow-hidden">
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
        <h2 className="text-xl font-black tracking-[0.25em] text-neutral-900 mb-3 font-sans">
          CHORUS.VN
        </h2>
        
        <div className="flex items-center gap-2 text-neutral-500 text-xs font-serif italic">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}
