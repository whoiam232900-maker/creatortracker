'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Zap, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ChevronDown,
  Loader2,
  Mail
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

interface SupportReport {
  id: string;
  userName: string;
  email: string;
  category: string;
  message: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const PRIORITY_COLORS = {
  low: 'text-muted-foreground/40 bg-white/[0.02]',
  medium: 'text-amber-500/70 bg-amber-500/5',
  high: 'text-red-500/70 bg-red-500/5'
};

const CATEGORY_ICONS: Record<string, any> = {
  'Bug Report': Bug,
  'Feature Request': Lightbulb,
  'Performance Issue': Zap,
  'Account Help': User,
  'General Feedback': MessageSquare,
};

export default function AdminReportsTab() {
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from "admin system"
    const timer = setTimeout(() => {
      const mockReports: SupportReport[] = [
        {
          id: 'REP-001',
          userName: 'Alex Smith',
          email: 'alex.smith@example.com',
          category: 'Bug Report',
          message: 'The charts on the analytics page are flickering when I resize my window. Using Chrome on Windows.',
          status: 'pending',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          priority: 'high'
        },
        {
          id: 'REP-002',
          userName: 'Jordan Lee',
          email: 'jordan@creator.co',
          category: 'Feature Request',
          message: 'I would love to see a dark mode toggle that automatically syncs with my OS settings.',
          status: 'resolved',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          priority: 'low'
        },
        {
          id: 'REP-003',
          userName: 'Sam Wilson',
          email: 'sam@agency.com',
          category: 'Account Help',
          message: 'Cannot upgrade to Pro plan. The payment window closes instantly after clicking subscribe.',
          status: 'pending',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          priority: 'medium'
        }
      ];
      setReports(mockReports);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleStatusUpdate = (id: string, newStatus: SupportReport['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast({ 
      type: 'success', 
      title: 'Report Updated', 
      description: `Report ${id} marked as ${newStatus}.` 
    });
  };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10 fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground/90 flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" />
            System Reports
          </h1>
          <p className="text-muted-foreground/60 text-[12px]">
            Manage user feedback, bug reports, and support inquiries.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input 
                    type="text" 
                    placeholder="Search reports..." 
                    className="input-field py-1.5 pl-9 pr-4 text-xs w-48 bg-white/[0.02] border-white/[0.05]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] rounded-lg p-1">
                {['all', 'pending', 'resolved'].map((opt) => (
                    <button 
                        key={opt}
                        onClick={() => setFilter(opt as any)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            filter === opt ? 'bg-white/10 text-white' : 'text-muted-foreground/40 hover:text-muted-foreground/80'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-30">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-xs font-bold uppercase tracking-widest">Loading secure reports...</p>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const Icon = CATEGORY_ICONS[report.category] || MessageSquare;
            return (
              <div key={report.id} className="card bg-white/[0.01] border-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden group">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
                  {/* Category Icon */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-muted-foreground/40 group-hover:text-primary transition-colors">
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{report.id}</span>
                        <h3 className="text-[13px] font-bold text-foreground/90">{report.category}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${PRIORITY_COLORS[report.priority]}`}>
                            {report.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40">
                        <Clock size={12} />
                        <span>{new Date(report.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-[12px] text-muted-foreground/80 leading-relaxed max-w-3xl">
                        {report.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                                {report.userName.charAt(0)}
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground/70">{report.userName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
                            <Mail size={12} />
                            <span>{report.email}</span>
                        </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                    {report.status === 'pending' ? (
                      <button 
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="flex-1 sm:w-28 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/10"
                      >
                        Resolve
                      </button>
                    ) : (
                      <div className="flex-1 sm:w-28 py-2 rounded-xl bg-white/5 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest text-center border border-white/5 flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={12} />
                        Resolved
                      </div>
                    )}
                    <button className="p-2 rounded-xl border border-white/[0.05] text-muted-foreground/20 hover:bg-white/[0.05] hover:text-foreground transition-all">
                        <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center card border-dashed border-white/[0.05] bg-transparent">
            <p className="text-sm text-muted-foreground/30 font-medium italic">No reports found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
