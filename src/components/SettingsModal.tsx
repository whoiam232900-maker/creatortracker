import React, { useRef, useState } from 'react';
import Modal from './ui/Modal';
import { 
  Check, Sparkles, Zap, Shield, User, Building, 
  CreditCard, Settings, Bell, HelpCircle, X, ChevronRight 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  initialTab?: string;
}

const SIDEBAR_ITEMS = [
  { label: 'Account', icon: User },
  { label: 'Workspace', icon: Building },
  { label: 'Billing & Plans', icon: CreditCard },
  { label: 'Preferences', icon: Settings },
  { label: 'Notifications', icon: Bell },
  { label: 'Help & Support', icon: HelpCircle },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic tracking.',
    icon: Shield,
    features: [
      'Up to 3 active trackers',
      'Basic analytics dashboard',
      '7-day data history',
      'Community support',
    ],
    cta: 'Current Plan',
    ctaPrimary: false,
    color: 'var(--muted-foreground)',
    bgHighlight: 'transparent',
    borderHighlight: 'transparent',
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'Advanced analytics and unlimited tracking for creators.',
    icon: Zap,
    isRecommended: true,
    features: [
      'Unlimited trackers & targets',
      'Advanced AI behavioral insights',
      'Unlimited data history',
      'Custom dashboard layouts',
      'Priority email support',
    ],
    cta: 'Upgrade to Pro',
    ctaPrimary: true,
    color: 'var(--primary)',
    bgHighlight: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.01) 100%)',
    borderHighlight: 'rgba(37, 99, 235, 0.3)',
  },
  {
    name: 'Max',
    price: '$29',
    period: 'per month',
    description: 'The ultimate toolkit for agency teams and power users.',
    icon: Sparkles,
    features: [
      'Everything in Pro',
      'Multiple workspaces',
      'Team collaboration',
      'API access & webhooks',
      'Dedicated account manager',
    ],
    cta: 'Upgrade to Max',
    ctaPrimary: false,
    color: '#8b5cf6', // purple
    bgHighlight: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.01) 100%)',
    borderHighlight: 'rgba(139, 92, 246, 0.2)',
  },
];

const COMPARISON_FEATURES = [
  { name: 'Active Trackers', free: '3', pro: 'Unlimited', max: 'Unlimited' },
  { name: 'Data History', free: '7 Days', pro: 'Unlimited', max: 'Unlimited' },
  { name: 'AI Behavioral Insights', free: '-', pro: 'Included', max: 'Included' },
  { name: 'Custom Dashboards', free: '-', pro: 'Included', max: 'Included' },
  { name: 'Multiple Workspaces', free: '-', pro: '-', max: 'Included' },
  { name: 'Team Members', free: '1', pro: '1', max: 'Up to 5' },
  { name: 'API Access', free: '-', pro: '-', max: 'Included' },
  { name: 'Support Level', free: 'Community', pro: 'Priority Email', max: 'Dedicated' },
];

