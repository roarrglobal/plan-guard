import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronRight, ClipboardList, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import AnalysisCardExpanded from "@/components/dashboard/AnalysisCardExpanded";

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchAnalyses();
    }
  }, [user, authLoading, navigate]);

  const fetchAnalyses = async () => {
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
  };

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[28px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
              Your Snags
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate("/analyze")}
                className="bg-[#BE3455] hover:bg-[#A52D4A] text-white font-semibold px-4 py-2 rounded-lg gap-2"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </Button>
              <button
                onClick={() => navigate("/settings")}
                className="p-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

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
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 max-w-[680px] mx-auto w-full">
        {filteredAnalyses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F2F2F2] flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[#CCCCCC]" />
            </div>
            <p className="text-[18px] font-semibold text-[#666666] mb-2">
              No snags yet
            </p>
            <p className="text-[14px] text-[#999999] mb-6">
              {searchQuery || activeFilter !== "all"
                ? "No analyses match your search"
                : "Your analysis history will appear here"}
            </p>
            {!searchQuery && activeFilter === "all" && (
              <Button
                onClick={() => navigate("/analyze")}
                className="bg-[#BE3455] hover:bg-[#A52D4A] text-white font-semibold px-6 py-3 rounded-lg"
              >
                Run Your First Snag
              </Button>
            )}
          </div>
        ) : (
          /* Analysis Cards */
          <div className="space-y-3">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id}>
                {expandedId === analysis.id ? (
                  <AnalysisCardExpanded
                    analysis={analysis}
                    onCollapse={() => setExpandedId(null)}
                    onDelete={() => deleteAnalysis(analysis.id)}
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
                          style={{ color: CATEGORY_COLORS[analysis.category || "other"] }}
                        >
                          {analysis.category || "other"}
                        </span>
                        {/* Plan preview */}
                        <p className="text-[15px] text-[#333333] line-clamp-2 mb-2">
                          {analysis.original_input.slice(0, 100)}
                          {analysis.original_input.length > 100 && "..."}
                        </p>
                        {/* Date */}
                        <p className="text-[13px] text-[#999999]">
                          {format(new Date(analysis.created_at), "MMM d, yyyy")}
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
      </main>
    </div>
  );
}
