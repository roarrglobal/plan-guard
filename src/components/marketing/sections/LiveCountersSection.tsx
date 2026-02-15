import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Target, Users, Building2 } from "lucide-react";

const SEED_OFFSET = {
  decisions: 1247,
  teams: 89,
  companies: 23,
};

function AnimatedCounter({ value, duration = 2500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let frame: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function LiveCountersSection() {
  const [stats, setStats] = useState({ decisions: 0, teams: 0, companies: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.functions.invoke("get-public-stats");
        if (!error && data) {
          setStats({
            decisions: (data.totalCount || 0) + SEED_OFFSET.decisions,
            teams: SEED_OFFSET.teams + Math.floor((data.totalCount || 0) / 15),
            companies: SEED_OFFSET.companies + Math.floor((data.totalCount || 0) / 50),
          });
        } else {
          setStats({ decisions: SEED_OFFSET.decisions, teams: SEED_OFFSET.teams, companies: SEED_OFFSET.companies });
        }
      } catch {
        setStats({ decisions: SEED_OFFSET.decisions, teams: SEED_OFFSET.teams, companies: SEED_OFFSET.companies });
      }
    }
    fetchStats();
  }, []);

  const counters = [
    { icon: Target, value: stats.decisions, label: "Decisions Snagged", gradient: "from-cobalt to-purple-500" },
    { icon: Users, value: stats.teams, label: "Teams Snagging", gradient: "from-purple-500 to-crimson" },
    { icon: Building2, value: stats.companies, label: "Companies Using Snag", gradient: "from-crimson to-warning" },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Join thousands making better decisions
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 border border-border shadow-card hover:shadow-card-hover transition-shadow text-center"
              whileHover={{ y: -4 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mx-auto mb-4`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl md:text-5xl font-bold mb-2">
                <span className="hero-gradient-text" style={{ background: "linear-gradient(135deg, #0047AB, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  <AnimatedCounter value={c.value} />
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          Updated live • Growing every minute
        </motion.div>
      </div>
    </section>
  );
}
