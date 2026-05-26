import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TicketForm } from './features/tickets/components/TicketForm';
import { TicketStatus } from './features/tickets/components/TicketStatus';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ServiceRequestForm } from './features/services/components/ServiceRequestForm';

type EntryBlock = 'tramites' | 'camineria';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [activeBlock, setActiveBlock] = useState<EntryBlock>('tramites');

  const handleTicketSuccess = (code: string) => {
    setTrackingCode(code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: EntryBlock) => {
    setActiveBlock(sectionId);
    window.requestAnimationFrame(() => {
      const element = document.getElementById('active-form-panel');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const entryCardClass = (block: EntryBlock) => {
    const isActive = activeBlock === block;
    return `group relative overflow-hidden rounded-[28px] border p-6 md:p-7 text-left transition-all duration-300 ${
      isActive
        ? isDarkMode
          ? 'border-[#C59B4F]/40 bg-[#161616] shadow-[0_24px_50px_rgba(0,0,0,0.35)]'
          : 'border-[#17335D]/15 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.08)]'
        : isDarkMode
          ? 'border-white/8 bg-[#121212] hover:border-white/15'
          : 'border-[#E5E1D8] bg-white hover:border-[#CFC7BA]'
    }`;
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors duration-300 font-sans antialiased selection:bg-[#1B3A6B] selection:text-white ${
        isDarkMode ? 'bg-[#111111] text-[#E8E5DF]' : 'bg-[#FAFAF8] text-[#1C1C1C]'
      } text-base`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-130 ${
          isDarkMode
            ? 'bg-[#111111]'
            : 'bg-[#FAFAF8]'
        }`}
      />

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
                <span className="font-semibold">Versión Beta</span>
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

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] backdrop-blur ${
              isDarkMode
                ? 'border-white/10 bg-[#141414]/95 text-white/55'
                : 'border-slate-200 bg-white/85 text-slate-500'
            }`}>
              Buzon ciudadano
              <span className="h-1.5 w-1.5 rounded-full bg-[#C59B4F]" />
              Elegi por donde empezar
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className={`font-serif text-4xl leading-[1.02] md:text-5xl lg:text-6xl ${isDarkMode ? 'text-white' : 'text-[#17335D]'}`}>
                Una puerta clara para <span className="italic font-light">tramites</span> y para reportar <span className="italic font-light">camineria rural</span>.
              </h1>
              <p className={`max-w-2xl text-base leading-relaxed md:text-lg ${isDarkMode ? 'text-white/55' : 'text-slate-600'}`}>
                La pagina arranca con dos caminos principales. El primero ordena solicitudes de tramites y servicios con una experiencia mas pulida; el segundo mantiene el buzon de camineria rural que ya esta en funcionamiento.
              </p>
            </div>

            <div className={`flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
              <span className={`rounded-full border px-4 py-2 ${isDarkMode ? 'border-white/10 bg-[#141414] text-white/55' : 'border-slate-200 bg-white text-slate-500'}`}>Seleccion inicial</span>
              <span className={`rounded-full border px-4 py-2 ${isDarkMode ? 'border-white/10 bg-[#141414] text-white/55' : 'border-slate-200 bg-white text-slate-500'}`}>Seguimiento ciudadano</span>
              <span className={`rounded-full border px-4 py-2 ${isDarkMode ? 'border-white/10 bg-[#141414] text-white/55' : 'border-slate-200 bg-white text-slate-500'}`}>Diseño de alto contraste</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-[30px] border p-6 shadow-[0_24px_50px_rgba(15,23,42,0.06)] ${isDarkMode ? 'border-white/8 bg-[#141414]' : 'border-[#E5E1D8] bg-white'}`}
          >
            <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
              Paso 1
            </p>
            <h2 className={`mt-3 font-serif text-2xl ${isDarkMode ? 'text-white' : 'text-[#17335D]'}`}>
              Elegi el bloque que corresponde a tu necesidad.
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
              Cada tarjeta te lleva directo al formulario correcto para que no tengas que navegar de mas.
            </p>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2 xl:gap-6">
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            onClick={() => scrollToSection('tramites')}
            className={entryCardClass('tramites')}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${isDarkMode ? 'bg-[#C59B4F]' : 'bg-linear-to-r from-[#C59B4F] via-[#D8B56E] to-transparent'}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${activeBlock === 'tramites' ? 'text-[#17335D]' : isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
                  Solicitud de tramites
                </p>
                <h3 className={`mt-3 font-serif text-3xl ${activeBlock === 'tramites' ? 'text-[#17335D]' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Tramites y servicios
                </h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${activeBlock === 'tramites' ? 'border-[#17335D] bg-[#17335D] text-white' : isDarkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'}`}>
                {activeBlock === 'tramites' ? 'Activo' : 'Abrir'}
              </span>
            </div>
            <p className={`mt-4 max-w-xl text-sm leading-relaxed ${activeBlock === 'tramites' ? 'text-slate-600' : isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
              Formulario premium para permisos, constancias, certificaciones, inspecciones y solicitudes generales.
            </p>
            <div className="mt-6 grid gap-2 text-left sm:grid-cols-3">
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Rapido</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Ingreso guiado</p>
              </div>
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Claro</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Tipo de solicitud</p>
              </div>
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Agradable</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Diseño editorial</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            onClick={() => scrollToSection('camineria')}
            className={entryCardClass('camineria')}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${isDarkMode ? 'bg-[#3A7BD5]' : 'bg-linear-to-r from-[#17335D] via-[#3A7BD5] to-transparent'}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${activeBlock === 'camineria' ? 'text-[#17335D]' : isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
                  Buzon de camineria rural
                </p>
                <h3 className={`mt-3 font-serif text-3xl ${activeBlock === 'camineria' ? 'text-[#17335D]' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Reportes de camineria
                </h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${activeBlock === 'camineria' ? 'border-[#17335D] bg-[#17335D] text-white' : isDarkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'}`}>
                {activeBlock === 'camineria' ? 'Activo' : 'Abrir'}
              </span>
            </div>
            <p className={`mt-4 max-w-xl text-sm leading-relaxed ${activeBlock === 'camineria' ? 'text-slate-600' : isDarkMode ? 'text-white/45' : 'text-slate-500'}`}>
              El formulario actual para camineria rural con mapa, imagen, seguimiento y validacion completa.
            </p>
            <div className="mt-6 grid gap-2 text-left sm:grid-cols-3">
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Mapa</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Ubicacion exacta</p>
              </div>
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Imagen</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Adjunto obligatorio</p>
              </div>
              <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Codigo</p>
                <p className={`mt-1 text-sm font-semibold ${isDarkMode ? 'text-white/75' : 'text-slate-700'}`}>Seguimiento inmediato</p>
              </div>
            </div>
          </motion.button>
        </section>

        <div id="active-form-panel" className="mt-10 scroll-mt-24 md:mt-14">
          <AnimatePresence mode="wait">
            {activeBlock === 'tramites' ? (
              <motion.section
                key="tramites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`rounded-[30px] border p-5 md:p-8 ${isDarkMode ? 'border-white/8 bg-[#151515]' : 'border-[#E5E1D8] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]'}`}
              >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${isDarkMode ? 'bg-[#3A7BD5]/70' : 'bg-[#17335D]'}`} />
                    <div>
                      <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
                        01 / Solicitud de tramites
                      </p>
                      <h2 className={`mt-3 font-serif text-3xl transition-colors ${isDarkMode ? 'text-white' : 'text-[#17335D]'}`}>
                        Tramites y servicios
                      </h2>
                      <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        El formulario seleccionado se muestra abajo con su propia experiencia visual y respetando el modo nocturno.
                      </p>
                    </div>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'border-white/10 bg-white/5 text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    Formulario activo: Tramites
                  </div>
                </div>

                <ServiceRequestForm isDarkMode={isDarkMode} />
              </motion.section>
            ) : (
              <motion.section
                key="camineria"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`rounded-[30px] border p-5 md:p-8 ${isDarkMode ? 'border-white/8 bg-[#151515]' : 'border-[#E5E1D8] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]'}`}
              >
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${isDarkMode ? 'bg-[#3A7BD5]/70' : 'bg-[#17335D]'}`} />
                    <div>
                      <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
                        02 / Buzon de camineria rural
                      </p>
                      <h2 className={`mt-3 font-serif text-3xl transition-colors ${isDarkMode ? 'text-white' : 'text-[#17335D]'}`}>
                        Reporte de camineria rural
                      </h2>
                      <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                        El formulario seleccionado se muestra abajo con su propio seguimiento, ubicación y adjuntos.
                      </p>
                    </div>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${isDarkMode ? 'border-white/10 bg-white/5 text-white/45' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    Formulario activo: Camineria
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-12">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:col-span-8"
                  >
                    <TicketForm isDarkMode={isDarkMode} onSuccess={handleTicketSuccess} />
                  </motion.div>

                  <aside className="lg:col-span-4 space-y-6">
                    <TicketStatus
                      isDarkMode={isDarkMode}
                      initialTrackingCode={trackingCode}
                      onClear={() => setTrackingCode('')}
                    />

                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      whileHover={{ y: -2 }}
                      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '59898018085'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex flex-col gap-4 rounded-3xl border p-6 transition-all ${
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
                          <p className={`font-semibold text-sm ${isDarkMode ? 'text-white/80' : 'text-[#1C1C1C]'}`}>
                            WhatsApp
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
                            Consultas de orientacion
                          </p>
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-white/35' : 'text-zinc-500'}`}>
                        Asistencia inmediata para orientar su solicitud o evacuar dudas antes de enviar.
                      </p>
                      <div className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] ${isDarkMode ? 'text-white/40 group-hover:text-white/60' : 'text-zinc-400 group-hover:text-[#1B3A6B]'} transition-colors`}>
                        Iniciar conversacion
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </motion.a>
                  </aside>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
