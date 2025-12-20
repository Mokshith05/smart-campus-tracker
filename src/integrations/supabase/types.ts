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
      admin_replies: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          issue_id: string
          message: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          issue_id: string
          message: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          issue_id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_replies_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          category: string
          created_at: string | null
          icon: string | null
          id: string
          name: string
          phone: string
          priority: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          phone: string
          priority?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          phone?: string
          priority?: number | null
        }
        Relationships: []
      }
      issue_ratings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          issue_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          issue_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          issue_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_ratings_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_timeline: {
        Row: {
          admin_id: string | null
          admin_name: string | null
          created_at: string | null
          id: string
          issue_id: string
          notes: string | null
          status: Database["public"]["Enums"]["issue_status"]
        }
        Insert: {
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string | null
          id?: string
          issue_id: string
          notes?: string | null
          status: Database["public"]["Enums"]["issue_status"]
        }
        Update: {
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string | null
          id?: string
          issue_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "issue_timeline_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_upvotes: {
        Row: {
          created_at: string | null
          id: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_upvotes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          ai_detected_category:
            | Database["public"]["Enums"]["issue_category"]
            | null
          assigned_to: string | null
          audio_url: string | null
          category: Database["public"]["Enums"]["issue_category"]
          created_at: string | null
          description: string
          duplicate_of: string | null
          id: string
          image_url: string | null
          is_duplicate: boolean | null
          location: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          rejection_reason: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string | null
          upvote_count: number | null
          user_id: string
        }
        Insert: {
          ai_detected_category?:
            | Database["public"]["Enums"]["issue_category"]
            | null
          assigned_to?: string | null
          audio_url?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          created_at?: string | null
          description: string
          duplicate_of?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          location?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          rejection_reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id: string
        }
        Update: {
          ai_detected_category?:
            | Database["public"]["Enums"]["issue_category"]
            | null
          assigned_to?: string | null
          audio_url?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          created_at?: string | null
          description?: string
          duplicate_of?: string | null
          id?: string
          image_url?: string | null
          is_duplicate?: boolean | null
          location?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          rejection_reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "admin"
      issue_category:
        | "electrical"
        | "hostel"
        | "mess_food"
        | "plumber"
        | "security"
        | "cleaning"
        | "internet_network"
        | "others"
      issue_status:
        | "reported"
        | "viewed"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "rejected"
      priority_level: "low" | "medium" | "high" | "urgent"
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
      app_role: ["student", "admin"],
      issue_category: [
        "electrical",
        "hostel",
        "mess_food",
        "plumber",
        "security",
        "cleaning",
        "internet_network",
        "others",
      ],
      issue_status: [
        "reported",
        "viewed",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
    },
  },
} as const
