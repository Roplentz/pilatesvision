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
      assessments: {
        Row: {
          clinic_id: string
          clinical_notes: string | null
          created_at: string
          current_stage: string
          finalized_at: string | null
          goals: string[] | null
          id: string
          main_complaint: string | null
          objective: string | null
          observations: string | null
          pain_level: number | null
          pain_score: number | null
          professional_id: string | null
          status: string
          student_id: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          clinical_notes?: string | null
          created_at?: string
          current_stage?: string
          finalized_at?: string | null
          goals?: string[] | null
          id?: string
          main_complaint?: string | null
          objective?: string | null
          observations?: string | null
          pain_level?: number | null
          pain_score?: number | null
          professional_id?: string | null
          status?: string
          student_id: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          clinical_notes?: string | null
          created_at?: string
          current_stage?: string
          finalized_at?: string | null
          goals?: string[] | null
          id?: string
          main_complaint?: string | null
          objective?: string | null
          observations?: string | null
          pain_level?: number | null
          pain_score?: number | null
          professional_id?: string | null
          status?: string
          student_id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: Json | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          plan: string
          slug: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          plan?: string
          slug: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          plan?: string
          slug?: string
        }
        Relationships: []
      }
      exercise_results: {
        Row: {
          apparatus: string | null
          assessment_id: string
          clinic_id: string
          compensations: Json
          control_level: string | null
          created_at: string
          execution_notes: string | null
          exercise_name: string
          id: string
          recommendation: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          apparatus?: string | null
          assessment_id: string
          clinic_id: string
          compensations?: Json
          control_level?: string | null
          created_at?: string
          execution_notes?: string | null
          exercise_name: string
          id?: string
          recommendation?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          apparatus?: string | null
          assessment_id?: string
          clinic_id?: string
          compensations?: Json
          control_level?: string | null
          created_at?: string
          execution_notes?: string | null
          exercise_name?: string
          id?: string
          recommendation?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_results: {
        Row: {
          amplitude: number | null
          analysis_status: string | null
          assessment_id: string
          clinic_id: string
          compensations: Json
          controle: number | null
          created_at: string
          estabilidade: number | null
          id: string
          metrics: Json
          movement_name: string | null
          movements_evaluated: string[] | null
          professional_notes: string | null
          simetria: number | null
          student_id: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          amplitude?: number | null
          analysis_status?: string | null
          assessment_id: string
          clinic_id: string
          compensations?: Json
          controle?: number | null
          created_at?: string
          estabilidade?: number | null
          id?: string
          metrics?: Json
          movement_name?: string | null
          movements_evaluated?: string[] | null
          professional_notes?: string | null
          simetria?: number | null
          student_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          amplitude?: number | null
          analysis_status?: string | null
          assessment_id?: string
          clinic_id?: string
          compensations?: Json
          controle?: number | null
          created_at?: string
          estabilidade?: number | null
          id?: string
          metrics?: Json
          movement_name?: string | null
          movements_evaluated?: string[] | null
          professional_notes?: string | null
          simetria?: number | null
          student_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movement_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movement_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movement_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      postural_results: {
        Row: {
          assessment_id: string
          clinic_id: string
          created_at: string
          findings: Json | null
          id: string
          image_url: string | null
          image_urls: Json | null
          professional_notes: string | null
          score: number | null
          student_id: string | null
          updated_at: string
          view: string | null
        }
        Insert: {
          assessment_id: string
          clinic_id: string
          created_at?: string
          findings?: Json | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          professional_notes?: string | null
          score?: number | null
          student_id?: string | null
          updated_at?: string
          view?: string | null
        }
        Update: {
          assessment_id?: string
          clinic_id?: string
          created_at?: string
          findings?: Json | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          professional_notes?: string | null
          score?: number | null
          student_id?: string | null
          updated_at?: string
          view?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postural_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postural_results_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postural_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      prescribed_exercises: {
        Row: {
          assessment_id: string
          focus: string | null
          id: string
          level: string | null
          name: string | null
          order_index: number | null
          series: string | null
        }
        Insert: {
          assessment_id: string
          focus?: string | null
          id?: string
          level?: string | null
          name?: string | null
          order_index?: number | null
          series?: string | null
        }
        Update: {
          assessment_id?: string
          focus?: string | null
          id?: string
          level?: string | null
          name?: string | null
          order_index?: number | null
          series?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescribed_exercises_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clinic_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          archived_at: string | null
          assessment_id: string
          clinic_id: string
          content: Json
          created_at: string
          created_by: string | null
          finalized_at: string | null
          id: string
          pdf_url: string | null
          plain_text: string | null
          status: string
          student_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          archived_at?: string | null
          assessment_id: string
          clinic_id: string
          content?: Json
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          id?: string
          pdf_url?: string | null
          plain_text?: string | null
          status?: string
          student_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          archived_at?: string | null
          assessment_id?: string
          clinic_id?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          id?: string
          pdf_url?: string | null
          plain_text?: string | null
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          clinic_id: string
          clinical_notes: string | null
          consent_given_at: string | null
          contraindications: string[] | null
          created_at: string
          created_by: string | null
          email: string | null
          gender: string | null
          goals: string[] | null
          height_cm: number | null
          id: string
          main_complaint: string | null
          medical_history: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          clinic_id: string
          clinical_notes?: string | null
          consent_given_at?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gender?: string | null
          goals?: string[] | null
          height_cm?: number | null
          id?: string
          main_complaint?: string | null
          medical_history?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          clinic_id?: string
          clinical_notes?: string | null
          consent_given_at?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gender?: string | null
          goals?: string[] | null
          height_cm?: number | null
          id?: string
          main_complaint?: string | null
          medical_history?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
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
      [_ in never]: never
    }
    Functions: {
      current_clinic_id: { Args: never; Returns: string }
      current_user_clinic_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instrutor" | "recepcionista"
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
      app_role: ["admin", "instrutor", "recepcionista"],
    },
  },
} as const
