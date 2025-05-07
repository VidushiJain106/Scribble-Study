export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          id: string
          name: string
          note_id: string
          size: number | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note_id: string
          size?: number | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note_id?: string
          size?: number | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent: string | null
          sub_categories: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent?: string | null
          sub_categories?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent?: string | null
          sub_categories?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drawings: {
        Row: {
          created_at: string
          id: string
          note_id: string
          paths: Json
        }
        Insert: {
          created_at?: string
          id?: string
          note_id: string
          paths: Json
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string
          paths?: Json
        }
        Relationships: [
          {
            foreignKeyName: "drawings_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      explanations: {
        Row: {
          content: Json
          created_at: string
          id: string
          note_id: string
          title: string
          topic: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          note_id: string
          title: string
          topic: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          note_id?: string
          title?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "explanations_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_modes: {
        Row: {
          block_all_apps: boolean | null
          block_entertainment_apps: boolean | null
          color: string | null
          created_at: string
          duration: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          mute_calls: boolean | null
          mute_notifications: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          block_all_apps?: boolean | null
          block_entertainment_apps?: boolean | null
          color?: string | null
          created_at?: string
          duration?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          mute_calls?: boolean | null
          mute_notifications?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          block_all_apps?: boolean | null
          block_entertainment_apps?: boolean | null
          color?: string | null
          created_at?: string
          duration?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          mute_calls?: boolean | null
          mute_notifications?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_analyses: {
        Row: {
          concepts: string[]
          created_at: string
          id: string
          main_topic: string
          note_id: string
          ready_for_explanation: boolean
        }
        Insert: {
          concepts: string[]
          created_at?: string
          id?: string
          main_topic: string
          note_id: string
          ready_for_explanation?: boolean
        }
        Update: {
          concepts?: string[]
          created_at?: string
          id?: string
          main_topic?: string
          note_id?: string
          ready_for_explanation?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "note_analyses_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          category: string | null
          color: string | null
          content: string | null
          created_at: string
          has_attachments: boolean | null
          has_drawings: boolean | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          has_attachments?: boolean | null
          has_drawings?: boolean | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          content?: string | null
          created_at?: string
          has_attachments?: boolean | null
          has_drawings?: boolean | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          introduction: string
          note_id: string
          questions: Json
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          introduction: string
          note_id: string
          questions: Json
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          introduction?: string
          note_id?: string
          questions?: Json
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
