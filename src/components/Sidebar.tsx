'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { useSettings } from '@/contexts/SettingsContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics-screen', icon: BarChart3 },
  { label: 'Settings', href: '/settings-screen', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  activeRoute?: string;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { settings } = useSettings();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  const effectivelyHovered = settings.hoverExpandSidebar ? isHovered : false;
  const isEffectivelyCollapsed = collapsed && !effectivelyHovered && !isDropdownOpen;

  return (
    <>
      <div 
        className={[
          'hidden lg:block flex-shrink-0 h-screen sidebar-transition',
          collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]',
        ].join(' ')}
      />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={[
          'hidden lg:flex flex-col h-screen border-r border-white/[0.05] sidebar-transition overflow-hidden fixed left-0 top-0 z-40',
          (!isEffectivelyCollapsed && collapsed) ? 'shadow-[0_0_50px_rgba(0,0,0,0.5)]' : '',
          isEffectivelyCollapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]',
        ].join(' ')}
        style={{ backgroundColor: 'var(--card)' }}
      >
        <SidebarContent collapsed={isEffectivelyCollapsed} onClose={undefined} onDropdownOpenChange={setIsDropdownOpen} />
      </aside>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 lg:hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-white/[0.05]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ backgroundColor: 'var(--card)' }}
      >
        <SidebarContent collapsed={false} onClose={onMobileClose} />
      </aside>
    </>
  );
}

function SidebarContent({ collapsed, onClose, onDropdownOpenChange }: { collapsed: boolean; onClose?: () => void; onDropdownOpenChange?: (open: boolean) => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-4">
        <WorkspaceSwitcher collapsed={collapsed} onClose={onClose} onDropdownOpenChange={onDropdownOpenChange} />
      </div>

      <nav className="flex-1 px-3 py-8 space-y-1.5 overflow-y-auto scrollbar-none">
        {!collapsed && (
          <p className="px-3 mb-4 text-[11px] font-semibold text-muted-foreground/40 tracking-wide">
            Workspace
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const NavIcon = item.icon;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative group
                ${collapsed ? 'justify-center' : ''}
                ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'}
              `}
            >
              <NavIcon size={18} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-primary' : ''}`} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 mt-auto">
           <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden group cursor-pointer hover:bg-primary/10 transition-all duration-300">
              <div className="absolute -top-1 -right-1 opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
                 <Shield size={48} />
              </div>
              <p className="text-[11px] font-bold text-primary mb-1 tracking-wide">Pro Plan</p>
              <p className="text-xs font-medium text-muted-foreground leading-snug">Unlock advanced analytics and AI insights.</p>
           </div>
        </div>
      )}
    </div>
  );
}

function Shield({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
