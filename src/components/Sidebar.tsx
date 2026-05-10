'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  Sparkles,
  Layers,
  Calendar,
  Zap,
  Clock,
  Command,
  Plus
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Today', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Work', href: '/projects', icon: Layers },
  { label: 'Trends', href: '/analytics-screen', icon: BarChart3 },
  { label: 'Events', href: '/planner', icon: Calendar },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Preferences', href: '/settings-screen', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const { settings, updateSetting } = useSettings();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const effectivelyHovered = settings.hoverExpandSidebar ? isHovered : false;
  const isEffectivelyCollapsed = collapsed && !effectivelyHovered;

  const toggleCollapse = () => {
    updateSetting('autoCollapseSidebar', !collapsed);
  };

  return (
    <>
      {/* Desktop Spacer */}
      <div 
        className={`hidden lg:block flex-shrink-0 sidebar-transition ${
          isEffectivelyCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      />

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          hidden lg:flex flex-col h-screen border-r border-white/[0.04] sidebar-transition overflow-hidden fixed left-0 top-0 z-40 bg-[#06070a]
          ${isEffectivelyCollapsed ? 'w-[72px]' : 'w-[240px]'}
        `}
      >
        <SidebarContent 
          collapsed={isEffectivelyCollapsed} 
          onToggleCollapse={toggleCollapse}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] lg:hidden transition-transform duration-500 ease-premium-ease border-r border-white/[0.04] bg-[#06070a]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent collapsed={false} onClose={onMobileClose} />
      </aside>
    </>
  );
}

function SidebarContent({ 
  collapsed, 
  onClose, 
  onToggleCollapse
}: { 
  collapsed: boolean; 
  onClose?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-8">
      
      {/* App Branding */}
      <div className={`px-6 mb-10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Sparkles size={14} className="text-white/30" />
          </div>
          {!collapsed && (
            <span className="text-xs font-bold tracking-tight text-white/60">CreatorTracker</span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-10 overflow-y-auto scrollbar-none">
        
        {/* Workspace Section */}
        <section className="space-y-1">
          {!collapsed && (
            <div className="px-3 mb-3">
              <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.25em]">Personal</span>
            </div>
          )}
          {PRIMARY_NAV.map((item) => (
            <SidebarLink 
              key={item.href}
              item={item} 
              isActive={pathname === item.href} 
              collapsed={collapsed} 
              onClick={onClose}
            />
          ))}
        </section>

        {/* System Section */}
        <section className="space-y-1">
          {!collapsed && (
            <div className="px-3 mb-3">
              <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.25em]">System</span>
            </div>
          )}
          {SECONDARY_NAV.map((item) => (
            <SidebarLink 
              key={item.href}
              item={item} 
              isActive={pathname === item.href} 
              collapsed={collapsed} 
              onClick={onClose}
            />
          ))}
        </section>
      </div>

      {/* Sidebar Footer - Minimal */}
      {!collapsed && (
        <div className="px-7 mt-auto pt-8">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-white/10 tracking-widest uppercase">Personal Space</p>
            <p className="text-[10px] text-white/20 font-medium">Logged in as Creator</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ 
  item, 
  isActive, 
  collapsed, 
  onClick 
}: { 
  item: NavItem, 
  isActive: boolean, 
  collapsed: boolean,
  onClick?: () => void 
}) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-[12px] font-semibold transition-all duration-300 relative group
        ${collapsed ? 'justify-center' : ''}
        ${isActive 
          ? 'text-white/90 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/[0.01]'}
      `}
    >
      <div className={`
        flex items-center justify-center transition-all duration-300
        ${isActive ? 'text-slate-400 scale-100' : 'text-white/10 group-hover:text-white/30 group-hover:scale-100'}
      `}>
        <Icon size={15} />
      </div>
      {!collapsed && <span className="flex-1 truncate tracking-tight">{item.label}</span>}
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-slate-500/40 rounded-full" />
      )}
    </Link>
  );
}
