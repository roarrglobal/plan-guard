import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, Users, BarChart3, FolderOpen, Shield, ArrowRight } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface SolutionTeamPageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  templateName: string;
  templateDesc: string;
  blindSpots: { title: string; desc: string }[];
  useCases: { title: string; desc: string }[];
  roiExample: { metric: string; value: string }[];
  roiTagline: string;
  ctaText?: string;
}

const teamFeatures = [
  { icon: Users, title: "Shared Decision History", desc: "Every decision documented and searchable across the team" },
  { icon: BarChart3, title: "Pattern Recognition", desc: "Identify recurring risks and successful strategies" },
  { icon: FolderOpen, title: "Department Templates", desc: "Pre-built analysis templates with domain-specific blind spots" },
  { icon: Shield, title: "Audit Trail", desc: "Complete record of who decided what, and when" },
];

export default function SolutionTeamPage({
  title, subtitle, stats, templateName, templateDesc, blindSpots,
  useCases, roiExample, roiTagline, ctaText = "Start Free Trial",
}: SolutionTeamPageProps) {
  usePageSEO({ title: `${title} — Snag`, description: subtitle });
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-cobalt/5 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold bg-cobalt/10 text-cobalt px-3 py-1.5 rounded-full mb-6">For Teams</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">{title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{subtitle}</p>
            <Link to="/signup?type=team">
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold">{ctaText}</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">The Problem</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white border border-border rounded-2xl p-6 text-center">
                <p className="text-3xl md:text-4xl font-bold text-cobalt mb-2">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Template */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold bg-cobalt/10 text-cobalt px-3 py-1.5 rounded-full mb-4">Template</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">{templateName}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{templateDesc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blindSpots.map((bs, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border border-border rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-cobalt shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{bs.title}</p>
                    <p className="text-sm text-muted-foreground">{bs.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Use Cases</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-white border border-border rounded-2xl p-6">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team features */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Team Features</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {teamFeatures.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg bg-cobalt/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-cobalt" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">{roiTagline}</h2>
          <div className="grid grid-cols-2 gap-4 mt-10 max-w-lg mx-auto">
            {roiExample.map((r, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-cobalt">{r.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to decide better?</h2>
          <p className="text-white/60 mb-8">15 days full access. No credit card.</p>
          <Link to="/signup?type=team">
            <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold">{ctaText}</Button>
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
