-- Staff role table
CREATE TABLE IF NOT EXISTS staff_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Make sure we have some default roles
INSERT INTO staff_roles (name, description, permissions)
VALUES 
    ('admin', 'Administrator with full access', '{"orders": "write", "menu": "write", "staff": "write", "reservations": "write", "finances": "write", "settings": "write"}'),
    ('manager', 'Restaurant manager', '{"orders": "write", "menu": "write", "staff": "write", "reservations": "write", "finances": "read", "settings": "read"}'),
    ('chef', 'Kitchen staff', '{"orders": "write", "menu": "read", "staff": "none", "reservations": "read", "finances": "none", "settings": "none"}'),
    ('server', 'Wait staff', '{"orders": "write", "menu": "read", "staff": "none", "reservations": "read", "finances": "none", "settings": "none"}'),
    ('host', 'Front of house staff', '{"orders": "read", "menu": "read", "staff": "none", "reservations": "write", "finances": "none", "settings": "none"}')
ON CONFLICT (name) DO NOTHING;

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    role_id INTEGER REFERENCES staff_roles(id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff shift table
CREATE TABLE IF NOT EXISTS staff_shifts (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    break_minutes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'missed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff performance metrics
CREATE TABLE IF NOT EXISTS staff_performance (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    orders_handled INTEGER DEFAULT 0,
    tables_served INTEGER DEFAULT 0,
    average_order_time INTEGER, -- In minutes
    customer_satisfaction NUMERIC(3,2), -- Score between 1-5
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (staff_id, metric_date)
);

-- Messages between staff
CREATE TABLE IF NOT EXISTS staff_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    recipient_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_timestamp trigger to all staff-related tables
DO $$
DECLARE
    tables TEXT[] := ARRAY['staff_roles', 'staff', 'staff_shifts', 'staff_performance', 'staff_messages'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_timestamp ON %I;
            CREATE TRIGGER update_timestamp
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql; 