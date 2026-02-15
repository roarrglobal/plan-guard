import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, DollarSign, Calculator, Box, Users, Megaphone, Settings, ArrowRight } from "lucide-react";

const teamCards = [
  { icon: DollarSign, title: "Sales Teams", text: "Stop pursuing deals that won't close", link: "/solutions/sales" },
  { icon: Calculator, title: "Finance Teams", text: "Approve budgets that deliver ROI", link: "/solutions/finance" },
  { icon: Box, title: "Product Teams", text: "Build features people actually use", link: "/solutions/product" },
  { icon: Users, title: "HR Teams", text: "Make hiring decisions that stick", link: "/solutions/hr" },
  { icon: Megaphone, title: "Marketing Teams", text: "Launch campaigns that land", link: "/solutions/marketing" },
  { icon: Settings, title: "Operations Teams", text: "Implement changes that work", link: "/solutions/operations" },
];

export default function SolutionsPage() {
  usePageSEO({ title: "Solutions — Snag", description: "Decision intelligence for every role. Personal use, Sales, Finance, Product, HR, Marketing, and Operations." });
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#F9FAFB] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">
              Solutions for every decision-maker
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're making personal choices or leading a team, Snag helps you decide with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* For Professionals */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">For Professionals</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <Link to="/solutions/personal" className="block border border-border rounded-2xl p-8 hover:border-crimson/40 hover:shadow-lg transition-all group">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-crimson" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Personal Decisions</h3>
                  <p className="text-muted-foreground mb-4">Career moves, major purchases, investments, and life transitions</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-crimson group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* For Teams */}
      <section className="py-20 md:py-28 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">For Teams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link to={card.link} className="block border border-border rounded-2xl p-6 bg-white hover:border-cobalt/40 hover:shadow-lg transition-all group h-full">
                  <div className="w-10 h-10 rounded-lg bg-cobalt/10 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-cobalt" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{card.text}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cobalt group-hover:gap-2.5 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
