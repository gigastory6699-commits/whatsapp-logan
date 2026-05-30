-- Migration: WhatsApp Auth State Table
-- Run this in Supabase SQL Editor before enabling USE_SUPABASE_AUTH=true
--
-- Supabase Dashboard > SQL Editor > New Query > Paste & Run

CREATE TABLE IF NOT EXISTS whatsapp_auth_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_state_updated 
  ON whatsapp_auth_state(updated_at);

-- Optional: Row Level Security (RLS) - disable for service role access
ALTER TABLE whatsapp_auth_state DISABLE ROW LEVEL SECURITY;
