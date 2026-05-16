'use client';

import React from 'react';
import { AlertTriangle, XCircle, Trash2, ShieldAlert } from 'lucide-react';
import { RedeemCode } from '@/lib/admin-store';

interface DeleteCodeModalProps {
  code: RedeemCode;
  onClose: () => void;
  onDeleteOnly: (id: string) => void;
  onDeleteAndRevoke: (id: string, plan: 'pro' | 'studio') => void;
  isSubmitting: boolean;
}

export default function DeleteCodeModal({
  code,
  onClose,
  onDeleteOnly,
  onDeleteAndRevoke,
  isSubmitting
}: DeleteCodeModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] scale-in duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Delete operational code?</h2>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">High Severity Action</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-xl transition-colors" 
            disabled={isSubmitting}
          >
            <XCircle size={20} className="text-muted-foreground/40" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Code Info Card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Identifier</span>
              <span className="font-mono font-bold text-primary">{code.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Plan Level</span>
              <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-lg uppercase tracking-wider">{code.plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Current Usage</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-white">{code.usedCount}</span>
                <span className="text-[10px] font-bold text-muted-foreground/20">/ {code.maxUses}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 text-amber-500/80 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Deleting this code prevents future redemptions. Existing users keep access unless you revoke it.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={() => onDeleteAndRevoke(code.id, code.plan)}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl text-[13px] font-bold text-red-500 transition-all flex items-center justify-center gap-2 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  Delete + Revoke Access
                </>
              )}
            </button>
            
            <button 
              onClick={() => onDeleteOnly(code.id)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[13px] font-bold text-white transition-all flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              Delete Code Only
            </button>

            <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl text-[13px] font-bold text-muted-foreground/40 hover:text-white transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
