import { expect, it } from 'vitest';
import { accessibleCodeColor } from '@/content/code-color';
it('brightens low-contrast comments while retaining bright theme tokens', () => {
  expect(accessibleCodeColor('#6A737D')).not.toBe('#6a737d');
  expect(accessibleCodeColor('#ffffff')).toBe('#ffffff');
  expect(accessibleCodeColor(undefined)).toBeUndefined();
  expect(accessibleCodeColor('#000000')).toMatch(/^#[\da-f]{6}$/);
});
