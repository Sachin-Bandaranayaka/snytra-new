# Blog Pagination Fix - Brownfield Enhancement Epic

## Epic Goal

Implement functional pagination for the blog page to allow users to navigate through multiple pages of blog posts, replacing the current static pagination buttons with a working pagination system that connects to the existing blog API.

## Epic Description

**Existing System Context:**

- Current blog page at `/blog` displays only 10 posts with hardcoded LIMIT 10
- Static pagination UI exists but buttons are non-functional (hardcoded 1, 2, 3)
- Existing blog API at `/api/blog/posts` already supports `page` and `limit` parameters
- Technology stack: Next.js 14, PostgreSQL via Neon, existing SQL queries
- Integration points: Blog page component, existing API route, database queries

**Enhancement Details:**

- What's being added/changed: Convert static pagination to functional pagination with URL parameter handling
- How it integrates: Utilize existing API pagination parameters and add client-side URL state management
- Success criteria: Users can navigate between pages, URL reflects current page, proper loading states

## Stories

1. **Story 1: Add URL Parameter Handling for Blog Page**
   - Implement `searchParams` handling in blog page component
   - Add page parameter extraction and validation
   - Update `getBlogPosts` function to accept page and limit parameters
   - Ensure backward compatibility with existing `/blog` URL

2. **Story 2: Create Functional Pagination Component**
   - Replace static pagination buttons with dynamic pagination component
   - Implement Previous/Next navigation with proper disabled states
   - Add numbered page buttons with current page highlighting
   - Include proper loading states during page transitions

3. **Story 3: Integrate Pagination with Blog API**
   - Connect pagination component to existing `/api/blog/posts` endpoint
   - Implement total count fetching for accurate pagination calculation
   - Add error handling for invalid page numbers
   - Ensure smooth navigation with proper URL updates

## Compatibility Requirements

- [x] Existing APIs remain unchanged (utilizing existing `/api/blog/posts` pagination)
- [x] Database schema changes are backward compatible (no schema changes needed)
- [x] UI changes follow existing patterns (using existing Tailwind classes and design)
- [x] Performance impact is minimal (leveraging existing API pagination)

## Risk Mitigation

- **Primary Risk:** Breaking existing blog functionality or SEO
- **Mitigation:** Implement progressive enhancement, maintain existing URL structure, add proper error boundaries
- **Rollback Plan:** Revert to static pagination by removing URL parameter handling and restoring hardcoded post fetching

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Users can navigate between blog pages using pagination controls
- [x] URL parameters properly reflect current page state
- [x] Existing blog functionality verified through testing (individual post access, categories)
- [x] Integration points working correctly (API calls, URL routing)
- [x] No regression in existing features (blog post display, navigation, SEO)
- [x] Pagination handles edge cases (invalid pages, empty results)
- [x] Loading states provide good user experience

## Technical Implementation Notes

**Existing API Support:**
- `/api/blog/posts` already accepts `page` and `limit` query parameters
- Current blog page uses `getBlogPosts()` function that needs page parameter support
- Existing pagination UI structure can be enhanced rather than replaced

**Integration Points:**
- Blog page component at `/src/app/blog/page.tsx`
- Existing blog API route at `/src/app/api/blog/posts/route.ts`
- Current pagination UI section (lines 190-210 in blog page)

**Compatibility Considerations:**
- Maintain `/blog` as default first page
- Support `/blog?page=N` URL pattern
- Preserve existing post display and category functionality
- Keep existing SEO metadata and structured data