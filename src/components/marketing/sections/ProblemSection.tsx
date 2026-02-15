import { MessageSquare, RefreshCw, Brain } from "lucide-react";
import { motion } from "framer-motion";
import snagDetective from "@/assets/landing-snag-detective.png";

const problems = [
  {
    icon: MessageSquare,
    title: "Decisions happen everywhere",
    text: "Slack threads. Email chains. Meetings with no notes. Important choices made and forgotten.",
  },
  {
    icon: RefreshCw,
    title: "Same mistakes, repeated",
    text: "Without tracking outcomes, you can't learn. Last year's failed strategy becomes this year's failed strategy.",
  },
  {
    icon: Brain,
    title: "No structured thinking",
    text: "Gut instinct isn't a strategy. But who has time for McKinsey-grade analysis on every decision?",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Every company has a CRM. An ERP. An HRIS.
            </h2>
            <p className="text-xl text-muted-foreground">None have a decision system.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img 
              src={snagDetective} 
              alt="Detective finding flaws in decisions" 
              className="w-64 md:w-80 rounded-xl"
              loading="lazy"
            />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 border border-border group hover:shadow-lg hover:border-crimson/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-crimson to-cobalt flex items-center justify-center mb-5 group-hover:shadow-lg group-hover:shadow-crimson/20 transition-shadow duration-300">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Organizations waste <span className="font-semibold text-foreground">$250 billion annually</span> on poor decisions. — Source: McKinsey
        </motion.p>
      </div>
    </section>
  );
}
