// Database types for Northstar
// These types mirror the SQL schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string;
          onboarding_completed: boolean;
          intention: string | null;
          capture_style: 'brain_dump' | 'single_line' | 'voice_to_text' | null;
          anti_values: string | null;
          non_negotiables: string | null;
          definition_of_win: string | null;
          mantra: string | null;
          visualization_script: string | null;
          time_budget_weekly_hours: number | null;
          common_derailers: string[] | null;
          daily_checkin_time: string | null;
          weekly_review_day: number | null;
          weekly_review_time: string | null;
          monthly_reset_day: number | null;
          timezone: string;
          max_daily_outcomes: number;
          max_daily_tasks: number;
          vision_rotation_mode: 'random' | 'by_active_goal' | 'pinned_only';
          default_landing: 'today' | 'vision' | 'inbox';
          notifications: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          onboarding_completed?: boolean;
          intention?: string | null;
          capture_style?: 'brain_dump' | 'single_line' | 'voice_to_text' | null;
          anti_values?: string | null;
          non_negotiables?: string | null;
          definition_of_win?: string | null;
          mantra?: string | null;
          visualization_script?: string | null;
          time_budget_weekly_hours?: number | null;
          common_derailers?: string[] | null;
          daily_checkin_time?: string | null;
          weekly_review_day?: number | null;
          weekly_review_time?: string | null;
          monthly_reset_day?: number | null;
          timezone?: string;
          max_daily_outcomes?: number;
          max_daily_tasks?: number;
          vision_rotation_mode?: 'random' | 'by_active_goal' | 'pinned_only';
          default_landing?: 'today' | 'vision' | 'inbox';
          notifications?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          onboarding_completed?: boolean;
          intention?: string | null;
          capture_style?: 'brain_dump' | 'single_line' | 'voice_to_text' | null;
          anti_values?: string | null;
          non_negotiables?: string | null;
          definition_of_win?: string | null;
          mantra?: string | null;
          visualization_script?: string | null;
          time_budget_weekly_hours?: number | null;
          common_derailers?: string[] | null;
          daily_checkin_time?: string | null;
          weekly_review_day?: number | null;
          weekly_review_time?: string | null;
          monthly_reset_day?: number | null;
          timezone?: string;
          max_daily_outcomes?: number;
          max_daily_tasks?: number;
          vision_rotation_mode?: 'random' | 'by_active_goal' | 'pinned_only';
          default_landing?: 'today' | 'vision' | 'inbox';
          notifications?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_baseline: {
        Row: {
          user_id: string;
          overwhelm_level: number | null;
          motivation_level: number | null;
          captured_at: string;
        };
        Insert: {
          user_id: string;
          overwhelm_level?: number | null;
          motivation_level?: number | null;
          captured_at?: string;
        };
        Update: {
          user_id?: string;
          overwhelm_level?: number | null;
          motivation_level?: number | null;
          captured_at?: string;
        };
      };
      life_domains: {
        Row: {
          id: string;
          user_id: string;
          domain_key: string;
          name: string;
          satisfaction_score: number;
          plus_two_definition: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain_key: string;
          name: string;
          satisfaction_score: number;
          plus_two_definition?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain_key?: string;
          name?: string;
          satisfaction_score?: number;
          plus_two_definition?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      identity_statements: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          sort_order?: number | null;
          created_at?: string;
        };
      };
      user_values: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          definition: string | null;
          rank_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          definition?: string | null;
          rank_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          definition?: string | null;
          rank_order?: number | null;
          created_at?: string;
        };
      };
      year_compass: {
        Row: {
          user_id: string;
          year: number;
          theme: string | null;
          mission_statement: string | null;
          future_self_letter: string | null;
          feeling_goals: string[] | null;
          vision_scenes: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          year: number;
          theme?: string | null;
          mission_statement?: string | null;
          future_self_letter?: string | null;
          feeling_goals?: string[] | null;
          vision_scenes?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          year?: number;
          theme?: string | null;
          mission_statement?: string | null;
          future_self_letter?: string | null;
          feeling_goals?: string[] | null;
          vision_scenes?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wizard_progress: {
        Row: {
          id: string;
          user_id: string;
          step_id: string;
          payload: Json;
          completed: boolean;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_id: string;
          payload: Json;
          completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_id?: string;
          payload?: Json;
          completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      vision_tiles: {
        Row: {
          id: string;
          user_id: string;
          tile_type: 'image' | 'text';
          text_content: string | null;
          image_path: string | null;
          tags: string[] | null;
          pinned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tile_type: 'image' | 'text';
          text_content?: string | null;
          image_path?: string | null;
          tags?: string[] | null;
          pinned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tile_type?: 'image' | 'text';
          text_content?: string | null;
          image_path?: string | null;
          tags?: string[] | null;
          pinned?: boolean;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          why: string | null;
          success_definition: string | null;
          metric_name: string | null;
          metric_baseline: number | null;
          metric_target: number | null;
          metric_current: number | null;
          confidence_score: number | null;
          motivation_score: number | null;
          approach_phrase: string | null;
          status: 'active' | 'paused' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          why?: string | null;
          success_definition?: string | null;
          metric_name?: string | null;
          metric_baseline?: number | null;
          metric_target?: number | null;
          metric_current?: number | null;
          confidence_score?: number | null;
          motivation_score?: number | null;
          approach_phrase?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          why?: string | null;
          success_definition?: string | null;
          metric_name?: string | null;
          metric_baseline?: number | null;
          metric_target?: number | null;
          metric_current?: number | null;
          confidence_score?: number | null;
          motivation_score?: number | null;
          approach_phrase?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      goal_value_links: {
        Row: {
          goal_id: string;
          value_id: string;
        };
        Insert: {
          goal_id: string;
          value_id: string;
        };
        Update: {
          goal_id?: string;
          value_id?: string;
        };
      };
      lead_indicators: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          name: string;
          measure_type: 'binary' | 'count' | 'time';
          weekly_target: number;
          minimum_version: string | null;
          anchor: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          name: string;
          measure_type: 'binary' | 'count' | 'time';
          weekly_target?: number;
          minimum_version?: string | null;
          anchor?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          name?: string;
          measure_type?: 'binary' | 'count' | 'time';
          weekly_target?: number;
          minimum_version?: string | null;
          anchor?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          title: string;
          definition_of_done: string | null;
          due_date: string | null;
          status: 'active' | 'paused' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          title: string;
          definition_of_done?: string | null;
          due_date?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string | null;
          title?: string;
          definition_of_done?: string | null;
          due_date?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          notes: string | null;
          due_date: string | null;
          status: 'open' | 'done' | 'archived';
          is_next_action: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title: string;
          notes?: string | null;
          due_date?: string | null;
          status?: 'open' | 'done' | 'archived';
          is_next_action?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          title?: string;
          notes?: string | null;
          due_date?: string | null;
          status?: 'open' | 'done' | 'archived';
          is_next_action?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          name: string;
          cue: string | null;
          location: string | null;
          tracking_type: 'binary' | 'count' | 'time';
          weekly_target: number;
          minimum_version: string | null;
          status: 'active' | 'paused' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          name: string;
          cue?: string | null;
          location?: string | null;
          tracking_type: 'binary' | 'count' | 'time';
          weekly_target?: number;
          minimum_version?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string | null;
          name?: string;
          cue?: string | null;
          location?: string | null;
          tracking_type?: 'binary' | 'count' | 'time';
          weekly_target?: number;
          minimum_version?: string | null;
          status?: 'active' | 'paused' | 'archived';
          created_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          log_date: string;
          value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          log_date: string;
          value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          log_date?: string;
          value?: number | null;
          created_at?: string;
        };
      };
      inbox_items: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          status: 'inbox' | 'processed' | 'archived';
          linked_goal_id: string | null;
          linked_project_id: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          status?: 'inbox' | 'processed' | 'archived';
          linked_goal_id?: string | null;
          linked_project_id?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          status?: 'inbox' | 'processed' | 'archived';
          linked_goal_id?: string | null;
          linked_project_id?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      woops: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          project_id: string | null;
          habit_id: string | null;
          wish: string | null;
          outcome: string | null;
          obstacle: string | null;
          plan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          project_id?: string | null;
          habit_id?: string | null;
          wish?: string | null;
          outcome?: string | null;
          obstacle?: string | null;
          plan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string | null;
          project_id?: string | null;
          habit_id?: string | null;
          wish?: string | null;
          outcome?: string | null;
          obstacle?: string | null;
          plan?: string | null;
          created_at?: string;
        };
      };
      if_then_plans: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          project_id: string | null;
          habit_id: string | null;
          trigger: string;
          response: string;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          project_id?: string | null;
          habit_id?: string | null;
          trigger: string;
          response: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string | null;
          project_id?: string | null;
          habit_id?: string | null;
          trigger?: string;
          response?: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          checkin_date: string;
          timezone: string;
          focus_outcomes: string[] | null;
          main_obstacle: string | null;
          win: string | null;
          lesson: string | null;
          next_action_commitment: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_date: string;
          timezone?: string;
          focus_outcomes?: string[] | null;
          main_obstacle?: string | null;
          win?: string | null;
          lesson?: string | null;
          next_action_commitment?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_date?: string;
          timezone?: string;
          focus_outcomes?: string[] | null;
          main_obstacle?: string | null;
          win?: string | null;
          lesson?: string | null;
          next_action_commitment?: string | null;
          recorded_at?: string;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          timezone: string;
          notes: string | null;
          inbox_processed: boolean;
          projects_checked: boolean;
          lead_indicators_reviewed: boolean;
          vision_refreshed: boolean;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          timezone?: string;
          notes?: string | null;
          inbox_processed?: boolean;
          projects_checked?: boolean;
          lead_indicators_reviewed?: boolean;
          vision_refreshed?: boolean;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          timezone?: string;
          notes?: string | null;
          inbox_processed?: boolean;
          projects_checked?: boolean;
          lead_indicators_reviewed?: boolean;
          vision_refreshed?: boolean;
          submitted_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserBaseline = Database['public']['Tables']['user_baseline']['Row'];
export type LifeDomain = Database['public']['Tables']['life_domains']['Row'];
export type IdentityStatement = Database['public']['Tables']['identity_statements']['Row'];
export type UserValue = Database['public']['Tables']['user_values']['Row'];
export type YearCompass = Database['public']['Tables']['year_compass']['Row'];
export type WizardProgress = Database['public']['Tables']['wizard_progress']['Row'];
export type VisionTile = Database['public']['Tables']['vision_tiles']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type GoalValueLink = Database['public']['Tables']['goal_value_links']['Row'];
export type LeadIndicator = Database['public']['Tables']['lead_indicators']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type InboxItem = Database['public']['Tables']['inbox_items']['Row'];
export type Woop = Database['public']['Tables']['woops']['Row'];
export type IfThenPlan = Database['public']['Tables']['if_then_plans']['Row'];
export type DailyCheckin = Database['public']['Tables']['daily_checkins']['Row'];
export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];

