-- Create the notification_logs table for tracking all notification attempts
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_type VARCHAR(50) NOT NULL,
    sent_by VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- Create the user_notification_preferences table for storing user preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookup by user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- Create a trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_notification_logs_updated_at ON notification_logs;
CREATE TRIGGER update_notification_logs_updated_at
BEFORE UPDATE ON notification_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 