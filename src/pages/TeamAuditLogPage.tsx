import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers } from "@/hooks/useTeams";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, Download, Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";
import { formatAuditEvent, getEventColor } from "@/lib/auditLog";
import type { Team } from "@/hooks/useTeams";

const EVENT_TYPE_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "decision", label: "Decision Events" },
  { value: "analysis", label: "Analysis Events" },
  { value: "outcome", label: "Outcome Events" },
  { value: "member", label: "Member Events" },
  { value: "team", label: "Team Events" },
  { value: "template", label: "Template Events" },
  { value: "export", label: "Export Events" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "All Entities" },
  { value: "decision", label: "Decisions" },
  { value: "analysis", label: "Analyses" },
  { value: "outcome", label: "Outcomes" },
  { value: "member", label: "Members" },
  { value: "team", label: "Team" },
  { value: "template", label: "Templates" },
  { value: "export", label: "Exports" },
];

const PAGE_SIZE = 50;

export default function TeamAuditLogPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { user } = useAuth();
  const { members } = useTeamMembers(team?.id);
  const { isAdmin } = useTeamPermissions(team?.id);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-log", team?.id, page, eventFilter, entityFilter, userFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("audit_log")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (eventFilter !== "all") {
        query = query.like("event_type", `${eventFilter}.%` as any);
      }
      if (entityFilter !== "all") {
        query = query.eq("entity_type", entityFilter as any);
      }
      if (userFilter !== "all") {
        query = query.eq("user_id", userFilter);
      }
      if (dateFrom) {
        query = query.gte("created_at", new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setDate(to.getDate() + 1);
        query = query.lt("created_at", to.toISOString());
      }

      const { data } = await query;
      return (data || []) as any[];
    },
    enabled: !!team?.id && isAdmin,
  });
  function getMemberName(userId: string) {
    return members.find((m) => m.user_id === userId)?.display_name || "Unknown User";
  }
  function getMemberAvatar(userId: string) {
    return members.find((m) => m.user_id === userId)?.avatar_url || undefined;
  }

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter((log: any) => {
      const eventDesc = formatAuditEvent(log.event_type, log.event_data);
      const memberName = getMemberName(log.user_id);
      const dataStr = JSON.stringify(log.event_data || {}).toLowerCase();
      return eventDesc.toLowerCase().includes(q) || memberName.toLowerCase().includes(q) || dataStr.includes(q);
    });
  }, [logs, search, members]);

  const activeMembers = members.filter((m) => m.status === "active");

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">Only team owners and admins can view the audit log.</p>
        </div>
      </div>
    );
  }

  const exportCsv = () => {
    const rows = [["Timestamp", "User", "Event Type", "Entity Type", "Entity ID", "Description", "Details"]];
    filteredLogs.forEach((log: any) => {
      rows.push([
        log.created_at,
        getMemberName(log.user_id),
        log.event_type,
        log.entity_type || "",
        log.entity_id || "",
        formatAuditEvent(log.event_type, log.event_data),
        JSON.stringify(log.event_data || {}),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${team.slug}-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // activeMembers already defined above

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete record of all team activity</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
              <Filter className="w-4 h-4" /> Filters
              {(eventFilter !== "all" || entityFilter !== "all" || userFilter !== "all" || dateFrom || dateTo) && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {[eventFilter !== "all", entityFilter !== "all", userFilter !== "all", !!dateFrom, !!dateTo].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-border">
              <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {activeMembers.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.display_name || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-9 text-xs" placeholder="From" />
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-9 text-xs" placeholder="To" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log entries */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-12">Loading audit log...</p>
          )}
          {!isLoading && filteredLogs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">No audit events found.</p>
          )}

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-44">Timestamp</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-40">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Event</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Entity</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log: any) => {
                  const isExpanded = expandedId === log.id;
                  const eventDesc = formatAuditEvent(log.event_type, log.event_data);
                  const colorClass = getEventColor(log.event_type);
                  const title = log.event_data?.title || log.event_data?.member_name || log.event_data?.member_email || "";

                  return (
                    <Collapsible key={log.id} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : log.id)} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <tr className="hover:bg-muted/20 cursor-pointer transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.created_at), "MMM d, h:mm a")}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={getMemberAvatar(log.user_id)} />
                                  <AvatarFallback className="text-[10px] bg-muted">
                                    {getMemberName(log.user_id)[0]?.toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                                  {getMemberName(log.user_id)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm ${colorClass}`}>{eventDesc}</span>
                              {title && (
                                <span className="text-sm text-foreground font-medium ml-1">"{title}"</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px] capitalize py-0">
                                {log.entity_type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </td>
                          </tr>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <tr>
                            <td colSpan={5} className="px-4 py-3 bg-muted/20">
                              <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <span className="text-muted-foreground">Event Type:</span>
                                    <p className="font-mono text-foreground">{log.event_type}</p>
                                  </div>
                                  {log.entity_id && (
                                    <div>
                                      <span className="text-muted-foreground">Entity ID:</span>
                                      <p className="font-mono text-foreground truncate">{log.entity_id}</p>
                                    </div>
                                  )}
                                  {log.user_agent && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">User Agent:</span>
                                      <p className="font-mono text-foreground truncate">{log.user_agent}</p>
                                    </div>
                                  )}
                                </div>
                                {log.event_data && Object.keys(log.event_data).length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Event Data:</span>
                                    <div className="mt-1 p-2 rounded bg-background border border-border">
                                      {Object.entries(log.event_data).map(([key, val]) => (
                                        <div key={key} className="flex gap-2">
                                          <span className="text-muted-foreground font-mono">{key}:</span>
                                          <span className="text-foreground">{String(val)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-border">
            {filteredLogs.map((log: any) => {
              const eventDesc = formatAuditEvent(log.event_type, log.event_data);
              const colorClass = getEventColor(log.event_type);
              const title = log.event_data?.title || log.event_data?.member_name || "";
              const isExpanded = expandedId === log.id;

              return (
                <Collapsible key={log.id} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : log.id)}>
                  <CollapsibleTrigger className="w-full text-left p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={getMemberAvatar(log.user_id)} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {getMemberName(log.user_id)[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">{getMemberName(log.user_id)}</p>
                          <p className={`text-xs ${colorClass}`}>
                            {eventDesc} {title && <span className="text-foreground font-medium">"{title}"</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {format(new Date(log.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="p-2 rounded bg-muted/20 space-y-1 text-xs">
                      <p><span className="text-muted-foreground">Type:</span> <span className="font-mono">{log.event_type}</span></p>
                      <p><span className="text-muted-foreground">Entity:</span> {log.entity_type}</p>
                      {log.event_data && Object.entries(log.event_data).map(([key, val]) => (
                        <p key={key}><span className="text-muted-foreground">{key}:</span> {String(val)}</p>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Pagination */}
          {filteredLogs.length >= PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
