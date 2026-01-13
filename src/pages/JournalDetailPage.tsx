import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft,
  Trash2,
  Edit,
  MoreVertical,
  Target,
  Search,
  Smile,
  Frown,
  Meh
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

interface JournalEntry {
  id: string;
  entry_type: string;
  content: {
    text?: string;
    gratitude?: string[];
    manifestation?: string;
    morning_pages?: string;
    evening_review?: { highlights?: string; challenges?: string; tomorrow?: string };
  };
  mood: string | null;
  word_count: number | null;
  linked_analysis_id: string | null;
  linked_post_mortem_id: string | null;
  created_at: string;
}

const MOOD_ICONS: Record<string, React.ReactNode> = {
  great: <Smile className="w-5 h-5 text-success" />,
  good: <Smile className="w-5 h-5 text-emerald-400" />,
  okay: <Meh className="w-5 h-5 text-amber-500" />,
  low: <Frown className="w-5 h-5 text-amber-600" />,
  bad: <Frown className="w-5 h-5 text-destructive" />,
};

const ENTRY_TYPE_LABELS: Record<string, string> = {
  free_write: "Free Write",
  gratitude: "Gratitude",
  manifestation: "Manifestation",
  morning_pages: "Morning Pages",
  evening_review: "Evening Review",
};

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user && id) {
      fetchEntry();
    }
  }, [user, authLoading, id, navigate]);

  const fetchEntry = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Entry not found",
        description: "This journal entry doesn't exist or you don't have access.",
        variant: "destructive",
      });
      navigate("/journal");
    } else {
      setEntry(data as JournalEntry);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!entry) return;
    
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entry.id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry deleted",
      });
      navigate("/journal");
    }
  };

  const handleAnalyze = (type: "snag" | "postmortem") => {
    if (!entry) return;
    
    const content = entry.content.text || 
      entry.content.morning_pages || 
      entry.content.manifestation ||
      (entry.content.gratitude?.join("\n")) ||
      JSON.stringify(entry.content.evening_review);
    
    if (type === "snag") {
      navigate("/analyze", { 
        state: { 
          prefillContent: content,
          sourceJournalId: entry.id 
        } 
      });
    } else {
      navigate("/post-mortem/new", { 
        state: { 
          prefillContent: content,
          sourceJournalId: entry.id 
        } 
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

  if (!entry) {
    return null;
  }

  const renderContent = () => {
    const { content, entry_type } = entry;
    
    switch (entry_type) {
      case "gratitude":
        return (
          <div className="space-y-2">
            {content.gratitude?.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-success">✓</span>
                <p className="text-foreground">{item}</p>
              </div>
            ))}
          </div>
        );
      
      case "evening_review":
        return (
          <div className="space-y-4">
            {content.evening_review?.highlights && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Highlights</p>
                <p className="text-foreground">{content.evening_review.highlights}</p>
              </div>
            )}
            {content.evening_review?.challenges && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Challenges</p>
                <p className="text-foreground">{content.evening_review.challenges}</p>
              </div>
            )}
            {content.evening_review?.tomorrow && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tomorrow's Focus</p>
                <p className="text-foreground">{content.evening_review.tomorrow}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <p className="text-foreground whitespace-pre-wrap">
            {content.text || content.morning_pages || content.manifestation}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/journal")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journal</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/journal/new?edit=${entry.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
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
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              {ENTRY_TYPE_LABELS[entry.entry_type] || entry.entry_type}
            </Badge>
            {entry.mood && MOOD_ICONS[entry.mood] && (
              <span className="flex items-center gap-1 text-sm">
                {MOOD_ICONS[entry.mood]}
                <span className="capitalize text-muted-foreground">{entry.mood}</span>
              </span>
            )}
            {entry.word_count && (
              <span className="text-xs text-muted-foreground">
                {entry.word_count} words
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-sm text-muted-foreground mb-4">
            {format(new Date(entry.created_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </p>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {renderContent()}
          </div>

          {/* Linked Items */}
          {(entry.linked_analysis_id || entry.linked_post_mortem_id) && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Linked to:</p>
              <div className="flex flex-wrap gap-2">
                {entry.linked_analysis_id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/analysis/${entry.linked_analysis_id}`)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View Deep Snag
                  </Button>
                )}
                {entry.linked_post_mortem_id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/post-mortem/${entry.linked_post_mortem_id}`)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    View Post-Mortem
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Analyze CTAs */}
        {!entry.linked_analysis_id && !entry.linked_post_mortem_id && (
          <div className="bg-background border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Analyze this entry</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                onClick={() => handleAnalyze("snag")}
              >
                <Target className="w-4 h-4 mr-2" />
                Run Deep Snag (Pre-Mortem)
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleAnalyze("postmortem")}
              >
                <Search className="w-4 h-4 mr-2" />
                Run Post-Mortem
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this journal entry.
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
