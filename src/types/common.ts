/**
 * Common shared types used across the application
 * Centralized type definitions for reusable patterns
 */

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sorting
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Date Range
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Form State
export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  errors: Record<keyof T, string | undefined>;
  isDirty: boolean;
}

// Loading State
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isSuccess: boolean;
}

// Selection State
export interface SelectionState<T = string> {
  selected: T[];
  isAllSelected: boolean;
  toggle: (item: T) => void;
  selectAll: () => void;
  clearAll: () => void;
}

// Filter State
export interface FilterState<T = Record<string, unknown>> {
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

// Status Types (reusable across entities)
export type GenericStatus = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// Audit Fields (common to many entities)
export interface AuditFields {
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Organization scoped entity
export interface OrganizationScoped {
  organization_id?: string;
}

// User related
export interface UserScoped {
  user_id: string;
}

// Taggable entity
export interface Taggable {
  tags?: string[];
}

// Commentable entity
export interface Commentable {
  comment_count?: number;
  latest_comment?: {
    id: string;
    content: string;
    author: string;
    created_at: string;
  };
}

// Attachable entity
export interface Attachable {
  attachment_count?: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
  uploaded_by?: string;
}

// Menu Item (for navigation)
export interface MenuItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  children?: MenuItem[];
}

// Tab Item
export interface TabItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  count?: number;
}

// Action Button
export interface ActionButton {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  loading?: boolean;
}

// Toast/Notification
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Export result
export interface ExportResult {
  success: boolean;
  message?: string;
  recordCount?: number;
  filePath?: string;
}

// Utility type helpers
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ID types for type safety
export type UUID = string;
export type UserId = UUID;
export type OrganizationId = UUID;
export type ProjectId = UUID;
export type TaskId = UUID;
