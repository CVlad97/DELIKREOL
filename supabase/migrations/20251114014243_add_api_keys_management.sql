/*
  # Add API Keys Management System

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `service` (text) - Service name (openai, meta, google_sheets)
      - `key_name` (text) - Descriptive name
      - `encrypted_key` (text) - Encrypted API key
      - `is_active` (boolean) - Active status
      - `created_by` (uuid) - Admin who created it
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `usage_count` (integer)

    - `api_usage_logs`
      - `id` (uuid, primary key)
      - `api_key_id` (uuid, foreign key)
      - `service` (text)
      - `endpoint` (text)
      - `user_id` (uuid)
      - `request_data` (jsonb)
      - `response_status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only admins can manage API keys
    - Usage logs visible to admins only
*/

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL CHECK (service IN ('openai', 'meta', 'google_sheets')),
  key_name text NOT NULL,
  encrypted_key text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  usage_count integer DEFAULT 0,
  UNIQUE(service, key_name)
);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  service text NOT NULL,
  endpoint text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  request_data jsonb DEFAULT '{}'::jsonb,
  response_status text,
  response_time_ms integer,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Only admins can view API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can insert API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can update API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policies for api_usage_logs
CREATE POLICY "Only admins can view usage logs"
  ON api_usage_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Service functions can insert usage logs"
  ON api_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_service ON api_usage_logs(service);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);

-- Function to update usage count and last_used_at
CREATE OR REPLACE FUNCTION update_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE api_keys
  SET 
    usage_count = usage_count + 1,
    last_used_at = now(),
    updated_at = now()
  WHERE id = NEW.api_key_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update usage
CREATE TRIGGER trigger_update_api_key_usage
  AFTER INSERT ON api_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_usage();
