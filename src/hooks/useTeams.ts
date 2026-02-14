import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  status: string;
  // joined profile
  display_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = async () => {
    if (!user) { setTeams([]); setIsLoading(false); return; }
    const { data } = await supabase.from("teams").select("*");
    setTeams((data as unknown as Team[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchTeams(); }, [user]);

  return { teams, isLoading, refetch: fetchTeams };
}

export function useTeamBySlug(slug: string | undefined) {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("teams").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { setTeam(data as unknown as Team | null); setIsLoading(false); });
  }, [slug]);

  return { team, isLoading, refetch: () => {
    if (!slug) return;
    supabase.from("teams").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => setTeam(data as unknown as Team | null));
  }};
}

export function useTeamMembers(teamId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    if (!teamId) return;
    const { data } = await supabase.from("team_members").select("*").eq("team_id", teamId);
    if (!data) { setMembers([]); setIsLoading(false); return; }
    
    // Fetch profiles for display names
    const userIds = data.map((m: any) => m.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds);
    
    const enriched = data.map((m: any) => {
      const p = profiles?.find((pr: any) => pr.user_id === m.user_id);
      return { ...m, display_name: p?.display_name, avatar_url: p?.avatar_url };
    });
    setMembers(enriched as TeamMember[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [teamId]);
  return { members, isLoading, refetch: fetchMembers };
}

export function useTeamInvitations(teamId: string | undefined) {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvitations = async () => {
    if (!teamId) return;
    const { data } = await supabase.from("team_invitations").select("*").eq("team_id", teamId).is("accepted_at", null);
    setInvitations((data as unknown as TeamInvitation[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchInvitations(); }, [teamId]);
  return { invitations, isLoading, refetch: fetchInvitations };
}

export function useCurrentTeamRole(teamId: string | undefined) {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !user) return;
    supabase.from("team_members").select("role").eq("team_id", teamId).eq("user_id", user.id).eq("status", "active").maybeSingle()
      .then(({ data }) => setRole((data as any)?.role || null));
  }, [teamId, user]);

  const isAdmin = role === "owner" || role === "admin";
  const isOwner = role === "owner";
  return { role, isAdmin, isOwner };
}
