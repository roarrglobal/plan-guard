import { Pencil, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { num: "01", icon: Pencil, title: "Describe", text: "Tell us what you're deciding. Job offer, vendor selection, product launch—any high-stakes choice." },
  { num: "02", icon: Zap, title: "Analyze", text: "Our AI applies the SNAG Framework: Surface blind spots, Name failure modes, Alert with warning signals, Gate with kill criteria." },
  { num: "03", icon: CheckCircle, title: "Decide", text: "See what could go wrong before it goes wrong. Get a clear verdict and actionable recommendations." },
  { num: "04", icon: TrendingUp, title: "Learn", text: "Track outcomes with TRACE. Build your decision intelligence. Get better over time." },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">The SNAG Framework™</h2>
          <p className="text-lg text-muted-foreground">Structured pre-mortems in under 5 minutes</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <span className="text-xs font-bold text-cobalt tracking-widest">{s.num}</span>
              <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] border border-border flex items-center justify-center mx-auto my-4">
                <s.icon className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
