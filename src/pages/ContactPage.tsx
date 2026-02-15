import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Mail, Linkedin, Twitter, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  { label: "General inquiries", email: "hello@snagme.app" },
  { label: "Sales & Enterprise", email: "sales@snagme.app" },
  { label: "Support", email: "support@snagme.app" },
];

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Thanks! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Let's talk
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Questions, partnerships, or just want to say hi.
            </p>
          </div>
        </section>

        {/* Two Columns */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" placeholder="Your name" required maxLength={100} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required maxLength={255} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Your company (optional)" maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General inquiry</SelectItem>
                          <SelectItem value="sales">Sales / Enterprise</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="press">Press</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" placeholder="Tell us more..." rows={5} required maxLength={1000} />
                    </div>
                    <Button type="submit" className="w-full" disabled={sending}>
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right: Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                {contactInfo.map((c) => (
                  <div key={c.label}>
                    <h3 className="font-semibold text-foreground mb-1">{c.label}</h3>
                    <a href={`mailto:${c.email}`} className="text-primary hover:underline flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {c.email}
                    </a>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">We typically respond within 24 hours.</p>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Follow us</h3>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.linkedin.com/company/snagme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" /> LinkedIn
                  </a>
                  <a
                    href="https://x.com/snagme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" /> X / Twitter
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>We're a remote-first team.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
