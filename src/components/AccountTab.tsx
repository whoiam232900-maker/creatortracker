'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { showToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  User, 
  Mail, 
  Lock, 
  Monitor, 
  LogOut, 
  Trash2, 
  Camera, 
  Check, 
  Loader2,
  Globe,
  Smartphone,
  ShieldCheck,
  Fingerprint,
  Clock,
  Key,
  ShieldAlert,
  Activity,
  QrCode,
  Shield,
  Eye,
  EyeOff,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  FileLock,
  Database
} from 'lucide-react';

// --- Types ---

interface SecurityAlert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  time: string;
}

interface ConnectedAccount {
  provider: 'google' | 'discord';
  connected: boolean;
  email?: string;
  name?: string;
  connectedAt?: string;
}

// --- Stable Sub-components ---

interface SecurityCardProps {
  id: string;
  icon: any;
  title: string;
  description: string;
  status?: string;
  actionLabel: string;
  action: () => void;
  isExpanded: boolean;
  children?: React.ReactNode;
  loading?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

const SecurityCard = memo(({ 
  id, icon: Icon, title, description, status, actionLabel, action, isExpanded, children, loading = false, danger = false, disabled = false 
}: SecurityCardProps) => {
  return (
    <div className={`card bg-white/[0.01] border-white/[0.05] transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-1 ring-primary/20 bg-white/[0.02]' : 'hover:border-white/[0.08]'} ${disabled ? 'opacity-50 grayscale-[0.5]' : ''}`}>
      <div className="p-4 flex items-start gap-4">
        <div className={`p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex-shrink-0 ${danger ? 'text-red-500/70' : 'text-muted-foreground/60'}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className="text-[12px] font-bold text-foreground/90">{title}</h4>
            {status && (
              <span className={`text-[9px] font-bold uppercase tracking-wider ${status.includes('Active') || status.includes('Verified') || status.includes('today') ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                {status}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed mb-3">{description}</p>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); action(); }}
            disabled={loading || disabled}
            className={`w-full py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
              danger 
                ? 'bg-red-500/5 text-red-500/60 hover:bg-red-500/10' 
                : 'bg-white/[0.03] text-foreground/60 hover:bg-white/[0.05]'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 size={10} className="animate-spin mx-auto" /> : actionLabel}
          </button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
         <div className="px-4 pb-4 border-t border-white/[0.05] pt-4">
            {children}
         </div>
      </div>
    </div>
  );
});

SecurityCard.displayName = 'SecurityCard';

// --- Main Component ---

export default function AccountTab() {
  const [user, setUser] = useState({
    username: 'User',
    email: 'user@example.com',
    avatar: '',
    verified: false,
    passwordLastChanged: null as string | null,
    twoFactorEnabled: false,
    role: 'user'
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const [activeSecuritySection, setActiveSecuritySection] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isEditProfileMode, setIsEditProfileMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  const [twoFactorStep, setTwoFactorStep] = useState<'closed' | 'confirm-password' | 'qr-code' | 'verify-code'>('closed');
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);

  const [disconnectTarget, setDisconnectProvider] = useState<'google' | 'discord' | null>(null);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  // Account Termination States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        const initialUser = {
          username: session.username || session.email?.split('@')[0] || 'User',
          email: session.email || 'user@example.com',
          avatar: session.avatar || '',
          verified: session.verified === true,
          passwordLastChanged: session.passwordLastChanged || null,
          twoFactorEnabled: session.twoFactorEnabled === true
        };
        setUser(initialUser);
        setEditUsername(initialUser.username);
      }
      const savedAlerts = localStorage.getItem('security_alerts_v3');
      if (savedAlerts) setSecurityAlerts(JSON.parse(savedAlerts));
    } catch (e) {}
  }, []);

  const persistUser = (updates: Partial<typeof user>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      const raw = localStorage.getItem('userSession');
      if (raw) {
        const session = JSON.parse(raw);
        localStorage.setItem('userSession', JSON.stringify({ ...session, ...updates }));
      }
    } catch (e) {}
  };

  const addAlert = (message: string, type: 'info' | 'warning' | 'success') => {
    const newAlert: SecurityAlert = { id: Date.now().toString(), message, type, time: 'Just now' };
    const updated = [newAlert, ...securityAlerts].slice(0, 3);
    setSecurityAlerts(updated);
    localStorage.setItem('security_alerts_v3', JSON.stringify(updated));
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim()) return;
    setIsUpdatingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    persistUser({ username: editUsername });
    showToast({ type: 'success', title: 'Profile Updated', description: 'Changes saved successfully.' });
    setIsUpdatingProfile(false);
    setIsEditProfileMode(false);
  };

  const handleVerifyEmail = async () => {
    setIsVerifyingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    showToast({ 
      type: 'info', 
      title: 'Verification Sent', 
      description: 'Verification link sent successfully to ' + user.email 
    });
    setIsVerifyingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new.length < 8) {
      showToast({ type: 'error', title: 'Password Too Short', description: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast({ type: 'error', title: 'Mismatch', description: 'New passwords do not match.' });
      return;
    }
    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const usersRaw = localStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (!users[user.email] || users[user.email].password !== passwordForm.current) {
        showToast({ type: 'error', title: 'Auth Failed', description: 'Current password is incorrect.' });
        setIsUpdatingPassword(false);
        return;
      }
      users[user.email].password = passwordForm.new;
      localStorage.setItem('users', JSON.stringify(users));
      const now = new Date().toISOString();
      persistUser({ passwordLastChanged: now });
      addAlert('Password updated successfully', 'success');
      showToast({ type: 'success', title: 'Security Updated', description: 'Your new password is now active.' });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setActiveSecuritySection(null);
    } catch (err) {
      showToast({ type: 'error', title: 'System Error', description: 'Unable to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const start2FASetup = () => {
    if (!user.verified) {
      showToast({ type: 'warning', title: 'Action Required', description: 'Please verify your email before enabling 2FA.' });
      return;
    }
    setTwoFactorStep('confirm-password');
  };

  const handle2FAPasswordConfirm = async () => {
    setIsTwoFactorLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsTwoFactorLoading(false);
    setTwoFactorStep('qr-code');
  };

  const handle2FACodeVerify = async () => {
    if (twoFactorCode.length < 6) return;
    setIsTwoFactorLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    persistUser({ twoFactorEnabled: true });
    addAlert('2FA enabled', 'success');
    showToast({ type: 'success', title: '2FA Enabled', description: 'Your account is now protected.' });
    setIsTwoFactorLoading(false);
    setTwoFactorStep('closed');
    setTwoFactorCode('');
    setTwoFactorPassword('');
  };

  const disable2FA = async () => {
    setIsTwoFactorLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    persistUser({ twoFactorEnabled: false });
    addAlert('2FA disabled', 'warning');
    showToast({ type: 'warning', title: '2FA Disabled', description: 'Security level decreased.' });
    setIsTwoFactorLoading(false);
    setShowDisable2FAConfirm(false);
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    setIsDisconnecting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    showToast({ type: 'info', title: 'Account Unlinked', description: `${disconnectTarget} has been disconnected.` });
    setIsDisconnecting(false);
    setDisconnectProvider(null);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        persistUser({ avatar: reader.result as string });
        showToast({ type: 'success', title: 'Avatar Applied', description: 'Profile picture updated.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    localStorage.clear();
    window.location.href = '/auth';
  };

  const getTimeAgo = (isoDate: string | null) => {
    if (!isoDate) return null;
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-10 pb-10 fade-in max-w-4xl">
      {/* 1. Header & Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.01] border border-white/[0.05] overflow-hidden group-hover:border-primary/20 transition-all flex items-center justify-center">
              {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={24} className="text-muted-foreground/20" />}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"><Camera size={10} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {isEditProfileMode ? (
                <div className="flex items-center gap-2">
                  <input autoFocus className="bg-transparent border-b border-primary/50 text-lg font-bold outline-none text-foreground w-32" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
                  <button type="button" onClick={handleUpdateProfile} disabled={isUpdatingProfile} className="p-1 text-primary hover:bg-primary/10 rounded">{isUpdatingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                  <button type="button" onClick={() => { setIsEditProfileMode(false); setEditUsername(user.username); }} className="p-1 text-muted-foreground hover:bg-white/5 rounded"><Trash2 size={12} /></button>
                </div>
              ) : (
                <>
                  <h1 className="text-lg font-bold text-foreground/90">{user.username}</h1>
                  <div className={`px-1.5 py-0.5 rounded font-bold text-[8px] uppercase tracking-wider flex items-center gap-1 ${user.verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {user.verified ? <><Check size={8} strokeWidth={4} /> Verified</> : 'Pending Verification'}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground/50 font-medium">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!user.verified && <button type="button" onClick={handleVerifyEmail} disabled={isVerifyingEmail} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-amber-500/5 text-amber-500/80 border border-amber-500/10 hover:bg-amber-500/10 transition-all">{isVerifyingEmail ? <Loader2 size={12} className="animate-spin" /> : 'Verify Email'}</button>}
          <button type="button" onClick={() => setIsEditProfileMode(!isEditProfileMode)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border border-white/[0.05] transition-all ${isEditProfileMode ? 'bg-white/10' : 'text-muted-foreground/60 hover:bg-white/[0.02]'}`}>{isEditProfileMode ? 'Discard Changes' : 'Edit Profile'}</button>
        </div>
      </div>

      {/* 2. Security Activity */}
      {securityAlerts.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 px-1 flex items-center gap-2"><Activity size={10} /> Security Activity</h3>
          <div className="card divide-y divide-white/[0.03] border-white/[0.05] bg-white/[0.005]">
            {securityAlerts.map(alert => (
              <div key={alert.id} className="p-3 flex items-center gap-4 group hover:bg-white/[0.005] transition-colors">
                <div className={`w-1 h-1 rounded-full ${alert.type === 'success' ? 'bg-emerald-500/40' : alert.type === 'warning' ? 'bg-amber-500/40' : 'bg-primary/40'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground/70">{alert.message}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/20 font-bold uppercase">{alert.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Security Settings */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 px-1 flex items-center gap-2"><Lock size={10} /> Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SecurityCard id="password" icon={Key} title="Password" description="Maintain a strong, unique password for access." status={user.passwordLastChanged ? `Changed ${getTimeAgo(user.passwordLastChanged)}` : 'Never changed'} actionLabel={activeSecuritySection === 'password' ? 'Close' : 'Change'} isExpanded={activeSecuritySection === 'password'} action={() => setActiveSecuritySection(activeSecuritySection === 'password' ? null : 'password')}>
             <form onSubmit={handleUpdatePassword} className="space-y-3">
                <input type="password" autoFocus placeholder="Current password" className="input-field py-1.5 text-[11px] bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.05] outline-none w-full" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="password" placeholder="New password" className="input-field py-1.5 text-[11px] bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.05] outline-none" value={passwordForm.new} onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))} required />
                  <input type="password" placeholder="Confirm" className="input-field py-1.5 text-[11px] bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.05] outline-none" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <button type="submit" disabled={isUpdatingPassword} className="btn-primary px-3 py-1 text-[9px] font-bold w-full h-8 flex items-center justify-center">{isUpdatingPassword ? <Loader2 size={10} className="animate-spin" /> : 'Confirm Password Update'}</button>
             </form>
          </SecurityCard>

          <SecurityCard id="2fa" icon={Fingerprint} title="Two-Factor Auth" description="Enhanced layer of security for your account." status={user.twoFactorEnabled ? 'Active' : 'Not enabled'} actionLabel={user.twoFactorEnabled ? 'Disable' : 'Enable'} isExpanded={false} action={() => user.twoFactorEnabled ? setShowDisable2FAConfirm(true) : start2FASetup()} />
          <SecurityCard id="email" icon={Mail} title="Email Address" description="Primary address for recovery and security alerts." status={user.verified ? 'Verified' : 'Unverified'} actionLabel="Update" isExpanded={false} action={() => showToast({ type: 'info', title: 'Feature Coming', description: 'Email changes disabled for demo.' })} />
          <SecurityCard id="protection" icon={ShieldCheck} title="Account Protection" description="Encrypted authentication and secure sessions." actionLabel="Security Info" isExpanded={false} action={() => showToast({ type: 'info', title: 'System Secure', description: 'Authentication is encrypted and session tokens are rotated.' })} />
        </div>
      </section>

      {/* 4. Session Management */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 flex items-center gap-2 px-1"><Monitor size={10} /> Session Management</h3>
        <div className="card p-3.5 flex items-center gap-4 bg-white/[0.005] border-white/[0.05]">
          <div className="p-2 rounded-xl bg-primary/5 text-primary/70 ring-1 ring-primary/10"><Monitor size={14} /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5"><span className="text-[11px] font-bold text-foreground/80">Current Session</span><span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[7px] uppercase tracking-tighter">Active Now</span></div>
            <p className="text-[10px] text-muted-foreground/30 font-medium">This device is currently active and secure.</p>
          </div>
        </div>
      </section>

      {/* 5. Linked Accounts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 flex items-center gap-2"><Globe size={10} /> Linked Accounts</h3>
          <span className="text-[9px] font-medium text-muted-foreground/20">Official integration coming soon</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4 bg-white/[0.005] border-white/[0.05] opacity-50 flex items-center gap-4 grayscale-[0.5]">
             <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-muted-foreground/30"><Globe size={16} /></div>
             <div className="flex-1">
                <h4 className="text-[11px] font-bold text-foreground/70">Google Integration</h4>
                <p className="text-[9px] text-muted-foreground/30">Connect for secure sign-in.</p>
             </div>
             <div className="px-2 py-1 rounded bg-white/5 text-muted-foreground/40 text-[8px] font-bold uppercase tracking-widest">Coming Soon</div>
          </div>
          <div className="card p-4 bg-white/[0.005] border-white/[0.05] opacity-50 flex items-center gap-4 grayscale-[0.5]">
             <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-muted-foreground/30"><div className="w-[16px] h-[16px] flex items-center justify-center font-bold text-[10px]">D</div></div>
             <div className="flex-1">
                <h4 className="text-[11px] font-bold text-foreground/70">Discord Integration</h4>
                <p className="text-[9px] text-muted-foreground/30">Sync your creator profile.</p>
             </div>
             <div className="px-2 py-1 rounded bg-white/5 text-muted-foreground/40 text-[8px] font-bold uppercase tracking-widest">Coming Soon</div>
          </div>
        </div>
      </section>

      {/* 6. Danger Zone */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/30 px-1 flex items-center gap-2"><ShieldAlert size={10} /> Danger Zone</h3>
        <div className="card overflow-hidden border-red-500/10 bg-red-500/[0.005]">
          <div className="p-3.5 flex items-center justify-between group hover:bg-red-500/[0.01] transition-colors">
            <div className="space-y-0.5"><h4 className="text-[11px] font-bold text-foreground/70 group-hover:text-red-500/70 transition-colors">Delete Account</h4><p className="text-[10px] text-muted-foreground/30 leading-relaxed">Permanently erase identity and tracking history.</p></div>
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1 rounded-lg bg-red-500/5 text-red-500/50 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all">Terminate</button>
          </div>
        </div>
      </section>

      {/* Modals */}

      <ConfirmModal open={twoFactorStep !== 'closed'} title="Enable Two-Factor Auth" description="Add an extra layer of security to your account." confirmLabel={twoFactorStep === 'confirm-password' ? 'Verify Password' : twoFactorStep === 'qr-code' ? 'Code Received' : 'Enable 2FA'} onConfirm={() => { if (twoFactorStep === 'confirm-password') handle2FAPasswordConfirm(); else if (twoFactorStep === 'qr-code') setTwoFactorStep('verify-code'); else handle2FACodeVerify(); }} onCancel={() => { setTwoFactorStep('closed'); setTwoFactorCode(''); setTwoFactorPassword(''); }} disabled={isTwoFactorLoading || (twoFactorStep === 'verify-code' && twoFactorCode.length < 6)} loading={isTwoFactorLoading}>
        <div className="mt-4 space-y-4 text-left">
          {twoFactorStep === 'confirm-password' && <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Verify identity with password</label><input type="password" placeholder="••••••••" className="input-field py-2 text-sm" value={twoFactorPassword} onChange={e => setTwoFactorPassword(e.target.value)} /></div>}
          {twoFactorStep === 'qr-code' && <div className="flex flex-col items-center gap-4 py-2"><div className="p-4 bg-white rounded-2xl shadow-xl"><QrCode size={140} className="text-zinc-900" /></div><p className="text-[11px] text-muted-foreground text-center px-4">Scan this QR code with your authenticator app.</p></div>}
          {twoFactorStep === 'verify-code' && <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Enter 6-digit code</label><input maxLength={6} placeholder="000000" className="input-field py-3 text-center text-xl tracking-[0.5em] font-bold" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} /></div>}
        </div>
      </ConfirmModal>

      <ConfirmModal open={showDisable2FAConfirm} title="Disable 2FA?" description="Your account will be less secure. Are you sure you want to proceed?" confirmLabel="Disable 2FA" variant="danger" onConfirm={disable2FA} onCancel={() => setShowDisable2FAConfirm(false)} loading={isTwoFactorLoading} />

      <ConfirmModal open={!!disconnectTarget} title={`Disconnect ${disconnectTarget?.charAt(0).toUpperCase()}${disconnectTarget?.slice(1)}?`} description={`You will no longer be able to use your ${disconnectTarget} account to sign in to CreatorTracker.`} confirmLabel="Disconnect Account" variant="danger" onConfirm={handleDisconnect} onCancel={() => setDisconnectProvider(null)} loading={isDisconnecting} />

      <ConfirmModal open={showDeleteConfirm} title="Account Termination" description="This action is irreversible. All tracking data and history will be purged." confirmLabel="Confirm Termination" variant="danger" onConfirm={handleDeleteAccount} onCancel={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
        <div className="mt-4 space-y-2 text-left"><label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Password Verification</label><input type="password" className="input-field py-1.5 text-xs w-full bg-white/[0.02] border-white/[0.05]" placeholder="Enter password to confirm" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /></div>
      </ConfirmModal>
    </div>
  );
}
