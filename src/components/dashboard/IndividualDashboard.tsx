import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronRight, 
  Plus, 
  PenLine, 
  Target, 
  Clock, 
  BarChart3,
  Sparkles,
  TrendingUp,
  Share2,
  Flame,
  Eye,
  Send,
  ArrowRight,
  Star,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardPatterns } from "@/components/dashboard/DashboardPatterns";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { DashboardPendingOutcomes } from "@/components/dashboard/DashboardPendingOutcomes";
import { CosmicInsightsSection } from "@/components/dashboard/CosmicInsightsSection";
import type { Json } from "@/integrations/supabase/types";

interface SavedAnalysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

interface IndividualDashboardProps {
  displayName: string;
  greeting: string;
  softLaunch: {
    limits: {
      deepSnags: { used: number; limit: number };
      journalsPerDay: { used: number; limit: number };
    };
  };
}

const VERDICT_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  proceed_confidently: { label: "Proceed with Confidence", color: "from-emerald-500 to-green-400", emoji: "🟢" },
  proceed_carefully: { label: "Proceed with Caution", color: "from-amber-500 to-yellow-400", emoji: "🟡" },
  investigate_first: { label: "Investigate Further", color: "from-blue-500 to-cyan-400", emoji: "🔵" },
  reconsider_seriously: { label: "Reconsider", color: "from-red-500 to-rose-400", emoji: "🔴" },
};

