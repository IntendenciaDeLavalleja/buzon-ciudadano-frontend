import logoIdl from '../img/Logo.webp';

type FooterProps = {
  isDarkMode: boolean;
  isLowVision?: boolean;
};

export function Footer({ isDarkMode }: FooterProps) {
  return (
    <footer
      className={`border-t py-10 md:py-14 transition-colors ${
        isDarkMode ? 'bg-[#111111] border-white/5' : 'bg-white border-[#E5E1D8]'
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <img
              src={logoIdl}
              alt="Intendencia de Lavalleja"
              className={`h-11 w-auto object-contain ${
                isDarkMode ? 'rounded-md bg-white/90 p-1.5' : ''
              }`}
            />
            <div>
            <p
              className={`font-serif text-base italic transition-colors ${
                isDarkMode ? 'text-white/50' : 'text-[#1B3A6B]/60'
              }`}
            >
              Buzón Ciudadano
            </p>
            <p
              className={`text-[9px] uppercase tracking-[0.25em] mt-1 transition-colors ${
                isDarkMode ? 'text-white/20' : 'text-zinc-400'
              }`}
            >
              Intendencia de Lavalleja · Uruguay
            </p>
            </div>
          </div>

          <p
            className={`text-[9px] uppercase tracking-[0.25em] transition-colors ${
              isDarkMode ? 'text-white/15' : 'text-zinc-300'
            }`}
          >
            © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
