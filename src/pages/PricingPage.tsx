import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/* ─── Plan data ─── */
const individualPlans = [
  {
    name: "Free", price: "$0", period: "", subtitle: "Forever free", badge: null, highlighted: false,
    features: [
      { text: "1 Deep Snag per month", included: true },
      { text: "3 Quick Snags per month", included: true },
      { text: "Decision journal (3 entries/day)", included: true },
      { text: "Basic pattern insights", included: true },
      { text: "7-day outcome tracking", included: true },
      { text: "Habits tracker", included: false },
      { text: "Full journal suite", included: false },
      { text: "Unlimited history", included: false },
      { text: "PDF export", included: false },
    ],
    cta: "Get Started Free", ctaLink: "/signup?type=individual", ctaStyle: "outline" as const,
  },
  {
    name: "Pro", price: "$12", period: "/month", subtitle: "Full personal power",
    annual: "$10/month billed annually", badge: "15-day free trial", highlighted: true,
    features: [
      { text: "50 Deep Snags per month", included: true },
      { text: "Unlimited Quick Snags", included: true },
      { text: "Full journal suite (6 types)", included: true },
      { text: "Habits tracker", included: true },
      { text: "Advanced pattern recognition", included: true },
      { text: "TRACE outcome tracking", included: true },
      { text: "Unlimited history", included: true },
      { text: "PDF export", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Start Free Trial", ctaLink: "/signup?type=individual&plan=pro", ctaStyle: "default" as const,
  },
];

const teamPlans = [
  {
    name: "Team", price: "$59", period: "/month", subtitle: "For small teams",
    annual: "$47/month billed annually", badge: "15-day free trial", highlighted: false,
    features: [
      { text: "Up to 5 team members", included: true },
      { text: "200 Deep Snags per month", included: true },
      { text: "Unlimited Quick Snags", included: true },
      { text: "All department templates", included: true },
      { text: "Team analytics", included: true },
      { text: "Shared decisions", included: true },
      { text: "Email notifications", included: true },
      { text: "PDF export", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Start Free Trial", ctaLink: "/signup?type=team&plan=team", ctaStyle: "default" as const,
  },
  {
    name: "Business", price: "$199", period: "/month", subtitle: "For growing teams",
    annual: "$159/month billed annually", badge: "Most Popular", highlighted: true,
    features: [
      { text: "Up to 20 team members", included: true },
      { text: "1,000 Deep Snags per month", included: true },
      { text: "Everything in Team, plus:", included: true },
      { text: "Custom templates", included: true },
      { text: "Audit log", included: true },
      { text: "Approval workflows", included: true },
      { text: "API access (coming soon)", included: true },
      { text: "Priority support", included: true },
      { text: "Dedicated onboarding call", included: true },
    ],
    cta: "Start Free Trial", ctaLink: "/signup?type=team&plan=business", ctaStyle: "default" as const,
  },
  {
    name: "Enterprise", price: "Custom", period: "", subtitle: "For large organizations",
    badge: null, highlighted: false,
    features: [
      { text: "Unlimited team members", included: true },
      { text: "Unlimited Deep Snags", included: true },
      { text: "Everything in Business, plus:", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated CSM", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Security review", included: true },
      { text: "Custom contract", included: true },
    ],
    cta: "Contact Sales", ctaLink: "/contact?type=enterprise", ctaStyle: "outline" as const,
  },
];

/* ─── Comparison table ─── */
const comparisonRows = [
  { feature: "Deep Snags/mo", free: "1", pro: "50", team: "200", business: "1,000", enterprise: "Unlimited" },
  { feature: "Quick Snags", free: "3/mo", pro: "∞", team: "∞", business: "∞", enterprise: "∞" },
  { feature: "Team members", free: "1", pro: "1", team: "5", business: "20", enterprise: "Unlimited" },
  { feature: "Decision journal", free: "Basic", pro: "Full", team: "—", business: "—", enterprise: "—" },
  { feature: "Habits tracker", free: false, pro: true, team: "—", business: "—", enterprise: "—" },
  { feature: "Department templates", free: "—", pro: "—", team: true, business: true, enterprise: true },
  { feature: "Custom templates", free: "—", pro: "—", team: false, business: true, enterprise: true },
  { feature: "Team analytics", free: "—", pro: "—", team: true, business: true, enterprise: true },
  { feature: "Audit log", free: "—", pro: "—", team: false, business: true, enterprise: true },
  { feature: "SSO/SAML", free: "—", pro: "—", team: false, business: false, enterprise: true },
  { feature: "Support", free: "Community", pro: "Email", team: "Email", business: "Priority", enterprise: "Dedicated" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    if (value === "—") return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
    return <span className="text-sm text-[#1A1A1A]">{value}</span>;
  }
  return value ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-red-400 mx-auto" />;
}

/* ─── FAQ ─── */
const faqs = [
  { q: "Can I switch between plans?", a: "Yes, upgrade or downgrade anytime. Changes apply immediately. Downgrades are pro-rated." },
  { q: "What happens when I hit my Deep Snag limit?", a: "We'll notify you when you're close. You can upgrade, or wait until next month. We never cut you off mid-decision." },
  { q: "Do you offer discounts?", a: "Yes. Nonprofits get 50% off. Startups (under $1M raised) get 25% off for the first year. Email us to apply." },
  { q: "What's your refund policy?", a: "30-day money-back guarantee, no questions asked. See our full refund policy." },
  { q: "Can I use Personal and Team plans together?", a: "Yes! Many users have a personal Pro account and are also part of a Team workspace. Decisions stay separate unless you choose to share." },
  { q: "Is there an annual discount?", a: "Yes, save ~20% with annual billing on all paid plans." },
];

export default function PricingPage() {
  const [tab, setTab] = useState<"teams" | "individual">("teams");
  const plans = tab === "individual" ? individualPlans : teamPlans;

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-[#F9FAFB] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">
              Simple pricing for better decisions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
              Start free. Upgrade when you're ready.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center bg-[#F9FAFB] border border-border rounded-full p-1">
              <button
                onClick={() => setTab("individual")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === "individual" ? "bg-white shadow-sm text-[#1A1A1A]" : "text-muted-foreground"}`}
              >
                Individual
              </button>
              <button
                onClick={() => setTab("teams")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === "teams" ? "bg-white shadow-sm text-[#1A1A1A]" : "text-muted-foreground"}`}
              >
                Teams
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-6 ${plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`rounded-2xl p-6 md:p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-2 border-cobalt bg-white shadow-lg relative"
                    : "border border-border bg-white"
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-6 text-xs font-semibold px-3 py-1 rounded-full ${
                    plan.badge === "Most Popular" ? "bg-cobalt text-white" : "bg-cobalt/10 text-cobalt"
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-[#1A1A1A]">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
                {"annual" in plan && plan.annual && (
                  <p className="text-xs text-muted-foreground mb-4">or {plan.annual}</p>
                )}
                {!("annual" in plan && plan.annual) && <div className="mb-4" />}

                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included
                        ? <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        : <X className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                      }
                      <span className={f.included ? "text-[#1A1A1A]" : "text-muted-foreground"}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.ctaLink}>
                  <Button
                    className={`w-full h-11 font-semibold ${
                      plan.ctaStyle === "outline"
                        ? "border border-border bg-white text-[#1A1A1A] hover:bg-muted"
                        : "bg-cobalt hover:bg-cobalt-hover text-white"
                    }`}
                    variant={plan.ctaStyle === "outline" ? "outline" : "default"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Compare all plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 pr-4 text-sm font-medium text-muted-foreground">Feature</th>
                  <th className="py-4 px-3 text-sm font-medium text-muted-foreground text-center">Free</th>
                  <th className="py-4 px-3 text-sm font-medium text-muted-foreground text-center">Pro</th>
                  <th className="py-4 px-3 text-sm font-medium text-muted-foreground text-center">Team</th>
                  <th className="py-4 px-3 text-sm font-semibold text-cobalt text-center bg-cobalt/5 rounded-t-lg">Business</th>
                  <th className="py-4 px-3 text-sm font-medium text-muted-foreground text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-3.5 pr-4 text-sm text-[#1A1A1A] font-medium">{row.feature}</td>
                    <td className="py-3.5 px-3 text-center"><CellValue value={row.free} /></td>
                    <td className="py-3.5 px-3 text-center"><CellValue value={row.pro} /></td>
                    <td className="py-3.5 px-3 text-center"><CellValue value={row.team} /></td>
                    <td className="py-3.5 px-3 text-center bg-cobalt/5"><CellValue value={row.business} /></td>
                    <td className="py-3.5 px-3 text-center"><CellValue value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 data-[state=open]:bg-[#F9FAFB]">
                <AccordionTrigger className="text-sm font-semibold text-[#1A1A1A] py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Still have questions?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-6">
            <Link to="/contact?type=enterprise">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-11 min-w-[180px]">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/40">
            All plans include 15-day free trial. No credit card required.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
