import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DecisionTemplate {
  id: string;
  team_id: string | null;
  department: string;
  name: string;
  description: string | null;
  is_system: boolean;
  input_fields: any[];
  prompt_additions: string | null;
  blind_spot_library: any[];
  failure_mode_library: any[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useDecisionTemplates(teamId: string | undefined) {
  return useQuery({
    queryKey: ["decision-templates", teamId],
    queryFn: async () => {
      // Fetch system templates
      const { data: system } = await supabase
        .from("decision_templates")
        .select("*")
        .eq("is_system", true);

      // Fetch team templates
      let team: any[] = [];
      if (teamId) {
        const { data } = await supabase
          .from("decision_templates")
          .select("*")
          .eq("team_id", teamId)
          .eq("is_system", false);
        team = data || [];
      }

      return [...(system || []), ...team] as DecisionTemplate[];
    },
    enabled: true,
  });
}

export function useTemplateById(id: string | undefined) {
  return useQuery({
    queryKey: ["decision-template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decision_templates")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as DecisionTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate(teamId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Partial<DecisionTemplate>) => {
      const { data, error } = await supabase
        .from("decision_templates")
        .insert({
          ...template,
          team_id: teamId,
          created_by: user!.id,
          is_system: false,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DecisionTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-templates"] });
    },
  });
}

export function useTemplateUsageCount(templateId: string | undefined, teamId: string | undefined) {
  return useQuery({
    queryKey: ["template-usage", templateId, teamId],
    queryFn: async () => {
      const { count } = await (supabase
        .from("team_decisions")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId!) as any)
        .eq("template_id", templateId!);
      return count || 0;
    },
    enabled: !!templateId && !!teamId,
  });
}
