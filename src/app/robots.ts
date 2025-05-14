import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://restaurantos.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/dashboard-new/',
                '/staff/',
                '/kitchen/',
                '/api/',
                '/admin/',
                '/test-*',
                '/db-test/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
} 