import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays, subMonths, isWithinInterval } from "date-fns";
import {
  FileText,
  Download,
  Search,
  Target,
  Zap,
  Grid3X3,
  CheckSquare,
  Square,
  ChevronRight,
  BarChart3,
  CalendarIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  exportPreMortemPDF,
  exportPostMortemPDF,
  exportFrameworkPDF,
  exportDecisionPDF,
  type PreMortemData,
  type PostMortemData,
  type FrameworkData,
  type DecisionData,
} from "@/lib/pdfExport";
import type { Json } from "@/integrations/supabase/types";

interface Analysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

interface Decision {
  id: string;
  decision_text: string;
  options: Json;
  stakes: string | null;
  category: string | null;
  status: string;
  chosen_option: string | null;
  confidence: number | null;
  outcome_status: string | null;
  outcome_notes: string | null;
  ai_nudge: string | null;
  created_at: string;
}

interface FrameworkAnalysis {
  id: string;
  framework_type: string;
  title: string | null;
  inputs: Json;
  ai_enhancement: Json | null;
  created_at: string;
}

interface PostMortem {
  id: string;
  title: string | null;
  description: string;
  post_mortem_type: string;
  outcome_status: string | null;
  outcome_rating: number | null;
  ai_analysis: Json | null;
  created_at: string;
}

type ReportItem = {
  id: string;
  type: "analysis" | "decision" | "framework" | "postmortem";
  title: string;
  subtitle: string;
  date: string;
  category?: string;
  data: Analysis | Decision | FrameworkAnalysis | PostMortem;
};

