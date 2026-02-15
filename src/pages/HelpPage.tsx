import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { HelpCircle, Mail, BookOpen, CreditCard, FileText, Code, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { icon: BookOpen, title: "Getting Started", status: "Coming soon" },
  { icon: CreditCard, title: "Account & Billing", status: "Coming soon" },
  { icon: FileText, title: "Templates Guide", status: "Coming soon" },
  { icon: Code, title: "API Documentation", status: "Coming soon" },
];

export default function HelpPage() {
  usePageSEO({ title: "Help Center", description: "Find answers and get support for Snag's decision intelligence platform." });
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
              Help Center
            </motion.h1>
            <p className="text-xl text-muted-foreground">
              Find answers and get support.
            </p>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-foreground mb-4">Our help center is coming soon.</h2>
                <p className="text-muted-foreground mb-2">In the meantime:</p>
                <ul className="text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
                  <li className="flex items-start gap-2">
                    <LinkIcon className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                    <span>
                      Check our{" "}
                      <Link to="/pricing" className="text-primary hover:underline">FAQ on the pricing page</Link>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                    <span>
                      Email{" "}
                      <a href="mailto:support@snagme.app" className="text-primary hover:underline">support@snagme.app</a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 mt-1 flex-shrink-0 text-center text-primary font-bold">⏱</span>
                    <span>Response within 24 hours</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Links */}
        <section className="pb-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Quick Links</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link, i) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="opacity-60">
                    <CardContent className="py-5 flex items-center gap-4">
                      <link.icon className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground">{link.title}</h3>
                        <p className="text-xs text-muted-foreground">{link.status}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
