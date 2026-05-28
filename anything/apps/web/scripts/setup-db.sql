-- ============================================================
-- Momentum AI — Database Schema
-- Run this once on your NeonDB (or any Postgres) database
-- ============================================================

-- Goals: top-level user execution systems
CREATE TABLE IF NOT EXISTS goals (
  id                  SERIAL PRIMARY KEY,
  user_id             TEXT NOT NULL,
  title               TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active',
  momentum_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  momentum_breakdown  JSONB,
  execution_streak    INTEGER NOT NULL DEFAULT 0,
  last_active_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestones: phases inside a goal
CREATE TABLE IF NOT EXISTS milestones (
  id          SERIAL PRIMARY KEY,
  goal_id     INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks: individual actions inside a milestone
CREATE TABLE IF NOT EXISTS tasks (
  id               SERIAL PRIMARY KEY,
  milestone_id     INTEGER REFERENCES milestones(id) ON DELETE CASCADE,
  goal_id          INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  priority         TEXT NOT NULL DEFAULT 'medium',
  status           TEXT NOT NULL DEFAULT 'pending',
  impact_score     INTEGER NOT NULL DEFAULT 5,
  estimated_hours  NUMERIC(5,2),
  resources        JSONB NOT NULL DEFAULT '[]',
  due_date         TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Insights: Chief of Staff intelligence reports
CREATE TABLE IF NOT EXISTS ai_insights (
  id            SERIAL PRIMARY KEY,
  goal_id       INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  insight_type  TEXT NOT NULL DEFAULT 'strategy',
  urgency       TEXT NOT NULL DEFAULT 'medium',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Momentum History: time-series score snapshots for analytics charts
CREATE TABLE IF NOT EXISTS momentum_history (
  id          SERIAL PRIMARY KEY,
  goal_id     INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  score       NUMERIC(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Execution Events: audit log of all user actions
CREATE TABLE IF NOT EXISTS execution_events (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL DEFAULT 'anonymous',
  event_type  TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_goals_user_id       ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id  ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id        ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id   ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_insights_goal_id     ON ai_insights(goal_id);
CREATE INDEX IF NOT EXISTS idx_momentum_goal_id     ON momentum_history(goal_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at    ON execution_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_user_id       ON execution_events(user_id);