const REPORT_TABS = [
  { id: "all", label: "All Reports", icon: FileText },
  { id: "analysis", label: "Deep Snags", icon: Target },
  { id: "decision", label: "Decisions", icon: Zap },
  { id: "framework", label: "Frameworks", icon: Grid3X3 },
  { id: "postmortem", label: "Post-Mortems", icon: BarChart3 },
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  analysis: { bg: "bg-primary/10", text: "text-primary" },
  decision: { bg: "bg-amber-100", text: "text-amber-700" },
  framework: { bg: "bg-violet-100", text: "text-violet-700" },
  postmortem: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkAnalysis[]>([]);
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [datePreset, setDatePreset] = useState<string | null>(null);

  const DATE_PRESETS = [
    { label: "Last 7 days", value: "7d", getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Last 30 days", value: "30d", getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Last 3 months", value: "3m", getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: "Last 6 months", value: "6m", getRange: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
    { label: "This year", value: "year", getRange: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) },
  ];

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.getRange();
    setDateRange(range);
    setDatePreset(preset.value);
  };

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setDatePreset(null);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, authLoading, navigate]);

  const fetchAllData = async () => {
    setIsLoading(true);

    const [analysesRes, decisionsRes, frameworksRes, postMortemsRes] = await Promise.all([
      supabase.from("analyses").select("*").order("created_at", { ascending: false }),
      supabase.from("decisions").select("*").order("created_at", { ascending: false }),
      supabase.from("framework_analyses").select("*").order("created_at", { ascending: false }),
      supabase.from("post_mortems").select("*").order("created_at", { ascending: false }),
    ]);

    if (analysesRes.error) console.error("Analyses error:", analysesRes.error);
    if (decisionsRes.error) console.error("Decisions error:", decisionsRes.error);
    if (frameworksRes.error) console.error("Frameworks error:", frameworksRes.error);
    if (postMortemsRes.error) console.error("Post-mortems error:", postMortemsRes.error);

    setAnalyses((analysesRes.data as Analysis[]) || []);
    setDecisions((decisionsRes.data as Decision[]) || []);
    setFrameworks((frameworksRes.data as FrameworkAnalysis[]) || []);
    setPostMortems((postMortemsRes.data as PostMortem[]) || []);
    setIsLoading(false);
  };

  // Combine all items into a unified list
  const allItems: ReportItem[] = useMemo(() => {
    const items: ReportItem[] = [];

    analyses.forEach((a) => {
      items.push({
        id: `analysis-${a.id}`,
        type: "analysis",
        title: a.original_input.slice(0, 80) + (a.original_input.length > 80 ? "..." : ""),
        subtitle: "Deep Snag Analysis",
        date: a.created_at,
        category: a.category || undefined,
        data: a,
      });
    });

    decisions.forEach((d) => {
      items.push({
        id: `decision-${d.id}`,
        type: "decision",
        title: d.decision_text.slice(0, 80) + (d.decision_text.length > 80 ? "..." : ""),
        subtitle: `${d.status} • ${d.stakes || "No"} stakes`,
        date: d.created_at,
        category: d.category || undefined,
        data: d,
      });
    });

    frameworks.forEach((f) => {
      const frameworkName = f.framework_type === "swot" ? "SWOT" : f.framework_type === "porter" ? "Porter's Five Forces" : "Pre-Mortem";
      items.push({
        id: `framework-${f.id}`,
        type: "framework",
        title: f.title || `${frameworkName} Analysis`,
        subtitle: frameworkName,
        date: f.created_at,
        data: f,
      });
    });

    postMortems.forEach((p) => {
      items.push({
        id: `postmortem-${p.id}`,
        type: "postmortem",
        title: p.title || p.description.slice(0, 80) + (p.description.length > 80 ? "..." : ""),
        subtitle: `${p.post_mortem_type} • ${p.outcome_status || "Pending"}`,
        date: p.created_at,
        data: p,
      });
    });

    // Sort by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return items;
  }, [analyses, decisions, frameworks, postMortems]);

  // Filter items based on active tab, search, and date range
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filtering
      let matchesDate = true;
      if (dateRange.from || dateRange.to) {
        const itemDate = new Date(item.date);
        if (dateRange.from && dateRange.to) {
          matchesDate = isWithinInterval(itemDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange.from) {
          matchesDate = itemDate >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          matchesDate = itemDate <= endOfDay(dateRange.to);
        }
      }
      
      return matchesTab && matchesSearch && matchesDate;
    });
  }, [allItems, activeTab, searchQuery, dateRange]);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const exportSingleItem = (item: ReportItem) => {
    try {
      if (item.type === "analysis") {
        const analysis = item.data as Analysis;
        const result = analysis.result as Record<string, unknown>;
        const preMortemData: PreMortemData = {
          originalInput: analysis.original_input,
          blindSpots: (result.blind_spots as PreMortemData["blindSpots"]) || [],
          failureModes: (result.failure_modes as PreMortemData["failureModes"]) || [],
          warningSignals: (result.warning_signals as PreMortemData["warningSignals"]) || [],
          killCriteria: (result.kill_criteria as PreMortemData["killCriteria"]) || [],
          unaskedQuestion: (result.unasked_question as string) || "",
          category: analysis.category || undefined,
        };
        exportPreMortemPDF(preMortemData);
      } else if (item.type === "decision") {
        const decision = item.data as Decision;
        const decisionData: DecisionData = {
          decisionText: decision.decision_text,
          options: decision.options as DecisionData["options"],
          stakes: decision.stakes || undefined,
          category: decision.category || undefined,
          chosenOption: decision.chosen_option || undefined,
          confidence: decision.confidence || undefined,
          aiNudge: decision.ai_nudge || undefined,
          outcomeStatus: decision.outcome_status || undefined,
          outcomeNotes: decision.outcome_notes || undefined,
        };
        exportDecisionPDF(decisionData);
      } else if (item.type === "framework") {
        const framework = item.data as FrameworkAnalysis;
        const frameworkData: FrameworkData = {
          title: framework.title || "Framework Analysis",
          frameworkType: framework.framework_type as "swot" | "porter" | "premortem",
          inputs: framework.inputs as Record<string, unknown>,
          aiEnhancement: framework.ai_enhancement as Record<string, unknown> | undefined,
        };
        exportFrameworkPDF(frameworkData);
      } else if (item.type === "postmortem") {
        const postMortem = item.data as PostMortem;
        const postMortemData: PostMortemData = {
          title: postMortem.title || "Post-Mortem Analysis",
          description: postMortem.description,
          postMortemType: postMortem.post_mortem_type,
          outcomeStatus: postMortem.outcome_status || undefined,
          outcomeRating: postMortem.outcome_rating || undefined,
          analysis: postMortem.ai_analysis as PostMortemData["analysis"],
        };
        exportPostMortemPDF(postMortemData);
      }
      return true;
    } catch (error) {
      console.error("Export error:", error);
      return false;
    }
  };

  const handleBatchExport = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one report to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    let successCount = 0;
    let failCount = 0;

    // Small delay between exports to prevent browser blocking
    for (const itemId of Array.from(selectedItems)) {
      const item = allItems.find((i) => i.id === itemId);
      if (item) {
        const success = exportSingleItem(item);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsExporting(false);
    setSelectedItems(new Set());

    if (failCount === 0) {
      toast({
        title: "Export complete",
        description: `Successfully exported ${successCount} report${successCount !== 1 ? "s" : ""}.`,
      });
    } else {
      toast({
        title: "Export completed with errors",
        description: `Exported ${successCount} report${successCount !== 1 ? "s" : ""}, ${failCount} failed.`,
        variant: "destructive",
      });
    }
  };

  const handleItemClick = (item: ReportItem) => {
    if (item.type === "analysis") {
      navigate(`/analysis/${(item.data as Analysis).id}`);
    } else if (item.type === "decision") {
      navigate(`/decisions/${(item.data as Decision).id}`);
    } else if (item.type === "framework") {
      const framework = item.data as FrameworkAnalysis;
      navigate(`/frameworks/${framework.framework_type}/${framework.id}`);
    } else if (item.type === "postmortem") {
      navigate(`/post-mortem/${(item.data as PostMortem).id}`);
    }
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
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {allItems.length} total reports • Export as McKinsey-style PDFs
            </p>
          </div>
          <Button
            onClick={handleBatchExport}
            disabled={selectedItems.size === 0 || isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting
              ? "Exporting..."
              : `Export ${selectedItems.size > 0 ? `(${selectedItems.size})` : ""}`}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{analyses.length}</p>
                  <p className="text-xs text-muted-foreground">Deep Snags</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{decisions.length}</p>
                  <p className="text-xs text-muted-foreground">Decisions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="text-2xl font-bold">{frameworks.length}</p>
                  <p className="text-xs text-muted-foreground">Frameworks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{postMortems.length}</p>
                  <p className="text-xs text-muted-foreground">Post-Mortems</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-4 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.id === "all"
                  ? allItems.length
                  : allItems.filter((i) => i.type === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted border border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs",
                      activeTab === tab.id ? "bg-white/20" : "bg-muted"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, Date Filter, and Select All */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal min-w-[200px]",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Filter by date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="flex flex-wrap gap-2">
                  {DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={datePreset === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  setDateRange({ from: range?.from, to: range?.to });
                  setDatePreset(null);
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
              {(dateRange.from || dateRange.to) && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="whitespace-nowrap"
          >
            {selectedItems.size === filteredItems.length && filteredItems.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        </div>
        
        {/* Active Date Filter Indicator */}
        {(dateRange.from || dateRange.to) && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span>
              Showing reports from{" "}
              {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "start"} to{" "}
              {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "now"}
            </span>
            <Button variant="ghost" size="sm" onClick={clearDateFilter} className="h-6 px-2">
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Reports List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {allItems.length === 0
                ? "Start analyzing decisions to generate reports."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const colors = TYPE_COLORS[item.type];
              const isSelected = selectedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-background border rounded-xl p-4 transition-all",
                    isSelected ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectItem(item.id)}
                      className="h-5 w-5"
                    />
                    <button
                      onClick={() => handleItemClick(item)}
                      className="flex-1 flex items-start justify-between gap-3 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={cn("text-xs capitalize", colors.bg, colors.text)}>
                            {item.type === "postmortem" ? "Post-Mortem" : item.type}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.subtitle}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSingleItem(item);
                        toast({
                          title: "PDF exported",
                          description: `${item.title.slice(0, 30)}...`,
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
