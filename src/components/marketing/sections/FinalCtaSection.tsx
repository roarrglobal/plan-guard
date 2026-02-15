import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Stop deciding blind</h2>
          <p className="text-lg text-white/50 mb-10">Join thousands making better decisions with Snag</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/signup?type=individual">
              <Button className="bg-white text-[#1A1A2E] hover:bg-white/90 px-8 h-12 text-base font-semibold min-w-[220px] glow-button-white">
                Start Free — Personal
              </Button>
            </Link>
            <Link to="/signup?type=team">
              <Button className="border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base font-semibold min-w-[220px]" variant="outline">
                Start Free — Teams
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/30">
            <span>15-day full access</span>
            <span>•</span>
            <span>No credit card</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
