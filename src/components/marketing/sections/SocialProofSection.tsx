import { motion } from "framer-motion";

const testimonials = [
  { quote: "Snag helped us catch a critical vendor risk we'd completely missed. Saved us six figures.", name: "Sarah K.", title: "VP of Operations", company: "Series B SaaS" },
  { quote: "We went from 3-hour decision meetings to 30 minutes. The pre-mortem framework changes how you think.", name: "James T.", title: "Head of Product", company: "FinTech Startup" },
  { quote: "Finally, a tool that treats decisions as assets worth tracking. Our team's alignment improved overnight.", name: "Priya M.", title: "Director of Strategy", company: "Enterprise Consulting" },
];

export function SocialProofSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cobalt bg-cobalt/5 px-3 py-1.5 rounded-full mb-4">Beta</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Join the beta</h2>
          <p className="text-lg text-muted-foreground">50+ teams already making better decisions</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="border border-border rounded-2xl p-6"
            >
              <p className="text-sm text-[#1A1A1A] leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 opacity-30">
          {["Company A", "Company B", "Company C", "Company D", "Company E"].map((c) => (
            <span key={c} className="text-lg font-bold text-[#1A1A1A]">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
