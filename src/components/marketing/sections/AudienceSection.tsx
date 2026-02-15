import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";
import { motion } from "framer-motion";

export function AudienceSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
          I want to make better decisions...
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Individual Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group border border-border rounded-2xl p-8 md:p-10 hover:shadow-lg hover:border-crimson/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-crimson/10 flex items-center justify-center mb-6">
              <User className="w-6 h-6 text-crimson" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">For Myself</h3>
            <p className="text-muted-foreground mb-6">Personal decision intelligence</p>
            <ul className="space-y-3 mb-6">
              {["Career moves & job offers", "Major purchases & investments", "Life transitions & relationships"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 bg-crimson/5 text-crimson text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              Journal • Habits • Personal patterns
            </div>
            <p className="text-sm text-muted-foreground mb-6">Free forever, or $12/mo for Pro</p>
            <Link to="/signup?type=individual">
              <Button className="w-full bg-crimson hover:bg-crimson-hover text-white">Get Started</Button>
            </Link>
          </motion.div>

          {/* Teams Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group border border-border rounded-2xl p-8 md:p-10 hover:shadow-lg hover:border-cobalt/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cobalt/10 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-cobalt" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">For My Team</h3>
            <p className="text-muted-foreground mb-6">Team decision infrastructure</p>
            <ul className="space-y-3 mb-6">
              {["Sales, finance, product decisions", "Team alignment & accountability", "Organizational learning"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 bg-cobalt/5 text-cobalt text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              Templates • Analytics • Audit trails
            </div>
            <p className="text-sm text-muted-foreground mb-6">From $59/month</p>
            <Link to="/signup?type=team">
              <Button className="w-full bg-cobalt hover:bg-cobalt-hover text-white">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
