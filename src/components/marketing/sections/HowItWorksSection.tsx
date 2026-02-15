import { Pencil, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { num: "01", icon: Pencil, title: "Describe", text: "Tell us what you're deciding. Job offer, vendor selection, product launch—any high-stakes choice.", gradient: "from-cobalt to-purple-500" },
  { num: "02", icon: Zap, title: "Analyze", text: "Our AI applies the SNAG Framework: Surface blind spots, Name failure modes, Alert with warning signals, Gate with kill criteria.", gradient: "from-purple-500 to-crimson" },
  { num: "03", icon: CheckCircle, title: "Decide", text: "See what could go wrong before it goes wrong. Get a clear verdict and actionable recommendations.", gradient: "from-crimson to-warning" },
  { num: "04", icon: TrendingUp, title: "Learn", text: "Track outcomes with TRACE. Build your decision intelligence. Get better over time.", gradient: "from-warning to-success" },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#0f172a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cobalt/5 rounded-full blur-[120px]" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-cobalt mb-4">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The SNAG Framework™</h2>
          <p className="text-lg text-white/50">Structured pre-mortems in under 5 minutes</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-[72px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cobalt via-purple-500 via-crimson to-success opacity-30" />
          
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center relative group"
            >
              <span className="text-xs font-bold text-cobalt tracking-widest">{s.num}</span>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} p-px mx-auto my-4 group-hover:shadow-glow transition-shadow duration-300`}>
                <div className="w-full h-full rounded-2xl bg-[#0f172a] flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
