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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      anonymous_care_plans: {
        Row: {
          care_plans: Json
          case_data: Json
          created_at: string
          expires_at: string
          id: string
          session_id: string
        }
        Insert: {
          care_plans: Json
          case_data: Json
          created_at?: string
          expires_at?: string
          id?: string
          session_id: string
        }
        Update: {
          care_plans?: Json
          case_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      anonymous_sessions: {
        Row: {
          blocked: boolean
          browser_fingerprint: string | null
          created_at: string
          expires_at: string
          id: string
          ip_hash: string | null
          last_used_at: string
          session_id: string
          usage_count: number
        }
        Insert: {
          blocked?: boolean
          browser_fingerprint?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_hash?: string | null
          last_used_at?: string
          session_id: string
          usage_count?: number
        }
        Update: {
          blocked?: boolean
          browser_fingerprint?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_hash?: string | null
          last_used_at?: string
          session_id?: string
          usage_count?: number
        }
        Relationships: []
      }
      care_plan_drafts: {
        Row: {
          assessment: string | null
          case_id: string
          created_at: string
          defining_characteristics: string | null
          evaluation: string | null
          goals: string
          id: string
          interventions: string
          nursing_diagnosis: string
          rationales: string
          related_factors: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment?: string | null
          case_id: string
          created_at?: string
          defining_characteristics?: string | null
          evaluation?: string | null
          goals: string
          id?: string
          interventions: string
          nursing_diagnosis: string
          rationales: string
          related_factors?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment?: string | null
          case_id?: string
          created_at?: string
          defining_characteristics?: string | null
          evaluation?: string | null
          goals?: string
          id?: string
          interventions?: string
          nursing_diagnosis?: string
          rationales?: string
          related_factors?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plan_drafts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plan_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          ai_generated: boolean | null
          assessment: string | null
          care_plan_set_id: string | null
          case_id: string
          created_at: string
          defining_characteristics: string | null
          evaluation: string | null
          evaluation_criteria: string | null
          goals: string
          id: string
          interventions: string
          nursing_diagnosis: string
          priority_level: string | null
          rationales: string
          related_factors: string | null
          session_id: string | null
          supporting_assessment_data: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          assessment?: string | null
          care_plan_set_id?: string | null
          case_id: string
          created_at?: string
          defining_characteristics?: string | null
          evaluation?: string | null
          evaluation_criteria?: string | null
          goals: string
          id?: string
          interventions: string
          nursing_diagnosis: string
          priority_level?: string | null
          rationales: string
          related_factors?: string | null
          session_id?: string | null
          supporting_assessment_data?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          assessment?: string | null
          care_plan_set_id?: string | null
          case_id?: string
          created_at?: string
          defining_characteristics?: string | null
          evaluation?: string | null
          evaluation_criteria?: string | null
          goals?: string
          id?: string
          interventions?: string
          nursing_diagnosis?: string
          priority_level?: string | null
          rationales?: string
          related_factors?: string | null
          session_id?: string | null
          supporting_assessment_data?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          age: number
          created_at: string
          diagnosis: string
          extracted_document_content: string | null
          gender: string
          id: string
          labs: Json | null
          notes: string | null
          objective_data: string | null
          patient_initials: string
          session_id: string | null
          subjective_data: string | null
          symptoms: string | null
          updated_at: string
          upload_url: string | null
          user_id: string | null
          vitals: Json | null
        }
        Insert: {
          age: number
          created_at?: string
          diagnosis: string
          extracted_document_content?: string | null
          gender: string
          id?: string
          labs?: Json | null
          notes?: string | null
          objective_data?: string | null
          patient_initials: string
          session_id?: string | null
          subjective_data?: string | null
          symptoms?: string | null
          updated_at?: string
          upload_url?: string | null
          user_id?: string | null
          vitals?: Json | null
        }
        Update: {
          age?: number
          created_at?: string
          diagnosis?: string
          extracted_document_content?: string | null
          gender?: string
          id?: string
          labs?: Json | null
          notes?: string | null
          objective_data?: string | null
          patient_initials?: string
          session_id?: string | null
          subjective_data?: string | null
          symptoms?: string | null
          updated_at?: string
          upload_url?: string | null
          user_id?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          created_at: string
          credits_amount: number
          description: string | null
          id: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_amount: number
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          credits_amount?: number
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      payment_failures: {
        Row: {
          amount_due: number
          attempt_count: number | null
          created_at: string
          failure_reason: string
          id: string
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount_due: number
          attempt_count?: number | null
          created_at?: string
          failure_reason: string
          id?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount_due?: number
          attempt_count?: number | null
          created_at?: string
          failure_reason?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string
          deleted: boolean | null
          email: string | null
          id: string
          name: string | null
          stripe_customer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          email?: string | null
          id?: string
          name?: string | null
          stripe_customer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          email?: string | null
          id?: string
          name?: string | null
          stripe_customer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_disputes: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          status: string
          stripe_charge_id: string
          stripe_dispute_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          status: string
          stripe_charge_id: string
          stripe_dispute_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          status?: string
          stripe_charge_id?: string
          stripe_dispute_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          credits_per_month: number
          id: string
          is_active: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_per_month: number
          id?: string
          is_active?: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_per_month?: number
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits_balance: number
          id: string
          total_credits_purchased: number
          total_credits_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          id?: string
          total_credits_purchased?: number
          total_credits_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          id?: string
          total_credits_purchased?: number
          total_credits_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          data: Json
          event_type: string
          id: string
          processed: boolean
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          event_type: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          credits_amount: number
          description_param?: string
          stripe_session_id_param?: string
          transaction_type_param: Database["public"]["Enums"]["credit_transaction_type"]
          user_id_param: string
        }
        Returns: undefined
      }
      cleanup_expired_anonymous_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_credits: {
        Args: { credits_needed: number; user_id_param: string }
        Returns: boolean
      }
      generate_care_plan_set_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      credit_transaction_type:
        | "purchase"
        | "subscription_refill"
        | "usage"
        | "refund"
        | "bonus"
      subscription_plan_type: "basic" | "pro" | "enterprise"
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
      credit_transaction_type: [
        "purchase",
        "subscription_refill",
        "usage",
        "refund",
        "bonus",
      ],
      subscription_plan_type: ["basic", "pro", "enterprise"],
    },
  },
} as const
