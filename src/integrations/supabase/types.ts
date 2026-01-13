export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          category: string | null
          created_at: string
          id: string
          original_input: string
          result: Json
          source_file_url: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          original_input: string
          result: Json
          source_file_url?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          original_input?: string
          result?: Json
          source_file_url?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          ai_nudge: string | null
          category: string | null
          chosen_option: string | null
          confidence: number | null
          created_at: string
          deadline: string | null
          decision_text: string
          deep_snag_id: string | null
          id: string
          options: Json | null
          outcome_check_date: string | null
          outcome_logged_at: string | null
          outcome_notes: string | null
          outcome_status: string | null
          stakes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_nudge?: string | null
          category?: string | null
          chosen_option?: string | null
          confidence?: number | null
          created_at?: string
          deadline?: string | null
          decision_text: string
          deep_snag_id?: string | null
          id?: string
          options?: Json | null
          outcome_check_date?: string | null
          outcome_logged_at?: string | null
          outcome_notes?: string | null
          outcome_status?: string | null
          stakes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_nudge?: string | null
          category?: string | null
          chosen_option?: string | null
          confidence?: number | null
          created_at?: string
          deadline?: string | null
          decision_text?: string
          deep_snag_id?: string | null
          id?: string
          options?: Json | null
          outcome_check_date?: string | null
          outcome_logged_at?: string | null
          outcome_notes?: string | null
          outcome_status?: string | null
          stakes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_deep_snag_id_fkey"
            columns: ["deep_snag_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_analyses: {
        Row: {
          ai_enhancement: Json | null
          created_at: string
          framework_type: string
          id: string
          inputs: Json
          title: string | null
          updated_at: string
          user_id: string
          visual_data: Json | null
        }
        Insert: {
          ai_enhancement?: Json | null
          created_at?: string
          framework_type: string
          id?: string
          inputs?: Json
          title?: string | null
          updated_at?: string
          user_id: string
          visual_data?: Json | null
        }
        Update: {
          ai_enhancement?: Json | null
          created_at?: string
          framework_type?: string
          id?: string
          inputs?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
          visual_data?: Json | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          best_streak: number | null
          category: string | null
          created_at: string
          current_streak: number | null
          frequency: string
          frequency_days: number[] | null
          id: string
          is_active: boolean | null
          name: string
          reminder_time: string | null
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          best_streak?: number | null
          category?: string | null
          created_at?: string
          current_streak?: number | null
          frequency?: string
          frequency_days?: number[] | null
          id?: string
          is_active?: boolean | null
          name: string
          reminder_time?: string | null
          user_id: string
          why_it_matters?: string | null
        }
        Update: {
          best_streak?: number | null
          category?: string | null
          created_at?: string
          current_streak?: number | null
          frequency?: string
          frequency_days?: number[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_time?: string | null
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: Json
          created_at: string
          entry_type: string
          id: string
          linked_analysis_id: string | null
          linked_post_mortem_id: string | null
          mood: string | null
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content?: Json
          created_at?: string
          entry_type: string
          id?: string
          linked_analysis_id?: string | null
          linked_post_mortem_id?: string | null
          mood?: string | null
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: Json
          created_at?: string
          entry_type?: string
          id?: string
          linked_analysis_id?: string | null
          linked_post_mortem_id?: string | null
          mood?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_linked_analysis_id_fkey"
            columns: ["linked_analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_linked_post_mortem_id_fkey"
            columns: ["linked_post_mortem_id"]
            isOneToOne: false
            referencedRelation: "post_mortems"
            referencedColumns: ["id"]
          },
        ]
      }
      post_mortems: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          description: string
          id: string
          linked_decision_id: string | null
          outcome_rating: number | null
          outcome_status: string | null
          post_mortem_type: string
          source_journal_id: string | null
          timeframe_end: string | null
          timeframe_start: string | null
          title: string | null
          updated_at: string
          user_id: string
          user_inputs: Json
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          description: string
          id?: string
          linked_decision_id?: string | null
          outcome_rating?: number | null
          outcome_status?: string | null
          post_mortem_type: string
          source_journal_id?: string | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          user_inputs?: Json
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          description?: string
          id?: string
          linked_decision_id?: string | null
          outcome_rating?: number | null
          outcome_status?: string | null
          post_mortem_type?: string
          source_journal_id?: string | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          user_inputs?: Json
        }
        Relationships: [
          {
            foreignKeyName: "post_mortems_linked_decision_id_fkey"
            columns: ["linked_decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_mortems_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_connections: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          discoverable: boolean | null
          display_name: string | null
          focus_areas: string[] | null
          id: string
          lifetime_deep_snags_used: number | null
          lifetime_frameworks_used: number | null
          lifetime_post_mortems_used: number | null
          linkedin_url: string | null
          location: string | null
          preferences: Json | null
          role: string | null
          show_snags: boolean | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          id?: string
          lifetime_deep_snags_used?: number | null
          lifetime_frameworks_used?: number | null
          lifetime_post_mortems_used?: number | null
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          role?: string | null
          show_snags?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          allow_connections?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discoverable?: boolean | null
          display_name?: string | null
          focus_areas?: string[] | null
          id?: string
          lifetime_deep_snags_used?: number | null
          lifetime_frameworks_used?: number | null
          lifetime_post_mortems_used?: number | null
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          role?: string | null
          show_snags?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      quick_retros: {
        Row: {
          ai_nudge: string | null
          category: string
          created_at: string
          description: string
          full_post_mortem_id: string | null
          id: string
          lesson: string
          outcome_rating: string
          source_journal_id: string | null
          updated_at: string
          user_id: string
          what_didnt: string | null
          what_worked: string | null
        }
        Insert: {
          ai_nudge?: string | null
          category: string
          created_at?: string
          description: string
          full_post_mortem_id?: string | null
          id?: string
          lesson: string
          outcome_rating: string
          source_journal_id?: string | null
          updated_at?: string
          user_id: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Update: {
          ai_nudge?: string | null
          category?: string
          created_at?: string
          description?: string
          full_post_mortem_id?: string | null
          id?: string
          lesson?: string
          outcome_rating?: string
          source_journal_id?: string | null
          updated_at?: string
          user_id?: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_retros_full_post_mortem_id_fkey"
            columns: ["full_post_mortem_id"]
            isOneToOne: false
            referencedRelation: "post_mortems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_retros_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          platform: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          platform: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_limits: {
        Row: {
          analyses_monthly: number
          decisions_daily: number | null
          documents_monthly: number
          frameworks_monthly: number | null
          habits_limit: number | null
          journal_daily: number | null
          max_file_bytes: number
          max_words: number
          post_mortems_monthly: number | null
          storage_bytes: number
          tier: string
        }
        Insert: {
          analyses_monthly: number
          decisions_daily?: number | null
          documents_monthly: number
          frameworks_monthly?: number | null
          habits_limit?: number | null
          journal_daily?: number | null
          max_file_bytes: number
          max_words: number
          post_mortems_monthly?: number | null
          storage_bytes: number
          tier: string
        }
        Update: {
          analyses_monthly?: number
          decisions_daily?: number | null
          documents_monthly?: number
          frameworks_monthly?: number | null
          habits_limit?: number | null
          journal_daily?: number | null
          max_file_bytes?: number
          max_words?: number
          post_mortems_monthly?: number | null
          storage_bytes?: number
          tier?: string
        }
        Relationships: []
      }
      usage: {
        Row: {
          analyses_limit: number
          analyses_used: number | null
          created_at: string | null
          decisions_today: number | null
          documents_limit: number
          documents_used: number | null
          frameworks_limit: number | null
          frameworks_used: number | null
          habits_limit: number | null
          habits_used: number | null
          id: string
          journal_entries_today: number | null
          period_end: string
          period_start: string
          post_mortems_limit: number | null
          post_mortems_used: number | null
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
          visual_exports_used: number | null
        }
        Insert: {
          analyses_limit: number
          analyses_used?: number | null
          created_at?: string | null
          decisions_today?: number | null
          documents_limit: number
          documents_used?: number | null
          frameworks_limit?: number | null
          frameworks_used?: number | null
          habits_limit?: number | null
          habits_used?: number | null
          id?: string
          journal_entries_today?: number | null
          period_end: string
          period_start: string
          post_mortems_limit?: number | null
          post_mortems_used?: number | null
          storage_limit_bytes: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id: string
          visual_exports_used?: number | null
        }
        Update: {
          analyses_limit?: number
          analyses_used?: number | null
          created_at?: string | null
          decisions_today?: number | null
          documents_limit?: number
          documents_used?: number | null
          frameworks_limit?: number | null
          frameworks_used?: number | null
          habits_limit?: number | null
          habits_used?: number | null
          id?: string
          journal_entries_today?: number | null
          period_end?: string
          period_start?: string
          post_mortems_limit?: number | null
          post_mortems_used?: number | null
          storage_limit_bytes?: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id?: string
          visual_exports_used?: number | null
        }
        Relationships: []
      }
      visual_exports: {
        Row: {
          created_at: string
          framework_type: string
          id: string
          image_url: string | null
          source_id: string
          source_type: string
          user_id: string
          visual_data: Json
        }
        Insert: {
          created_at?: string
          framework_type: string
          id?: string
          image_url?: string | null
          source_id: string
          source_type: string
          user_id: string
          visual_data?: Json
        }
        Update: {
          created_at?: string
          framework_type?: string
          id?: string
          image_url?: string | null
          source_id?: string
          source_type?: string
          user_id?: string
          visual_data?: Json
        }
        Relationships: []
      }
    }
    Views: {
      scorecard_stats: {
        Row: {
          business_count: number | null
          career_count: number | null
          last_hour: number | null
          other_count: number | null
          personal_count: number | null
          total_analyses: number | null
          travel_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_use_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
      check_feature_access: {
        Args: { p_feature: string; p_user_id: string }
        Returns: Json
      }
      get_or_create_usage: {
        Args: { p_user_id: string }
        Returns: {
          analyses_limit: number
          analyses_used: number | null
          created_at: string | null
          decisions_today: number | null
          documents_limit: number
          documents_used: number | null
          frameworks_limit: number | null
          frameworks_used: number | null
          habits_limit: number | null
          habits_used: number | null
          id: string
          journal_entries_today: number | null
          period_end: string
          period_start: string
          post_mortems_limit: number | null
          post_mortems_used: number | null
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
          visual_exports_used: number | null
        }
        SetofOptions: {
          from: "*"
          to: "usage"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      increment_document_usage: {
        Args: { p_file_size: number; p_user_id: string }
        Returns: boolean
      }
      increment_framework_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_lifetime_usage: {
        Args: { p_feature: string; p_user_id: string }
        Returns: undefined
      }
      increment_post_mortem_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
