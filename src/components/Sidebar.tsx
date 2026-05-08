'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import WorkspaceSwitcher from './WorkspaceSwitcher';

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
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const isEffectivelyCollapsed = collapsed && !isHovered && !isDropdownOpen;

  return (
    <>
      {/* Desktop sidebar placeholder to prevent layout shifting */}
      <div 
        className={[
          'hidden lg:block flex-shrink-0 h-screen sidebar-transition',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      />

      {/* Desktop sidebar actual visual element */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={[
          'hidden lg:flex flex-col h-screen border-r sidebar-transition overflow-hidden fixed left-0 top-0 z-40',
          (!isEffectivelyCollapsed && collapsed) ? 'shadow-2xl' : '',
          isEffectivelyCollapsed ? 'w-16' : 'w-60',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <SidebarContent collapsed={isEffectivelyCollapsed} onClose={undefined} onDropdownOpenChange={setIsDropdownOpen} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 lg:hidden sidebar-transition border-r',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
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
      <WorkspaceSwitcher collapsed={collapsed} onClose={onClose} onDropdownOpenChange={onDropdownOpenChange} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p
            className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--muted-foreground)' }}
          >
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
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-primary' : 'hover:bg-muted',
              ].join(' ')}
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(37,99,235,0.08)',
                      color: 'var(--primary)',
                    }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              <NavIcon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {/* Collapsed tooltip */}
              {collapsed && (
                <span
                  className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-elevated"
                  style={{
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--background)',
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


    </div>
  );
}
