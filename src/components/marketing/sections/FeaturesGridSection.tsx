import { Link } from "react-router-dom";
import { Target, Zap, CheckCircle, BookOpen, FolderOpen, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Target, title: "Deep Snag Analysis", text: "Full pre-mortem analysis in 2–5 minutes. Blind spots, failure modes, warning signals, kill criteria.", badge: "Everyone", badgeColor: "bg-[#1A1A1A] text-white" },
  { icon: Zap, title: "Quick Snag", text: "30-second decision check for faster choices. Key risks and immediate actions.", badge: "Everyone", badgeColor: "bg-[#1A1A1A] text-white" },
  { icon: CheckCircle, title: "Outcome Tracking (TRACE)", text: "Log what actually happened. Build your prediction accuracy over time.", badge: "Everyone", badgeColor: "bg-[#1A1A1A] text-white" },
  { icon: BookOpen, title: "Decision Journal", text: "Six journal types. Morning pages, gratitude, reflection. Build the decision habit.", badge: "Personal", badgeColor: "bg-crimson/10 text-crimson" },
  { icon: FolderOpen, title: "Department Templates", text: "Sales, Finance, Product, HR, Marketing, Operations. Domain-specific blind spots.", badge: "Teams", badgeColor: "bg-cobalt/10 text-cobalt" },
  { icon: BarChart3, title: "Team Analytics", text: "Track team accuracy, identify patterns, measure improvement over time.", badge: "Teams", badgeColor: "bg-cobalt/10 text-cobalt" },
];

export function FeaturesGridSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-16">
          Everything you need to decide better
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-border hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-border flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.badgeColor}`}>{f.badge}</span>
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/product" className="text-sm font-semibold text-cobalt hover:underline underline-offset-4">
            See all features →
          </Link>
        </div>
      </div>
    </section>
  );
}
