// Zod validation schemas for comprehensive input validation
import { z } from 'zod';

// Common validation patterns
const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .email('Invalid email address')
  .transform(val => val.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters');

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

const companyNameSchema = z
  .string()
  .trim()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s&'-]+$/, 'Company name contains invalid characters');

// Employee/Department schemas
const employeeIdSchema = z
  .string()
  .trim()
  .max(20, 'Employee ID must be less than 20 characters')
  .regex(/^[A-Za-z0-9_-]*$/, 'Employee ID can only contain letters, numbers, underscores, and hyphens')
  .optional()
  .or(z.literal(''));

const departmentSchema = z
  .string()
  .trim()
  .max(50, 'Department must be less than 50 characters')
  .optional()
  .or(z.literal(''));

// Role schema for team members
const roleSchema = z.enum(['employee', 'intern']).default('employee');

// Signup schema for new team members
export const internFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  department: departmentSchema,
  employee_id: employeeIdSchema,
  role: roleSchema,
});

export type InternFormData = z.infer<typeof internFormSchema>;

// Organization signup schema
export const organizationSignupSchema = z.object({
  companyName: companyNameSchema,
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type OrganizationSignupData = z.infer<typeof organizationSignupSchema>;

// Task validation schema
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  slt_coin_value: z
    .number()
    .min(0, 'Coin value must be at least 0')
    .max(1000, 'Coin value must be less than 1000')
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Message/content validation
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message must be less than 10000 characters'),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: z
    .string()
    .trim()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Utility function to sanitize string for safe display
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
    .substring(0, maxLength);
}

// Utility to validate and sanitize form data
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => err.message);
  return { success: false, errors };
}
