import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { Pagination } from './Pagination';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockPush = vi.fn();
const mockSearchParams = {
  toString: () => '',
};

beforeEach(() => {
  (useRouter as any).mockReturnValue({
    push: mockPush,
  });
  (useSearchParams as any).mockReturnValue(mockSearchParams);
  mockPush.mockClear();
});

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
  };

  it('renders pagination controls correctly', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);
    
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByLabelText('Go to page 3');
    expect(currentPageButton).toHaveClass('bg-primary', 'text-white');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to correct page when clicked', async () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    
    const page3Button = screen.getByLabelText('Go to page 3');
    fireEvent.click(page3Button);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog?page=3');
    });
  });

  it('navigates to previous page', async () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const prevButton = screen.getByLabelText('Go to previous page');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog?page=2');
    });
  });

  it('navigates to next page', async () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    
    const nextButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog?page=3');
    });
  });

  it('removes page parameter for first page', async () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    
    const page1Button = screen.getByLabelText('Go to page 1');
    fireEvent.click(page1Button);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/blog');
    });
  });

  it('shows ellipsis for large page counts', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('shows loading state when loading prop is true', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    
    const loadingSpinners = screen.getAllByRole('button');
    loadingSpinners.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('prevents navigation when already navigating', async () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const page2Button = screen.getByLabelText('Go to page 2');
    
    // Click multiple times quickly
    fireEvent.click(page2Button);
    fireEvent.click(page2Button);
    fireEvent.click(page2Button);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Blog pagination');
    
    const currentPageButton = screen.getByLabelText('Go to page 2');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('respects maxVisiblePages prop', () => {
    render(
      <Pagination 
        {...defaultProps} 
        currentPage={5} 
        totalPages={20} 
        maxVisiblePages={3} 
      />
    );
    
    // Should show limited number of page buttons
    const pageButtons = screen.getAllByLabelText(/Go to page \d+/);
    expect(pageButtons.length).toBeLessThanOrEqual(5); // 3 + first + last
  });
});