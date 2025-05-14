import { pool } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
    params: {
        slug: string;
    };
}

// Dynamic metadata generation based on the page content
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const page = await getPageBySlug(params.slug);

    if (!page) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.'
        };
    }

    // Strip HTML tags for the description
    const description = page.content
        ? page.content.replace(/<[^>]*>/g, '').substring(0, 160)
        : 'No description available';

    return {
        title: page.title,
        description
    };
}

async function getPageBySlug(slug: string) {
    try {
        const result = await pool.query(
            'SELECT * FROM pages WHERE slug = $1 AND status = $2 LIMIT 1',
            [slug, 'published']
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
}

export default async function DynamicPage({ params }: PageProps) {
    const page = await getPageBySlug(params.slug);

    // If page doesn't exist or is not published, show 404
    if (!page) {
        notFound();
    }

    // Format the date for display
    const formattedDate = new Date(page.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{page.title}</h1>

                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                            dangerouslySetInnerHTML={{ __html: page.content || '' }}
                        />

                        <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500">
                            Last updated: {formattedDate}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
} 