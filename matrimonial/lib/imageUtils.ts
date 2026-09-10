/**
 * Utility functions for handling image uploads, format checks, and client-side conversions (e.g. HEIC -> JPEG).
 */

export const ACCEPTED_IMAGE_TYPES = "image/*,.heic,.heif,.HEIC,.HEIF";

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
  'avif',
  'gif',
  'bmp',
]);

/**
 * Checks if a file is an image by MIME type or known image extension.
 * Necessary because Windows/Chrome often reports file.type as "" or "application/octet-stream" for .heic files.
 */
export function isImageFile(file: File | null | undefined): boolean {
  if (!file) return false;
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.has(ext);
}

/**
 * Determines if a file is a HEIC or HEIF formatted image.
 */
export function isHeicFile(file: File | null | undefined): boolean {
  if (!file) return false;
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  const mime = (file.type || '').toLowerCase();
  return (
    ext === 'heic' ||
    ext === 'heif' ||
    mime === 'image/heic' ||
    mime === 'image/heif' ||
    mime === 'image/heic-sequence' ||
    mime === 'image/heif-sequence'
  );
}

/**
 * Converts a HEIC/HEIF file into a standard JPEG File on the client.
 * If the file is not HEIC, or if conversion fails, returns the original file.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  // Ensure we are in a browser context before dynamically importing heic2any
  if (typeof window === 'undefined') {
    return file;
  }

  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = (heic2anyModule.default || heic2anyModule) as (options: {
      blob: Blob;
      toType?: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>;

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const baseName = file.name.replace(/\.(heic|heif)$/i, '');
    const newFileName = `${baseName}.jpg`;

    return new File([singleBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('[ImageUtils] HEIC conversion warning, continuing with original file:', err);
    return file;
  }
}
