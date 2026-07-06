export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      assessments: {
        Row: {
          clinic_id: string;
          created_at: string;
          current_stage: string;
          goals: string[] | null;
          id: string;
          main_complaint: string | null;
          observations: string | null;
          pain_level: number | null;
          professional_id: string | null;
          status: string;
          student_id: string;
          updated_at: string;
        };
        Insert: {
          clinic_id: string;
          created_at?: string;
          current_stage?: string;
          goals?: string[] | null;
          id?: string;
          main_complaint?: string | null;
          observations?: string | null;
          pain_level?: number | null;
          professional_id?: string | null;
          status?: string;
          student_id: string;
          updated_at?: string;
        };
        Update: {
          clinic_id?: string;
          created_at?: string;
          current_stage?: string;
          goals?: string[] | null;
          id?: string;
          main_complaint?: string | null;
          observations?: string | null;
          pain_level?: number | null;
          professional_id?: string | null;
          status?: string;
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      clinics: {
        Row: {
          address: Json | null;
          created_at: string;
          email: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          phone: string | null;
          plan: string;
          slug: string;
        };
        Insert: {
          address?: Json | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          plan?: string;
          slug: string;
        };
        Update: {
          address?: Json | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          plan?: string;
          slug?: string;
        };
        Relationships: [];
      };
      movement_results: {
        Row: {
          amplitude: number | null;
          assessment_id: string;
          controle: number | null;
          created_at: string;
          estabilidade: number | null;
          id: string;
          movements_evaluated: string[] | null;
          simetria: number | null;
          video_url: string | null;
        };
        Insert: {
          amplitude?: number | null;
          assessment_id: string;
          controle?: number | null;
          created_at?: string;
          estabilidade?: number | null;
          id?: string;
          movements_evaluated?: string[] | null;
          simetria?: number | null;
          video_url?: string | null;
        };
        Update: {
          amplitude?: number | null;
          assessment_id?: string;
          controle?: number | null;
          created_at?: string;
          estabilidade?: number | null;
          id?: string;
          movements_evaluated?: string[] | null;
          simetria?: number | null;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "movement_results_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      postural_results: {
        Row: {
          assessment_id: string;
          created_at: string;
          findings: Json | null;
          id: string;
          image_urls: Json | null;
          score: number | null;
        };
        Insert: {
          assessment_id: string;
          created_at?: string;
          findings?: Json | null;
          id?: string;
          image_urls?: Json | null;
          score?: number | null;
        };
        Update: {
          assessment_id?: string;
          created_at?: string;
          findings?: Json | null;
          id?: string;
          image_urls?: Json | null;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "postural_results_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      prescribed_exercises: {
        Row: {
          assessment_id: string;
          focus: string | null;
          id: string;
          level: string | null;
          name: string | null;
          order_index: number | null;
          series: string | null;
        };
        Insert: {
          assessment_id: string;
          focus?: string | null;
          id?: string;
          level?: string | null;
          name?: string | null;
          order_index?: number | null;
          series?: string | null;
        };
        Update: {
          assessment_id?: string;
          focus?: string | null;
          id?: string;
          level?: string | null;
          name?: string | null;
          order_index?: number | null;
          series?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "prescribed_exercises_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          clinic_id: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          clinic_id?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          clinic_id?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          assessment_id: string;
          clinic_id: string;
          content: Json | null;
          created_at: string;
          id: string;
          pdf_url: string | null;
          student_id: string;
          version: number;
        };
        Insert: {
          assessment_id: string;
          clinic_id: string;
          content?: Json | null;
          created_at?: string;
          id?: string;
          pdf_url?: string | null;
          student_id: string;
          version?: number;
        };
        Update: {
          assessment_id?: string;
          clinic_id?: string;
          content?: Json | null;
          created_at?: string;
          id?: string;
          pdf_url?: string | null;
          student_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reports_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          avatar_url: string | null;
          birth_date: string | null;
          clinic_id: string;
          contraindications: string[] | null;
          created_at: string;
          email: string | null;
          gender: string | null;
          goals: string[] | null;
          height_cm: number | null;
          id: string;
          medical_history: string | null;
          name: string;
          phone: string | null;
          weight_kg: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          birth_date?: string | null;
          clinic_id: string;
          contraindications?: string[] | null;
          created_at?: string;
          email?: string | null;
          gender?: string | null;
          goals?: string[] | null;
          height_cm?: number | null;
          id?: string;
          medical_history?: string | null;
          name: string;
          phone?: string | null;
          weight_kg?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          birth_date?: string | null;
          clinic_id?: string;
          contraindications?: string[] | null;
          created_at?: string;
          email?: string | null;
          gender?: string | null;
          goals?: string[] | null;
          height_cm?: number | null;
          id?: string;
          medical_history?: string | null;
          name?: string;
          phone?: string | null;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_clinic_id: { Args: never; Returns: string };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "instrutor" | "recepcionista";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "instrutor", "recepcionista"],
    },
  },
} as const;
