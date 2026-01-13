import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Plus, 
  Search, 
  Target, 
  ChevronRight,
  Briefcase,
  User,
  Plane,
  Lightbulb,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Target },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "business", label: "Business", icon: Target },
  { id: "personal", label: "Personal", icon: User },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "other", label: "Other", icon: Lightbulb },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  career: { bg: "bg-primary/10", text: "text-primary" },
  business: { bg: "bg-emerald-100", text: "text-emerald-700" },
  personal: { bg: "bg-violet-100", text: "text-violet-700" },
  travel: { bg: "bg-amber-100", text: "text-amber-700" },
  other: { bg: "bg-muted", text: "text-muted-foreground" },
};

export default function AnalysisHistoryPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchAnalyses();
    }
  }, [user, authLoading, navigate]);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
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

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesCategory = activeCategory === "all" || analysis.category === activeCategory;
    const matchesSearch = analysis.original_input
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deep Snags</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {analyses.length} total analyses
            </p>
          </div>
          <Button onClick={() => navigate("/analyze")}>
            <Plus className="w-4 h-4 mr-2" />
            New Deep Snag
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-4 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === "all" 
                ? analyses.length 
                : analyses.filter(a => a.category === cat.id).length;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-muted-foreground hover:bg-muted border border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs",
                    isActive ? "bg-white/20" : "bg-muted"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Analyses List */}
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {analyses.length === 0 ? "No analyses yet" : "No analyses found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {analyses.length === 0
                ? "Start stress-testing your decisions with Deep Snag."
                : "Try adjusting your search or filters."}
            </p>
            {analyses.length === 0 && (
              <Button onClick={() => navigate("/analyze")}>
                <Plus className="w-4 h-4 mr-2" />
                Run First Deep Snag
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((analysis) => {
              const category = analysis.category || "other";
              const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
              const result = analysis.result as Record<string, unknown>;
              const blindSpotsCount = Array.isArray(result?.blind_spots) ? result.blind_spots.length : 0;
              const failureModesCount = Array.isArray(result?.failure_modes) ? result.failure_modes.length : 0;

              return (
                <button
                  key={analysis.id}
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                  className="w-full bg-white border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={cn("text-xs capitalize", colors.bg, colors.text)}>
                          {category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {blindSpotsCount} blind spots • {failureModesCount} failure modes
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {analysis.original_input}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
