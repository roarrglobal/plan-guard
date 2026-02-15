import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Globe, MessageSquare, Target, BookOpen, Mail } from "lucide-react";

const cultureValues = [
  { icon: Globe, title: "Remote-first", desc: "Work from anywhere. We judge output, not office hours." },
  { icon: MessageSquare, title: "Async communication", desc: "Deep work over meetings. Write it down, share it openly." },
  { icon: Target, title: "Outcome-focused", desc: "We care about results, not hours logged." },
  { icon: BookOpen, title: "Learning culture", desc: "Every decision teaches something. We bake that into how we work." },
];

export default function CareersPage() {
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
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Join the team
            </motion.h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the decision layer for every company.
            </p>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  We're not actively hiring yet, but we're always looking for exceptional people.
                </h2>
                <p className="text-muted-foreground">
                  If you're passionate about decision science, AI, or building great products, we'd love to hear from you.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Culture Values */}
        <section className="py-16 px-4 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">How We Work</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {cultureValues.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <v.icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Interested?</h2>
            <p className="text-muted-foreground mb-6">
              Send us a note at{" "}
              <a href="mailto:careers@snagme.app" className="text-primary hover:underline">careers@snagme.app</a>
            </p>
            <a href="mailto:careers@snagme.app">
              <Button size="lg" className="gap-2">
                <Mail className="w-4 h-4" /> Send an email
              </Button>
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
