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
      action_outcomes: {
        Row: {
          action_taken: string
          dealer_up_card: number
          id: string
          is_pair: boolean | null
          is_soft: boolean | null
          player_value: number
          times_lost: number | null
          times_played: number | null
          times_push: number | null
          times_won: number | null
          total_profit: number | null
          true_count_range: string
          win_rate: number | null
        }
        Insert: {
          action_taken: string
          dealer_up_card: number
          id?: string
          is_pair?: boolean | null
          is_soft?: boolean | null
          player_value: number
          times_lost?: number | null
          times_played?: number | null
          times_push?: number | null
          times_won?: number | null
          total_profit?: number | null
          true_count_range: string
          win_rate?: number | null
        }
        Update: {
          action_taken?: string
          dealer_up_card?: number
          id?: string
          is_pair?: boolean | null
          is_soft?: boolean | null
          player_value?: number
          times_lost?: number | null
          times_played?: number | null
          times_push?: number | null
          times_won?: number | null
          total_profit?: number | null
          true_count_range?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      game_hands: {
        Row: {
          actions_taken: Json
          bet_amount: number
          created_at: string
          dealer_final_cards: Json | null
          dealer_up_card: number
          dealer_value: number | null
          final_result: string | null
          id: string
          is_pair: boolean | null
          is_soft: boolean | null
          pair_rank: string | null
          player_cards: Json
          player_value: number
          profit_loss: number | null
          recommended_action: string | null
          running_count: number
          session_id: string | null
          true_count: number
          was_blackjack: boolean | null
        }
        Insert: {
          actions_taken?: Json
          bet_amount: number
          created_at?: string
          dealer_final_cards?: Json | null
          dealer_up_card: number
          dealer_value?: number | null
          final_result?: string | null
          id?: string
          is_pair?: boolean | null
          is_soft?: boolean | null
          pair_rank?: string | null
          player_cards: Json
          player_value: number
          profit_loss?: number | null
          recommended_action?: string | null
          running_count: number
          session_id?: string | null
          true_count: number
          was_blackjack?: boolean | null
        }
        Update: {
          actions_taken?: Json
          bet_amount?: number
          created_at?: string
          dealer_final_cards?: Json | null
          dealer_up_card?: number
          dealer_value?: number | null
          final_result?: string | null
          id?: string
          is_pair?: boolean | null
          is_soft?: boolean | null
          pair_rank?: string | null
          player_cards?: Json
          player_value?: number
          profit_loss?: number | null
          recommended_action?: string | null
          running_count?: number
          session_id?: string | null
          true_count?: number
          was_blackjack?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "game_hands_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          id: string
          session_data: Json | null
          total_hands: number | null
          total_profit: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_data?: Json | null
          total_hands?: number | null
          total_profit?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          session_data?: Json | null
          total_hands?: number | null
          total_profit?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
