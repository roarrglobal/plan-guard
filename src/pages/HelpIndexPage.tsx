import { useState } from "react";
import { Link } from "react-router-dom";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Rocket, Zap, Target, LayoutTemplate, Users, CreditCard,
  BookOpen, Flame, Settings, HelpCircle, Wrench, X, Mail,
  SearchIcon, ArrowRight,
} from "lucide-react";
import { helpSections, searchHelp, type HelpSection } from "@/data/helpContent";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Search: SearchIcon, Zap, Target, LayoutTemplate, Users,
  CreditCard, BookOpen, Flame, Settings, HelpCircle, Wrench,
};

export default function HelpIndexPage() {
  usePageSEO({
    title: "Help Center — Snag",
    description: "Find answers, guides, and support for Snag's decision intelligence platform.",
  });

  const [query, setQuery] = useState("");
  const searchResults = searchHelp(query);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Help Center
          </motion.h1>
          <p className="text-muted-foreground mb-6">
            Find answers and learn how to get the most from Snag
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles..."
              className="pl-10 pr-10 h-11"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            <AnimatePresence>
              {query && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No results found for "{query}"
                    </div>
                  ) : (
                    searchResults.slice(0, 8).map(({ section, article }) => (
                      <Link
                        key={article.id}
                        to={`/help/${section.id}/${article.id}`}
                        onClick={() => setQuery("")}
                        className="block w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">{article.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {section.title}
                        </div>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpSections.map((section) => {
              const Icon = iconMap[section.icon] || HelpCircle;
              return (
                <Link key={section.id} to={`/help/${section.id}`}>
                  <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <CardContent className="pt-6 pb-5">
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {section.articles.length} article{section.articles.length !== 1 ? "s" : ""}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-16">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <CardContent className="pt-6 pb-6">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our support team responds within 24 hours.
              </p>
              <a
                href="mailto:support@snagme.app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                support@snagme.app
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
