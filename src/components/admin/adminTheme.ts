// Classes do painel: as cores vêm das variáveis --admin-* de globals.css, com modo claro e escuro.
export const adminFocusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-2 focus-visible:ring-offset-admin-surface';

export const adminPrimaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-accent px-3.5 py-2 text-xs font-semibold text-admin-accent-fg transition hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${adminFocusClass}`;
export const adminSecondaryButtonClass = `inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-3.5 py-2 text-xs font-semibold text-admin-text transition hover:bg-admin-surface-muted disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${adminFocusClass}`;
// Botão tonal: abaixo do botão principal, e escurece no hover e no foco.
const adminTonalClass = 'inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-admin-accent-soft px-3 py-2 text-xs font-semibold text-admin-accent transition';
export const adminTonalLinkClass = `${adminTonalClass} hover:bg-admin-accent-soft-active focus-visible:bg-admin-accent-soft-active cursor-pointer ${adminFocusClass}`;
// Só visual, dentro do cartão que já é o link: reage ao estado do cartão.
export const adminTonalCardActionClass = `${adminTonalClass} group-hover:bg-admin-accent-soft-active group-focus-visible:bg-admin-accent-soft-active`;

export const adminCardClass = 'rounded-xl border border-admin-border bg-admin-surface shadow-admin-card';

// Cartão inteiro como link: o azul institucional marca o hover, e o anel, o foco por teclado.
export const adminCardLinkClass = `${adminCardClass} group flex flex-col p-5 transition hover:border-admin-accent hover:shadow-admin-card-hover cursor-pointer ${adminFocusClass}`;

// Âmbar só com pendência; os demais contadores ficam neutros.
export function adminCountBadgeClass(pending: boolean): string {
  return `rounded-full px-2 py-0.5 text-[11px] font-semibold ${pending ? 'bg-admin-warning-soft text-admin-warning' : 'bg-admin-surface-muted text-admin-muted'}`;
}

export const sidebarIconButtonClass = `rounded-md p-1.5 text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text cursor-pointer ${adminFocusClass}`;
export const sidebarSearchInputClass = 'w-full rounded-lg border border-admin-input bg-admin-surface py-1.5 pl-8 pr-7 text-xs text-admin-text placeholder:text-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent';
export const sidebarFolderClass = `flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-admin-muted transition hover:text-admin-text cursor-pointer select-none ${adminFocusClass}`;
export const sidebarPortalLinkClass = `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text ${adminFocusClass}`;

export function sidebarItemClass(active: boolean): string {
  return `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] leading-tight transition cursor-pointer ${adminFocusClass} ${active
    ? 'bg-admin-accent font-semibold text-admin-accent-fg'
    : 'font-medium text-admin-text hover:bg-admin-surface-muted'}`;
}

export function sidebarIconClass(active: boolean): string {
  return `h-4 w-4 shrink-0 ${active ? 'text-admin-accent-fg' : 'text-admin-muted'}`;
}

// Pendência é aviso (âmbar); os demais contadores são neutros.
export function sidebarBadgeClass(active: boolean, pending: boolean): string {
  if (active) return 'shrink-0 rounded-md bg-admin-accent-fg px-1.5 py-0.5 text-[11px] font-semibold text-admin-accent';
  return pending
    ? 'shrink-0 rounded-md bg-admin-warning-soft px-1.5 py-0.5 text-[11px] font-semibold text-admin-warning'
    : 'shrink-0 rounded-md bg-admin-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-admin-muted';
}
