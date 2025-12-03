import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

type SequenceState = 'ENTER' | 'WAIT' | 'SPRAY' | 'ADMIRE' | 'EXIT' | 'LOGO' | 'EXPLODE';

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<SequenceState>('ENTER');
  const [botColor, setBotColor] = useState('#c7d2fe'); // pastel indigo nhạt
  const [shouldRender, setShouldRender] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);

  const hasCompletedRef = useRef(false);

  const completeIntro = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chibi_intro_seen', 'true');
      }
    } catch {
      // ignore
    }

    onComplete();
  }, [onComplete]);

  const handleSkip = () => {
    setStep('EXPLODE');
    setTimeout(() => {
      completeIntro();
    }, 300);
  };

  useEffect(() => {
    // Đã xem intro rồi thì bỏ qua luôn
    try {
      if (typeof window !== 'undefined') {
        const seen = localStorage.getItem('chibi_intro_seen');
        if (seen === 'true') {
          setShouldRender(false);
          completeIntro();
          return;
        }
      }
    } catch {
      // ignore
    }

    const runSequence = async () => {
      const safeWait = (ms: number) =>
        new Promise<void>(resolve => {
          setTimeout(() => {
            if (!hasCompletedRef.current) resolve();
          }, ms);
        });

      // 1. Enter (1s)
      await safeWait(1000);
      if (hasCompletedRef.current) return;
      setStep('WAIT');

      // 2. Wait (1s)
      await safeWait(1000);
      if (hasCompletedRef.current) return;
      setStep('SPRAY');

      // 3. Spray (2s) - đổi màu giữa chừng
      setTimeout(() => {
        if (!hasCompletedRef.current) {
          setBotColor('#fecaca'); // pastel hồng sau khi được sơn
        }
      }, 800);
      await safeWait(2000);
      if (hasCompletedRef.current) return;
      setStep('ADMIRE');

      // 4. Admire (1.5s)
      await safeWait(1500);
      if (hasCompletedRef.current) return;
      setStep('EXIT');

      // 5. Exit (0.8s)
      await safeWait(800);
      if (hasCompletedRef.current) return;
      setStep('LOGO');

      // 6. Logo (2.5s)
      await safeWait(2500);
      if (hasCompletedRef.current) return;
      setStep('EXPLODE');

      // 7. Explode (0.5s)
      await safeWait(500);
      if (hasCompletedRef.current) return;
      completeIntro();
    };

    runSequence();
  }, [completeIntro]);

  // Blink mắt nhẹ cho cute
  useEffect(() => {
    if (!['WAIT', 'SPRAY', 'ADMIRE'].includes(step)) return;

    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    }, 1800);

    return () => clearInterval(interval);
  }, [step]);

  // Animation Variants cho bot
  const botVariants: Variants = {
    initial: { y: -300, opacity: 0, scale: 0.8 },
    enter: {
      y: 0,
      opacity: 1,
      scale: [1.05, 0.98, 1],
      transition: { type: 'spring', bounce: 0.6, duration: 1.1 }
    },
    wait: {
      y: [0, -6, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 0.9 }
    },
    spray: {
      x: [0, -10, 0, -6, 0],
      y: [0, -3, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 0.5 }
    },
    admire: {
      scale: [1, 1.08, 1.05],
      rotate: [0, -2, 2, 0],
      transition: { duration: 1 }
    },
    exit: {
      x: 500,
      opacity: 0,
      scale: 0.9,
      transition: { type: 'tween', ease: 'backIn', duration: 0.6 }
    }
  };

  if (!shouldRender) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-sky-50 to-violet-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      exit={{ opacity: 0 }}
    >
      {/* Background blob pastel cho đỡ trống */}
      <motion.div
        className="absolute -top-32 -left-10 w-64 h-64 rounded-full bg-rose-200/50 blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute -bottom-32 -right-10 w-72 h-72 rounded-full bg-sky-200/50 blur-3xl pointer-events-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute top-10 right-1/4 w-32 h-32 rounded-full bg-violet-200/40 blur-2xl pointer-events-none"
        animate={{ x: [0, 15, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'loop' }}
      />

      {/* Nút Skip */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-[110] text-xs px-3 py-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
      >
        Skip
      </button>

      <div className="relative w-full max-w-md h-80 flex items-center justify-center">
        {/* SCENE 1-5: BOX BOT */}
        <AnimatePresence>
          {['ENTER', 'WAIT', 'SPRAY', 'ADMIRE', 'EXIT'].includes(step) && (
            <motion.div
              key="bot"
              variants={botVariants}
              initial="initial"
              animate={step.toLowerCase()}
              className="relative z-10"
            >
              <svg
                width="160"
                height="190"
                viewBox="0 0 100 120"
                className="drop-shadow-[0_12px_30px_rgba(15,23,42,0.25)]"
              >
                {/* Shadow dưới chân */}
                <ellipse
                  cx="50"
                  cy="112"
                  rx="22"
                  ry="5"
                  fill="rgba(15,23,42,0.15)"
                />

                {/* Legs */}
                <motion.rect
                  x="35"
                  y="90"
                  width="8"
                  height="18"
                  rx="4"
                  fill="#94a3b8"
                />
                <motion.rect
                  x="57"
                  y="90"
                  width="8"
                  height="18"
                  rx="4"
                  fill="#94a3b8"
                />

                {/* Body */}
                <motion.rect
                  x="24"
                  y="38"
                  width="52"
                  height="55"
                  rx="14"
                  fill={botColor}
                  stroke="#1f2933"
                  strokeWidth="1.5"
                  animate={{ fill: botColor }}
                  transition={{ duration: 0.3 }}
                />
                {/* Belly screen */}
                <rect
                  x="33"
                  y="52"
                  width="34"
                  height="24"
                  rx="8"
                  fill="#eef2ff"
                  opacity="0.95"
                />
                {/* Belly sparkle */}
                <path
                  d="M38 56 Q41 52 44 56"
                  stroke="#c4b5fd"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Head */}
                <motion.rect
                  x="20"
                  y="8"
                  width="60"
                  height="35"
                  rx="16"
                  fill={botColor}
                  stroke="#1f2933"
                  strokeWidth="1.5"
                  animate={{ fill: botColor }}
                  transition={{ duration: 0.3 }}
                />

                {/* Má hồng */}
                <circle cx="34" cy="30" r="3" fill="#fecaca" opacity="0.9" />
                <circle cx="66" cy="30" r="3" fill="#fecaca" opacity="0.9" />

                {/* Mắt */}
                {isBlinking ? (
                  <>
                    <line
                      x1="38"
                      y1="27"
                      x2="42"
                      y2="27"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="58"
                      y1="27"
                      x2="62"
                      y2="27"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <motion.circle
                      cx="40"
                      cy="26"
                      r="3.2"
                      fill="#0f172a"
                    />
                    <motion.circle
                      cx="60"
                      cy="26"
                      r="3.2"
                      fill="#0f172a"
                    />
                    {/* highlight mắt */}
                    <circle cx="39" cy="25" r="1" fill="#f9fafb" />
                    <circle cx="59" cy="25" r="1" fill="#f9fafb" />
                  </>
                )}

                {/* Miệng ^_^ */}
                <path
                  d="M44 32 Q50 36 56 32"
                  stroke="#0f172a"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Antenna */}
                <line
                  x1="50"
                  y1="8"
                  x2="50"
                  y2="2"
                  stroke="#1f2933"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="0.5" r="3.2" fill="#fb7185" />
              </svg>

              {/* Hearts & sao lúc ADMIRE */}
              {step === 'ADMIRE' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.7 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    className="absolute -top-4 -right-4 text-2xl"
                  >
                    💖
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 0, x: -10, scale: 0.6 }}
                    animate={{ opacity: 1, y: -18, x: -24, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="absolute -top-2 left-1 text-xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8, x: 6, scale: 0.6 }}
                    animate={{ opacity: 1, y: -16, x: 18, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="absolute top-1 right-8 text-xl"
                  >
                    💫
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 3: SPRAY CAN */}
        <AnimatePresence>
          {step === 'SPRAY' && (
            <motion.div
              key="spray"
              initial={{ x: 110, opacity: 0, scale: 0.9 }}
              animate={{ x: 60, opacity: 1, scale: 1 }}
              exit={{ x: 110, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.7, bounce: 0.3 }}
              className="absolute z-20"
            >
              <svg width="70" height="70" viewBox="0 0 50 50">
                {/* Thân bình */}
                <rect
                  x="12"
                  y="16"
                  width="20"
                  height="28"
                  rx="6"
                  fill="#f5d0fe"
                  stroke="#4b5563"
                  strokeWidth="1"
                />
                {/* Nhãn cute */}
                <rect
                  x="14"
                  y="22"
                  width="16"
                  height="14"
                  rx="4"
                  fill="#f97373"
                  opacity="0.9"
                />
                <text
                  x="22"
                  y="31"
                  textAnchor="middle"
                  fontSize="7"
                  fill="#fff"
                >
                  ♥
                </text>

                {/* Đầu bình */}
                <rect x="16" y="11" width="12" height="6" rx="2" fill="#e5e7eb" />
                {/* Nắp */}
                <rect x="18" y="8" width="8" height="4" rx="2" fill="#d4d4d8" />
                {/* Nút phun */}
                <circle cx="18" cy="13" r="1.4" fill="#4b5563" />

                {/* Spray Mist -> trái tim mini */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0], x: -24 }}
                  transition={{ duration: 0.6, repeat: 3 }}
                >
                  <text x="8" y="20" fontSize="6">
                    💕
                  </text>
                  <text x="5" y="26" fontSize="7">
                    💗
                  </text>
                  <text x="10" y="32" fontSize="6">
                    💖
                  </text>
                </motion.g>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCENE 6: LOGO PRISM */}
        <AnimatePresence>
          {step === 'LOGO' && (
            <motion.div
              key="logo"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', duration: 1.4, bounce: 0.45 }}
              className="flex flex-col items-center gap-2"
            >
              <svg width="110" height="110" viewBox="0 0 100 100" className="mb-1">
                <defs>
                  <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M50 8 L90 82 L10 82 Z"
                  fill="url(#prismGrad)"
                  stroke="rgba(15,23,42,0.4)"
                  strokeWidth="1"
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '50% 50%' }}
                />
                <path
                  d="M50 8 L50 82"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.4"
                />
                {/* Những chấm lấp lánh */}
                <circle cx="30" cy="40" r="1.4" fill="#fee2e2" />
                <circle cx="70" cy="55" r="1.6" fill="#e0e7ff" />
              </svg>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-amber-400 to-purple-600 drop-shadow-sm tracking-tight"
              >
                Chibi Studio
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xs uppercase tracking-[0.25em] text-slate-600/80 dark:text-slate-200/70"
              >
                cute · creative · ai
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SCENE 7: EXPLODE */}
      {step === 'EXPLODE' && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
};