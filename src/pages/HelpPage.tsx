import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Search, BookOpen, Zap, Users, CreditCard, Shield, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const categories = [
  { icon: Zap, title: "Getting Started", desc: "Set up your account and run your first analysis" },
  { icon: BookOpen, title: "Features & Tools", desc: "Learn about journals, decisions, frameworks, and more" },
  { icon: Users, title: "Teams", desc: "Create teams, invite members, and collaborate" },
  { icon: CreditCard, title: "Billing & Plans", desc: "Pricing, upgrades, and payment questions" },
  { icon: Shield, title: "Privacy & Security", desc: "How we protect your data" },
  { icon: MessageSquare, title: "Troubleshooting", desc: "Common issues and how to fix them" },
];

const faqs = [
  { q: "How does Snag analyze my decisions?", a: "Snag uses AI-powered pre-mortem analysis based on the SNAG Framework (Surface, Neglect, Assume, Gaps). It identifies blind spots, failure modes, and warning signals that you might miss on your own." },
  { q: "Is my data private?", a: "Absolutely. Your decisions and analyses are private by default. We never share your data with third parties or use it to train AI models. You own your data." },
  { q: "Can I use Snag for free?", a: "Yes! The free plan includes 3 deep analyses per month, daily journal entries, and basic decision tracking. Upgrade to Pro for unlimited analyses and advanced features." },
  { q: "How do teams work?", a: "Teams allow multiple people to share decisions, run analyses, and track outcomes together. Each team gets shared templates, activity feeds, and analytics dashboards." },
  { q: "What's the difference between a Quick Snag and a Deep Snag?", a: "A Quick Snag gives you a fast summary with key blind spots in seconds. A Deep Snag provides a comprehensive analysis with failure modes, warning signals, kill criteria, and the Unasked Question." },
  { q: "Can I export my analyses?", a: "Yes. You can export individual analyses as PDFs, and team admins can export team reports with aggregated insights." },
  { q: "How do I cancel my subscription?", a: "You can cancel anytime from your Settings page. Your Pro features will remain active until the end of your billing period." },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              How can we help?
            </motion.h1>
            <div className="relative max-w-xl mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                className="pl-10 h-12 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <cat.icon className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 bg-secondary">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg border border-border px-4">
                  <AccordionTrigger className="text-left font-medium text-foreground">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No results found. Try a different search term.</p>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">Our support team typically responds within 24 hours.</p>
            <Link to="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
