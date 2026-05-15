'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Settings, ShieldCheck } from 'lucide-react';
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

  // If hover expand is disabled, hover should not affect collapsed state
  const effectivelyHovered = settings.hoverExpandSidebar ? isHovered : false;
  const isEffectivelyCollapsed = collapsed && !effectivelyHovered && !isDropdownOpen;

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
          'hidden lg:flex flex-col h-screen sidebar-transition overflow-hidden fixed left-0 top-0 z-40',
          !isEffectivelyCollapsed && collapsed ? 'shadow-2xl' : '',
          isEffectivelyCollapsed ? 'w-16' : 'w-60',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--surface-panel, var(--card))',
          /* Right edge: a subtle dim border with inset top shimmer for depth */
          borderRight: '1px solid var(--border-dim, rgba(255,255,255,0.04))',
          boxShadow: 'var(--shadow-md, 0 4px 16px rgba(0,0,0,0.35)), inset -1px 0 0 0 var(--border-subtle, rgba(255,255,255,0.07))',
        }}
      >
        <SidebarContent
          collapsed={isEffectivelyCollapsed}
          onClose={undefined}
          onDropdownOpenChange={setIsDropdownOpen}
        />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 lg:hidden sidebar-transition',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--surface-panel, var(--card))',
          borderRight: '1px solid var(--border-dim, rgba(255,255,255,0.04))',
          boxShadow: 'var(--shadow-xl, 0 16px 56px rgba(0,0,0,0.55))',
        }}
      >
        <SidebarContent collapsed={false} onClose={onMobileClose} />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed,
  onClose,
  onDropdownOpenChange,
}: {
  collapsed: boolean;
  onClose?: () => void;
  onDropdownOpenChange?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { settings, openSettings } = useSettings();
  const [session, setSession] = React.useState<{ role?: string } | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) setSession(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const navItems = [...NAV_ITEMS];

  return (
    <div className="flex flex-col h-full">
      <WorkspaceSwitcher
        collapsed={collapsed}
        onClose={onClose}
        onDropdownOpenChange={onDropdownOpenChange}
      />

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p
            className="px-3 mb-4 text-[10px] font-medium uppercase tracking-[0.25em]"
            style={{ color: 'var(--muted-foreground)', opacity: 0.25 }}
          >
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const NavIcon = item.icon;

          return (
            <Link
              key={`nav-${item.label}-${item.href}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium relative group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-foreground/90'
                  : 'text-muted-foreground/50 hover:text-foreground/70',
              ].join(' ')}
              style={{
                transition: `background-color var(--duration-fast, 120ms) ease, color var(--duration-base, 200ms) ease`,
                ...(isActive
                  ? {
                      backgroundColor: 'var(--surface-overlay, rgba(255,255,255,0.04))',
                    }
                  : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-raised, rgba(255,255,255,0.02))';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {/* Active accent bar */}
              {isActive && !collapsed && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2px',
                    height: '60%',
                    borderRadius: '0 2px 2px 0',
                    backgroundColor: 'var(--primary)',
                    opacity: 0.7,
                    boxShadow: 'var(--glow-primary)',
                  }}
                />
              )}
              <NavIcon
                size={16}
                className={`flex-shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-primary/70' : 'text-muted-foreground/30 group-hover:text-muted-foreground/55'
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {!collapsed && <span className="flex-1 truncate tracking-tight">{item.label}</span>}

              {/* Collapsed tooltip */}
              {collapsed && !settings.iconOnlyMinimized && (
                <span
                  className="absolute left-full ml-3 px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border"
                  style={{
                    backgroundColor: 'var(--surface-float, rgba(10,10,10,0.92))',
                    color: 'rgba(255,255,255,0.8)',
                    borderColor: 'var(--border-subtle, rgba(255,255,255,0.07))',
                    boxShadow: 'var(--shadow-lg)',
                    transition: `opacity var(--duration-base, 200ms) ease`,
                  }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Hub Special Item */}
        {session?.role === 'admin' && (
          <button
            onClick={() => openSettings('Admin: Reports')}
            title={collapsed ? 'Admin Hub' : undefined}
            className={[
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 relative group mt-6 border border-primary/5 bg-primary/[0.02]',
              collapsed ? 'justify-center mx-auto w-10 h-10 p-0' : '',
              'text-primary/60 hover:text-primary/80 hover:bg-primary/5 hover:border-primary/10',
            ].join(' ')}
          >
            <ShieldCheck size={16} className="flex-shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="flex-1 truncate tracking-tight">Admin Control</span>}

            {collapsed && (
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary/40 rounded-full translate-x-1/3 -translate-y-1/3 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            )}

            {collapsed && !settings.iconOnlyMinimized && (
              <span
                className="absolute left-full ml-3 px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl backdrop-blur-xl border border-white/[0.05]"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.9)',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Admin Control
              </span>
            )}
          </button>
        )}
      </nav>
    </div>
  );
}
