import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, TrendingUp, Eye, BookOpen, Linkedin, ExternalLink } from "lucide-react";

const values = [
  { icon: Target, title: "Decisions over opinions", desc: "We believe in structured thinking over gut instinct." },
  { icon: TrendingUp, title: "Outcomes over activity", desc: "We track what actually happens, not just what we planned." },
  { icon: Eye, title: "Clarity over comfort", desc: "We surface uncomfortable truths before they become costly mistakes." },
  { icon: BookOpen, title: "Learning over blame", desc: "Every outcome—good or bad—teaches something." },
];

const timeline = [
  { year: "2024", event: "Founded after watching yet another team burn $2M on a decision that a 30-minute pre-mortem could have caught." },
  { year: "2024", event: "Launched the SNAG Framework — Surface, Neglect, Assume, Gaps — the core of every analysis." },
  { year: "2025", event: "Expanded to team decision intelligence with department-specific templates and shared learning." },
  { year: "Today", event: "Helping professionals and teams make better decisions every day." },
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

        {/* The Team */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">The Team</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Card className="max-w-xs w-full text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    MI
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Mahesh Iyer</h3>
                  <p className="text-muted-foreground mb-4">Advisory & Flaw Finder</p>
                  <a
                    href="https://www.linkedin.com/in/iyerrmahesh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                </CardContent>
              </Card>
            </motion.div>
            <p className="text-center text-muted-foreground mt-8">
              We're a small, focused team. More coming soon.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-8">
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
        <section className="py-20 px-4">
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

        {/* Backed By */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Backed By</h2>
            <p className="text-xl text-foreground font-semibold mb-4">
              Snag is a Roarr Consulting Group venture.
            </p>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Roarr Consulting Group is a management consulting firm specializing in strategic advisory,
              operational excellence, and digital transformation for businesses across industries.
            </p>
            <a
              href="https://roarrconsulting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              Visit roarrconsulting.com <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Want to learn more? Get in touch.</h2>
            <Link to="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
