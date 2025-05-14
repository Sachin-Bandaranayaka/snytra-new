-- FAQ Tables Migration

-- Create FAQ categories table
CREATE TABLE IF NOT EXISTS faq_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES faq_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_categories_is_active ON faq_categories(is_active);

-- Insert default FAQ categories
INSERT INTO faq_categories (name, display_order, is_active) 
VALUES 
    ('General', 1, true),
    ('Pricing & Plans', 2, true),
    ('Features', 3, true),
    ('Technical Support', 4, true)
ON CONFLICT DO NOTHING;

-- Insert default FAQs
INSERT INTO faqs (category_id, question, answer, display_order, is_published) 
VALUES 
    ((SELECT id FROM faq_categories WHERE name = 'Pricing & Plans'), 
     'How does the trial work?', 
     'You get a 14-day free trial with full access to all features. No credit card required to start. You can upgrade to a paid plan at any time during or after your trial.',
     1, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'Pricing & Plans'), 
     'Can I change plans later?', 
     'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your plan will take effect at the end of your current billing cycle.',
     2, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'Pricing & Plans'), 
     'Is there a setup fee?', 
     'No, there are no setup fees or hidden charges. You only pay the advertised price for your subscription plan.',
     3, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'Pricing & Plans'), 
     'What payment methods do you accept?', 
     'We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support PayPal for subscription payments.',
     4, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'General'), 
     'What is RestaurantOS?', 
     'RestaurantOS is a comprehensive restaurant management system that helps streamline menu management, orders, reservations, and more to improve your restaurant operations.',
     1, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'Features'), 
     'Can I use RestaurantOS on mobile devices?', 
     'Yes, RestaurantOS is fully responsive and works on smartphones, tablets, and desktop computers.',
     1, true),
     
    ((SELECT id FROM faq_categories WHERE name = 'Technical Support'), 
     'How do I get help if I have a problem?', 
     'Our support team is available 24/7 via live chat, email, or phone. Premium subscribers also get dedicated support with priority response times.',
     1, true)
ON CONFLICT DO NOTHING; 