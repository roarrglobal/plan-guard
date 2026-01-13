import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Plus, PenLine, Target, Clock, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import AnalysisCardExpanded from "@/components/dashboard/AnalysisCardExpanded";
import PullToRefresh from "@/components/ui/pull-to-refresh";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { MonthlyRecapModal, useMonthlyRecap } from "@/components/dashboard/MonthlyRecapModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SavedAnalysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "career", label: "Career" },
  { id: "business", label: "Business" },
  { id: "personal", label: "Personal" },
  { id: "travel", label: "Travel" },
  { id: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  career: { bg: "bg-primary/10", text: "text-primary" },
  business: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  personal: { bg: "bg-violet-500/10", text: "text-violet-600" },
  travel: { bg: "bg-amber-500/10", text: "text-amber-600" },
  other: { bg: "bg-muted", text: "text-muted-foreground" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, profile } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllAnalyses, setShowAllAnalyses] = useState(false);
  const { shouldShow: showRecap, markAsShown: closeRecap } = useMonthlyRecap();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchAnalyses();
    }
  }, [user, authLoading, navigate]);

  const fetchAnalyses = useCallback(async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      toast({
        title: "Error loading analyses",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAnalyses(data || []);
    }
    setIsLoading(false);
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    await fetchAnalyses();
    toast({ title: "Refreshed" });
  }, [fetchAnalyses, toast]);

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting analysis",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setExpandedId(null);
      toast({ title: "Analysis deleted" });
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = analysis.original_input
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || (analysis.category || "other") === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hasAnalyses = analyses.length > 0;
  const showEmptyState = !hasAnalyses;

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";

  // Recent analyses for quick view
  const recentAnalyses = analyses.slice(0, 3);

  return (
    <>
      {showRecap && hasAnalyses && (
        <MonthlyRecapModal analyses={analyses} onClose={closeRecap} />
      )}

      <div className="min-h-screen bg-background">
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="px-4 py-6 max-w-4xl mx-auto w-full min-h-full">
            
            {showEmptyState ? (
              <DashboardEmptyState />
            ) : showAllAnalyses ? (
              /* Full Analysis List View */
              <div className="animate-in fade-in duration-300">
                <button
                  onClick={() => setShowAllAnalyses(false)}
                  className="text-sm font-medium text-primary mb-6 hover:underline flex items-center gap-1"
                >
                  ← Back to Dashboard
                </button>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        activeFilter === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {filteredAnalyses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No analyses match your search
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveFilter("all");
                      }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pb-8">
                    {filteredAnalyses.map((analysis) => (
                      <AnalysisListItem
                        key={analysis.id}
                        analysis={analysis}
                        isExpanded={expandedId === analysis.id}
                        onExpand={() => setExpandedId(analysis.id)}
                        onCollapse={() => setExpandedId(null)}
                        onDelete={() => deleteAnalysis(analysis.id)}
                        onCategoryChange={(newCategory) => {
                          setAnalyses((prev) =>
                            prev.map((a) =>
                              a.id === analysis.id ? { ...a, category: newCategory } : a
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Main Dashboard - Clean Layout */
              <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Hero Section - Greeting & Quick Start */}
                <section className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {greeting}, {displayName}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {format(new Date(), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Primary Action Card */}
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground mb-4">
                        What decision or plan needs a stress-test today?
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={() => navigate("/analyze")} 
                          className="gap-2"
                        >
                          <Target className="w-4 h-4" />
                          New Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate("/journal/new")}
                          className="gap-2"
                        >
                          <PenLine className="w-4 h-4" />
                          Journal Entry
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate("/decisions/new")}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Capture Decision
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Stats Overview */}
                <section>
                  <QuickStats analysesCount={analyses.length} />
                </section>

                {/* Recent Analyses */}
                {recentAnalyses.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">Recent Analyses</h2>
                      {analyses.length > 3 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowAllAnalyses(true)}
                          className="text-primary"
                        >
                          View all ({analyses.length})
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {recentAnalyses.map((analysis) => (
                        <RecentAnalysisCard 
                          key={analysis.id} 
                          analysis={analysis} 
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Pending Actions */}
                <PendingActionsSection />

              </div>
            )}
          </main>
        </PullToRefresh>
      </div>
    </>
  );
}

// Sub-components for cleaner code

function QuickStats({ analysesCount }: { analysesCount: number }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    journalEntries: 0,
    decisions: 0,
    outcomes: 0,
  });

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [journalRes, decisionsRes, outcomesRes] = await Promise.all([
      supabase.from("journal_entries").select("*", { count: "exact", head: true }),
      supabase.from("decisions").select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      supabase.from("decisions").select("*", { count: "exact", head: true })
        .not("outcome_status", "is", null),
    ]);

    setStats({
      journalEntries: journalRes.count || 0,
      decisions: decisionsRes.count || 0,
      outcomes: outcomesRes.count || 0,
    });
  };

  const items = [
    { label: "Analyses", value: analysesCount, icon: Target },
    { label: "Journal Entries", value: stats.journalEntries, icon: PenLine },
    { label: "Decisions (this month)", value: stats.decisions, icon: Clock },
    { label: "Outcomes Tracked", value: stats.outcomes, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border/50">
            <CardContent className="p-4">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function RecentAnalysisCard({ 
  analysis, 
  onClick 
}: { 
  analysis: SavedAnalysis; 
  onClick: () => void;
}) {
  const category = analysis.category || "other";
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const result = analysis.result as { blind_spots?: unknown[]; failure_modes?: unknown[] };
  const blindSpots = result?.blind_spots?.length || 0;
  const failureModes = result?.failure_modes?.length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={cn(
            "inline-block text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-2",
            colors.bg, colors.text
          )}>
            {category}
          </span>
          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {analysis.original_input.slice(0, 100)}
            {analysis.original_input.length > 100 && "..."}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}</span>
            {blindSpots > 0 && (
              <span className="text-primary">{blindSpots} blind spot{blindSpots !== 1 ? "s" : ""}</span>
            )}
            {failureModes > 0 && (
              <span className="text-destructive">{failureModes} failure mode{failureModes !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  );
}

function PendingActionsSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingDecisions, setPendingDecisions] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchPending();
  }, [user]);

  const fetchPending = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("decisions")
      .select("id, decision_text, created_at")
      .eq("status", "made")
      .is("outcome_status", null)
      .order("created_at", { ascending: false })
      .limit(2);

    if (data) setPendingDecisions(data);
  };

  if (pendingDecisions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          Pending Check-ins
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/decisions?tab=made")}
        >
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {pendingDecisions.map((decision) => (
          <Card 
            key={decision.id} 
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate(`/decisions/${decision.id}`)}
          >
            <CardContent className="p-4">
              <p className="text-sm text-foreground line-clamp-1 mb-1">
                {decision.decision_text}
              </p>
              <p className="text-xs text-muted-foreground">
                Decided {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AnalysisListItem({
  analysis,
  isExpanded,
  onExpand,
  onCollapse,
  onDelete,
  onCategoryChange,
}: {
  analysis: SavedAnalysis;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onDelete: () => void;
  onCategoryChange: (category: string) => void;
}) {
  if (isExpanded) {
    return (
      <AnalysisCardExpanded
        analysis={analysis}
        onCollapse={onCollapse}
        onDelete={onDelete}
        onCategoryChange={onCategoryChange}
      />
    );
  }

  const category = analysis.category || "other";
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
    <button
      onClick={onExpand}
      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={cn(
            "inline-block text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mb-2",
            colors.bg, colors.text
          )}>
            {category}
          </span>
          <p className="text-sm text-foreground line-clamp-2 mb-2">
            {analysis.original_input.slice(0, 100)}
            {analysis.original_input.length > 100 && "..."}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(analysis.created_at), "MMM d, yyyy")}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}
