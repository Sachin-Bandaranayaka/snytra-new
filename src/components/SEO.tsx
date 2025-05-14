import { Metadata } from 'next';
import Head from 'next/head';

export type SeoProps = {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile' | 'book' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
    twitterCard?: 'summary' | 'summary_large_image';
    canonicalUrl?: string;
    schema?: Record<string, any>;
}

export const generateMetadata = ({
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    canonicalUrl,
}: SeoProps): Metadata => {
    return {
        title,
        description,
        keywords: keywords || '',
        openGraph: {
            title,
            description,
            images: ogImage ? [{ url: ogImage }] : [],
            type: ogType,
            url: canonicalUrl,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
        alternates: {
            canonical: canonicalUrl,
        }
    };
};

// Client component for additional head elements not supported by Next.js Metadata API
export default function SEO({
    title,
    description,
    keywords,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    canonicalUrl,
    schema,
}: SeoProps) {
    return (
        <Head>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema),
                    }}
                />
            )}
        </Head>
    );
}

// Schema.org helpers
export const createOrganizationSchema = (org: {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[];
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.url,
        logo: org.logo,
        sameAs: org.sameAs || [],
    };
};

export const createProductSchema = (product: {
    name: string;
    description: string;
    image: string;
    offers: {
        price: number;
        priceCurrency: string;
        availability: string;
    };
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        offers: {
            '@type': 'Offer',
            price: product.offers.price,
            priceCurrency: product.offers.priceCurrency,
            availability: product.offers.availability,
        },
    };
};

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
};

export const createArticleSchema = (article: {
    headline: string;
    image: string;
    datePublished: string;
    dateModified: string;
    author: {
        name: string;
        url?: string;
    };
    publisher: {
        name: string;
        logo: string;
    };
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.headline,
        image: article.image,
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        author: {
            '@type': 'Person',
            name: article.author.name,
            url: article.author.url,
        },
        publisher: {
            '@type': 'Organization',
            name: article.publisher.name,
            logo: {
                '@type': 'ImageObject',
                url: article.publisher.logo,
            },
        },
    };
}; 