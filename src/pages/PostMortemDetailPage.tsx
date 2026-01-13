import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { exportPostMortemPDF, type PostMortemData } from "@/lib/pdfExport";

interface PostMortem {
  id: string;
  title: string | null;
  description: string;
  post_mortem_type: string;
  outcome_status: string | null;
  outcome_rating: number | null;
  user_inputs: Record<string, unknown>;
  ai_analysis: {
    summary?: string;
    root_causes?: string[];
    what_worked?: string[];
    what_didnt?: string[];
    lessons?: string[];
    action_items?: string[];
    uncomfortable_truth?: string;
    one_line_wisdom?: string;
  } | null;
  created_at: string;
  linked_decision_id: string | null;
}

const OUTCOME_COLORS: Record<string, { bg: string; text: string }> = {
  success: { bg: "bg-emerald-100", text: "text-emerald-700" },
  partial: { bg: "bg-amber-100", text: "text-amber-700" },
  failure: { bg: "bg-red-100", text: "text-red-700" },
};

export default function PostMortemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, profile } = useAuth();
  const { toast } = useToast();
  
  const [postMortem, setPostMortem] = useState<PostMortem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && id) {
      fetchPostMortem();
    }
  }, [user, authLoading, id, navigate]);

  const fetchPostMortem = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("post_mortems")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Post-mortem not found",
        description: "This post-mortem doesn't exist or you don't have access.",
        variant: "destructive",
      });
      navigate("/post-mortem");
    } else {
      setPostMortem(data as PostMortem);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!postMortem) return;
    
    const { error } = await supabase
      .from("post_mortems")
      .delete()
      .eq("id", postMortem.id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post-mortem deleted",
      });
      navigate("/post-mortem");
    }
  };

  const handleExportPDF = () => {
    if (!postMortem) return;

    const pdfData: PostMortemData = {
      title: postMortem.title || "Post-Mortem Analysis",
      description: postMortem.description,
      postMortemType: postMortem.post_mortem_type,
      outcomeStatus: postMortem.outcome_status || undefined,
      outcomeRating: postMortem.outcome_rating || undefined,
      analysis: postMortem.ai_analysis || undefined,
    };

    try {
      exportPostMortemPDF(pdfData, profile?.display_name || undefined);
      toast({
        title: "Report exported",
        description: "Your PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!postMortem) {
    return null;
  }

  const analysis = postMortem.ai_analysis;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/post-mortem")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Post-Mortems</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="bg-background border border-border rounded-2xl p-6 mb-6">
          {/* Status & Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs capitalize">
              {postMortem.post_mortem_type}
            </Badge>
            {postMortem.outcome_status && OUTCOME_COLORS[postMortem.outcome_status] && (
              <Badge className={cn(
                "text-xs",
                OUTCOME_COLORS[postMortem.outcome_status].bg,
                OUTCOME_COLORS[postMortem.outcome_status].text
              )}>
                {postMortem.outcome_status}
              </Badge>
            )}
            {postMortem.outcome_rating && (
              <Badge variant="secondary" className="text-xs">
                Rating: {postMortem.outcome_rating}/5
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold text-foreground mb-4">
            {postMortem.title || "Post-Mortem Analysis"}
          </h1>

          {/* Description */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">What happened</p>
            <p className="text-foreground">{postMortem.description}</p>
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="space-y-6">
              {/* Summary */}
              {analysis.summary && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Summary</h3>
                  <p className="text-muted-foreground">{analysis.summary}</p>
                </div>
              )}

              {/* Root Causes */}
              {analysis.root_causes && analysis.root_causes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Root Causes
                  </h3>
                  <ul className="space-y-2">
                    {analysis.root_causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-destructive">•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What Worked */}
              {analysis.what_worked && analysis.what_worked.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    What Worked
                  </h3>
                  <ul className="space-y-2">
                    {analysis.what_worked.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-success">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What Didn't Work */}
              {analysis.what_didnt && analysis.what_didnt.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">What Didn't Work</h3>
                  <ul className="space-y-2">
                    {analysis.what_didnt.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lessons */}
              {analysis.lessons && analysis.lessons.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    Lessons Learned
                  </h3>
                  <ul className="space-y-2">
                    {analysis.lessons.map((lesson, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-warning">•</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {analysis.action_items && analysis.action_items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Action Items
                  </h3>
                  <ul className="space-y-2">
                    {analysis.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Uncomfortable Truth */}
              {analysis.uncomfortable_truth && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-destructive mb-2">The Uncomfortable Truth</h3>
                  <p className="text-sm text-foreground italic">"{analysis.uncomfortable_truth}"</p>
                </div>
              )}

              {/* One Line Wisdom */}
              {analysis.one_line_wisdom && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-foreground font-medium italic">"{analysis.one_line_wisdom}"</p>
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="mt-6 pt-4 border-t border-border text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(postMortem.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post-Mortem?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this post-mortem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
