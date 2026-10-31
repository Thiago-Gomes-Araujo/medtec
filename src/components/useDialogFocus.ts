'use client';

import React from 'react';

const dialogStack: HTMLElement[] = [];
const tabbableSelector = 'button, a[href], input, select, textarea, [tabindex], [contenteditable="true"]';

/** Focus, keyboard navigation and background isolation shared by modal surfaces. */
export function useDialogFocus(open: boolean, onClose: () => void, returnFocusSelector?: string) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef(onClose);

  React.useEffect(() => { closeRef.current = onClose; }, [onClose]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    const overlay = overlayRef.current;
    if (!open || !dialog || !overlay) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const isolated: { element: HTMLElement; inert: boolean }[] = [];
    // Isolate siblings all the way to body, including when a modal lives inside a section.
    let branch: HTMLElement = overlay;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          isolated.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    dialog.inert = false;
    document.body.style.overflow = 'hidden';
    dialogStack.push(dialog);
    const isTop = () => dialogStack.at(-1) === dialog;
    const focusDialog = () => dialog.focus({ preventScroll: true });
    const tabbables = () => Array.from(dialog.querySelectorAll<HTMLElement>(tabbableSelector)).filter(element =>
      element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') &&
      element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const elements = tabbables();
        const first = elements[0];
        const last = elements.at(-1);
        const active = document.activeElement;
        if (!first) { event.preventDefault(); focusDialog(); }
        else if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (active === last || active === dialog || !dialog.contains(active))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isTop() && !dialog.contains(event.target as Node)) focusDialog();
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn);
    focusDialog();

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
      dialogStack.splice(dialogStack.lastIndexOf(dialog), 1);
      // AnimatePresence may retain the closing panel briefly.
      dialog.inert = true;
      for (const item of isolated) item.element.inert = item.inert;
      document.body.style.overflow = previousOverflow;
      const target = previousFocus?.isConnected && previousFocus !== document.body && !previousFocus.closest('[inert]')
        ? previousFocus : returnFocusSelector ? document.querySelector<HTMLElement>(returnFocusSelector) : null;
      target?.focus({ preventScroll: true });
    };
  }, [open, returnFocusSelector]);

  return { dialogRef, overlayRef };
}
