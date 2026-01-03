-- schema.sql
-- Supabase Postgres schema (MVP)
-- Notes:
-- - Uses Supabase auth.users for identities
-- - All tables include user_id and are protected with RLS
-- - Keep it simple; enforce some rules in app logic

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1) Settings (one row per user)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,

  intention text,
  capture_style text check (capture_style in ('brain_dump','single_line','voice_to_text')),
  anti_values text,
  non_negotiables text,
  definition_of_win text,

  mantra text,
  visualization_script text,

  time_budget_weekly_hours int,
  common_derailers text[],

  daily_checkin_time time,
  weekly_review_day int,       -- 0=Sunday ... 6=Saturday (or define your mapping)
  weekly_review_time time,
  monthly_reset_day int check (monthly_reset_day between 1 and 28),
  timezone text not null default 'UTC',

  max_daily_outcomes int not null default 3 check (max_daily_outcomes between 1 and 5),
  max_daily_tasks int not null default 10 check (max_daily_tasks between 3 and 20),

  vision_rotation_mode text not null default 'random' check (vision_rotation_mode in ('random','by_active_goal','pinned_only')),
  default_landing text not null default 'today' check (default_landing in ('today','vision','inbox')),
  notifications text[] check (
    notifications is null
    or notifications <@ array['daily_checkin','weekly_review','monthly_reset']::text[]
  ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Baseline snapshot (overwhelm/motivation)
create table if not exists public.user_baseline (
  user_id uuid primary key references auth.users(id) on delete cascade,
  overwhelm_level int check (overwhelm_level between 0 and 10),
  motivation_level int check (motivation_level between 0 and 10),
  captured_at timestamptz not null default now()
);

-- 3) Life domains (ratings + notes)
create table if not exists public.life_domains (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_key text not null,
  name text not null,
  satisfaction_score int not null check (satisfaction_score between 0 and 10),
  plus_two_definition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, domain_key)
);

create index if not exists life_domains_user_id_idx on public.life_domains(user_id);

-- 4) Identity statements
create table if not exists public.identity_statements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  sort_order int,
  created_at timestamptz not null default now()
);

create index if not exists identity_statements_user_id_idx on public.identity_statements(user_id);

-- 5) Values
-- 5) Values
create table if not exists public.user_values (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  definition text,
  rank_order int, -- 1..5 for top 5, null otherwise
  created_at timestamptz not null default now()
);

create index if not exists user_values_user_id_idx on public.user_values(user_id);

-- 6) Year compass
create table if not exists public.year_compass (
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  theme text,
  mission_statement text,
  future_self_letter text,
  feeling_goals text[],      -- tags
  vision_scenes text[],      -- 3 scenes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, year)
);

-- 7) Wizard progress (autosave/resume)
create table if not exists public.wizard_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id text not null,
  payload jsonb not null,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create index if not exists wizard_progress_user_id_idx on public.wizard_progress(user_id);

-- 8) Vision tiles
create table if not exists public.vision_tiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tile_type text not null check (tile_type in ('image','text')),
  text_content text,
  image_path text,          -- Supabase Storage path
  tags text[],
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists vision_tiles_user_id_idx on public.vision_tiles(user_id);

-- 5) Goals
-- 9) Goals
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  why text,
  success_definition text,

  metric_name text,
  metric_baseline numeric,
  metric_target numeric,
  metric_current numeric,

  confidence_score int check (confidence_score between 0 and 10),
  motivation_score int check (motivation_score between 0 and 10),

  approach_phrase text,

  status text not null default 'active' check (status in ('active','paused','archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals(user_id);

-- Goal ↔ value links
create table if not exists public.goal_value_links (
  goal_id uuid not null references public.goals(id) on delete cascade,
  value_id uuid not null references public.user_values(id) on delete cascade,
  primary key (goal_id, value_id)
);

-- 6) Lead indicators (weekly behaviors)
-- 10) Lead indicators (weekly behaviors)
create table if not exists public.lead_indicators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,

  name text not null,
  measure_type text not null check (measure_type in ('binary','count','time')),
  weekly_target numeric not null default 0,
  minimum_version text,
  anchor text, -- morning/midday/evening/specific/flexible
  created_at timestamptz not null default now()
);

