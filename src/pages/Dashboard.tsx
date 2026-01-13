import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import AnalysisCardExpanded from "@/components/dashboard/AnalysisCardExpanded";
import PullToRefresh from "@/components/ui/pull-to-refresh";
import { DashboardProfileHeader } from "@/components/dashboard/DashboardProfileHeader";
import { DashboardQuickActionsEnhanced } from "@/components/dashboard/DashboardQuickActionsEnhanced";
import { DashboardRecentSnags } from "@/components/dashboard/DashboardRecentSnags";
import { DashboardInsightsCard } from "@/components/dashboard/DashboardInsightsCard";
import { DashboardNetworkTeaser } from "@/components/dashboard/DashboardNetworkTeaser";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { MonthlyRecapModal, useMonthlyRecap } from "@/components/dashboard/MonthlyRecapModal";
import UsageIndicator from "@/components/dashboard/UsageIndicator";
import { DashboardDailyPrompt } from "@/components/dashboard/DashboardDailyPrompt";
import { DashboardStreakStats } from "@/components/dashboard/DashboardStreakStats";
import { DashboardTodaysHabits } from "@/components/dashboard/DashboardTodaysHabits";
import { DashboardPendingOutcomes } from "@/components/dashboard/DashboardPendingOutcomes";

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

const CATEGORY_COLORS: Record<string, string> = {
  career: "#0047AB",
  business: "#059669",
  personal: "#7C3AED",
  travel: "#D97706",
  other: "#666666",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
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
      toast({
        title: "Analysis deleted",
      });
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
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <>
      {/* Monthly Recap Modal */}
      {showRecap && hasAnalyses && (
        <MonthlyRecapModal analyses={analyses} onClose={closeRecap} />
      )}

      <div className="min-h-screen bg-background">
        {/* Content with Pull to Refresh */}
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="px-4 py-6 max-w-3xl mx-auto w-full min-h-full">
            {/* Greeting Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {greeting}, {displayName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
              </div>
            </div>

            {showEmptyState ? (
              /* Empty State for New Users */
              <DashboardEmptyState />
            ) : showAllAnalyses ? (
              /* Full Analysis List View */
              <>
                {/* Back button */}
                <button
                  onClick={() => setShowAllAnalyses(false)}
                  className="text-sm font-medium text-primary mb-4 hover:underline"
                >
                  ← Back to Dashboard
                </button>

                {/* Search bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeFilter === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Analysis Cards */}
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
                      <div key={analysis.id}>
                        {expandedId === analysis.id ? (
                          <AnalysisCardExpanded
                            analysis={analysis}
                            onCollapse={() => setExpandedId(null)}
                            onDelete={() => deleteAnalysis(analysis.id)}
                            onCategoryChange={(newCategory) => {
                              setAnalyses((prev) =>
                                prev.map((a) =>
                                  a.id === analysis.id
                                    ? { ...a, category: newCategory }
                                    : a
                                )
                              );
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => setExpandedId(analysis.id)}
                            className="w-full bg-card border border-border rounded-lg p-4 text-left hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {/* Category tag */}
                                <span
                                  className="inline-block text-xs font-medium uppercase tracking-wide mb-2"
                                  style={{
                                    color:
                                      CATEGORY_COLORS[
                                        analysis.category || "other"
                                      ],
                                  }}
                                >
                                  {analysis.category || "other"}
                                </span>
                                {/* Plan preview */}
                                <p className="text-sm text-foreground line-clamp-2 mb-2">
                                  {analysis.original_input.slice(0, 100)}
                                  {analysis.original_input.length > 100 &&
                                    "..."}
                                </p>

                                {/* Analysis Summary */}
                                {(() => {
                                  const result = analysis.result as {
                                    blind_spots?: unknown[];
                                    failure_modes?: unknown[];
                                    warning_signals?: unknown[];
                                  };
                                  const blindSpots =
                                    result?.blind_spots?.length || 0;
                                  const failureModes =
                                    result?.failure_modes?.length || 0;
                                  const warnings =
                                    result?.warning_signals?.length || 0;

                                  return (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {blindSpots > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                          {blindSpots} blind spot
                                          {blindSpots !== 1 ? "s" : ""}
                                        </span>
                                      )}
                                      {failureModes > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                          {failureModes} failure mode
                                          {failureModes !== 1 ? "s" : ""}
                                        </span>
                                      )}
                                      {warnings > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                          {warnings} warning
                                          {warnings !== 1 ? "s" : ""}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Date */}
                                <p className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(analysis.created_at),
                                    "MMM d, yyyy"
                                  )}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Main Dashboard View */
              <>
                {/* Daily Prompt Card */}
                <DashboardDailyPrompt />

                {/* Streak & Stats Row */}
                <DashboardStreakStats analysesCount={analyses.length} />

                {/* Today's Habits */}
                <DashboardTodaysHabits />

                {/* Pending Outcomes */}
                <DashboardPendingOutcomes />

                {/* Quick Actions */}
                <DashboardQuickActionsEnhanced />

                {/* Recent Snags */}
                <DashboardRecentSnags
                  analyses={analyses}
                  onViewAll={() => setShowAllAnalyses(true)}
                  onSelectAnalysis={(id) => setExpandedId(id)}
                />

                {/* Expanded Analysis Card */}
                {expandedId && (
                  <div className="mb-6">
                    {analyses.find((a) => a.id === expandedId) && (
                      <AnalysisCardExpanded
                        analysis={analyses.find((a) => a.id === expandedId)!}
                        onCollapse={() => setExpandedId(null)}
                        onDelete={() => deleteAnalysis(expandedId)}
                        onCategoryChange={(newCategory) => {
                          setAnalyses((prev) =>
                            prev.map((a) =>
                              a.id === expandedId
                                ? { ...a, category: newCategory }
                                : a
                            )
                          );
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Usage Indicator */}
                <div className="mb-6">
                  <UsageIndicator />
                </div>

                {/* Insights Card (after 5+ analyses) */}
                <DashboardInsightsCard analyses={analyses} />

                {/* Network Teaser */}
                <DashboardNetworkTeaser />
              </>
            )}
          </main>
        </PullToRefresh>
      </div>
    </>
  );
}
