import { executeQuery } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
    params: {
        slug: string;
    };
}

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    status: string;
    updated_at: string;
    page_template: string;
    meta_title: string | null;
    meta_description: string | null;
}

// Dynamic metadata generation based on the page content
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    // Ensure params is fully resolved before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const page = await getPageBySlug(resolvedParams.slug);

    if (!page) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.'
        };
    }

    // Use meta_title if available, otherwise use page title
    const title = page.meta_title || page.title;

    // Use meta_description if available, otherwise generate from content
    let description = page.meta_description;
    if (!description && page.content) {
        // Strip HTML tags for the description
        description = page.content
            .replace(/<[^>]*>/g, '')
            .substring(0, 160);
    }

    return {
        title,
        description: description || 'No description available'
    };
}

async function getPageBySlug(slug: string): Promise<Page | null> {
    try {
        const result = await executeQuery<Page[]>(
            'SELECT * FROM pages WHERE slug = $1 AND status = $2 LIMIT 1',
            [slug, 'published']
        );

        return result && result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
}

export default async function DynamicPage({ params }: PageProps) {
    // Ensure params is fully resolved before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const page = await getPageBySlug(resolvedParams.slug);

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

    // Get the appropriate template class based on the page template
    const getTemplateClass = (template: string) => {
        switch (template) {
            case 'full-width':
                return 'max-w-full';
            case 'sidebar':
                return 'max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8';
            case 'landing-page':
                return 'max-w-full px-0';
            default:
                return 'max-w-4xl'; // default template
        }
    };

    // Get content class based on template
    const contentClass = page.page_template === 'sidebar'
        ? 'md:col-span-2'
        : '';

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <main className={`container mx-auto px-4 py-6 ${getTemplateClass(page.page_template)}`}>
                {page.page_template === 'landing-page' ? (
                    // Landing page doesn't need wrapper
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    />
                ) : (
                    <>
                        {page.page_template === 'sidebar' ? (
                            // Sidebar template
                            <>
                                <article className={`bg-white rounded-lg shadow-md overflow-hidden ${contentClass}`}>
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
                                <aside className="bg-white rounded-lg shadow-md overflow-hidden h-fit">
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold mb-4">Related Information</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">Contact Us</h3>
                                                <p className="text-gray-600 mt-1">Have questions? Contact our support team.</p>
                                                <Link href="/contact" className="text-primary-orange hover:underline mt-1 inline-block">
                                                    Get in touch →
                                                </Link>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">FAQ</h3>
                                                <p className="text-gray-600 mt-1">Find answers to common questions.</p>
                                                <Link href="/faq" className="text-primary-orange hover:underline mt-1 inline-block">
                                                    View FAQ →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </>
                        ) : (
                            // Default template
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
                        )}
                    </>
                )}
            </main>
        </div>
    );
} 