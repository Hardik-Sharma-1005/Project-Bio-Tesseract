'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import BioTesseractCanvas from '../background/BioTesseractCanvas';

const STORAGE_KEY = 'bio-tesseract-theme';
const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent('bio-tesseract-theme-change', { detail: { theme } }));
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme || getSystemTheme();
}

function getServerThemeSnapshot() {
  return null;
}

function subscribeToTheme(onChange) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onThemeChange = () => onChange();
  const onSystemThemeChange = (event) => {
    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Follow the system theme when storage is unavailable.
    }
    if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light');
    onChange();
  };
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue === 'light' || event.newValue === 'dark') applyTheme(event.newValue);
    else applyTheme(getSystemTheme());
    onChange();
  };

  window.addEventListener('bio-tesseract-theme-change', onThemeChange);
  window.addEventListener('storage', onStorage);
  media.addEventListener('change', onSystemThemeChange);
  return () => {
    window.removeEventListener('bio-tesseract-theme-change', onThemeChange);
    window.removeEventListener('storage', onStorage);
    media.removeEventListener('change', onSystemThemeChange);
  };
}

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = useCallback(() => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The active theme remains available for this visit if storage is disabled.
    }
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <BioTesseractCanvas />
      <div className="site-content">{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
