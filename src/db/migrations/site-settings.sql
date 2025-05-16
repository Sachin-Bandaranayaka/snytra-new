-- Create a settings table for system-wide configurations
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('general', '{"siteName": "Snytra", "siteDescription": "Restaurant Management System", "contactEmail": "contact@snytra.com"}'),
('appearance', '{"theme": "default", "logo": null, "favicon": null}'),
('email', '{"supportEmail": "support@snytra.com"}'),
('advanced', '{"enableRegistration": true, "maintenanceMode": false}')
ON CONFLICT (key) DO NOTHING;

-- Add function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 