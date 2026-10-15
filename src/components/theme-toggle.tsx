'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { SunMoon } from 'lucide-react';
export function ThemeToggle() {
  const t = useTranslations('common');
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      aria-label={t('theme')}
      className="rounded-xl border border-[var(--border)] p-3"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <SunMoon size={18} />
    </button>
  );
}
