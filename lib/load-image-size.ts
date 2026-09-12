/** Loads an image just to read its natural pixel size — same native Image
 * API approach as useKonvaImage, but as a one-shot promise rather than a
 * hook, for code that needs the size once rather than a live element. */
export function loadImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
