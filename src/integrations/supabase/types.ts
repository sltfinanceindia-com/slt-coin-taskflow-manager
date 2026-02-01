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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          name: string
          organization_id: string | null
          points: number | null
        }
        Insert: {
          badge_color?: string | null
          category?: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          organization_id?: string | null
          points?: number | null
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          geo_location: Json | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity_at: string | null
          login_at: string | null
          organization_id: string | null
          profile_id: string | null
          user_id: string
          work_mode: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          login_at?: string | null
          organization_id?: string | null
          profile_id?: string | null
          user_id: string
          work_mode?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          login_at?: string | null
          organization_id?: string | null
          profile_id?: string | null
          user_id?: string
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          device_info: Json | null
          duration_minutes: number | null
          geo_location: Json | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string | null
          task_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          device_info?: Json | null
          duration_minutes?: number | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          task_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          device_info?: Json | null
          duration_minutes?: number | null
          geo_location?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string | null
          task_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notes: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          intern_id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          intern_id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          intern_id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context: string | null
          conversation_type: string | null
          created_at: string | null
          escalated_to: string | null
          id: string
          is_resolved: boolean | null
          messages: Json | null
          metadata: Json | null
          organization_id: string | null
          session_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          conversation_type?: string | null
          created_at?: string | null
          escalated_to?: string | null
          id?: string
          is_resolved?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          conversation_type?: string | null
          created_at?: string | null
          escalated_to?: string | null
          id?: string
          is_resolved?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_taken: boolean | null
          confidence_score: number | null
          content: Json
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          insight_type: string
          is_actionable: boolean | null
          organization_id: string | null
          severity: string | null
          title: string
        }
        Insert: {
          action_taken?: boolean | null
          confidence_score?: number | null
          content: Json
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_actionable?: boolean | null
          organization_id?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          action_taken?: boolean | null
          confidence_score?: number | null
          content?: Json
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_actionable?: boolean | null
          organization_id?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          feature_type: string
          id: string
          organization_id: string | null
          response_time_ms: number | null
          success: boolean | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          feature_type: string
          id?: string
          organization_id?: string | null
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          feature_type?: string
          id?: string
          organization_id?: string | null
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          organization_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          organization_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          organization_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          organization_id: string | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          organization_id?: string | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          organization_id?: string | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_instances: {
        Row: {
          created_at: string
          created_by: string
          current_step: number | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string | null
          status: string | null
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_step?: number | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_step?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_instances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_instances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          approver_id: string
          comments: string | null
          created_at: string
          decided_at: string | null
          id: string
          instance_id: string
          organization_id: string | null
          status: string | null
          step_number: number
        }
        Insert: {
          approver_id: string
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          instance_id: string
          organization_id?: string | null
          status?: string | null
          step_number: number
        }
        Update: {
          approver_id?: string
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          instance_id?: string
          organization_id?: string | null
          status?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "approval_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          steps: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          steps?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          steps?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_answers: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean | null
          organization_id: string | null
          question_id: string
          selected_answer: string | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          organization_id?: string | null
          question_id: string
          selected_answer?: string | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          organization_id?: string | null
          question_id?: string
          selected_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_answers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_assignments: {
        Row: {
          assessment_id: string
          assigned_at: string
          assigned_by: string
          created_at: string
          due_date: string | null
          id: string
          organization_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          assigned_at?: string
          assigned_by: string
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          assigned_at?: string
          assigned_by?: string
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_assignments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_attempts: {
        Row: {
          assessment_id: string
          correct_answers: number | null
          created_at: string
          id: string
          is_passed: boolean | null
          organization_id: string | null
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
          time_remaining_seconds: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_passed?: boolean | null
          organization_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          time_remaining_seconds?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_passed?: boolean | null
          organization_id?: string | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          time_remaining_seconds?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          correct_answer: string
          created_at: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          organization_id: string | null
          question_order: number
          question_text: string
        }
        Insert: {
          assessment_id: string
          correct_answer: string
          created_at?: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          organization_id?: string | null
          question_order: number
          question_text: string
        }
        Update: {
          assessment_id?: string
          correct_answer?: string
          created_at?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          organization_id?: string | null
          question_order?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          instructions: string | null
          is_published: boolean
          organization_id: string | null
          passing_score: number
          time_limit_minutes: number
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          organization_id?: string | null
          passing_score?: number
          time_limit_minutes?: number
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          organization_id?: string | null
          passing_score?: number
          time_limit_minutes?: number
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          asset_name: string
          asset_tag: string
          asset_type: string
          assigned_by: string | null
          assigned_date: string | null
          assigned_to: string | null
          brand: string | null
          condition: string | null
          created_at: string | null
          current_value: number | null
          id: string
          model: string | null
          notes: string | null
          organization_id: string | null
          purchase_date: string | null
          purchase_value: number | null
          return_date: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          asset_name: string
          asset_tag: string
          asset_type: string
          assigned_by?: string | null
          assigned_date?: string | null
          assigned_to?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          model?: string | null
          notes?: string | null
          organization_id?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          return_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_name?: string
          asset_tag?: string
          asset_type?: string
          assigned_by?: string | null
          assigned_date?: string | null
          assigned_to?: string | null
          brand?: string | null
          condition?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          model?: string | null
          notes?: string | null
          organization_id?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          return_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          attendance_date: string
          clock_in_latitude: number | null
          clock_in_longitude: number | null
          clock_in_time: string | null
          clock_in_within_geofence: boolean | null
          clock_out_latitude: number | null
          clock_out_longitude: number | null
          clock_out_time: string | null
          clock_out_within_geofence: boolean | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          organization_id: string | null
          overtime_hours: number | null
          status: string | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          attendance_date: string
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_time?: string | null
          clock_in_within_geofence?: boolean | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_time?: string | null
          clock_out_within_geofence?: boolean | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_time?: string | null
          clock_in_within_geofence?: boolean | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_time?: string | null
          clock_out_within_geofence?: boolean | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_settings: {
        Row: {
          created_at: string
          early_leave_threshold_minutes: number | null
          enable_geo_fencing: boolean | null
          geo_fence_radius_meters: number | null
          id: string
          late_threshold_minutes: number | null
          office_latitude: number | null
          office_longitude: number | null
          organization_id: string | null
          updated_at: string
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          created_at?: string
          early_leave_threshold_minutes?: number | null
          enable_geo_fencing?: boolean | null
          geo_fence_radius_meters?: number | null
          id?: string
          late_threshold_minutes?: number | null
          office_latitude?: number | null
          office_longitude?: number | null
          organization_id?: string | null
          updated_at?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          created_at?: string
          early_leave_threshold_minutes?: number | null
          enable_geo_fencing?: boolean | null
          geo_fence_radius_meters?: number | null
          id?: string
          late_threshold_minutes?: number | null
          office_latitude?: number | null
          office_longitude?: number | null
          organization_id?: string | null
          updated_at?: string
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          performed_by: string
          record_id: string | null
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          performed_by: string
          record_id?: string | null
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          performed_by?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          actions_executed: Json | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          organization_id: string | null
          rule_id: string
          status: string
          trigger_data: Json | null
        }
        Insert: {
          actions_executed?: Json | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string | null
          rule_id: string
          status?: string
          trigger_data?: Json | null
        }
        Update: {
          actions_executed?: Json | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          organization_id?: string | null
          rule_id?: string
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          organization_id: string | null
          priority: number | null
          run_count: number | null
          trigger_event: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          organization_id?: string | null
          priority?: number | null
          run_count?: number | null
          trigger_event: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          organization_id?: string | null
          priority?: number | null
          run_count?: number | null
          trigger_event?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      background_verifications: {
        Row: {
          completed_on: string | null
          created_at: string | null
          employee_id: string | null
          findings: string | null
          id: string
          initiated_by: string | null
          initiated_on: string | null
          organization_id: string | null
          progress: number | null
          status: string | null
          updated_at: string | null
          vendor: string | null
          verification_type: string
        }
        Insert: {
          completed_on?: string | null
          created_at?: string | null
          employee_id?: string | null
          findings?: string | null
          id?: string
          initiated_by?: string | null
          initiated_on?: string | null
          organization_id?: string | null
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          verification_type: string
        }
        Update: {
          completed_on?: string | null
          created_at?: string | null
          employee_id?: string | null
          findings?: string | null
          id?: string
          initiated_by?: string | null
          initiated_on?: string | null
          organization_id?: string | null
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_verifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_verifications_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "background_verifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_allocations: {
        Row: {
          allocated_amount: number | null
          category: string
          created_at: string | null
          created_by: string | null
          department: string
          fiscal_year: string
          id: string
          notes: string | null
          organization_id: string | null
          spent_amount: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          department: string
          fiscal_year: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          department?: string
          fiscal_year?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          spent_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_online: boolean | null
          location: string | null
          meeting_url: string | null
          organization_id: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          meeting_url?: string | null
          organization_id?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          meeting_url?: string | null
          organization_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      career_path_levels: {
        Row: {
          career_path_id: string | null
          created_at: string | null
          experience_max: number | null
          experience_min: number | null
          id: string
          level_order: number
          organization_id: string | null
          responsibilities: string[] | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          title: string
        }
        Insert: {
          career_path_id?: string | null
          created_at?: string | null
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          level_order: number
          organization_id?: string | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          title: string
        }
        Update: {
          career_path_id?: string | null
          created_at?: string | null
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          level_order?: number
          organization_id?: string | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_path_levels_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_path_levels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      career_paths: {
        Row: {
          created_at: string | null
          created_by: string | null
          department: string
          description: string | null
          id: string
          organization_id: string | null
          track_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department: string
          description?: string | null
          id?: string
          organization_id?: string | null
          track_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          track_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_paths_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      change_request_approvals: {
        Row: {
          approver_id: string
          change_request_id: string
          comments: string | null
          created_at: string
          decided_at: string | null
          id: string
          organization_id: string | null
          status: string
          step_order: number
        }
        Insert: {
          approver_id: string
          change_request_id: string
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          step_order?: number
        }
        Update: {
          approver_id?: string
          change_request_id?: string
          comments?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "change_request_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_approvals_change_request_id_fkey"
            columns: ["change_request_id"]
            isOneToOne: false
            referencedRelation: "change_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_request_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget_impact: number | null
          created_at: string
          description: string | null
          id: string
          impact_analysis: Json | null
          implementation_notes: string | null
          implemented_at: string | null
          organization_id: string | null
          priority: string
          project_id: string
          reason: string
          requested_by: string
          resource_impact: string | null
          schedule_impact_days: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          impact_analysis?: Json | null
          implementation_notes?: string | null
          implemented_at?: string | null
          organization_id?: string | null
          priority?: string
          project_id: string
          reason: string
          requested_by: string
          resource_impact?: string | null
          schedule_impact_days?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          impact_analysis?: Json | null
          implementation_notes?: string | null
          implemented_at?: string | null
          organization_id?: string | null
          priority?: string
          project_id?: string
          reason?: string
          requested_by?: string
          resource_impact?: string | null
          schedule_impact_days?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          organization_id: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          organization_id?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_read_status: {
        Row: {
          channel_id: string | null
          id: string
          last_read_at: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          last_read_at?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          last_read_at?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_read_status_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_read_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_read_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_seen: string | null
          organization_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_rates: {
        Row: {
          change_percentage: number | null
          created_at: string | null
          created_by: string | null
          id: string
          market_cap: number | null
          notes: string | null
          organization_id: string | null
          rate: number
          rate_date: string
          updated_at: string | null
          volume_24h: number | null
        }
        Insert: {
          change_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          market_cap?: number | null
          notes?: string | null
          organization_id?: string | null
          rate: number
          rate_date?: string
          updated_at?: string | null
          volume_24h?: number | null
        }
        Update: {
          change_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          market_cap?: number | null
          notes?: string | null
          organization_id?: string | null
          rate?: number
          rate_date?: string
          updated_at?: string | null
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_rates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_transactions: {
        Row: {
          bonus_coins: number | null
          coins_earned: number
          description: string | null
          id: string
          organization_id: string | null
          status: string
          task_id: string
          transaction_date: string
          user_id: string
        }
        Insert: {
          bonus_coins?: number | null
          coins_earned: number
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          task_id: string
          transaction_date?: string
          user_id: string
        }
        Update: {
          bonus_coins?: number | null
          coins_earned?: number
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string
          task_id?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_direct_message: boolean | null
          is_favorite: boolean | null
          is_muted: boolean | null
          last_message_at: string | null
          member_count: number | null
          name: string
          organization_id: string | null
          participant_ids: string[] | null
          permissions: Json
          settings: Json
          type: string
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_direct_message?: boolean | null
          is_favorite?: boolean | null
          is_muted?: boolean | null
          last_message_at?: string | null
          member_count?: number | null
          name: string
          organization_id?: string | null
          participant_ids?: string[] | null
          permissions?: Json
          settings?: Json
          type?: string
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_direct_message?: boolean | null
          is_favorite?: boolean | null
          is_muted?: boolean | null
          last_message_at?: string | null
          member_count?: number | null
          name?: string
          organization_id?: string | null
          participant_ids?: string[] | null
          permissions?: Json
          settings?: Json
          type?: string
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checkpoints: {
        Row: {
          checklist_items: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          name: string
          organization_id: string | null
          regulation: string | null
          required_stage: string | null
          updated_at: string | null
        }
        Insert: {
          checklist_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name: string
          organization_id?: string | null
          regulation?: string | null
          required_stage?: string | null
          updated_at?: string | null
        }
        Update: {
          checklist_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name?: string
          organization_id?: string | null
          regulation?: string | null
          required_stage?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checkpoints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checkpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      confirmations: {
        Row: {
          confirmation_date: string | null
          created_at: string | null
          employee_id: string | null
          generated_by: string | null
          id: string
          letter_status: string | null
          letter_url: string | null
          organization_id: string | null
          previous_salary: number | null
          probation_id: string | null
          revised_salary: number | null
          salary_revision: boolean | null
          updated_at: string | null
        }
        Insert: {
          confirmation_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          generated_by?: string | null
          id?: string
          letter_status?: string | null
          letter_url?: string | null
          organization_id?: string | null
          previous_salary?: number | null
          probation_id?: string | null
          revised_salary?: number | null
          salary_revision?: boolean | null
          updated_at?: string | null
        }
        Update: {
          confirmation_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          generated_by?: string | null
          id?: string
          letter_status?: string | null
          letter_url?: string | null
          organization_id?: string | null
          previous_salary?: number | null
          probation_id?: string | null
          revised_salary?: number | null
          salary_revision?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "confirmations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmations_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confirmations_probation_id_fkey"
            columns: ["probation_id"]
            isOneToOne: false
            referencedRelation: "probations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          actual_spend: number | null
          budget: number | null
          code: string
          created_at: string | null
          department: string | null
          headcount: number | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_spend?: number | null
          budget?: number | null
          code: string
          created_at?: string | null
          department?: string | null
          headcount?: number | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_spend?: number | null
          budget?: number | null
          code?: string
          created_at?: string | null
          department?: string | null
          headcount?: number | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_type: string
          field_type: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          options: Json | null
          organization_id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          field_type: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          options?: Json | null
          organization_id: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          options?: Json | null
          organization_id?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          field_id: string
          id: string
          organization_id: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_id: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_id?: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_reports: {
        Row: {
          chart_config: Json | null
          columns: Json
          created_at: string | null
          created_by: string
          description: string | null
          filters: Json | null
          grouping: Json | null
          id: string
          is_public: boolean | null
          is_scheduled: boolean | null
          last_run_at: string | null
          name: string
          organization_id: string | null
          query_config: Json
          recipients: string[] | null
          report_type: string
          schedule_cron: string | null
          sorting: Json | null
          updated_at: string | null
        }
        Insert: {
          chart_config?: Json | null
          columns?: Json
          created_at?: string | null
          created_by: string
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_public?: boolean | null
          is_scheduled?: boolean | null
          last_run_at?: string | null
          name: string
          organization_id?: string | null
          query_config?: Json
          recipients?: string[] | null
          report_type: string
          schedule_cron?: string | null
          sorting?: Json | null
          updated_at?: string | null
        }
        Update: {
          chart_config?: Json | null
          columns?: Json
          created_at?: string | null
          created_by?: string
          description?: string | null
          filters?: Json | null
          grouping?: Json | null
          id?: string
          is_public?: boolean | null
          is_scheduled?: boolean | null
          last_run_at?: string | null
          name?: string
          organization_id?: string | null
          query_config?: Json
          recipients?: string[] | null
          report_type?: string
          schedule_cron?: string | null
          sorting?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          hierarchy_level: number
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          organization_id: string | null
          role_type: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hierarchy_level?: number
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          organization_id?: string | null
          role_type: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hierarchy_level?: number
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          organization_id?: string | null
          role_type?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_email_log: {
        Row: {
          created_at: string
          email_date: string
          email_type: string
          id: string
          organization_id: string | null
          sent_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_date?: string
          email_type: string
          id?: string
          organization_id?: string | null
          sent_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_date?: string
          email_type?: string
          id?: string
          organization_id?: string | null
          sent_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_email_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_email_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          layout: Json
          name: string
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          name: string
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_visible: boolean | null
          organization_id: string | null
          position: number | null
          size: string | null
          title: string
          updated_at: string
          user_id: string
          widget_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          organization_id?: string | null
          position?: number | null
          size?: string | null
          title: string
          updated_at?: string
          user_id: string
          widget_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          organization_id?: string | null
          position?: number | null
          size?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          alternatives: string[] | null
          context: string | null
          created_at: string | null
          created_by: string | null
          decision_date: string | null
          decision_maker_id: string | null
          description: string | null
          id: string
          impact: string | null
          organization_id: string
          rationale: string | null
          stakeholders: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alternatives?: string[] | null
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_date?: string | null
          decision_maker_id?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          organization_id: string
          rationale?: string | null
          stakeholders?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alternatives?: string[] | null
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_date?: string | null
          decision_maker_id?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          organization_id?: string
          rationale?: string | null
          stakeholders?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_decision_maker_id_fkey"
            columns: ["decision_maker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digest_settings: {
        Row: {
          created_at: string
          digest_frequency: string
          digest_time: string | null
          id: string
          include_files: boolean | null
          include_mentions: boolean | null
          include_tasks: boolean | null
          include_updates: boolean | null
          last_digest_sent: string | null
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_frequency?: string
          digest_time?: string | null
          id?: string
          include_files?: boolean | null
          include_mentions?: boolean | null
          include_tasks?: boolean | null
          include_updates?: boolean | null
          last_digest_sent?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_frequency?: string
          digest_time?: string | null
          id?: string
          include_files?: boolean | null
          include_mentions?: boolean | null
          include_tasks?: boolean | null
          include_updates?: boolean | null
          last_digest_sent?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digest_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_actions: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          documents: string[] | null
          employee_id: string | null
          expiry_date: string | null
          id: string
          issued_by: string | null
          issued_date: string
          organization_id: string | null
          reason: string
          status: string | null
          updated_at: string | null
          witnesses: string[] | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date: string
          organization_id?: string | null
          reason: string
          status?: string | null
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          documents?: string[] | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string
          organization_id?: string | null
          reason?: string
          status?: string | null
          updated_at?: string | null
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      early_warnings: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean | null
          is_resolved: boolean | null
          organization_id: string | null
          prediction_confidence: number | null
          project_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          suggested_action: string | null
          task_id: string | null
          warning_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          organization_id?: string | null
          prediction_confidence?: number | null
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          suggested_action?: string | null
          task_id?: string | null
          warning_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          organization_id?: string | null
          prediction_confidence?: number | null
          project_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          suggested_action?: string | null
          task_id?: string | null
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "early_warnings_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          comment_id: string | null
          created_at: string
          email_to: string
          email_type: string
          id: string
          organization_id: string | null
          sent_at: string
          subject: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          email_to: string
          email_type: string
          id?: string
          organization_id?: string | null
          sent_at?: string
          subject: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          email_to?: string
          email_type?: string
          id?: string
          organization_id?: string | null
          sent_at?: string
          subject?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assets: {
        Row: {
          asset_name: string
          asset_tag: string | null
          asset_type: string
          assigned_at: string
          assigned_by: string | null
          condition_on_assign: string | null
          condition_on_return: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          organization_id: string | null
          received_by: string | null
          returned_at: string | null
          serial_number: string | null
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_tag?: string | null
          asset_type: string
          assigned_at?: string
          assigned_by?: string | null
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          received_by?: string | null
          returned_at?: string | null
          serial_number?: string | null
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_tag?: string | null
          asset_type?: string
          assigned_at?: string
          assigned_by?: string | null
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          received_by?: string | null
          returned_at?: string | null
          serial_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_assets_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_assets_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_benefits: {
        Row: {
          coverage_amount: number | null
          created_at: string | null
          dependents_count: number | null
          employee_contribution: number | null
          employee_id: string | null
          employer_contribution: number | null
          id: string
          name: string
          organization_id: string | null
          premium: number | null
          provider: string | null
          status: string | null
          type: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          coverage_amount?: number | null
          created_at?: string | null
          dependents_count?: number | null
          employee_contribution?: number | null
          employee_id?: string | null
          employer_contribution?: number | null
          id?: string
          name: string
          organization_id?: string | null
          premium?: number | null
          provider?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          coverage_amount?: number | null
          created_at?: string | null
          dependents_count?: number | null
          employee_contribution?: number | null
          employee_id?: string | null
          employer_contribution?: number | null
          id?: string
          name?: string
          organization_id?: string | null
          premium?: number | null
          provider?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_benefits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_capacity: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string
          hourly_rate: number | null
          id: string
          organization_id: string | null
          profile_id: string
          updated_at: string
          utilization_target: number | null
          weekly_hours: number
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          organization_id?: string | null
          profile_id: string
          updated_at?: string
          utilization_target?: number | null
          weekly_hours?: number
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          organization_id?: string | null
          profile_id?: string
          updated_at?: string
          utilization_target?: number | null
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_capacity_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_capacity_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contracts: {
        Row: {
          contract_type: string
          created_at: string | null
          created_by: string | null
          document_url: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          salary: number | null
          start_date: string
          status: string | null
          terms: string | null
          updated_at: string | null
        }
        Insert: {
          contract_type: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          salary?: number | null
          start_date: string
          status?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          salary?: number | null
          start_date?: string
          status?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_number: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          organization_id: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_number?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_number?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_portal_settings: {
        Row: {
          allow_attendance_view: boolean | null
          allow_document_upload: boolean | null
          allow_leave_requests: boolean | null
          allow_payslip_download: boolean | null
          allow_profile_update: boolean | null
          created_at: string | null
          id: string
          organization_id: string | null
          show_achievements: boolean | null
          show_coin_balance: boolean | null
          show_leaderboard: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_attendance_view?: boolean | null
          allow_document_upload?: boolean | null
          allow_leave_requests?: boolean | null
          allow_payslip_download?: boolean | null
          allow_profile_update?: boolean | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          show_achievements?: boolean | null
          show_coin_balance?: boolean | null
          show_leaderboard?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_attendance_view?: boolean | null
          allow_document_upload?: boolean | null
          allow_leave_requests?: boolean | null
          allow_payslip_download?: boolean | null
          allow_profile_update?: boolean | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          show_achievements?: boolean | null
          show_coin_balance?: boolean | null
          show_leaderboard?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_portal_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          certified_date: string | null
          created_at: string
          id: string
          is_certified: boolean | null
          organization_id: string | null
          proficiency_level: number
          profile_id: string
          skill_id: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          certified_date?: string | null
          created_at?: string
          id?: string
          is_certified?: boolean | null
          organization_id?: string | null
          proficiency_level?: number
          profile_id: string
          skill_id: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          certified_date?: string | null
          created_at?: string
          id?: string
          is_certified?: boolean | null
          organization_id?: string | null
          proficiency_level?: number
          profile_id?: string
          skill_id?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          decision_approved_by: string | null
          entity_id: string
          entity_type: string
          id: string
          is_decision: boolean | null
          mentions: string[] | null
          organization_id: string | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          decision_approved_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_decision?: boolean | null
          mentions?: string[] | null
          organization_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          decision_approved_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_decision?: boolean | null
          mentions?: string[] | null
          organization_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_comments_decision_approved_by_fkey"
            columns: ["decision_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "entity_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_followers: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_followers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exit_requests: {
        Row: {
          clearance_checklist: Json | null
          created_at: string | null
          detailed_reason: string | null
          employee_id: string
          exit_interview_date: string | null
          exit_interview_notes: string | null
          fnf_amount: number | null
          fnf_status: string | null
          hr_notes: string | null
          id: string
          last_working_date: string
          notice_period_days: number | null
          organization_id: string | null
          reason: string
          resignation_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          clearance_checklist?: Json | null
          created_at?: string | null
          detailed_reason?: string | null
          employee_id: string
          exit_interview_date?: string | null
          exit_interview_notes?: string | null
          fnf_amount?: number | null
          fnf_status?: string | null
          hr_notes?: string | null
          id?: string
          last_working_date: string
          notice_period_days?: number | null
          organization_id?: string | null
          reason: string
          resignation_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          clearance_checklist?: Json | null
          created_at?: string | null
          detailed_reason?: string | null
          employee_id?: string
          exit_interview_date?: string | null
          exit_interview_notes?: string | null
          fnf_amount?: number | null
          fnf_status?: string | null
          hr_notes?: string | null
          id?: string
          last_working_date?: string
          notice_period_days?: number | null
          organization_id?: string | null
          reason?: string
          resignation_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          budget_amount: number | null
          budget_period: string | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget_amount?: number | null
          budget_period?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_amount?: number | null
          budget_period?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_claims: {
        Row: {
          amount: number
          category: string
          claim_number: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          employee_id: string
          expense_date: string
          id: string
          organization_id: string | null
          payment_date: string | null
          payment_reference: string | null
          receipt_urls: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          claim_number?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          employee_id: string
          expense_date: string
          id?: string
          organization_id?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          receipt_urls?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          claim_number?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          employee_id?: string
          expense_date?: string
          id?: string
          organization_id?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          receipt_urls?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_claims_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_cycles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_anonymous: boolean | null
          name: string
          organization_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_anonymous?: boolean | null
          name: string
          organization_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_anonymous?: boolean | null
          name?: string
          organization_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_cycles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          cycle_id: string
          due_date: string | null
          feedback_type: string
          id: string
          organization_id: string | null
          reviewer_id: string
          status: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          cycle_id: string
          due_date?: string | null
          feedback_type: string
          id?: string
          organization_id?: string | null
          reviewer_id: string
          status?: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          cycle_id?: string
          due_date?: string | null
          feedback_type?: string
          id?: string
          organization_id?: string | null
          reviewer_id?: string
          status?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_requests_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "feedback_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_requests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          completion_time_seconds: number | null
          created_at: string
          id: string
          ip_address: string | null
          referral_source: string | null
          referred_by_name: string | null
          response_data: Json
          submission_date: string
          updated_at: string
          user_agent: string | null
          user_email: string
          user_name: string
          user_phone: string | null
        }
        Insert: {
          completion_time_seconds?: number | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_source?: string | null
          referred_by_name?: string | null
          response_data?: Json
          submission_date?: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_name: string
          user_phone?: string | null
        }
        Update: {
          completion_time_seconds?: number | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referral_source?: string | null
          referred_by_name?: string | null
          response_data?: Json
          submission_date?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_name?: string
          user_phone?: string | null
        }
        Relationships: []
      }
      file_annotations: {
        Row: {
          annotation_type: string
          content: string | null
          created_at: string
          file_version_id: string
          id: string
          organization_id: string | null
          position_data: Json
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annotation_type?: string
          content?: string | null
          created_at?: string
          file_version_id: string
          id?: string
          organization_id?: string | null
          position_data?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annotation_type?: string
          content?: string | null
          created_at?: string
          file_version_id?: string
          id?: string
          organization_id?: string | null
          position_data?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_annotations_file_version_id_fkey"
            columns: ["file_version_id"]
            isOneToOne: false
            referencedRelation: "file_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_annotations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_annotations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_annotations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          organization_id: string | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          organization_id?: string | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          organization_id?: string | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          change_description: string | null
          created_at: string
          file_name: string
          file_size: number
          id: string
          organization_id: string | null
          original_file_id: string | null
          project_id: string | null
          storage_path: string
          task_id: string | null
          uploaded_by: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          file_name: string
          file_size?: number
          id?: string
          organization_id?: string | null
          original_file_id?: string | null
          project_id?: string | null
          storage_path: string
          task_id?: string | null
          uploaded_by: string
          version_number?: number
        }
        Update: {
          change_description?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          organization_id?: string | null
          original_file_id?: string | null
          project_id?: string | null
          storage_path?: string
          task_id?: string | null
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_versions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fnf_settlements: {
        Row: {
          basic_salary: number | null
          bonus: number | null
          clearance_admin: boolean | null
          clearance_finance: boolean | null
          clearance_hr: boolean | null
          clearance_it: boolean | null
          clearance_manager: boolean | null
          created_at: string | null
          employee_id: string | null
          gratuity: number | null
          id: string
          last_working_day: string
          leave_encashment: number | null
          loan_recovery: number | null
          net_payable: number | null
          notice_period_days: number | null
          notice_recovery: number | null
          notice_served_days: number | null
          organization_id: string | null
          other_deductions: number | null
          other_earnings: number | null
          processed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          basic_salary?: number | null
          bonus?: number | null
          clearance_admin?: boolean | null
          clearance_finance?: boolean | null
          clearance_hr?: boolean | null
          clearance_it?: boolean | null
          clearance_manager?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          gratuity?: number | null
          id?: string
          last_working_day: string
          leave_encashment?: number | null
          loan_recovery?: number | null
          net_payable?: number | null
          notice_period_days?: number | null
          notice_recovery?: number | null
          notice_served_days?: number | null
          organization_id?: string | null
          other_deductions?: number | null
          other_earnings?: number | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          basic_salary?: number | null
          bonus?: number | null
          clearance_admin?: boolean | null
          clearance_finance?: boolean | null
          clearance_hr?: boolean | null
          clearance_it?: boolean | null
          clearance_manager?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          gratuity?: number | null
          id?: string
          last_working_day?: string
          leave_encashment?: number | null
          loan_recovery?: number | null
          net_payable?: number | null
          notice_period_days?: number | null
          notice_recovery?: number | null
          notice_served_days?: number | null
          organization_id?: string | null
          other_deductions?: number | null
          other_earnings?: number | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fnf_settlements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fnf_settlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fnf_settlements_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gratuity_records: {
        Row: {
          created_at: string | null
          employee_id: string | null
          gratuity_amount: number | null
          id: string
          joining_date: string
          last_drawn_basic: number | null
          organization_id: string | null
          payment_date: string | null
          status: string | null
          updated_at: string | null
          years_of_service: number | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          gratuity_amount?: number | null
          id?: string
          joining_date: string
          last_drawn_basic?: number | null
          organization_id?: string | null
          payment_date?: string | null
          status?: string | null
          updated_at?: string | null
          years_of_service?: number | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          gratuity_amount?: number | null
          id?: string
          joining_date?: string
          last_drawn_basic?: number | null
          organization_id?: string | null
          payment_date?: string | null
          status?: string | null
          updated_at?: string | null
          years_of_service?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gratuity_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gratuity_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string | null
          employee_id: string | null
          id: string
          is_anonymous: boolean | null
          organization_id: string | null
          priority: string | null
          resolution_date: string | null
          resolution_notes: string | null
          status: string | null
          subject: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          organization_id?: string | null
          priority?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: string | null
          subject: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          organization_id?: string | null
          priority?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: string | null
          subject?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grievances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grievances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          organization_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          organization_id?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          organization_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      handbook_policies: {
        Row: {
          acknowledgment_required: boolean | null
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          organization_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          acknowledgment_required?: boolean | null
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          acknowledgment_required?: boolean | null
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handbook_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handbook_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          holiday_date: string
          holiday_type: string | null
          id: string
          is_recurring: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          holiday_date: string
          holiday_type?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          holiday_date?: string
          holiday_type?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holidays_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holidays_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_email: string | null
          candidate_name: string
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interviewer_ids: string[] | null
          job_posting_id: string | null
          mode: string | null
          organization_id: string | null
          position: string
          rating: number | null
          round: string
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_email?: string | null
          candidate_name: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interviewer_ids?: string[] | null
          job_posting_id?: string | null
          mode?: string | null
          organization_id?: string | null
          position: string
          rating?: number | null
          round: string
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_email?: string | null
          candidate_name?: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interviewer_ids?: string[] | null
          job_posting_id?: string | null
          mode?: string | null
          organization_id?: string | null
          position?: string
          rating?: number | null
          round?: string
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          invoice_pdf_url: string | null
          line_items: Json | null
          organization_id: string | null
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_pdf_url?: string | null
          line_items?: Json | null
          organization_id?: string | null
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_pdf_url?: string | null
          line_items?: Json | null
          organization_id?: string | null
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          id: string
          issue_type: string
          organization_id: string | null
          priority: string
          project_id: string | null
          reporter_id: string | null
          resolution: string | null
          resolved_at: string | null
          status: string
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          reporter_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          reporter_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          applications_count: number | null
          closes_on: string | null
          created_at: string | null
          department: string
          description: string | null
          experience: string | null
          hiring_manager_id: string | null
          id: string
          location: string | null
          organization_id: string | null
          posted_on: string | null
          requirements: string | null
          salary_range_max: number | null
          salary_range_min: number | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          applications_count?: number | null
          closes_on?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          experience?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          posted_on?: string | null
          requirements?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          applications_count?: number | null
          closes_on?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          experience?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          posted_on?: string | null
          requirements?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_events: {
        Row: {
          analytics_data: Json | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          task_id: string
          timestamp: string
          to_status: string | null
          user_id: string
        }
        Insert: {
          analytics_data?: Json | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          task_id: string
          timestamp?: string
          to_status?: string | null
          user_id: string
        }
        Update: {
          analytics_data?: Json | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          task_id?: string
          timestamp?: string
          to_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_metrics: {
        Row: {
          avg_cycle_time: number | null
          created_at: string
          date: string
          id: string
          organization_id: string | null
          status_changes: number | null
          throughput: number | null
          total_events: number | null
          updated_at: string
          wip_limit_violations: number | null
        }
        Insert: {
          avg_cycle_time?: number | null
          created_at?: string
          date: string
          id?: string
          organization_id?: string | null
          status_changes?: number | null
          throughput?: number | null
          total_events?: number | null
          updated_at?: string
          wip_limit_violations?: number | null
        }
        Update: {
          avg_cycle_time?: number | null
          created_at?: string
          date?: string
          id?: string
          organization_id?: string | null
          status_changes?: number | null
          throughput?: number | null
          total_events?: number | null
          updated_at?: string
          wip_limit_violations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          objective_id: string
          organization_id: string | null
          start_value: number | null
          status: string
          target_value: number
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id: string
          organization_id?: string | null
          start_value?: number | null
          status?: string
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id?: string
          organization_id?: string | null
          start_value?: number | null
          status?: string
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          helpful_count: number | null
          id: string
          organization_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          organization_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          organization_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          badge_type: string
          created_at: string
          from_user_id: string
          id: string
          is_public: boolean | null
          message: string
          organization_id: string | null
          to_user_id: string
        }
        Insert: {
          badge_type?: string
          created_at?: string
          from_user_id: string
          id?: string
          is_public?: boolean | null
          message: string
          organization_id?: string | null
          to_user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          from_user_id?: string
          id?: string
          is_public?: boolean | null
          message?: string
          organization_id?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          carried_forward: number
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
          organization_id: string | null
          pending_days: number
          total_days: number
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          carried_forward?: number
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
          organization_id?: string | null
          pending_days?: number
          total_days?: number
          updated_at?: string
          used_days?: number
          year?: number
        }
        Update: {
          carried_forward?: number
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
          organization_id?: string | null
          pending_days?: number
          total_days?: number
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          employee_id: string
          end_date: string
          half_day_type: string | null
          id: string
          is_half_day: boolean | null
          leave_type_id: string
          organization_id: string | null
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          end_date: string
          half_day_type?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id: string
          organization_id?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          total_days: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          end_date?: string
          half_day_type?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id?: string
          organization_id?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          allow_carry_forward: boolean | null
          color: string | null
          created_at: string
          days_per_year: number
          description: string | null
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_carry_forward_days: number | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          allow_carry_forward?: boolean | null
          color?: string | null
          created_at?: string
          days_per_year?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carry_forward_days?: number | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_carry_forward?: boolean | null
          color?: string | null
          created_at?: string
          days_per_year?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carry_forward_days?: number | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_learned: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          impact: string | null
          organization_id: string
          project_id: string | null
          project_name: string | null
          recommendations: string[] | null
          title: string
          updated_at: string | null
          what_went_well: string[] | null
          what_went_wrong: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact?: string | null
          organization_id: string
          project_id?: string | null
          project_name?: string | null
          recommendations?: string[] | null
          title: string
          updated_at?: string | null
          what_went_well?: string[] | null
          what_went_wrong?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact?: string | null
          organization_id?: string
          project_id?: string | null
          project_name?: string | null
          recommendations?: string[] | null
          title?: string
          updated_at?: string | null
          what_went_well?: string[] | null
          what_went_wrong?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learned_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_learned_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_learned_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_instance_items: {
        Row: {
          assigned_to: string | null
          assignee_role: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          due_date: string | null
          id: string
          instance_id: string
          item_description: string | null
          item_title: string
          notes: string | null
          organization_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assignee_role?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          instance_id: string
          item_description?: string | null
          item_title: string
          notes?: string | null
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assignee_role?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          instance_id?: string
          item_description?: string | null
          item_title?: string
          notes?: string | null
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_instance_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instance_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instance_items_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instance_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_instances: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          notes: string | null
          organization_id: string | null
          playbook_id: string
          started_at: string
          status: string
          target_completion_date: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          playbook_id: string
          started_at?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          playbook_id?: string
          started_at?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_instances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_instances_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_playbooks: {
        Row: {
          checklist_items: Json
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          role: string | null
          type: string
          updated_at: string
        }
        Insert: {
          checklist_items?: Json
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          role?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          checklist_items?: Json
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          role?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_playbooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_playbooks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lifecycle_playbooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          interest_amount: number | null
          loan_id: string | null
          organization_id: string | null
          payment_date: string
          payment_method: string | null
          payroll_record_id: string | null
          principal_amount: number | null
          reference_number: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          interest_amount?: number | null
          loan_id?: string | null
          organization_id?: string | null
          payment_date: string
          payment_method?: string | null
          payroll_record_id?: string | null
          principal_amount?: number | null
          reference_number?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          interest_amount?: number | null
          loan_id?: string | null
          organization_id?: string | null
          payment_date?: string
          payment_method?: string | null
          payroll_record_id?: string | null
          principal_amount?: number | null
          reference_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_repayments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_repayments_payroll_record_id_fkey"
            columns: ["payroll_record_id"]
            isOneToOne: false
            referencedRelation: "payroll_records"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          disbursed_at: string | null
          emi_amount: number | null
          employee_id: string | null
          id: string
          interest_rate: number | null
          loan_type: string | null
          next_emi_date: string | null
          organization_id: string | null
          reason: string | null
          remaining_balance: number | null
          status: string | null
          tenure_months: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          emi_amount?: number | null
          employee_id?: string | null
          id?: string
          interest_rate?: number | null
          loan_type?: string | null
          next_emi_date?: string | null
          organization_id?: string | null
          reason?: string | null
          remaining_balance?: number | null
          status?: string | null
          tenure_months?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          emi_amount?: number | null
          employee_id?: string | null
          id?: string
          interest_rate?: number | null
          loan_type?: string | null
          next_emi_date?: string | null
          organization_id?: string | null
          reason?: string | null
          remaining_balance?: number | null
          status?: string | null
          tenure_months?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_action_items: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          meeting_id: string
          organization_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id: string
          organization_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meeting_id?: string
          organization_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_action_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_action_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_action_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_agenda_items: {
        Row: {
          added_by: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_discussed: boolean | null
          meeting_id: string
          organization_id: string | null
          topic: string
          topic_type: string | null
        }
        Insert: {
          added_by: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_discussed?: boolean | null
          meeting_id: string
          organization_id?: string | null
          topic: string
          topic_type?: string | null
        }
        Update: {
          added_by?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_discussed?: boolean | null
          meeting_id?: string
          organization_id?: string | null
          topic?: string
          topic_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_agenda_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_agenda_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_private: boolean | null
          meeting_id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_private?: boolean | null
          meeting_id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_private?: boolean | null
          meeting_id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_talking_points: {
        Row: {
          added_by: string | null
          content: string
          created_at: string
          id: string
          is_discussed: boolean | null
          is_private: boolean | null
          meeting_id: string
          order_index: number | null
          organization_id: string | null
        }
        Insert: {
          added_by?: string | null
          content: string
          created_at?: string
          id?: string
          is_discussed?: boolean | null
          is_private?: boolean | null
          meeting_id: string
          order_index?: number | null
          organization_id?: string | null
        }
        Update: {
          added_by?: string | null
          content?: string
          created_at?: string
          id?: string
          is_discussed?: boolean | null
          is_private?: boolean | null
          meeting_id?: string
          order_index?: number | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_talking_points_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_talking_points_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_talking_points_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          name: string
          organization_id: string | null
          size: number
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          name: string
          organization_id?: string | null
          size: number
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          name?: string
          organization_id?: string | null
          size?: number
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          created_at: string
          id: string
          message_id: string
          organization_id: string | null
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          organization_id?: string | null
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          organization_id?: string | null
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_states: {
        Row: {
          id: string
          message_id: string
          organization_id: string | null
          state: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          organization_id?: string | null
          state?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          organization_id?: string | null
          state?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_states_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          last_message_at: string
          organization_id: string | null
          parent_message_id: string
          participant_count: number
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          organization_id?: string | null
          parent_message_id: string
          participant_count?: number
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          organization_id?: string | null
          parent_message_id?: string
          participant_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          channel_id: string | null
          content: string
          created_at: string
          edited_at: string | null
          forwarded_from: string | null
          id: string
          is_edited: boolean | null
          is_important: boolean | null
          is_pinned: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          is_system_message: boolean
          mentions: string[] | null
          message_status: string
          message_type: string
          organization_id: string | null
          reactions: Json | null
          receiver_id: string | null
          reply_to: string | null
          sender_id: string
          sender_name: string | null
          sender_role: string | null
          thread_count: number | null
          thread_id: string | null
          thread_replies: number | null
        }
        Insert: {
          attachments?: Json | null
          channel_id?: string | null
          content: string
          created_at?: string
          edited_at?: string | null
          forwarded_from?: string | null
          id?: string
          is_edited?: boolean | null
          is_important?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          is_system_message?: boolean
          mentions?: string[] | null
          message_status?: string
          message_type?: string
          organization_id?: string | null
          reactions?: Json | null
          receiver_id?: string | null
          reply_to?: string | null
          sender_id: string
          sender_name?: string | null
          sender_role?: string | null
          thread_count?: number | null
          thread_id?: string | null
          thread_replies?: number | null
        }
        Update: {
          attachments?: Json | null
          channel_id?: string | null
          content?: string
          created_at?: string
          edited_at?: string | null
          forwarded_from?: string | null
          id?: string
          is_edited?: boolean | null
          is_important?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          is_system_message?: boolean
          mentions?: string[] | null
          message_status?: string
          message_type?: string
          organization_id?: string | null
          reactions?: Json | null
          receiver_id?: string | null
          reply_to?: string | null
          sender_id?: string
          sender_name?: string | null
          sender_role?: string | null
          thread_count?: number | null
          thread_id?: string | null
          thread_replies?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completion_percentage: number | null
          created_at: string
          created_by: string | null
          deliverables: string[] | null
          description: string | null
          due_date: string
          id: string
          name: string
          organization_id: string | null
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date: string
          id?: string
          name: string
          organization_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          deliverables?: string[] | null
          description?: string | null
          due_date?: string
          id?: string
          name?: string
          organization_id?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          digest_enabled: boolean | null
          digest_frequency: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          organization_id: string | null
          preferences: Json | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          organization_id?: string | null
          preferences?: Json | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          organization_id?: string | null
          preferences?: Json | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel_notifications: Json
          created_at: string
          email_notifications: boolean
          id: string
          mention_notifications: boolean
          organization_id: string | null
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_notifications?: Json
          created_at?: string
          email_notifications?: boolean
          id?: string
          mention_notifications?: boolean
          organization_id?: string | null
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_notifications?: Json
          created_at?: string
          email_notifications?: boolean
          id?: string
          mention_notifications?: boolean
          organization_id?: string | null
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          organization_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          organization_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          organization_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          level: string
          organization_id: string | null
          owner_id: string
          parent_id: string | null
          progress_percentage: number | null
          quarter: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          level?: string
          organization_id?: string | null
          owner_id: string
          parent_id?: string | null
          progress_percentage?: number | null
          quarter?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          level?: string
          organization_id?: string | null
          owner_id?: string
          parent_id?: string | null
          progress_percentage?: number | null
          quarter?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          candidate_email: string | null
          candidate_name: string
          created_at: string | null
          created_by: string | null
          department: string | null
          expires_at: string | null
          id: string
          job_posting_id: string | null
          joining_date: string | null
          offer_letter_url: string | null
          organization_id: string | null
          position: string
          salary_offered: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_email?: string | null
          candidate_name: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          expires_at?: string | null
          id?: string
          job_posting_id?: string | null
          joining_date?: string | null
          offer_letter_url?: string | null
          organization_id?: string | null
          position: string
          salary_offered: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_email?: string | null
          candidate_name?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          expires_at?: string | null
          id?: string
          job_posting_id?: string | null
          joining_date?: string | null
          offer_letter_url?: string | null
          organization_id?: string | null
          position?: string
          salary_offered?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_check_ins: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key_result_id: string
          new_value: number
          notes: string | null
          organization_id: string | null
          previous_value: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key_result_id: string
          new_value: number
          notes?: string | null
          organization_id?: string | null
          previous_value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key_result_id?: string
          new_value?: number
          notes?: string | null
          organization_id?: string | null
          previous_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "okr_check_ins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_check_ins_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "okr_check_ins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      on_call_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          organization_id: string
          rotation_type: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          organization_id: string
          rotation_type?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          rotation_type?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "on_call_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_meetings: {
        Row: {
          created_at: string
          duration_minutes: number | null
          employee_id: string
          id: string
          is_recurring: boolean | null
          location: string | null
          manager_id: string
          meeting_url: string | null
          organization_id: string | null
          recurrence_pattern: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          employee_id: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          manager_id: string
          meeting_url?: string | null
          organization_id?: string | null
          recurrence_pattern?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          employee_id?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          manager_id?: string
          meeting_url?: string | null
          organization_id?: string | null
          recurrence_pattern?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_meetings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_meetings_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_on_one_meetings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_domains: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          dns_verified: boolean | null
          id: string
          is_published: boolean | null
          organization_id: string | null
          published_at: string | null
          ssl_enabled: boolean | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          dns_verified?: boolean | null
          id?: string
          is_published?: boolean | null
          organization_id?: string | null
          published_at?: string | null
          ssl_enabled?: boolean | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          dns_verified?: boolean | null
          id?: string
          is_published?: boolean | null
          organization_id?: string | null
          published_at?: string | null
          ssl_enabled?: boolean | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          autopay_enabled: boolean | null
          billing_email: string | null
          coin_name: string | null
          coin_rate: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          date_format: string | null
          description: string | null
          enabled_features: Json | null
          first_day_of_week: number | null
          id: string
          logo_url: string | null
          max_users: number
          name: string
          notification_settings: Json | null
          payment_failed_at: string | null
          primary_color: string | null
          secondary_color: string | null
          security_settings: Json | null
          service_suspended_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["organization_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subdomain: string
          subscription_plan_id: string | null
          subscription_status: string | null
          tax_id: string | null
          timezone: string | null
          trial_ends_at: string | null
          two_fa_policy: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          autopay_enabled?: boolean | null
          billing_email?: string | null
          coin_name?: string | null
          coin_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          description?: string | null
          enabled_features?: Json | null
          first_day_of_week?: number | null
          id?: string
          logo_url?: string | null
          max_users?: number
          name: string
          notification_settings?: Json | null
          payment_failed_at?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          security_settings?: Json | null
          service_suspended_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain: string
          subscription_plan_id?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          two_fa_policy?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          autopay_enabled?: boolean | null
          billing_email?: string | null
          coin_name?: string | null
          coin_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          description?: string | null
          enabled_features?: Json | null
          first_day_of_week?: number | null
          id?: string
          logo_url?: string | null
          max_users?: number
          name?: string
          notification_settings?: Json | null
          payment_failed_at?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          security_settings?: Json | null
          service_suspended_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subdomain?: string
          subscription_plan_id?: string | null
          subscription_status?: string | null
          tax_id?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          two_fa_policy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_hash?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          id: string
          is_default: boolean | null
          organization_id: string | null
          stripe_payment_method_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          organization_id?: string | null
          stripe_payment_method_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          organization_id?: string | null
          stripe_payment_method_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          payment_method: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_items: {
        Row: {
          base_salary: number | null
          bonuses: number | null
          created_at: string
          deductions: number | null
          employee_id: string
          id: string
          loan_deductions: number | null
          net_pay: number | null
          organization_id: string | null
          overtime_pay: number | null
          payment_date: string | null
          payment_reference: string | null
          payroll_run_id: string
          status: string
          tax_amount: number | null
        }
        Insert: {
          base_salary?: number | null
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id: string
          id?: string
          loan_deductions?: number | null
          net_pay?: number | null
          organization_id?: string | null
          overtime_pay?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payroll_run_id: string
          status?: string
          tax_amount?: number | null
        }
        Update: {
          base_salary?: number | null
          bonuses?: number | null
          created_at?: string
          deductions?: number | null
          employee_id?: string
          id?: string
          loan_deductions?: number | null
          net_pay?: number | null
          organization_id?: string | null
          overtime_pay?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payroll_run_id?: string
          status?: string
          tax_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          allowances: Json | null
          basic_salary: number
          bonus: number | null
          created_at: string | null
          created_by: string | null
          deductions: Json | null
          employee_id: string
          gross_salary: number | null
          id: string
          net_salary: number | null
          organization_id: string | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_rate: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          pf_deduction: number | null
          tax_deduction: number | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary?: number
          bonus?: number | null
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          employee_id: string
          gross_salary?: number | null
          id?: string
          net_salary?: number | null
          organization_id?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end: string
          pay_period_start: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pf_deduction?: number | null
          tax_deduction?: number | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number
          bonus?: number | null
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          employee_id?: string
          gross_salary?: number | null
          id?: string
          net_salary?: number | null
          organization_id?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pf_deduction?: number | null
          tax_deduction?: number | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          organization_id: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          processed_by: string | null
          run_name: string
          status: string
          total_amount: number | null
          total_employees: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          processed_by?: string | null
          run_name: string
          status?: string
          total_amount?: number | null
          total_employees?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          run_name?: string
          status?: string
          total_amount?: number | null
          total_employees?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_improvement_plans: {
        Row: {
          created_at: string
          created_by: string
          employee_id: string
          end_date: string
          final_outcome: string | null
          final_outcome_date: string | null
          hr_representative_id: string | null
          id: string
          manager_id: string
          organization_id: string | null
          reason: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          employee_id: string
          end_date: string
          final_outcome?: string | null
          final_outcome_date?: string | null
          hr_representative_id?: string | null
          id?: string
          manager_id: string
          organization_id?: string | null
          reason: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          employee_id?: string
          end_date?: string
          final_outcome?: string | null
          final_outcome_date?: string | null
          hr_representative_id?: string | null
          id?: string
          manager_id?: string
          organization_id?: string | null
          reason?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_improvement_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_hr_representative_id_fkey"
            columns: ["hr_representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          priority: string | null
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pip_check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          created_by: string
          employee_notes: string | null
          id: string
          manager_notes: string | null
          next_steps: string | null
          organization_id: string | null
          overall_progress: string | null
          pip_id: string
          updated_at: string
        }
        Insert: {
          check_in_date: string
          created_at?: string
          created_by: string
          employee_notes?: string | null
          id?: string
          manager_notes?: string | null
          next_steps?: string | null
          organization_id?: string | null
          overall_progress?: string | null
          pip_id: string
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          created_by?: string
          employee_notes?: string | null
          id?: string
          manager_notes?: string | null
          next_steps?: string | null
          organization_id?: string | null
          overall_progress?: string | null
          pip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pip_check_ins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pip_check_ins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pip_check_ins_pip_id_fkey"
            columns: ["pip_id"]
            isOneToOne: false
            referencedRelation: "performance_improvement_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pip_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          pip_id: string
          progress_notes: string | null
          status: string
          success_criteria: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          pip_id: string
          progress_notes?: string | null
          status?: string
          success_criteria: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          pip_id?: string
          progress_notes?: string | null
          status?: string
          success_criteria?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pip_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pip_goals_pip_id_fkey"
            columns: ["pip_id"]
            isOneToOne: false
            referencedRelation: "performance_improvement_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          starts_at: string | null
          target_audience: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          target_audience?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          target_audience?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          kb_article_ids: string[] | null
          name: string
          organization_id: string | null
          steps: Json | null
          template_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          kb_article_ids?: string[] | null
          name: string
          organization_id?: string | null
          steps?: Json | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          kb_article_ids?: string[] | null
          name?: string
          organization_id?: string | null
          steps?: Json | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbooks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          employee_id: string | null
          id: string
          organization_id: string | null
          policy_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          employee_id?: string | null
          id?: string
          organization_id?: string | null
          policy_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          employee_id?: string | null
          id?: string
          organization_id?: string | null
          policy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "handbook_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_objectives: {
        Row: {
          alignment_score: number | null
          created_at: string | null
          id: string
          notes: string | null
          objective_id: string
          organization_id: string | null
          portfolio_id: string
          updated_at: string | null
        }
        Insert: {
          alignment_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          objective_id: string
          organization_id?: string | null
          portfolio_id: string
          updated_at?: string | null
        }
        Update: {
          alignment_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          objective_id?: string
          organization_id?: string | null
          portfolio_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_objectives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_objectives_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          nps_score: number | null
          organization_id: string | null
          owner_id: string | null
          risk_level: string | null
          schedule_health: string | null
          spent_budget: number | null
          start_date: string | null
          status: string
          strategic_alignment_score: number | null
          strategic_goals: Json | null
          target_end_date: string | null
          target_roi: number | null
          template_config: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          nps_score?: number | null
          organization_id?: string | null
          owner_id?: string | null
          risk_level?: string | null
          schedule_health?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          strategic_alignment_score?: number | null
          strategic_goals?: Json | null
          target_end_date?: string | null
          target_roi?: number | null
          template_config?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          nps_score?: number | null
          organization_id?: string | null
          owner_id?: string | null
          risk_level?: string | null
          schedule_health?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          strategic_alignment_score?: number | null
          strategic_goals?: Json | null
          target_end_date?: string | null
          target_roi?: number | null
          template_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      probations: {
        Row: {
          created_at: string | null
          employee_id: string | null
          end_date: string
          extension_reason: string | null
          feedback: string | null
          id: string
          manager_id: string | null
          organization_id: string | null
          performance_score: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          end_date: string
          extension_reason?: string | null
          feedback?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          performance_score?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          end_date?: string
          extension_reason?: string | null
          feedback?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          performance_score?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "probations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "probations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "probations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          can_approve_leaves: boolean | null
          can_approve_timesheets: boolean | null
          can_assign_tasks: boolean | null
          created_at: string
          custom_role_id: string | null
          data_visibility_scope: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          deactivation_reason: string | null
          department: string | null
          department_id: string | null
          email: string
          employee_id: string | null
          end_date: string | null
          full_name: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          reactivated_at: string | null
          reactivated_by: string | null
          reporting_manager_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          start_date: string | null
          total_coins: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          can_approve_leaves?: boolean | null
          can_approve_timesheets?: boolean | null
          can_assign_tasks?: boolean | null
          created_at?: string
          custom_role_id?: string | null
          data_visibility_scope?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          department?: string | null
          department_id?: string | null
          email: string
          employee_id?: string | null
          end_date?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          reactivated_at?: string | null
          reactivated_by?: string | null
          reporting_manager_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string | null
          total_coins?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          can_approve_leaves?: boolean | null
          can_approve_timesheets?: boolean | null
          can_assign_tasks?: boolean | null
          created_at?: string
          custom_role_id?: string | null
          data_visibility_scope?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          department?: string | null
          department_id?: string | null
          email?: string
          employee_id?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          reactivated_at?: string | null
          reactivated_by?: string | null
          reporting_manager_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string | null
          total_coins?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_reactivated_by_fkey"
            columns: ["reactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          health_score: number | null
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          portfolio_id: string | null
          program_type: string | null
          spent_budget: number | null
          start_date: string | null
          status: string
          target_end_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          health_score?: number | null
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
          program_type?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          health_score?: number | null
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
          program_type?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      project_baselines: {
        Row: {
          baseline_date: string
          budget_snapshot: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_current: boolean | null
          name: string
          organization_id: string | null
          project_id: string
          schedule_snapshot: Json | null
          task_snapshots: Json | null
          updated_at: string
        }
        Insert: {
          baseline_date?: string
          budget_snapshot?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_current?: boolean | null
          name: string
          organization_id?: string | null
          project_id: string
          schedule_snapshot?: Json | null
          task_snapshots?: Json | null
          updated_at?: string
        }
        Update: {
          baseline_date?: string
          budget_snapshot?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_current?: boolean | null
          name?: string
          organization_id?: string | null
          project_id?: string
          schedule_snapshot?: Json | null
          task_snapshots?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_baselines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_baselines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_baselines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_compliance_status: {
        Row: {
          checkpoint_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          evidence_urls: string[] | null
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string
          status: string
          updated_at: string | null
          waiver_approved_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          checkpoint_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id: string
          status?: string
          updated_at?: string | null
          waiver_approved_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          checkpoint_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string
          status?: string
          updated_at?: string | null
          waiver_approved_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_compliance_status_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "compliance_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_status_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_status_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_compliance_status_waiver_approved_by_fkey"
            columns: ["waiver_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_cost_items: {
        Row: {
          amount: number
          category: string | null
          cost_type: string
          created_at: string | null
          created_by: string | null
          date_incurred: string
          description: string
          id: string
          is_forecast: boolean | null
          organization_id: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          cost_type: string
          created_at?: string | null
          created_by?: string | null
          date_incurred: string
          description: string
          id?: string
          is_forecast?: boolean | null
          organization_id?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          cost_type?: string
          created_at?: string | null
          created_by?: string | null
          date_incurred?: string
          description?: string
          id?: string
          is_forecast?: boolean | null
          organization_id?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_cost_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_cost_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_cost_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_issues: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string
          status: string
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_issues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_issues_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          organization_id: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_objectives: {
        Row: {
          contribution_weight: number | null
          created_at: string | null
          id: string
          notes: string | null
          objective_id: string
          organization_id: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          contribution_weight?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          objective_id: string
          organization_id?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          contribution_weight?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          objective_id?: string
          organization_id?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_objectives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_objectives_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_revenue_items: {
        Row: {
          amount: number
          billing_date: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          invoice_number: string | null
          organization_id: string | null
          project_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_date: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          invoice_number?: string | null
          organization_id?: string | null
          project_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_date?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          invoice_number?: string | null
          organization_id?: string | null
          project_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_revenue_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_revenue_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_revenue_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          identified_date: string | null
          impact: string
          mitigation_plan: string | null
          organization_id: string | null
          owner_id: string | null
          probability: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          identified_date?: string | null
          impact?: string
          mitigation_plan?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          identified_date?: string | null
          impact?: string
          mitigation_plan?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_role_allocations: {
        Row: {
          allocated_hours: number
          allocation_type: string
          assigned_user_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string
          role_id: string
          updated_at: string | null
          week_start: string
        }
        Insert: {
          allocated_hours?: number
          allocation_type?: string
          assigned_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id: string
          role_id: string
          updated_at?: string | null
          week_start: string
        }
        Update: {
          allocated_hours?: number
          allocation_type?: string
          assigned_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string
          role_id?: string
          updated_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_role_allocations_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_allocations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_allocations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "resource_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_role_requirements: {
        Row: {
          assigned_profile_id: string | null
          created_at: string
          id: string
          min_proficiency: number | null
          organization_id: string | null
          project_id: string
          required_hours: number | null
          role_name: string
          skill_id: string | null
        }
        Insert: {
          assigned_profile_id?: string | null
          created_at?: string
          id?: string
          min_proficiency?: number | null
          organization_id?: string | null
          project_id: string
          required_hours?: number | null
          role_name: string
          skill_id?: string | null
        }
        Update: {
          assigned_profile_id?: string | null
          created_at?: string
          id?: string
          min_proficiency?: number | null
          organization_id?: string | null
          project_id?: string
          required_hours?: number | null
          role_name?: string
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_role_requirements_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_requirements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_role_requirements_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      project_scores: {
        Row: {
          calculated_at: string
          calculated_by: string | null
          created_at: string
          criteria_scores: Json | null
          id: string
          notes: string | null
          organization_id: string | null
          project_id: string
          scoring_model_id: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          calculated_by?: string | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id: string
          scoring_model_id: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          calculated_by?: string | null
          created_at?: string
          criteria_scores?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          project_id?: string
          scoring_model_id?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_scores_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_scores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_scores_scoring_model_id_fkey"
            columns: ["scoring_model_id"]
            isOneToOne: false
            referencedRelation: "scoring_models"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          default_dependencies: Json | null
          default_roles: Json | null
          default_tasks: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          default_dependencies?: Json | null
          default_roles?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          default_dependencies?: Json | null
          default_roles?: Json | null
          default_tasks?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_important: boolean | null
          mentions: string[] | null
          metadata: Json | null
          organization_id: string | null
          project_id: string | null
          task_id: string | null
          update_type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_important?: boolean | null
          mentions?: string[] | null
          metadata?: Json | null
          organization_id?: string | null
          project_id?: string | null
          task_id?: string | null
          update_type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_important?: boolean | null
          mentions?: string[] | null
          metadata?: Json | null
          organization_id?: string | null
          project_id?: string | null
          task_id?: string | null
          update_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end_date: string | null
          billing_model: string | null
          budget: number | null
          business_case: string | null
          capex_budget: number | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          health_reason: string | null
          health_status: string | null
          id: string
          kpis: Json | null
          name: string
          objective_id: string | null
          opex_budget: number | null
          organization_id: string | null
          priority: string | null
          program_id: string | null
          project_number: string | null
          spent_budget: number | null
          sponsor_id: string | null
          stage: string | null
          start_date: string | null
          status: string | null
          target_end_date: string | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          billing_model?: string | null
          budget?: number | null
          business_case?: string | null
          capex_budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          health_reason?: string | null
          health_status?: string | null
          id?: string
          kpis?: Json | null
          name: string
          objective_id?: string | null
          opex_budget?: number | null
          organization_id?: string | null
          priority?: string | null
          program_id?: string | null
          project_number?: string | null
          spent_budget?: number | null
          sponsor_id?: string | null
          stage?: string | null
          start_date?: string | null
          status?: string | null
          target_end_date?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          billing_model?: string | null
          budget?: number | null
          business_case?: string | null
          capex_budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          health_reason?: string | null
          health_status?: string | null
          id?: string
          kpis?: Json | null
          name?: string
          objective_id?: string | null
          opex_budget?: number | null
          organization_id?: string | null
          priority?: string | null
          program_id?: string | null
          project_number?: string | null
          spent_budget?: number | null
          sponsor_id?: string | null
          stage?: string | null
          start_date?: string | null
          status?: string | null
          target_end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_responses: {
        Row: {
          id: string
          organization_id: string | null
          responses: Json
          sentiment_score: number | null
          submitted_at: string
          survey_id: string
          user_id: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          responses?: Json
          sentiment_score?: number | null
          submitted_at?: string
          survey_id: string
          user_id: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          responses?: Json
          sentiment_score?: number | null
          submitted_at?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "pulse_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          questions: Json
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          questions?: Json
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          questions?: Json
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string | null
          id: string
          is_completed: boolean | null
          is_pinned: boolean | null
          organization_id: string | null
          reminder_at: string | null
          task_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          organization_id?: string | null
          reminder_at?: string | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_pinned?: boolean | null
          organization_id?: string | null
          reminder_at?: string | null
          task_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_created: string | null
          next_occurrence: string | null
          organization_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_created?: string | null
          next_occurrence?: string | null
          organization_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_created?: string | null
          next_occurrence?: string | null
          organization_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_tracking: {
        Row: {
          created_at: string
          feedback_response_id: string
          id: string
          referee_email: string | null
          referee_name: string
          referee_signed_up: boolean | null
          referrer_email: string
          referrer_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_response_id: string
          id?: string
          referee_email?: string | null
          referee_name: string
          referee_signed_up?: boolean | null
          referrer_email: string
          referrer_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_response_id?: string
          id?: string
          referee_email?: string | null
          referee_name?: string
          referee_signed_up?: boolean | null
          referrer_email?: string
          referrer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_feedback_response_id_fkey"
            columns: ["feedback_response_id"]
            isOneToOne: false
            referencedRelation: "feedback_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_policies: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          eligibility_criteria: string | null
          equipment_allowance: number | null
          id: string
          is_active: boolean | null
          max_wfh_days: number | null
          name: string
          organization_id: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          equipment_allowance?: number | null
          id?: string
          is_active?: boolean | null
          max_wfh_days?: number | null
          name: string
          organization_id: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          equipment_allowance?: number | null
          id?: string
          is_active?: boolean | null
          max_wfh_days?: number | null
          name?: string
          organization_id?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reporting_structure: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          manager_id: string | null
          organization_id: string | null
          relationship_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          relationship_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          manager_id?: string | null
          organization_id?: string | null
          relationship_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporting_structure_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_structure_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_structure_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_structure_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_routing_rules: {
        Row: {
          assign_to_team: string | null
          assign_to_user_id: string | null
          condition_field: string
          condition_operator: string
          condition_value: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          priority_override: string | null
          request_type_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          assign_to_team?: string | null
          assign_to_user_id?: string | null
          condition_field: string
          condition_operator?: string
          condition_value: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          priority_override?: string | null
          request_type_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          assign_to_team?: string | null
          assign_to_user_id?: string | null
          condition_field?: string
          condition_operator?: string
          condition_value?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          priority_override?: string | null
          request_type_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_routing_rules_assign_to_user_id_fkey"
            columns: ["assign_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_routing_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_routing_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_routing_rules_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
        ]
      }
      request_types: {
        Row: {
          auto_route_rules: Json | null
          color: string | null
          created_at: string
          created_by: string | null
          default_assignee_id: string | null
          default_priority: string | null
          description: string | null
          form_fields: Json | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          requires_approval: boolean | null
          sla_resolution_hours: number | null
          sla_response_hours: number | null
        }
        Insert: {
          auto_route_rules?: Json | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          default_assignee_id?: string | null
          default_priority?: string | null
          description?: string | null
          form_fields?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          requires_approval?: boolean | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
        }
        Update: {
          auto_route_rules?: Json | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          default_assignee_id?: string | null
          default_priority?: string | null
          description?: string | null
          form_fields?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          requires_approval?: boolean | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "request_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_types_default_assignee_id_fkey"
            columns: ["default_assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_roles: {
        Row: {
          created_at: string | null
          description: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          skill_requirements: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          skill_requirements?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          skill_requirements?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analyses: {
        Row: {
          ai_match_score: number | null
          candidate_email: string | null
          candidate_name: string | null
          created_at: string | null
          document_url: string | null
          education: Json | null
          experience_summary: string | null
          experience_years: number | null
          extracted_skills: string[] | null
          id: string
          interview_questions: Json | null
          job_fit_analysis: Json | null
          organization_id: string | null
          recommendations: Json | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_match_score?: number | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string | null
          document_url?: string | null
          education?: Json | null
          experience_summary?: string | null
          experience_years?: number | null
          extracted_skills?: string[] | null
          id?: string
          interview_questions?: Json | null
          job_fit_analysis?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_match_score?: number | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string | null
          document_url?: string | null
          education?: Json | null
          experience_summary?: string | null
          experience_years?: number | null
          extracted_skills?: string[] | null
          id?: string
          interview_questions?: Json | null
          job_fit_analysis?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_analyses_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessment_date: string
          assessor_id: string
          budget_risk: number
          created_at: string
          id: string
          mitigation_notes: string | null
          organization_id: string | null
          overall_risk_score: number | null
          project_id: string
          quality_risk: number
          resource_risk: number
          risk_trend: string | null
          schedule_risk: number
          scope_risk: number
        }
        Insert: {
          assessment_date?: string
          assessor_id: string
          budget_risk?: number
          created_at?: string
          id?: string
          mitigation_notes?: string | null
          organization_id?: string | null
          overall_risk_score?: number | null
          project_id: string
          quality_risk?: number
          resource_risk?: number
          risk_trend?: string | null
          schedule_risk?: number
          scope_risk?: number
        }
        Update: {
          assessment_date?: string
          assessor_id?: string
          budget_risk?: number
          created_at?: string
          id?: string
          mitigation_notes?: string | null
          organization_id?: string | null
          overall_risk_score?: number | null
          project_id?: string
          quality_risk?: number
          resource_risk?: number
          risk_trend?: string | null
          schedule_risk?: number
          scope_risk?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_approve: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_export: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          module_name: string
          organization_id: string | null
          role_id: string | null
          visibility_scope: string | null
        }
        Insert: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module_name: string
          organization_id?: string | null
          role_id?: string | null
          visibility_scope?: string | null
        }
        Update: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module_name?: string
          organization_id?: string | null
          role_id?: string | null
          visibility_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_benchmarks: {
        Row: {
          created_at: string | null
          id: string
          industry: string
          internal_avg: number | null
          last_updated: string | null
          market_25: number | null
          market_50: number | null
          market_75: number | null
          organization_id: string | null
          region: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry: string
          internal_avg?: number | null
          last_updated?: string | null
          market_25?: number | null
          market_50?: number | null
          market_75?: number | null
          organization_id?: string | null
          region: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string
          internal_avg?: number | null
          last_updated?: string | null
          market_25?: number | null
          market_50?: number | null
          market_75?: number | null
          organization_id?: string | null
          region?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_benchmarks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_revisions: {
        Row: {
          approved_by: string | null
          created_at: string | null
          effective_date: string
          employee_id: string | null
          id: string
          new_salary: number
          organization_id: string | null
          previous_salary: number
          remarks: string | null
          revision_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          effective_date: string
          employee_id?: string | null
          id?: string
          new_salary: number
          organization_id?: string | null
          previous_salary: number
          remarks?: string | null
          revision_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          effective_date?: string
          employee_id?: string | null
          id?: string
          new_salary?: number
          organization_id?: string | null
          previous_salary?: number
          remarks?: string | null
          revision_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_revisions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_revisions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_revisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_templates: {
        Row: {
          allowances: Json | null
          basic_salary: number
          created_at: string | null
          created_by: string | null
          deductions: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary: number
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          created_by?: string | null
          deductions?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_models: {
        Row: {
          created_at: string
          created_by: string | null
          criteria: Json | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scoring_models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scratch_card_inventory: {
        Row: {
          card_type: Database["public"]["Enums"]["card_type_enum"]
          created_at: string
          id: string
          remaining_count: number
          total_count: number
          updated_at: string
          value_max: number
          value_min: number
        }
        Insert: {
          card_type: Database["public"]["Enums"]["card_type_enum"]
          created_at?: string
          id?: string
          remaining_count: number
          total_count: number
          updated_at?: string
          value_max: number
          value_min: number
        }
        Update: {
          card_type?: Database["public"]["Enums"]["card_type_enum"]
          created_at?: string
          id?: string
          remaining_count?: number
          total_count?: number
          updated_at?: string
          value_max?: number
          value_min?: number
        }
        Relationships: []
      }
      scratch_cards: {
        Row: {
          card_code: string | null
          card_type: Database["public"]["Enums"]["card_type_enum"]
          card_value: number
          claim_date: string | null
          created_at: string
          expiry_date: string
          feedback_response_id: string
          id: string
          is_claimed: boolean | null
          is_scratched: boolean | null
          scratch_date: string | null
          screenshot_urls: string[] | null
          updated_at: string
          user_email: string
          user_name: string
          user_phone: string | null
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status_enum"]
          verified_at: string | null
          verified_by: string | null
          whatsapp_submission_date: string | null
        }
        Insert: {
          card_code?: string | null
          card_type: Database["public"]["Enums"]["card_type_enum"]
          card_value: number
          claim_date?: string | null
          created_at?: string
          expiry_date?: string
          feedback_response_id: string
          id?: string
          is_claimed?: boolean | null
          is_scratched?: boolean | null
          scratch_date?: string | null
          screenshot_urls?: string[] | null
          updated_at?: string
          user_email: string
          user_name: string
          user_phone?: string | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status_enum"]
          verified_at?: string | null
          verified_by?: string | null
          whatsapp_submission_date?: string | null
        }
        Update: {
          card_code?: string | null
          card_type?: Database["public"]["Enums"]["card_type_enum"]
          card_value?: number
          claim_date?: string | null
          created_at?: string
          expiry_date?: string
          feedback_response_id?: string
          id?: string
          is_claimed?: boolean | null
          is_scratched?: boolean | null
          scratch_date?: string | null
          screenshot_urls?: string[] | null
          updated_at?: string
          user_email?: string
          user_name?: string
          user_phone?: string | null
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status_enum"]
          verified_at?: string | null
          verified_by?: string | null
          whatsapp_submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scratch_cards_feedback_response_id_fkey"
            columns: ["feedback_response_id"]
            isOneToOne: false
            referencedRelation: "feedback_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          is_acknowledged: boolean | null
          metadata: Json | null
          organization_id: string | null
          profile_id: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          profile_id?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          profile_id?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_alerts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tickets: {
        Row: {
          assignee_id: string | null
          category: string | null
          closed_at: string | null
          created_at: string | null
          description: string | null
          first_response_at: string | null
          id: string
          is_major_incident: boolean | null
          knowledge_article_id: string | null
          organization_id: string | null
          priority: string
          requester_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          root_cause: string | null
          satisfaction_rating: number | null
          sla_resolution_due: string | null
          sla_response_due: string | null
          sla_rule_id: string | null
          status: string
          subcategory: string | null
          ticket_number: string
          ticket_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          is_major_incident?: boolean | null
          knowledge_article_id?: string | null
          organization_id?: string | null
          priority?: string
          requester_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          satisfaction_rating?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          sla_rule_id?: string | null
          status?: string
          subcategory?: string | null
          ticket_number: string
          ticket_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          first_response_at?: string | null
          id?: string
          is_major_incident?: boolean | null
          knowledge_article_id?: string | null
          organization_id?: string | null
          priority?: string
          requester_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          satisfaction_rating?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          sla_rule_id?: string | null
          status?: string
          subcategory?: string | null
          ticket_number?: string
          ticket_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_knowledge_article_id_fkey"
            columns: ["knowledge_article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_sla_rule_id_fkey"
            columns: ["sla_rule_id"]
            isOneToOne: false
            referencedRelation: "sla_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          closure_note: string | null
          closure_type: string | null
          created_at: string
          id: string
          last_heartbeat: string | null
          login_time: string
          logout_time: string | null
          organization_id: string | null
          session_duration_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          closure_note?: string | null
          closure_type?: string | null
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          login_time?: string
          logout_time?: string | null
          organization_id?: string | null
          session_duration_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          closure_note?: string | null
          closure_type?: string | null
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          login_time?: string
          logout_time?: string | null
          organization_id?: string | null
          session_duration_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_schedules: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string
          created_by: string | null
          employee_id: string | null
          id: string
          notes: string | null
          organization_id: string | null
          schedule_date: string
          shift_type_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          schedule_date: string
          shift_type_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          schedule_date?: string
          shift_type_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_shift_type_id_fkey"
            columns: ["shift_type_id"]
            isOneToOne: false
            referencedRelation: "shift_types"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swap_requests: {
        Row: {
          created_at: string
          id: string
          manager_approved_by: string | null
          manager_response: string | null
          organization_id: string | null
          requester_id: string | null
          requester_reason: string | null
          requester_schedule_id: string | null
          status: string
          target_employee_id: string | null
          target_response: string | null
          target_schedule_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_approved_by?: string | null
          manager_response?: string | null
          organization_id?: string | null
          requester_id?: string | null
          requester_reason?: string | null
          requester_schedule_id?: string | null
          status?: string
          target_employee_id?: string | null
          target_response?: string | null
          target_schedule_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_approved_by?: string | null
          manager_response?: string | null
          organization_id?: string | null
          requester_id?: string | null
          requester_reason?: string | null
          requester_schedule_id?: string | null
          status?: string
          target_employee_id?: string | null
          target_response?: string | null
          target_schedule_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_swap_requests_manager_approved_by_fkey"
            columns: ["manager_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_requester_schedule_id_fkey"
            columns: ["requester_schedule_id"]
            isOneToOne: false
            referencedRelation: "shift_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_employee_id_fkey"
            columns: ["target_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swap_requests_target_schedule_id_fkey"
            columns: ["target_schedule_id"]
            isOneToOne: false
            referencedRelation: "shift_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_swaps: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          organization_id: string
          original_shift: string
          reason: string | null
          requested_shift: string
          requester_id: string
          status: string | null
          swap_date: string | null
          target_id: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          organization_id: string
          original_shift: string
          reason?: string | null
          requested_shift: string
          requester_id: string
          status?: string | null
          swap_date?: string | null
          target_id: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string
          original_shift?: string
          reason?: string | null
          requested_shift?: string
          requester_id?: string
          status?: string | null
          swap_date?: string | null
          target_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_swaps_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_swaps_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_types: {
        Row: {
          color: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_breaches: {
        Row: {
          breach_duration_minutes: number | null
          breach_type: string
          breached_at: string
          created_at: string
          expected_at: string
          id: string
          notified: boolean | null
          notified_at: string | null
          organization_id: string | null
          request_id: string
        }
        Insert: {
          breach_duration_minutes?: number | null
          breach_type: string
          breached_at?: string
          created_at?: string
          expected_at: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          organization_id?: string | null
          request_id: string
        }
        Update: {
          breach_duration_minutes?: number | null
          breach_type?: string
          breached_at?: string
          created_at?: string
          expected_at?: string
          id?: string
          notified?: boolean | null
          notified_at?: string | null
          organization_id?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_breaches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_breaches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "work_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          priority: string
          resolution_hours: number
          response_hours: number
          ticket_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          priority: string
          resolution_hours?: number
          response_hours?: number
          ticket_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          priority?: string
          resolution_hours?: number
          response_hours?: number
          ticket_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          completed_story_points: number | null
          created_at: string | null
          created_by: string | null
          end_date: string
          goal: string | null
          id: string
          name: string
          organization_id: string
          project_id: string | null
          start_date: string
          status: string | null
          total_story_points: number | null
          updated_at: string | null
          velocity: number | null
        }
        Insert: {
          completed_story_points?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          goal?: string | null
          id?: string
          name: string
          organization_id: string
          project_id?: string | null
          start_date: string
          status?: string | null
          total_story_points?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Update: {
          completed_story_points?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          goal?: string | null
          id?: string
          name?: string
          organization_id?: string
          project_id?: string | null
          start_date?: string
          status?: string | null
          total_story_points?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_plan: string | null
          organization_id: string | null
          previous_plan: string | null
          reason: string | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_plan?: string | null
          organization_id?: string | null
          previous_plan?: string | null
          reason?: string | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_plan?: string | null
          organization_id?: string | null
          previous_plan?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_metrics: {
        Row: {
          active_subscriptions: number | null
          arr: number | null
          churned_subscriptions: number | null
          created_at: string | null
          id: string
          mrr: number | null
          new_subscriptions: number | null
          organization_id: string | null
          recorded_at: string | null
          trial_conversions: number | null
        }
        Insert: {
          active_subscriptions?: number | null
          arr?: number | null
          churned_subscriptions?: number | null
          created_at?: string | null
          id?: string
          mrr?: number | null
          new_subscriptions?: number | null
          organization_id?: string | null
          recorded_at?: string | null
          trial_conversions?: number | null
        }
        Update: {
          active_subscriptions?: number | null
          arr?: number | null
          churned_subscriptions?: number | null
          created_at?: string | null
          id?: string
          mrr?: number | null
          new_subscriptions?: number | null
          organization_id?: string | null
          recorded_at?: string | null
          trial_conversions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: Database["public"]["Enums"]["subscription_plan_type"]
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_users: number
          name: string
          price_monthly: number
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["subscription_plan_type"]
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_users?: number
          name: string
          price_monthly?: number
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["subscription_plan_type"]
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_users?: number
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      succession_candidates: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          development_areas: string[] | null
          id: string
          organization_id: string | null
          readiness: string | null
          readiness_score: number | null
          succession_plan_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          development_areas?: string[] | null
          id?: string
          organization_id?: string | null
          readiness?: string | null
          readiness_score?: number | null
          succession_plan_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          development_areas?: string[] | null
          id?: string
          organization_id?: string | null
          readiness?: string | null
          readiness_score?: number | null
          succession_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "succession_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_candidates_succession_plan_id_fkey"
            columns: ["succession_plan_id"]
            isOneToOne: false
            referencedRelation: "succession_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      succession_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_holder_id: string | null
          department: string | null
          id: string
          notes: string | null
          organization_id: string | null
          position: string
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_holder_id?: string | null
          department?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          position: string
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_holder_id?: string | null
          department?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          position?: string
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "succession_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_plans_current_holder_id_fkey"
            columns: ["current_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "succession_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_audit_log: {
        Row: {
          action: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "super_admin_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_baseline_snapshots: {
        Row: {
          baseline_id: string
          created_at: string
          estimated_hours: number | null
          id: string
          organization_id: string | null
          planned_end_date: string | null
          planned_start_date: string | null
          task_id: string
        }
        Insert: {
          baseline_id: string
          created_at?: string
          estimated_hours?: number | null
          id?: string
          organization_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          task_id: string
        }
        Update: {
          baseline_id?: string
          created_at?: string
          estimated_hours?: number | null
          id?: string
          organization_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_baseline_snapshots_baseline_id_fkey"
            columns: ["baseline_id"]
            isOneToOne: false
            referencedRelation: "project_baselines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_baseline_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_baseline_snapshots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklists: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          organization_id: string | null
          position: number | null
          task_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          organization_id?: string | null
          position?: number | null
          task_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          organization_id?: string | null
          position?: number | null
          task_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checklists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checklists_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          organization_id: string | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          organization_id?: string | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          organization_id?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          created_by: string | null
          dependency_type: string
          id: string
          lag_days: number | null
          organization_id: string | null
          predecessor_id: string
          successor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number | null
          organization_id?: string | null
          predecessor_id: string
          successor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dependency_type?: string
          id?: string
          lag_days?: number | null
          organization_id?: string | null
          predecessor_id?: string
          successor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_successor_id_fkey"
            columns: ["successor_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_recurrence_rules: {
        Row: {
          created_at: string | null
          day_of_month: number | null
          days_of_week: number[] | null
          end_date: string | null
          frequency: string
          id: string
          interval_value: number | null
          is_active: boolean | null
          next_occurrence: string | null
          organization_id: string | null
          task_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_month?: number | null
          days_of_week?: number[] | null
          end_date?: string | null
          frequency: string
          id?: string
          interval_value?: number | null
          is_active?: boolean | null
          next_occurrence?: string | null
          organization_id?: string | null
          task_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_month?: number | null
          days_of_week?: number[] | null
          end_date?: string | null
          frequency?: string
          id?: string
          interval_value?: number | null
          is_active?: boolean | null
          next_occurrence?: string | null
          organization_id?: string | null
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_recurrence_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_recurrence_rules_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          tasks: Json | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          tasks?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          tasks?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_end_date: string | null
          actual_hours: number | null
          actual_start_date: string | null
          admin_feedback: string | null
          assigned_to: string | null
          completion_percentage: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          is_critical: boolean | null
          is_milestone: boolean | null
          is_subtask: boolean | null
          organization_id: string | null
          parent_task_id: string | null
          planned_end_date: string | null
          planned_start_date: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage: number | null
          project_id: string | null
          project_owner_id: string | null
          quiz_template_id: string | null
          slt_coin_value: number
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          submission_notes: string | null
          task_number: string | null
          task_type: string | null
          title: string
          updated_at: string
          visibility_scope: string | null
        }
        Insert: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          admin_feedback?: string | null
          assigned_to?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_critical?: boolean | null
          is_milestone?: boolean | null
          is_subtask?: boolean | null
          organization_id?: string | null
          parent_task_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          project_id?: string | null
          project_owner_id?: string | null
          quiz_template_id?: string | null
          slt_coin_value?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_notes?: string | null
          task_number?: string | null
          task_type?: string | null
          title: string
          updated_at?: string
          visibility_scope?: string | null
        }
        Update: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          admin_feedback?: string | null
          assigned_to?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_critical?: boolean | null
          is_milestone?: boolean | null
          is_subtask?: boolean | null
          organization_id?: string | null
          parent_task_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          project_id?: string | null
          project_owner_id?: string | null
          quiz_template_id?: string | null
          slt_coin_value?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_notes?: string | null
          task_number?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string
          visibility_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_owner_id_fkey"
            columns: ["project_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          organization_id: string | null
          rating: number
          request_id: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          organization_id?: string | null
          rating: number
          request_id: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          organization_id?: string | null
          rating?: number
          request_id?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_feedback_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "work_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_feedback_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_logs: {
        Row: {
          created_at: string
          date_logged: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          hours_worked: number
          id: string
          is_synced_to_timesheet: boolean | null
          log_type: string | null
          metadata: Json | null
          organization_id: string | null
          source: string | null
          source_id: string | null
          start_time: string | null
          task_id: string
          timesheet_entry_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_logged?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hours_worked: number
          id?: string
          is_synced_to_timesheet?: boolean | null
          log_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          source?: string | null
          source_id?: string | null
          start_time?: string | null
          task_id: string
          timesheet_entry_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_logged?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hours_worked?: number
          id?: string
          is_synced_to_timesheet?: boolean | null
          log_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          source?: string | null
          source_id?: string | null
          start_time?: string | null
          task_id?: string
          timesheet_entry_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_timesheet_entry_id_fkey"
            columns: ["timesheet_entry_id"]
            isOneToOne: false
            referencedRelation: "timesheet_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          billing_rate: number | null
          client_name: string | null
          cost_center: string | null
          created_at: string
          description: string | null
          hours_type: string | null
          id: string
          is_billable: boolean | null
          organization_id: string | null
          overtime_hours: number | null
          project_id: string | null
          regular_hours: number | null
          task_id: string | null
          timesheet_id: string
          work_date: string
        }
        Insert: {
          billing_rate?: number | null
          client_name?: string | null
          cost_center?: string | null
          created_at?: string
          description?: string | null
          hours_type?: string | null
          id?: string
          is_billable?: boolean | null
          organization_id?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          regular_hours?: number | null
          task_id?: string | null
          timesheet_id: string
          work_date: string
        }
        Update: {
          billing_rate?: number | null
          client_name?: string | null
          cost_center?: string | null
          created_at?: string
          description?: string | null
          hours_type?: string | null
          id?: string
          is_billable?: boolean | null
          organization_id?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          regular_hours?: number | null
          task_id?: string | null
          timesheet_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          organization_id: string | null
          overtime_hours: number | null
          period_end: string
          period_start: string
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          period_end: string
          period_start: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          period_end?: string
          period_start?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_assignments: {
        Row: {
          created_at: string
          created_by: string
          description: string
          due_days: number | null
          id: string
          instructions: string | null
          is_published: boolean
          max_points: number | null
          order_index: number
          organization_id: string | null
          section_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          due_days?: number | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          max_points?: number | null
          order_index?: number
          organization_id?: string | null
          section_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          due_days?: number | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          max_points?: number | null
          order_index?: number
          organization_id?: string | null
          section_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "training_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          assignment_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          organization_id: string | null
          progress_type: string
          progress_value: number | null
          section_id: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          progress_type: string
          progress_value?: number | null
          section_id?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          progress_type?: string
          progress_value?: number | null
          section_id?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "training_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "training_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sections: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_published: boolean
          order_index: number
          organization_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          organization_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          organization_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_video_progress: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          organization_id: string | null
          total_duration_seconds: number
          user_id: string
          video_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          organization_id?: string | null
          total_duration_seconds: number
          user_id: string
          video_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          organization_id?: string | null
          total_duration_seconds?: number
          user_id?: string
          video_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_video_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_videos: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          order_index: number
          organization_id: string | null
          section_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          order_index?: number
          organization_id?: string | null
          section_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          order_index?: number
          organization_id?: string | null
          section_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_videos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_videos_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "training_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          channel_id: string
          created_at: string
          expires_at: string
          id: string
          organization_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          activity_status: string | null
          created_at: string | null
          id: string
          is_online: boolean | null
          last_activity_at: string | null
          last_seen: string | null
          manual_status: string | null
          organization_id: string | null
          status: string | null
          status_message: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_status?: string | null
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_seen?: string | null
          manual_status?: string | null
          organization_id?: string | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_status?: string | null
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_seen?: string | null
          manual_status?: string | null
          organization_id?: string | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          delivered_at: string
          endpoint_id: string
          event_id: string
          id: string
          response_body: string | null
          retry_count: number
          status_code: number
          success: boolean
        }
        Insert: {
          delivered_at?: string
          endpoint_id: string
          event_id: string
          id?: string
          response_body?: string | null
          retry_count?: number
          status_code: number
          success?: boolean
        }
        Update: {
          delivered_at?: string
          endpoint_id?: string
          event_id?: string
          id?: string
          response_body?: string | null
          retry_count?: number
          status_code?: number
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          active: boolean
          created_at: string
          events: string[]
          id: string
          metadata: Json | null
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          metadata?: Json | null
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          metadata?: Json | null
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webrtc_signals: {
        Row: {
          call_id: string | null
          created_at: string | null
          id: number
          receiver_id: string | null
          sender_id: string | null
          signal_data: Json | null
          signal_type: string | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string | null
          id?: number
          receiver_id?: string | null
          sender_id?: string | null
          signal_data?: Json | null
          signal_type?: string | null
        }
        Update: {
          call_id?: string | null
          created_at?: string | null
          id?: number
          receiver_id?: string | null
          sender_id?: string | null
          signal_data?: Json | null
          signal_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webrtc_signals_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webrtc_signals_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wfh_policies: {
        Row: {
          advance_notice_days: number | null
          blackout_days: string[] | null
          created_at: string
          id: string
          is_active: boolean | null
          max_wfh_days_per_month: number | null
          organization_id: string | null
          require_approval: boolean | null
          updated_at: string
        }
        Insert: {
          advance_notice_days?: number | null
          blackout_days?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_wfh_days_per_month?: number | null
          organization_id?: string | null
          require_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          advance_notice_days?: number | null
          blackout_days?: string[] | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_wfh_days_per_month?: number | null
          organization_id?: string | null
          require_approval?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wfh_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wfh_requests: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          organization_id: string | null
          reason: string | null
          request_date: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          organization_id?: string | null
          reason?: string | null
          request_date: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          organization_id?: string | null
          reason?: string | null
          request_date?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wfh_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wfh_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wfh_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_requests: {
        Row: {
          approval_history: Json | null
          assigned_team: string | null
          assigned_to: string | null
          compliance_impact: boolean | null
          converted_to_project_id: string | null
          converted_to_task_id: string | null
          created_at: string
          csat_rating: number | null
          csat_submitted_at: string | null
          description: string | null
          draft_saved_at: string | null
          effort_score: number | null
          first_response_at: string | null
          form_data: Json | null
          id: string
          lifecycle_stage: string | null
          organization_id: string | null
          priority: string
          request_number: string
          request_type_id: string
          requester_id: string
          resolved_at: string | null
          risk_score: number | null
          sla_resolution_due: string | null
          sla_response_due: string | null
          status: string
          submitted_at: string | null
          title: string
          triage_notes: string | null
          triaged_at: string | null
          triaged_by: string | null
          updated_at: string
          value_score: number | null
        }
        Insert: {
          approval_history?: Json | null
          assigned_team?: string | null
          assigned_to?: string | null
          compliance_impact?: boolean | null
          converted_to_project_id?: string | null
          converted_to_task_id?: string | null
          created_at?: string
          csat_rating?: number | null
          csat_submitted_at?: string | null
          description?: string | null
          draft_saved_at?: string | null
          effort_score?: number | null
          first_response_at?: string | null
          form_data?: Json | null
          id?: string
          lifecycle_stage?: string | null
          organization_id?: string | null
          priority?: string
          request_number: string
          request_type_id: string
          requester_id: string
          resolved_at?: string | null
          risk_score?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          triage_notes?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
          value_score?: number | null
        }
        Update: {
          approval_history?: Json | null
          assigned_team?: string | null
          assigned_to?: string | null
          compliance_impact?: boolean | null
          converted_to_project_id?: string | null
          converted_to_task_id?: string | null
          created_at?: string
          csat_rating?: number | null
          csat_submitted_at?: string | null
          description?: string | null
          draft_saved_at?: string | null
          effort_score?: number | null
          first_response_at?: string | null
          form_data?: Json | null
          id?: string
          lifecycle_stage?: string | null
          organization_id?: string | null
          priority?: string
          request_number?: string
          request_type_id?: string
          requester_id?: string
          resolved_at?: string | null
          risk_score?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          triage_notes?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
          value_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_converted_to_project_id_fkey"
            columns: ["converted_to_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_converted_to_task_id_fkey"
            columns: ["converted_to_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_triaged_by_fkey"
            columns: ["triaged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workload_scenarios: {
        Row: {
          base_date: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_baseline: boolean | null
          name: string
          organization_id: string | null
          results: Json | null
          scenario_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          base_date?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_baseline?: boolean | null
          name: string
          organization_id?: string | null
          results?: Json | null
          scenario_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          base_date?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_baseline?: boolean | null
          name?: string
          organization_id?: string | null
          results?: Json | null
          scenario_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workload_scenarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workload_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      feedback_analytics: {
        Row: {
          avg_rating: number | null
          response_date: string | null
          total_responses: number | null
        }
        Relationships: []
      }
      scratch_card_stats: {
        Row: {
          card_type: Database["public"]["Enums"]["card_type_enum"] | null
          paid_value: number | null
          pending_count: number | null
          redeemed_value: number | null
          scratched_count: number | null
          total_issued: number | null
          total_value: number | null
          verified_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_routing_rules: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      calculate_kanban_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          category: string
          metric_date: string
          metric_name: string
          metric_value: number
        }[]
      }
      calculate_project_risk_score: {
        Args: { p_project_id: string }
        Returns: {
          overall_score: number
          resource_score: number
          risk_level: string
          schedule_score: number
          task_health_score: number
        }[]
      }
      calculate_project_score: {
        Args: { p_criteria_scores: Json; p_model_id: string }
        Returns: number
      }
      calculate_project_variance: {
        Args: { p_baseline_id?: string; p_project_id: string }
        Returns: {
          actual_hours: number
          baseline_end_date: string
          baseline_hours: number
          completion_rate: number
          current_end_date: string
          effort_variance: number
          effort_variance_pct: number
          schedule_variance_days: number
          tasks_ahead: number
          tasks_behind: number
          tasks_on_track: number
        }[]
      }
      calculate_task_critical_path: {
        Args: { p_project_id: string }
        Returns: {
          is_on_critical_path: boolean
          task_id: string
        }[]
      }
      calculate_workload_forecast: {
        Args: {
          p_organization_id: string
          p_scenario_adjustments?: Json
          p_weeks_ahead?: number
        }
        Returns: Json
      }
      can_org_add_user: { Args: { _org_id: string }; Returns: boolean }
      can_update_profile: {
        Args: { new_role: string; profile_id: string }
        Returns: boolean
      }
      check_and_log_daily_email: {
        Args: { p_email_type: string; p_user_id: string }
        Returns: boolean
      }
      check_module_permission: {
        Args: { p_action: string; p_module: string; p_user_id: string }
        Returns: boolean
      }
      check_sla_breaches: { Args: never; Returns: undefined }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_typing_indicators: { Args: never; Returns: undefined }
      create_direct_message_channel: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      create_project_baseline: {
        Args: { p_description?: string; p_name: string; p_project_id: string }
        Returns: string
      }
      detect_early_warnings: { Args: { p_org_id: string }; Returns: number }
      expire_old_scratch_cards: { Args: never; Returns: number }
      extract_video_duration: { Args: { video_url: string }; Returns: number }
      generate_scratch_card: {
        Args: {
          p_feedback_response_id: string
          p_user_email: string
          p_user_name: string
          p_user_phone?: string
        }
        Returns: {
          card_id: string
          card_type: Database["public"]["Enums"]["card_type_enum"]
          card_value: number
          message: string
        }[]
      }
      get_channel_display_name: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: string
      }
      get_chat_partner_name: {
        Args: { channel_id_param: string; current_user_id: string }
        Returns: {
          partner_avatar: string
          partner_name: string
          partner_role: string
        }[]
      }
      get_current_profile_id: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_direct_reports: { Args: { p_manager_id: string }; Returns: string[] }
      get_employee_workload: {
        Args: {
          p_end_date?: string
          p_profile_id: string
          p_start_date?: string
        }
        Returns: {
          capacity_hours: number
          task_count: number
          total_assigned_hours: number
          utilization_percentage: number
        }[]
      }
      get_leaderboard: {
        Args: { p_org_id: string; p_period?: string }
        Returns: {
          avatar_url: string
          full_name: string
          rank: number
          role: string
          tasks_completed: number
          total_coins: number
          user_id: string
        }[]
      }
      get_my_org_id: { Args: never; Returns: string }
      get_my_profile_id: { Args: never; Returns: string }
      get_org_user_count: { Args: { _org_id: string }; Returns: number }
      get_portfolio_ranking: {
        Args: { p_model_id?: string }
        Returns: {
          criteria_scores: Json
          project_id: string
          project_name: string
          project_status: string
          rank: number
          total_score: number
        }[]
      }
      get_public_coin_rates: {
        Args: never
        Returns: {
          change_percentage: number
          organization_id: string
          organization_name: string
          rate: number
          rate_date: string
        }[]
      }
      get_public_stats: { Args: never; Returns: Json }
      get_sla_metrics: {
        Args: { p_end_date?: string; p_org_id: string; p_start_date?: string }
        Returns: {
          avg_csat_rating: number
          avg_resolution_hours: number
          avg_response_hours: number
          resolution_sla_breached: number
          resolution_sla_met: number
          response_sla_breached: number
          response_sla_met: number
          total_requests: number
        }[]
      }
      get_team_members: {
        Args: { p_user_id: string }
        Returns: {
          member_id: string
        }[]
      }
      get_timesheet_summary: {
        Args: { p_timesheet_id: string }
        Returns: {
          billable_hours: number
          estimated_revenue: number
          non_billable_hours: number
          overtime_hours: number
          pto_hours: number
          regular_hours: number
          total_hours: number
          training_hours: number
        }[]
      }
      get_user_channel_ids: {
        Args: { p_profile_id: string }
        Returns: string[]
      }
      get_user_highest_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_org_id: { Args: { user_uuid: string }; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_productivity_metrics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          active_hours: number
          avg_task_duration: number
          idle_hours: number
          productivity_score: number
          task_completion_rate: number
          total_hours: number
        }[]
      }
      get_user_profile_id: { Args: never; Returns: string }
      get_visibility_scope: {
        Args: { p_module: string; p_user_id: string }
        Returns: string
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_user_coins: {
        Args: { p_coins: number; p_user_id: string }
        Returns: undefined
      }
      initialize_default_roles: {
        Args: { p_created_by?: string; p_org_id: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_any_admin: { Args: { p_user_id?: string }; Returns: boolean }
      is_channel_member: {
        Args: { p_channel_id: string; p_profile_id: string }
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { _org_id?: string }; Returns: boolean }
      is_same_org_admin: { Args: { target_org_id: string }; Returns: boolean }
      is_same_org_user: { Args: { target_org_id: string }; Returns: boolean }
      is_super_admin:
        | { Args: never; Returns: boolean }
        | { Args: { check_user_id: string }; Returns: boolean }
      mark_card_scratched: { Args: { p_card_id: string }; Returns: boolean }
      send_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      suggest_task_assignment: {
        Args: {
          p_end_date?: string
          p_min_proficiency?: number
          p_required_skill_id?: string
          p_start_date?: string
        }
        Returns: {
          available_hours: number
          current_utilization: number
          full_name: string
          match_score: number
          proficiency_level: number
          profile_id: string
        }[]
      }
      sync_lms_hours_to_timesheet: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: number
      }
      track_user_activity: {
        Args: {
          p_activity_type: string
          p_duration_minutes?: number
          p_metadata?: Json
          p_task_id?: string
          p_user_id: string
        }
        Returns: string
      }
      update_chat_user_status: {
        Args: { p_status: string; p_user_id: string }
        Returns: undefined
      }
      update_user_presence: {
        Args: {
          p_is_online?: boolean
          p_manual_status?: string
          p_status_message?: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_belongs_to_org: { Args: { _org_id: string }; Returns: boolean }
      verify_scratch_card: {
        Args: {
          p_card_id: string
          p_notes: string
          p_status: Database["public"]["Enums"]["verification_status_enum"]
          p_verified_by: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "intern"
        | "employee"
        | "super_admin"
        | "org_admin"
        | "manager"
        | "team_lead"
        | "hr_admin"
        | "project_manager"
        | "finance_manager"
      card_type_enum: "high_value" | "medium_value" | "better_luck"
      organization_status:
        | "active"
        | "suspended"
        | "pending"
        | "cancelled"
        | "trial"
      subscription_plan_type: "free" | "starter" | "professional" | "enterprise"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "assigned"
        | "in_progress"
        | "completed"
        | "verified"
        | "rejected"
      user_role: "admin" | "intern" | "super_admin" | "org_admin" | "employee"
      verification_status_enum: "pending" | "verified" | "rejected" | "expired"
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
      app_role: [
        "admin",
        "intern",
        "employee",
        "super_admin",
        "org_admin",
        "manager",
        "team_lead",
        "hr_admin",
        "project_manager",
        "finance_manager",
      ],
      card_type_enum: ["high_value", "medium_value", "better_luck"],
      organization_status: [
        "active",
        "suspended",
        "pending",
        "cancelled",
        "trial",
      ],
      subscription_plan_type: ["free", "starter", "professional", "enterprise"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "assigned",
        "in_progress",
        "completed",
        "verified",
        "rejected",
      ],
      user_role: ["admin", "intern", "super_admin", "org_admin", "employee"],
      verification_status_enum: ["pending", "verified", "rejected", "expired"],
    },
  },
} as const
