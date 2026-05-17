-- SQL Migration for CreatorTracker
-- Tables: user_trackers, user_entries, user_targets, user_dashboard_settings

-- 1. user_trackers
CREATE TABLE IF NOT EXISTS public.user_trackers (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'number',
    unit TEXT,
    color TEXT,
    icon TEXT,
    default_value TEXT,
    goal_value NUMERIC,
    target_value NUMERIC,
    description TEXT,
    category TEXT,
    frequency TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    archived BOOLEAN DEFAULT false,
    sort_order INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='icon') THEN
        ALTER TABLE public.user_trackers ADD COLUMN icon TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='goal_value') THEN
        ALTER TABLE public.user_trackers ADD COLUMN goal_value NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='target_value') THEN
        ALTER TABLE public.user_trackers ADD COLUMN target_value NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='description') THEN
        ALTER TABLE public.user_trackers ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='category') THEN
        ALTER TABLE public.user_trackers ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='frequency') THEN
        ALTER TABLE public.user_trackers ADD COLUMN frequency TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='is_default') THEN
        ALTER TABLE public.user_trackers ADD COLUMN is_default BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='archived') THEN
        ALTER TABLE public.user_trackers ADD COLUMN archived BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='sort_order') THEN
        ALTER TABLE public.user_trackers ADD COLUMN sort_order INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_trackers' AND column_name='metadata') THEN
        ALTER TABLE public.user_trackers ADD COLUMN metadata JSONB;
    END IF;
END $$;

ALTER TABLE public.user_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own trackers" ON public.user_trackers
    FOR ALL USING (auth.uid() = user_id);

-- 2. user_entries
CREATE TABLE IF NOT EXISTS public.user_entries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracker_id TEXT NOT NULL REFERENCES public.user_trackers(id) ON DELETE CASCADE,
    tracker_name TEXT,
    tracker_type TEXT,
    date DATE NOT NULL,
    value NUMERIC,
    unit TEXT,
    note TEXT,
    mood TEXT,
    tags TEXT[],
    source TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='tracker_name') THEN
        ALTER TABLE public.user_entries ADD COLUMN tracker_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='tracker_type') THEN
        ALTER TABLE public.user_entries ADD COLUMN tracker_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='unit') THEN
        ALTER TABLE public.user_entries ADD COLUMN unit TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='mood') THEN
        ALTER TABLE public.user_entries ADD COLUMN mood TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='tags') THEN
        ALTER TABLE public.user_entries ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='source') THEN
        ALTER TABLE public.user_entries ADD COLUMN source TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='metadata') THEN
        ALTER TABLE public.user_entries ADD COLUMN metadata JSONB;
    END IF;
    -- Fix legacy column name if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_entries' AND column_name='entry_date') THEN
        ALTER TABLE public.user_entries RENAME COLUMN entry_date TO date;
    END IF;
END $$;

ALTER TABLE public.user_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own entries" ON public.user_entries
    FOR ALL USING (auth.uid() = user_id);

-- 3. user_targets
CREATE TABLE IF NOT EXISTS public.user_targets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tracker_id TEXT NOT NULL REFERENCES public.user_trackers(id) ON DELETE CASCADE,
    target_value NUMERIC NOT NULL,
    period TEXT NOT NULL, -- 'daily', 'weekly'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own targets" ON public.user_targets
    FOR ALL USING (auth.uid() = user_id);

-- 4. user_dashboard_settings
CREATE TABLE IF NOT EXISTS public.user_dashboard_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_dashboard_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" ON public.user_dashboard_settings
    FOR ALL USING (auth.uid() = user_id);

-- Reload PostgREST schema
NOTIFY pgrst, 'reload schema';
