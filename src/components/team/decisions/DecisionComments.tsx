import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DecisionCommentsProps {
  decisionId: string;
  teamId: string;
  teamSlug?: string;
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

interface MentionSuggestion {
  user_id: string;
  display_name: string;
}

export function DecisionComments({ decisionId, teamId, teamSlug, members }: DecisionCommentsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const mentionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  const getMemberName = (userId: string) =>
    members.find((m) => m.user_id === userId)?.display_name || "Team Member";

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // Filter members for mention autocomplete
  const filteredMembers: MentionSuggestion[] = members
    .filter((m) => m.user_id !== user?.id && m.display_name)
    .filter((m) =>
      !mentionQuery || (m.display_name || "").toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .map((m) => ({ user_id: m.user_id, display_name: m.display_name || "Team Member" }))
    .slice(0, 5);

  const insertMention = useCallback((member: MentionSuggestion) => {
    const before = newComment.slice(0, mentionStart);
    const after = newComment.slice(textareaRef.current?.selectionStart || mentionStart);
    const mention = `@${member.display_name} `;
    setNewComment(before + mention + after);
    setShowMentions(false);
    setMentionQuery("");
    setMentionStart(-1);
    textareaRef.current?.focus();
  }, [newComment, mentionStart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(value);

    // Check if we're in a mention context
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex >= 0) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show if @ is at start or after a space, and no spaces in the query yet
      const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : " ";
      if ((charBeforeAt === " " || charBeforeAt === "\n" || lastAtIndex === 0) && !textAfterAt.includes(" ")) {
        setMentionStart(lastAtIndex);
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
  };

  // Extract mentioned user_ids from text
  const extractMentions = (text: string): string[] => {
    const mentionedIds: string[] = [];
    members.forEach((m) => {
      if (m.display_name && text.includes(`@${m.display_name}`)) {
        mentionedIds.push(m.user_id);
      }
    });
    return mentionedIds.filter((id) => id !== user?.id);
  };

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    setIsSending(true);
    const content = newComment.trim();

    const { error } = await supabase.from("team_decision_comments").insert({
      decision_id: decisionId,
      team_id: teamId,
      user_id: user.id,
      content,
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
        metadata: { preview: content.slice(0, 100) },
      });

      // Create notifications for mentioned users and decision participants
      const mentionedIds = extractMentions(content);
      const senderName = getMemberName(user.id);

      // Notify mentioned users
      if (mentionedIds.length > 0) {
        const mentionNotifications = mentionedIds.map((uid) => ({
          user_id: uid,
          team_id: teamId,
          type: "mention",
          title: `${senderName} mentioned you`,
          body: content.slice(0, 200),
          entity_type: "decision",
          entity_id: decisionId,
          actor_id: user.id,
        }));
        await supabase.from("notifications").insert(mentionNotifications);
      }

      // Send email notification via edge function (fire and forget)
      try {
        supabase.functions.invoke("send-notification-email", {
          body: {
            team_id: teamId,
            decision_id: decisionId,
            type: "comment",
            actor_name: senderName,
            content: content.slice(0, 500),
            mentioned_user_ids: mentionedIds,
          },
        });
      } catch {
        // Silent fail for email
      }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, filteredMembers.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render comment text with highlighted mentions
  const renderContent = (text: string) => {
    const mentionRegex = /@(\S+(?:\s\S+)?)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionName = match[1];
      const isMember = members.some((m) => m.display_name === mentionName);
      if (isMember) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
          <span key={match.index} className="text-primary font-medium bg-primary/10 px-0.5 rounded">
            @{mentionName}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length > 0 ? parts : text;
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
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full text-sm border rounded-md p-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-0.5">
                      {renderContent(comment.content)}
                    </p>
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

        {/* Input with mention autocomplete */}
        <div className="relative">
          {showMentions && filteredMembers.length > 0 && (
            <div
              ref={mentionRef}
              className="absolute bottom-full mb-1 left-0 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1"
            >
              {filteredMembers.map((m, i) => (
                <button
                  key={m.user_id}
                  onClick={() => insertMention(m)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                    i === mentionIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                      {getInitials(m.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  {m.display_name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment... Type @ to mention (Enter to send)"
              rows={1}
              className="flex-1 resize-none text-sm min-h-[38px] border rounded-md p-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
        </div>
      </CardContent>
    </Card>
  );
}
