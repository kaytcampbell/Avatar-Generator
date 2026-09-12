import { useEffect, useState } from 'react';

/**
 * Konva needs a loaded HTMLImageElement, not a URL string — this loads one
 * with the native browser Image API (no need for the extra `use-image` dep).
 * `src: null` means "no image" (e.g. no background set) — skips loading.
 */
export function useKonvaImage(src: string | null): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  // Masks a stale `image` from a previous non-null src once src goes null —
  // avoids a setState call in the effect body just to reset it.
  return src ? image : null;
}
