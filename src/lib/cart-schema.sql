-- Create the carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  table_id INTEGER REFERENCES tables(id),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  item_count INTEGER DEFAULT 0,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id INTEGER,
  menu_item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the service_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id),
  request_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Create index on session_id for faster cart lookups
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);

-- Create index on cart_id for faster cart items lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- Create index on table_id for faster service request lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON service_requests(table_id); 