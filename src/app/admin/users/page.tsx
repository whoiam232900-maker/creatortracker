'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar,
  Shield,
  User,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Ban,
  RotateCcw,
  X,
  Loader2,
  Edit2
} from 'lucide-react';
import { getAllUsers, suspendUser, unsuspendUser, updateUserProfile } from '@/lib/admin-store';
import { showToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { formatDeterministic } from '@/lib/date-utils';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  plan: string;
  status: 'active' | 'suspended' | 'terminated';
  createdAt?: string;
  suspendedUntil?: string | null;
  [key: string]: any;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  // Suspend specific states
  const [suspendDuration, setSuspendDuration] = useState<number | null>(24);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Edit specific states
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'user' as 'user' | 'admin',
    plan: 'free',
    status: 'active' as 'active' | 'suspended' | 'terminated'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserData[]);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast({ type: 'error', title: 'Load Failed', description: 'Could not sync user directory.' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();

    // Get current user from session to prevent self-suspension
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      setCurrentUser(session);
    } catch (e) {}

    const handleUpdate = () => loadUsers();
    window.addEventListener('admin_users_updated', handleUpdate);
    return () => window.removeEventListener('admin_users_updated', handleUpdate);
  }, []);

  const handleSuspend = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await suspendUser(selectedUser.id, suspendDuration, suspendReason);
      showToast({ 
        type: 'success', 
        title: 'Account Suspended', 
        description: `${getDisplayName(selectedUser)} has been restricted.` 
      });
      setShowSuspendModal(false);
      setSelectedUser(null);
      setSuspendReason('');
    } catch (err) {
      showToast({ type: 'error', title: 'Action Failed', description: 'Could not suspend user.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsuspend = async (user: UserData) => {
    try {
      await unsuspendUser(user.id);
      showToast({ 
        type: 'success', 
        title: 'Access Restored', 
        description: `${getDisplayName(user)} is now active again.` 
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Action Failed', description: 'Could not unsuspend user.' });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await updateUserProfile(selectedUser.id, {
        full_name: editForm.fullName,
        role: editForm.role,
        plan: editForm.plan,
        status: editForm.status
      });
      showToast({ 
        type: 'success', 
        title: 'Profile Updated', 
        description: 'User changes have been saved.' 
      });
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      showToast({ 
        type: 'error', 
        title: 'Update Failed', 
        description: err.message || 'Could not update user profile.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      role: user.role,
      plan: user.plan.toLowerCase(),
      status: user.status
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(u => {
    const emailMatch = (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = (u?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return emailMatch || nameMatch;
  });

  const getUserInitial = (user: UserData) => {
    const name = user?.fullName || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = (user: UserData) => user?.fullName || user?.email?.split('@')[0] || 'User';

  const formatSuspensionTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'Permanent';
    return formatDeterministic(isoString, true);
  };

  const isSelf = (user: UserData) => user.email === currentUser?.email;
  const isAdmin = (user: UserData) => user.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
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
          <button 
            onClick={() => loadUsers()}
            className="p-2.5 bg-white/[0.02] border border-white/5 rounded-2xl text-muted-foreground/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <RotateCcw size={18} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden min-h-[400px] shadow-2xl">
        {isLoading && users.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Synchronizing user directory...</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">User Identity</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Privileges</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">Joined</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.email} className="group hover:bg-white/[0.01] transition-colors border-b border-white/[0.02] last:border-0">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-bold shadow-inner relative">
                          {getUserInitial(user)}
                          {isSelf(user) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                          )}
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
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest w-fit ${
                          user.status === 'terminated' 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : user.status === 'suspended'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {user.status === 'active' ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                          {user.status}
                        </span>
                        {user.status === 'suspended' && (
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40 font-medium ml-1">
                            <Clock size={8} />
                            Until {formatSuspensionTime(user.suspendedUntil)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40 font-medium">
                        <Calendar size={12} />
                        {user?.createdAt ? formatDeterministic(user.createdAt) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 'suspended' ? (
                          <button 
                            onClick={() => handleUnsuspend(user)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all border border-emerald-500/10"
                            title="Restore access immediately"
                          >
                            <ShieldCheck size={12} />
                            Unsuspend
                          </button>
                        ) : (
                          user.status !== 'terminated' && !isSelf(user) && !isAdmin(user) ? (
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendModal(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/5 text-amber-500/60 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/10 transition-all border border-amber-500/10"
                              title="Restrict account access"
                            >
                              <Ban size={12} />
                              Suspend
                            </button>
                          ) : null
                        )}
                        
                        {!isSelf(user) && !isAdmin(user) ? (
                          <button 
                            onClick={() => openEditModal(user)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10"
                            title="Edit user profile and settings"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                        ) : isSelf(user) ? (
                          <div className="px-3 py-1.5 text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">
                            Current Session
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 text-[9px] font-bold text-amber-500/40 uppercase tracking-widest flex items-center gap-1.5" title="Administrative accounts cannot be modified via the console.">
                            <Shield size={10} />
                            Protected Account
                          </div>
                        )}
                        
                        <button className="p-2 rounded-xl text-muted-foreground/20 hover:text-white hover:bg-white/5 transition-all">
                          <MoreVertical size={16} strokeWidth={1.5} />
                        </button>
                      </div>
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
          </>
        )}
      </div>

      {/* Suspend Modal */}
      <ConfirmModal
        open={showSuspendModal}
        title="Restrict Account Access"
        description={`Configure review period and restriction details for ${selectedUser ? getDisplayName(selectedUser) : 'this user'}.`}
        confirmLabel="Confirm Suspension"
        variant="danger"
        onConfirm={handleSuspend}
        onCancel={() => {
          setShowSuspendModal(false);
          setSelectedUser(null);
          setSuspendReason('');
        }}
        loading={isProcessing}
        disabled={isProcessing}
      >
        <div className="mt-6 space-y-6">
          {/* User Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
               {selectedUser ? getUserInitial(selectedUser) : 'U'}
             </div>
             <div>
               <p className="text-sm font-bold text-white/90">{selectedUser ? getDisplayName(selectedUser) : 'User'}</p>
               <p className="text-xs text-muted-foreground/40">{selectedUser?.email}</p>
             </div>
          </div>

          {/* Duration Options */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Restriction Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '1 Hour', value: 1 },
                { label: '24 Hours', value: 24 },
                { label: '7 Days', value: 168 },
                { label: '30 Days', value: 720 },
                { label: 'Indefinite', value: null }
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSuspendDuration(opt.value)}
                  className={`px-4 py-3 rounded-xl text-[11px] font-bold transition-all border ${
                    suspendDuration === opt.value 
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                      : 'bg-white/[0.02] border-white/5 text-muted-foreground/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Reason for Suspension</label>
            <textarea
              placeholder="Provide context for this administrative action..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-500/40 min-h-[100px] transition-all"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <ShieldAlert size={16} className="text-amber-500/60 shrink-0" />
            <p className="text-[10px] text-amber-500/60 leading-relaxed font-medium">
              Suspended users will be immediately signed out and blocked from accessing any dashboard features until the restriction period expires.
            </p>
          </div>
        </div>
      </ConfirmModal>

      {/* Edit User Modal */}
      <ConfirmModal
        open={showEditModal}
        title="Edit User Profile"
        description={`Modify account settings and privileges for ${selectedUser ? getDisplayName(selectedUser) : 'this user'}.`}
        confirmLabel="Save Changes"
        onConfirm={handleUpdateUser}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        loading={isProcessing}
        disabled={isProcessing}
      >
        <div className="mt-6 space-y-5">
           {/* Full Name */}
           <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Full Name</label>
            <input 
              type="text"
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40 transition-all"
              value={editForm.fullName}
              onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          {/* Role & Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Account Role</label>
              <select
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as any }))}
              >
                <option value="user" className="bg-[#0a0a0a]">Standard User</option>
                <option value="admin" className="bg-[#0a0a0a]">System Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Subscription Plan</label>
              <select
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
                value={editForm.plan}
                onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value as any }))}
              >
                <option value="free" className="bg-[#0a0a0a]">Free Plan</option>
                <option value="pro" className="bg-[#0a0a0a]">Pro Creator</option>
                <option value="studio" className="bg-[#0a0a0a]">Studio Agency</option>
              </select>
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Account Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'suspended', 'terminated'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setEditForm(prev => ({ ...prev, status: status }))}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    editForm.status === status 
                      ? status === 'active' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' 
                        : status === 'suspended' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                        : 'bg-red-500/10 border-red-500/40 text-red-500'
                      : 'bg-white/[0.02] border-white/5 text-muted-foreground/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {editForm.status === 'suspended' && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Note</span>
              </div>
              <p className="text-[10px] text-amber-500/60 leading-relaxed font-medium">
                To manage suspension duration and reasons, please use the dedicated "Suspend" button in the directory for automated calculations.
              </p>
            </div>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}

