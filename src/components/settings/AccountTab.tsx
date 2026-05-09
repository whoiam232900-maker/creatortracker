'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import AppInput from '@/components/ui/AppInput';
import AppButton from '@/components/ui/AppButton';
import SettingsSection from './SettingsSection';

export default function AccountTab() {
  const { user, updateUser } = useUser();

  if (!user) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account</h1>
        <p className="text-muted-foreground text-base">Manage your personal profile and account settings.</p>
      </div>

      <SettingsSection title="Personal Info">
        <div className="flex items-center gap-6 pb-8 border-b border-white/[0.03]">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/20 transition-transform group-hover:scale-105">
              {user.avatar || user.name.substring(0, 2).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg border border-white/10 hover:scale-110 transition-transform">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="font-bold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-1">Profile photo should be at least 400x400px.</p>
            <div className="flex gap-2 mt-4">
              <AppButton variant="secondary" size="xs">Change Photo</AppButton>
              <AppButton variant="ghost" size="xs" className="text-red-500/80 hover:bg-red-500/10">Remove</AppButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppInput 
            label="Display Name" 
            defaultValue={user.name}
            onChange={(e) => updateUser({ name: e.target.value })}
          />
          <AppInput 
            label="Email Address" 
            value={user.email} 
            disabled 
            helperText="Email cannot be changed."
          />
        </div>
      </SettingsSection>
    </div>
  );
}
