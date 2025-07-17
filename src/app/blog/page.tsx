import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import SEO, { createArticleSchema } from "@/components/SEO";
import { sql } from "@/lib/db";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
    title: "Blog & Resources | RestaurantOS",
    description: "Explore the latest articles, guides, and tips for optimizing your restaurant operations and growing your business.",
    keywords: "restaurant blog, food industry insights, restaurant management tips, restaurant technology",
    openGraph: {
        title: "Blog & Resources | RestaurantOS",
        description: "Explore the latest articles, guides, and tips for restaurant management.",
        images: [{ url: "/images/blog/blog-header.jpg" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog & Resources | RestaurantOS",
        description: "Explore the latest articles, guides, and tips for restaurant management.",
        images: ["/images/blog/blog-header.jpg"],
    },
};

// This function fetches blog posts from the database with pagination
async function getBlogPosts(page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;
        
        // Get posts with pagination
        const posts = await sql`
            SELECT p.id, p.title, 
                  CASE
                    WHEN p.slug IS NULL OR p.slug = '' THEN LOWER(REPLACE(REPLACE(p.title, ' ', '-'), ',', ''))
                    ELSE LOWER(REPLACE(REPLACE(p.slug, ' ', '-'), ',', ''))
                  END as slug,
                  p.excerpt, p.featured_image as image, 
                  p.published_at as "publishedAt", u.name as author,
                  COALESCE(u.profile_image, '/images/placeholder.jpg') as "authorImage",
                  c.name as category
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
            LEFT JOIN blog_categories c ON pc.category_id = c.id
            WHERE p.status = 'published'
            GROUP BY p.id, u.name, u.profile_image, c.name
            ORDER BY p.published_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Get total count for pagination
        const totalResult = await sql`
            SELECT COUNT(DISTINCT p.id) as total
            FROM blog_posts p
            WHERE p.status = 'published'
        `;

        const total = parseInt(totalResult[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            posts,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Return empty result if query fails
        return {
            posts: [],
            pagination: {
                total: 0,
                totalPages: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }
}

// This function fetches categories from the database
async function getCategories() {
    try {
        const categories = await sql`
            SELECT DISTINCT c.name
            FROM blog_categories c
            JOIN blog_post_categories pc ON c.id = pc.category_id
            JOIN blog_posts p ON pc.post_id = p.id AND p.status = 'published'
        `;

        return ["All", ...categories.map(c => c.name)];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return ["All"];
    }
}

export default async function BlogPage({ 
    searchParams 
}: { 
    searchParams: { page?: string } 
}) {
    // Extract and validate page parameter
    const pageParam = searchParams.page;
    const currentPage = pageParam ? parseInt(pageParam) : 1;
    
    // Validate page number
    if (currentPage < 1 || isNaN(currentPage)) {
        redirect('/blog');
    }
    
    const { posts, pagination } = await getBlogPosts(currentPage, 10);
    const categories = await getCategories();
    
    // Redirect if page number is too high
    if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
        redirect('/blog');
    }

    // Create schema.org Article markup for the first post
    const schemaArticle = posts.length > 0 ? createArticleSchema({
        headline: posts[0].title,
        image: `https://restaurantos.com${posts[0].image}`,
        datePublished: posts[0].publishedAt,
        dateModified: posts[0].publishedAt,
        author: {
            name: posts[0].author,
            url: "https://restaurantos.com/team",
        },
        publisher: {
            name: "RestaurantOS",
            logo: "https://restaurantos.com/logo.png",
        },
    }) : null;

    return (
        <>
            <SEO
                title="Blog & Resources | RestaurantOS"
                description="Explore the latest articles, guides, and tips for restaurant management."
                ogImage="/images/blog/blog-header.jpg"
                schema={schemaArticle}
            />

            {/* Header */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-6">
                        Blog & Resources
                    </h1>
                    <p className="text-xl text-center max-w-4xl mx-auto">
                        Explore our collection of articles, guides, and resources to help you optimize your restaurant operations and grow your business.
                    </p>
                </div>
            </section>

            {/* Categories */}
            <section className="border-b border-gray-200 py-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={category === "All" ? "/blog" : `/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`px-4 py-2 rounded-full transition-colors ${category === "All"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-charcoal hover:bg-gray-200"
                                    }`}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
                                <Link href={`/blog/${post.slug ? post.slug.toLowerCase().replace(/\s+/g, '-') : post.id}`} className="block">
                                    <div className="aspect-video relative">
                                        {post.image ? (
                                            <Image
                                                src={post.image}
                                                alt={post.title || 'Blog post'}
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
                                        <div className="flex items-center mb-4">
                                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                                                {post.category}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-auto">
                                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold mb-3 text-charcoal">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 relative rounded-full overflow-hidden mr-3">
                                                <Image
                                                    src={post.authorImage || '/images/placeholder.jpg'}
                                                    alt={post.author || 'Author'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-charcoal">
                                                {post.author}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-12">
                        <Pagination 
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            className=""
                        />
                    </div>
                </div>
            </section>

            {/* Newsletter Signup */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Subscribe to Our Newsletter
                        </h2>
                        <p className="text-charcoal mb-8">
                            Get the latest articles, resources, and restaurant management tips delivered directly to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}