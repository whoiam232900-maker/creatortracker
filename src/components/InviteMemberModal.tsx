'use client';

import React, { useState } from 'react';
import { Mail, Shield, UserPlus, Info, Check } from 'lucide-react';
import AppModal from './ui/AppModal';
import AppInput from './ui/AppInput';
import AppTextarea from './ui/AppTextarea';
import AppButton from './ui/AppButton';
import { useWorkspace, WorkspaceRole } from '@/contexts/WorkspaceContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId }: InviteMemberModalProps) {
  const { inviteMember } = useWorkspace();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('Member');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await inviteMember(workspaceId, email, role, message);
    setIsSubmitting(false);
    onClose();
    setEmail('');
    setMessage('');
    setRole('Member');
  };

  const roles: { id: WorkspaceRole, title: string, desc: string }[] = [
    { id: 'Admin', title: 'Admin', desc: 'Full workspace control and member management.' },
    { id: 'Member', title: 'Member', desc: 'Standard data logging and analytics access.' },
    { id: 'Viewer', title: 'Viewer', desc: 'Read-only access for reporting and insights.' },
  ];

  return (
    <AppModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Invite team member"
      description="Add a new member to your workspace to start collaborating."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
        <AppInput 
          label="Email address" 
          icon={Mail} 
          required 
          type="email" 
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-muted-foreground/60 ml-0.5">Workspace role</label>
          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 group ${
                  role === r.id 
                    ? 'bg-primary/5 border-primary/50 shadow-sm' 
                    : 'bg-muted/10 border-border/50 hover:bg-muted/20 hover:border-border'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${role === r.id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border/40 text-muted-foreground'}`}>
                  <Shield size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold transition-colors ${role === r.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{r.title}</p>
                  <p className="text-[11px] text-muted-foreground/60 font-medium truncate mt-0.5">{r.desc}</p>
                </div>
                {role === r.id && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm animate-in zoom-in duration-300"><Check size={10} className="text-primary-foreground font-bold" /></div>}
              </button>
            ))}
          </div>
        </div>

        <AppTextarea 
          label="Optional message"
          placeholder="Hey, join our workspace..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
           <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Info size={14} />
           </div>
           <p className="text-[11px] text-blue-400/80 leading-relaxed font-medium italic">
             Members will receive an invitation email and must accept it to join.
           </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="ghost" size="md" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</AppButton>
          <AppButton 
            variant="primary" 
            size="md" 
            type="submit" 
            isLoading={isSubmitting}
            disabled={!email}
            icon={UserPlus}
          >
            Send invitation
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
