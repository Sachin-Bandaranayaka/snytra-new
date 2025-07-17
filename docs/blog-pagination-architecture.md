# Blog Pagination Technical Architecture

**Epic:** Blog Pagination Fix - Brownfield Enhancement  
**Document Type:** Technical Architecture  
**Last Updated:** $(date)

## Architecture Overview

This document outlines the technical architecture for implementing functional pagination in the blog system, building upon the existing Next.js 14 application with PostgreSQL database.

## Current System Analysis

### Existing Components
```
┌─────────────────────────────────────────────────────────────┐
│                    Current Blog System                     │
├─────────────────────────────────────────────────────────────┤
│  /src/app/blog/page.tsx                                     │
│  ├── getBlogPosts() - LIMIT 10 (hardcoded)                 │
│  ├── Static pagination UI (non-functional)                 │
│  └── Blog post rendering                                    │
│                                                             │
│  /src/app/api/blog/posts/route.ts                          │
│  ├── GET handler with page/limit support ✅                │
│  ├── Total count calculation ✅                             │
│  └── Category filtering ✅                                  │
│                                                             │
│  Database: PostgreSQL via Neon                             │
│  ├── blog_posts table ✅                                    │
│  ├── blog_categories table ✅                               │
│  └── Existing indexes ✅                                    │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points
- **API Endpoint:** `/api/blog/posts` (already supports pagination)
- **Database Queries:** Existing SQL with LIMIT/OFFSET support
- **UI Components:** Static pagination buttons to be enhanced
- **Routing:** Next.js App Router with searchParams

## Target Architecture

### System Flow Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Request  │───▶│   Blog Page     │───▶│   API Endpoint  │
│   /blog?page=2  │    │   Component     │    │   /api/blog/    │
└─────────────────┘    └─────────────────┘    │   posts         │
                                ▲              └─────────────────┘
                                │                       │
                                │                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pagination    │◀───│   URL State     │    │   Database      │
│   Component     │    │   Management    │    │   Queries       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### 1. Page Component Layer
```typescript
// /src/app/blog/page.tsx
export default async function BlogPage({ searchParams }) {
  // Server-side rendering with pagination
  const currentPage = validatePageParam(searchParams.page);
  const { posts, totalPages, totalCount } = await getBlogPostsWithPagination({
    page: currentPage,
    limit: 10
  });
  
  return (
    <BlogPageContent 
      posts={posts}
      pagination={{
        currentPage,
        totalPages,
        totalCount
      }}
    />
  );
}
```

#### 2. Client Component Layer
```typescript
// /src/components/blog/BlogPageContent.tsx
'use client';

export function BlogPageContent({ posts, pagination }) {
  return (
    <>
      <BlogPostGrid posts={posts} />
      <BlogPaginationWrapper {...pagination} />
    </>
  );
}
```

#### 3. Pagination Component Layer
```typescript
// /src/components/ui/Pagination.tsx
export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  loading 
}) {
  // Reusable pagination logic
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  
  return (
    <nav role="navigation" aria-label="Pagination">
      {/* Pagination UI */}
    </nav>
  );
}
```

## Data Flow Architecture

### Request Flow
```
1. User navigates to /blog?page=2
   ↓
2. Next.js App Router calls BlogPage({ searchParams: { page: '2' } })
   ↓
3. Server-side validation and data fetching
   ↓
4. getBlogPostsWithPagination() calls existing API logic
   ↓
5. Database query with OFFSET/LIMIT
   ↓
6. Response with posts + pagination metadata
   ↓
7. Server-side rendering with data
   ↓
8. Client-side hydration with interactive pagination
```

### State Management
```typescript
// URL as single source of truth
const currentPage = parseInt(searchParams.page || '1');

// Client-side navigation
const handlePageChange = (newPage: number) => {
  const url = newPage === 1 ? '/blog' : `/blog?page=${newPage}`;
  router.push(url); // Updates URL and triggers re-render
};
```

## Database Architecture

### Existing Schema (No Changes Required)
```sql
-- blog_posts table (existing)
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  author_id INTEGER,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Existing indexes
CREATE INDEX idx_blog_posts_status_published_at 
  ON blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
```

### Query Optimization
```sql
-- Optimized pagination query (existing pattern)
SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image,
       p.published_at, u.name as author,
       c.name as category
FROM blog_posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
LEFT JOIN blog_categories c ON pc.category_id = c.id
WHERE p.status = 'published'
GROUP BY p.id, u.name, c.name
ORDER BY p.published_at DESC
LIMIT $1 OFFSET $2;

-- Count query for total pages
SELECT COUNT(DISTINCT p.id) as total
FROM blog_posts p
WHERE p.status = 'published';
```

## API Architecture

### Enhanced Response Structure
```typescript
// /src/app/api/blog/posts/route.ts response
interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
  success: boolean;
}
```

### Error Handling Strategy
```typescript
// API error responses
interface ErrorResponse {
  error: string;
  code: 'INVALID_PAGE' | 'DATABASE_ERROR' | 'NOT_FOUND';
  success: false;
  pagination?: {
    maxPage: number;
    redirectTo: string;
  };
}
```

## Performance Architecture

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Next.js       │    │   Database      │
│   Cache         │    │   Cache         │    │   Query Cache   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Page cache    │    │ • ISR pages     │    │ • Connection    │
│ • API responses │    │ • API routes    │    │   pooling       │
│ • Static assets │    │ • Data cache    │    │ • Query plan    │
└─────────────────┘    └─────────────────┘    │   cache         │
                                              └─────────────────┘
```

