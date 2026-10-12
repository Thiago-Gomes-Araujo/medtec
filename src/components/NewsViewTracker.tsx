'use client';

import { useEffect } from 'react';

export function recordNewsView(id: string) {
  if (!id || typeof window === 'undefined') return;
  const key = `medtec-view-${id}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  fetch('/api/news/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).catch(() => {
    sessionStorage.removeItem(key);
  });
}

export default function NewsViewTracker({ id }: { id: string }) {
  useEffect(() => {
    recordNewsView(id);
  }, [id]);

  return null;
}
