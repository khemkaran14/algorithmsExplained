/** Shiki's dark theme includes low-contrast comments. Keep every token legible
 * against the player's #0d1117 code surface, including its tinted active row. */
export function accessibleCodeColor(color?: string): string | undefined {
  if (!color || !/^#[\da-f]{6}$/i.test(color)) return color;
  const channels = [1, 3, 5].map((offset) =>
    parseInt(color.slice(offset, offset + 2), 16),
  );
  const luminance = (rgb: number[]) =>
    rgb
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
  const background = luminance([13, 17, 23]);
  while ((luminance(channels) + 0.05) / (background + 0.05) < 7) {
    for (let i = 0; i < channels.length; i++)
      channels[i] = Math.min(255, channels[i] + 5);
  }
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