### Implementation
```typescript
// Next.js caching configuration
export const revalidate = 300; // 5 minutes ISR

// API route caching
export async function GET(request: NextRequest) {
  const response = await getBlogPosts(params);
  
  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

## Security Architecture

### Input Validation
```typescript
// Parameter validation schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional()
});

// SQL injection prevention (existing)
const posts = await sql`
  SELECT * FROM blog_posts 
  WHERE status = 'published'
  ORDER BY published_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;
```

### Rate Limiting
```typescript
// API rate limiting
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { success } = await rateLimit.check(request.ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

## SEO Architecture

### URL Structure
```
/blog              → Page 1 (canonical)
/blog?page=1       → Redirect to /blog
/blog?page=2       → Page 2
/blog?page=N       → Page N
/blog?page=999     → Redirect to /blog (invalid)
```

### Meta Tags Strategy
```typescript
// Dynamic metadata generation
export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const page = parseInt(searchParams.page || '1');
  const { totalPages } = await getBlogPostsCount();
  
  if (page > totalPages) {
    return { title: 'Page Not Found' };
  }
  
  return {
    title: page === 1 
      ? 'Blog & Resources | RestaurantOS'
      : `Blog & Resources - Page ${page} | RestaurantOS`,
    canonical: page === 1 
      ? '/blog' 
      : `/blog?page=${page}`,
    robots: page > 5 ? 'noindex' : 'index,follow'
  };
}
```

## Error Handling Architecture

### Error Boundary Strategy
```typescript
// Error boundary hierarchy
BlogPage
├── ErrorBoundary (API failures)
│   ├── BlogPostGrid
│   └── PaginationWrapper
│       └── ErrorBoundary (Pagination errors)
│           └── Pagination
```

### Error Recovery
```typescript
// Graceful degradation
export function BlogErrorBoundary({ error, reset }) {
  const fallbackData = useFallbackBlogData();
  
  return (
    <div>
      <BlogPostGrid posts={fallbackData.posts} />
      <div className="error-notice">
        <p>Some content may be outdated. <button onClick={reset}>Retry</button></p>
      </div>
    </div>
  );
}
```

## Monitoring Architecture

### Performance Monitoring
```typescript
// Performance tracking
export function trackPaginationPerformance(page: number, loadTime: number) {
  analytics.track('blog_pagination_performance', {
    page,
    loadTime,
    timestamp: Date.now()
  });
}

// Error tracking
export function trackPaginationError(error: Error, context: any) {
  errorReporting.captureException(error, {
    tags: { feature: 'blog_pagination' },
    extra: context
  });
}
```

### Health Checks
```typescript
// API health monitoring
export async function GET() {
  try {
    const { totalCount } = await getBlogPostsCount();
    return NextResponse.json({ 
      status: 'healthy', 
      totalPosts: totalCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## Deployment Architecture

### Build Process
```yaml
# Build pipeline
steps:
  1. Type checking (tsc --noEmit)
  2. Linting (eslint)
  3. Unit tests (jest)
  4. Integration tests (playwright)
  5. Build (next build)
  6. Performance audit (lighthouse)
  7. Deploy to staging
  8. E2E tests on staging
  9. Deploy to production
```

### Feature Flags
```typescript
// Gradual rollout capability
const ENABLE_PAGINATION = process.env.FEATURE_PAGINATION === 'true';

export default function BlogPage({ searchParams }) {
  if (!ENABLE_PAGINATION) {
    return <LegacyBlogPage />;
  }
  
  return <NewBlogPageWithPagination searchParams={searchParams} />;
}
```

## Migration Strategy

### Phase 1: Foundation (Story 1)
- Implement URL parameter handling
- Update `getBlogPosts` function
- Maintain existing UI

### Phase 2: UI Enhancement (Story 2)
- Create pagination component
- Replace static pagination
- Add loading states

### Phase 3: Integration (Story 3)
- Connect component to API
- Add error handling
- Performance optimization

### Rollback Plan
```typescript
// Emergency rollback capability
if (process.env.ROLLBACK_PAGINATION === 'true') {
  // Revert to static pagination
  return <StaticPaginationFallback />;
}
```

## Success Metrics

### Technical Metrics
- Page load time: < 2 seconds
- API response time: < 200ms
- Error rate: < 0.1%
- Test coverage: > 90%

### User Experience Metrics
- Pagination usage rate
- Page bounce rate
- Time spent on blog pages
- User navigation patterns

### SEO Metrics
- Search engine indexing rate
- Organic traffic to paginated pages
- Page ranking maintenance
- Core Web Vitals scores

## Future Considerations

### Scalability Enhancements
- Cursor-based pagination for large datasets
- Infinite scroll option
- Search integration with pagination
- Category-specific pagination

### Performance Optimizations
- Edge caching with CDN
- Database read replicas
- Preloading adjacent pages
- Virtual scrolling for large lists

### Feature Extensions
- Pagination for other content types
- Advanced filtering with pagination
- Bookmarkable filter states
- Social sharing of paginated content