import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import img1 from '../img/Header1.webp';
import img2 from '../img/Header2.webp';
import img3 from '../img/Header3.webp';

const slides = [img1, img2, img3];
const INTERVAL_MS = 6800;

interface HeroCarouselProps {
  isDarkMode: boolean;
}

export function HeroCarousel({ isDarkMode }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index]);

  const navigate = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[80vh] min-h-120 overflow-hidden bg-black">

      {/* Slides with crossfade + Ken Burns */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <motion.img
            src={slides[index]}
            alt=""
            aria-hidden="true"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.18 }}
            transition={{ duration: INTERVAL_MS / 1000 + 1.8, ease: 'linear' }}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-r from-black/35 via-transparent to-transparent pointer-events-none" />
      {isDarkMode && <div className="absolute inset-0 bg-black/15 pointer-events-none" />}

      {/* Top frame: corner decorations + counter */}
      <div className="absolute top-7 inset-x-7 flex items-start justify-between pointer-events-none">
        {/* Top-left bracket */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-start"
        >
          <div className="w-px h-8 bg-white/25" />
          <div className="h-px w-8 bg-white/25" />
        </motion.div>

        {/* Slide counter */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-center gap-2.5"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-white/60 text-[11px] font-mono tracking-[0.3em] tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <div className="w-5 h-px bg-white/20" />
          <span className="text-white/25 text-[11px] font-mono tracking-[0.3em]">
            {String(slides.length).padStart(2, '0')}
          </span>
        </motion.div>

        {/* Top-right bracket (mirror) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-start scale-x-[-1]"
        >
          <div className="w-px h-8 bg-white/25" />
          <div className="h-px w-8 bg-white/25" />
        </motion.div>
      </div>

      {/* Central content — animates in once on mount, stays fixed */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 text-center text-white">
        <motion.div className="flex flex-col items-center pointer-events-none select-none">
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.15em' }}
            animate={{ opacity: 0.5, letterSpacing: '0.55em' }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="text-[9px] md:text-[10px] uppercase font-semibold mb-5"
          >
            Intendencia de Lavalleja
          </motion.p>

          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4.25rem] leading-[1.06] drop-shadow-lg"
            >
              Buzón de{' '}
              <span className="italic font-light">Caminería Rural</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.6, ease: 'easeOut' }}
            className="w-10 h-px bg-white/35 my-5 origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.65, y: 0 }}
            transition={{ duration: 0.65, delay: 0.75 }}
            className="text-[12px] md:text-sm font-light leading-relaxed max-w-xs md:max-w-sm"
          >
            Canal oficial de gestión ciudadana para el departamento de Lavalleja
          </motion.p>
        </motion.div>
      </div>

      {/* Side navigation arrows */}
      {(['prev', 'next'] as const).map((dir) => (
        <motion.button
          key={dir}
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate(dir === 'prev' ? -1 : 1)}
          initial={{ opacity: 0, x: dir === 'prev' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          aria-label={dir === 'prev' ? 'Anterior' : 'Siguiente'}
          className={`absolute top-1/2 -translate-y-1/2 ${
            dir === 'prev' ? 'left-4' : 'right-4'
          } w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/45 hover:text-white transition-colors`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {dir === 'prev'
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            }
          </svg>
        </motion.button>
      ))}

      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/8">
        <motion.div
          key={`prog-${index}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
          className="h-full w-full bg-white/45"
        />
      </div>
    </section>
  );
}