create index if not exists lead_indicators_goal_id_idx on public.lead_indicators(goal_id);

-- 7) Projects
-- 11) Projects
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,

  title text not null,
  definition_of_done text,
  due_date date,
  status text not null default 'active' check (status in ('active','paused','archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_goal_id_idx on public.projects(goal_id);

-- 8) Tasks
-- 12) Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,

  title text not null,
  notes text,
  due_date date,
  status text not null default 'open' check (status in ('open','done','archived')),

  is_next_action boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint next_action_requires_project check (
    is_next_action = false or project_id is not null
  )
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);

-- Enforce at most one next action per project
create unique index if not exists one_next_action_per_project_idx
on public.tasks(project_id)
where is_next_action = true and status = 'open';

-- 9) Habits (optional: can mirror lead indicators or separate)
-- 13) Habits (optional: can mirror lead indicators or separate)
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,

  name text not null,
  cue text,
  location text,
  tracking_type text not null check (tracking_type in ('binary','count','time')),
  weekly_target numeric not null default 0,
  minimum_version text,

  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habits_goal_id_idx on public.habits(goal_id);

-- Habit logs (one row per habit per day)
-- 14) Habit logs (one row per habit per day)
create table if not exists public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  value numeric, -- 1 for binary completion; or count/time value
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);

-- 10) Inbox items (capture)
-- 15) Inbox items (capture)
create table if not exists public.inbox_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  content text not null,
  status text not null default 'inbox' check (status in ('inbox','processed','archived')),
  linked_goal_id uuid references public.goals(id) on delete set null,
  linked_project_id uuid references public.projects(id) on delete set null,

  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists inbox_items_user_id_idx on public.inbox_items(user_id);

-- 11) WOOP (for goal/project/habit)
-- 16) WOOP (for goal/project/habit)
create table if not exists public.woops (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  goal_id uuid references public.goals(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,

  wish text,
  outcome text,
  obstacle text,
  plan text,

  created_at timestamptz not null default now(),

  constraint woops_one_target_check check (
    (goal_id is not null)::int + (project_id is not null)::int + (habit_id is not null)::int = 1
  )
);

create index if not exists woops_user_id_idx on public.woops(user_id);

-- 12) If-Then plans (for goal/project/habit)
-- 17) If-Then plans (for goal/project/habit)
create table if not exists public.if_then_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  goal_id uuid references public.goals(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,

  trigger text not null,
  response text not null,
  category text not null default 'focus',
  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  constraint ifthen_one_target_check check (
    (goal_id is not null)::int + (project_id is not null)::int + (habit_id is not null)::int = 1
  )
);

create index if not exists if_then_plans_user_id_idx on public.if_then_plans(user_id);

-- 13) Daily check-ins
create table if not exists public.daily_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,            -- stored in user's timezone
  timezone text not null default 'UTC',

  focus_outcomes text[],   -- max 3 in app
  main_obstacle text,
  win text,
  lesson text,
  next_action_commitment text, -- optional: "tomorrow I will..."

  recorded_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create index if not exists daily_checkins_user_id_idx on public.daily_checkins(user_id);

-- 14) Weekly reviews
create table if not exists public.weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null, -- normalize to Monday (or your convention)
  timezone text not null default 'UTC',

  notes text,
  inbox_processed boolean not null default false,
  projects_checked boolean not null default false,
  lead_indicators_reviewed boolean not null default false,
  vision_refreshed boolean not null default false,

  submitted_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create index if not exists weekly_reviews_user_id_idx on public.weekly_reviews(user_id);

-- =========================
-- RLS POLICIES (REQUIRED)
-- =========================
alter table public.user_settings enable row level security;
alter table public.user_baseline enable row level security;
alter table public.life_domains enable row level security;
alter table public.identity_statements enable row level security;
alter table public.user_values enable row level security;
alter table public.year_compass enable row level security;
alter table public.wizard_progress enable row level security;
alter table public.vision_tiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_value_links enable row level security;
alter table public.lead_indicators enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.inbox_items enable row level security;
alter table public.woops enable row level security;
alter table public.if_then_plans enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.weekly_reviews enable row level security;

-- Helper: tables with user_id use the same CRUD pattern
create policy "user_settings_select_own" on public.user_settings
  for select using (user_id = auth.uid());
