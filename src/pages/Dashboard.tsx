import { useState, useEffect, useCallback, useMemo } from "react";
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
import { DashboardStatsCards } from "@/components/dashboard/DashboardStatsCards";
import { DashboardQuickActionsEnhanced } from "@/components/dashboard/DashboardQuickActionsEnhanced";
import { DashboardRecentSnags } from "@/components/dashboard/DashboardRecentSnags";
import { DashboardInsightsCard } from "@/components/dashboard/DashboardInsightsCard";
import { DashboardNetworkTeaser } from "@/components/dashboard/DashboardNetworkTeaser";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { MonthlyRecapModal, useMonthlyRecap } from "@/components/dashboard/MonthlyRecapModal";

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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#E5E5E5] border-t-[#0047AB] rounded-full animate-spin" />
      </div>
    );
  }

  const hasAnalyses = analyses.length > 0;
  const showEmptyState = !hasAnalyses;

  return (
    <>
      {/* Monthly Recap Modal */}
      {showRecap && hasAnalyses && (
        <MonthlyRecapModal analyses={analyses} onClose={closeRecap} />
      )}

      <div className="h-screen bg-[#FAFAFA] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex-shrink-0 px-4">
          <DashboardProfileHeader />
        </header>

        {/* Content with Pull to Refresh */}
        <div className="flex-1 overflow-hidden">
          <PullToRefresh onRefresh={handleRefresh}>
            <main className="px-4 py-6 max-w-[680px] mx-auto w-full min-h-full">
              {/* Pull hint for mobile */}
              <p className="text-center text-[12px] text-[#CCCCCC] mb-4 md:hidden">
                Pull down to refresh
              </p>

              {showEmptyState ? (
                /* Empty State for New Users */
                <DashboardEmptyState />
              ) : showAllAnalyses ? (
                /* Full Analysis List View */
                <>
                  {/* Back button */}
                  <button
                    onClick={() => setShowAllAnalyses(false)}
                    className="text-[14px] font-medium text-[#0047AB] mb-4 hover:underline"
                  >
                    ← Back to Dashboard
                  </button>

                  {/* Search bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                    <Input
                      placeholder="Search your analyses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-[#F8F8F8] border-[#E5E5E5] text-[15px]"
                    />
                  </div>

                  {/* Filter pills */}
                  <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveFilter(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                          activeFilter === cat.id
                            ? "bg-[#0047AB] text-white"
                            : "bg-[#F2F2F2] text-[#666666] hover:bg-[#E5E5E5]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Analysis Cards */}
                  {filteredAnalyses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[15px] text-[#666666] mb-2">
                        No analyses match your search
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setActiveFilter("all");
                        }}
                        className="text-[14px] font-medium text-[#0047AB] hover:underline"
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
                              className="w-full bg-white border border-[#E5E5E5] rounded-lg p-4 text-left hover:border-[#CCCCCC] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  {/* Category tag */}
                                  <span
                                    className="inline-block text-[11px] font-medium uppercase tracking-wide mb-2"
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
                                  <p className="text-[15px] text-[#333333] line-clamp-2 mb-2">
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
                                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0047AB] bg-[#0047AB]/10 px-2 py-0.5 rounded-full">
                                            {blindSpots} blind spot
                                            {blindSpots !== 1 ? "s" : ""}
                                          </span>
                                        )}
                                        {failureModes > 0 && (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
                                            {failureModes} failure mode
                                            {failureModes !== 1 ? "s" : ""}
                                          </span>
                                        )}
                                        {warnings > 0 && (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full">
                                            {warnings} warning
                                            {warnings !== 1 ? "s" : ""}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Date */}
                                  <p className="text-[13px] text-[#999999]">
                                    {format(
                                      new Date(analysis.created_at),
                                      "MMM d, yyyy"
                                    )}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#CCCCCC] flex-shrink-0 mt-1" />
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
                  {/* Stats Cards - Horizontal scroll on mobile */}
                  <DashboardStatsCards analyses={analyses} />

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

                  {/* Insights Card (after 5+ analyses) */}
                  <DashboardInsightsCard analyses={analyses} />

                  {/* Network Teaser */}
                  <DashboardNetworkTeaser />
                </>
              )}
            </main>
          </PullToRefresh>
        </div>
      </div>
    </>
  );
}
