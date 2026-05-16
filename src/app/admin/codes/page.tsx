'use client';

import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Trash2, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronDown,
  Sparkles,
  RefreshCcw,
  Calendar
} from 'lucide-react';
import { 
  getRedeemCodes, 
  generateRedeemCode, 
  toggleCodeStatus, 
  deleteRedeemCode,
  RedeemCode,
  PlanType
} from '@/lib/admin-store';
import { showToast } from '@/components/ui/Toast';

export default function RedeemCodeManagement() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newCode, setNewCode] = useState({
    code: '',
    planType: 'Pro' as PlanType,
    maxUses: 100,
    expiresAt: '',
    notes: ''
  });

  useEffect(() => {
    setCodes(getRedeemCodes());

    const handleUpdate = () => {
      setCodes(getRedeemCodes());
    };

    window.addEventListener('admin_codes_updated', handleUpdate);
    return () => window.removeEventListener('admin_codes_updated', handleUpdate);
  }, []);

  const refreshCodes = () => setCodes(getRedeemCodes());

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    generateRedeemCode({
      code: newCode.code,
      planType: newCode.planType,
      maxUses: newCode.maxUses,
      expiresAt: newCode.expiresAt || null,
      isActive: true,
      notes: newCode.notes
    });
    setIsModalOpen(false);
    setNewCode({ code: '', planType: 'Pro', maxUses: 100, expiresAt: '', notes: '' });
    refreshCodes();
    showToast({ type: 'success', title: 'Code Generated', description: `Successfully created ${newCode.code}` });
  };

  const suggestCode = () => {
    const prefix = newCode.planType.toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setNewCode({ ...newCode, code: `${prefix}_${random}_2026` });
  };

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Ticket size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Access Tokens</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Redeem Systems</h1>
          <p className="text-muted-foreground/60 text-sm">
            Generate secure promotional codes for Pro and Studio plan upgrades.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 btn-secondary hover-lift px-6 py-3 rounded-2xl text-[13px] font-bold shadow-sm active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create New Code
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search codes or notes..."
            className="bg-white/[0.02] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs w-full focus:outline-none focus:border-primary/30 focus:bg-white/[0.04] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCodes.map((code) => (
          <div key={code.id} className="group bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-5 hover:border-white/10 transition-all relative overflow-hidden">
            {/* Status Indicator */}
            <div className={`absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 rotate-45 ${code.isActive ? 'bg-emerald-500/5' : 'bg-red-500/5'}`} />
            
            <div className="flex items-start justify-between relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${code.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                    {code.planType} System
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-primary transition-colors">{code.code}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    toggleCodeStatus(code.id);
                    refreshCodes();
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    code.isActive 
                      ? 'border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5' 
                      : 'border-emerald-500/10 text-emerald-500/40 hover:text-emerald-500 hover:bg-emerald-500/5'
                  }`}
                  title={code.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Power size={14} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Permanently delete this operational code?')) {
                      deleteRedeemCode(code.id);
                      refreshCodes();
                    }
                  }}
                  className="p-2 rounded-xl border border-white/5 text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Utilization</p>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-white/80">{code.currentUses}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/20 pb-1">/ {code.maxUses}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Expiration</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                  <Clock size={12} className="opacity-40" />
                  {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>

            {code.notes && (
              <p className="text-[11px] text-muted-foreground/40 leading-relaxed italic border-t border-white/5 pt-4">
                "{code.notes}"
              </p>
            )}
          </div>
        ))}

        {filteredCodes.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-[40px] opacity-20">
            <Ticket size={40} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">No codes generated yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] scale-in duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">Generate Operational Code</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Security Clearance Required</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <XCircle size={20} className="text-muted-foreground/40" />
              </button>
            </div>

            <form onSubmit={handleGenerateCode} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Plan Assignment</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 text-sm appearance-none focus:outline-none focus:border-primary/30 transition-all cursor-pointer"
                        value={newCode.planType}
                        onChange={(e) => setNewCode({ ...newCode, planType: e.target.value as PlanType })}
                      >
                        <option value="Pro">Pro Creator</option>
                        <option value="Studio">Studio Agency</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Max Utilization</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary/30 transition-all"
                      value={newCode.maxUses}
                      onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Code Identifier</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. ALPHA_BETA_2026"
                      className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 text-sm font-mono focus:outline-none focus:border-primary/30 transition-all uppercase tracking-wider"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      required
                    />
                    <button 
                      type="button"
                      onClick={suggestCode}
                      className="p-3 bg-white/5 rounded-2xl text-primary hover:bg-primary/10 transition-all"
                      title="Suggest Code"
                    >
                      <RefreshCcw size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Expiration Date (Optional)</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary/30 transition-all text-white/60"
                      value={newCode.expiresAt}
                      onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                    />
                    <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Operational Notes</label>
                  <textarea 
                    placeholder="Describe the purpose of this code..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary/30 transition-all min-h-[80px] resize-none"
                    value={newCode.notes}
                    onChange={(e) => setNewCode({ ...newCode, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[13px] font-bold text-muted-foreground/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 btn-secondary hover-lift rounded-2xl text-[13px] font-bold shadow-sm"
                >
                  Confirm Generation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