create policy "user_settings_insert_own" on public.user_settings
  for insert with check (user_id = auth.uid());
create policy "user_settings_update_own" on public.user_settings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "user_baseline_select_own" on public.user_baseline
  for select using (user_id = auth.uid());
create policy "user_baseline_upsert_own" on public.user_baseline
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "life_domains_select_own" on public.life_domains
  for select using (user_id = auth.uid());
create policy "life_domains_insert_own" on public.life_domains
  for insert with check (user_id = auth.uid());
create policy "life_domains_update_own" on public.life_domains
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "life_domains_delete_own" on public.life_domains
  for delete using (user_id = auth.uid());

create policy "identity_statements_select_own" on public.identity_statements
  for select using (user_id = auth.uid());
create policy "identity_statements_mutate_own" on public.identity_statements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "user_values_select_own" on public.user_values
  for select using (user_id = auth.uid());
create policy "user_values_mutate_own" on public.user_values
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "year_compass_select_own" on public.year_compass
  for select using (user_id = auth.uid());
create policy "year_compass_mutate_own" on public.year_compass
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "wizard_progress_select_own" on public.wizard_progress
  for select using (user_id = auth.uid());
create policy "wizard_progress_mutate_own" on public.wizard_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "vision_tiles_select_own" on public.vision_tiles
  for select using (user_id = auth.uid());
create policy "vision_tiles_mutate_own" on public.vision_tiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "goals_select_own" on public.goals
  for select using (user_id = auth.uid());
create policy "goals_insert_own" on public.goals
  for insert with check (user_id = auth.uid());
create policy "goals_update_own" on public.goals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals_delete_own" on public.goals
  for delete using (user_id = auth.uid());

create policy "goal_value_links_select_own" on public.goal_value_links
  for select using (
    exists (
      select 1
      from public.goals g
      where g.id = goal_value_links.goal_id
        and g.user_id = auth.uid()
    )
  );
create policy "goal_value_links_mutate_own" on public.goal_value_links
  for all using (
    exists (
      select 1
      from public.goals g
      where g.id = goal_value_links.goal_id
        and g.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.goals g
      where g.id = goal_value_links.goal_id
        and g.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.user_values v
      where v.id = goal_value_links.value_id
        and v.user_id = auth.uid()
    )
  );

create policy "lead_indicators_select_own" on public.lead_indicators
  for select using (user_id = auth.uid());
create policy "lead_indicators_mutate_own" on public.lead_indicators
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "projects_select_own" on public.projects
  for select using (user_id = auth.uid());
create policy "projects_mutate_own" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tasks_select_own" on public.tasks
  for select using (user_id = auth.uid());
create policy "tasks_mutate_own" on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "habits_select_own" on public.habits
  for select using (user_id = auth.uid());
create policy "habits_mutate_own" on public.habits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "habit_logs_select_own" on public.habit_logs
  for select using (user_id = auth.uid());
create policy "habit_logs_mutate_own" on public.habit_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "inbox_items_select_own" on public.inbox_items
  for select using (user_id = auth.uid());
create policy "inbox_items_mutate_own" on public.inbox_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "woops_select_own" on public.woops
  for select using (user_id = auth.uid());
create policy "woops_mutate_own" on public.woops
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "if_then_select_own" on public.if_then_plans
  for select using (user_id = auth.uid());
create policy "if_then_mutate_own" on public.if_then_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "daily_checkins_select_own" on public.daily_checkins
  for select using (user_id = auth.uid());
create policy "daily_checkins_mutate_own" on public.daily_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "weekly_reviews_select_own" on public.weekly_reviews
  for select using (user_id = auth.uid());
create policy "weekly_reviews_mutate_own" on public.weekly_reviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================
-- STORAGE POLICIES (VISION TILES BUCKET)
-- =========================
-- In Supabase Storage create bucket "vision-tiles" (private) and apply:
--   policy "vision_tiles_upload": allow insert/update where auth.uid()::text = split_part(object_name, '/', 1)
--   policy "vision_tiles_read": allow select where auth.uid()::text = split_part(object_name, '/', 1)
-- Client uploads should use server-issued signed URLs and store paths as `${user_id}/<uuid>.jpg`.
