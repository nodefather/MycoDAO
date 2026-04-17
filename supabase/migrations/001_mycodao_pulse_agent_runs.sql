-- MYCODAO Pulse — optional audit of MAS task submissions via proxy.
-- Apply in Supabase SQL editor or: supabase db push (when linked).
-- Date referenced: 2026-04-16

create table if not exists public.pulse_agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_id text,
  description text,
  source text default 'pulse',
  status text,
  priority int,
  mas_response jsonb
);

create index if not exists pulse_agent_runs_created_at_idx on public.pulse_agent_runs (created_at desc);

comment on table public.pulse_agent_runs is 'Pulse → MAS task proxy audit trail (optional)';
