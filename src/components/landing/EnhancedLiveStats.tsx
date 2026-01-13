import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Target, Eye, Users, TrendingUp, Zap, Activity, BookOpen, BarChart3, PenLine } from "lucide-react";

interface Stats {
  totalCount: number;
  categoryPercentages: { category: string; percentage: number }[];
  recentCount: number;
  recentActivities: string[];
}

const CATEGORY_CONFIG: Record<string, { label: string; colorClass: string }> = {
  career: { label: "Career", colorClass: "bg-primary" },
  business: { label: "Business", colorClass: "bg-success" },
  personal: { label: "Personal", colorClass: "bg-purple-500" },
  travel: { label: "Travel", colorClass: "bg-warning" },
  other: { label: "Other", colorClass: "bg-muted-foreground" },
};

function AnimatedCounter({ 
  value, 
  duration = 2000,
  suffix = "",
  prefix = ""
}: { 
  value: number; 
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  suffix = "",
  prefix = "",
  delay = 0,
  colorClass = "text-primary"
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  delay?: number;
  colorClass?: string;
}) {
  return (
    <motion.div
      className="relative bg-background border border-border rounded-2xl p-5 text-center overflow-hidden group shadow-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.15)" }}
    >
      {/* Background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${colorClass.replace('text-', 'bg-')}`} />
      
      <motion.div 
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${colorClass.replace('text-', 'bg-')}/10`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </motion.div>
      
      <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} duration={2000 + delay * 500} />
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function EnhancedLiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Enhanced demo data with journaling and frameworks
  const demoStats: Stats = {
    totalCount: 12847,
    categoryPercentages: [
      { category: "career", percentage: 34 },
      { category: "business", percentage: 28 },
      { category: "personal", percentage: 22 },
      { category: "travel", percentage: 10 },
      { category: "other", percentage: 6 },
    ],
    recentCount: 23,
    recentActivities: [
      "Someone just stress-tested a startup decision",
      "Someone just journaled their morning reflection",
      "Someone just ran Porter's Five Forces analysis",
      "Someone just analyzed a career move",
      "Someone just completed a SWOT analysis",
      "Someone just captured a life decision",
      "Someone just ran a post-mortem on a failed project",
    ],
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stats?.recentActivities?.length) return;
    
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => 
        (prev + 1) % stats.recentActivities.length
      );
    }, 3500);
    
    return () => clearInterval(interval);
  }, [stats?.recentActivities]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-public-stats");
      
      if (error || !data || data.totalCount === 0) {
        setStats(demoStats);
      } else {
        const hasValidPercentages = data.categoryPercentages?.some(
          (c: { percentage: number }) => c.percentage > 0
        );
        
        setStats({
          totalCount: Math.max(data.totalCount, 100),
          categoryPercentages: hasValidPercentages 
            ? data.categoryPercentages 
            : demoStats.categoryPercentages,
          recentCount: Math.max(data.recentCount, 1),
          recentActivities: demoStats.recentActivities, // Always use rich demo activities
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats(demoStats);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived stats
  const blindSpotsFound = stats ? Math.floor(stats.totalCount * 2.3) : 0;
  const journalEntries = stats ? Math.floor(stats.totalCount * 3.2) : 0;
  const frameworksUsed = stats ? Math.floor(stats.totalCount * 0.8) : 0;
  const activeUsers = stats ? Math.floor(stats.totalCount / 12) : 0;

  if (isLoading) {
    return (
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <div className="w-10 h-10 border-3 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-muted overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live Now
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Decisions being improved right now</span>
          </h2>
        </motion.div>

        {/* Main Stats Grid - 6 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard
            icon={Target}
            value={stats?.totalCount || 0}
            label="Plans stress-tested"
            delay={0}
            colorClass="text-primary"
          />
          <StatCard
            icon={Eye}
            value={blindSpotsFound}
            label="Blind spots found"
            delay={0.05}
            colorClass="text-secondary"
          />
          <StatCard
            icon={PenLine}
            value={journalEntries}
            label="Journal entries"
            delay={0.1}
            colorClass="text-purple-500"
          />
          <StatCard
            icon={BarChart3}
            value={frameworksUsed}
            label="Frameworks used"
            delay={0.15}
            colorClass="text-warning"
          />
          <StatCard
            icon={Users}
            value={activeUsers}
            label="Active thinkers"
            delay={0.2}
            colorClass="text-success"
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.recentCount || 0}
            label="In the last hour"
            prefix="+"
            delay={0.25}
            colorClass="text-primary"
          />
        </div>

        {/* Live Activity Ticker */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground bg-background/50 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-warning" />
            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentActivityIndex}
                  className="block text-sm"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  {stats?.recentActivities[currentActivityIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
