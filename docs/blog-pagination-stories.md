# Blog Pagination Fix - User Stories

## Story 1: Add URL Parameter Handling for Blog Page

**As a** user visiting the blog page  
**I want** the page URL to reflect the current page number  
**So that** I can bookmark specific pages and share direct links to paginated content

### Acceptance Criteria

- [ ] Blog page component accepts `searchParams` prop for URL parameter handling
- [ ] Page parameter is extracted from URL with default value of 1
- [ ] Page parameter validation ensures only positive integers are accepted
- [ ] Invalid page numbers redirect to page 1 with proper error handling
- [ ] `getBlogPosts` function is updated to accept `page` and `limit` parameters
- [ ] Backward compatibility maintained: `/blog` defaults to page 1
- [ ] URL pattern `/blog?page=N` is supported
- [ ] SEO metadata remains intact for all paginated pages

### Technical Implementation

**Files to Modify:**
- `/src/app/blog/page.tsx` - Add searchParams handling
- Update `getBlogPosts()` function signature

**Key Changes:**
```typescript
// Add searchParams prop to page component
export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const currentPage = parseInt(searchParams.page || '1');
  // Validate page number
  if (currentPage < 1 || isNaN(currentPage)) {
    redirect('/blog');
  }
  
  const posts = await getBlogPosts(currentPage, 10);
}

// Update getBlogPosts function
async function getBlogPosts(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  // Update SQL query to use OFFSET and LIMIT
}
```

### Definition of Done
- [ ] URL parameters properly extracted and validated
- [ ] Page navigation updates URL correctly
- [ ] Direct URL access works for any valid page number
- [ ] Invalid page numbers handled gracefully
- [ ] No breaking changes to existing functionality
- [ ] Unit tests added for parameter validation

---

## Story 2: Create Functional Pagination Component

**As a** user browsing blog posts  
**I want** functional pagination controls  
**So that** I can easily navigate between different pages of blog content

### Acceptance Criteria

- [ ] Replace static pagination buttons with dynamic component
- [ ] Previous button disabled on first page
- [ ] Next button disabled on last page
- [ ] Current page number highlighted visually
- [ ] Page numbers displayed with ellipsis for large page counts
- [ ] Loading states shown during page transitions
- [ ] Pagination component is reusable and configurable
- [ ] Responsive design maintained across all screen sizes
- [ ] Accessibility features included (ARIA labels, keyboard navigation)

### Technical Implementation

**Files to Create:**
- `/src/components/ui/Pagination.tsx` - New pagination component

**Files to Modify:**
- `/src/app/blog/page.tsx` - Replace static pagination

**Component Structure:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false 
}: PaginationProps) {
  // Component implementation
}
```

**Features:**
- Smart page number display (show 1...5,6,7...10 for large ranges)
- Smooth transitions with loading indicators
- Keyboard navigation support
- Touch-friendly on mobile devices

### Definition of Done
- [ ] Pagination component renders correctly
- [ ] Previous/Next buttons work with proper disabled states
- [ ] Page numbers clickable and highlight current page
- [ ] Loading states provide visual feedback
- [ ] Component is accessible (screen reader friendly)
- [ ] Responsive design works on all devices
- [ ] Component unit tests written and passing

---

## Story 3: Integrate Pagination with Blog API

**As a** user navigating blog pages  
**I want** smooth page transitions with proper data loading  
**So that** I can browse through all blog posts efficiently

### Acceptance Criteria

- [ ] Pagination component connected to existing `/api/blog/posts` endpoint
- [ ] Total post count fetched for accurate pagination calculation
- [ ] Error handling implemented for API failures
- [ ] Invalid page numbers handled gracefully (redirect to valid page)
- [ ] URL updates reflect current page state
- [ ] Browser back/forward navigation works correctly
- [ ] Loading states prevent multiple simultaneous requests
- [ ] SEO-friendly URLs maintained for all pages
- [ ] Performance optimized (no unnecessary API calls)

### Technical Implementation

**Files to Modify:**
- `/src/app/blog/page.tsx` - Add pagination integration
- Utilize existing `/src/app/api/blog/posts/route.ts` (no changes needed)

**Integration Points:**
```typescript
// Fetch posts with pagination
const response = await fetch(`/api/blog/posts?page=${currentPage}&limit=10`);
const { posts, totalCount, totalPages } = await response.json();

// Handle page changes
const handlePageChange = (newPage: number) => {
  router.push(`/blog?page=${newPage}`);
};

// Error boundary for API failures
if (!posts) {
  return <ErrorBoundary />;
}
```

**API Response Enhancement:**
The existing API already returns:
- `posts`: Array of blog posts
- `totalCount`: Total number of posts
- `totalPages`: Calculated total pages
- `currentPage`: Current page number

### Definition of Done
- [ ] Pagination works with real data from API
- [ ] Total page count calculated correctly
- [ ] Error states handled gracefully
- [ ] URL navigation works bidirectionally
- [ ] No performance regressions
- [ ] All edge cases handled (empty results, invalid pages)
- [ ] Integration tests verify end-to-end functionality
- [ ] SEO metadata preserved across all pages

---

## Cross-Story Requirements

### Performance Considerations
- [ ] API calls optimized to prevent unnecessary requests
- [ ] Loading states prevent user confusion
- [ ] Pagination component memoized for performance
- [ ] URL updates use Next.js router for optimal navigation

### Accessibility Requirements
- [ ] ARIA labels for pagination controls
- [ ] Keyboard navigation support
- [ ] Screen reader announcements for page changes
- [ ] Focus management during navigation

### SEO Requirements
- [ ] Canonical URLs for paginated content
- [ ] Meta descriptions maintained across pages
- [ ] Structured data preserved
- [ ] Proper HTTP status codes for invalid pages

### Testing Requirements
- [ ] Unit tests for pagination component
- [ ] Integration tests for API connectivity
- [ ] E2E tests for user navigation flows
- [ ] Performance tests for large datasets

### Browser Compatibility
- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Graceful degradation for older browsers

---

## Implementation Order

1. **Story 1** - Foundation: URL parameter handling
2. **Story 2** - UI: Functional pagination component
3. **Story 3** - Integration: Connect component to API

This order ensures each story builds upon the previous one while maintaining working functionality at each step.