import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "personal", label: "Personal",
    headline: "Make confident personal decisions",
    decisions: ["Career moves", "Major purchases", "Investments", "Life transitions"],
    blindSpots: ["Emotional bias", "Sunk cost fallacy", "Information gaps", "Timeline pressure"],
    stat: "The average person makes 35,000 decisions daily. A few matter enormously.",
    link: "/solutions/personal",
  },
  {
    id: "sales", label: "Sales",
    headline: "Stop pursuing deals that won't close",
    decisions: ["Deal pursuit", "Pricing strategy", "Territory planning", "Account strategy"],
    blindSpots: ["Champion dependency", "Budget timing", "Competitive landscape"],
    stat: "40% of forecasted deals end in 'no decision'.",
    link: "/solutions/sales",
  },
  {
    id: "finance", label: "Finance",
    headline: "Stress-test every financial decision",
    decisions: ["Investment allocation", "Budget planning", "Vendor contracts", "Risk assessment"],
    blindSpots: ["Recency bias", "Correlation ≠ causation", "Hidden tail risks"],
    stat: "CFOs cite 'poor data quality' as the #1 barrier to better decisions.",
    link: "/solutions/finance",
  },
  {
    id: "product", label: "Product",
    headline: "Ship the right thing, not just fast",
    decisions: ["Feature prioritization", "Launch timing", "Build vs. buy", "Sunset decisions"],
    blindSpots: ["Survivorship bias", "Feature creep", "Market timing"],
    stat: "42% of startups fail due to no market need — a decision problem.",
    link: "/solutions/product",
  },
  {
    id: "hr", label: "HR",
    headline: "Make people decisions with clarity",
    decisions: ["Hiring calls", "Reorgs", "Compensation", "Culture initiatives"],
    blindSpots: ["Halo effect", "Cultural fit bias", "Over-indexing on credentials"],
    stat: "A bad hire costs 30% of that employee's first-year earnings.",
    link: "/solutions/hr",
  },
  {
    id: "marketing", label: "Marketing",
    headline: "Invest budget where it actually works",
    decisions: ["Campaign strategy", "Channel allocation", "Brand positioning", "Partnership deals"],
    blindSpots: ["Attribution errors", "Trend chasing", "Audience assumptions"],
    stat: "26% of marketing budgets are wasted on wrong channels.",
    link: "/solutions/marketing",
  },
  {
    id: "operations", label: "Operations",
    headline: "Optimize without breaking things",
    decisions: ["Process changes", "Vendor selection", "Capacity planning", "Tech stack"],
    blindSpots: ["Second-order effects", "Change fatigue", "Integration complexity"],
    stat: "70% of change initiatives fail to achieve their goals.",
    link: "/solutions/operations",
  },
];

export function UseCasesSection() {
  const [active, setActive] = useState("personal");
  const tab = tabs.find((t) => t.id === active)!;

  return (
    <section className="py-20 md:py-28 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">
          Built for decisions that matter
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === t.id
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white text-muted-foreground border border-border hover:text-[#1A1A1A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-border p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6">{tab.headline}</h3>
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Decision Types</p>
                  <div className="flex flex-wrap gap-2">
                    {tab.decisions.map((d) => (
                      <span key={d} className="text-sm px-3 py-1.5 bg-[#F9FAFB] rounded-lg border border-border text-[#1A1A1A]">{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Blind Spots We Catch</p>
                  <ul className="space-y-2">
                    {tab.blindSpots.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div className="bg-[#F9FAFB] rounded-xl p-6 border border-border mb-6">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{tab.stat}"</p>
                </div>
                <Link
                  to={tab.link}
                  className="text-sm font-semibold text-cobalt hover:underline underline-offset-4"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
