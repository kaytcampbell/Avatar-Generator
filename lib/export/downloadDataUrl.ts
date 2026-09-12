/**
 * Triggers a browser download from a data URL. Generic (not Konva-specific)
 * so an animated export feature later can reuse this with a different
 * data source rather than duplicating the download mechanics.
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * Triggers a browser download from a Blob via a temporary object URL — a
 * data: URL isn't appropriate for a potentially multi-MB animated GIF.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(name: string, fallback = 'avatar'): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || fallback;
}
