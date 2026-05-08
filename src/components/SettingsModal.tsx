import React, { useRef, useState } from 'react';
import Modal from './ui/Modal';
import { 
  Check, Sparkles, Zap, Shield, User, Building, 
  CreditCard, Settings, Bell, HelpCircle, X, ChevronRight,
  LogOut, Trash2, Monitor, Globe, Mail, Lock, Camera, Edit2
} from 'lucide-react';
import { useSettings, ThemeMode, UIDensity, LandingPage } from '@/contexts/SettingsContext';

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
    priceYearly: '$0',
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
    priceYearly: '$9',
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
    priceYearly: '$24',
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

function Toggle({ active, onChange }: { active: boolean, onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!active)}
      className={`relative w-10 h-[22px] rounded-full transition-all duration-300 ease-in-out border outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 ${
        active 
          ? 'bg-primary/90 border-primary/90 shadow-[0_0_10px_rgba(255,255,255,0.05)]' 
          : 'bg-muted border-border/80 hover:bg-muted/80'
      }`}
      aria-pressed={active}
      role="switch"
    >
      <span 
        className={`absolute top-[1px] left-[1px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 ease-out shadow-sm ${
          active ? 'translate-x-[18px]' : 'translate-x-0'
        }`} 
      />
    </button>
  );
}

