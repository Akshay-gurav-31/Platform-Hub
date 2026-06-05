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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          cert_code: string
          id: string
          internship_id: string
          issued_at: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          cert_code?: string
          id?: string
          internship_id: string
          issued_at?: string
          recipient_name: string
          user_id: string
        }
        Update: {
          cert_code?: string
          id?: string
          internship_id?: string
          issued_at?: string
          recipient_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          admin_notes: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          preferred_contact: string
          request_type: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message: string
          phone?: string
          preferred_contact?: string
          request_type?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          preferred_contact?: string
          request_type?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          rating: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message: string
          rating?: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          created_at: string
          description: string
          difficulty: string
          duration: string
          icon: string | null
          id: string
          skills: string[]
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty?: string
          duration: string
          icon?: string | null
          id?: string
          skills?: string[]
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: string
          duration?: string
          icon?: string | null
          id?: string
          skills?: string[]
          slug?: string
          title?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          target_user_id: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by: string
          id?: string
          target_user_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          college: string | null
          created_at: string
          current_year: string | null
          degree: string | null
          email: string
          full_name: string
          id: string
          mobile: string | null
          skills: string[]
        }
        Insert: {
          branch?: string | null
          college?: string | null
          created_at?: string
          current_year?: string | null
          degree?: string | null
          email?: string
          full_name?: string
          id: string
          mobile?: string | null
          skills?: string[]
        }
        Update: {
          branch?: string | null
          college?: string | null
          created_at?: string
          current_year?: string | null
          degree?: string | null
          email?: string
          full_name?: string
          id?: string
          mobile?: string | null
          skills?: string[]
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_index: number
          id: string
          internship_id: string
          options: Json
          position: number
          question: string
        }
        Insert: {
          correct_index: number
          id?: string
          internship_id: string
          options: Json
          position?: number
          question: string
        }
        Update: {
          correct_index?: number
          id?: string
          internship_id?: string
          options?: Json
          position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          request_id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          request_id: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          created_at: string
          id: string
          internship_id: string
          passed: boolean
          score: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          internship_id: string
          passed: boolean
          score: number
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          internship_id?: string
          passed?: boolean
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      questions_public: {
        Row: {
          id: string | null
          internship_id: string | null
          options: Json | null
          position: number | null
          question: string | null
        }
        Insert: {
          id?: string | null
          internship_id?: string | null
          options?: Json | null
          position?: number | null
          question?: string | null
        }
        Update: {
          id?: string | null
          internship_id?: string | null
          options?: Json | null
          position?: number | null
          question?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      score_test: {
        Args: { _answers: Json; _internship_id: string }
        Returns: {
          passed: boolean
          score: number
          total: number
        }[]
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          cert_code: string
          internship_title: string
          issued_at: string
          recipient_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
