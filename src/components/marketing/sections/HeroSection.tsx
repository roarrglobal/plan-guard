import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-[#F9FAFB] to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-cobalt mb-6">
            Decision Intelligence Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1A1A1A] leading-[1.1] mb-6">
            Spot the flaw<br />before it costs you
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered pre-mortem analysis that reveals blind spots, failure modes, and hidden risks. For professionals and teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/signup?type=individual">
              <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">
                Start Free — Personal
              </Button>
            </Link>
            <Link to="/signup?type=team">
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">
                Start Free — Teams
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            15-day full access • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
