import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Eye, AlertTriangle, Bell, DoorOpen, HelpCircle, Target,
  Zap, CheckCircle, TrendingUp, BookOpen, Repeat, ClipboardList,
  Users, BarChart3, FolderOpen, Shield, Lock, Settings,
  Slack, Globe, Smartphone, Code,
  Mail,
} from "lucide-react";
import { useState } from "react";

/* ─── SNAG Framework letters ─── */
const framework = [
  { letter: "S", title: "Surface the Hidden", desc: "Identify blind spots and assumptions masquerading as facts", icon: Eye },
  { letter: "N", title: "Name the Failures", desc: "Map exactly how this decision could fail, not just if", icon: AlertTriangle },
  { letter: "A", title: "Alert Early", desc: "Warning signals to watch for in the first 30, 60, 90 days", icon: Bell },
  { letter: "G", title: "Gate the Exit", desc: "Clear criteria for when to abandon or pivot", icon: DoorOpen },
];

/* ─── Core features ─── */
const coreFeatures = [
  {
    icon: Target, title: "Deep Snag Analysis",
    desc: "Full pre-mortem analysis in under 5 minutes",
    details: ["3–5 blind spots with testing suggestions", "3–5 failure modes with likelihood ratings", "Warning signals with timeline", "Kill criteria with action triggers", "The unasked question", "Clear verdict and recommendation"],
    cta: "Try Deep Snag", ctaLink: "/analyze",
  },
  {
    icon: Zap, title: "Quick Snag",
    desc: "30-second decision check for time-sensitive choices",
    details: ["Top 3 risks", "Key recommendation", "Immediate actions"],
    footer: "Perfect for: Daily decisions, quick sanity checks, decision journaling",
  },
  {
    icon: CheckCircle, title: "Outcome Tracking (TRACE)",
    desc: "Close the loop. Learn from every decision.",
    details: ["Set check-in date (30, 60, 90 days)", "Get reminder when it's time", "Log outcome with one tap", "See which predictions hit", "Build your accuracy score"],
    footer: "Most decision tools end at the decision. Snag starts there.",
  },
  {
    icon: TrendingUp, title: "Pattern Recognition",
    desc: "Your personal decision intelligence",
    details: ["See your accuracy rate", "Discover your blind spot patterns", "Identify decision strengths", "Get personalized recommendations"],
    footer: "Unlocks after 5+ logged outcomes.",
  },
];

/* ─── Personal features ─── */
const personalFeatures = [
  {
    icon: BookOpen, title: "Decision Journal",
    bullets: ["Free Write", "Gratitude", "Manifestation", "Morning Pages", "Evening Review", "Reflection"],
    footer: "Build the decision-making habit",
  },
  {
    icon: Repeat, title: "Habits Tracker",
    bullets: ["Pre-built decision habits", "Streak counters", "Daily check-ins", "Progress visualization"],
  },
  {
    icon: ClipboardList, title: "Quick Retro",
    bullets: ["30–60 second daily reflection", '"What went well? What would I change?"', "Mood tracking", "Pattern insights"],
  },
];

/* ─── Team features ─── */
const teamFeatures = [
  {
    icon: FolderOpen, title: "Department Templates",
    desc: "Domain-specific blind spots. Built by experts.",
    bullets: ["Sales: Deal Pursuit", "Finance: Budget Approval", "Product: Feature Prioritization", "HR: Hiring Decision", "Marketing: Campaign Launch", "Operations: Process Automation", "Strategy: M&A Evaluation"],
  },
  {
    icon: BarChart3, title: "Team Analytics",
    desc: "See how your team decides",
    bullets: ["Team prediction accuracy", "Decisions by category", "Member activity", "Outcome trends"],
  },
  {
    icon: Users, title: "Shared Decisions",
    desc: "Every decision documented",
    bullets: ["Visibility controls: Private, Team, Leadership", "Collaborative analysis", "Institutional memory"],
  },
  {
    icon: Shield, title: "Audit Log",
    desc: "Perfect for regulated industries",
    bullets: ["Complete activity trail", "Who decided what, when", "Compliance-ready exports"],
  },
  {
    icon: Settings, title: "Custom Templates",
    desc: "Make Snag yours",
    bullets: ["Create your own templates", "Add custom fields", "Share across team"],
    badge: "Business tier",
  },
];

