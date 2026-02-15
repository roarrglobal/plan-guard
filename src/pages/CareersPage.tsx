import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Briefcase, Zap, Heart, Globe, Brain } from "lucide-react";

const perks = [
  { icon: Globe, title: "Remote-first", desc: "Work from anywhere. We judge output, not office hours." },
  { icon: Brain, title: "Decision culture", desc: "We use Snag internally. Every big call gets a pre-mortem." },
  { icon: Heart, title: "Generous benefits", desc: "Health, dental, vision, and a learning stipend." },
  { icon: Zap, title: "Ship fast", desc: "Small team, big impact. Your work reaches users in days, not quarters." },
];

const openings = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "AI/ML Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Customer Success Lead", dept: "Customer Success", location: "Remote", type: "Full-time" },
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
              Help the world decide better
            </motion.h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              We're building the decision intelligence platform that every professional and team deserves. Join us.
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById("openings")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Open Roles
            </Button>
          </div>
        </section>

        {/* Perks */}
        <section className="py-20 px-4 bg-secondary">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why Snag</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {perks.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section id="openings" className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Open Roles</h2>
            <div className="space-y-4">
              {openings.map((job, i) => (
                <motion.div
                  key={job.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.dept}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{job.type}</Badge>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-10">
              Don't see your role? Send us a note at{" "}
              <a href="mailto:careers@snag.ai" className="text-primary hover:underline">careers@snag.ai</a>
            </p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
