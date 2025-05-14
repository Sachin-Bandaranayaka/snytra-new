/**
 * Recursively converts string numeric values to actual numbers
 * This is useful when handling data from PostgreSQL which returns numeric values as strings
 */
export function convertNumericStrings<T>(data: T): T {
    // Handle null/undefined
    if (data === null || data === undefined) {
        return data;
    }

    // Handle primitives
    if (typeof data !== 'object') {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(convertNumericStrings) as unknown as T;
    }

    // Handle objects
    const result = { ...data };

    for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            const value = result[key];

            if (typeof value === 'string' && !isNaN(Number(value))) {
                // Check if it looks like a numeric string (including decimal numbers)
                if (/^-?\d+(\.\d+)?$/.test(value)) {
                    (result as any)[key] = parseFloat(value);
                }
            } else if (typeof value === 'object' && value !== null) {
                // Recursively process nested objects and arrays
                (result as any)[key] = convertNumericStrings(value);
            }
        }
    }

    return result;
}

/**
 * Process CartItem to ensure price and subtotal are numbers
 */
export function processCartItem(item: any): any {
    return {
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
    };
}

/**
 * Process MenuItem to ensure price is a number
 */
export function processMenuItem(item: any): any {
    return {
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
    };
}

/**
 * Process Order to ensure total_amount and prices are numbers
 */
export function processOrder(order: any): any {
    const processedOrder = {
        ...order,
        total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount
    };

    if (order.order_items && Array.isArray(order.order_items)) {
        processedOrder.order_items = order.order_items.map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal
        }));
    }

    return processedOrder;
} 