import { Pencil, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { num: "01", icon: Pencil, title: "Describe", text: "Tell us what you're deciding. Job offer, vendor selection, product launch—any high-stakes choice.", color: "bg-crimson" },
  { num: "02", icon: Zap, title: "Analyze", text: "Our AI applies the SNAG Framework: Surface blind spots, Name failure modes, Alert with warning signals, Gate with kill criteria.", color: "bg-cobalt" },
  { num: "03", icon: CheckCircle, title: "Decide", text: "See what could go wrong before it goes wrong. Get a clear verdict and actionable recommendations.", color: "bg-crimson" },
  { num: "04", icon: TrendingUp, title: "Learn", text: "Track outcomes with TRACE. Build your decision intelligence. Get better over time.", color: "bg-cobalt" },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-crimson/3 to-cobalt/3 rounded-full blur-[150px]" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-cobalt bg-cobalt/5 px-3 py-1.5 rounded-full mb-4">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">The SNAG Framework™</h2>
          <p className="text-lg text-muted-foreground">Structured pre-mortems in under 5 minutes</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-crimson/20 via-cobalt/20 to-crimson/20" />

          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative text-center group"
            >
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-muted-foreground mb-2 block">{s.num}</span>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
