'use client';

import React, { useState } from 'react';
import { 
  Building, Camera, UserPlus, Trash2, Globe, 
  Lock, LogOut, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { useWorkspace, WorkspaceRole } from '@/contexts/WorkspaceContext';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import AppSwitch from '@/components/ui/AppSwitch';
import AppSelect from '@/components/ui/AppSelect';
import AppBadge from '@/components/ui/AppBadge';
import SettingsSection from './SettingsSection';
import InviteMemberModal from '@/components/InviteMemberModal';

export default function WorkspaceTab() {
  const { 
    activeWorkspace, updateWorkspace, deleteWorkspace, 
    removeMember, updateMemberRole, currentUserRole 
  } = useWorkspace();
  
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [wsDesc, setWsDesc] = useState(activeWorkspace?.description || '');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!activeWorkspace) return null;

  const canEdit = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  const handleSave = async () => {
    await updateWorkspace(activeWorkspace.id, { name: wsName, description: wsDesc });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace</h1>
        <p className="text-muted-foreground text-base">Manage team, branding, and visibility.</p>
      </div>

      {/* Overview */}
      <SettingsSection>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative">
            <div className="w-24 h-24 rounded-[28px] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl overflow-hidden shadow-inner">
              {activeWorkspace.icon || activeWorkspace.name.substring(0, 1).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{activeWorkspace.name}</h2>
              <AppBadge variant="default">
                {activeWorkspace.plan} Plan
              </AppBadge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-semibold">{activeWorkspace.createdAt ? new Date(activeWorkspace.createdAt).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Members</p>
                <p className="text-sm font-semibold">{(activeWorkspace.members || []).length} Active</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-semibold">Operational</p>
                </div>
              </div>
            </div>

            <AppButton onClick={handleSave} disabled={!canEdit} size="sm">Save Changes</AppButton>
          </div>
        </div>
      </SettingsSection>

      {/* Members */}
      <SettingsSection title="Team Members">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-muted-foreground italic">Manage who has access to this workspace.</p>
          <AppButton variant="outline" size="xs" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)}>Add Member</AppButton>
        </div>

        <div className="bg-muted/20 border border-border/30 rounded-3xl overflow-hidden divide-y divide-border/20">
          {activeWorkspace.members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-5 group hover:bg-white/[0.01] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/10 relative">
                {m.avatar || m.name.substring(0, 2).toUpperCase()}
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${m.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold truncate">{m.name}</h4>
                  <AppBadge variant="neutral" className="text-[9px]">
                    {m.role}
                  </AppBadge>
                </div>
                <p className="text-xs text-muted-foreground truncate opacity-60">{m.email}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit && m.role !== 'Owner' && (
                  <>
                    <select 
                      defaultValue={m.role}
                      onChange={(e) => updateMemberRole(activeWorkspace.id, m.id, e.target.value as WorkspaceRole)}
                      className="bg-muted/40 border border-border/40 text-[9px] font-bold uppercase rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-muted/60"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button onClick={() => removeMember(activeWorkspace.id, m.id)} className="p-2 rounded-lg bg-red-500/5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Customization */}
      <SettingsSection title="Customization">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AppInput label="Workspace Name" value={wsName} onChange={(e) => setWsName(e.target.value)} />
          <AppInput label="Description" value={wsDesc} onChange={(e) => setWsDesc(e.target.value)} placeholder="Workspace purpose..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-2xl px-5 py-4">
             <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center">
                  {activeWorkspace.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                </div>
                <div>
                   <span className="text-xs font-bold text-foreground">{activeWorkspace.isPublic ? 'Public' : 'Private'}</span>
                   <p className="text-[10px]">Visible to other users.</p>
                </div>
             </div>
             <AppSwitch checked={activeWorkspace.isPublic || false} onChange={(v) => updateWorkspace(activeWorkspace.id, { isPublic: v })} />
          </div>
          <div className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-2xl px-5 py-4 group">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: activeWorkspace.accentColor || '#2563EB' }} />
                <div>
                   <span className="text-xs font-bold text-foreground">Accent Color</span>
                   <p className="text-[10px] text-muted-foreground">Workspace branding.</p>
                </div>
             </div>
             <AppButton variant="ghost" size="xs">Change</AppButton>
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        <div className="divide-y divide-red-500/10 -mx-8 -my-8">
          <div className="flex items-center justify-between p-8 hover:bg-red-500/[0.02] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-red-500 transition-colors border border-border/30">
                <LogOut size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Leave Workspace</p>
                <p className="text-[10px] text-muted-foreground">You will lose access to shared data.</p>
              </div>
            </div>
            <AppButton variant="outline" size="sm" className="border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white hover:border-red-500">Leave</AppButton>
          </div>

          <div className="flex items-center justify-between p-8 bg-red-500/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">Delete Workspace</p>
                <p className="text-[10px] text-red-500/60">Permanently remove all associated data.</p>
              </div>
            </div>
            {!isDeleting ? (
              <AppButton variant="danger" size="sm" onClick={() => setIsDeleting(true)}>Delete</AppButton>
            ) : (
              <div className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                <AppButton variant="danger" size="sm" onClick={() => deleteWorkspace(activeWorkspace.id)}>Confirm</AppButton>
                <AppButton variant="ghost" size="sm" onClick={() => setIsDeleting(false)}>Cancel</AppButton>
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={activeWorkspace.id}
      />
    </div>
  );
}
