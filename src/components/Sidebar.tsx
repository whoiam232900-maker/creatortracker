'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Flame,
  X,
  LogOut,
} from 'lucide-react';

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

export default function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={[
          'hidden lg:flex flex-col flex-shrink-0 h-screen border-r sidebar-transition overflow-hidden',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          onClose={undefined}
        />
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
        <SidebarContent
          collapsed={false}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [workspaceName, setWorkspaceName] = React.useState('My Workspace');
  const [plan, setPlan] = React.useState('Free Plan');

  React.useEffect(() => {
    try {
      const sessionStr = localStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.workspaceName) setWorkspaceName(session.workspaceName);
        if (session.plan) setPlan(`${session.plan} Plan`);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    window.location.href = '/auth';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={[
          'flex items-center gap-3 border-b flex-shrink-0 rounded-br-none rounded-t-none rounded-bl-none',
          collapsed ? 'px-4 py-4 justify-center' : 'px-4 py-4',
        ].join(' ')}
        style={{ borderColor: 'var(--border)', minHeight: '64px' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span
              className="font-semibold text-base tracking-tight truncate"
              style={{ color: 'var(--foreground)' }}
            >
              CreatorTracker
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto btn-ghost p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

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
                isActive
                  ? 'text-primary' : 'hover:bg-muted',
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
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
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

      {/* Footer */}
      <div
        className="border-t px-2 py-3 flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className={[
            'flex items-center gap-3 px-3 py-2 rounded-lg',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              backgroundColor: 'rgba(37,99,235,0.12)',
              color: 'var(--primary)',
            }}
          >
            <Flame size={14} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--foreground)' }}
              >
                {workspaceName}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {plan}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-red-500/10 text-red-500',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}