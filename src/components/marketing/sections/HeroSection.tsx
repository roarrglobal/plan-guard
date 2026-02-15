import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

const rotatingWords = ["job offer", "product launch", "hiring decision", "investment", "partnership", "vendor selection"];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Subtle particle-like dots */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="inline-block text-sm font-semibold tracking-widest uppercase text-white/60 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Decision Intelligence Platform
          </motion.span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            The flaw was always there.
            <br />
            <span className="hero-gradient-text">You just saw it too late.</span>
          </h1>

          <div className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-4">
            Stress-test your next...
          </div>
          
          <div className="h-10 md:h-12 mb-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="text-2xl md:text-3xl font-bold hero-gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {rotatingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/signup?type=individual">
              <Button className="bg-white text-[#1A1A2E] hover:bg-white/90 px-8 h-12 text-base font-semibold min-w-[220px] glow-button-white">
                Get Started Free
              </Button>
            </Link>
            <Link to="#how-it-works">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base font-semibold min-w-[220px]">
                <Play className="w-4 h-4 mr-2" /> See How It Works
              </Button>
            </Link>
          </div>

          <motion.p 
            className="text-sm text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            15-day full access • No credit card required
          </motion.p>
        </motion.div>

        {/* Floating product preview */}
        <motion.div
          className="mt-16 relative mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass-card p-6 md:p-8 floating-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="text-xs text-white/30 ml-2">Deep Snag Analysis</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-20">Blind Spots</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-cobalt to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ delay: 1, duration: 1.5 }} />
                </div>
                <span className="text-xs text-white/50">5 found</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-20">Failure Modes</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-crimson to-warning rounded-full" initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ delay: 1.2, duration: 1.5 }} />
                </div>
                <span className="text-xs text-white/50">3 critical</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-20">Kill Criteria</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-warning to-success rounded-full" initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ delay: 1.4, duration: 1.5 }} />
                </div>
                <span className="text-xs text-white/50">2 set</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/70">Verdict:</span>
              <span className="text-sm font-bold text-success">🟢 Proceed with Confidence</span>
            </div>
          </div>
        </motion.div>

        {/* Company logos placeholder */}
        <motion.div 
          className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1 }}
        >
          {["TechCorp", "FinanceIO", "ProductLab", "ScaleUp", "DataFlow"].map((c) => (
            <span key={c} className="text-lg font-bold text-white">{c}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
