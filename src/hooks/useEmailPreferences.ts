import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EmailPreferences {
  id: string;
  user_id: string;
  outcome_reminders: boolean;
  weekly_digest: boolean;
  team_activity: boolean;
  product_updates: boolean;
  unsubscribed_all: boolean;
  updated_at: string;
}

export function useEmailPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_or_create_email_preferences", {
        p_user_id: user!.id,
      });
      if (error) throw error;
      return data as unknown as EmailPreferences;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateEmailPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<EmailPreferences>) => {
      const { error } = await supabase
        .from("email_preferences")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-preferences"] });
    },
  });
}
