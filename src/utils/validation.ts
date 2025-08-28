import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const urlSchema = z.string().url('Invalid URL format');

// Input sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const sanitizeSql = (input: string): string => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'OR', 'AND', '--', ';'
  ];
  
  let sanitized = input;
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Handle comment patterns separately
  sanitized = sanitized.replace(/\/\*/g, '').replace(/\*\//g, '');
  
  return sanitized;
};

// Validation functions
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: (error as any).errors[0]?.message || 'Invalid email format' };
    }
    return { isValid: false, error: 'Invalid email format' };
  }
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: (error as any).errors[0]?.message || 'Invalid password format' };
    }
    return { isValid: false, error: 'Invalid password format' };
  }
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  try {
    phoneSchema.parse(phone);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: (error as any).errors[0]?.message || 'Invalid phone number format' };
    }
    return { isValid: false, error: 'Invalid phone number format' };
  }
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  try {
    nameSchema.parse(name);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: (error as any).errors[0]?.message || 'Invalid name format' };
    }
    return { isValid: false, error: 'Invalid name format' };
  }
};

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    urlSchema.parse(url);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: (error as any).errors[0]?.message || 'Invalid URL format' };
    }
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// File validation
export const validateFileType = (file: File, allowedTypes: string[]): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  return { isValid: true };
};

export const validateFileSize = (file: File, maxSizeMB: number): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }
  return { isValid: true };
};

// Input length validation
export const validateInputLength = (input: string, minLength: number, maxLength: number): { isValid: boolean; error?: string } => {
  if (input.length < minLength) {
    return { isValid: false, error: `Input must be at least ${minLength} characters long` };
  }
  if (input.length > maxLength) {
    return { isValid: false, error: `Input must be no more than ${maxLength} characters long` };
  }
  return { isValid: true };
};

// XSS prevention
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// SQL injection prevention
export const containsSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateAndSanitizeInput = (input: string, options: {
  type: 'email' | 'password' | 'phone' | 'name' | 'url' | 'text';
  minLength?: number;
  maxLength?: number;
  allowHtml?: boolean;
  checkXSS?: boolean;
  checkSqlInjection?: boolean;
}): { isValid: boolean; error?: string; sanitizedValue?: string } => {
  let sanitizedValue = input;
  
  // Basic sanitization
  if (!options.allowHtml) {
    sanitizedValue = sanitizeString(sanitizedValue);
  }
  
  // Length validation
  if (options.minLength || options.maxLength) {
    const lengthValidation = validateInputLength(
      sanitizedValue, 
      options.minLength || 0, 
      options.maxLength || 1000
    );
    if (!lengthValidation.isValid) {
      return { isValid: false, error: lengthValidation.error };
    }
  }
  
  // Type-specific validation
  let typeValidation: { isValid: boolean; error?: string };
  switch (options.type) {
    case 'email':
      typeValidation = validateEmail(sanitizedValue);
      break;
    case 'password':
      typeValidation = validatePassword(sanitizedValue);
      break;
    case 'phone':
      typeValidation = validatePhone(sanitizedValue);
      break;
    case 'name':
      typeValidation = validateName(sanitizedValue);
      break;
    case 'url':
      typeValidation = validateUrl(sanitizedValue);
      break;
    default:
      typeValidation = { isValid: true };
  }
  
  if (!typeValidation.isValid) {
    return { isValid: false, error: typeValidation.error };
  }
  
  // Security checks
  if (options.checkXSS && containsXSS(sanitizedValue)) {
    return { isValid: false, error: 'Input contains potentially malicious content' };
  }
  
  if (options.checkSqlInjection && containsSqlInjection(sanitizedValue)) {
    return { isValid: false, error: 'Input contains potentially malicious SQL content' };
  }
  
  return { isValid: true, sanitizedValue };
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number, private windowMs: number) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export validation schemas for use in forms
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});
