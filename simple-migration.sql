-- Simple TaFlo Database Migration
-- Run this in your Supabase SQL editor to add basic features

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Create priorities table
CREATE TABLE IF NOT EXISTS priorities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  level INTEGER NOT NULL,
  color VARCHAR(7) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- Insert default priorities
INSERT INTO priorities (name, level, color, user_id) VALUES 
  ('Low', 1, '#10b981', auth.uid()),
  ('Medium', 2, '#f59e0b', auth.uid()),
  ('High', 3, '#ef4444', auth.uid())
ON CONFLICT (name, user_id) DO NOTHING;

-- Add new columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority_id INTEGER REFERENCES priorities(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_time INTEGER; -- in minutes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_time INTEGER; -- in minutes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON tasks(priority_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own priorities" ON priorities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own priorities" ON priorities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own priorities" ON priorities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own priorities" ON priorities
  FOR DELETE USING (auth.uid() = user_id);
