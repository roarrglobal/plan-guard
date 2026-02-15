import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Minus, Trash2, ExternalLink, Send, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { ChatSuggestions } from "./ChatSuggestions";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "snag-support-chat";
const LEAD_KEY = "snag-chat-lead";

interface HelpChatbotProps {
  mode?: "app" | "marketing";
}

// --- Proactive ping messages ---
function getProactiveMessage(path: string): string {
  if (path === "/pricing") return "🤔 Comparing plans? I can help you find the right one.";
  if (path === "/product") return "✨ Curious how Snag works? Ask me anything!";
  if (path.startsWith("/solutions/sales")) return "📊 Want to see how Snag helps sales teams?";
  if (path.startsWith("/solutions/finance")) return "💰 Questions about decision-making for finance?";
  if (path.startsWith("/solutions/product")) return "🚀 Building products? Let me show you how Snag helps.";
  if (path.startsWith("/solutions")) return "👋 Questions about this solution? I'm here to help!";
  if (path === "/about") return "👋 Want to learn more about us? I'm happy to chat!";
  return "👋 Have questions about Snag? I'm here to help!";
}

// --- Suggestions ---
function getSuggestions(pathname: string, mode: string): string[] {
  if (mode === "marketing") {
    if (pathname === "/pricing") return ["Which plan is right for me?", "Is there a free trial?", "What's in the Business tier?"];
    if (pathname.startsWith("/solutions/sales")) return ["How does it help sales teams?", "Can I see a demo?", "What templates are available?"];
    if (pathname.startsWith("/solutions")) return ["How does Snag help my team?", "What does it cost?", "Can I try it free?"];
    if (pathname === "/product") return ["How does the analysis work?", "What is the SNAG Framework?", "Is my data secure?"];
    return ["How is Snag different from ChatGPT?", "What does it cost?", "How does it work?"];
  }
  // In-app
  if (pathname.startsWith("/team") && pathname.includes("member")) return ["How do I invite team members?", "What are the different roles?"];
  if (pathname.startsWith("/team") && pathname.includes("analytics")) return ["What does accuracy mean?", "How do patterns work?", "Can I export this?"];
  if (pathname.startsWith("/team")) return ["How do team decisions work?", "What are templates?", "How does outcome tracking work?"];
  if (pathname.includes("/decision") || pathname.includes("/analyze")) return ["How do I track the outcome?", "Can I export this as PDF?", "What do the verdict colors mean?"];
  if (pathname.includes("/setting")) return ["How do I change my password?", "How do I cancel my subscription?"];
  return ["How do I run my first analysis?", "What's the difference between Deep Snag and Quick Snag?", "How does outcome tracking work?", "What are templates?"];
}

// --- Proactive ping delay ---
function getProactiveDelay(path: string): number {
  if (path === "/pricing") return 15000;
  if (path.startsWith("/solutions")) return 20000;
  return 30000;
}