/* ─── Coming soon ─── */
const comingSoon = [
  { icon: Slack, label: "Slack Integration" },
  { icon: Globe, label: "Salesforce Integration" },
  { icon: Code, label: "API Access" },
  { icon: Smartphone, label: "Mobile App" },
];

/* ─── Reusable card ─── */
function FeatureCard({ icon: Icon, title, desc, bullets, details, footer, cta, ctaLink, badge, idx }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (idx || 0) * 0.05 }}
      className="bg-white border border-border rounded-2xl p-6 md:p-8 flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-border flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#1A1A1A]" />
        </div>
        {badge && <span className="text-xs font-semibold bg-cobalt/10 text-cobalt px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h3>
      {desc && <p className="text-sm text-muted-foreground mb-4">{desc}</p>}
      <ul className="space-y-2 flex-1">
        {(details || bullets || []).map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#1A1A1A]">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      {footer && <p className="text-xs text-muted-foreground mt-4 italic">{footer}</p>}
      {cta && (
        <Link to={ctaLink || "#"} className="mt-4">
          <Button className="w-full bg-cobalt hover:bg-cobalt-hover text-white">{cta}</Button>
        </Link>
      )}
    </motion.div>
  );
}

export default function ProductPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#F9FAFB] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">
              Decision Intelligence, Automated
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The complete platform for making better decisions—whether you're an individual professional or leading a team.
            </p>
            <Link to="/signup?type=individual">
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold">Start Free Trial</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── SNAG FRAMEWORK ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">The SNAG Framework™</h2>
            <p className="text-lg text-muted-foreground">A structured methodology for pre-mortem analysis</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {framework.map((f, i) => (
              <motion.div
                key={f.letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-5 border border-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center text-xl font-bold shrink-0">
                  {f.letter}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Plus extras */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-cobalt/20 bg-cobalt/5 rounded-2xl p-6 flex gap-4">
              <HelpCircle className="w-6 h-6 text-cobalt shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-semibold text-[#1A1A1A] mb-1">The Unasked Question</h4>
                <p className="text-sm text-muted-foreground">The uncomfortable truth you should be asking</p>
              </div>
            </div>
            <div className="border border-crimson/20 bg-crimson/5 rounded-2xl p-6 flex gap-4">
              <Target className="w-6 h-6 text-crimson shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-semibold text-[#1A1A1A] mb-1">Bottom Line</h4>
                <p className="text-sm text-muted-foreground">Clear verdict with confidence level</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full mb-4">Everyone</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">Core Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((f, i) => <FeatureCard key={f.title} {...f} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ─── PERSONAL FEATURES ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold bg-crimson/10 text-crimson px-3 py-1.5 rounded-full mb-4">For Personal Use</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">Personal Features</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {personalFeatures.map((f, i) => <FeatureCard key={f.title} {...f} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ─── TEAM FEATURES ─── */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold bg-cobalt/10 text-cobalt px-3 py-1.5 rounded-full mb-4">For Teams</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">Team Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamFeatures.map((f, i) => <FeatureCard key={f.title} {...f} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ─── COMING SOON ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-12">Coming Soon</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {comingSoon.map((item) => (
              <div key={item.label} className="border border-border rounded-xl p-5 opacity-50">
                <item.icon className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <span className="text-xs text-muted-foreground/60 mt-1 inline-block">Coming Soon</span>
              </div>
            ))}
          </div>
          <div className="max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-4">Get notified when integrations launch</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-[#F9FAFB] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cobalt/30"
              />
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-6">Notify Me</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to decide better?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/signup?type=individual">
              <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">Start Free — Personal</Button>
            </Link>
            <Link to="/signup?type=team">
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">Start Free — Teams</Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
