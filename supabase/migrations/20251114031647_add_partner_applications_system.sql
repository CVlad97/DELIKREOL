/*
  # Partner Applications System

  1. New Tables
    - `partner_applications`
      - `id` (uuid, primary key)
      - `applicant_name` (text) - Full name of applicant
      - `applicant_email` (text) - Contact email
      - `applicant_phone` (text) - Contact phone
      - `partner_type` (text) - Type: 'vendor', 'driver', 'relay_host'
      - `application_data` (jsonb) - All form data
      - `status` (text) - Status: 'submitted', 'under_review', 'approved', 'rejected', 'pending_info'
      - `ai_score` (text) - AI grade: 'A', 'B', 'C', or null
      - `ai_feedback` (jsonb) - AI analysis with strengths, weaknesses, response_template
      - `reviewed_by` (uuid, FK to profiles) - Admin who reviewed
      - `reviewed_at` (timestamptz) - Review timestamp
      - `notes` (text) - Admin notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `error_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to profiles, optional)
      - `function_name` (text) - Which function/agent failed
      - `error_type` (text) - Error category
      - `error_message` (text) - Detailed error
      - `context_data` (jsonb) - Additional context
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only admins can view and manage applications
    - Only authenticated users can create applications
    - Error logs viewable by admins only

  3. Indexes
    - Index on partner_type for filtering
    - Index on status for querying
    - Index on created_at for sorting
*/

-- Create partner_applications table
CREATE TABLE IF NOT EXISTS partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text NOT NULL,
  partner_type text NOT NULL CHECK (partner_type IN ('vendor', 'driver', 'relay_host')),
  application_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'pending_info')),
  ai_score text CHECK (ai_score IN ('A', 'B', 'C')),
  ai_feedback jsonb DEFAULT '{}'::jsonb,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  function_name text NOT NULL,
  error_type text NOT NULL,
  error_message text NOT NULL,
  context_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partner_applications_type ON partner_applications(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_partner_applications_created ON partner_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_function ON error_logs(function_name);

-- Enable RLS
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policies for partner_applications

-- Authenticated users can create applications
CREATE POLICY "Users can create applications"
  ON partner_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view applications"
  ON partner_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON partner_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policies for error_logs

-- Admins can view error logs
CREATE POLICY "Admins can view error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- All authenticated users can insert error logs
CREATE POLICY "Users can create error logs"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for partner_applications
DROP TRIGGER IF EXISTS update_partner_applications_updated_at ON partner_applications;
CREATE TRIGGER update_partner_applications_updated_at
  BEFORE UPDATE ON partner_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();