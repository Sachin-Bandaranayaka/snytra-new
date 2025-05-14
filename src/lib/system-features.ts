/**
 * System features available for subscription packages
 */

export interface SystemFeature {
    id: string;
    name: string;
    description: string;
    category: string;
}

// Categories of features
export const FEATURE_CATEGORIES = [
    "core",
    "menu_management",
    "order_management",
    "table_management",
    "staff_management",
    "customer_management",
    "reporting",
    "integrations",
    "support"
];

// Map of category IDs to display names
export const CATEGORY_NAMES: Record<string, string> = {
    core: "Core Features",
    menu_management: "Menu Management",
    order_management: "Order Management",
    table_management: "Table Management",
    staff_management: "Staff Management",
    customer_management: "Customer Management",
    reporting: "Reporting & Analytics",
    integrations: "Integrations",
    support: "Support"
};

// Complete list of system features
export const SYSTEM_FEATURES: SystemFeature[] = [
    // Core Features
    {
        id: "online_ordering",
        name: "Online Ordering",
        description: "Allow customers to place orders online",
        category: "core"
    },
    {
        id: "qr_code_menus",
        name: "QR Code Menus",
        description: "Generate QR codes for contactless menu access",
        category: "core"
    },
    {
        id: "website_integration",
        name: "Website Integration",
        description: "Embed ordering system into existing website",
        category: "core"
    },
    {
        id: "mobile_responsive",
        name: "Mobile Responsive Interface",
        description: "Optimized for mobile devices",
        category: "core"
    },
    {
        id: "custom_branding",
        name: "Custom Branding",
        description: "Apply restaurant branding to customer interface",
        category: "core"
    },

    // Menu Management
    {
        id: "menu_items",
        name: "Menu Items Management",
        description: "Create and manage menu items",
        category: "menu_management"
    },
    {
        id: "menu_categories",
        name: "Menu Categories",
        description: "Organize items into categories",
        category: "menu_management"
    },
    {
        id: "item_variants",
        name: "Item Variants",
        description: "Create variations of menu items",
        category: "menu_management"
    },
    {
        id: "item_modifiers",
        name: "Item Modifiers",
        description: "Add options and add-ons to menu items",
        category: "menu_management"
    },
    {
        id: "dietary_labels",
        name: "Dietary Labels",
        description: "Mark items as vegetarian, vegan, gluten-free, etc.",
        category: "menu_management"
    },
    {
        id: "menu_item_images",
        name: "Menu Item Images",
        description: "Upload images for menu items",
        category: "menu_management"
    },
    {
        id: "menu_availability",
        name: "Menu Availability",
        description: "Set times when items are available",
        category: "menu_management"
    },

    // Order Management
    {
        id: "order_tracking",
        name: "Order Tracking",
        description: "Track orders from placement to delivery",
        category: "order_management"
    },
    {
        id: "kitchen_display",
        name: "Kitchen Display System",
        description: "Display orders in kitchen with preparation instructions",
        category: "order_management"
    },
    {
        id: "order_notifications",
        name: "Order Notifications",
        description: "Real-time notifications for new orders",
        category: "order_management"
    },
    {
        id: "order_history",
        name: "Order History",
        description: "Access and search past orders",
        category: "order_management"
    },
    {
        id: "delivery_management",
        name: "Delivery Management",
        description: "Track and manage deliveries",
        category: "order_management"
    },
    {
        id: "takeout_management",
        name: "Takeout Management",
        description: "Manage takeout orders",
        category: "order_management"
    },

    // Table Management
    {
        id: "table_mapping",
        name: "Table Mapping",
        description: "Create digital floor plan of restaurant",
        category: "table_management"
    },
    {
        id: "reservations",
        name: "Reservations",
        description: "Allow customers to reserve tables",
        category: "table_management"
    },
    {
        id: "table_status",
        name: "Table Status Tracking",
        description: "Monitor table availability in real-time",
        category: "table_management"
    },
    {
        id: "waitlist",
        name: "Waitlist Management",
        description: "Manage customer waitlist",
        category: "table_management"
    },
    {
        id: "table_service",
        name: "Table Service Requests",
        description: "Allow customers to request service digitally",
        category: "table_management"
    },

    // Staff Management
    {
        id: "staff_accounts",
        name: "Staff Accounts",
        description: "Create and manage staff user accounts",
        category: "staff_management"
    },
    {
        id: "role_permissions",
        name: "Role-based Permissions",
        description: "Assign different access levels to staff roles",
        category: "staff_management"
    },
    {
        id: "staff_scheduling",
        name: "Staff Scheduling",
        description: "Schedule staff shifts and manage availability",
        category: "staff_management"
    },
    {
        id: "time_tracking",
        name: "Time Tracking",
        description: "Track staff working hours",
        category: "staff_management"
    },
    {
        id: "task_management",
        name: "Task Management",
        description: "Assign and track tasks for staff",
        category: "staff_management"
    },

    // Customer Management
    {
        id: "customer_database",
        name: "Customer Database",
        description: "Store and manage customer information",
        category: "customer_management"
    },
    {
        id: "customer_profiles",
        name: "Customer Profiles",
        description: "View customer order history and preferences",
        category: "customer_management"
    },
    {
        id: "loyalty_program",
        name: "Loyalty Program",
        description: "Reward repeat customers with points and offers",
        category: "customer_management"
    },
    {
        id: "feedback_system",
        name: "Feedback System",
        description: "Collect and manage customer feedback",
        category: "customer_management"
    },
    {
        id: "marketing_tools",
        name: "Marketing Tools",
        description: "Send promotions and updates to customers",
        category: "customer_management"
    },

    // Reporting & Analytics
    {
        id: "sales_reports",
        name: "Sales Reports",
        description: "Generate reports on sales performance",
        category: "reporting"
    },
    {
        id: "inventory_reports",
        name: "Inventory Reports",
        description: "Track inventory levels and usage",
        category: "reporting"
    },
    {
        id: "menu_performance",
        name: "Menu Performance",
        description: "Analyze which menu items sell best",
        category: "reporting"
    },
    {
        id: "customer_analytics",
        name: "Customer Analytics",
        description: "Analyze customer behavior and preferences",
        category: "reporting"
    },
    {
        id: "staff_performance",
        name: "Staff Performance",
        description: "Track staff productivity and performance",
        category: "reporting"
    },
    {
        id: "export_reports",
        name: "Export Reports",
        description: "Export reports to CSV or PDF",
        category: "reporting"
    },

    // Integrations
    {
        id: "payment_processing",
        name: "Payment Processing",
        description: "Accept online payments via Stripe",
        category: "integrations"
    },
    {
        id: "accounting_integration",
        name: "Accounting Integration",
        description: "Integrate with accounting software",
        category: "integrations"
    },
    {
        id: "pos_integration",
        name: "POS Integration",
        description: "Connect with point-of-sale systems",
        category: "integrations"
    },
    {
        id: "delivery_services",
        name: "Delivery Services Integration",
        description: "Connect with third-party delivery services",
        category: "integrations"
    },
    {
        id: "inventory_system",
        name: "Inventory System Integration",
        description: "Connect with inventory management systems",
        category: "integrations"
    },

    // Support
    {
        id: "email_support",
        name: "Email Support",
        description: "Access to email support",
        category: "support"
    },
    {
        id: "priority_support",
        name: "Priority Support",
        description: "Priority handling of support requests",
        category: "support"
    },
    {
        id: "phone_support",
        name: "Phone Support",
        description: "Access to phone support",
        category: "support"
    },
    {
        id: "dedicated_account",
        name: "Dedicated Account Manager",
        description: "Assigned account manager for support",
        category: "support"
    },
    {
        id: "setup_assistance",
        name: "Setup Assistance",
        description: "Help with initial system setup",
        category: "support"
    },
    {
        id: "training",
        name: "Staff Training",
        description: "Training sessions for restaurant staff",
        category: "support"
    }
];

// Helper to get features by category
export function getFeaturesByCategory(category: string): SystemFeature[] {
    return SYSTEM_FEATURES.filter(feature => feature.category === category);
}

// Convert feature IDs to feature objects
export function getFeaturesByIds(featureIds: string[]): SystemFeature[] {
    return featureIds
        .map(id => SYSTEM_FEATURES.find(feature => feature.id === id))
        .filter((feature): feature is SystemFeature => feature !== undefined);
}

// Convert features to a simple array of IDs for storage
export function getFeatureIds(features: SystemFeature[]): string[] {
    return features.map(feature => feature.id);
} 