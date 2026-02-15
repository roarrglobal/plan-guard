import { useState, useEffect } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { cn } from "@/lib/utils";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  usePageSEO({ title: `${title} — Snag`, description: `${title} for Snag decision intelligence platform. Last updated ${lastUpdated}.` });
  const [activeId, setActiveId] = useState(sections[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Mobile TOC */}
          <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
            <p className="text-sm text-muted-foreground mb-4">Last updated: {lastUpdated}</p>
            <nav className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    activeId === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex gap-12">
            {/* Desktop Sidebar TOC */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28">
                <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
                <p className="text-xs text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={cn(
                        "block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors",
                        activeId === s.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 max-w-3xl space-y-12">
              {/* Desktop title hidden since in sidebar */}
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4">{s.title}</h2>
                  <div className="text-foreground leading-relaxed space-y-4">
                    {s.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
