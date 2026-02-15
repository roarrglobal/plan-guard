import { supabase } from "@/integrations/supabase/client";

export type AuditEventType =
  | "decision.created" | "decision.updated" | "decision.deleted"
  | "decision.status_changed" | "decision.visibility_changed"
  | "analysis.started" | "analysis.completed" | "analysis.failed"
  | "outcome.logged" | "outcome.updated"
  | "team.created" | "team.updated" | "team.settings_changed"
  | "member.invited" | "member.joined" | "member.role_changed"
  | "member.removed" | "member.left"
  | "template.created" | "template.updated" | "template.deleted"
  | "auth.login" | "auth.logout" | "auth.password_changed"
  | "export.pdf_generated" | "export.csv_downloaded";

export type AuditEntityType =
  | "decision" | "analysis" | "outcome" | "team"
  | "member" | "template" | "settings" | "export";

interface LogAuditEventParams {
  teamId: string;
  userId: string;
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId?: string;
  eventData?: Record<string, any>;
}

/** Fire-and-forget audit log. Never throws. */
export async function logAuditEvent({
  teamId,
  userId,
  eventType,
  entityType,
  entityId,
  eventData = {},
}: LogAuditEventParams): Promise<void> {
  try {
    await supabase.from("audit_log").insert({
      team_id: teamId,
      user_id: userId,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId || null,
      event_data: eventData,
      user_agent: navigator.userAgent?.substring(0, 500) || null,
    } as any);
  } catch {
    // Non-blocking: never fail the main action
  }
}

const EVENT_LABELS: Record<string, string | ((d: any) => string)> = {
  "decision.created": "Created decision",
  "decision.updated": "Updated decision",
  "decision.deleted": "Deleted decision",
  "decision.status_changed": (d) => `Changed status to ${d.new_status || "unknown"}`,
  "decision.visibility_changed": (d) => `Changed visibility to ${d.new_visibility || "unknown"}`,
  "analysis.started": (d) => `Started ${d.analysis_type || ""} Snag`,
  "analysis.completed": (d) => `Ran ${d.analysis_type || ""} Snag`,
  "analysis.failed": "Analysis failed",
  "outcome.logged": (d) => `Logged outcome: ${d.result || ""}`,
  "outcome.updated": "Updated outcome",
  "team.created": "Created team",
  "team.updated": "Updated team",
  "team.settings_changed": "Changed team settings",
  "member.invited": (d) => `Invited ${d.member_email || "member"}`,
  "member.joined": "Joined the team",
  "member.role_changed": (d) => `Changed role: ${d.member_name || "member"} → ${d.new_role || ""}`,
  "member.removed": (d) => `Removed ${d.member_name || "member"}`,
  "member.left": "Left the team",
  "template.created": "Created template",
  "template.updated": "Updated template",
  "template.deleted": "Deleted template",
  "auth.login": "Logged in",
  "auth.logout": "Logged out",
  "auth.password_changed": "Changed password",
  "export.pdf_generated": "Generated PDF export",
  "export.csv_downloaded": "Downloaded CSV export",
};

export function formatAuditEvent(eventType: string, eventData: Record<string, any> = {}): string {
  const formatter = EVENT_LABELS[eventType];
  if (!formatter) return eventType;
  if (typeof formatter === "function") return formatter(eventData);
  return formatter;
}

const EVENT_COLORS: Record<string, string> = {
  created: "text-green-600",
  joined: "text-green-600",
  logged: "text-green-600",
  completed: "text-green-600",
  updated: "text-blue-500",
  changed: "text-blue-500",
  started: "text-blue-500",
  deleted: "text-destructive",
  removed: "text-destructive",
  failed: "text-destructive",
  left: "text-destructive",
};

export function getEventColor(eventType: string): string {
  const action = eventType.split(".")[1] || "";
  return EVENT_COLORS[action] || "text-muted-foreground";
}
