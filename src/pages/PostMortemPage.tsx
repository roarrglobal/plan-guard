import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, CheckCircle, AlertTriangle, XCircle, RefreshCw, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostMortem {
  id: string;
  title: string | null;
  description: string;
  post_mortem_type: string;
  outcome_status: string | null;
  outcome_rating: number | null;
  created_at: string;
}

interface QuickRetro {
  id: string;
  description: string;
  outcome_rating: string;
  category: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  success: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 bg-green-50", label: "Success" },
  partial: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-yellow-600 bg-yellow-50", label: "Partial" },
  failure: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50", label: "Failure" },
  mixed: { icon: <RefreshCw className="w-4 h-4" />, color: "text-blue-600 bg-blue-50", label: "Mixed" },
};

const OUTCOME_EMOJIS: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  poor: "😔",
  bad: "😢",
};

export default function PostMortemPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [quickRetros, setQuickRetros] = useState<QuickRetro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "full" | "quick">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    const [pmResult, qrResult] = await Promise.all([
      supabase
        .from("post_mortems")
        .select("id, title, description, post_mortem_type, outcome_status, outcome_rating, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("quick_retros")
        .select("id, description, outcome_rating, category, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (pmResult.error) {
      toast({
        title: "Error loading post-mortems",
        description: pmResult.error.message,
        variant: "destructive",
      });
    } else {
      setPostMortems(pmResult.data || []);
    }

    if (!qrResult.error) {
      setQuickRetros(qrResult.data || []);
    }

    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const allItems = [
    ...postMortems.map(pm => ({ ...pm, type: "full" as const })),
    ...quickRetros.map(qr => ({ ...qr, type: "quick" as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredItems = allItems
    .filter(item => activeTab === "all" || item.type === (activeTab === "full" ? "full" : "quick"))
    .filter(item => {
      const searchLower = searchQuery.toLowerCase();
      if (item.type === "full") {
        const pm = item as PostMortem;
        return pm.description.toLowerCase().includes(searchLower) || 
               (pm.title?.toLowerCase().includes(searchLower));
      } else {
        const qr = item as QuickRetro;
        return qr.description.toLowerCase().includes(searchLower);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post-Mortems</h1>
            <p className="text-sm text-muted-foreground mt-1">Learn from what happened</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/quick-retro")} variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Quick Retro
            </Button>
            <Button onClick={() => navigate("/post-mortem/new")} className="gap-2">
              <Plus className="w-4 h-4" />
              Full Post-Mortem
            </Button>
          </div>
        </div>

        {/* Type selection cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate("/quick-retro")}
            className="p-4 rounded-xl border border-border bg-card hover:border-warning/50 hover:bg-warning/5 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Quick Retro</h3>
                <p className="text-xs text-muted-foreground">30-60 seconds</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily reflection, meetings, small outcomes
            </p>
          </button>

          <button
            onClick={() => navigate("/post-mortem/new")}
            className="p-4 rounded-xl border border-border bg-card hover:border-amber-400/50 hover:bg-amber-50 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Full Post-Mortem</h3>
                <p className="text-xs text-muted-foreground">5-10 minutes</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Projects, big decisions, major outcomes
            </p>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "all", label: "All" },
            { id: "full", label: "Full Post-Mortems" },
            { id: "quick", label: "Quick Retros" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search post-mortems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No post-mortems yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Reflect on past decisions and events to learn and improve.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => navigate("/quick-retro")} variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Quick Retro
              </Button>
              <Button onClick={() => navigate("/post-mortem/new")}>
                Full Post-Mortem
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              if (item.type === "full") {
                const pm = item as PostMortem & { type: "full" };
                const statusConfig = pm.outcome_status ? STATUS_CONFIG[pm.outcome_status] : null;
                
                return (
                  <button
                    key={pm.id}
                    onClick={() => navigate(`/post-mortem/${pm.id}`)}
                    className="w-full bg-card border border-border rounded-lg p-4 text-left hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="w-4 h-4 text-amber-600" />
                          <Badge variant="outline" className="text-xs capitalize">
                            {pm.post_mortem_type}
                          </Badge>
                          {statusConfig && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-foreground mb-1 truncate">
                          {pm.title || pm.description.slice(0, 60)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pm.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(pm.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              } else {
                const qr = item as QuickRetro & { type: "quick" };
                return (
                  <button
                    key={qr.id}
                    onClick={() => {/* TODO: view quick retro */}}
                    className="w-full bg-card border border-border rounded-lg p-4 text-left hover:border-warning/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{OUTCOME_EMOJIS[qr.outcome_rating] || "😐"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-warning" />
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {qr.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {format(new Date(qr.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {qr.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
