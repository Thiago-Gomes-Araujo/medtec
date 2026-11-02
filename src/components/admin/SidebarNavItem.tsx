'use client';

import type React from 'react';
import { sidebarBadgeClass, sidebarIconClass, sidebarItemClass } from './adminTheme';

export interface SidebarNavItemProps {
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  isActive: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
  tooltip?: string;
}

export default function SidebarNavItem({
  label,
  icon: Icon,
  badge,
  isActive,
  isCollapsed = false,
  onClick,
  tooltip,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? (tooltip || label) : tooltip}
      aria-label={isCollapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={`${sidebarItemClass(isActive)} ${isCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className={sidebarIconClass(isActive)} />
      {!isCollapsed && (
        <>
          <span className="text-left flex-1">{label}</span>
          {badge !== undefined && badge !== null && (
            <span className={sidebarBadgeClass(isActive, false)}>{badge}</span>
          )}
        </>
      )}
    </button>
  );
}
