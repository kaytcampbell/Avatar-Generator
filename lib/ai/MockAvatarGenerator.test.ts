import { describe, expect, it } from 'vitest';
import { MockAvatarGenerator } from './MockAvatarGenerator';

const INPUT = { photo: { buffer: Buffer.from(''), mimeType: 'image/png' } };

describe('MockAvatarGenerator', () => {
  it('resolves the requested number of variations quickly', async () => {
    const generator = new MockAvatarGenerator({ delayMs: 0, variationCount: 3 });

    const avatars = await generator.generate(INPUT);

    expect(avatars).toHaveLength(3);
    avatars.forEach((avatar) => {
      expect(avatar.url).toMatch(/^\/assets\/avatars\/avatar-\d\.svg$/);
      expect(avatar.width).toBeGreaterThan(0);
      expect(avatar.height).toBeGreaterThan(0);
    });
  });

  it('produces unique ids across calls', async () => {
    const generator = new MockAvatarGenerator({ delayMs: 0, variationCount: 2 });

    const [first, second] = await Promise.all([generator.generate(INPUT), generator.generate(INPUT)]);

    const allIds = [...first, ...second].map((a) => a.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('rejects when failureRate forces a failure', async () => {
    const generator = new MockAvatarGenerator({ delayMs: 0, failureRate: 1 });

    await expect(generator.generate(INPUT)).rejects.toThrow();
  });

  it('never fails when failureRate is 0', async () => {
    const generator = new MockAvatarGenerator({ delayMs: 0, failureRate: 0 });

    await expect(generator.generate(INPUT)).resolves.not.toThrow();
  });
});
