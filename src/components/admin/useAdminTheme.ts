'use client';

import { useSyncExternalStore } from 'react';

export function useAdminTheme() {
  const isDark = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const observer = new MutationObserver(onStoreChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false),
    () => false
  );

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('medtec-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('medtec-theme', 'light');
    }
  };

  return { isDark, toggleTheme };
}
