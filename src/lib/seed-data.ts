import { pool } from './db';
import { hash } from 'bcrypt';

/**
 * Seeds the database with sample data for testing
 */
async function seedDatabase() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting database seed...');

        await client.query('BEGIN');

        // Clear existing data (if needed)
        await client.query('TRUNCATE users, restaurants, orders, order_items CASCADE');

        // Create a test user
        const passwordHash = await hash('password123', 10);
        const userResult = await client.query(`
      INSERT INTO users (name, email, password_hash, role, subscription_plan)
      VALUES ('Test User', 'test@example.com', $1, 'admin', 'starter')
      RETURNING id
    `, [passwordHash]);

        const userId = userResult.rows[0].id;

        // Create restaurants
        const restaurant1Result = await client.query(`
      INSERT INTO restaurants (user_id, name, description, address, phone, email)
      VALUES ($1, 'Pizza Palace', 'Best pizza in town', '123 Main St', '555-1234', 'info@pizzapalace.com')
      RETURNING id
    `, [userId]);

        const restaurant2Result = await client.query(`
      INSERT INTO restaurants (user_id, name, description, address, phone, email)
      VALUES ($1, 'Burger Bistro', 'Gourmet burgers', '456 Elm St', '555-5678', 'info@burgerbistro.com')
      RETURNING id
    `, [userId]);

        const restaurant1Id = restaurant1Result.rows[0].id;
        const restaurant2Id = restaurant2Result.rows[0].id;

        // Create sample orders for first restaurant
        const order1Result = await client.query(`
      INSERT INTO orders (
        restaurant_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        status, 
        total_amount, 
        payment_status, 
        payment_method
      )
      VALUES ($1, 'John Doe', 'john@example.com', '555-1111', 'completed', 32.50, 'paid', 'credit_card')
      RETURNING id
    `, [restaurant1Id]);

        const order2Result = await client.query(`
      INSERT INTO orders (
        restaurant_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        status, 
        total_amount, 
        payment_status, 
        payment_method
      )
      VALUES ($1, 'Jane Smith', 'jane@example.com', '555-2222', 'pending', 45.75, 'pending', 'credit_card')
      RETURNING id
    `, [restaurant1Id]);

        // Create sample orders for second restaurant
        const order3Result = await client.query(`
      INSERT INTO orders (
        restaurant_id, 
        customer_name, 
        customer_email, 
        customer_phone, 
        status, 
        total_amount, 
        payment_status, 
        payment_method
      )
      VALUES ($1, 'Alice Johnson', 'alice@example.com', '555-3333', 'completed', 28.99, 'paid', 'credit_card')
      RETURNING id
    `, [restaurant2Id]);

        // Create order items
        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Pepperoni Pizza', 2, 12.99, 25.98)
    `, [order1Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Garlic Bread', 1, 6.50, 6.50)
    `, [order1Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Veggie Supreme Pizza', 1, 14.99, 14.99)
    `, [order2Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Cheesy Bread', 1, 8.99, 8.99)
    `, [order2Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Chicken Wings', 1, 11.99, 11.99)
    `, [order2Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'Classic Cheeseburger', 2, 10.99, 21.98)
    `, [order3Result.rows[0].id]);

        await client.query(`
      INSERT INTO order_items (order_id, menu_item_name, quantity, price, subtotal)
      VALUES ($1, 'French Fries', 1, 4.99, 4.99)
    `, [order3Result.rows[0].id]);

        // Commit transaction
        await client.query('COMMIT');

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// If this file is run directly, seed the database
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Database seed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database seed failed:', error);
            process.exit(1);
        });
}

export default seedDatabase; 