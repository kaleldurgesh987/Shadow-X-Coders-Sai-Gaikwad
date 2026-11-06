import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
}

export const HomeCrewLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  animated = true,
}) => {
  const sizeMap = {
    sm: { w: 36, h: 36, text: 'text-lg', subText: 'text-[9px]' },
    md: { w: 48, h: 48, text: 'text-2xl', subText: 'text-[11px]' },
    lg: { w: 72, h: 72, text: 'text-4xl', subText: 'text-xs' },
    xl: { w: 110, h: 110, text: 'text-5xl', subText: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon Emblem */}
      <motion.div
        whileHover={animated ? { scale: 1.05, rotate: [0, -2, 2, 0] } : undefined}
        transition={{ duration: 0.3 }}
        className="relative flex-shrink-0"
        style={{ width: dim.w, height: dim.h }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House Roof & Body Outline */}
          <path
            d="M 100 28 L 158 75 V 60 H 170 V 85 L 176 90 L 165 104 L 100 52 L 35 104 L 24 90 L 100 28 Z"
            fill="#0B5D43"
          />
          <path
            d="M 45 92 V 140 C 45 140 70 148 100 148 C 130 148 155 140 155 140 V 92 L 100 48 L 45 92 Z"
            stroke="#0B5D43"
            strokeWidth="14"
            strokeLinejoin="round"
            fill="#FAFBF8"
          />

          {/* Yellow Glowing 4-Pane Attic Window */}
          <g className="window-glow">
            <rect x="88" y="68" width="10" height="10" rx="1.5" fill="#F9B000" />
            <rect x="102" y="68" width="10" height="10" rx="1.5" fill="#F9B000" />
            <rect x="88" y="82" width="10" height="10" rx="1.5" fill="#F9B000" />
            <rect x="102" y="82" width="10" height="10" rx="1.5" fill="#F9B000" />
          </g>

          {/* Worker 1 (Cap) */}
          <g fill="#0B5D43">
            <ellipse cx="78" cy="116" rx="12" ry="12" />
            <path d="M 66 112 C 66 106 72 103 80 103 C 86 103 92 106 94 110 L 98 111 L 86 114 Z" />
            <path d="M 60 144 C 60 132 68 127 78 127 C 88 127 96 132 96 144 Z" />
          </g>

          {/* Worker 2 (Hardhat) */}
          <g fill="#0B5D43">
            <circle cx="122" cy="116" r="11" />
            <path d="M 110 114 C 110 105 116 100 122 100 C 128 100 134 105 134 114 Z" />
            <path d="M 106 114 H 138 V 117 H 106 Z" />
            <path d="M 104 144 C 104 132 112 127 122 127 C 132 127 140 132 140 144 Z" />
          </g>

          {/* Golden Cradling Caring Hand */}
          <path
            d="M 32 122 C 32 158 75 182 108 182 C 146 182 178 152 178 120 C 160 156 128 166 104 166 C 76 166 50 150 44 134 C 42 130 38 125 32 122 Z"
            fill="#F9B000"
          />
        </svg>
      </motion.div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className={`font-heading font-extrabold tracking-tight leading-none ${dim.text}`}>
          <span className="text-[#0B5D43]">Home</span>
          <span className="text-[#F9B000]">Crew</span>
        </div>
        {showTagline && (
          <span className={`text-[#0B5D43] font-medium tracking-wide mt-0.5 ${dim.subText}`}>
            Professional Hands in your Services
          </span>
        )}
      </div>
    </div>
  );
};

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Has shown in current session check
    const hasSeen = sessionStorage.getItem('homecrew_splash_seen');
    if (hasSeen) {
      setShow(false);
      onFinish();
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('homecrew_splash_seen', 'true');
      setShow(false);
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    sessionStorage.setItem('homecrew_splash_seen', 'true');
    setShow(false);
    onFinish();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFBF8] px-4"
      >
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
        >
          Skip Intro &rarr;
        </button>

        {/* Animated Central Emblem */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 relative mb-6">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 1. House Roof & Outline drawing */}
            <motion.path
              d="M 100 28 L 158 75 V 60 H 170 V 85 L 176 90 L 165 104 L 100 52 L 35 104 L 24 90 L 100 28 Z"
              fill="#0B5D43"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.path
              d="M 45 92 V 140 C 45 140 70 148 100 148 C 130 148 155 140 155 140 V 92 L 100 48 L 45 92 Z"
              stroke="#0B5D43"
              strokeWidth="14"
              strokeLinejoin="round"
              fill="#FAFBF8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
            />

            {/* 2. Window glowing into existence */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <rect x="88" y="68" width="10" height="10" rx="1.5" fill="#F9B000" />
              <rect x="102" y="68" width="10" height="10" rx="1.5" fill="#F9B000" />
              <rect x="88" y="82" width="10" height="10" rx="1.5" fill="#F9B000" />
              <rect x="102" y="82" width="10" height="10" rx="1.5" fill="#F9B000" />
            </motion.g>

            {/* 3. Worker Icons Popping in */}
            <motion.g
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
              fill="#0B5D43"
            >
              <ellipse cx="78" cy="116" rx="12" ry="12" />
              <path d="M 66 112 C 66 106 72 103 80 103 C 86 103 92 106 94 110 L 98 111 L 86 114 Z" />
              <path d="M 60 144 C 60 132 68 127 78 127 C 88 127 96 132 96 144 Z" />
              <circle cx="122" cy="116" r="11" />
              <path d="M 110 114 C 110 105 116 100 122 100 C 128 100 134 105 134 114 Z" />
              <path d="M 106 114 H 138 V 117 H 106 Z" />
              <path d="M 104 144 C 104 132 112 127 122 127 C 132 127 140 132 140 144 Z" />
            </motion.g>

            {/* 4. Golden hand swooping in and cradling the house */}
            <motion.path
              d="M 32 122 C 32 158 75 182 108 182 C 146 182 178 152 178 120 C 160 156 128 166 104 166 C 76 166 50 150 44 134 C 42 130 38 125 32 122 Z"
              fill="#F9B000"
              initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
        </div>

        {/* 5. HomeCrew Brand Name Stagger */}
        <div className="overflow-hidden mb-2 text-center">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl font-heading font-black tracking-tight"
          >
            <span className="text-[#0B5D43]">Home</span>
            <span className="text-[#F9B000]">Crew</span>
          </motion.h1>
        </div>

        {/* 6. Tagline Fade In */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-[#0B5D43] font-medium text-sm sm:text-base tracking-wider text-center"
        >
          Professional Hands in your Services
        </motion.p>

        {/* Social impact badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-white/80 px-4 py-1.5 rounded-full border border-gray-200/80 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#0B5D43] animate-ping" />
          <span>Hyperlocal Blue-Collar Empowerment &bull; Team ShadowX Coders</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
