import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Minus, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { ChatSuggestions } from "./ChatSuggestions";
import { useIsMobile } from "@/hooks/use-mobile";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "snag-support-chat";

function getSuggestions(pathname: string): string[] {
  if (pathname.startsWith("/team") && pathname.includes("member")) {
    return ["How do I invite team members?", "What are the different roles?"];
  }
  if (pathname.startsWith("/team")) {
    return ["How do team decisions work?", "What are templates?", "How does outcome tracking work?"];
  }
  if (pathname.includes("/decision") || pathname.includes("/analyze")) {
    return ["How do I track the outcome?", "Can I export this as PDF?", "What do the verdict colors mean?"];
  }
  if (pathname.includes("/setting")) {
    return ["How do I change my password?", "How do I cancel my subscription?"];
  }
  return [
    "How do I run my first analysis?",
    "What's the difference between Deep Snag and Quick Snag?",
    "How does outcome tracking work?",
    "What are templates?",
  ];
}

export function HelpChatbot() {
  const { profile } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasShownPulse, setHasShownPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTeam = profile?.user_type === "business";

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch {}
    }
    if (sessionStorage.getItem("snag-pulse-shown")) setHasShownPulse(true);
  }, []);

  // Save to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    if (!hasShownPulse) {
      setHasShownPulse(true);
      sessionStorage.setItem("snag-pulse-shown", "1");
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            context: {
              accountType: profile?.user_type || "individual",
              currentPage: location.pathname,
              teamRole: null,
              trialDaysLeft: profile?.trial_ends_at
                ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
                : null,
            },
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const content = assistantSoFar;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: e.message?.includes("Rate limited")
            ? "You're asking a lot of questions! Give me a moment, or email support@snagme.app for faster help."
            : "Sorry, I couldn't process that. Please try again or email support@snagme.app for help.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, profile, location.pathname]);

  const suggestions = getSuggestions(location.pathname);
  const showSuggestions = messages.length === 0;

  // Floating button
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all hover:scale-105",
          isTeam ? "bg-[hsl(215,100%,33%)] hover:bg-[hsl(215,100%,28%)]" : "bg-primary hover:bg-primary/90",
          "text-white",
          !hasShownPulse && "animate-pulse"
        )}
        aria-label="Open help chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  // Chat panel
  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-background border border-border shadow-2xl",
        isMobile
          ? "inset-0"
          : "bottom-6 right-6 w-[400px] rounded-xl overflow-hidden",
        minimized ? (isMobile ? "inset-x-0 bottom-0 top-auto h-14" : "h-14") : (isMobile ? "" : "h-[500px]"),
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 h-14 shrink-0 text-white cursor-pointer",
          isTeam ? "bg-[hsl(215,100%,33%)]" : "bg-primary"
        )}
        onClick={() => minimized && setMinimized(false)}
      >
        <span className="font-semibold text-sm">Snag Assistant</span>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !minimized && (
            <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded" title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/20 rounded" title="Minimize">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
            {/* Welcome */}
            <ChatMessage role="assistant" content="Hi! I'm here to help you get the most out of Snag. What can I help you with?" />

            {showSuggestions && (
              <ChatSuggestions suggestions={suggestions} onSelect={sendMessage} />
            )}

            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} isTeam={isTeam} />
            ))}

            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-1 px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <a href="/help" className="hover:text-foreground flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Help Center
            </a>
            <a href="mailto:support@snagme.app" className="hover:text-foreground flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Contact Support
            </a>
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="px-4 py-3 border-t border-border flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={isStreaming}
              style={{ fontSize: "16px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition",
                isTeam ? "bg-[hsl(215,100%,33%)]" : "bg-primary"
              )}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
