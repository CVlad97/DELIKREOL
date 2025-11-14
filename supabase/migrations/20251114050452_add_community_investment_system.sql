/*
  # Ajouter le système de fonds communautaire (investissement participatif)

  1. Nouvelles Tables
    - `investment_projects` : Projets d'investissement communautaire
      - `id` (uuid, primary key)
      - `title` (text, titre du projet)
      - `description` (text, description détaillée)
      - `project_type` (text, type: relay_hub/dark_kitchen/storage/other)
      - `target_points` (numeric, objectif en points Delikreol)
      - `collected_points` (numeric, points collectés)
      - `status` (text, draft/active/funded/closed)
      - `zone_label` (text, localisation du projet)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `investment_contributions` : Contributions des utilisateurs
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `project_id` (uuid, foreign key to investment_projects)
      - `contribution_points` (numeric, montant de la contribution)
      - `source` (text, source des points: loyalty_points)
      - `created_at` (timestamptz)
    
    - `investment_preferences` : Préférences de réinvestissement auto
      - `user_id` (uuid, primary key, foreign key to profiles)
      - `mode` (text, auto/manual)
      - `auto_ratio` (numeric, ratio de réinvestissement automatique)
      - `preferred_project_types` (text[], types de projets préférés)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view active projects
    - Users can view their own contributions
    - Users can manage their own preferences
    - Admins can manage everything

  3. Important
    - Ce module fonctionne en MODE DEMO avec des points
    - Pas de finance réelle, pas de promesse de rendement
    - Évolution future nécessitera un partenaire régulé
*/

-- Create investment_projects table
CREATE TABLE IF NOT EXISTS investment_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('relay_hub', 'dark_kitchen', 'storage', 'other')),
  target_points numeric NOT NULL CHECK (target_points > 0),
  collected_points numeric NOT NULL DEFAULT 0 CHECK (collected_points >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'closed')),
  zone_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investment_contributions table
CREATE TABLE IF NOT EXISTS investment_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES investment_projects(id) ON DELETE CASCADE,
  contribution_points numeric NOT NULL CHECK (contribution_points > 0),
  source text NOT NULL DEFAULT 'loyalty_points',
  created_at timestamptz DEFAULT now()
);

-- Create investment_preferences table
CREATE TABLE IF NOT EXISTS investment_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'manual' CHECK (mode IN ('auto', 'manual')),
  auto_ratio numeric DEFAULT 0 CHECK (auto_ratio >= 0 AND auto_ratio <= 1),
  preferred_project_types text[] DEFAULT ARRAY[]::text[],
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investment_projects_status ON investment_projects(status);
CREATE INDEX IF NOT EXISTS idx_investment_contributions_user_id ON investment_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_contributions_project_id ON investment_contributions(project_id);

-- Enable RLS
ALTER TABLE investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for investment_projects
CREATE POLICY "Anyone can view active projects"
  ON investment_projects FOR SELECT
  USING (status = 'active' OR status = 'funded');

CREATE POLICY "Admins can view all projects"
  ON investment_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert projects"
  ON investment_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON investment_projects FOR UPDATE
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

-- Policies for investment_contributions
CREATE POLICY "Users can view their own contributions"
  ON investment_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contributions"
  ON investment_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions"
  ON investment_contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policies for investment_preferences
CREATE POLICY "Users can view their own preferences"
  ON investment_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON investment_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update collected_points when contribution is added
CREATE OR REPLACE FUNCTION update_project_collected_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE investment_projects
  SET 
    collected_points = collected_points + NEW.contribution_points,
    updated_at = now()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update collected_points
DROP TRIGGER IF EXISTS trigger_update_collected_points ON investment_contributions;
CREATE TRIGGER trigger_update_collected_points
  AFTER INSERT ON investment_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_project_collected_points();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_investment_projects_updated_at ON investment_projects;
CREATE TRIGGER trigger_investment_projects_updated_at
  BEFORE UPDATE ON investment_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_updated_at();

DROP TRIGGER IF EXISTS trigger_investment_preferences_updated_at ON investment_preferences;
CREATE TRIGGER trigger_investment_preferences_updated_at
  BEFORE UPDATE ON investment_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_updated_at();
