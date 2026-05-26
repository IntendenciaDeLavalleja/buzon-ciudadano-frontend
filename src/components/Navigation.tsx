import { motion } from 'framer-motion';
import logoIdl from '../img/Logo.webp';

type NavigationProps = {
  isDarkMode: boolean;
  isLowVision?: boolean;
};

export function Navigation({ isDarkMode, isLowVision: _isLowVision }: NavigationProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDarkMode
          ? 'bg-[#111111]/90 border-white/5'
          : 'bg-white/90 border-[#E5E1D8]'
      }`}
    >
      <div className="container mx-auto px-6 py-3.5 flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <img
            src={logoIdl}
            alt="Intendencia de Lavalleja"
            className={`h-9 w-auto object-contain md:h-10 ${
              isDarkMode ? 'rounded-md bg-white/90 p-1.5' : ''
            }`}
          />
          <div
            className={`hidden sm:block h-5 w-px transition-colors ${
              isDarkMode ? 'bg-white/10' : 'bg-[#E5E1D8]'
            }`}
          />
          <h1
            className={`hidden sm:block text-[10px] md:text-xs font-medium uppercase tracking-[0.28em] transition-colors ${
              isDarkMode ? 'text-white/45' : 'text-[#1B3A6B]/60'
            }`}
          >
            Intendencia de Lavalleja
          </h1>
        </div>

        {/* Tagline */}
        <p
          className={`hidden md:block text-[9px] uppercase tracking-[0.3em] font-medium transition-colors ${
            isDarkMode ? 'text-white/20' : 'text-zinc-300'
          }`}
        >
          Departamento de Lavalleja
        </p>
      </div>
    </motion.nav>
  );
}
