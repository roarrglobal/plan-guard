import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import teamCelebrate from "@/assets/landing-team-celebrate.png";

export function FinalCtaSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-crimson/5 via-white to-cobalt/5">
      {/* Accent blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-crimson/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cobalt/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Stop deciding blind</h2>
            <p className="text-lg text-muted-foreground mb-10">Join thousands making better decisions with Snag</p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Link to="/signup?type=individual">
                <Button className="bg-crimson hover:bg-crimson/90 text-white px-8 h-12 text-base font-semibold min-w-[200px] shadow-lg shadow-crimson/20">
                  Start Free — Personal
                </Button>
              </Link>
              <Link to="/signup?type=team">
                <Button className="bg-cobalt hover:bg-cobalt/90 text-white px-8 h-12 text-base font-semibold min-w-[200px] shadow-lg shadow-cobalt/20">
                  Start Free — Teams
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>15-day full access</span>
              <span>•</span>
              <span>No credit card</span>
              <span>•</span>
              <span>Cancel anytime</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img 
              src={teamCelebrate} 
              alt="Team celebrating smart decisions" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
