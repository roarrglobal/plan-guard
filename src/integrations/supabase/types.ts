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
          linkedin_url: string | null
          location: string | null
          preferences: Json | null
          role: string | null
          show_snags: boolean | null
          subscription_tier: string | null
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
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          role?: string | null
          show_snags?: boolean | null
          subscription_tier?: string | null
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
          linkedin_url?: string | null
          location?: string | null
          preferences?: Json | null
          role?: string | null
          show_snags?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
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
          documents_monthly: number
          max_file_bytes: number
          max_words: number
          storage_bytes: number
          tier: string
        }
        Insert: {
          analyses_monthly: number
          documents_monthly: number
          max_file_bytes: number
          max_words: number
          storage_bytes: number
          tier: string
        }
        Update: {
          analyses_monthly?: number
          documents_monthly?: number
          max_file_bytes?: number
          max_words?: number
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
          documents_limit: number
          documents_used: number | null
          id: string
          period_end: string
          period_start: string
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analyses_limit: number
          analyses_used?: number | null
          created_at?: string | null
          documents_limit: number
          documents_used?: number | null
          id?: string
          period_end: string
          period_start: string
          storage_limit_bytes: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analyses_limit?: number
          analyses_used?: number | null
          created_at?: string | null
          documents_limit?: number
          documents_used?: number | null
          id?: string
          period_end?: string
          period_start?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number | null
          updated_at?: string | null
          user_id?: string
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
      get_or_create_usage: {
        Args: { p_user_id: string }
        Returns: {
          analyses_limit: number
          analyses_used: number | null
          created_at: string | null
          documents_limit: number
          documents_used: number | null
          id: string
          period_end: string
          period_start: string
          storage_limit_bytes: number
          storage_used_bytes: number | null
          updated_at: string | null
          user_id: string
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