export default function SettingsModal({ isOpen, onClose, currentPlan = 'Free', initialTab = 'Billing & Plans' }: SettingsModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader noPadding maxWidth="max-w-6xl">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex h-full w-full relative group"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Subtle Cursor-Follow Gradient Effect */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(79, 70, 229, 0.04), transparent 40%)`
          }}
        />

        {/* Left Sidebar */}
        <div 
          className="w-64 flex-shrink-0 border-r flex flex-col relative z-10" 
          style={{ 
            borderColor: 'color-mix(in srgb, var(--border) 40%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--card) 98%, transparent)'
          }}
        >
          <div className="p-6 pb-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Settings</h2>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.label
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 py-10">
            
            {activeTab === 'Billing & Plans' && (
              <>
                {/* Header / Status Section */}
                <div className="mb-12">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Plans</h1>
                  <p className="text-muted-foreground text-base">
                    Manage your subscription, billing history, and workspace usage.
                  </p>
                </div>

                {/* Current Plan Summary Card */}
                <div 
                  className="rounded-2xl border p-6 mb-12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  style={{ 
                    borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--muted) 20%, transparent)' 
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Plan</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{currentPlan} Plan</h2>
                      {currentPlan.toLowerCase() !== 'free' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentPlan.toLowerCase() === 'free' 
                        ? 'You are currently on the Free tier. Upgrade to unlock more power.'
                        : 'Your subscription is active and will auto-renew.'}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {currentPlan.toLowerCase() !== 'free' && (
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-muted transition-colors whitespace-nowrap">
                        Manage Billing
                      </button>
                    )}
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="mb-16">
                  <h3 className="text-xl font-bold mb-6">Available Plans</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                      const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();
                      const Icon = plan.icon;
                      
                      return (
                        <div 
                          key={plan.name}
                          className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                            plan.isRecommended 
                              ? 'shadow-[0_12px_40px_rgb(37,99,235,0.08)] -translate-y-1' 
                              : 'shadow-sm hover:border-border/80 hover:shadow-md'
                          }`}
                          style={{
                            borderColor: plan.isRecommended ? plan.borderHighlight : 'color-mix(in srgb, var(--border) 50%, transparent)',
                            background: plan.bgHighlight !== 'transparent' ? plan.bgHighlight : 'color-mix(in srgb, var(--card) 95%, transparent)',
                          }}
                        >
                          {plan.isRecommended && (
                            <div className="absolute -top-3 inset-x-0 flex justify-center">
                              <span 
                                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm"
                                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                              >
                                Recommended
                              </span>
                            </div>
                          )}

                          <div className="p-6 xl:p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-5">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${plan.color}15`, color: plan.color }}
                              >
                                <Icon size={20} />
                              </div>
                              <h4 className="text-xl font-bold">{plan.name}</h4>
                            </div>

                            <div className="mb-4">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                <span className="text-sm font-medium text-muted-foreground">/ {plan.period}</span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-8 min-h-[40px] leading-relaxed">
                              {plan.description}
                            </p>

                            <div className="flex-1">
                              <ul className="space-y-3.5 mb-8">
                                {plan.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                    <Check size={16} className="flex-shrink-0 mt-0.5 opacity-80" style={{ color: plan.color }} />
                                    <span className="text-foreground/90">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              disabled={isCurrent}
                              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                                isCurrent 
                                  ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-80 border border-border/30'
                                  : plan.ctaPrimary
                                    ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-[0.98]'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 active:scale-[0.98]'
                              }`}
                            >
                              {isCurrent ? 'Current Plan' : plan.cta}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comparison Table */}
                <div>
                  <h3 className="text-xl font-bold mb-6">Compare Features</h3>
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="border-b bg-muted/20" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}>
                            <th className="px-6 py-4 font-semibold text-muted-foreground w-2/5">Feature</th>
                            <th className="px-6 py-4 font-semibold text-foreground w-1/5">Free</th>
                            <th className="px-6 py-4 font-bold text-primary w-1/5">Pro</th>
                            <th className="px-6 py-4 font-bold" style={{ color: '#8b5cf6' }}>Max</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {COMPARISON_FEATURES.map((feat, idx) => (
                            <tr key={idx} className="hover:bg-muted/10 transition-colors">
                              <td className="px-6 py-4 font-medium text-foreground">{feat.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{feat.free}</td>
                              <td className="px-6 py-4 text-foreground font-medium">{feat.pro}</td>
                              <td className="px-6 py-4 text-foreground font-medium">{feat.max}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Preferences' && (
              <div className="pb-12 max-w-3xl">
                <div className="mb-10">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Preferences</h1>
                  <p className="text-muted-foreground text-base">
                    Customize your experience, appearance, and workspace behaviors.
                  </p>
                </div>

                <div className="space-y-12">
                  
                  {/* 1. Appearance */}
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Appearance</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Theme Mode</p>
                          <p className="text-sm text-muted-foreground">Select your interface color scheme.</p>
                        </div>
                        <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50">
                          {['Dark', 'Light', 'System'].map(opt => (
                            <button key={opt} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${opt === 'Dark' ? 'bg-card shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">UI Density</p>
                          <p className="text-sm text-muted-foreground">Adjust spacing and sizing of elements.</p>
                        </div>
                        <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50">
                          {['Comfortable', 'Compact'].map(opt => (
                            <button key={opt} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${opt === 'Comfortable' ? 'bg-card shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Card Corner Radius</p>
                          <p className="text-sm text-muted-foreground">Adjust the roundness of UI elements.</p>
                        </div>
                        <input type="range" className="w-48 accent-primary" min="0" max="100" defaultValue="70" />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Blur Intensity</p>
                          <p className="text-sm text-muted-foreground">Strength of glassmorphism effects.</p>
                        </div>
                        <input type="range" className="w-48 accent-primary" min="0" max="100" defaultValue="40" />
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-border/50" />

                  {/* 2. Dashboard Experience */}
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Dashboard Experience</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Toggle animations</p>
                          <p className="text-sm text-muted-foreground">Enable rich interactive animations.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Smooth transitions</p>
                          <p className="text-sm text-muted-foreground">Page routing and layout shifts.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">AI Insights Section</p>
                          <p className="text-sm text-muted-foreground">Show AI behavior analysis on dashboard.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Streak Visibility</p>
                          <p className="text-sm text-muted-foreground">Display activity streaks on cards.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Default Landing Page</p>
                          <p className="text-sm text-muted-foreground">Where you go after logging in.</p>
                        </div>
                        <select className="bg-muted/40 border border-border/50 text-foreground text-sm rounded-lg px-3 py-2 outline-none">
                          <option>Dashboard</option>
                          <option>Analytics</option>
                          <option>Settings</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-border/50" />

                  {/* 3. Sidebar Behavior */}
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Sidebar Behavior</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Auto collapse sidebar</p>
                          <p className="text-sm text-muted-foreground">Minimize automatically on small screens.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Hover expand sidebar</p>
                          <p className="text-sm text-muted-foreground">Expand when moving cursor to edge.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Icon-only minimized mode</p>
                          <p className="text-sm text-muted-foreground">Hide labels when collapsed.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-border/50" />

                  {/* 4. Productivity */}
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Productivity</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Focus timer auto start</p>
                          <p className="text-sm text-muted-foreground">Start timer automatically when opening a task.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-muted-foreground/30 cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-0 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Daily reset time</p>
                          <p className="text-sm text-muted-foreground">When your daily streaks and targets refresh.</p>
                        </div>
                        <input type="time" defaultValue="00:00" className="bg-muted/40 border border-border/50 text-foreground text-sm rounded-lg px-3 py-2 outline-none" />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Enable keyboard shortcuts</p>
                          <p className="text-sm text-muted-foreground">Use shortcuts for quick navigation and logging.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-primary cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-5 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-border/50" />

                  {/* 5. Experimental */}
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Experimental</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">Enable future beta features</p>
                          <p className="text-xs text-warning/80 mt-1 max-w-md">Warning: Beta features are experimental and may cause instability or change without notice.</p>
                        </div>
                        <div className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5 bg-muted-foreground/30 cursor-pointer shadow-inner">
                          <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-0 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {activeTab !== 'Billing & Plans' && activeTab !== 'Preferences' && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Settings size={48} className="text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold text-muted-foreground mb-2">{activeTab}</h2>
                <p className="text-sm text-muted-foreground/70">This section is currently under construction.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </Modal>
  );
}
