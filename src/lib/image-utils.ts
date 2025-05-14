import { getPlaiceholder } from 'plaiceholder';

/**
 * Generates a placeholder image using plaiceholder
 * @param src Image source URL
 * @returns Base64 placeholder image and dimensions
 */
export async function getImagePlaceholder(src: string) {
    try {
        const buffer = await fetch(src).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
        );

        const { base64, metadata } = await getPlaiceholder(buffer);

        return {
            base64,
            originalWidth: metadata.width,
            originalHeight: metadata.height,
        };
    } catch (error) {
        console.error('Error generating placeholder:', error);
        return {
            base64: '',
            originalWidth: 0,
            originalHeight: 0,
        };
    }
}

/**
 * Determines the optimal image sizes based on screen breakpoints
 * @param imageWidth Original image width
 * @returns Sizes string for Next.js Image component
 */
export function getImageSizes(imageWidth: number): string {
    // If the image is small, just use its native size
    if (imageWidth < 640) {
        return `${imageWidth}px`;
    }

    // Otherwise create responsive sizes
    return `
    (max-width: 640px) 100vw,
    (max-width: 768px) 75vw,
    (max-width: 1024px) 50vw,
    33vw
  `;
}

/**
 * Creates an array of image widths for srcSet
 * @param originalWidth Original image width
 * @returns Array of widths for responsive images
 */
export function getImageWidths(originalWidth: number): number[] {
    // Don't generate sizes larger than the original
    const maxWidth = Math.min(originalWidth, 2048);

    // Common device widths - don't generate sizes larger than the original
    const standardWidths = [320, 640, 750, 828, 1080, 1200, 1920, 2048];
    return standardWidths.filter(width => width <= maxWidth);
} 