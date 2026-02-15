import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

const posts = [
  {
    title: "Why 'No Decision' Is the Most Expensive Decision",
    excerpt: "40% of forecasted B2B deals end in 'no decision.' Here's what that's really costing your pipeline—and how to fix it.",
    category: "Sales",
    readTime: "6 min",
    date: "Feb 10, 2025",
    slug: "#",
  },
  {
    title: "The Pre-Mortem: Your Most Powerful Decision Tool",
    excerpt: "Before you launch, ship, or sign—imagine it failed. A pre-mortem reveals the risks your optimism is hiding.",
    category: "Frameworks",
    readTime: "5 min",
    date: "Feb 3, 2025",
    slug: "#",
  },
  {
    title: "5 Cognitive Biases That Kill Good Strategy",
    excerpt: "Sunk cost fallacy, anchoring, and confirmation bias aren't just psychology terms—they're budget killers.",
    category: "Decision Science",
    readTime: "7 min",
    date: "Jan 27, 2025",
    slug: "#",
  },
  {
    title: "Building a Decision Culture in Your Organization",
    excerpt: "The best teams don't just make good decisions—they build systems that make bad decisions harder.",
    category: "Leadership",
    readTime: "8 min",
    date: "Jan 20, 2025",
    slug: "#",
  },
  {
    title: "SNAG Framework: A Deep Dive",
    excerpt: "Surface. Neglect. Assume. Gaps. How four questions can transform the way you evaluate any decision.",
    category: "Product",
    readTime: "10 min",
    date: "Jan 13, 2025",
    slug: "#",
  },
  {
    title: "Why Outcome Tracking Changes Everything",
    excerpt: "Most people make decisions and never look back. Here's why tracking outcomes is the secret to compounding decision intelligence.",
    category: "Personal Growth",
    readTime: "5 min",
    date: "Jan 6, 2025",
    slug: "#",
  },
];

export default function BlogPage() {
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
              Insights on decision-making, cognitive bias, and building decision intelligence.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={post.slug} className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex-1 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                        <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
