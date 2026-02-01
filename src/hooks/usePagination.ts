/**
 * Reusable Pagination Hook
 * Provides pagination state and controls for lists and tables
 */

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationReturn<T> {
  // Current state
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  
  // Derived data
  paginatedData: T[];
  startIndex: number;
  endIndex: number;
  
  // Controls
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  
  // Utility
  canNextPage: boolean;
  canPrevPage: boolean;
  pageSizeOptions: number[];
  pageNumbers: number[];
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 12,
    pageSizeOptions = [6, 12, 24, 48],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Reset to page 1 if current page exceeds total pages
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPage(validCurrentPage + 1);
  }, [validCurrentPage, setPage]);

  const prevPage = useCallback(() => {
    setPage(validCurrentPage - 1);
  }, [validCurrentPage, setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [setPage, totalPages]);

  const canNextPage = validCurrentPage < totalPages;
  const canPrevPage = validCurrentPage > 1;

  // Generate page numbers with ellipsis logic
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible range
      let start = Math.max(2, validCurrentPage - 1);
      let end = Math.min(totalPages - 1, validCurrentPage + 1);
      
      // Adjust if we're near the start or end
      if (validCurrentPage <= 2) {
        end = 4;
      } else if (validCurrentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis before if needed
      if (start > 2) pages.push(-1); // -1 represents ellipsis
      
      // Add middle pages
      for (let i = start; i <= end; i++) pages.push(i);
      
      // Add ellipsis after if needed
      if (end < totalPages - 1) pages.push(-2); // -2 represents ellipsis
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  }, [totalPages, validCurrentPage]);

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canNextPage,
    canPrevPage,
    pageSizeOptions,
    pageNumbers,
  };
}
