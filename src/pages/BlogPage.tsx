import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PenLine, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BlogPage() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed! We'll notify you when we publish.");
    setEmail("");
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
              The Snag Blog
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Insights on decision-making, pre-mortems, and building better teams.
            </p>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="pb-24 px-4">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <PenLine className="w-12 h-12 text-primary mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">We're working on something good.</h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to get notified when we publish.
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto mb-6">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    className="flex-1"
                  />
                  <Button type="submit">Subscribe</Button>
                </form>
                <p className="text-sm text-muted-foreground">
                  In the meantime, follow us on{" "}
                  <a
                    href="https://www.linkedin.com/company/snagme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>{" "}
                  for updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
