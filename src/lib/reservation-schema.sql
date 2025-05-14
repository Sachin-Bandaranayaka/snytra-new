-- Reservation System Schema

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20) NOT NULL,
    party_size INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, canceled, completed, no-show
    table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone ON reservations(customer_phone);

-- Create waitlist table for handling overflow when fully booked
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    party_size INTEGER NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- waiting, seated, canceled
    estimated_wait_time INTEGER, -- in minutes
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_date ON waitlist(requested_date);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);

-- Create reservation_settings table for managing availability and timing
CREATE TABLE IF NOT EXISTS reservation_settings (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    max_party_size INTEGER NOT NULL DEFAULT 10,
    min_party_size INTEGER NOT NULL DEFAULT 1,
    reservation_interval INTEGER NOT NULL DEFAULT 30, -- in minutes
    tables_per_interval INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week)
);

-- Create blocked_times table for holidays or special events
CREATE TABLE IF NOT EXISTS blocked_times (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservation_notifications table for tracking communications
CREATE TABLE IF NOT EXISTS reservation_notifications (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- confirmation, reminder, cancellation
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_to VARCHAR(100) NOT NULL,
    method VARCHAR(20) NOT NULL, -- email, sms
    success BOOLEAN NOT NULL,
    message_content TEXT
);

-- Trigger for updating the updated_at field
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reservations table
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Apply trigger to waitlist table
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist;
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON waitlist
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Apply trigger to reservation_settings table
DROP TRIGGER IF EXISTS update_reservation_settings_updated_at ON reservation_settings;
CREATE TRIGGER update_reservation_settings_updated_at
BEFORE UPDATE ON reservation_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert default reservation settings for each day of the week
INSERT INTO reservation_settings (day_of_week, open_time, close_time, max_party_size, min_party_size, reservation_interval, tables_per_interval)
VALUES
    (0, '11:00', '22:00', 10, 1, 30, 4), -- Sunday
    (1, '11:00', '22:00', 10, 1, 30, 4), -- Monday
    (2, '11:00', '22:00', 10, 1, 30, 4), -- Tuesday
    (3, '11:00', '22:00', 10, 1, 30, 4), -- Wednesday
    (4, '11:00', '23:00', 10, 1, 30, 4), -- Thursday
    (5, '11:00', '23:00', 10, 1, 30, 4), -- Friday
    (6, '10:00', '23:00', 10, 1, 30, 4)  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING; 