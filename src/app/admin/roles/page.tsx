'use client';

import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  UserPlus, 
  MoreVertical,
  Search,
  Key,
  Eye,
  Activity
} from 'lucide-react';
import { getAllUsers } from '@/lib/admin-store';

export default function AccessControl() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdmins() {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers();
        setAdmins(allUsers.filter((u: any) => u.role === 'admin'));
      } catch (err) {
        console.error('Failed to load admins:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdmins();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Lock size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Security Protocol</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground/60 text-sm">
            Manage administrative privileges and monitor operational access.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[13px] font-bold hover:bg-white/10 transition-all active:scale-95">
          <UserPlus size={16} />
          Provision Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin List */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 flex items-center gap-2 px-2">
            <ShieldCheck size={12} />
            Authorized Personnel
          </p>
          <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden min-h-[200px]">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Verifying access protocols...</p>
              </div>
            ) : (
              <>
                {admins.map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]">
                        {admin.fullName.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-[14px] font-bold text-white/90">{admin.fullName}</h4>
                        <p className="text-[11px] text-muted-foreground/40 font-medium">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Full Access</p>
                        <p className="text-[10px] text-muted-foreground/30 font-medium">Provisioned {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <button className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground/20 hover:text-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {admins.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                    <ShieldCheck size={40} strokeWidth={1} />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">No admin records found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Security Summary */}
        <div className="space-y-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40">Security Status</h3>
            
            <div className="space-y-4">
              <SecurityMetric label="Role Based Access" value="Active" status="nominal" icon={ShieldCheck} />
              <SecurityMetric label="Session Hardening" value="Enabled" status="nominal" icon={Key} />
              <SecurityMetric label="Audit Logging" value="Tracking" status="nominal" icon={Activity} />
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={16} />
              <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
                Administrative actions are logged and immutable. Ensure security protocols are followed when provisioning new accounts.
              </p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40">Audit Trail</h3>
            <div className="space-y-4 opacity-40">
              <AuditItem action="Login" user="Admin Control" time="2 mins ago" />
              <AuditItem action="Code Generated" user="Admin Control" time="15 mins ago" />
              <AuditItem action="Plan Updated" user="Admin Control" time="1 hour ago" />
            </div>
            <button className="w-full py-3 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-white hover:bg-white/5 transition-all">
              View Extended Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityMetric({ label, value, status, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
      <div className="flex items-center gap-3">
        <Icon size={14} className="text-muted-foreground/40" />
        <span className="text-[11px] font-medium text-muted-foreground/60">{label}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'nominal' ? 'text-emerald-500' : 'text-amber-500'}`}>
        {value}
      </span>
    </div>
  );
}

function AuditItem({ action, user, time }: any) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold text-white/80">{action}</p>
        <p className="text-[10px] text-muted-foreground/40">{user}</p>
      </div>
      <span className="text-[9px] font-medium text-muted-foreground/20 uppercase whitespace-nowrap">{time}</span>
    </div>
  );
}
