import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { GIF_ANIMATION_PRESETS, sampleGifAnimation } from '@/lib/animation/gifPresets';
import type { AnimationKind } from '@/types/avatar-project';

const FPS = 20;

/**
 * Samples the composition through one animation cycle and encodes an
 * animated GIF, entirely client-side. `sourceCanvas` is the static
 * composition (no CSS transform baked in — see AvatarCanvas.tsx's
 * `getStageCanvas`); the animation's motion is replicated here via
 * `sampleGifAnimation` since Konva's own capture can't see it.
 */
export async function encodeAnimatedGif(
  sourceCanvas: HTMLCanvasElement,
  kind: AnimationKind,
  speed = 1,
): Promise<Uint8Array> {
  const preset = GIF_ANIMATION_PRESETS[kind];
  const durationMs = preset.durationMs / speed;
  const frameCount = Math.max(1, Math.round((durationMs / 1000) * FPS));
  const delayMs = Math.round(1000 / FPS);

  // Padded so a full 360° spin never clips the corners of a square source.
  const padding = Math.round(sourceCanvas.width * 0.21);
  const outSize = sourceCanvas.width + padding * 2;
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = outSize;
  frameCanvas.height = outSize;
  const ctx = frameCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create a 2D canvas context for GIF export.');

  const gif = GIFEncoder();

  for (let i = 0; i < frameCount; i++) {
    const { x, y, scale, rotate } = sampleGifAnimation(kind, i / frameCount);

    ctx.clearRect(0, 0, outSize, outSize);
    ctx.save();
    ctx.translate(outSize / 2, outSize / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(x, y);
    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
    ctx.restore();

    const { data } = ctx.getImageData(0, 0, outSize, outSize);
    // rgba4444 + oneBitAlpha so fully-transparent pixels quantize to a
    // single dedicated palette entry we can mark as the GIF's transparent index.
    const palette = quantize(data, 256, { format: 'rgba4444', oneBitAlpha: true });
    const index = applyPalette(data, palette, 'rgba4444');
    const transparentIndex = palette.findIndex((color) => color[3] === 0);

    gif.writeFrame(index, outSize, outSize, {
      palette,
      delay: delayMs,
      transparent: transparentIndex !== -1,
      transparentIndex: transparentIndex === -1 ? 0 : transparentIndex,
    });

    // Yield between frames so quantizing 15-50 frames doesn't freeze the tab.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  gif.finish();
  return gif.bytes();
}
