'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar,
  Shield,
  User,
  ArrowRight
} from 'lucide-react';
import { getAllUsers } from '@/lib/admin-store';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const filteredUsers = users.filter(u => {
    const emailMatch = (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = (u?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return emailMatch || nameMatch;
  });

  const getUserInitial = (user: any) => {
    const name = user?.fullName || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: any) => user?.fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Users size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Directory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground/60 text-sm">
            Inspect account details, manage roles, and monitor user acquisition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by email or name..."
              className="bg-white/[0.02] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs w-64 focus:outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white/[0.02] border border-white/5 rounded-2xl text-muted-foreground/40 hover:text-white hover:bg-white/5 transition-all">
            <Filter size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">User Identity</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Privileges</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Plan Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Joined</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.email} className="group hover:bg-white/[0.01] transition-colors border-b border-white/[0.02] last:border-0">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-bold shadow-inner">
                      {getUserInitial(user)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white/90">{getDisplayName(user)}</span>
                      <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1">
                        <Mail size={10} />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    user.role === 'admin' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'bg-white/5 text-muted-foreground/40 border border-white/5'
                  }`}>
                    <Shield size={10} />
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      user.plan === 'Studio' ? 'bg-purple-500' : 
                      user.plan === 'Pro' ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`} />
                    <span className="text-xs font-semibold text-white/70">{user.plan}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40 font-medium">
                    <Calendar size={12} />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 rounded-xl text-muted-foreground/20 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100">
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
            <User size={40} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">No operational records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