function Segment<T extends string>({ options, active, onChange }: { options: T[], active: T, onChange: (val: T) => void }) {
  return (
    <div className="flex bg-muted/40 p-1 rounded-[10px] border border-border/40 relative">
      {options.map(opt => (
        <button 
          key={opt} 
          onClick={() => onChange(opt)}
          className={`relative px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 z-10 ${
            active === opt ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {active === opt && (
            <div className="absolute inset-0 bg-card border border-border/50 rounded-md shadow-sm -z-10" />
          )}
          {opt}
        </button>
      ))}
    </div>
  );
}

function CustomSlider({ value, min, max, onChange }: { value: number, min: number, max: number, onChange: (val: number) => void }) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-40 sm:w-48 h-6 flex items-center group">
      <input 
        type="range" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        min={min} 
        max={max} 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="w-full h-1.5 bg-muted/80 rounded-full overflow-hidden border border-border/30">
        <div className="h-full bg-primary/80 transition-all duration-150 ease-out" style={{ width: `${percentage}%` }} />
      </div>
      <div 
        className="absolute h-4 w-4 bg-white border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded-full top-1/2 -mt-2 transition-transform duration-150 ease-out group-hover:scale-110" 
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, currentPlan = 'Free', initialTab = 'Billing & Plans' }: SettingsModalProps) {
  const { settings, updateSetting } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [billingInterval, setBillingInterval] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [session, setSession] = useState<{ email?: string; isAdmin?: boolean; plan?: string } | null>(null);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      try {
        const raw = localStorage.getItem('userSession');
        if (raw) setSession(JSON.parse(raw));
      } catch(e) {}
    }
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
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === item.label
                      ? 'bg-white/[0.04] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-white/[0.05]' 
                      : 'text-muted-foreground hover:bg-white/[0.02] hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon size={16} className={`transition-colors ${activeTab === item.label ? 'text-foreground' : 'group-hover:text-foreground'}`} />
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Available Plans</h3>
                    <Segment<'Monthly' | 'Yearly'> 
                      options={['Monthly', 'Yearly']} 
                      active={billingInterval} 
                      onChange={setBillingInterval} 
                    />
                  </div>
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
                              <div className="flex items-baseline gap-1.5 min-h-[48px]">
                                <span className="text-4xl font-extrabold tracking-tight transition-all duration-300">
                                  {billingInterval === 'Yearly' && plan.name !== 'Free' ? plan.priceYearly : plan.price}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    / {plan.name === 'Free' ? 'forever' : 'mo'}
                                  </span>
                                  {billingInterval === 'Yearly' && plan.name !== 'Free' && (
                                    <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wide mt-0.5">
                                      Billed yearly
                                    </span>
                                  )}
                                </div>
                              </div>
                              {billingInterval === 'Yearly' && plan.name !== 'Free' && (
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                                  Save 20%
                                </div>
                              )}
                              {billingInterval !== 'Yearly' && plan.name !== 'Free' && (
                                <div className="mt-2 h-5" /> // spacing placeholder to prevent layout jump
                              )}
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

                <div className="space-y-10">
                  
                  {/* 1. Appearance */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Appearance</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Theme Mode</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Select your interface color scheme.</p>
                        </div>
                        <Segment<ThemeMode> 
                          options={['Dark', 'Light', 'System']} 
                          active={settings.themeMode} 
                          onChange={(val) => updateSetting('themeMode', val)} 
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">UI Density</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Adjust spacing and sizing of elements.</p>
                        </div>
                        <Segment<UIDensity> 
                          options={['Comfortable', 'Compact']} 
                          active={settings.uiDensity} 
                          onChange={(val) => updateSetting('uiDensity', val)} 
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Card Corner Radius</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Adjust the roundness of UI elements.</p>
                        </div>
                        <CustomSlider 
                          min={0} 
                          max={100} 
                          value={settings.cardCornerRadius}
                          onChange={(val) => updateSetting('cardCornerRadius', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Blur Intensity</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Strength of glassmorphism effects.</p>
                        </div>
                        <CustomSlider 
                          min={0} 
                          max={100} 
                          value={settings.blurIntensity}
                          onChange={(val) => updateSetting('blurIntensity', val)}
                        />
                      </div>

                    </div>
                  </section>

                  {/* 2. Dashboard Experience */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Dashboard Experience</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Toggle animations</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Enable rich interactive animations.</p>
                        </div>
                        <Toggle active={settings.enableAnimations} onChange={(val) => updateSetting('enableAnimations', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Smooth transitions</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Page routing and layout shifts.</p>
                        </div>
                        <Toggle active={settings.smoothTransitions} onChange={(val) => updateSetting('smoothTransitions', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">AI Insights Section</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Show AI behavior analysis on dashboard.</p>
                        </div>
                        <Toggle active={settings.showAIInsights} onChange={(val) => updateSetting('showAIInsights', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Streak Visibility</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Display activity streaks on cards.</p>
                        </div>
                        <Toggle active={settings.showStreaks} onChange={(val) => updateSetting('showStreaks', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Default Landing Page</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Where you go after logging in.</p>
                        </div>
                        <select 
                          className="bg-card border border-border/80 text-foreground text-sm font-medium rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                          value={settings.defaultLandingPage}
                          onChange={(e) => updateSetting('defaultLandingPage', e.target.value as LandingPage)}
                        >
                          <option value="Dashboard">Dashboard</option>
                          <option value="Analytics">Analytics</option>
                          <option value="Settings">Settings</option>
                        </select>
                      </div>

                    </div>
                  </section>

                  {/* 3. Sidebar Behavior */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Sidebar Behavior</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Auto collapse sidebar</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Minimize automatically on small screens.</p>
                        </div>
                        <Toggle active={settings.autoCollapseSidebar} onChange={(val) => updateSetting('autoCollapseSidebar', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Hover expand sidebar</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Expand when moving cursor to edge.</p>
                        </div>
                        <Toggle active={settings.hoverExpandSidebar} onChange={(val) => updateSetting('hoverExpandSidebar', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Icon-only minimized mode</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Hide labels when collapsed.</p>
                        </div>
                        <Toggle active={settings.iconOnlyMinimized} onChange={(val) => updateSetting('iconOnlyMinimized', val)} />
                      </div>

                    </div>
                  </section>

                  {/* 4. Productivity */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Productivity</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Focus timer auto start</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Start timer automatically when opening a task.</p>
                        </div>
                        <Toggle active={settings.focusTimerAutoStart} onChange={(val) => updateSetting('focusTimerAutoStart', val)} />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Daily reset time</p>
                          <p className="text-xs text-muted-foreground mt-0.5">When your daily streaks and targets refresh.</p>
                        </div>
                        <input 
                          type="time" 
                          value={settings.dailyResetTime}
                          onChange={(e) => updateSetting('dailyResetTime', e.target.value)}
                          className="bg-card border border-border/80 text-foreground text-sm font-medium rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-text" 
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">Enable keyboard shortcuts</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Use shortcuts for quick navigation and logging.</p>
                        </div>
                        <Toggle active={settings.enableShortcuts} onChange={(val) => updateSetting('enableShortcuts', val)} />
                      </div>

                    </div>
                  </section>

                  {/* 5. Experimental */}
                  <section>
                    <h3 className="text-xs font-bold text-warning/80 uppercase tracking-widest mb-4 pl-1">Experimental</h3>
                    <div className="bg-card border border-warning/20 rounded-2xl shadow-sm overflow-hidden">
                      
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-warning/5 transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground group-hover:text-warning/90 transition-colors">Enable future beta features</p>
                          <p className="text-xs text-warning/70 mt-0.5">Warning: Beta features are experimental and may cause instability.</p>
                        </div>
                        <Toggle active={settings.enableBetaFeatures} onChange={(val) => updateSetting('enableBetaFeatures', val)} />
                      </div>

                    </div>
                  </section>

                </div>
              </div>
            )}

            {activeTab === 'Account' && (
              <div className="pb-12 max-w-3xl">
                <div className="mb-10">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Account</h1>
                  <p className="text-muted-foreground text-base">
                    Manage your personal profile, security settings, and connected accounts.
                  </p>
                </div>

                <div className="space-y-10">
                  {/* 1. Profile Section */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Profile</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-muted border-2 border-border/50 flex items-center justify-center overflow-hidden">
                          <User size={40} className="text-muted-foreground opacity-50" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-105 transition-transform">
                          <Camera size={14} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-bold text-foreground">
                            {session?.email ? session.email.split('@')[0] : 'User'}
                          </h2>
                          {session?.isAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/20">
                              Admin
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
                            {session?.plan || currentPlan} Member
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{session?.email || 'user@example.com'}</p>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors">
                            Change Photo
                          </button>
                          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors">
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. Account Information */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Account Information</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                        <p className="text-sm font-semibold text-foreground/90">{session?.email ? session.email.split('@')[0] : 'User'}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-sm font-semibold text-foreground/90">{session?.email || 'user@example.com'}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Workspace</p>
                        <p className="text-sm font-semibold text-foreground/90">Personal Workspace</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/[0.02] transition-colors gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground/90">{session?.plan || currentPlan}</p>
                          <button onClick={() => setActiveTab('Billing & Plans')} className="text-xs text-primary hover:underline font-medium ml-2">Upgrade</button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 3. Security Section */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Security & Access</h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex gap-3 items-center">
                          <Lock size={18} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-foreground/90">Password</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Last changed 3 months ago</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors">
                          Change
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex gap-3 items-center">
                          <Shield size={18} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-foreground/90">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Toggle active={false} onChange={() => {}} />
                      </div>
                      <div className="p-5">
                        <p className="text-sm font-semibold text-foreground/90 mb-4">Active Sessions</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20">
                            <div className="flex gap-3 items-center">
                              <Monitor size={16} className="text-primary" />
                              <div>
                                <p className="text-sm font-medium text-foreground">Windows PC • Chrome</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Current session • IP: 192.168.1.1</p>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary/80">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. Connected Accounts */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">Connected Accounts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-border/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail size={20} className="text-red-500" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">Google</p>
                            <p className="text-xs text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <button className="w-full py-2 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors">
                          Connect
                        </button>
                      </div>
                      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-border/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">GitHub</p>
                            <p className="text-xs text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <button className="w-full py-2 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors">
                          Connect
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* 5. Danger Zone */}
                  <section>
                    <h3 className="text-xs font-bold text-red-500/80 uppercase tracking-widest mb-4 pl-1">Danger Zone</h3>
                    <div className="bg-card border border-red-500/20 rounded-2xl shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-5 hover:bg-red-500/5 transition-colors group">
                        <div className="flex gap-3 items-center">
                          <LogOut size={18} className="text-muted-foreground group-hover:text-red-500/70 transition-colors" />
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-red-500/90 transition-colors">Log out of all devices</p>
                            <p className="text-xs text-muted-foreground mt-0.5">You will be logged out of all active sessions.</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-red-500 hover:text-white border border-border/50 hover:border-red-500 transition-colors">
                          Log Out All
                        </button>
                      </div>
                      <div className="border-t border-red-500/10"></div>
                      <div className="flex items-center justify-between p-5 hover:bg-red-500/5 transition-colors group">
                        <div className="flex gap-3 items-center">
                          <Trash2 size={18} className="text-muted-foreground group-hover:text-red-500/70 transition-colors" />
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-red-500/90 transition-colors">Delete account</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all data.</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {activeTab !== 'Account' && activeTab !== 'Billing & Plans' && activeTab !== 'Preferences' && (
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
