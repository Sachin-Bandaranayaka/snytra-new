export interface Restaurant {
    id: number;
    name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
}

export interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number; // Explicitly typed as number
    image_url: string | null;
    is_available: boolean;
    category_id: number;
    category_name?: string;
    labels?: {
        vegetarian?: boolean;
        vegan?: boolean;
        gluten_free?: boolean;
        spicy?: boolean;
    } | null;
}

export interface CartItem {
    id: number;
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    price: number; // Explicitly typed as number
    subtotal: number; // Explicitly typed as number
    specialInstructions?: string;
}

export interface Cart {
    id?: number;
    sessionId: string;
    tableId?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    itemCount: number;
    subtotal: number; // Explicitly typed as number
    items: CartItem[];
}

export interface Order {
    id: number;
    order_number: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    total_amount: number; // Explicitly typed as number
    status: string;
    created_at: string;
    updated_at: string;
    table_id: number | null;
    payment_method: string | null;
    order_items: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price: number; // Explicitly typed as number
    subtotal: number; // Explicitly typed as number
    special_instructions: string | null;
} 