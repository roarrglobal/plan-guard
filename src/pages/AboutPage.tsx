import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Brain, TrendingUp, Shield, Users, Lightbulb } from "lucide-react";

const values = [
  { icon: Target, title: "Decisions over opinions", desc: "We believe every decision deserves structured analysis, not just gut instinct." },
  { icon: Brain, title: "Intelligence that compounds", desc: "Every decision you track makes our analysis smarter about your patterns." },
  { icon: Shield, title: "Brutal honesty", desc: "We'd rather tell you something you don't want to hear than let you walk into a trap." },
  { icon: TrendingUp, title: "Outcomes over activity", desc: "We measure success by decisions that worked, not features shipped." },
  { icon: Users, title: "Accessible expertise", desc: "McKinsey-grade thinking shouldn't require McKinsey-grade budgets." },
  { icon: Lightbulb, title: "The unasked question", desc: "The most important question is the one nobody thought to ask." },
];

const timeline = [
  { year: "2024", event: "Founded after watching yet another team burn $2M on a decision that a 30-minute pre-mortem could have caught." },
  { year: "2024", event: "Launched the SNAG Framework — Surface, Neglect, Assume, Gaps — the core of every analysis." },
  { year: "2025", event: "Expanded to team decision intelligence with department-specific templates and shared learning." },
  { year: "Today", event: "Helping thousands of professionals and teams make better decisions every day." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            >
              Better decisions. Fewer regrets.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              We're building the decision layer every company is missing.
            </motion.p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Every organization has systems for managing customers, finances, and people.
                CRM. ERP. HRIS.
              </p>
              <p>
                But no one has a system for the thing that matters most: <strong className="text-foreground">decisions</strong>.
              </p>
              <p>
                We've watched teams make the same mistakes over and over. Not because they're
                not smart—they are. But because they don't have a structured way to think
                about what could go wrong. And they don't track what actually happens.
              </p>
              <p>
                The result? Billions of dollars wasted on bad decisions that could have been
                caught with a simple pre-mortem.
              </p>
              <p className="text-foreground font-semibold text-xl">
                Snag changes that.
              </p>
              <p>
                We bring McKinsey-grade decision analysis to every professional and team,
                at a fraction of the cost. We remember every decision you make. We track
                every outcome. And we get smarter about YOUR patterns over time.
              </p>
              <p>
                We're not building another AI chatbot that forgets everything. We're building
                decision intelligence that compounds.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">What We Believe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <v.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Journey</h2>
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="font-bold text-primary">{t.year}</span>
                  </div>
                  <div className="border-l-2 border-primary pl-6 pb-2">
                    <p className="text-muted-foreground">{t.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Join us in building the decision layer</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're making personal choices or leading a team, Snag helps you decide with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup?type=individual">
                <Button className="bg-[hsl(349,57%,47%)] hover:bg-[hsl(349,57%,42%)] text-white" size="lg">
                  Start Free — Personal
                </Button>
              </Link>
              <Link to="/signup?type=team">
                <Button className="bg-cobalt hover:bg-cobalt-hover text-white" size="lg">
                  Start Free — Teams
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
