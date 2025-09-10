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
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
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
          ip_address?: unknown | null
          metadata?: Json | null
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
          ip_address?: unknown | null
          metadata?: Json | null
          task_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
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
          updated_at: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          intern_id: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          intern_id?: string
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
        ]
      }
      assessment_answers: {
        Row: {
          answered_at: string
          attempt_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_answer: string | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_answer?: string | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
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
            foreignKeyName: "assessment_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
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
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
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
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
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
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
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
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          status?: string
          task_id?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
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
          member_count: number | null
          name: string
          participant_ids: string[] | null
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
          member_count?: number | null
          name: string
          participant_ids?: string[] | null
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
          member_count?: number | null
          name?: string
          participant_ids?: string[] | null
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
        ]
      }
      daily_email_log: {
        Row: {
          created_at: string
          email_date: string
          email_type: string
          id: string
          sent_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_date?: string
          email_type: string
          id?: string
          sent_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_date?: string
          email_type?: string
          id?: string
          sent_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_email_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      kanban_events: {
        Row: {
          analytics_data: Json | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json | null
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
          task_id?: string
          timestamp?: string
          to_status?: string | null
          user_id?: string
        }
        Relationships: [
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
          status_changes?: number | null
          throughput?: number | null
          total_events?: number | null
          updated_at?: string
          wip_limit_violations?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          channel_id: string | null
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_pinned: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          message_type: string
          reactions: Json | null
          receiver_id: string | null
          reply_to: string | null
          sender_id: string
          sender_name: string | null
          sender_role: string | null
          thread_replies: number | null
        }
        Insert: {
          attachments?: Json | null
          channel_id?: string | null
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          message_type?: string
          reactions?: Json | null
          receiver_id?: string | null
          reply_to?: string | null
          sender_id: string
          sender_name?: string | null
          sender_role?: string | null
          thread_replies?: number | null
        }
        Update: {
          attachments?: Json | null
          channel_id?: string | null
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          message_type?: string
          reactions?: Json | null
          receiver_id?: string | null
          reply_to?: string | null
          sender_id?: string
          sender_name?: string | null
          sender_role?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          email: string
          employee_id: string | null
          end_date: string | null
          full_name: string
          id: string
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
          department?: string | null
          email: string
          employee_id?: string | null
          end_date?: string | null
          full_name: string
          id?: string
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
          department?: string | null
          email?: string
          employee_id?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          start_date?: string | null
          total_coins?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
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
        ]
      }
      session_logs: {
        Row: {
          created_at: string
          id: string
          login_time: string
          logout_time: string | null
          session_duration_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_time?: string
          logout_time?: string | null
          session_duration_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          login_time?: string
          logout_time?: string | null
          session_duration_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
      tasks: {
        Row: {
          admin_feedback: string | null
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
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
          admin_feedback?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
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
          admin_feedback?: string | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
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
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_logged?: string
          description?: string | null
          hours_worked: number
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_logged?: string
          description?: string | null
          hours_worked?: number
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
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
        ]
      }
      training_video_progress: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
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
          total_duration_seconds?: number
          user_id?: string
          video_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
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
            foreignKeyName: "training_videos_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "training_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          status: string | null
          status_message: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_kanban_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          category: string
          metric_date: string
          metric_name: string
          metric_value: number
        }[]
      }
      can_update_profile: {
        Args: { new_role: string; profile_id: string }
        Returns: boolean
      }
      check_and_log_daily_email: {
        Args: { p_email_type: string; p_user_id: string }
        Returns: boolean
      }
      extract_video_duration: {
        Args: { video_url: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      increment_user_coins: {
        Args: { coin_amount: number; user_profile_id: string }
        Returns: undefined
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
    }
    Enums: {
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "assigned"
        | "in_progress"
        | "completed"
        | "verified"
        | "rejected"
      user_role: "admin" | "intern"
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
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "assigned",
        "in_progress",
        "completed",
        "verified",
        "rejected",
      ],
      user_role: ["admin", "intern"],
    },
  },
} as const
