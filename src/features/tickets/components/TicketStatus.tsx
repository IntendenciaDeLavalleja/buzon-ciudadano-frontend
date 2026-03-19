import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';
import { CATEGORY_MAPPING } from '../schema';

interface TicketStatusProps {
  isDarkMode: boolean;
  isLowVision?: boolean;
  initialTrackingCode?: string;
  onClear: () => void;
}

export const TicketStatus: React.FC<TicketStatusProps> = ({
  isDarkMode,
  isLowVision,
  initialTrackingCode = '',
  onClear,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingCode);
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const fetchTicket = async (code: string) => {
    if (!code || code.length <= 5) return;
    setIsLoading(true);
    setIsError(false);
    setErrorStatus(null);
    setTicket(null);
    try {
      const response = await api.get(`/api/tickets/${code}`);
      setTicket(response.data);
    } catch (e: any) {
      setIsError(true);
      setErrorStatus(e?.response?.status ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingCode) {
      setTrackingNumber(initialTrackingCode);
      fetchTicket(initialTrackingCode);
    }
  }, [initialTrackingCode]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicket(trackingNumber);
  };

  const handleClear = () => {
    setTrackingNumber('');
    setTicket(null);
    setIsError(false);
    setErrorStatus(null);
    onClear();
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      NEW: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      IN_PROGRESS: isDarkMode ? 'text-amber-400' : 'text-amber-600',
      RESOLVED: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      ARCHIVED: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
    };
    return map[status] ?? (isDarkMode ? 'text-zinc-400' : 'text-zinc-500');
  };

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = {
      NEW: 'bg-blue-500',
      IN_PROGRESS: 'bg-amber-500',
      RESOLVED: 'bg-emerald-500',
      ARCHIVED: 'bg-zinc-400',
    };
    return map[status] ?? 'bg-zinc-400';
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      NEW: 'Pendiente',
      IN_PROGRESS: 'En Gestión',
      RESOLVED: 'Resuelto',
      ARCHIVED: 'Archivado',
    };
    return map[status] ?? status;
  };

  const lv = isLowVision ?? false;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border p-6 transition-colors ${
        isDarkMode
          ? 'bg-[#1A1A1A] border-[#252525]'
          : 'bg-[#F8F7F4] border-[#E5E1D8]'
      }`}
    >
      {/* Header */}
      <div className="mb-5">
        <h3
          className={`font-serif ${lv ? 'text-2xl' : 'text-xl'} transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#1B3A6B]'
          }`}
        >
          Seguimiento
        </h3>
        <p
          className={`mt-1 ${lv ? 'text-sm' : 'text-xs'} leading-relaxed ${
            isDarkMode ? 'text-white/35' : 'text-zinc-400'
          }`}
        >
          Ingrese el código recibido al finalizar su gestión.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleTrack} className="space-y-3">
        <input
          type="text"
          placeholder="BUZ-2026-XXXX"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[#1B3A6B]/15 focus:border-[#1B3A6B] ${lv ? 'text-lg py-4' : ''} ${
            isDarkMode
              ? 'bg-[#242424] border-[#2C2C2C] text-white placeholder:text-white/20'
              : 'bg-white border-[#E5E1D8] text-[#1C1C1C] placeholder:text-zinc-300'
          }`}
        />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={`w-full rounded-lg py-2.5 font-semibold text-sm uppercase tracking-[0.12em] border-2 transition-all ${lv ? 'py-4 text-base' : ''} ${
            isDarkMode
              ? 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
              : 'border-[#1B3A6B]/30 text-[#1B3A6B] hover:border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white'
          }`}
        >
          {isLoading ? 'Consultando...' : 'Consultar estado'}
        </motion.button>
      </form>

      {/* Error */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium"
          >
            {errorStatus === 404
              ? 'No se encontró ninguna solicitud con ese código.'
              : 'Error al consultar. Intente nuevamente.'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {ticket && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={`mt-5 pt-5 border-t space-y-4 ${isDarkMode ? 'border-[#252525]' : 'border-[#E5E1D8]'}`}
          >
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${getStatusDot(ticket.status)}`} />
              <span className={`font-bold text-sm uppercase tracking-wide ${getStatusColor(ticket.status)} ${lv ? 'text-base' : ''}`}>
                {getStatusText(ticket.status)}
              </span>
            </div>

            {/* Meta */}
            <div className={`space-y-2.5 text-xs ${lv ? 'text-sm' : ''}`}>
              <div>
                <span className={`block font-semibold uppercase tracking-[0.15em] mb-0.5 ${isDarkMode ? 'text-white/25' : 'text-zinc-400'}`}>Categoría</span>
                <span className={`font-serif italic ${isDarkMode ? 'text-white/70' : 'text-[#1C1C1C]'}`}>
                  {CATEGORY_MAPPING[ticket.category] || ticket.category}
                </span>
              </div>
              <div>
                <span className={`block font-semibold uppercase tracking-[0.15em] mb-0.5 ${isDarkMode ? 'text-white/25' : 'text-zinc-400'}`}>Fecha</span>
                <span className={`font-serif italic ${isDarkMode ? 'text-white/70' : 'text-[#1C1C1C]'}`}>
                  {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* History */}
            {ticket.history?.length > 0 && (
              <div>
                <span className={`block font-semibold uppercase tracking-[0.15em] mb-2 ${lv ? 'text-sm' : 'text-[10px]'} ${isDarkMode ? 'text-white/25' : 'text-zinc-400'}`}>Historial</span>
                <ul className="space-y-1.5">
                  {ticket.history.map((h: any, idx: number) => (
                    <li key={idx} className={`flex flex-col gap-0.5 ${lv ? 'text-sm' : 'text-xs'} ${isDarkMode ? 'text-white/50' : 'text-zinc-500'}`}>
                      <div className="flex items-start gap-3">
                        <span className="min-w-20 tabular-nums">{new Date(h.date).toLocaleDateString('es-ES')}</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white/70' : 'text-[#1C1C1C]'}`}>{getStatusText(h.status)}</span>
                      </div>
                      {h.note && (
                        <p className={`ml-21 italic leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-zinc-500'}`}>{h.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleClear}
              className={`text-[11px] font-semibold uppercase tracking-wider underline decoration-1 underline-offset-2 transition-colors ${
                isDarkMode ? 'text-white/25 hover:text-white/50' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              Limpiar consulta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
