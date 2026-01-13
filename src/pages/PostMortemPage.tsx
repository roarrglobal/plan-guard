import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PostMortem {
  id: string;
  title: string | null;
  description: string;
  post_mortem_type: string;
  outcome_status: string | null;
  outcome_rating: number | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  success: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 bg-green-50", label: "Success" },
  partial: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-yellow-600 bg-yellow-50", label: "Partial" },
  failure: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50", label: "Failure" },
  mixed: { icon: <RefreshCw className="w-4 h-4" />, color: "text-blue-600 bg-blue-50", label: "Mixed" },
};

export default function PostMortemPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchPostMortems();
    }
  }, [user, authLoading, navigate]);

  const fetchPostMortems = async () => {
    const { data, error } = await supabase
      .from("post_mortems")
      .select("id, title, description, post_mortem_type, outcome_status, outcome_rating, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading post-mortems",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setPostMortems(data || []);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post-Mortems</h1>
            <p className="text-sm text-muted-foreground mt-1">Learn from what happened</p>
          </div>
          <Button onClick={() => navigate("/post-mortem/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            New Post-Mortem
          </Button>
        </div>

        {/* List */}
        {postMortems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No post-mortems yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Reflect on past decisions and events to learn and improve.
            </p>
            <Button onClick={() => navigate("/post-mortem/new")}>
              Create Your First Post-Mortem
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {postMortems.map((pm) => {
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
