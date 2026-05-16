'use client';
import React, { useRef, useState } from 'react';
import Modal from './ui/Modal';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  User,
  Building,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  X,
  ChevronRight,
  LogOut,
  Trash2,
  Monitor,
  Globe,
  Mail,
  Lock,
  Camera,
  Edit2,
  ShieldAlert,
} from 'lucide-react';
import AppLogo from './ui/AppLogo';
import { useSettings, ThemeMode, UIDensity, LandingPage, VisualTheme } from '@/contexts/SettingsContext';
import SupportTab from './SupportTab';
import AccountTab from './AccountTab';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanType, PLAN_HIERARCHY } from '@/lib/subscription';
import { UpgradePrompt } from './UpgradePrompt';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  currentPlan?: string;
}

const SIDEBAR_ITEMS = [
  { label: 'Account', icon: User },
  { label: 'Workspace', icon: Building },
  { label: 'Billing & Plans', icon: CreditCard },
  { label: 'Dashboard', icon: Monitor },
  { label: 'Preferences', icon: Settings },
  { label: 'Notifications', icon: Bell },
  { label: 'Help & Support', icon: HelpCircle },
];

const PLANS = [
  {
    name: 'Free',
    icon: Shield,
    description: 'Perfect for getting started with basic tracking.',
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
    icon: Zap,
    description: 'Advanced analytics and unlimited tracking for creators.',
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
    bgHighlight:
      'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.01) 100%)',
    borderHighlight: 'rgba(37, 99, 235, 0.3)',
  },
  {
    name: 'Studio',
    icon: Sparkles,
    description: 'The ultimate toolkit for agency teams and power users.',
    features: [
      'Everything in Pro',
      'Multiple workspaces',
      'Team collaboration',
      'API access & webhooks',
      'Dedicated account manager',
    ],
    cta: 'Upgrade to Studio',
    ctaPrimary: false,
    color: '#8b5cf6', // purple
    bgHighlight:
      'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.01) 100%)',
    borderHighlight: 'rgba(139, 92, 246, 0.2)',
  },
];

const PRICING_DATA = {
  Global: {
    symbol: '$',
    Free: { monthly: 0, yearly: 0, originalMonthly: 0, originalYearly: 0 },
    Pro: { monthly: 4.99, yearly: 3.49, originalMonthly: 8.99, originalYearly: 6.99 },
    Studio: { monthly: 9.99, yearly: 6.99, originalMonthly: 16.99, originalYearly: 12.99 },
  },
  India: {
    symbol: '₹',
    Free: { monthly: 0, yearly: 0, originalMonthly: 0, originalYearly: 0 },
    Pro: { monthly: 199, yearly: 149, originalMonthly: 399, originalYearly: 299 },
    Studio: { monthly: 399, yearly: 299, originalMonthly: 799, originalYearly: 599 },
  },
};

const COMPARISON_FEATURES = [
  { name: 'Active Trackers', free: '3', pro: 'Unlimited', studio: 'Unlimited' },
  { name: 'Data History', free: '7 Days', pro: 'Unlimited', studio: 'Unlimited' },
  { name: 'AI Behavioral Insights', free: '-', pro: 'Included', studio: 'Included' },
  { name: 'Custom Dashboards', free: '-', pro: 'Included', studio: 'Included' },
  { name: 'Multiple Workspaces', free: '-', pro: '-', studio: 'Included' },
  { name: 'Team Members', free: '1', pro: '1', studio: 'Up to 5' },
  { name: 'API Access', free: '-', pro: '-', studio: 'Included' },
  { name: 'Support Level', free: 'Community', pro: 'Priority Email', studio: 'Dedicated' },
];

