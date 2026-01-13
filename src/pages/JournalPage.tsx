import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Plus, 
  Calendar, 
  Search,
  PenLine,
  Heart,
  Sparkles,
  Moon,
  Sun,
  FileText,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  entry_type: string;
  content: unknown;
  mood: string | null;
  word_count: number;
  created_at: string;
}

const ENTRY_TYPES = [
  { id: "all", label: "All Entries", icon: FileText },
  { id: "gratitude", label: "Gratitude", icon: Heart },
  { id: "manifestation", label: "Manifestation", icon: Sparkles },
  { id: "reflection", label: "Reflections", icon: PenLine },
  { id: "morning", label: "Morning", icon: Sun },
  { id: "evening", label: "Evening", icon: Moon },
];

const MOOD_COLORS: Record<string, string> = {
  great: "#10B981",
  good: "#34D399",
  okay: "#FBBF24",
  low: "#F97316",
  difficult: "#EF4444",
};

const MOOD_EMOJIS: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  difficult: "😢",
};

export default function JournalPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  
  const activeType = searchParams.get("type") || "all";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchEntries();
    }
  }, [user, authLoading, navigate]);

  const fetchEntries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading journal entries",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
    setIsLoading(false);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesType = activeType === "all" || entry.entry_type === activeType;
    const matchesSearch = JSON.stringify(entry.content)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const entryDates = new Set(
      entries.map(e => {
        const d = new Date(e.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    
    while (entryDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const handleTypeChange = (type: string) => {
    if (type === "all") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", type);
    }
    setSearchParams(searchParams);
  };

  const getEntryPreview = (entry: JournalEntry): string => {
    const content = entry.content as Record<string, unknown> | null;
    if (typeof content === "string") return content;
    if (!content) return "";
    
    // Try to extract text from common fields
    if (content.text) return String(content.text);
    if (content.body) return String(content.body);
    if (content.gratitude_1) return String(content.gratitude_1);
    if (content.vision) return String(content.vision);
    if (content.intention) return String(content.intention);
    
    return JSON.stringify(content).slice(0, 150);
  };

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
            <h1 className="text-2xl font-bold text-foreground">Journal</h1>
            {streak > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                🔥 {streak} day streak
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate("/journal/new")}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Entry Type Tabs */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {ENTRY_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-muted-foreground hover:bg-muted border border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {entries.length === 0 ? "Start your journal" : "No entries found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {entries.length === 0
                ? "Write your first entry to begin building your journaling habit."
                : "Try adjusting your search or filters."}
            </p>
            {entries.length === 0 && (
              <Button onClick={() => navigate("/journal/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => navigate(`/journal/${entry.id}`)}
                className="w-full bg-white border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Mood indicator */}
                  {entry.mood && (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${MOOD_COLORS[entry.mood]}20` }}
                    >
                      {MOOD_EMOJIS[entry.mood]}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {entry.entry_type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, yyyy • h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground line-clamp-2">
                      {getEntryPreview(entry)}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {entry.word_count} words
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
