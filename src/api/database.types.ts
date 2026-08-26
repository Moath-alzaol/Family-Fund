export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          admin_deposit_requires_approval: boolean
          id: number
        }
        Insert: {
          admin_deposit_requires_approval?: boolean
          id?: number
        }
        Update: {
          admin_deposit_requires_approval?: boolean
          id?: number
        }
        Relationships: []
      }
      commitments: {
        Row: {
          id: string
          paid_fils: number
          period: string
          profile_id: string
          required_fils: number
        }
        Insert: {
          id?: string
          paid_fils?: number
          period: string
          profile_id: string
          required_fils: number
        }
        Update: {
          id?: string
          paid_fils?: number
          period?: string
          profile_id?: string
          required_fils?: number
        }
        Relationships: [
          {
            foreignKeyName: "commitments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_personal_balances"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          account_owner: string | null
          account_type: string
          amount_fils: number
          created_at: string
          created_by: string | null
          description: string
          entry_type: string
          id: string
          occurred_at: string
          request_id: string | null
        }
        Insert: {
          account_owner?: string | null
          account_type: string
          amount_fils: number
          created_at?: string
          created_by?: string | null
          description: string
          entry_type: string
          id?: string
          occurred_at?: string
          request_id?: string | null
        }
        Update: {
          account_owner?: string | null
          account_type?: string
          amount_fils?: number
          created_at?: string
          created_by?: string | null
          description?: string
          entry_type?: string
          id?: string
          occurred_at?: string
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_owner_fkey"
            columns: ["account_owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_account_owner_fkey"
            columns: ["account_owner"]
            isOneToOne: false
            referencedRelation: "v_personal_balances"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_personal_balances"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ledger_entries_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          monthly_commitment_fils: number
          role: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          monthly_commitment_fils: number
          role: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          monthly_commitment_fils?: number
          role?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          amount_fils: number
          auto_executed: boolean
          beneficiary: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          period: string | null
          reason: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          type: string
        }
        Insert: {
          amount_fils: number
          auto_executed?: boolean
          beneficiary?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          period?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requester_id: string
          status?: string
          type: string
        }
        Update: {
          amount_fils?: number
          auto_executed?: boolean
          beneficiary?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          period?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requester_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_personal_balances"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "v_personal_balances"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      v_fund_balance: {
        Row: {
          balance_fils: number | null
        }
        Relationships: []
      }
      v_personal_balances: {
        Row: {
          balance_fils: number | null
          profile_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _apply_request_effects: {
        Args: { p_request: Database["public"]["Tables"]["requests"]["Row"] }
        Returns: undefined
      }
      _format_jod: { Args: { p_fils: number }; Returns: string }
      _fund_balance: { Args: never; Returns: number }
      _personal_balance: { Args: { p_profile_id: string }; Returns: number }
      _require_admin: { Args: never; Returns: undefined }
      add_member: {
        Args: { p_commitment_fils: number; p_display_name: string }
        Returns: Json
      }
      approve_request: {
        Args: { p_request_id: string }
        Returns: {
          amount_fils: number
          auto_executed: boolean
          beneficiary: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          period: string | null
          reason: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_request: {
        Args: {
          p_amount_fils: number
          p_beneficiary?: string
          p_period?: string
          p_reason?: string
          p_type: string
        }
        Returns: {
          amount_fils: number
          auto_executed: boolean
          beneficiary: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          period: string | null
          reason: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_commitments_for_period: {
        Args: { p_period: string }
        Returns: undefined
      }
      reject_request: {
        Args: { p_reason: string; p_request_id: string }
        Returns: {
          amount_fils: number
          auto_executed: boolean
          beneficiary: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          period: string | null
          reason: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          type: string
        }
        SetofOptions: {
          from: "*"
          to: "requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_admin_deposit_requires_approval: {
        Args: { p_value: boolean }
        Returns: {
          admin_deposit_requires_approval: boolean
          id: number
        }
        SetofOptions: {
          from: "*"
          to: "app_settings"
          isOneToOne: true
          isSetofReturn: false
        }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
