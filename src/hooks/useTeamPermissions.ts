import { useCurrentTeamRole } from "@/hooks/useTeams";

export type TeamPermission =
  | "view_dashboard"
  | "view_decisions"
  | "create_decision"
  | "edit_own_decision"
  | "edit_any_decision"
  | "delete_own_decision"
  | "delete_any_decision"
  | "view_members"
  | "invite_member"
  | "remove_member"
  | "change_member_role"
  | "view_settings"
  | "edit_settings"
  | "delete_team"
  | "view_analytics"
  | "view_invitations";

const ROLE_PERMISSIONS: Record<string, TeamPermission[]> = {
  owner: [
    "view_dashboard", "view_decisions", "create_decision",
    "edit_own_decision", "edit_any_decision", "delete_own_decision", "delete_any_decision",
    "view_members", "invite_member", "remove_member", "change_member_role",
    "view_settings", "edit_settings", "delete_team",
    "view_analytics", "view_invitations",
  ],
  admin: [
    "view_dashboard", "view_decisions", "create_decision",
    "edit_own_decision", "edit_any_decision", "delete_own_decision", "delete_any_decision",
    "view_members", "invite_member", "remove_member", "change_member_role",
    "view_settings", "edit_settings",
    "view_analytics", "view_invitations",
  ],
  member: [
    "view_dashboard", "view_decisions", "create_decision",
    "edit_own_decision", "delete_own_decision",
    "view_members",
    "view_analytics",
  ],
  viewer: [
    "view_dashboard", "view_decisions",
    "view_members",
    "view_analytics",
  ],
};

export function useTeamPermissions(teamId: string | undefined) {
  const { role, isAdmin, isOwner } = useCurrentTeamRole(teamId);

  const can = (permission: TeamPermission): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  };

  return { role, isAdmin, isOwner, can };
}
