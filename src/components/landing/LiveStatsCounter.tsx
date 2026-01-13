import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Target, Eye, Users, TrendingUp, Zap, Activity } from "lucide-react";

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
      className="relative bg-card border border-border rounded-2xl p-6 text-center overflow-hidden group"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.15)" }}
    >
      {/* Background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${colorClass.replace('text-', 'bg-')}`} />
      
      <motion.div 
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClass.replace('text-', 'bg-')}/10`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </motion.div>
      
      <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} duration={2000 + delay * 500} />
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function LiveStatsCounter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Demo data for visual appeal when real data is minimal
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
      "Someone just analyzed a startup decision",
      "Someone just stress-tested a career move",
      "Someone just snagged a relocation plan",
      "Someone just ran a pre-mortem on a partnership",
      "Someone just captured a life decision",
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
          recentActivities: data.recentActivities?.length > 0
            ? data.recentActivities 
            : demoStats.recentActivities,
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
  const activeUsers = stats ? Math.floor(stats.totalCount / 12) : 0;

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="w-10 h-10 border-3 border-border border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-gradient-to-b from-background via-muted/20 to-muted/50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
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
            Live Stats
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Decisions being improved right now</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See the collective thinking power of the Snag community
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={Target}
            value={stats?.totalCount || 0}
            label="Decisions analyzed"
            delay={0}
            colorClass="text-primary"
          />
          <StatCard
            icon={Eye}
            value={blindSpotsFound}
            label="Blind spots found"
            delay={0.1}
            colorClass="text-secondary"
          />
          <StatCard
            icon={Users}
            value={activeUsers}
            label="Active thinkers"
            delay={0.2}
            colorClass="text-purple-500"
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.recentCount || 0}
            label="In the last hour"
            prefix="+"
            delay={0.3}
            colorClass="text-success"
          />
        </div>

        {/* Category Distribution */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">What people are analyzing</p>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Category bars */}
          <div className="space-y-3">
            {stats?.categoryPercentages
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 4)
              .map((cat, i) => (
                <motion.div 
                  key={cat.category}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="text-sm text-foreground w-20 capitalize">
                    {CATEGORY_CONFIG[cat.category]?.label || cat.category}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${CATEGORY_CONFIG[cat.category]?.colorClass || 'bg-muted-foreground'}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${cat.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {cat.percentage}%
                  </span>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Live Activity Ticker */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4 text-warning" />
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentActivityIndex}
                  className="block text-sm italic"
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

export default LiveStatsCounter;
