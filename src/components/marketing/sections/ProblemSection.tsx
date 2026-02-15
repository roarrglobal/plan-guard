import { MessageSquare, RefreshCw, Brain } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="py-20 md:py-28 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
            Every company has a CRM. An ERP. An HRIS.
          </h2>
          <p className="text-xl text-muted-foreground">None have a decision system.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center mb-5">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Organizations waste <span className="font-semibold text-[#1A1A1A]">$250 billion annually</span> on poor decisions. — Source: McKinsey
        </p>
      </div>
    </section>
  );
}
