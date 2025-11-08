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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batch_assessments: {
        Row: {
          assessment_status: string | null
          company_id: string
          confidence: number | null
          created_at: string | null
          current_wage: number
          education: string
          employee_name: string
          experience: number
          id: string
          job_title: string
          location: string
          message: string | null
          model_version: string | null
          predicted_wage: number | null
        }
        Insert: {
          assessment_status?: string | null
          company_id: string
          confidence?: number | null
          created_at?: string | null
          current_wage: number
          education: string
          employee_name: string
          experience: number
          id?: string
          job_title: string
          location: string
          message?: string | null
          model_version?: string | null
          predicted_wage?: number | null
        }
        Update: {
          assessment_status?: string | null
          company_id?: string
          confidence?: number | null
          created_at?: string | null
          current_wage?: number
          education?: string
          employee_name?: string
          experience?: number
          id?: string
          job_title?: string
          location?: string
          message?: string | null
          model_version?: string | null
          predicted_wage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          industry: string | null
          name: string
          size: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          industry?: string | null
          name: string
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          industry?: string | null
          name?: string
          size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_model_versions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          metrics: Json | null
          model_file_url: string | null
          model_type: string
          training_date: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          metrics?: Json | null
          model_file_url?: string | null
          model_type: string
          training_date?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          metrics?: Json | null
          model_file_url?: string | null
          model_type?: string
          training_date?: string | null
          version?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          credits_purchased: number
          currency: string
          id: string
          payment_method: string | null
          status: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          credits_purchased: number
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          credits_purchased?: number
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string | null
          credits_remaining: number
          expires_at: string | null
          id: string
          status: string
          tier: string
          total_credits: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          status?: string
          tier?: string
          total_credits?: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          status?: string
          tier?: string
          total_credits?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wage_assessments: {
        Row: {
          assessment_status: string
          confidence: number
          created_at: string | null
          education: string
          experience: number
          id: string
          job_title: string
          location: string
          message: string
          model_version: string | null
          predicted_wage: number | null
          prediction_confidence: number | null
          user_id: string
          wage: number
        }
        Insert: {
          assessment_status: string
          confidence: number
          created_at?: string | null
          education: string
          experience: number
          id?: string
          job_title: string
          location: string
          message: string
          model_version?: string | null
          predicted_wage?: number | null
          prediction_confidence?: number | null
          user_id: string
          wage: number
        }
        Update: {
          assessment_status?: string
          confidence?: number
          created_at?: string | null
          education?: string
          experience?: number
          id?: string
          job_title?: string
          location?: string
          message?: string
          model_version?: string | null
          predicted_wage?: number | null
          prediction_confidence?: number | null
          user_id?: string
          wage?: number
        }
        Relationships: []
      }
      wage_benchmarks: {
        Row: {
          base_wage: number
          created_at: string | null
          education: string
          experience_max: number | null
          experience_min: number | null
          id: string
          job_category: string
          location: string
          updated_at: string | null
          wage_range_max: number
          wage_range_min: number
        }
        Insert: {
          base_wage: number
          created_at?: string | null
          education: string
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          job_category: string
          location: string
          updated_at?: string | null
          wage_range_max: number
          wage_range_min: number
        }
        Update: {
          base_wage?: number
          created_at?: string | null
          education?: string
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          job_category?: string
          location?: string
          updated_at?: string | null
          wage_range_max?: number
          wage_range_min?: number
        }
        Relationships: []
      }
      wage_training_data: {
        Row: {
          actual_wage: number
          created_at: string | null
          data_source: string | null
          education: string
          experience: number
          feedback_rating: number | null
          id: string
          industry: string | null
          job_title: string
          location: string
          predicted_wage: number | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          actual_wage: number
          created_at?: string | null
          data_source?: string | null
          education: string
          experience: number
          feedback_rating?: number | null
          id?: string
          industry?: string | null
          job_title: string
          location: string
          predicted_wage?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          actual_wage?: number
          created_at?: string | null
          data_source?: string | null
          education?: string
          experience?: number
          feedback_rating?: number | null
          id?: string
          industry?: string | null
          job_title?: string
          location?: string
          predicted_wage?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_hr_or_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr" | "user"
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
    Enums: {
      app_role: ["admin", "hr", "user"],
    },
  },
} as const
