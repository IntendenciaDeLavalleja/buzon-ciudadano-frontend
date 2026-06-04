/**
 * Optimización de imágenes en el cliente antes de enviarlas al backend.
 *
 * Estrategia:
 * - Decodificar la imagen con `createImageBitmap` (preferente) o con
 *   `HTMLImageElement` + `URL.createObjectURL` (fallback).
 * - Corregir orientación EXIF.
 * - Escalar a un máximo de 1920 px en el lado más largo, manteniendo proporción.
 * - Re-exportar a WebP a calidad ~0.80.
 * - Si el resultado es inválido o pesa más que el original, conservar el original
 *   (siempre que no supere el `MAX_FINAL_SIZE_BYTES`).
 * - Si el original ya supera el `MAX_ORIGINAL_SIZE_BYTES`, lanzar error antes de
 *   decodificar.
 */

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AcceptedImageMimeType = (typeof ACCEPTED_IMAGE_MIME_TYPES)[number];

export const MAX_ORIGINAL_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB
export const MAX_FINAL_SIZE_BYTES = 5 * 1024 * 1024;     // 5 MB
export const MAX_LONG_SIDE_PX = 1920;
export const INITIAL_WEBP_QUALITY = 0.8;
export const MIN_WEBP_QUALITY = 0.5;
export const QUALITY_STEP = 0.1;

export interface OptimizeImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  originalType: string;
  optimizedType: string;
  width: number;
  height: number;
  /** True si el archivo entregado es distinto al original. */
  wasOptimized: boolean;
  /** Calidad final aplicada al recomprimir (cuando se convierte). */
  quality?: number;
}

export type OptimizeImageReason =
  | 'invalid_type'
  | 'too_large_original'
  | 'decode_failed'
  | 'invalid_dimensions'
  | 'final_too_large'
  | 'canvas_blob_null'
  | 'optimization_heavier';

export class OptimizeImageError extends Error {
  readonly reason: OptimizeImageReason;

  constructor(reason: OptimizeImageReason, message: string) {
    super(message);
    this.name = 'OptimizeImageError';
    this.reason = reason;
  }
}

interface DecodedImage {
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  /** Limpia recursos cuando se descarta la imagen. */
  cleanup: () => void;
}

const isAcceptedMime = (type: string): type is AcceptedImageMimeType =>
  (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(type);

const sanitizeBaseName = (raw: string): string => {
  // Quitamos la extensión y nos quedamos con la parte "segura" del nombre.
  const dotIdx = raw.lastIndexOf('.');
  const base = dotIdx > 0 ? raw.slice(0, dotIdx) : raw;
  const cleaned = base.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80);
  return cleaned || 'imagen';
};

const buildOptimizedFileName = (originalName: string): string => {
  const base = sanitizeBaseName(originalName);
  return `${base}.webp`;
};

const decodeWithImageBitmap = async (file: File): Promise<DecodedImage> => {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  });
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    cleanup: () => bitmap.close(),
  };
};

const decodeWithImageElement = (file: File): Promise<DecodedImage> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    let settled = false;

    const finishReject = (msg: string) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      img.onload = null;
      img.onerror = null;
      reject(new OptimizeImageError('decode_failed', msg));
    };

    img.onload = () => {
      if (settled) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        finishReject('No pudimos leer las dimensiones de la imagen.');
        return;
      }
      settled = true;
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        cleanup: () => {
          URL.revokeObjectURL(url);
          img.onload = null;
          img.onerror = null;
        },
      });
    };

    img.onerror = () =>
      finishReject('El archivo está dañado o no es una imagen válida.');

    img.src = url;
  });

const decodeImage = async (file: File): Promise<DecodedImage> => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await decodeWithImageBitmap(file);
    } catch {
      // Cae al fallback con HTMLImageElement.
    }
  }
  return decodeWithImageElement(file);
};

const computeTargetSize = (
  width: number,
  height: number,
  maxLongSide: number,
): { width: number; height: number } => {
  const longSide = Math.max(width, height);
  if (longSide <= maxLongSide) {
    return { width, height };
  }
  const ratio = maxLongSide / longSide;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      type,
      quality,
    );
  });

/**
 * Intenta comprimir el bitmap a WebP a la calidad indicada.
 * Devuelve el Blob producido, o `null` si `canvas.toBlob` devolvió null.
 */
