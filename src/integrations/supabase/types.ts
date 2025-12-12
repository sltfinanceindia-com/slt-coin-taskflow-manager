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
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          duration_minutes: number | null
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
          duration_minutes?: number | null
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
          duration_minutes?: number | null
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
          comment: string | null
          created_at: string
          id: string
          organization_id: string | null
          question_category: string
          question_text: string
          rating: number | null
          request_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          question_category: string
          question_text: string
          rating?: number | null
          request_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          question_category?: string
          question_text?: string
          rating?: number | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "feedback_requests"
            referencedColumns: ["id"]
          },
        ]
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
          billing_email: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          max_users: number
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          status: Database["public"]["Enums"]["organization_status"]
          subdomain: string
          subscription_plan_id: string | null
          tax_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          max_users?: number
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"]
          subdomain: string
          subscription_plan_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          max_users?: number
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["organization_status"]
          subdomain?: string
          subscription_plan_id?: string | null
          tax_id?: string | null
          trial_ends_at?: string | null
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
      portfolios: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          risk_level: string | null
          spent_budget: number | null
          start_date: string | null
          status: string
          target_end_date: string | null
          target_roi: number | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          risk_level?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          target_roi?: number | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          risk_level?: string | null
          spent_budget?: number | null
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          target_roi?: number | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
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
          role: Database["public"]["Enums"]["user_role"]
          start_date: string | null
          total_coins: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
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
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string | null
          total_coins?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
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
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string | null
          total_coins?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
        ]
      }
      programs: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          owner_id: string | null
          portfolio_id: string | null
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
          id?: string
          name: string
          organization_id?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
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
          id?: string
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          portfolio_id?: string | null
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
          budget: number | null
          business_case: string | null
          created_at: string
          created_by: string
          description: string | null
          health_reason: string | null
          health_status: string | null
          id: string
          kpis: Json | null
          name: string
          organization_id: string | null
          priority: string | null
          program_id: string | null
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
          budget?: number | null
          business_case?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          health_reason?: string | null
          health_status?: string | null
          id?: string
          kpis?: Json | null
          name: string
          organization_id?: string | null
          priority?: string | null
          program_id?: string | null
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
          budget?: number | null
          business_case?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          health_reason?: string | null
          health_status?: string | null
          id?: string
          kpis?: Json | null
          name?: string
          organization_id?: string | null
          priority?: string | null
          program_id?: string | null
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
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          is_critical: boolean | null
          is_milestone: boolean | null
          organization_id: string | null
          planned_end_date: string | null
          planned_start_date: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage: number | null
          project_id: string | null
          quiz_template_id: string | null
          slt_coin_value: number
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          submission_notes: string | null
          task_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          admin_feedback?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_critical?: boolean | null
          is_milestone?: boolean | null
          organization_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          project_id?: string | null
          quiz_template_id?: string | null
          slt_coin_value?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_notes?: string | null
          task_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          actual_hours?: number | null
          actual_start_date?: string | null
          admin_feedback?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_critical?: boolean | null
          is_milestone?: boolean | null
          organization_id?: string | null
          planned_end_date?: string | null
          planned_start_date?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percentage?: number | null
          project_id?: string | null
          quiz_template_id?: string | null
          slt_coin_value?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_notes?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string
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
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          hours_worked: number
          id: string
          organization_id: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_logged?: string
          description?: string | null
          hours_worked: number
          id?: string
          organization_id?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_logged?: string
          description?: string | null
          hours_worked?: number
          id?: string
          organization_id?: string | null
          task_id?: string
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
            foreignKeyName: "time_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          converted_to_project_id: string | null
          converted_to_task_id: string | null
          created_at: string
          csat_rating: number | null
          csat_submitted_at: string | null
          description: string | null
          draft_saved_at: string | null
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
          sla_resolution_due: string | null
          sla_response_due: string | null
          status: string
          submitted_at: string | null
          title: string
          triage_notes: string | null
          triaged_at: string | null
          triaged_by: string | null
          updated_at: string
        }
        Insert: {
          approval_history?: Json | null
          assigned_team?: string | null
          assigned_to?: string | null
          converted_to_project_id?: string | null
          converted_to_task_id?: string | null
          created_at?: string
          csat_rating?: number | null
          csat_submitted_at?: string | null
          description?: string | null
          draft_saved_at?: string | null
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
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          triage_notes?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
        }
        Update: {
          approval_history?: Json | null
          assigned_team?: string | null
          assigned_to?: string | null
          converted_to_project_id?: string | null
          converted_to_task_id?: string | null
          created_at?: string
          csat_rating?: number | null
          csat_submitted_at?: string | null
          description?: string | null
          draft_saved_at?: string | null
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
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          triage_notes?: string | null
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
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
      [_ in never]: never
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
      check_sla_breaches: { Args: never; Returns: undefined }
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
      extract_video_duration: { Args: { video_url: string }; Returns: number }
      get_channel_display_name: {
        Args: { channel_id: string; current_user_id: string }
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
      increment_user_coins: {
        Args: { coin_amount: number; user_profile_id: string }
        Returns: undefined
      }
      is_any_admin: { Args: { p_user_id?: string }; Returns: boolean }
      is_channel_member: {
        Args: { p_channel_id: string; p_profile_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { _org_id?: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
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
    }
    Enums: {
      app_role: "admin" | "intern" | "employee" | "super_admin" | "org_admin"
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
      app_role: ["admin", "intern", "employee", "super_admin", "org_admin"],
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
    },
  },
} as const
