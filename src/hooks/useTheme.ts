import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'ivory' | 'midnight' | 'light' | 'dark' | 'frangipani' | 'night';
export type CanonicalTheme = 'ivory' | 'midnight';

const THEME_STORAGE_KEY = 'amanaura_theme';
const LEGACY_STORAGE_KEYS = ['yapendik_theme', 'theme'];

function normalizeTheme(raw: string | null): CanonicalTheme | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s === 'midnight' || s === 'night' || s === 'dark') {
    return 'midnight';
  }
  if (s === 'ivory' || s === 'frangipani' || s === 'light') {
    return 'ivory';
  }
  return null;
}

export function useTheme() {
  const [theme, setThemeState] = useState<CanonicalTheme>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check canonical storage key
      const current = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
      if (current) return current;

      // 2. Check legacy storage keys with auto-migration
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyVal = normalizeTheme(localStorage.getItem(legacyKey));
        if (legacyVal) {
          try {
            localStorage.setItem(THEME_STORAGE_KEY, legacyVal);
            localStorage.removeItem(legacyKey);
          } catch {
            // Ignore restricted localStorage errors
          }
          return legacyVal;
        }
      }

      // 3. Fallback to OS preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'ivory';
    }
    return 'ivory';
  });

  const applyTheme = useCallback((targetTheme: ThemeMode) => {
    const canonical = normalizeTheme(targetTheme) || 'ivory';
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (canonical === 'midnight') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, canonical);
    } catch {
      // Ignore localStorage access failures in restricted environments
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next: CanonicalTheme = prev === 'midnight' ? 'ivory' : 'midnight';
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    const canonical = normalizeTheme(newTheme) || 'ivory';
    setThemeState(canonical);
    applyTheme(canonical);
  }, [applyTheme]);

  return {
    theme,
    isDark: theme === 'midnight',
    toggleTheme,
    setTheme
  };
}
