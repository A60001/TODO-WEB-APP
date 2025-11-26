-- Enable UUID generation (run once per DB)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- USERS TABLE
----------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- internal user id
  email TEXT NOT NULL UNIQUE,                      -- login email (must be unique)
  password_hash TEXT NOT NULL,                     -- bcrypt-hashed password
  full_name TEXT NOT NULL,                         -- what user types in signup form
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE, -- true only after clicking verification link
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- EMAIL VERIFICATION TOKENS
----------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- internal id for this token row
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,                             -- random string sent in email link
  expires_at TIMESTAMPTZ NOT NULL,                 -- when this token becomes invalid
  used_at TIMESTAMPTZ,                             -- set when user successfully verifies
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- TASK LISTS
----------------------------
CREATE TABLE IF NOT EXISTS task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                              -- list name (e.g., "Personal", "Work")
  sort_order INT DEFAULT 0,                        -- for manual ordering of lists
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- TASKS (including SUBTASKS)
----------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,

  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, 
  -- null = normal task, not a subtask
  -- non-null = this is a subtask of another task

  title TEXT NOT NULL,
  description TEXT,

  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,

  due_date DATE,
  reminder_at TIMESTAMPTZ,

  sort_order INT NOT NULL DEFAULT 0,               -- for drag-and-drop ordering
  deleted_at TIMESTAMPTZ,                          -- soft delete for undo/restore
  completed_at TIMESTAMPTZ,                        -- when task was completed

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);