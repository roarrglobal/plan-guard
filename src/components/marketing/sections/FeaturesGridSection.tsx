import { Link } from "react-router-dom";
import { Target, Zap, CheckCircle, BookOpen, FolderOpen, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Target, title: "Deep Snag Analysis", text: "Full pre-mortem analysis in 2–5 minutes. Blind spots, failure modes, warning signals, kill criteria.", badge: "Everyone", gradient: "from-cobalt to-purple-500" },
  { icon: Zap, title: "Quick Snag", text: "30-second decision check for faster choices. Key risks and immediate actions.", badge: "Everyone", gradient: "from-purple-500 to-crimson" },
  { icon: CheckCircle, title: "Outcome Tracking (TRACE)", text: "Log what actually happened. Build your prediction accuracy over time.", badge: "Everyone", gradient: "from-success to-cobalt" },
  { icon: BookOpen, title: "Decision Journal", text: "Six journal types. Morning pages, gratitude, reflection. Build the decision habit.", badge: "Personal", gradient: "from-crimson to-warning" },
  { icon: FolderOpen, title: "Department Templates", text: "Sales, Finance, Product, HR, Marketing, Operations. Domain-specific blind spots.", badge: "Teams", gradient: "from-cobalt to-success" },
  { icon: BarChart3, title: "Team Analytics", text: "Track team accuracy, identify patterns, measure improvement over time.", badge: "Teams", gradient: "from-warning to-crimson" },
];

export function FeaturesGridSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0f172a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cobalt/5 rounded-full blur-[120px]" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Everything you need to decide better
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card p-6 group hover:border-white/20 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center group-hover:shadow-glow transition-shadow`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  f.badge === "Teams" ? "bg-cobalt/20 text-cobalt" : 
                  f.badge === "Personal" ? "bg-crimson/20 text-crimson" : 
                  "bg-white/10 text-white/70"
                }`}>{f.badge}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/product" className="text-sm font-semibold text-cobalt hover:text-cobalt/80 transition-colors">
            See all features →
          </Link>
        </div>
      </div>
    </section>
  );
}
