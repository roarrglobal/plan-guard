import { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, ListChecks, Search, Eye, Lock, Shield, Zap, X, SlidersHorizontal,
  ChevronLeft, ChevronRight, ArrowUpDown, CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import type { Team } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { DecisionStatusBadge } from "@/components/team/decisions/DecisionStatusBadge";
import { QuickSnagModal } from "@/components/team/QuickSnagModal";
import { cn } from "@/lib/utils";

const stakesColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const visibilityIcons: Record<string, any> = {
  private: Lock,
  team: Eye,
  leadership: Shield,
};

const CATEGORIES = ["sales", "finance", "product", "hr", "marketing", "operations", "strategy", "other"];
const STAKES = ["low", "medium", "high", "critical"];
const STATUSES = ["draft", "open", "decided", "tracking", "completed", "canceled"];
const VISIBILITIES = ["private", "team", "leadership"];
const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "relevance", label: "Relevance" },
];
const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function parseArrayParam(val: string | null): string[] | null {
  if (!val) return null;
  const arr = val.split(",").filter(Boolean);
  return arr.length > 0 ? arr : null;
}

export default function TeamDecisionsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members } = useTeamMembers(team?.id);
  const { can } = useTeamPermissions(team?.id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL
  const urlQuery = searchParams.get("q") || "";
  const urlCategories = parseArrayParam(searchParams.get("category"));
  const urlStakes = parseArrayParam(searchParams.get("stakes"));
  const urlStatuses = parseArrayParam(searchParams.get("status"));
  const urlCreator = searchParams.get("creator") || null;
  const urlVisibilities = parseArrayParam(searchParams.get("visibility"));
  const urlDateFrom = searchParams.get("from") || null;
  const urlDateTo = searchParams.get("to") || null;
  const urlHasOutcome = searchParams.get("outcome") === "true" ? true : searchParams.get("outcome") === "false" ? false : null;
  const urlSort = searchParams.get("sort") || "created_desc";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [categories, setCategories] = useState<string[]>(urlCategories || []);
  const [stakes, setStakes] = useState<string[]>(urlStakes || []);
  const [statuses, setStatuses] = useState<string[]>(urlStatuses || []);
  const [creatorId, setCreatorId] = useState<string | null>(urlCreator);
  const [visibilities, setVisibilities] = useState<string[]>(urlVisibilities || []);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(urlDateFrom ? new Date(urlDateFrom) : undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(urlDateTo ? new Date(urlDateTo) : undefined);
  const [hasOutcome, setHasOutcome] = useState<boolean | null>(urlHasOutcome);
  const [sortBy, setSortBy] = useState(urlSort);
  const [page, setPage] = useState(urlPage);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [quickSnagOpen, setQuickSnagOpen] = useState(false);

  const debouncedQuery = useDebounce(searchInput, 300);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (categories.length) params.set("category", categories.join(","));
    if (stakes.length) params.set("stakes", stakes.join(","));
    if (statuses.length) params.set("status", statuses.join(","));
    if (creatorId) params.set("creator", creatorId);
    if (visibilities.length) params.set("visibility", visibilities.join(","));
    if (dateFrom) params.set("from", format(dateFrom, "yyyy-MM-dd"));
    if (dateTo) params.set("to", format(dateTo, "yyyy-MM-dd"));
    if (hasOutcome !== null) params.set("outcome", String(hasOutcome));
    if (sortBy !== "created_desc") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, categories, stakes, statuses, creatorId, visibilities, dateFrom, dateTo, hasOutcome, sortBy, page]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedQuery, categories, stakes, statuses, creatorId, visibilities, dateFrom, dateTo, hasOutcome, sortBy]);

  const hasActiveFilters = categories.length > 0 || stakes.length > 0 || statuses.length > 0 || creatorId || visibilities.length > 0 || dateFrom || dateTo || hasOutcome !== null;

  // Keyboard shortcut: Cmd+/ to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        document.getElementById("decision-search")?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickSnagOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search via RPC
  const { data: searchResult, isLoading } = useQuery({
    queryKey: ["team-decisions-search", team?.id, debouncedQuery, categories, stakes, statuses, creatorId, visibilities, dateFrom?.toISOString(), dateTo?.toISOString(), hasOutcome, sortBy, page],
    queryFn: async () => {
      if (!team) return { decisions: [], total_count: 0, page: 1, page_size: PAGE_SIZE, has_more: false };
      const { data, error } = await supabase.rpc("search_team_decisions", {
        p_team_id: team.id,
        p_query: debouncedQuery || null,
        p_categories: categories.length > 0 ? categories : null,
        p_stakes: stakes.length > 0 ? stakes : null,
        p_statuses: statuses.length > 0 ? statuses : null,
        p_creator_id: creatorId || null,
        p_visibilities: visibilities.length > 0 ? visibilities : null,
        p_date_from: dateFrom ? dateFrom.toISOString() : null,
        p_date_to: dateTo ? new Date(dateTo.getTime() + 86400000).toISOString() : null,
        p_has_outcome: hasOutcome,
        p_sort_by: debouncedQuery && sortBy === "created_desc" ? "relevance" : sortBy,
        p_page: page,
        p_page_size: PAGE_SIZE,
      });
      if (error) throw error;
      return data as { decisions: any[]; total_count: number; page: number; page_size: number; has_more: boolean };
    },
    enabled: !!team?.id,
  });

  const decisions = useMemo(() => {
    if (!searchResult?.decisions) return [];
    return searchResult.decisions.map((d: any) => {
      const member = members.find((m) => m.user_id === d.created_by);
      return { ...d, creator_name: member?.display_name || "Team Member" };
    });
  }, [searchResult?.decisions, members]);

  const totalCount = searchResult?.total_count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const clearAllFilters = () => {
    setSearchInput("");
    setCategories([]);
    setStakes([]);
    setStatuses([]);
    setCreatorId(null);
    setVisibilities([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setHasOutcome(null);
    setSortBy("created_desc");
    setPage(1);
  };

  const toggleArrayFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "category": setCategories(categories.filter(c => c !== value)); break;
      case "stakes": setStakes(stakes.filter(s => s !== value)); break;
      case "status": setStatuses(statuses.filter(s => s !== value)); break;
      case "creator": setCreatorId(null); break;
      case "visibility": setVisibilities(visibilities.filter(v => v !== value)); break;
      case "dateFrom": setDateFrom(undefined); break;
      case "dateTo": setDateTo(undefined); break;
      case "outcome": setHasOutcome(null); break;
    }
  };

  // Usage query
  const { data: usage } = useQuery({
    queryKey: ["team-usage", team?.id],
    queryFn: async () => {
      if (!team) return null;
      const { data } = await supabase.rpc("get_or_create_team_usage", { p_team_id: team.id });
      return data as any;
    },
    enabled: !!team?.id,
  });

  const usagePercent = usage ? Math.round(((usage.deep_snags_used || 0) / 200) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Decisions</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} decision{totalCount !== 1 ? "s" : ""}
            {(debouncedQuery || hasActiveFilters) && ` found`}
            {usage && (
              <span className="ml-2">
                · {usage.deep_snags_used || 0}/200 Deep Snags
                {usagePercent >= 80 && <span className="text-warning ml-1">⚠️</span>}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQuickSnagOpen(true)}>
            <Zap className="w-4 h-4 mr-1" /> Quick Snag
          </Button>
          {can("create_decision") && (
            <Button onClick={() => navigate(`/team/${team.slug}/decisions/new`)} className="bg-primary">
              <Plus className="w-4 h-4 mr-2" /> New Decision
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="decision-search"
            placeholder="Search decisions... (⌘/)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9 bg-input"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={filtersExpanded || hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {categories.length + stakes.length + statuses.length + visibilities.length + (creatorId ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (hasOutcome !== null ? 1 : 0)}
            </Badge>
          )}
        </Button>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters (always visible) */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => toggleArrayFilter(statuses, s, setStatuses)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
              statuses.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      {filtersExpanded && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleArrayFilter(categories, c, setCategories)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs capitalize transition-colors",
                      categories.includes(c) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Stakes */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Stakes</label>
              <div className="flex flex-wrap gap-1.5">
                {STAKES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleArrayFilter(stakes, s, setStakes)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs capitalize transition-colors",
                      stakes.includes(s) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Visibility</label>
              <div className="flex flex-wrap gap-1.5">
                {VISIBILITIES.map(v => (
                  <button
                    key={v}
                    onClick={() => toggleArrayFilter(visibilities, v, setVisibilities)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs capitalize transition-colors",
                      visibilities.includes(v) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Creator</label>
              <Select value={creatorId || "all"} onValueChange={v => setCreatorId(v === "all" ? null : v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any member</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.user_id} value={m.user_id}>{m.display_name || "Member"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Has Outcome */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Outcome logged</label>
              <Select value={hasOutcome === null ? "any" : String(hasOutcome)} onValueChange={v => setHasOutcome(v === "any" ? null : v === "true")}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map(c => (
            <Badge key={`cat-${c}`} variant="secondary" className="gap-1 capitalize text-xs">
              {c} <button onClick={() => removeFilter("category", c)}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
          {stakes.map(s => (
            <Badge key={`st-${s}`} variant="secondary" className="gap-1 capitalize text-xs">
              {s} stakes <button onClick={() => removeFilter("stakes", s)}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
          {visibilities.map(v => (
            <Badge key={`vis-${v}`} variant="secondary" className="gap-1 capitalize text-xs">
              {v} <button onClick={() => removeFilter("visibility", v)}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
          {creatorId && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Creator: {members.find(m => m.user_id === creatorId)?.display_name || "Member"}
              <button onClick={() => removeFilter("creator")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="secondary" className="gap-1 text-xs">
              From: {format(dateFrom, "MMM d")}
              <button onClick={() => removeFilter("dateFrom")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {dateTo && (
            <Badge variant="secondary" className="gap-1 text-xs">
              To: {format(dateTo, "MMM d")}
              <button onClick={() => removeFilter("dateTo")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {hasOutcome !== null && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Outcome: {hasOutcome ? "Yes" : "No"}
              <button onClick={() => removeFilter("outcome")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ListChecks className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              {debouncedQuery ? `No decisions match "${debouncedQuery}"` : hasActiveFilters ? "No decisions match these filters" : "No decisions yet"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {debouncedQuery || hasActiveFilters ? "Try different keywords or clear your filters." : "Create your first decision to get started."}
            </p>
            {(debouncedQuery || hasActiveFilters) && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>Clear search & filters</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Result count */}
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} decisions
          </p>

          <div className="space-y-2">
            {decisions.map((d: any) => {
              const VisIcon = visibilityIcons[d.visibility] || Eye;
              return (
                <Link key={d.id} to={`/team/${team.slug}/decisions/${d.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{d.decision_text}</p>
                          {d.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{d.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">{d.creator_name}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d")}</span>
                            <DecisionStatusBadge status={d.status} />
                            <Badge variant="outline" className={cn("text-[10px]", stakesColors[d.stakes] || "")}>
                              {d.stakes}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">{d.category}</Badge>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <VisIcon className="w-2.5 h-2.5" /> {d.visibility || "team"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!searchResult?.has_more}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <QuickSnagModal
        open={quickSnagOpen}
        onOpenChange={setQuickSnagOpen}
        teamId={team.id}
        teamSlug={team.slug}
      />
    </div>
  );
}
