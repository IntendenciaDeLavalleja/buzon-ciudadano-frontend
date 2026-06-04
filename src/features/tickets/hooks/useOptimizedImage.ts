import { useCallback, useEffect, useRef, useState } from 'react';
import {
  formatBytes,
  OptimizeImageError,
  type OptimizeImageResult,
  optimizeImage,
} from '../../../utils/optimizeImage';

/**
 * Estado expuesto por `useOptimizedImage`.
 * - `isOptimizing`: hay una optimización en curso.
 * - `error`: mensaje legible para mostrar al usuario.
 * - `result`: resultado de la última optimización exitosa.
 * - `originalFile`: archivo original seleccionado, sin transformar.
 * - `optimizedFile`: alias de `result?.file` para comodidad de los consumidores.
 */
export interface UseOptimizedImageState {
  isOptimizing: boolean;
  error: string | null;
  result: OptimizeImageResult | null;
  originalFile: File | null;
  optimizedFile: File | null;
}

export interface UseOptimizedImageApi extends UseOptimizedImageState {
  /** Acepta el archivo original seleccionado por el usuario. */
  setOriginalFile: (file: File | null) => void;
  /** Limpia el estado (útil tras un envío exitoso o al cambiar de imagen). */
  reset: () => void;
  /** Mensaje de "éxito" listo para mostrar (tamaños formateados). */
  statusMessage: string | null;
}

/**
 * Hook que recibe un `File` y produce un `File` optimizado.
 *
 * - Cancela peticiones anteriores si el usuario cambia la imagen.
 * - Limpia estado en unmount para evitar memory leaks.
 */
export function useOptimizedImage(): UseOptimizedImageApi {
  const [state, setState] = useState<UseOptimizedImageState>({
    isOptimizing: false,
    error: null,
    result: null,
    originalFile: null,
    optimizedFile: null,
  });

  // Token incremental para ignorar resultados de optimizaciones obsoletas.
  const runIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      runIdRef.current += 1; // invalida optimizaciones en vuelo
    };
  }, []);

  const setOriginalFile = useCallback((file: File | null) => {
    runIdRef.current += 1;
    const runId = runIdRef.current;

    if (!file) {
      setState({
        isOptimizing: false,
        error: null,
        result: null,
        originalFile: null,
        optimizedFile: null,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isOptimizing: true,
      error: null,
      result: null,
      originalFile: file,
      optimizedFile: null,
    }));

    void (async () => {
      try {
        const result = await optimizeImage(file);
        if (!isMountedRef.current || runIdRef.current !== runId) return;
        setState((prev) => ({
          ...prev,
          isOptimizing: false,
          error: null,
          result,
          optimizedFile: result.file,
        }));
      } catch (err) {
        if (!isMountedRef.current || runIdRef.current !== runId) return;
        const message =
          err instanceof OptimizeImageError
            ? err.message
            : 'No pudimos procesar esta imagen. Probá seleccionando otra.';
        setState((prev) => ({
          ...prev,
          isOptimizing: false,
          error: message,
          result: null,
          optimizedFile: null,
        }));
      }
    })();
  }, []);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setState({
      isOptimizing: false,
      error: null,
      result: null,
      originalFile: null,
      optimizedFile: null,
    });
  }, []);

  const statusMessage = state.result
    ? state.result.wasOptimized
      ? `Imagen optimizada: ${formatSizeForStatus(
          state.result.originalSize,
        )} → ${formatSizeForStatus(state.result.optimizedSize)}`
      : 'La imagen ya tiene un tamaño adecuado.'
    : null;

  return {
    ...state,
    setOriginalFile,
    reset,
    statusMessage,
  };
}

function formatSizeForStatus(bytes: number): string {
  return formatBytes(bytes, 1);
}
