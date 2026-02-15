import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  { quote: "Snag helped us catch a critical vendor risk we'd completely missed. Saved us six figures.", name: "Sarah K.", title: "VP of Operations", company: "Series B SaaS" },
  { quote: "We went from 3-hour decision meetings to 30 minutes. The pre-mortem framework changes how you think.", name: "James T.", title: "Head of Product", company: "FinTech Startup" },
  { quote: "Finally, a tool that treats decisions as assets worth tracking. Our team's alignment improved overnight.", name: "Priya M.", title: "Director of Strategy", company: "Enterprise Consulting" },
];

export function SocialProofSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cobalt bg-cobalt/5 px-3 py-1.5 rounded-full mb-4">Beta</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Join the beta</h2>
          <p className="text-lg text-muted-foreground">50+ teams already making better decisions</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border border-border rounded-2xl p-6 relative group hover:shadow-lg hover:border-cobalt/20 transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <Quote className="w-8 h-8 text-cobalt/10 mb-4" />
              <p className="text-sm text-[#1A1A1A] leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cobalt to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex flex-wrap items-center justify-center gap-8 opacity-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
        >
          {["TechCorp", "FinanceIO", "ProductLab", "ScaleUp", "DataFlow"].map((c) => (
            <span key={c} className="text-lg font-bold text-[#1A1A1A]">{c}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
