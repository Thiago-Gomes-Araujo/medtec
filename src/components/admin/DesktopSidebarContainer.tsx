import type { ReactNode } from 'react';

export interface DesktopSidebarContainerProps {
  isCollapsed: boolean;
  children: ReactNode;
}

export default function DesktopSidebarContainer({ isCollapsed, children }: DesktopSidebarContainerProps) {
  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-full bg-admin-surface text-admin-text border-r border-admin-border select-none z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {children}
    </aside>
  );
}
