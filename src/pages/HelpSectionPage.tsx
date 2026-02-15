import { Link, useParams, Navigate } from "react-router-dom";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Rocket, Zap, Target, LayoutTemplate, Users, CreditCard,
  BookOpen, Flame, Settings, HelpCircle, Wrench, ArrowRight,
  SearchIcon,
} from "lucide-react";
import { helpSections } from "@/data/helpContent";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Search: SearchIcon, Zap, Target, LayoutTemplate, Users,
  CreditCard, BookOpen, Flame, Settings, HelpCircle, Wrench,
};

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function HelpSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = helpSections.find((s) => s.id === sectionId);

  usePageSEO({
    title: section ? `${section.title} — Help Center — Snag` : "Help Center — Snag",
    description: section?.description || "Snag help center documentation.",
  });

  if (!section) return <Navigate to="/help" replace />;

  const Icon = iconMap[section.icon] || HelpCircle;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      <section className="pt-28 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/help">Help Center</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{section.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h1>
          </div>
          <p className="text-muted-foreground mb-8">{section.description}</p>

          {/* Article List */}
          <div className="space-y-3">
            {section.articles.map((article) => (
              <Link key={article.id} to={`/help/${section.id}/${article.id}`}>
                <Card className="hover:border-primary/40 hover:shadow-sm transition-all group">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {estimateReadingTime(article.content)} min read
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-3 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Adjacent Sections */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Other sections</h3>
            <div className="flex flex-wrap gap-2">
              {helpSections
                .filter((s) => s.id !== section.id)
                .slice(0, 6)
                .map((s) => (
                  <Link
                    key={s.id}
                    to={`/help/${s.id}`}
                    className="px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {s.title}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
