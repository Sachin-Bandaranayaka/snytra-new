require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * This script sets up the product catalog in Stripe
 * It creates three tiers: Basic, Standard, and Premium
 * Each product includes metadata for feature flags
 */
async function setupProductCatalog() {
  console.log('Setting up Stripe product catalog...');

  try {
    // Basic Plan
    const basicProduct = await stripe.products.create({
      name: 'Basic Plan',
      description: 'Perfect for small businesses',
      metadata: {
        tier: 'basic',
        features: JSON.stringify([
          'menu_management',
          'online_ordering',
          'basic_analytics',
          'email_support'
        ])
      },
      active: true,
    });

    const basicMonthlyPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 4999, // $49.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'basic',
        billing_cycle: 'monthly'
      }
    });

    const basicYearlyPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 47988, // $479.88 ($39.99/mo)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'basic',
        billing_cycle: 'yearly'
      }
    });

    // Standard Plan
    const standardProduct = await stripe.products.create({
      name: 'Standard Plan',
      description: 'Great for growing businesses',
      metadata: {
        tier: 'standard',
        features: JSON.stringify([
          'menu_management',
          'online_ordering',
          'advanced_analytics',
          'email_support',
          'reservation_system',
          'inventory_management',
          'priority_support',
          'table_management'
        ])
      },
      active: true,
    });

    const standardMonthlyPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'standard',
        billing_cycle: 'monthly'
      }
    });

    const standardYearlyPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 95988, // $959.88 ($79.99/mo)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'standard',
        billing_cycle: 'yearly'
      }
    });

    // Premium Plan
    const premiumProduct = await stripe.products.create({
      name: 'Premium Plan',
      description: 'Complete solution for established businesses',
      metadata: {
        tier: 'premium',
        features: JSON.stringify([
          'menu_management',
          'online_ordering',
          'advanced_analytics',
          'email_support',
          'reservation_system',
          'inventory_management',
          'priority_support',
          'table_management',
          'multi_location',
          'custom_reporting',
          'api_access',
          'white_label',
          'dedicated_account_manager'
        ])
      },
      active: true,
    });

    const premiumMonthlyPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 19999, // $199.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'premium',
        billing_cycle: 'monthly'
      }
    });

    const premiumYearlyPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 191988, // $1919.88 ($159.99/mo)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'premium',
        billing_cycle: 'yearly'
      }
    });

    console.log('Product catalog set up successfully!');
    console.log('Products created:');
    console.log(`Basic Plan: ${basicProduct.id}`);
    console.log(`  Monthly Price: ${basicMonthlyPrice.id}`);
    console.log(`  Yearly Price: ${basicYearlyPrice.id}`);
    console.log(`Standard Plan: ${standardProduct.id}`);
    console.log(`  Monthly Price: ${standardMonthlyPrice.id}`);
    console.log(`  Yearly Price: ${standardYearlyPrice.id}`);
    console.log(`Premium Plan: ${premiumProduct.id}`);
    console.log(`  Monthly Price: ${premiumMonthlyPrice.id}`);
    console.log(`  Yearly Price: ${premiumYearlyPrice.id}`);

    return {
      basic: {
        productId: basicProduct.id,
        monthlyPriceId: basicMonthlyPrice.id,
        yearlyPriceId: basicYearlyPrice.id
      },
      standard: {
        productId: standardProduct.id,
        monthlyPriceId: standardMonthlyPrice.id,
        yearlyPriceId: standardYearlyPrice.id
      },
      premium: {
        productId: premiumProduct.id,
        monthlyPriceId: premiumMonthlyPrice.id,
        yearlyPriceId: premiumYearlyPrice.id
      }
    };
  } catch (error) {
    console.error('Error setting up product catalog:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  setupProductCatalog()
    .then(result => {
      console.log('Save these IDs in your environment variables or database:');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('Failed to set up product catalog:', err);
      process.exit(1);
    });
}

module.exports = { setupProductCatalog }; 