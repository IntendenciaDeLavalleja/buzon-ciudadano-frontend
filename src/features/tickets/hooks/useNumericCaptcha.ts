import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../lib/axios';

interface Challenge { id: string; question: string; expires_in: number; }

export function useNumericCaptcha() {
  const [challenge, setChallenge] = useState<(Challenge & { expiresAt: number }) | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setChallenge(null);
    setAnswer('');
    setError(null);
    try {
      const { data } = await api.get<Challenge>('/api/captcha', { signal: controller.signal, timeout: 10000 });
      if (controller.signal.aborted) return;
      if (!data || !/^[A-Za-z0-9_-]{43}$/.test(data.id) || typeof data.question !== 'string' ||
          !Number.isFinite(data.expires_in) || data.expires_in <= 0) throw new Error('Invalid challenge');
      setChallenge({ ...data, expiresAt: Date.now() + data.expires_in * 1000 });
    } catch {
      if (!controller.signal.aborted) setError('No se pudo cargar la verificación. Pulsá “Nueva suma” para reintentar.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => request.current?.abort();
  }, [refresh]);

  return { challenge, answer, setAnswer, error, setError, loading, refresh };
}
