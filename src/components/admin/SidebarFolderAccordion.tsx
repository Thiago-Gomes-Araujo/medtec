'use client';

import type React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PENDING_BADGE_SECTIONS, type AdminSection } from '@/lib/admin-navigation';
import { sidebarBadgeClass, sidebarFolderClass, sidebarIconClass, sidebarItemClass } from './adminTheme';

export interface NavItemDef {
  section: AdminSection;
  label: string;
  tooltip: string;
  icon: React.ElementType;
  badge?: number | string;
  visible: boolean;
}

export interface NavFolderDef {
  id: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
  items: NavItemDef[];
}

export interface SidebarFolderAccordionProps {
  folder: NavFolderDef;
  isOpen: boolean;
  isFolderActive: boolean;
  currentSection: AdminSection;
  isCollapsed?: boolean;
  onToggle: () => void;
  onSelectSection: (section: AdminSection) => void;
}

export default function SidebarFolderAccordion({
  folder,
  isOpen,
  isFolderActive,
  currentSection,
  isCollapsed = false,
  onToggle,
  onSelectSection,
}: SidebarFolderAccordionProps) {
  const visibleItems = folder.items.filter((item) => item.visible);
  if (visibleItems.length === 0) return null;

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={folder.label}
        aria-label={folder.label}
        className={`${sidebarItemClass(isFolderActive)} justify-center px-2`}
      >
        <folder.icon className={sidebarIconClass(isFolderActive)} />
      </button>
    );
  }

  return (
    <div className="space-y-0.5">
      <button type="button" onClick={onToggle} aria-expanded={isOpen} className={sidebarFolderClass}>
        <span className="text-left">{folder.label}</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
      </button>

      {isOpen && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isItemActive = currentSection === item.section;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onSelectSection(item.section)}
                title={item.tooltip}
                aria-current={isItemActive ? 'page' : undefined}
                className={sidebarItemClass(isItemActive)}
              >
                <ItemIcon className={sidebarIconClass(isItemActive)} />
                <span className="text-left flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={sidebarBadgeClass(isItemActive, PENDING_BADGE_SECTIONS.has(item.section))}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