const compressToWebp = async (
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> => canvasToBlob(canvas, 'image/webp', quality);

/**
 * Optimiza una imagen recibida del usuario para reducir su peso antes de
 * enviarla al backend.
 *
 * Reglas:
 * - Valida tipo MIME permitido (jpeg/png/webp).
 * - Rechaza >30MB antes de procesar.
 * - Reduce el lado más largo a 1920px sin agrandar imágenes más pequeñas.
 * - Recodifica a WebP a calidad 0.80 (baja hasta 0.50 si sigue >5MB).
 * - Conserva el archivo original si la versión WebP es más pesada.
 * - Conserva el archivo original si la WebP no puede generarse, siempre que
 *   no supere los 5MB; de lo contrario, lanza error.
 */
export async function optimizeImage(
  file: File,
): Promise<OptimizeImageResult> {
  if (!file || !(file instanceof File)) {
    throw new OptimizeImageError(
      'invalid_type',
      'El archivo seleccionado no es una imagen válida.',
    );
  }

  if (!isAcceptedMime(file.type)) {
    throw new OptimizeImageError(
      'invalid_type',
      'El formato de imagen no está permitido. Usá JPG, PNG o WebP.',
    );
  }

  if (file.size > MAX_ORIGINAL_SIZE_BYTES) {
    throw new OptimizeImageError(
      'too_large_original',
      'La imagen supera el máximo permitido de 30 MB.',
    );
  }

  const decoded = await decodeImage(file);

  try {
    if (decoded.width < 1 || decoded.height < 1) {
      throw new OptimizeImageError(
        'invalid_dimensions',
        'No pudimos procesar esta imagen. Probá seleccionando otra.',
      );
    }

    const { width: targetWidth, height: targetHeight } = computeTargetSize(
      decoded.width,
      decoded.height,
      MAX_LONG_SIDE_PX,
    );

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new OptimizeImageError(
        'decode_failed',
        'No pudimos procesar esta imagen. Probá seleccionando otra.',
      );
    }
    // Mejor calidad al escalar.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(decoded.source, 0, 0, targetWidth, targetHeight);

    // Si la imagen ya es pequeña y liviana, devolvemos el original.
    const noResizeNeeded =
      targetWidth === decoded.width && targetHeight === decoded.height;
    const originalAlreadySmall = file.size <= MAX_FINAL_SIZE_BYTES;

    if (noResizeNeeded && originalAlreadySmall) {
      return {
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        originalType: file.type,
        optimizedType: file.type,
        width: decoded.width,
        height: decoded.height,
        wasOptimized: false,
      };
    }

    // Probamos calidades de mayor a menor hasta entrar en MAX_FINAL_SIZE_BYTES.
    let quality = INITIAL_WEBP_QUALITY;
    let blob: Blob | null = null;
    let lastBlob: Blob | null = null;

    while (quality >= MIN_WEBP_QUALITY - 0.001) {
      blob = await compressToWebp(canvas, quality);
      if (!blob) break;
      lastBlob = blob;
      if (blob.size <= MAX_FINAL_SIZE_BYTES) break;
      quality -= QUALITY_STEP;
    }

    if (!blob || !lastBlob) {
      // Si el navegador no soporta WebP o el canvas falló, mantenemos el
      // original siempre que sea aceptable.
      if (originalAlreadySmall) {
        return {
          file,
          originalSize: file.size,
          optimizedSize: file.size,
          originalType: file.type,
          optimizedType: file.type,
          width: decoded.width,
          height: decoded.height,
          wasOptimized: false,
        };
      }
      throw new OptimizeImageError(
        'canvas_blob_null',
        'No pudimos procesar esta imagen. Probá seleccionando otra.',
      );
    }

    const blobToUse = blob ?? lastBlob;
    const optimizedSize = blobToUse.size;

    // Si la versión WebP pesa más que el original (y el original ya es
    // aceptable), conservamos el original.
    if (originalAlreadySmall && optimizedSize >= file.size) {
      return {
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        originalType: file.type,
        optimizedType: file.type,
        width: decoded.width,
        height: decoded.height,
        wasOptimized: false,
      };
    }

    // Si la WebP sigue por encima del límite y el original tampoco entra,
    // error: no se puede reducir lo suficiente.
    if (optimizedSize > MAX_FINAL_SIZE_BYTES) {
      throw new OptimizeImageError(
        'final_too_large',
        'La imagen sigue siendo demasiado pesada después de optimizarla.',
      );
    }

    const optimizedFile = new File(
      [blobToUse],
      buildOptimizedFileName(file.name),
      {
        type: 'image/webp',
        lastModified: file.lastModified,
      },
    );

    return {
      file: optimizedFile,
      originalSize: file.size,
      optimizedSize,
      originalType: file.type,
      optimizedType: 'image/webp',
      width: targetWidth,
      height: targetHeight,
      wasOptimized: true,
      quality: Math.round(quality * 100) / 100,
    };
  } finally {
    decoded.cleanup();
  }
}

/**
 * Formatea un tamaño en bytes como una cadena amigable (en MB / KB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(decimals).replace(/\.0$/, '')} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb
    .toFixed(decimals)
    .replace(/(\.\d*?)0+$/, '$1')
    .replace(/\.$/, '')} MB`;
}
