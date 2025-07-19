// Security utilities for input validation and sanitization

import DOMPurify from 'dompurify';

// Input validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  employeeId: /^[A-Z0-9_-]{3,20}$/,
  url: /^https?:\/\/.+/,
  filename: /^[a-zA-Z0-9._-]+$/
} as const;

// Allowed file types for uploads
export const AllowedFileTypes = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const;

// Maximum file sizes (in bytes)
export const MaxFileSizes = {
  avatar: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  document: 10 * 1024 * 1024 // 10MB
} as const;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return ValidationPatterns.email.test(email.trim());
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  allowedTypes: readonly string[],
  maxSize: number
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit`);
  }

  if (!ValidationPatterns.filename.test(file.name)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and validate text input
 */
export function sanitizeTextInput(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and trim
  const sanitized = input.replace(/<[^>]*>/g, '').trim();
  
  // Limit length
  return sanitized.substring(0, maxLength);
}

/**
 * Validate task data
 */
export function validateTaskData(data: {
  title?: string;
  description?: string;
  priority?: string;
  slt_coin_value?: number;
}): {
  isValid: boolean;
  errors: string[];
  sanitizedData: typeof data;
} {
  const errors: string[] = [];
  const sanitizedData = { ...data };

  if (data.title) {
    if (data.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }
    if (data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    sanitizedData.title = sanitizeTextInput(data.title, 200);
  }

  if (data.description) {
    sanitizedData.description = sanitizeTextInput(data.description, 2000);
  }

  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Invalid priority value');
  }

  if (data.slt_coin_value && (data.slt_coin_value < 0 || data.slt_coin_value > 1000)) {
    errors.push('Coin value must be between 0 and 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Check for common security threats in user input
 */
export function detectSecurityThreats(input: string): string[] {
  const threats: string[] = [];
  const lowerInput = input.toLowerCase();

  // SQL injection patterns
  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
    /(\bdrop\b.*\btable\b)|(\btable\b.*\bdrop\b)/i,
    /(\binsert\b.*\binto\b)|(\binto\b.*\binsert\b)/i,
    /(\bdelete\b.*\bfrom\b)|(\bfrom\b.*\bdelete\b)/i,
    /(\bupdate\b.*\bset\b)|(\bset\b.*\bupdate\b)/i
  ];

  // XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi
  ];

  sqlPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      threats.push('Potential SQL injection detected');
    }
  });

  xssPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      threats.push('Potential XSS attack detected');
    }
  });

  return threats;
}