export function IndividualDashboard({ displayName, greeting, softLaunch }: IndividualDashboardProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [quickInput, setQuickInput] = useState("");
  const [stats, setStats] = useState({ analyses: 0, accuracy: 0, outcomes: 0, streak: 0 });

  useEffect(() => {
    if (user) {
      fetchAnalyses();
      fetchStats();
    }
  }, [user]);

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setAnalyses(data);
  }, []);

  const fetchStats = useCallback(async () => {
    const [analysesRes, outcomesRes, successRes] = await Promise.all([
      supabase.from("analyses").select("*", { count: "exact", head: true }),
      supabase.from("decisions").select("*", { count: "exact", head: true }).not("outcome_status", "is", null),
      supabase.from("decisions").select("*", { count: "exact", head: true }).in("outcome_result", ["better", "expected"]),
    ]);

    const totalOutcomes = outcomesRes.count || 0;
    const successOutcomes = successRes.count || 0;
    const accuracy = totalOutcomes > 0 ? Math.round((successOutcomes / totalOutcomes) * 100) : 0;

    // Calculate streak
    const { data: recentAnalyses } = await supabase
      .from("analyses")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    let streak = 0;
    if (recentAnalyses && recentAnalyses.length > 0) {
      const dates = recentAnalyses
        .map(a => new Date(a.created_at).toDateString())
        .filter((d, i, s) => s.indexOf(d) === i);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (dates[0] === today || dates[0] === yesterday) {
        for (let i = 0; i < dates.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - streak - (dates[0] === yesterday ? 1 : 0));
          if (new Date(dates[i]).toDateString() === expected.toDateString()) {
            streak++;
          } else break;
        }
      }
    }

    setStats({
      analyses: analysesRes.count || 0,
      accuracy,
      outcomes: totalOutcomes,
      streak,
    });
  }, []);

  const handleQuickSnag = () => {
    if (quickInput.trim().length >= 20) {
      sessionStorage.setItem("snag_input", quickInput);
      navigate("/analyze");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(263,78%,60%)] via-[hsl(280,70%,50%)] to-[hsl(326,81%,55%)] p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {greeting}, {displayName} ✨
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-white">
                    <Flame className="w-4 h-4 text-orange-300" />
                    {stats.streak} day streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories-Style Horizontal Scroll */}
      <section className="overflow-hidden -mx-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          <StoryButton 
            emoji="➕" 
            label="New Snag" 
            gradient="from-[hsl(263,78%,55%)] to-[hsl(326,81%,55%)]"
            onClick={() => navigate("/analyze")}
            isNew
          />
          <StoryButton 
            emoji="📊" 
            label="Weekly Review" 
            gradient="from-[hsl(199,89%,65%)] to-[hsl(174,100%,50%)]"
            onClick={() => navigate("/analyses")}
          />
          <StoryButton 
            emoji="🎯" 
            label="Goals Check" 
            gradient="from-[hsl(38,92%,50%)] to-[hsl(25,95%,53%)]"
            onClick={() => navigate("/decisions")}
          />
          <StoryButton 
            emoji="✨" 
            label="Cosmic" 
            gradient="from-[hsl(280,70%,50%)] to-[hsl(320,80%,55%)]"
            onClick={() => {
              const el = document.getElementById("cosmic-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <StoryButton 
            emoji="📔" 
            label="Journal" 
            gradient="from-[hsl(160,84%,39%)] to-[hsl(145,60%,45%)]"
            onClick={() => navigate("/journal/new")}
          />
          <StoryButton 
            emoji="📈" 
            label="Patterns" 
            gradient="from-[hsl(217,91%,60%)] to-[hsl(240,80%,65%)]"
            onClick={() => {
              const el = document.getElementById("patterns-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* Quick Snag Input */}
      <section className="relative rounded-2xl bg-card border border-border p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(263,78%,60%)/0.1] to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Quick Snag</h2>
          </div>
          <div className="flex gap-2">
            <input
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="What's on your mind? Type a quick decision..."
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleQuickSnag()}
            />
            <button
              onClick={handleQuickSnag}
              disabled={quickInput.trim().length < 20}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-[hsl(263,78%,60%)] to-[hsl(326,81%,55%)] flex items-center justify-center text-white disabled:opacity-40 transition-opacity hover:shadow-lg hover:shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards - Horizontal Scroll */}
      <section className="overflow-hidden -mx-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          <StatCard 
            value={stats.analyses} 
            label="Decisions Made" 
            icon={Target}
            gradient="from-[hsl(263,78%,55%)] to-[hsl(280,70%,50%)]"
          />
          <StatCard 
            value={stats.accuracy > 0 ? `${stats.accuracy}%` : "—"} 
            label="Accuracy Rate" 
            icon={Eye}
            gradient="from-[hsl(326,81%,55%)] to-[hsl(350,80%,55%)]"
          />
          <StatCard 
            value={stats.outcomes} 
            label="Outcomes Tracked" 
            icon={BarChart3}
            gradient="from-[hsl(199,89%,65%)] to-[hsl(174,100%,50%)]"
          />
          <StatCard 
            value={stats.streak > 0 ? `🔥 ${stats.streak}` : "0"} 
            label="Streak Days" 
            icon={Flame}
            gradient="from-[hsl(38,92%,50%)] to-[hsl(25,95%,53%)]"
          />
        </div>
      </section>

      {/* Recent Snags */}
      {analyses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              📱 Recent Snags
            </h2>
            <button 
              onClick={() => navigate("/analyses")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {analyses.slice(0, 3).map((analysis) => (
              <RecentSnagCard 
                key={analysis.id} 
                analysis={analysis} 
                onClick={() => navigate(`/analysis/${analysis.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {analyses.length === 0 && (
        <section className="text-center py-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[hsl(263,78%,60%)/0.2] to-[hsl(326,81%,55%)/0.2] flex items-center justify-center mb-4">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No snags yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            What decision is keeping you up at night? Let's stress-test it.
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="bg-gradient-to-r from-[hsl(263,78%,60%)] to-[hsl(326,81%,55%)] text-white rounded-xl px-8 py-3.5 text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Run Your First Snag ✨
          </button>
        </section>
      )}

      {/* Achievements */}
      <DashboardAchievements 
        totalAnalyses={stats.analyses} 
        streak={stats.streak} 
        accuracy={stats.accuracy} 
        outcomes={stats.outcomes} 
      />

      {/* Pending Outcomes */}
      <DashboardPendingOutcomes />

      {/* Cosmic Insights */}
      <div id="cosmic-section">
        <CosmicInsightsSection />
      </div>

      {/* Patterns */}
      <div id="patterns-section">
        <DashboardPatterns />
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StoryButton({ 
  emoji, 
  label, 
  gradient, 
  onClick,
  isNew = false
}: { 
  emoji: string; 
  label: string; 
  gradient: string; 
  onClick: () => void;
  isNew?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className={cn(
        "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl",
        gradient,
        isNew && "ring-2 ring-accent ring-offset-2 ring-offset-background"
      )}>
        {emoji}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function StatCard({ 
  value, 
  label, 
  icon: Icon,
  gradient,
}: { 
  value: string | number; 
  label: string; 
  icon: typeof Target;
  gradient: string;
}) {
  return (
    <div className="min-w-[140px] flex-shrink-0 rounded-2xl bg-card border border-border p-4 relative overflow-hidden group hover:border-primary/30 transition-all">
      <div className={cn(
        "absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-gradient-to-bl opacity-20 group-hover:opacity-30 transition-opacity",
        gradient
      )} />
      <Icon className="w-5 h-5 text-muted-foreground mb-2" />
      <p className="text-3xl font-bold text-foreground leading-none">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
    </div>
  );
}

function RecentSnagCard({ 
  analysis, 
  onClick 
}: { 
  analysis: SavedAnalysis; 
  onClick: () => void;
}) {
  const result = analysis.result as any;
  const verdict = result?.bottom_line?.verdict;
  const verdictInfo = verdict ? VERDICT_MAP[verdict] : null;
  const category = analysis.category || "other";

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-card border border-border p-4 text-left hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">
              {verdictInfo?.emoji || "⚪"}
            </span>
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {analysis.original_input.slice(0, 60)}
              {analysis.original_input.length > 60 && "..."}
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {verdictInfo && (
              <span className="font-medium text-foreground/70">
                {verdictInfo.label}
              </span>
            )}
            <span>{formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-primary font-medium">View</span>
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}