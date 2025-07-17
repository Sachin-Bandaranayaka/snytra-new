# Story 1: Add URL Parameter Handling for Blog Page

**Epic:** Blog Pagination Fix - Brownfield Enhancement  
**Story ID:** BP-001  
**Priority:** High  
**Estimate:** 3 Story Points

## User Story

**As a** user visiting the blog page  
**I want** the page URL to reflect the current page number  
**So that** I can bookmark specific pages and share direct links to paginated content

## Acceptance Criteria

- [ ] Blog page component accepts `searchParams` prop for URL parameter handling
- [ ] Page parameter is extracted from URL with default value of 1
- [ ] Page parameter validation ensures only positive integers are accepted
- [ ] Invalid page numbers redirect to page 1 with proper error handling
- [ ] `getBlogPosts` function is updated to accept `page` and `limit` parameters
- [ ] Backward compatibility maintained: `/blog` defaults to page 1
- [ ] URL pattern `/blog?page=N` is supported
- [ ] SEO metadata remains intact for all paginated pages

## Technical Implementation

### Files to Modify
- `/src/app/blog/page.tsx` - Add searchParams handling
- Update `getBlogPosts()` function signature

### Key Changes
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

### Database Changes
- No schema changes required
- Existing SQL query needs OFFSET and LIMIT parameters

### API Integration
- Leverages existing `/api/blog/posts` endpoint
- No API changes needed (already supports pagination)

## Definition of Done
- [ ] URL parameters properly extracted and validated
- [ ] Page navigation updates URL correctly
- [ ] Direct URL access works for any valid page number
- [ ] Invalid page numbers handled gracefully
- [ ] No breaking changes to existing functionality
- [ ] Unit tests added for parameter validation
- [ ] Code review completed
- [ ] QA testing passed

## Testing Strategy

### Unit Tests
- [ ] Parameter extraction and validation
- [ ] Default value handling
- [ ] Error handling for invalid inputs

### Integration Tests
- [ ] URL navigation functionality
- [ ] Backward compatibility with existing URLs
- [ ] SEO metadata preservation

### Manual Testing
- [ ] Direct URL access: `/blog?page=2`
- [ ] Invalid page handling: `/blog?page=0`, `/blog?page=abc`
- [ ] Browser back/forward navigation
- [ ] Bookmark functionality

## Dependencies
- None (foundation story)

## Risks & Mitigation
- **Risk:** Breaking existing blog functionality
- **Mitigation:** Maintain backward compatibility, thorough testing
- **Risk:** SEO impact from URL changes
- **Mitigation:** Preserve existing URL structure, add proper redirects

## Notes
- This story provides the foundation for Stories 2 and 3
- Maintains existing design and functionality
- No visual changes expected