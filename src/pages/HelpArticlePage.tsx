import { useState, useEffect, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { helpSections } from "@/data/helpContent";
import { HelpArticleRenderer } from "@/components/help/HelpArticleRenderer";

/** Extract ### headings from content for TOC */
function extractHeadings(content: string): { id: string; text: string }[] {
  const lines = content.split("\n");
  return lines
    .filter((l) => l.startsWith("### "))
    .map((l) => {
      const text = l.slice(4).replace(/\*\*/g, "");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return { id, text };
    });
}

export default function HelpArticlePage() {
  const { sectionId, articleId } = useParams<{ sectionId: string; articleId: string }>();
  const section = helpSections.find((s) => s.id === sectionId);
  const article = section?.articles.find((a) => a.id === articleId);

  usePageSEO({
    title: article ? `${article.title} — Help Center — Snag` : "Help Center — Snag",
    description: article ? article.content.slice(0, 155).replace(/[#*|]/g, "") : "Snag help center.",
  });

  const [helpful, setHelpful] = useState<"yes" | "no" | null>(null);
  const headings = useMemo(() => (article ? extractHeadings(article.content) : []), [article]);

  // Find prev/next articles
  const allArticles = useMemo(() => {
    const flat: { sectionId: string; sectionTitle: string; articleId: string; title: string }[] = [];
    for (const s of helpSections) {
      for (const a of s.articles) {
        flat.push({ sectionId: s.id, sectionTitle: s.title, articleId: a.id, title: a.title });
      }
    }
    return flat;
  }, []);

  const currentIndex = allArticles.findIndex(
    (a) => a.sectionId === sectionId && a.articleId === articleId
  );
  const prev = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const next = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setHelpful(null);
  }, [sectionId, articleId]);

  if (!section || !article) return <Navigate to="/help" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto flex gap-8">
          {/* Left Sidebar - Section Nav (desktop) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <Link
                to={`/help/${section.id}`}
                className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 block"
              >
                {section.title}
              </Link>
              {section.articles.map((a) => (
                <Link
                  key={a.id}
                  to={`/help/${section.id}/${a.id}`}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    a.id === articleId
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {a.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/help">Help</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/help/${section.id}`}>{section.title}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{article.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Mobile section nav */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {section.articles.map((a) => (
                <Link
                  key={a.id}
                  to={`/help/${section.id}/${a.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                    a.id === articleId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a.title}
                </Link>
              ))}
            </div>

            <Card>
              <CardContent className="pt-8 pb-8 px-6 md:px-10">
                <h1 className="text-2xl font-bold text-foreground mb-6">{article.title}</h1>
                <HelpArticleRenderer content={article.content} />
              </CardContent>
            </Card>

            {/* Was this helpful? */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <Button
                variant={helpful === "yes" ? "default" : "outline"}
                size="sm"
                onClick={() => setHelpful("yes")}
                className="gap-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Yes
              </Button>
              <Button
                variant={helpful === "no" ? "default" : "outline"}
                size="sm"
                onClick={() => setHelpful("no")}
                className="gap-1.5"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                No
              </Button>
              {helpful && (
                <span className="text-xs text-muted-foreground animate-in fade-in">
                  Thanks for your feedback!
                </span>
              )}
            </div>

            {/* Prev / Next nav */}
            <div className="mt-8 flex items-stretch gap-4">
              {prev ? (
                <Link
                  to={`/help/${prev.sectionId}/${prev.articleId}`}
                  className="flex-1 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <ArrowLeft className="w-3 h-3" /> Previous
                  </div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {next ? (
                <Link
                  to={`/help/${next.sectionId}/${next.articleId}`}
                  className="flex-1 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors group text-right"
                >
                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-1">
                    Next <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {next.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {/* Contact CTA */}
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground mb-2">Still need help?</p>
              <a
                href="mailto:support@snagme.app"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="w-4 h-4" />
                Contact support
              </a>
            </div>
          </div>

          {/* Right Sidebar - Table of Contents (desktop) */}
          {headings.length > 1 && (
            <aside className="hidden xl:block w-48 flex-shrink-0">
              <nav className="sticky top-24">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  On this page
                </h4>
                <ul className="space-y-1.5">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
