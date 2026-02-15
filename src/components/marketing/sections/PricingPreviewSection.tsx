import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const individual = [
  { name: "Free", price: "$0", desc: "Basic access" },
  { name: "Pro", price: "$12/mo", desc: "Full personal features", popular: true },
];

const teams = [
  { name: "Team", price: "$59/mo", desc: "Up to 5 members" },
  { name: "Business", price: "$199/mo", desc: "Up to 20 members", popular: true },
  { name: "Enterprise", price: "Custom", desc: "Unlimited" },
];

export function PricingPreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple pricing. Serious value.</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Individuals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-crimson mb-6">For Individuals</h3>
            <div className="space-y-3">
              {individual.map((p) => (
                <div key={p.name} className={`flex items-center justify-between bg-card border rounded-xl px-5 py-4 transition-all duration-300 ${p.popular ? "border-crimson/30 shadow-md hover:shadow-lg" : "border-border hover:shadow-md"}`}>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {p.popular && <Sparkles className="w-4 h-4 text-crimson" />}
                  </div>
                  <p className="text-lg font-bold text-foreground">{p.price}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Teams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cobalt mb-6">For Teams</h3>
            <div className="space-y-3">
              {teams.map((p) => (
                <div key={p.name} className={`flex items-center justify-between bg-card border rounded-xl px-5 py-4 transition-all duration-300 ${p.popular ? "border-cobalt/30 shadow-md hover:shadow-lg" : "border-border hover:shadow-md"}`}>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {p.popular && <Sparkles className="w-4 h-4 text-cobalt" />}
                  </div>
                  <p className="text-lg font-bold text-foreground">{p.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <Link to="/pricing" className="text-sm font-semibold text-cobalt hover:underline underline-offset-4">
            See full pricing →
          </Link>
          <p className="text-sm text-muted-foreground">All plans include 15-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}
