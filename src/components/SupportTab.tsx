'use client';

import React, { useState } from 'react';
import { showToast } from '@/components/ui/Toast';
import {
  Send,
  HelpCircle,
  Bug,
  Lightbulb,
  Zap,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Clock,
} from 'lucide-react';

const DiscordIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.946 2.4189-2.1568 2.4189z" />
  </svg>
);

const categories = [
  { id: 'Bug Report', icon: Bug, label: 'Bug Report' },
  { id: 'Feature Request', icon: Lightbulb, label: 'Feature Request' },
  { id: 'Performance Issue', icon: Zap, label: 'Performance Issue' },
  { id: 'Account Help', icon: User, label: 'Account Help' },
  { id: 'General Feedback', icon: MessageSquare, label: 'General Feedback' },
];

const faqs = [
  {
    question: 'How do I track my daily progress?',
    answer:
      'You can track your progress by defining custom fields in the settings and then logging your daily work in the dashboard. Our analytics will automatically visualize your progress over time.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes, you can export your tracking data as a CSV file from the settings screen. This allows you to use your data in other tools like Excel or Google Sheets.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'We take data security seriously. Your tracking data is stored securely and is only accessible by you. We use industry-standard encryption to protect your information.',
  },
  {
    question: 'How do I change my theme?',
    answer:
      'You can toggle between light and dark modes using the theme icon in the topbar. You can also customize more appearance settings in the settings screen.',
  },
];

export default function SupportTab() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Feedback',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const supportEmail = 'CreatorTracker.support@gmail.com';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Copied',
      description: 'Support email copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) {
      showToast({ type: 'error', title: 'Error', description: 'Please enter a message' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Success!',
          description: 'Your message has been sent to our support team.',
        });
        setFormData({ name: '', email: '', category: 'General Feedback', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to send message. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-4 fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight mb-0.5 text-foreground/90">
          Help & Support
        </h1>
        <p className="text-muted-foreground/50 text-[12px]">
          Get help, report issues, and share your feedback with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <div className="card p-5 border-white/[0.05] bg-white/[0.01]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="input-field py-2 text-sm bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input-field py-2 text-sm bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">
                  Category
                </label>
                <div className="relative group">
                  <select
                    className="input-field py-2 text-sm appearance-none cursor-pointer bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] transition-all pr-10"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none group-hover:text-muted-foreground/60 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">
                  Message
                </label>
                <textarea
                  placeholder="How can we help you?"
                  className="input-field min-h-[100px] py-2 text-sm resize-none bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] transition-all"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5 text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar / FAQ Section */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="card overflow-hidden divide-y divide-white/[0.04] border-white/[0.05] bg-white/[0.01]">
            <div className="px-4 py-2.5 bg-white/[0.02]">
              <h3 className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground/40">
                <HelpCircle size={12} className="text-primary/50" />
                FAQ
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {faqs.map((faq, index) => (
                <div key={index} className="transition-colors hover:bg-white/[0.01]">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left outline-none group"
                  >
                    <span className="text-[12px] font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp size={12} className="text-muted-foreground/50" />
                    ) : (
                      <ChevronDown
                        size={12}
                        className="text-muted-foreground/20 group-hover:text-muted-foreground/40"
                      />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-3 text-[11px] leading-relaxed text-muted-foreground/50 fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-primary/[0.02] border-primary/10 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
              <h4 className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                Urgent Help
              </h4>
            </div>
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
              For billing or critical account issues. Our team typically responds within 24h.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="space-y-4 pt-5 border-t border-white/[0.04]">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/30">
            Direct Contact
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <Clock size={10} className="text-emerald-500/50" />
            <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-wider">
              Fast Response
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discord Community */}
          <a
            href="https://discord.gg/car59aUh"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-3.5 flex items-center gap-4 group hover:border-primary/30 transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.02] border-white/[0.05]"
          >
            <div className="p-2 rounded-xl bg-[#5865F2]/5 text-[#5865F2]/70 group-hover:text-[#5865F2] ring-1 ring-[#5865F2]/10 group-hover:ring-[#5865F2]/30 transition-all">
              <DiscordIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-foreground/80 group-hover:text-foreground transition-colors">
                  Discord Community
                </h3>
                <ExternalLink
                  size={12}
                  className="text-muted-foreground/10 group-hover:text-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/50 truncate">
                Join for real-time community support.
              </p>
            </div>
          </a>

          {/* Email Support */}
          <div className="card p-3.5 flex items-center gap-4 bg-white/[0.01] border-white/[0.05]">
            <div className="p-2 rounded-xl bg-primary/5 text-primary/70 ring-1 ring-primary/10 transition-all">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-foreground/80 truncate">
                  {supportEmail}
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground/20 hover:text-primary"
                  title="Copy email"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/50">
                Official billing & account support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
