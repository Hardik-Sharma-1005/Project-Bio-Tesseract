'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const targetTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={theme ? `Switch to ${targetTheme} theme` : 'Switch color theme'}
      title={theme ? `Switch to ${targetTheme} theme` : 'Switch color theme'}
    >
      <span className="theme-toggle__symbol" aria-hidden="true">{theme === 'light' ? '☾' : theme === 'dark' ? '☼' : '◐'}</span>
      <span className="theme-toggle__label">{theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Theme'}</span>
    </button>
  );
}
