import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import SEO, { createArticleSchema } from "@/components/SEO";

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    // Properly await the params object by accessing it in a Promise context
    const { slug } = await Promise.resolve(params);

    if (!slug) {
        return {
            title: "Post Not Found | RestaurantOS",
            description: "The requested blog post could not be found.",
        };
    }

    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found | RestaurantOS",
            description: "The requested blog post could not be found.",
        };
    }

    return {
        title: `${post.title} | RestaurantOS Blog`,
        description: post.excerpt || `Read about ${post.title} on RestaurantOS blog`,
        keywords: `${post.title}, restaurant management, restaurant technology, ${post.category || 'blog'}`,
        openGraph: {
            title: post.title,
            description: post.excerpt || `Read about ${post.title}`,
            images: post.image ? [{ url: post.image }] : undefined,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || `Read about ${post.title}`,
            images: post.image ? [post.image] : undefined,
        },
    };
}

// Function to get a post by slug
async function getPostBySlug(slug: string) {
    try {
        // Clean the slug parameter to match how we store it in the database
        const cleanSlug = slug.toLowerCase().replace(/-/g, ' ');

        const posts = await sql`
      SELECT p.id, p.title, p.slug, p.content, p.excerpt, 
        p.featured_image as image, p.published_at as "publishedAt", 
        u.name as author, COALESCE(u.profile_image, '/images/placeholder.jpg') as "authorImage",
        c.name as category
      FROM blog_posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
      LEFT JOIN blog_categories c ON pc.category_id = c.id
      WHERE (
        LOWER(p.slug) = ${cleanSlug} 
        OR LOWER(REPLACE(p.title, ' ', '-')) = ${slug}
      )
      AND p.status = 'published'
    `;

        if (posts.length === 0) {
            return null;
        }

        return posts[0];
    } catch (error) {
        console.error("Error fetching post by slug:", error);
        return null;
    }
}

// Get related posts
async function getRelatedPosts(postId: number, categoryName: string) {
    try {
        const posts = await sql`
      SELECT p.id, p.title, 
        CASE
          WHEN p.slug IS NULL OR p.slug = '' THEN LOWER(REPLACE(REPLACE(p.title, ' ', '-'), ',', ''))
          ELSE LOWER(REPLACE(REPLACE(p.slug, ' ', '-'), ',', ''))
        END as slug,
        p.excerpt, p.featured_image as image
      FROM blog_posts p
      LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
      LEFT JOIN blog_categories c ON pc.category_id = c.id
      WHERE p.id != ${postId} 
        AND c.name = ${categoryName || ''}
        AND p.status = 'published'
      LIMIT 3
    `;

        return posts;
    } catch (error) {
        console.error("Error fetching related posts:", error);
        return [];
    }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    // Properly await the params object by accessing it in a Promise context
    const { slug } = await Promise.resolve(params);

    if (!slug) {
        notFound();
    }

    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Get related posts
    const relatedPosts = await getRelatedPosts(post.id, post.category);

    // Create schema.org Article markup for SEO
    const schemaArticle = createArticleSchema({
        headline: post.title,
        image: post.image ? `https://restaurantos.com${post.image}` : undefined,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: {
            name: post.author,
            url: "https://restaurantos.com/team",
        },
        publisher: {
            name: "RestaurantOS",
            logo: "https://restaurantos.com/logo.png",
        },
    });

    const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <>
            <SEO
                title={`${post.title} | RestaurantOS Blog`}
                description={post.excerpt || `Read about ${post.title}`}
                ogImage={post.image}
                schema={schemaArticle}
            />

            {/* Hero Section */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Back to Blog
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-bold text-primary mt-4 mb-4">
                            {post.title}
                        </h1>

                        <div className="flex items-center mb-8">
                            <div className="flex items-center">
                                <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
                                    <Image
                                        src={post.authorImage || '/images/placeholder.jpg'}
                                        alt={post.author || 'Author'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-charcoal">{post.author}</p>
                                    <p className="text-sm text-gray-500">{formattedDate}</p>
                                </div>
                            </div>
                            {post.category && (
                                <span className="ml-auto bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    {post.category}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            {post.image && (
                <div className="container mx-auto px-6 -mt-8 mb-8">
                    <div className="max-w-4xl mx-auto relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <section className="py-8">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto">
                        <article className="prose prose-lg md:prose-xl prose-headings:text-primary prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: post.content || '<p>No content available</p>',
                                }}
                                className="overflow-x-auto"
                            />
                        </article>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-2xl font-bold text-primary mb-8">Related Posts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedPosts.map((relatedPost) => (
                                    <article
                                        key={relatedPost.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <Link href={`/blog/${relatedPost.slug}`} className="block">
                                            <div className="aspect-video relative">
                                                {relatedPost.image ? (
                                                    <Image
                                                        src={relatedPost.image}
                                                        alt={relatedPost.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400">No image available</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-lg mb-2">{relatedPost.title}</h3>
                                                {relatedPost.excerpt && (
                                                    <p className="text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                                                )}
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 bg-beige">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Want to learn more?
                        </h2>
                        <p className="text-lg text-charcoal mb-8">
                            Explore our resources to help you optimize your restaurant operations
                            and grow your business.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/blog"
                                className="px-6 py-3 bg-white text-primary border border-primary rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Explore Blog
                            </Link>
                            <Link
                                href="/contact"
                                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
} 