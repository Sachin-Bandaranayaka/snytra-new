const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedSubscriptionPlans() {
    const client = await pool.connect();
    
    try {
        console.log('🌱 Seeding subscription plans...');
        
        await client.query('BEGIN');
        
        // Clear existing subscription plans
        await client.query('DELETE FROM subscription_plans');
        
        // Create sample subscription plans
        const plans = [
            {
                name: 'Starter',
                description: 'Perfect for small restaurants getting started',
                price: 29.99,
                billing_interval: 'monthly',
                features: JSON.stringify([
                    'menu_management',
                    'basic_orders',
                    'customer_support'
                ]),
                feature_limits: JSON.stringify({
                    max_menu_items: 50,
                    max_orders_per_month: 100,
                    max_staff_accounts: 2
                }),
                trial_settings: JSON.stringify({
                    trial_days: 14,
                    trial_features: ['menu_management', 'basic_orders']
                }),
                is_active: true
            },
            {
                name: 'Professional',
                description: 'Advanced features for growing restaurants',
                price: 79.99,
                billing_interval: 'monthly',
                features: JSON.stringify([
                    'menu_management',
                    'advanced_orders',
                    'inventory_management',
                    'analytics',
                    'customer_support',
                    'staff_management'
                ]),
                feature_limits: JSON.stringify({
                    max_menu_items: 200,
                    max_orders_per_month: 1000,
                    max_staff_accounts: 10
                }),
                trial_settings: JSON.stringify({
                    trial_days: 14,
                    trial_features: ['menu_management', 'advanced_orders', 'analytics']
                }),
                is_active: true
            },
            {
                name: 'Enterprise',
                description: 'Complete solution for large restaurant chains',
                price: 199.99,
                billing_interval: 'monthly',
                features: JSON.stringify([
                    'menu_management',
                    'advanced_orders',
                    'inventory_management',
                    'analytics',
                    'customer_support',
                    'staff_management',
                    'multi_location',
                    'api_access',
                    'custom_integrations'
                ]),
                feature_limits: JSON.stringify({
                    max_menu_items: -1, // unlimited
                    max_orders_per_month: -1, // unlimited
                    max_staff_accounts: -1, // unlimited
                    max_locations: -1 // unlimited
                }),
                trial_settings: JSON.stringify({
                    trial_days: 30,
                    trial_features: ['menu_management', 'advanced_orders', 'analytics', 'multi_location']
                }),
                is_active: true
            },
            {
                name: 'Basic',
                description: 'Free plan with limited features',
                price: 0,
                billing_interval: 'monthly',
                features: JSON.stringify([
                    'basic_menu',
                    'basic_orders'
                ]),
                feature_limits: JSON.stringify({
                    max_menu_items: 10,
                    max_orders_per_month: 20,
                    max_staff_accounts: 1
                }),
                trial_settings: JSON.stringify({
                    trial_days: 0,
                    trial_features: []
                }),
                is_active: true
            }
        ];
        
        for (const plan of plans) {
            await client.query(`
                INSERT INTO subscription_plans (
                    name, description, price, billing_interval, features, 
                    feature_limits, trial_settings, is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            `, [
                plan.name,
                plan.description,
                plan.price,
                plan.billing_interval,
                plan.features,
                plan.feature_limits,
                plan.trial_settings,
                plan.is_active
            ]);
            
            console.log(`✅ Created plan: ${plan.name}`);
        }
        
        await client.query('COMMIT');
        console.log('🎉 Subscription plans seeded successfully!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding subscription plans:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the seeding function
seedSubscriptionPlans()
    .then(() => {
        console.log('Subscription plans seeding completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Subscription plans seeding failed:', error);
        process.exit(1);
    });