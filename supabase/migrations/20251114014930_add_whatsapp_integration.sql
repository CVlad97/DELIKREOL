/*
  # Add WhatsApp Business Integration

  1. New Tables
    - `whatsapp_messages`
      - `id` (uuid, primary key)
      - `whatsapp_id` (text) - WhatsApp message ID
      - `from_number` (text) - Sender phone number
      - `to_number` (text) - Recipient phone number
      - `message_type` (text) - text, image, audio, etc.
      - `message_content` (text) - Message text
      - `media_url` (text) - Media URL if applicable
      - `user_id` (uuid) - Linked user if registered
      - `order_id` (uuid) - Linked order if applicable
      - `direction` (text) - inbound or outbound
      - `status` (text) - sent, delivered, read, failed
      - `created_at` (timestamptz)

    - `whatsapp_sessions`
      - `id` (uuid, primary key)
      - `phone_number` (text) - User phone number
      - `user_id` (uuid) - Linked user
      - `session_state` (text) - Current conversation state
      - `session_data` (jsonb) - Cart, preferences, etc.
      - `last_interaction_at` (timestamptz)
      - `created_at` (timestamptz)

    - `whatsapp_templates`
      - `id` (uuid, primary key)
      - `template_name` (text) - Template identifier
      - `template_type` (text) - order_confirmation, delivery_update, etc.
      - `template_content` (text) - Message template
      - `language` (text) - fr, en, etc.
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can view all messages
    - Users can view their own messages
*/

-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_id text UNIQUE,
  from_number text NOT NULL,
  to_number text NOT NULL,
  message_type text DEFAULT 'text',
  message_content text,
  media_url text,
  user_id uuid REFERENCES auth.users(id),
  order_id uuid REFERENCES orders(id),
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create whatsapp_sessions table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_state text DEFAULT 'idle',
  session_data jsonb DEFAULT '{}'::jsonb,
  last_interaction_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  template_type text NOT NULL,
  template_content text NOT NULL,
  language text DEFAULT 'fr',
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Policies for whatsapp_messages
CREATE POLICY "Admins can view all WhatsApp messages"
  ON whatsapp_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Users can view their own WhatsApp messages"
  ON whatsapp_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert WhatsApp messages"
  ON whatsapp_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service can update WhatsApp messages"
  ON whatsapp_messages FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for whatsapp_sessions
CREATE POLICY "Admins can view all WhatsApp sessions"
  ON whatsapp_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Users can view their own WhatsApp session"
  ON whatsapp_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can manage WhatsApp sessions"
  ON whatsapp_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for whatsapp_templates
CREATE POLICY "Admins can manage WhatsApp templates"
  ON whatsapp_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "All can read active templates"
  ON whatsapp_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order_id ON whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone_number ON whatsapp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_type ON whatsapp_templates(template_type);

-- Insert default templates
INSERT INTO whatsapp_templates (template_name, template_type, template_content, variables) VALUES
('order_confirmation', 'order', 
 E'🎉 Votre commande #{{order_number}} a été confirmée !\n\n📦 Total: {{total}}€\n🚚 Livraison: {{delivery_type}}\n⏱️ Estimation: {{estimated_time}}\n\nSuivez votre commande sur Delikreol.com\n\nMerci de votre confiance ! 🌴',
 '["order_number", "total", "delivery_type", "estimated_time"]'::jsonb),

('order_preparing', 'order',
 E'👨‍🍳 Votre commande #{{order_number}} est en préparation !\n\nLe vendeur prépare votre commande avec soin.\n\n🌟 Restez connecté pour les prochaines étapes !',
 '["order_number"]'::jsonb),

('order_ready', 'order',
 E'✅ Votre commande #{{order_number}} est prête !\n\n{{message}}\n\nBon appétit ! 🍽️',
 '["order_number", "message"]'::jsonb),

('driver_assigned', 'delivery',
 E'🚚 Un livreur a été assigné à votre commande #{{order_number}} !\n\n👤 Livreur: {{driver_name}}\n📱 Tél: {{driver_phone}}\n⏱️ Arrivée estimée: {{eta}}\n\nVous pouvez suivre sa position en temps réel sur l\'app.',
 '["order_number", "driver_name", "driver_phone", "eta"]'::jsonb),

('order_delivered', 'delivery',
 E'🎊 Votre commande #{{order_number}} a été livrée !\n\nNous espérons que vous avez apprécié votre repas.\n\n⭐ N\'oubliez pas d\'évaluer votre expérience sur l\'app !\n\nÀ très bientôt sur Delikreol 🌴',
 '["order_number"]'::jsonb),

('welcome_message', 'onboarding',
 E'Bienvenue sur Delikreol ! 🌴\n\nVotre marketplace martiniquaise pour:\n🍽️ Restaurants locaux\n🥬 Producteurs frais\n🏪 Commerces de proximité\n\nTapez "menu" pour commencer ou "aide" pour assistance.\n\nBon appétit ! 😋',
 '[]'::jsonb)

ON CONFLICT (template_name) DO NOTHING;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_whatsapp_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
