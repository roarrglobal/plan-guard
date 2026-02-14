import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DecisionCommentsProps {
  decisionId: string;
  teamId: string;
  members: Array<{ user_id: string; display_name?: string | null }>;
}

interface Comment {
  id: string;
  decision_id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function DecisionComments({ decisionId, teamId, members }: DecisionCommentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["decision-comments", decisionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_decision_comments")
        .select("*")
        .eq("decision_id", decisionId)
        .order("created_at", { ascending: true });
      return (data || []) as Comment[];
    },
    enabled: !!decisionId,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${decisionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_decision_comments", filter: `decision_id=eq.${decisionId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["decision-comments", decisionId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [decisionId, queryClient]);

  // Scroll to bottom on new comments
  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  const getMemberName = (userId: string) =>
    members.find((m) => m.user_id === userId)?.display_name || "Team Member";

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    setIsSending(true);

    const { error } = await supabase.from("team_decision_comments").insert({
      decision_id: decisionId,
      team_id: teamId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast.error("Failed to post comment");
    } else {
      setNewComment("");
      // Log activity
      await supabase.from("team_activity").insert({
        team_id: teamId,
        user_id: user.id,
        action_type: "comment_added",
        entity_type: "decision",
        entity_id: decisionId,
        metadata: { preview: newComment.trim().slice(0, 100) },
      });
    }
    setIsSending(false);
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    const { error } = await supabase
      .from("team_decision_comments")
      .update({ content: editContent.trim() })
      .eq("id", commentId);

    if (error) toast.error("Failed to edit comment");
    else {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["decision-comments", decisionId] });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase
      .from("team_decision_comments")
      .delete()
      .eq("id", commentId);
    if (error) toast.error("Failed to delete comment");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Discussion {comments.length > 0 && `(${comments.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
          )}
          {!isLoading && comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Start the discussion.
            </p>
          )}
          {comments.map((comment) => {
            const isOwn = comment.user_id === user?.id;
            const name = getMemberName(comment.user_id);
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                      <span className="text-[10px] text-muted-foreground">(edited)</span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="text-sm"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(comment.id)}>
                          <Check className="w-3 h-3 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-0.5">{comment.content}</p>
                  )}
                </div>
                {isOwn && !isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
                    <button
                      onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="resize-none text-sm min-h-[38px]"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newComment.trim() || isSending}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
