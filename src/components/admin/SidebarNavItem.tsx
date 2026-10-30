'use client';

import type React from 'react';

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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-[#004A99] text-white font-semibold shadow-xs ring-1 ring-white/10'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
      } ${isCollapsed ? 'justify-center px-2' : ''}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
      {!isCollapsed && (
        <>
          <span className="truncate text-left flex-1">{label}</span>
          {badge !== undefined && badge !== null && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}
