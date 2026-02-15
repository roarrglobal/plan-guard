import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import heroIllustration from "@/assets/landing-hero-illustration.png";

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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 bg-white">
      {/* Funky accent shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crimson/5 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cobalt/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-crimson/3 to-cobalt/3 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.span 
              className="inline-block text-sm font-semibold tracking-widest uppercase text-cobalt mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Decision Intelligence Platform
            </motion.span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              The flaw was always there.
              <br />
              <span className="bg-gradient-to-r from-crimson to-cobalt bg-clip-text text-transparent">You just saw it too late.</span>
            </h1>

            <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4">
              Stress-test your next...
            </div>
            
            <div className="h-10 md:h-12 mb-8 flex items-center justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-crimson to-cobalt bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
              <Link to="/signup?type=individual">
                <Button className="bg-crimson hover:bg-crimson/90 text-white px-8 h-12 text-base font-semibold min-w-[220px] shadow-lg shadow-crimson/20">
                  Get Started Free
                </Button>
              </Link>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <Button variant="outline" className="border-cobalt/30 text-cobalt hover:bg-cobalt/5 px-8 h-12 text-base font-semibold min-w-[220px]">
                  <Play className="w-4 h-4 mr-2" /> See How It Works
                </Button>
              </a>
            </div>

            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              15-day full access • No credit card required
            </motion.p>
          </motion.div>

          {/* Right: Illustration + Floating card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img 
              src={heroIllustration} 
              alt="Team brainstorming and making better decisions together" 
              className="w-full max-w-lg mx-auto rounded-2xl"
              loading="eager"
            />
            
            {/* Floating analysis card */}
            <motion.div
              className="absolute -bottom-6 -left-6 md:-left-12 bg-white rounded-xl shadow-xl border border-border p-4 max-w-[260px] floating-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-crimson" />
                <span className="text-xs font-medium text-foreground">Deep Snag Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">Blind Spots</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-cobalt to-cobalt/60 rounded-full" initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ delay: 1, duration: 1.5 }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-16">Failures</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-crimson to-crimson/60 rounded-full" initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ delay: 1.2, duration: 1.5 }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">3</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Verdict:</span>
                <span className="text-[10px] font-bold text-success">🟢 Proceed</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Company logos */}
        <motion.div 
          className="mt-20 flex flex-wrap items-center justify-center gap-8 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 1 }}
        >
          {["TechCorp", "FinanceIO", "ProductLab", "ScaleUp", "DataFlow"].map((c) => (
            <span key={c} className="text-lg font-bold text-foreground">{c}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
