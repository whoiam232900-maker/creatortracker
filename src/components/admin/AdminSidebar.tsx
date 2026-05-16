'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Settings, 
  ShieldCheck, 
  LogOut,
  ChevronLeft,
  Activity,
  CreditCard,
  Lock
} from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Redeem Codes', href: '/admin/codes', icon: Ticket },
  { label: 'Plan Config', href: '/admin/plans', icon: CreditCard },
  { label: 'Access Control', href: '/admin/roles', icon: Lock },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-black border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <AppLogo className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white">Admin Console</h2>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-80">Operational</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 mb-4 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Management</p>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 relative group ${
                isActive 
                  ? 'bg-white/5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                  : 'text-muted-foreground/50 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              )}
              <Icon size={18} className={isActive ? 'text-primary' : 'opacity-40 group-hover:opacity-100'} strokeWidth={1.5} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground/50 hover:text-white hover:bg-white/[0.02] transition-all group"
        >
          <ChevronLeft size={18} className="opacity-40 group-hover:opacity-100" strokeWidth={1.5} />
          <span>Exit to App</span>
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem('userSession');
            window.location.href = '/auth';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <LogOut size={18} className="opacity-40 group-hover:opacity-100" strokeWidth={1.5} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
