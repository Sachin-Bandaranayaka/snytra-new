/**
 * Adds CSS variables for restaurant branding colors to the document root element.
 * This allows us to use these colors throughout the application without prop drilling.
 * 
 * @param primaryColor - The restaurant's primary color (hex)
 * @param secondaryColor - The restaurant's secondary color (hex)
 */
export function createCssVariables(primaryColor: string, secondaryColor: string): void {
    // Apply colors as CSS variables on :root
    document.documentElement.style.setProperty('--restaurant-primary-color', primaryColor);
    document.documentElement.style.setProperty('--restaurant-secondary-color', secondaryColor);

    // Also create a hover/lighter versions
    document.documentElement.style.setProperty('--restaurant-primary-color-light', lightenColor(primaryColor, 10));
    document.documentElement.style.setProperty('--restaurant-secondary-color-light', lightenColor(secondaryColor, 10));

    // And darker versions for active states
    document.documentElement.style.setProperty('--restaurant-primary-color-dark', darkenColor(primaryColor, 10));
    document.documentElement.style.setProperty('--restaurant-secondary-color-dark', darkenColor(secondaryColor, 10));
}

/**
 * Helper function to lighten a color by a given percentage
 */
function lightenColor(color: string, percent: number): string {
    try {
        // Remove # if present
        color = color.replace('#', '');

        // Convert to RGB
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        // Calculate lighter color
        const lighter = [r, g, b].map(c => {
            const lightened = Math.min(c + Math.floor((255 - c) * (percent / 100)), 255);
            // Convert to hex and pad with 0 if needed
            return lightened.toString(16).padStart(2, '0');
        });

        return `#${lighter.join('')}`;
    } catch (error) {
        console.error('Error lightening color:', error);
        return color;
    }
}

/**
 * Helper function to darken a color by a given percentage
 */
function darkenColor(color: string, percent: number): string {
    try {
        // Remove # if present
        color = color.replace('#', '');

        // Convert to RGB
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        // Calculate darker color
        const darker = [r, g, b].map(c => {
            const darkened = Math.max(c - Math.floor(c * (percent / 100)), 0);
            // Convert to hex and pad with 0 if needed
            return darkened.toString(16).padStart(2, '0');
        });

        return `#${darker.join('')}`;
    } catch (error) {
        console.error('Error darkening color:', error);
        return color;
    }
} 