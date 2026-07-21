export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          clinical_notes: string | null;
          created_at: string;
          current_stage: string;
          finalized_at: string | null;
          goals: string[] | null;
          id: string;
          main_complaint: string | null;
          objective: string | null;
          observations: string | null;
          pain_level: number | null;
          pain_score: number | null;
          patient_id: string;
          professional_id: string | null;
          status: string;
          title: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          clinic_id: string;
          clinical_notes?: string | null;
          created_at?: string;
          current_stage?: string;
          finalized_at?: string | null;
          goals?: string[] | null;
          id?: string;
          main_complaint?: string | null;
          objective?: string | null;
          observations?: string | null;
          pain_level?: number | null;
          pain_score?: number | null;
          patient_id: string;
          professional_id?: string | null;
          status?: string;
          title?: string | null;
          type?: string;
          updated_at?: string;
        };
        Update: {
          clinic_id?: string;
          clinical_notes?: string | null;
          created_at?: string;
          current_stage?: string;
          finalized_at?: string | null;
          goals?: string[] | null;
          id?: string;
          main_complaint?: string | null;
          objective?: string | null;
          observations?: string | null;
          pain_level?: number | null;
          pain_score?: number | null;
          patient_id?: string;
          professional_id?: string | null;
          status?: string;
          title?: string | null;
          type?: string;
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
            foreignKeyName: "assessments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
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
          owner_user_id: string | null;
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
          owner_user_id?: string | null;
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
          owner_user_id?: string | null;
          phone?: string | null;
          plan?: string;
          slug?: string;
        };
        Relationships: [];
      };
      exercise_library: {
        Row: {
          clinical_focus: string | null;
          common_compensations: string | null;
          created_at: string;
          equipment: string;
          execution: string | null;
          id: string;
          image_ref: string | null;
          is_active: boolean;
          key_cues: string | null;
          level: string;
          method_family: string | null;
          name_en: string | null;
          name_pt: string;
          position: string | null;
          primary_goal: string | null;
          progression: string | null;
          red_flags: string | null;
          regression: string | null;
          setup: string | null;
          updated_at: string;
          vision_metrics: string | null;
        };
        Insert: {
          clinical_focus?: string | null;
          common_compensations?: string | null;
          created_at?: string;
          equipment: string;
          execution?: string | null;
          id: string;
          image_ref?: string | null;
          is_active?: boolean;
          key_cues?: string | null;
          level: string;
          method_family?: string | null;
          name_en?: string | null;
          name_pt: string;
          position?: string | null;
          primary_goal?: string | null;
          progression?: string | null;
          red_flags?: string | null;
          regression?: string | null;
          setup?: string | null;
          updated_at?: string;
          vision_metrics?: string | null;
        };
        Update: {
          clinical_focus?: string | null;
          common_compensations?: string | null;
          created_at?: string;
          equipment?: string;
          execution?: string | null;
          id?: string;
          image_ref?: string | null;
          is_active?: boolean;
          key_cues?: string | null;
          level?: string;
          method_family?: string | null;
          name_en?: string | null;
          name_pt?: string;
          position?: string | null;
          primary_goal?: string | null;
          progression?: string | null;
          red_flags?: string | null;
          regression?: string | null;
          setup?: string | null;
          updated_at?: string;
          vision_metrics?: string | null;
        };
        Relationships: [];
      };
      exercise_results: {
        Row: {
          analysis_status: string | null;
          apparatus: string | null;
          assessment_id: string;
          clinic_id: string;
          compensations: Json;
          control_level: string | null;
          created_at: string;
          execution_notes: string | null;
          exercise_name: string;
          generated_by: string;
          id: string;
          image_url: string | null;
          library_exercise_id: string | null;
          metrics: Json;
          patient_id: string;
          recommendation: string | null;
          support_level: number | null;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          analysis_status?: string | null;
          apparatus?: string | null;
          assessment_id: string;
          clinic_id: string;
          compensations?: Json;
          control_level?: string | null;
          created_at?: string;
          execution_notes?: string | null;
          exercise_name: string;
          generated_by?: string;
          id?: string;
          image_url?: string | null;
          library_exercise_id?: string | null;
          metrics?: Json;
          patient_id: string;
          recommendation?: string | null;
          support_level?: number | null;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          analysis_status?: string | null;
          apparatus?: string | null;
          assessment_id?: string;
          clinic_id?: string;
          compensations?: Json;
          control_level?: string | null;
          created_at?: string;
          execution_notes?: string | null;
          exercise_name?: string;
          generated_by?: string;
          id?: string;
          image_url?: string | null;
          library_exercise_id?: string | null;
          metrics?: Json;
          patient_id?: string;
          recommendation?: string | null;
          support_level?: number | null;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_results_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_results_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_results_library_exercise_id_fkey";
            columns: ["library_exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercise_library";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_results_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      fisiovision_analyses: {
        Row: {
          callback_url: string | null;
          consumer_id: string;
          created_at: string;
          error: Json | null;
          exercise_id: string;
          id: string;
          idempotency_key: string;
          metadata: Json;
          result: Json | null;
          status: string;
          updated_at: string;
          video_url: string;
        };
        Insert: {
          callback_url?: string | null;
          consumer_id: string;
          created_at: string;
          error?: Json | null;
          exercise_id: string;
          id: string;
          idempotency_key: string;
          metadata?: Json;
          result?: Json | null;
          status: string;
          updated_at: string;
          video_url: string;
        };
        Update: {
          callback_url?: string | null;
          consumer_id?: string;
          created_at?: string;
          error?: Json | null;
          exercise_id?: string;
          id?: string;
          idempotency_key?: string;
          metadata?: Json;
          result?: Json | null;
          status?: string;
          updated_at?: string;
          video_url?: string;
        };
        Relationships: [];
      };
      movement_results: {
        Row: {
          amplitude: number | null;
          analysis_status: string | null;
          assessment_id: string;
          clinic_id: string;
          compensations: Json;
          controle: number | null;
          created_at: string;
          estabilidade: number | null;
          id: string;
          image_url: string | null;
          metrics: Json;
          movement_name: string | null;
          movements_evaluated: string[] | null;
          patient_id: string | null;
          professional_notes: string | null;
          simetria: number | null;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          amplitude?: number | null;
          analysis_status?: string | null;
          assessment_id: string;
          clinic_id: string;
          compensations?: Json;
          controle?: number | null;
          created_at?: string;
          estabilidade?: number | null;
          id?: string;
          image_url?: string | null;
          metrics?: Json;
          movement_name?: string | null;
          movements_evaluated?: string[] | null;
          patient_id?: string | null;
          professional_notes?: string | null;
          simetria?: number | null;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          amplitude?: number | null;
          analysis_status?: string | null;
          assessment_id?: string;
          clinic_id?: string;
          compensations?: Json;
          controle?: number | null;
          created_at?: string;
          estabilidade?: number | null;
          id?: string;
          image_url?: string | null;
          metrics?: Json;
          movement_name?: string | null;
          movements_evaluated?: string[] | null;
          patient_id?: string | null;
          professional_notes?: string | null;
          simetria?: number | null;
          updated_at?: string;
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
          {
            foreignKeyName: "movement_results_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movement_results_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_consents: {
        Row: {
          accepted_at: string | null;
          clinic_id: string;
          consent_ai_support: boolean;
          consent_image_use: boolean;
          consent_lgpd: boolean;
          consent_text: string | null;
          created_at: string;
          id: string;
          ip_address: string | null;
          patient_id: string;
          responsible_professional_id: string | null;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          clinic_id: string;
          consent_ai_support?: boolean;
          consent_image_use?: boolean;
          consent_lgpd?: boolean;
          consent_text?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          patient_id: string;
          responsible_professional_id?: string | null;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          clinic_id?: string;
          consent_ai_support?: boolean;
          consent_image_use?: boolean;
          consent_lgpd?: boolean;
          consent_text?: string | null;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          patient_id?: string;
          responsible_professional_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_consents_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_consents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patient_consents_responsible_professional_id_fkey";
            columns: ["responsible_professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          age: number | null;
          avatar_url: string | null;
          birth_date: string | null;
          clinic_id: string;
          clinical_notes: string | null;
          consent_given_at: string | null;
          contraindications: string[] | null;
          created_at: string;
          created_by: string | null;
          email: string | null;
          gender: string | null;
          goals: string[] | null;
          height_cm: number | null;
          id: string;
          main_complaint: string | null;
          medical_history: string | null;
          name: string;
          phone: string | null;
          status: string;
          updated_at: string;
          weight_kg: number | null;
        };
        Insert: {
          age?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          clinic_id: string;
          clinical_notes?: string | null;
          consent_given_at?: string | null;
          contraindications?: string[] | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          gender?: string | null;
          goals?: string[] | null;
          height_cm?: number | null;
          id?: string;
          main_complaint?: string | null;
          medical_history?: string | null;
          name: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          weight_kg?: number | null;
        };
        Update: {
          age?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          clinic_id?: string;
          clinical_notes?: string | null;
          consent_given_at?: string | null;
          contraindications?: string[] | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          gender?: string | null;
          goals?: string[] | null;
          height_cm?: number | null;
          id?: string;
          main_complaint?: string | null;
          medical_history?: string | null;
          name?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pose_captures: {
        Row: {
          assessment_id: string;
          clinic_id: string;
          created_at: string;
          duration_ms: number;
          engine: string;
          engine_version: string;
          exercise_key: string | null;
          exercise_label: string | null;
          fps: number;
          frame_count: number;
          id: string;
          landmarks: Json;
          notes: string | null;
          orientation: string;
          patient_id: string;
          quality: Json;
          updated_at: string;
        };
        Insert: {
          assessment_id: string;
          clinic_id: string;
          created_at?: string;
          duration_ms?: number;
          engine?: string;
          engine_version?: string;
          exercise_key?: string | null;
          exercise_label?: string | null;
          fps?: number;
          frame_count?: number;
          id?: string;
          landmarks?: Json;
          notes?: string | null;
          orientation?: string;
          patient_id: string;
          quality?: Json;
          updated_at?: string;
        };
        Update: {
          assessment_id?: string;
          clinic_id?: string;
          created_at?: string;
          duration_ms?: number;
          engine?: string;
          engine_version?: string;
          exercise_key?: string | null;
          exercise_label?: string | null;
          fps?: number;
          frame_count?: number;
          id?: string;
          landmarks?: Json;
          notes?: string | null;
          orientation?: string;
          patient_id?: string;
          quality?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pose_captures_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pose_captures_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pose_captures_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      postural_results: {
        Row: {
          assessment_id: string;
          clinic_id: string;
          created_at: string;
          findings: Json | null;
          id: string;
          image_url: string | null;
          image_urls: Json | null;
          patient_id: string | null;
          professional_notes: string | null;
          score: number | null;
          updated_at: string;
          view: string | null;
        };
        Insert: {
          assessment_id: string;
          clinic_id: string;
          created_at?: string;
          findings?: Json | null;
          id?: string;
          image_url?: string | null;
          image_urls?: Json | null;
          patient_id?: string | null;
          professional_notes?: string | null;
          score?: number | null;
          updated_at?: string;
          view?: string | null;
        };
        Update: {
          assessment_id?: string;
          clinic_id?: string;
          created_at?: string;
          findings?: Json | null;
          id?: string;
          image_url?: string | null;
          image_urls?: Json | null;
          patient_id?: string | null;
          professional_notes?: string | null;
          score?: number | null;
          updated_at?: string;
          view?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "postural_results_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "postural_results_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "postural_results_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
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
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          clinic_id?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          clinic_id?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
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
          archived_at: string | null;
          assessment_id: string;
          clinic_id: string;
          content: Json;
          created_at: string;
          created_by: string | null;
          finalized_at: string | null;
          id: string;
          patient_id: string;
          pdf_storage_path: string | null;
          pdf_url: string | null;
          plain_text: string | null;
          status: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          assessment_id: string;
          clinic_id: string;
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          finalized_at?: string | null;
          id?: string;
          patient_id: string;
          pdf_storage_path?: string | null;
          pdf_url?: string | null;
          plain_text?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          archived_at?: string | null;
          assessment_id?: string;
          clinic_id?: string;
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          finalized_at?: string | null;
          id?: string;
          patient_id?: string;
          pdf_storage_path?: string | null;
          pdf_url?: string | null;
          plain_text?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
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
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
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
      claim_fisiovision_analysis: {
        Args: never;
        Returns: {
          callback_url: string | null;
          consumer_id: string;
          created_at: string;
          error: Json | null;
          exercise_id: string;
          id: string;
          idempotency_key: string;
          metadata: Json;
          result: Json | null;
          status: string;
          updated_at: string;
          video_url: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "fisiovision_analyses";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      current_clinic_id: { Args: never; Returns: string };
      current_user_clinic_id: { Args: never; Returns: string };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_platform_admin: { Args: never; Returns: boolean };
      platform_overview: { Args: never; Returns: Json };
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

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
