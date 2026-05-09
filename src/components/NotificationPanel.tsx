'use client';

import React from 'react';
import { 
  Bell, X, UserPlus, Zap, Sparkles, Check, 
  Trash2, Mail, Info, ChevronRight, CheckCircle2,
  Clock, Calendar, Shield, AlertTriangle
} from 'lucide-react';
import { useWorkspace, AppNotification } from '@/contexts/WorkspaceContext';
import AppButton from './ui/AppButton';
import EmptyState from './ui/EmptyState';
import Skeleton from './ui/Skeleton';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { 
    notifications, acceptInvite, declineInvite, 
    clearNotification, markAllNotificationsRead, isLoading 
  } = useWorkspace();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'invite': return <UserPlus size={16} className="text-primary" />;
      case 'system': return <Zap size={16} className="text-amber-500" />;
      case 'billing': return <Shield size={16} className="text-blue-500" />;
      case 'insight': return <Sparkles size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div 
      className="absolute top-12 right-0 w-80 sm:w-88 max-h-[500px] bg-card border border-border rounded-xl shadow-modal z-[100] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right backdrop-blur-xl"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[13px] tracking-tight text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <AppButton variant="ghost" size="xs" onClick={markAllNotificationsRead} className="text-[10px] px-2 h-7 font-semibold">Mark all read</AppButton>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-3">
                  <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton variant="text" className="w-3/4 h-2" />
                  </div>
               </div>
             ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-6">
            <EmptyState 
              icon={Bell} 
              title="All caught up" 
              description="No new notifications at the moment." 
            />
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-muted/30 transition-all relative group ${!notif.read ? 'bg-primary/[0.03]' : ''}`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-full" />
                )}
                
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border border-border/50 ${
                    notif.type === 'invite' ? 'bg-primary/10' :
                    notif.type === 'system' ? 'bg-amber-500/10' :
                    notif.type === 'billing' ? 'bg-blue-500/10' :
                    'bg-purple-500/10'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold text-foreground truncate">{notif.title}</p>
                      <span className="text-[10px] font-medium text-muted-foreground/40 whitespace-nowrap pt-0.5">
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Invite Actions */}
                    {notif.type === 'invite' && notif.data?.inviteId && (
                      <div className="flex gap-2 mt-3">
                        <AppButton variant="primary" size="xs" className="h-7" fullWidth onClick={() => acceptInvite(notif.data.inviteId)}>Accept</AppButton>
                        <AppButton variant="secondary" size="xs" className="h-7" fullWidth onClick={() => declineInvite(notif.data.inviteId)}>Decline</AppButton>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => clearNotification(notif.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-red-500/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-border bg-muted/10">
         <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 mx-auto py-1">
           View all history
           <ChevronRight size={12} />
         </button>
      </div>
    </div>
  );
}
