/**
 * Pagination Controls Component
 * Reusable UI for pagination with page size selector
 */

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  pageNumbers: number[];
  canNextPage: boolean;
  canPrevPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  showPageSize?: boolean;
  showItemCount?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  pageSizeOptions,
  pageNumbers,
  canNextPage,
  canPrevPage,
  onPageChange,
  onPageSizeChange,
  className,
  showPageSize = true,
  showItemCount = true,
}: PaginationControlsProps) {
  if (totalPages <= 1 && !showPageSize && !showItemCount) {
    return null;
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 pt-4', className)}>
      {/* Item count and page size */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {showItemCount && (
          <span>
            Showing {startIndex + 1}-{endIndex} of {totalItems}
          </span>
        )}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => canPrevPage && onPageChange(currentPage - 1)}
                className={cn(
                  'cursor-pointer',
                  !canPrevPage && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>

            {pageNumbers.map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum < 0 ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => canNextPage && onPageChange(currentPage + 1)}
                className={cn(
                  'cursor-pointer',
                  !canNextPage && 'pointer-events-none opacity-50'
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