export function HelpChatbot({ mode = "app" }: HelpChatbotProps) {
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

  // Marketing lead capture
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Proactive ping
  const [showPing, setShowPing] = useState(false);

  const isTeam = profile?.user_type === "business";
  const isMarketing = mode === "marketing";

  // First name
  const firstName = isMarketing
    ? leadName || "there"
    : profile?.display_name?.split(" ")[0] || "there";

  // Load saved state
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch { /* ignore */ }
    }
    if (sessionStorage.getItem("snag-pulse-shown")) setHasShownPulse(true);

    // Load saved lead
    if (isMarketing) {
      const savedLead = sessionStorage.getItem(LEAD_KEY);
      if (savedLead) {
        try {
          const lead = JSON.parse(savedLead);
          setLeadName(lead.firstName);
          setLeadEmail(lead.email);
          setLeadId(lead.id);
          setLeadCaptured(true);
        } catch { /* ignore */ }
      }
    }
  }, [isMarketing]);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Focus input
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  // Proactive ping (marketing only)
  useEffect(() => {
    if (!isMarketing || open) return;
    if (sessionStorage.getItem("snag-chat-dismissed")) return;

    const delay = getProactiveDelay(location.pathname);
    const timer = setTimeout(() => setShowPing(true), delay);
    return () => clearTimeout(timer);
  }, [isMarketing, open, location.pathname]);

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setShowPing(false);
    if (!hasShownPulse) {
      setHasShownPulse(true);
      sessionStorage.setItem("snag-pulse-shown", "1");
    }
  };

  const dismissPing = () => {
    setShowPing(false);
    sessionStorage.setItem("snag-chat-dismissed", "1");
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Lead form submit
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (leadName.trim().length < 2) { setFormError("Please enter your name (at least 2 characters)"); return; }
    if (!leadEmail.includes("@") || !leadEmail.includes(".")) { setFormError("Please enter a valid email"); return; }

    setFormSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const { data, error } = await supabase
        .from("chat_leads")
        .upsert({
          first_name: leadName.trim(),
          email: leadEmail.toLowerCase().trim(),
          source_page: window.location.pathname,
          referrer: document.referrer || null,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
        }, { onConflict: "email" })
        .select("id")
        .single();

      if (error) throw error;
      setLeadId(data?.id || null);
      sessionStorage.setItem(LEAD_KEY, JSON.stringify({ firstName: leadName.trim(), email: leadEmail.trim(), id: data?.id }));
    } catch (err) {
      console.error("Lead save error:", err);
      // Continue anyway
    } finally {
      setLeadCaptured(true);
      setFormSubmitting(false);
    }
  };

  // Update lead signals via edge function (server-side, bypasses RLS)
  const updateLeadSignals = useCallback(async (text: string) => {
    if (!leadId) return;
    const lower = text.toLowerCase();
    const updates: Record<string, any> = {
      leadId,
      last_interaction_at: new Date().toISOString(),
    };
    if (lower.includes("price") || lower.includes("cost") || lower.includes("plan")) updates.asked_about_pricing = true;
    if (lower.includes("demo")) updates.asked_for_demo = true;
    if (lower.includes("enterprise")) updates.asked_about_enterprise = true;
    if (lower.includes("team")) updates.interested_in_team = true;

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-support`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ leadUpdate: updates, messages: [], context: { mode } }),
    }).catch(() => {});
  }, [leadId, mode]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Track lead signals
    if (isMarketing) updateLeadSignals(text);

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
              mode,
              firstName,
              currentPage: location.pathname,
              accountType: profile?.user_type || "individual",
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

      // Update message count via edge function
      if (isMarketing && leadId) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-support`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ leadUpdate: { leadId, messages_count: newMessages.length }, messages: [], context: { mode } }),
        }).catch(() => {});
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
  }, [messages, isStreaming, profile, location.pathname, mode, firstName, isMarketing, leadId, updateLeadSignals]);

  const suggestions = getSuggestions(location.pathname, mode);
  const showSuggestions = messages.length === 0;
  const needsLeadCapture = isMarketing && !leadCaptured;

  // Greeting message
  const greetingMessage = isMarketing
    ? (leadCaptured ? `Thanks, ${firstName}! 👋\n\nWhat brings you to Snag today?` : "")
    : `Hi${firstName !== "there" ? ` ${firstName}` : ""}! 👋 How can I help you today?`;

  // --- Proactive ping bubble ---
  const pingBubble = showPing && !open && (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="bg-background border border-border rounded-xl shadow-lg p-4 max-w-[280px] relative">
        <button
          onClick={dismissPing}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm text-foreground pr-4 mb-3">{getProactiveMessage(location.pathname)}</p>
        <button
          onClick={handleOpen}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg text-white transition",
            "bg-[hsl(215,100%,33%)] hover:bg-[hsl(215,100%,28%)]"
          )}
        >
          Chat now →
        </button>
      </div>
    </div>
  );

  // --- Floating button ---
  if (!open) {
    return (
      <>
        {pingBubble}
        <button
          onClick={handleOpen}
          className={cn(
            "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all hover:scale-105",
            isMarketing || isTeam
              ? "bg-[hsl(215,100%,33%)] hover:bg-[hsl(215,100%,28%)]"
              : "bg-primary hover:bg-primary/90",
            "text-white",
            !hasShownPulse && "animate-pulse"
          )}
          aria-label="Open help chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </>
    );
  }

  // --- Chat panel ---
  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-background border border-border shadow-2xl",
        isMobile
          ? "inset-0"
          : "bottom-6 right-6 w-[400px] rounded-xl overflow-hidden",
        minimized ? (isMobile ? "inset-x-0 bottom-0 top-auto h-14" : "h-14") : (isMobile ? "" : "h-[520px]"),
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 h-14 shrink-0 text-white cursor-pointer",
          isMarketing || isTeam ? "bg-[hsl(215,100%,33%)]" : "bg-primary"
        )}
        onClick={() => minimized && setMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-semibold text-sm">Snag Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !minimized && !needsLeadCapture && (
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
          {needsLeadCapture ? (
            /* --- Lead capture form --- */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👋</div>
                <h3 className="text-lg font-semibold text-foreground">Hi there!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  I'm here to help you learn about Snag. Before we chat, tell me a bit about yourself:
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="w-full space-y-3">
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  style={{ fontSize: "16px" }}
                  autoFocus
                />
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full bg-muted rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  style={{ fontSize: "16px" }}
                />
                {formError && (
                  <p className="text-xs text-destructive">{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={cn(
                    "w-full py-3 rounded-lg text-sm font-medium text-white transition disabled:opacity-50",
                    "bg-[hsl(215,100%,33%)] hover:bg-[hsl(215,100%,28%)]"
                  )}
                >
                  {formSubmitting ? "Starting..." : "Start Chatting →"}
                </button>
              </form>

              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                <Lock className="w-3 h-3" /> We respect your privacy. No spam, ever.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
                {/* Welcome */}
                {greetingMessage && (
                  <ChatMessage role="assistant" content={greetingMessage} />
                )}

                {showSuggestions && (
                  <ChatSuggestions suggestions={suggestions} onSelect={sendMessage} />
                )}

                {messages.map((m, i) => (
                  <ChatMessage key={i} role={m.role} content={m.content} isTeam={isTeam || isMarketing} />
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
                  placeholder="Type your message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={isStreaming}
                  style={{ fontSize: "16px" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    "p-2 rounded-lg text-white disabled:opacity-50 transition flex items-center justify-center",
                    isMarketing || isTeam
                      ? "bg-[hsl(215,100%,33%)]"
                      : "bg-primary"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}
