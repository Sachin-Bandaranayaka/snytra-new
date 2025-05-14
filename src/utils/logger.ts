/**
 * Development-only logger utility for debugging
 * Helps track data types and values without setting breakpoints
 */
export const debugLog = (context: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
        // If we're in a browser environment
        if (typeof window !== 'undefined') {
            console.groupCollapsed(`%c${context}`, 'background: #333; color: #bada55; padding: 2px 4px; border-radius: 2px;');
            console.log('Value:', data);
            console.log('Type:', typeof data);
            console.log('Is Array:', Array.isArray(data));

            if (typeof data === 'object' && data !== null) {
                console.log('Keys:', Object.keys(data));

                // If it's an array with items, log the first item's type
                if (Array.isArray(data) && data.length > 0) {
                    console.log('First item type:', typeof data[0]);
                    console.log('First item sample:', data[0]);
                }

                // For objects or arrays with numeric-looking properties, check and log their types
                if (typeof data === 'object' && data !== null) {
                    const numericProps = ['price', 'subtotal', 'total', 'amount', 'total_amount'];
                    numericProps.forEach(prop => {
                        if (data[prop] !== undefined) {
                            console.log(`Property "${prop}":`, data[prop], `(${typeof data[prop]})`);
                        }
                    });
                }
            }

            console.groupEnd();
        } else {
            // In Node.js environment
            console.log(`[DEBUG] ${context}:`);
            console.log('Value:', data);
            console.log('Type:', typeof data);
            console.log('Is Array:', Array.isArray(data));

            if (typeof data === 'object' && data !== null) {
                console.log('Keys:', Object.keys(data));

                // If it's an array with items, log the first item's type
                if (Array.isArray(data) && data.length > 0) {
                    console.log('First item type:', typeof data[0]);
                    console.log('First item sample:', data[0]);
                }

                // For objects or arrays with numeric-looking properties, check and log their types
                if (typeof data === 'object' && data !== null) {
                    const numericProps = ['price', 'subtotal', 'total', 'amount', 'total_amount'];
                    numericProps.forEach(prop => {
                        if (data[prop] !== undefined) {
                            console.log(`Property "${prop}":`, data[prop], `(${typeof data[prop]})`);
                        }
                    });
                }
            }

            console.log('-------------------');
        }
    }
};

/**
 * Log server-side API request information
 */
export const logApiRequest = (method: string, url: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[API ${method}] ${url}`);
        if (data) {
            console.log('Request data:', data);
        }
    }
};

/**
 * Log server-side API response information
 */
export const logApiResponse = (method: string, url: string, status: number, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[API ${method}] ${url} - Status: ${status}`);
        if (data) {
            console.log('Response data:', data);
        }
    }
}; 