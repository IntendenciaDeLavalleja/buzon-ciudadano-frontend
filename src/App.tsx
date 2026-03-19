import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketForm } from './features/tickets/components/TicketForm';
import { TicketStatus } from './features/tickets/components/TicketStatus';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HeroCarousel } from './components/HeroCarousel';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const handleTicketSuccess = (code: string) => {
    setTrackingCode(code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans antialiased selection:bg-[#1B3A6B] selection:text-white ${
        isDarkMode ? 'bg-[#111111] text-[#E8E5DF]' : 'bg-[#FAFAF8] text-[#1C1C1C]'
      } text-base`}
    >
      {/* ── Beta / Test Banner ────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className={`flex items-start gap-3 px-5 py-3 text-[12px] leading-snug border-b transition-colors ${
                isDarkMode
                  ? 'bg-amber-950/25 border-amber-900/30 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {/* Warning icon */}
              <svg
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="flex-1">
                <span className="font-semibold">Producto preliminar en modo prueba.</span>{' '}
                En los próximos meses podrá sufrir modificaciones visuales o de propósito.
              </p>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Cerrar aviso"
                className={`shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity font-semibold text-base leading-none ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-700'
                }`}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accessibility Toolbar ─────────────────────────── */}
      <div
        className={`border-b py-2.5 px-6 flex justify-end gap-6 text-[11px] transition-colors ${
          isDarkMode
            ? 'bg-[#0D0D0D] border-white/5 text-white/30'
            : 'bg-white border-[#E5E1D8] text-zinc-400'
        }`}
      >
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 font-semibold uppercase tracking-[0.15em] transition-colors ${
            isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'hover:text-[#1B3A6B]'
          }`}
        >
          {isDarkMode ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              Modo claro
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
              Modo oscuro
            </>
          )}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <Navigation isDarkMode={isDarkMode} />

      {/* ── Hero Carousel ─────────────────────────────────── */}
      <HeroCarousel isDarkMode={isDarkMode} />

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="container mx-auto px-5 md:px-8 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">

          {/* Form column — 8/12 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            <div
              className={`rounded-xl border p-6 md:p-10 transition-colors ${
                isDarkMode
                  ? 'bg-[#161616] border-[#222]'
                  : 'bg-white border-[#E5E1D8] shadow-[0_2px_24px_rgba(0,0,0,0.04)]'
              }`}
            >
              {/* Form header */}
              <div className="mb-8 flex items-start gap-4">
                <div
                  className={`w-1 self-stretch rounded-full shrink-0 ${
                    isDarkMode ? 'bg-[#1B3A6B]/50' : 'bg-[#1B3A6B]'
                  }`}
                />
                <div>
                  <h2
                    className={`font-serif text-2xl transition-colors ${
                      isDarkMode ? 'text-white' : 'text-[#1B3A6B]'
                    }`}
                  >
                    Nueva solicitud
                  </h2>
                  <p
                    className={`mt-1.5 leading-relaxed text-sm ${
                      isDarkMode ? 'text-white/35' : 'text-zinc-400'
                    }`}
                  >
                    Complete el formulario para registrar su solicitud de caminería rural.
                  </p>
                </div>
              </div>

              <TicketForm
                isDarkMode={isDarkMode}
                onSuccess={handleTicketSuccess}
              />
            </div>
          </motion.div>

          {/* Sidebar — 4/12 */}
          <aside className="lg:col-span-4 space-y-6">
            <TicketStatus
              isDarkMode={isDarkMode}
              initialTrackingCode={trackingCode}
              onClear={() => setTrackingCode('')}
            />

            {/* WhatsApp */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -2 }}
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '59898018085'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col gap-4 rounded-xl border p-6 transition-all ${
                isDarkMode
                  ? 'bg-[#1A1A1A] border-[#252525] hover:border-[#333]'
                  : 'bg-white border-[#E5E1D8] hover:border-[#C8C2B8] shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'bg-[#25D366]/10' : 'bg-[#25D366]/8'
                  }`}
                >
                  <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      isDarkMode ? 'text-white/80' : 'text-[#1C1C1C]'
                    }`}
                  >
                    WhatsApp
                  </p>
                  <p
                      className={`text-xs ${
                      isDarkMode ? 'text-white/30' : 'text-zinc-400'
                    }`}
                  >
                    Consultas de orientación
                  </p>
                </div>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? 'text-white/35' : 'text-zinc-500'
                }`}
              >
                Asistencia inmediata para orientar su solicitud o evacuar dudas antes de enviar.
              </p>
              <div
                className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                  isDarkMode ? 'text-white/40 group-hover:text-white/60' : 'text-zinc-400 group-hover:text-[#1B3A6B]'
                } transition-colors`}
              >
                Iniciar conversación
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </motion.a>
          </aside>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
