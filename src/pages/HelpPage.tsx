import { useState, useRef, useEffect } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Rocket, Zap, Target, LayoutTemplate, Users, CreditCard,
  BookOpen, Flame, Settings, HelpCircle, Wrench, ChevronDown, Mail, X,
  SearchIcon,
} from "lucide-react";
import { helpSections, searchHelp, type HelpSection, type HelpArticle } from "@/data/helpContent";
import { HelpArticleRenderer } from "@/components/help/HelpArticleRenderer";
import { useSearchParams } from "react-router-dom";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Search: SearchIcon, Zap, Target, LayoutTemplate, Users,
  CreditCard, BookOpen, Flame, Settings, HelpCircle, Wrench,
};

export default function HelpPage() {
  usePageSEO({
    title: "Help Center — Snag",
    description: "Find answers, guides, and support for Snag's decision intelligence platform.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>(searchParams.get("section") || "getting-started");
  const [activeArticle, setActiveArticle] = useState<string>(searchParams.get("article") || "");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([activeSection]));
  const contentRef = useRef<HTMLDivElement>(null);

  const searchResults = searchHelp(query);
  const currentSection = helpSections.find((s) => s.id === activeSection);

  const navigateTo = (sectionId: string, articleId?: string) => {
    setActiveSection(sectionId);
    setActiveArticle(articleId || "");
    setExpandedSections((prev) => new Set([...prev, sectionId]));
    setQuery("");
    setSearchParams({ section: sectionId, ...(articleId ? { article: articleId } : {}) });
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Scroll to article on load
  useEffect(() => {
    if (activeArticle) {
      setTimeout(() => {
        document.getElementById(`article-${activeArticle}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [activeArticle]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Help Center
          </motion.h1>
          <p className="text-muted-foreground mb-6">
            Everything you need to make better decisions with Snag.
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

            {/* Search Results Dropdown */}
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
                      <button
                        key={article.id}
                        onClick={() => navigateTo(section.id, article.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">{article.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Section {section.number}: {section.title}
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {helpSections.map((section) => {
                const Icon = iconMap[section.icon] || HelpCircle;
                const isActive = activeSection === section.id;
                const isExpanded = expandedSections.has(section.id);

                return (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        navigateTo(section.id);
                        toggleSection(section.id);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{section.title}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="ml-9 mt-0.5 space-y-0.5 mb-1">
                        {section.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => navigateTo(section.id, article.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                              activeArticle === article.id
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Section Selector */}
          <div className="lg:hidden w-full">
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-1 px-1 scrollbar-hide">
              {helpSections.map((section) => {
                const Icon = iconMap[section.icon] || HelpCircle;
                return (
                  <button
                    key={section.id}
                    onClick={() => navigateTo(section.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {section.title}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {currentSection && (
              <div ref={contentRef} className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">Section {currentSection.number}</Badge>
                  <h2 className="text-xl font-bold text-foreground">{currentSection.title}</h2>
                </div>
                {currentSection.articles.map((article) => (
                  <Card key={article.id} id={`article-${article.id}`}>
                    <CardContent className="pt-5 pb-5">
                      <h3 className="text-base font-semibold text-foreground mb-3">{article.title}</h3>
                      <HelpArticleRenderer content={article.content} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:block flex-1 min-w-0" ref={contentRef}>
            {currentSection && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="outline" className="text-xs">Section {currentSection.number}</Badge>
                  <h2 className="text-2xl font-bold text-foreground">{currentSection.title}</h2>
                </div>
                {currentSection.articles.map((article) => (
                  <Card key={article.id} id={`article-${article.id}`} className="scroll-mt-24">
                    <CardContent className="pt-6 pb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">{article.title}</h3>
                      <HelpArticleRenderer content={article.content} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
