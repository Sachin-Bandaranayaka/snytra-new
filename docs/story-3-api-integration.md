# Story 3: Integrate Pagination with Blog API

**Epic:** Blog Pagination Fix - Brownfield Enhancement  
**Story ID:** BP-003  
**Priority:** High  
**Estimate:** 5 Story Points

## User Story

**As a** user navigating blog pages  
**I want** smooth page transitions with proper data loading  
**So that** I can browse through all blog posts efficiently

## Acceptance Criteria

- [ ] Pagination component connected to existing `/api/blog/posts` endpoint
- [ ] Total post count fetched for accurate pagination calculation
- [ ] Error handling implemented for API failures
- [ ] Invalid page numbers handled gracefully (redirect to valid page)
- [ ] URL updates reflect current page state
- [ ] Browser back/forward navigation works correctly
- [ ] Loading states prevent multiple simultaneous requests
- [ ] SEO-friendly URLs maintained for all pages
- [ ] Performance optimized (no unnecessary API calls)

## Technical Implementation

### Files to Modify
- `/src/app/blog/page.tsx` - Add pagination integration
- `/src/lib/blog.ts` - Create blog data fetching utilities (new file)

### API Integration Points
```typescript
// Enhanced blog page with pagination
export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const currentPage = parseInt(searchParams.page || '1');
  
  try {
    const { posts, totalCount, totalPages } = await getBlogPostsWithPagination({
      page: currentPage,
      limit: 10
    });
    
    // Handle invalid page numbers
    if (currentPage > totalPages && totalPages > 0) {
      redirect('/blog');
    }
    
    return (
      <BlogPageContent 
        posts={posts}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    );
  } catch (error) {
    return <ErrorBoundary error={error} />;
  }
}
```

### Client-Side Navigation
```typescript
// Client component for pagination interaction
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function BlogPaginationWrapper({ 
  children, 
  totalPages, 
  currentPage 
}: {
  children: React.ReactNode;
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const url = newPage === 1 ? '/blog' : `/blog?page=${newPage}`;
      router.push(url);
    });
  };
  
  return (
    <>
      {children}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={isPending}
      />
    </>
  );
}
```

### Data Fetching Utilities
```typescript
// /src/lib/blog.ts
export interface BlogPostsResponse {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getBlogPostsWithPagination({
  page = 1,
  limit = 10,
  category
}: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<BlogPostsResponse> {
  const offset = (page - 1) * limit;
  
  // Use existing SQL queries with pagination
  const [posts, countResult] = await Promise.all([
    getBlogPostsQuery({ limit, offset, category }),
    getBlogPostsCountQuery({ category })
  ]);
  
  const totalCount = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    posts,
    totalCount,
    totalPages,
    currentPage: page
  };
}
```

### Error Handling
```typescript
// Error boundary for API failures
export function BlogErrorBoundary({ 
  error, 
  reset 
}: { 
  error: Error; 
  reset: () => void; 
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-charcoal mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-6">
        We couldn't load the blog posts. Please try again.
      </p>
      <button 
        onClick={reset}
        className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
}
```

## API Response Structure

The existing `/api/blog/posts` endpoint already returns:
```typescript
{
  posts: BlogPost[],
  totalCount: number,
  totalPages: number,
  currentPage: number,
  success: boolean
}
```

## Definition of Done
- [ ] Pagination works with real data from API
- [ ] Total page count calculated correctly
- [ ] Error states handled gracefully
- [ ] URL navigation works bidirectionally
- [ ] No performance regressions
- [ ] All edge cases handled (empty results, invalid pages)
- [ ] Integration tests verify end-to-end functionality
- [ ] SEO metadata preserved across all pages
- [ ] Loading states provide good UX
- [ ] Code review completed
- [ ] QA testing passed

## Testing Strategy

### Integration Tests
- [ ] End-to-end pagination flow
- [ ] API error handling
- [ ] URL state management
- [ ] Browser navigation (back/forward)

### Performance Tests
- [ ] Page load times with pagination
- [ ] Memory usage during navigation
- [ ] API response times
- [ ] Concurrent request handling

### Edge Case Tests
- [ ] Empty blog (no posts)
- [ ] Single page of results
- [ ] Very large datasets (1000+ posts)
- [ ] Network failures
- [ ] Invalid page numbers

## Dependencies
- **Depends on:** Story 1 (URL Parameter Handling)
- **Depends on:** Story 2 (Pagination Component)
- **Integrates with:** Existing `/api/blog/posts` endpoint

## Performance Optimizations

### Caching Strategy
- [ ] Implement page-level caching for blog posts
- [ ] Cache total count to reduce database queries
- [ ] Use Next.js ISR for static generation

### Database Optimizations
- [ ] Add database indexes for pagination queries
- [ ] Optimize COUNT queries for large datasets
- [ ] Consider cursor-based pagination for future scaling

### Client-Side Optimizations
- [ ] Prefetch adjacent pages
- [ ] Implement optimistic UI updates
- [ ] Debounce rapid page changes

## SEO Considerations

### Meta Tags
- [ ] Unique titles for each page: "Blog - Page 2 | RestaurantOS"
- [ ] Canonical URLs for paginated content
- [ ] Proper noindex for deep pagination pages

### Structured Data
- [ ] Maintain blog post structured data
- [ ] Add pagination structured data
- [ ] Preserve existing schema markup

## Risks & Mitigation
- **Risk:** API performance degradation
- **Mitigation:** Implement caching, optimize queries, monitor performance
- **Risk:** SEO impact from URL changes
- **Mitigation:** Proper redirects, canonical URLs, gradual rollout
- **Risk:** User experience during errors
- **Mitigation:** Comprehensive error handling, fallback states

## Monitoring & Analytics
- [ ] Track pagination usage patterns
- [ ] Monitor API response times
- [ ] Track error rates and types
- [ ] Measure user engagement across pages

## Notes
- Leverage existing API infrastructure
- Maintain backward compatibility
- Consider future enhancements (infinite scroll, search)
- Document API changes for other developers