function Toggle({ active, onChange }: { active: boolean; onChange: (val: boolean) => void }) {
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

function Segment<T extends string>({
  options,
  active,
  onChange,
}: {
  options: T[];
  active: T;
  onChange: (val: T) => void;
}) {
  return (
    <div className="flex bg-muted/40 p-1 rounded-[10px] border border-border/40 relative">
      {options.map((opt) => (
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

function CustomSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
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
        <div
          className="h-full bg-primary/80 transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className="absolute h-4 w-4 bg-white border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded-full top-1/2 -mt-2 transition-transform duration-150 ease-out group-hover:scale-110"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'Billing & Plans',
}: SettingsModalProps) {
  const { settings, updateSetting } = useSettings();
  const { plan: currentPlan, canUseFeature, triggerUpgrade } = useSubscription();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [billingInterval, setBillingInterval] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [region, setRegion] = useState<'Global' | 'India'>('Global');
  const [session, setSession] = useState<{
    email?: string;
    isAdmin?: boolean;
    plan?: string;
    role?: string;
  } | null>(null);

  // Combined sidebar items based on role
  const visibleSidebarItems = SIDEBAR_ITEMS;

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      try {
        const raw = localStorage.getItem('userSession');
        if (raw) setSession(JSON.parse(raw));
      } catch (e) {}
    }
  }, [isOpen, initialTab]);

  const handleThemeSelect = (theme: VisualTheme) => {
    updateSetting('visualTheme', theme);
  };

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
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(79, 70, 229, 0.04), transparent 40%)`,
          }}
        />

        {/* Left Sidebar */}
        <div
          className="w-64 flex-shrink-0 border-r flex flex-col relative z-10"
          style={{
            borderColor: 'color-mix(in srgb, var(--border) 40%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--card) 98%, transparent)',
          }}
        >
          <div className="p-6 pb-2 flex items-center gap-3">
            <AppLogo size={24} />
            <h2 className="text-[17px] font-light tracking-tight text-foreground/80">Settings</h2>
          </div>
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
            {visibleSidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group ${
                    activeTab === item.label
                      ? 'bg-white/[0.04] text-foreground/90 shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-white/[0.05]'
                      : 'text-muted-foreground/40 hover:bg-white/[0.01] hover:text-foreground/70 border border-transparent'
                  }`}
                >
                  <Icon
                    size={14}
                    className={`transition-colors duration-300 ${activeTab === item.label ? 'text-primary/60' : 'text-muted-foreground/20 group-hover:text-muted-foreground/30'}`}
                    strokeWidth={1.5}
                  />
                  <span
                    className="tracking-tight"
                  >
                    {item.label}
                  </span>
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
                <div className="mb-10">
                  <h1 className="text-2xl font-light tracking-tight mb-2 text-foreground/90">
                    Subscription
                  </h1>
                  <p className="text-muted-foreground/40 text-[13px] font-medium">
                    Manage your workspace membership and billing details.
                  </p>
                </div>

                {/* Current Plan Summary Card */}
                <div
                  className="rounded-[22px] border p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.04)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground/20 uppercase tracking-[0.25em] mb-2.5">
                      Active Membership
                    </p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-[17px] font-light text-foreground/80">
                        {currentPlan} Plan
                      </h2>
                      {currentPlan.toLowerCase() !== 'free' && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/[0.03] border border-primary/10">
                          <span className="w-1 h-1 rounded-full bg-primary/40" />
                          <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-widest">
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2.5 w-full sm:w-auto">
                    {currentPlan.toLowerCase() !== 'free' && (
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200 whitespace-nowrap">
                        Manage Billing
                      </button>
                    )}
                  </div>
                </div>

                {/* Pricing Cards Section */}
                <div className="mb-12">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-widest">
                      Available Plans
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-1.5 py-1 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                        <Globe size={11} className="text-muted-foreground/40 ml-1" />
                        <Segment<'Global' | 'India'>
                          options={['Global', 'India']}
                          active={region}
                          onChange={setRegion}
                        />
                      </div>
                      <Segment<'Monthly' | 'Yearly'>
                        options={['Monthly', 'Yearly']}
                        active={billingInterval}
                        onChange={setBillingInterval}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {PLANS.map((plan) => {
                      const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();
                      const Icon = plan.icon;
                      const pricing = PRICING_DATA[region][plan.name as 'Free' | 'Pro' | 'Studio'];
                      const isYearly = billingInterval === 'Yearly';

                      const displayPrice = isYearly ? pricing.yearly : pricing.monthly;
                      const originalPrice = isYearly
                        ? pricing.originalYearly
                        : pricing.originalMonthly;
                      const hasDiscount = originalPrice > displayPrice;

                      return (
                        <div
                          key={plan.name}
                          className={`relative flex flex-col rounded-xl border transition-all duration-300 group/card ${
                            plan.isRecommended
                              ? 'border-primary/20 bg-white/[0.02]'
                              : 'border-white/[0.05] bg-white/[0.01]'
                          }`}
                        >
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    color: plan.isRecommended
                                      ? 'var(--primary)'
                                      : 'var(--muted-foreground)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                  }}
                                >
                                  <Icon size={16} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-sm font-semibold text-white/90">{plan.name}</h4>
                              </div>
                              {plan.isRecommended && (
                                <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest px-1.5 py-0.5 rounded border border-primary/10">
                                  Founder
                                </span>
                              )}
                            </div>

                            <div className="mb-5">
                              <div className="flex items-baseline gap-1.5 min-h-[32px]">
                                <span className="text-2xl font-semibold text-white">
                                  {PRICING_DATA[region].symbol}
                                  {displayPrice}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground/60">
                                  /{plan.name === 'Free' ? 'forever' : 'mo'}
                                </span>
                                {hasDiscount && (
                                  <span className="ml-1 text-[11px] font-medium text-muted-foreground/30 line-through">
                                    {PRICING_DATA[region].symbol}
                                    {originalPrice}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                {isYearly && plan.name !== 'Free' && (
                                  <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-wider">
                                    Billed yearly
                                  </span>
                                )}
                                {hasDiscount && (
                                  <span className="text-[9px] font-bold text-primary/60 uppercase tracking-wider">
                                    {isYearly && '• '}Launch price
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[12px] text-muted-foreground/80 mb-6 min-h-[36px] leading-relaxed">
                              {plan.description}
                            </p>

                            <div className="flex-1">
                              <ul className="space-y-2.5 mb-8">
                                {plan.features.map((feature, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-[12px] group/feat"
                                  >
                                    <div
                                      className={`mt-0.5 ${plan.isRecommended ? 'text-primary/60' : 'text-muted-foreground/30'}`}
                                    >
                                      <Check size={13} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-muted-foreground/70 group-hover/feat:text-white/80 transition-colors">
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              disabled={isCurrent || PLAN_HIERARCHY[currentPlan as PlanType] > PLAN_HIERARCHY[plan.name as PlanType]}
                              onClick={() => {
                                if (!isCurrent && PLAN_HIERARCHY[currentPlan as PlanType] < PLAN_HIERARCHY[plan.name as PlanType]) {
                                  triggerUpgrade(plan.name as PlanType);
                                }
                              }}
                              className={`w-full py-2 px-4 rounded-lg font-semibold text-[11px] transition-all duration-200 ${
                                isCurrent
                                  ? 'bg-white/[0.02] text-white/20 cursor-not-allowed border border-white/[0.04]'
                                  : PLAN_HIERARCHY[currentPlan as PlanType] > PLAN_HIERARCHY[plan.name as PlanType]
                                    ? 'bg-white/[0.02] text-white/20 cursor-not-allowed border border-white/[0.04]'
                                    : plan.isRecommended
                                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                      : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5'
                              }`}
                            >
                              {isCurrent ? 'Current Plan' : (PLAN_HIERARCHY[currentPlan as PlanType] > PLAN_HIERARCHY[plan.name as PlanType] ? 'Included' : plan.cta)}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="pb-8">
                  <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4">
                    Comparison
                  </h3>
                  <div className="rounded-xl border border-white/[0.05] overflow-hidden bg-white/[0.01]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-white/[0.03] bg-white/[0.02]">
                            <th className="px-5 py-3 font-semibold text-muted-foreground/40 uppercase tracking-widest text-[9px] w-2/5">
                              Feature
                            </th>
                            <th className="px-5 py-3 font-semibold text-white/60 w-1/5">Free</th>
                            <th className="px-5 py-3 font-semibold text-primary/80 w-1/5">Pro</th>
                            <th className="px-5 py-3 font-semibold text-white/60 w-1/5">Studio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {COMPARISON_FEATURES.map((feat, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-white/[0.01] transition-colors group/row"
                            >
                              <td className="px-5 py-2.5 font-medium text-muted-foreground/60 group-hover/row:text-white/80 transition-colors">
                                {feat.name}
                              </td>
                              <td className="px-5 py-2.5 text-muted-foreground/40">{feat.free}</td>
                              <td className="px-5 py-2.5 text-white/70 font-medium">{feat.pro}</td>
                              <td className="px-5 py-2.5 text-white/70 font-medium">
                                {feat.studio}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Dashboard' && (
              <div className="pb-12 max-w-3xl">
                <div className="mb-10">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Layout</h1>
                  <p className="text-muted-foreground text-base">
                    Personalize your operational workspace by enabling or disabling modules.
                  </p>
                </div>

                <div className="space-y-10">
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Operational Modules
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Focus Timer
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Real-time deep work and session tracking.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showFocusTimer}
                          onChange={(val) => updateSetting('showFocusTimer', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Workflow Tracker
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Operational pipeline and agency delivery management.
                          </p>
                        </div>
                        <Toggle
                          active={settings.enableWorkflowTracking}
                          onChange={(val) => updateSetting('enableWorkflowTracking', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Target Progress
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Visual goals and completion monitoring.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showTargets}
                          onChange={(val) => updateSetting('showTargets', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            AI Insights
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Behavioral analysis and performance optimization tips.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showAIInsights}
                          onChange={(val) => updateSetting('showAIInsights', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Analytics Cards
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            High-level statistics and weekly comparisons.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showAnalyticsCards}
                          onChange={(val) => updateSetting('showAnalyticsCards', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Recent Activity
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Historical log of your recent tracking entries.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showRecentEntries}
                          onChange={(val) => updateSetting('showRecentEntries', val)}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Specialized Tracking
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Study Tracker
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Academic focus and session management.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showStudyTracker}
                          onChange={(val) => updateSetting('showStudyTracker', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Earnings Tracker
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Revenue monitoring and financial targets.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showEarningsTracker}
                          onChange={(val) => updateSetting('showEarningsTracker', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Productivity Summary
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Consolidated overview of performance metrics.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showProductivitySummary}
                          onChange={(val) => updateSetting('showProductivitySummary', val)}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
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
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Appearance
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      {/* ── Visual Theme Selector ────────────────────────────────── */}
                      <div className="p-5 group">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-foreground/90">
                            Visual Theme
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Choose the visual identity of your workspace.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Cinematic Theme Card */}
                          <button
                            onClick={() => handleThemeSelect('Cinematic')}
                            className="ct-theme-card text-left relative"
                            data-active={String((settings.visualTheme ?? 'Cinematic') === 'Cinematic')}
                            aria-pressed={(settings.visualTheme ?? 'Cinematic') === 'Cinematic'}
                          >
                            <div className="ct-theme-preview ct-theme-preview--cinematic" />
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <p className="text-[12px] font-semibold text-foreground/90">Cinematic</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Primary Default</p>
                              </div>
                              {(settings.visualTheme ?? 'Cinematic') === 'Cinematic' && (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: 'var(--primary)', opacity: 0.85 }}
                                >
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-foreground)' }} />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Cinematic Light Theme Card */}
                          <button
                            onClick={() => handleThemeSelect('Cinematic Light')}
                            className="ct-theme-card text-left relative"
                            data-active={String(settings.visualTheme === 'Cinematic Light')}
                            aria-pressed={settings.visualTheme === 'Cinematic Light'}
                          >
                            <div className="ct-theme-preview ct-theme-preview--cinematic-light" />
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <p className="text-[12px] font-semibold text-foreground/90">Cinematic Light</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Daylight paper</p>
                              </div>
                              {settings.visualTheme === 'Cinematic Light' && (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: 'var(--primary)', opacity: 0.85 }}
                                >
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-foreground)' }} />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Original Theme Card */}
                          <button
                            onClick={() => handleThemeSelect('Original')}
                            className="ct-theme-card text-left"
                            data-active={String(settings.visualTheme === 'Original')}
                            aria-pressed={settings.visualTheme === 'Original'}
                          >
                            <div className="ct-theme-preview ct-theme-preview--original" />
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <p className="text-[12px] font-semibold text-foreground/90">Original</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Legacy Blue</p>
                              </div>
                              {settings.visualTheme === 'Original' && (
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: 'var(--primary)', opacity: 0.85 }}
                                >
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-foreground)' }} />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            UI Density
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Adjust spacing and sizing of elements.
                          </p>
                        </div>
                        <Segment<UIDensity>
                          options={['Comfortable', 'Compact']}
                          active={settings.uiDensity}
                          onChange={(val) => updateSetting('uiDensity', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Card Corner Radius
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Adjust the roundness of UI elements.
                          </p>
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
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Blur Intensity
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Strength of glassmorphism effects.
                          </p>
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
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Dashboard Experience
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Toggle animations
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Enable rich interactive animations.
                          </p>
                        </div>
                        <Toggle
                          active={settings.enableAnimations}
                          onChange={(val) => updateSetting('enableAnimations', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Smooth transitions
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Page routing and layout shifts.
                          </p>
                        </div>
                        <Toggle
                          active={settings.smoothTransitions}
                          onChange={(val) => updateSetting('smoothTransitions', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            AI Insights Section
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Show AI behavior analysis on dashboard.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showAIInsights}
                          onChange={(val) => updateSetting('showAIInsights', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Streak Visibility
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Display activity streaks on cards.
                          </p>
                        </div>
                        <Toggle
                          active={settings.showStreaks}
                          onChange={(val) => updateSetting('showStreaks', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Default Landing Page
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Where you go after logging in.
                          </p>
                        </div>
                        <select
                          className="bg-card border border-border/80 text-foreground text-sm font-medium rounded-lg px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                          value={settings.defaultLandingPage}
                          onChange={(e) =>
                            updateSetting('defaultLandingPage', e.target.value as LandingPage)
                          }
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
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Sidebar Behavior
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Auto collapse sidebar
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Minimize automatically on small screens.
                          </p>
                        </div>
                        <Toggle
                          active={settings.autoCollapseSidebar}
                          onChange={(val) => updateSetting('autoCollapseSidebar', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Hover expand sidebar
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Expand when moving cursor to edge.
                          </p>
                        </div>
                        <Toggle
                          active={settings.hoverExpandSidebar}
                          onChange={(val) => updateSetting('hoverExpandSidebar', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Icon-only minimized mode
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Hide labels when collapsed.
                          </p>
                        </div>
                        <Toggle
                          active={settings.iconOnlyMinimized}
                          onChange={(val) => updateSetting('iconOnlyMinimized', val)}
                        />
                      </div>
                    </div>
                  </section>

                  {/* 4. Productivity */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-1">
                      Productivity
                    </h3>
                    <div className="bg-card border border-border/60 rounded-2xl shadow-sm divide-y divide-border/40 overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Focus timer auto start
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Start timer automatically when opening a task.
                          </p>
                        </div>
                        <Toggle
                          active={settings.focusTimerAutoStart}
                          onChange={(val) => updateSetting('focusTimerAutoStart', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Daily reset time
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            When your daily streaks and targets refresh.
                          </p>
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
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Enable keyboard shortcuts
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Use shortcuts for quick navigation and logging.
                          </p>
                        </div>
                        <Toggle
                          active={settings.enableShortcuts}
                          onChange={(val) => updateSetting('enableShortcuts', val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.03] transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-white transition-colors">
                            Workflow Tracking
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Manage operational workflows and production pipelines.
                          </p>
                        </div>
                        <Toggle
                          active={settings.enableWorkflowTracking}
                          onChange={(val) => updateSetting('enableWorkflowTracking', val)}
                        />
                      </div>
                    </div>
                  </section>

                  {/* 5. Experimental */}
                  <section>
                    <h3 className="text-xs font-bold text-warning/80 uppercase tracking-widest mb-4 pl-1">
                      Experimental
                    </h3>
                    <div className="bg-card border border-warning/20 rounded-2xl shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-4 p-5 hover:bg-warning/5 transition-colors group">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground group-hover:text-warning/90 transition-colors">
                            Enable future beta features
                          </p>
                          <p className="text-xs text-warning/70 mt-0.5">
                            Warning: Beta features are experimental and may cause instability.
                          </p>
                        </div>
                        <Toggle
                          active={settings.enableBetaFeatures}
                          onChange={(val) => updateSetting('enableBetaFeatures', val)}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'Account' && <AccountTab />}

            {activeTab === 'Help & Support' && <SupportTab />}

            {activeTab !== 'Account' &&
              activeTab !== 'Billing & Plans' &&
              activeTab !== 'Preferences' &&
              activeTab !== 'Help & Support' && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Settings size={48} className="text-muted-foreground/30 mb-4" />
                  <h2 className="text-xl font-bold text-muted-foreground mb-2">{activeTab}</h2>
                  <p className="text-sm text-muted-foreground/70">
                    This section is currently under construction.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
