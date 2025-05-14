-- Staff Scheduling Schema

-- Create staff_shifts table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff_shifts (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster querying of shifts by date
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON staff_shifts(shift_date);

-- Add index for faster querying of shifts by staff
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_id ON staff_shifts(staff_id);

-- Create tables table if it doesn't exist (different schema than in schema.sql to match our updated implementation)
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster querying of tables by status
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

-- Create timesheet table for tracking staff hours
CREATE TABLE IF NOT EXISTS timesheet (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    shift_id INTEGER REFERENCES staff_shifts(id) ON DELETE SET NULL,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    hours_worked DECIMAL(5, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster querying of timesheet by staff
CREATE INDEX IF NOT EXISTS idx_timesheet_staff_id ON timesheet(staff_id);

-- Create a function to update hours_worked when clock_out is set
CREATE OR REPLACE FUNCTION update_hours_worked()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_out IS NOT NULL THEN
        NEW.hours_worked = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert or update
DROP TRIGGER IF EXISTS update_timesheet_hours ON timesheet;
CREATE TRIGGER update_timesheet_hours
BEFORE INSERT OR UPDATE ON timesheet
FOR EACH ROW
EXECUTE FUNCTION update_hours_worked();

-- Alter tables in the existing schema.sql to add missing columns if needed
DO $$
BEGIN
    -- Check if some tables or columns might be missing in existing schema
    
    -- Add location column to tables if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tables' AND column_name = 'location'
    ) THEN
        ALTER TABLE tables ADD COLUMN location VARCHAR(100);
    END IF;
    
    -- Add email_sent column to orders if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'email_sent'
    ) THEN
        ALTER TABLE orders ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
END
$$; 