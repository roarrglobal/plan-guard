import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Briefcase, Home, TrendingUp, Heart, Brain, Clock, UserCheck, BookOpen,
  Target, Repeat, ClipboardList, BarChart3, CheckCircle, AlertTriangle,
  Eye, ShieldAlert, HelpCircle, ArrowRight,
} from "lucide-react";

const useCases = [
  { title: "Career Moves", items: ["Should I take this job offer?", "Should I ask for a promotion?", "Should I change careers?", "Should I start my own business?"], icon: Briefcase },
  { title: "Major Purchases", items: ["Should I buy this house?", "Is this car worth it?", "Should I invest in this renovation?"], icon: Home },
  { title: "Financial Decisions", items: ["Should I make this investment?", "Should I take on this debt?", "Is this financial advisor trustworthy?"], icon: TrendingUp },
  { title: "Life Transitions", items: ["Should I relocate?", "Is this relationship right?", "Should I go back to school?"], icon: Heart },
];

const blindSpots = [
  { icon: Brain, text: "Emotional reasoning masquerading as logic" },
  { icon: Clock, text: "Sunk cost bias keeping you stuck" },
  { icon: UserCheck, text: "Social pressure disguised as opportunity" },
  { icon: Eye, text: "Information gaps you don't know exist" },
  { icon: ShieldAlert, text: "Timeline pressure forcing premature decisions" },
];

const features = [
  { icon: BookOpen, title: "Daily Journal", desc: "6 journal types: Free Write, Gratitude, Manifestation, Morning Pages, Evening Review, Reflection" },
  { icon: Repeat, title: "Habits Tracker", desc: "Build decision-making habits with streak counters and daily check-ins" },
  { icon: ClipboardList, title: "Quick Retro", desc: "30-60 second daily reflection on what went well and what you'd change" },
  { icon: BarChart3, title: "Personal Patterns", desc: "See your accuracy rate, blind spot patterns, and decision strengths" },
  { icon: CheckCircle, title: "TRACE Outcome Tracking", desc: "Set check-ins at 30, 60, 90 days. Log outcomes. Build your accuracy score." },
];

const sampleBlindSpots = [
  "Equity is illiquid for years — you're trading guaranteed income for a lottery ticket",
  "Startup culture may differ drastically from what you've been told in interviews",
  "You're comparing current frustrations with an idealized future",
];

export default function SolutionPersonalPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-crimson/5 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold bg-crimson/10 text-crimson px-3 py-1.5 rounded-full mb-6">For Personal Use</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">
              Make confident personal decisions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Career moves, investments, and life choices—analyzed like a professional would for a Fortune 500 client.
            </p>
            <Link to="/signup?type=individual">
              <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold">Start Free Trial</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">
            The most important decisions of your life don't come with an instruction manual.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Job offers that keep you up at night", "Investments where the stakes feel too high", "Life transitions with no clear answer"].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="border border-border rounded-2xl p-6 bg-white text-center">
                <p className="text-base font-medium text-[#1A1A1A]">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-4">Decisions Snag helps with</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">From career moves to life transitions</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <motion.div key={uc.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-crimson/10 flex items-center justify-center mb-4">
                  <uc.icon className="w-5 h-5 text-crimson" />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">{uc.title}</h3>
                <ul className="space-y-2">
                  {uc.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-crimson mt-1.5 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blind spots */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-4">Your brain has blind spots. Snag doesn't.</h2>
          <p className="text-muted-foreground text-center mb-12">Blind spots specific to personal decisions</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blindSpots.map((bs, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 bg-white border border-border rounded-xl p-5">
                <bs.icon className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <p className="text-sm text-[#1A1A1A]">{bs.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal features */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-4">Personal Features</h2>
          <p className="text-muted-foreground text-center mb-12">Build your personal decision intelligence over time.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-crimson/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-crimson" />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample analysis */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Sample Analysis</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white border border-border rounded-2xl p-6 md:p-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decision</p>
            <p className="text-lg font-semibold text-[#1A1A1A] mb-6">"Should I accept this startup job offer?"</p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-6">
              <AlertTriangle className="w-3.5 h-3.5" /> Proceed with Caution
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              The offer presents exciting growth potential but carries significant financial and career risks that need careful evaluation against your current stability.
            </p>

            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Top Blind Spots</h4>
            <ul className="space-y-2 mb-6">
              {sampleBlindSpots.map((bs, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#1A1A1A]">
                  <Eye className="w-4 h-4 text-crimson shrink-0 mt-0.5" />{bs}
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Key Failure Mode</h4>
            <p className="text-sm text-muted-foreground mb-6 pl-6 border-l-2 border-crimson/30">
              Startup runs out of runway within 18 months, leaving you job-hunting in a down market with a résumé gap.
            </p>

            <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] mb-1">The Unasked Question</p>
                  <p className="text-sm text-muted-foreground italic">"If this fails, will you regret trying or regret not knowing?"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Start free. Upgrade when you're ready.</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-10 max-w-xl mx-auto">
            <div className="border border-border rounded-2xl p-6 text-left">
              <h3 className="font-bold text-[#1A1A1A]">Free</h3>
              <p className="text-3xl font-bold text-[#1A1A1A] mt-2">$0</p>
              <p className="text-sm text-muted-foreground mt-1">Basic access</p>
            </div>
            <div className="border-2 border-crimson rounded-2xl p-6 text-left">
              <h3 className="font-bold text-[#1A1A1A]">Pro</h3>
              <p className="text-3xl font-bold text-[#1A1A1A] mt-2">$12<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-sm text-muted-foreground mt-1">Full features</p>
            </div>
          </div>
          <Link to="/signup?type=individual" className="inline-block mt-8">
            <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to decide better?</h2>
          <p className="text-white/60 mb-8">15-day full access. No credit card required.</p>
          <Link to="/signup?type=individual">
            <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold">Start Free Trial</Button>
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
