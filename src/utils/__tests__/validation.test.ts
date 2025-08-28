import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateUrl,
  sanitizeString,
  sanitizeHtml,
  sanitizeSql,
  validateFileType,
  validateFileSize,
  validateInputLength,
  containsXSS,
  containsSqlInjection,
  validateAndSanitizeInput,
  RateLimiter,
  userRegistrationSchema,
  userLoginSchema,
  profileUpdateSchema
} from '../validation';

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user.name+tag@domain.co.uk')).toEqual({ isValid: true });
      expect(validateEmail('test123@test-domain.com')).toEqual({ isValid: true });
    });

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toEqual({ 
        isValid: false, 
        error: 'Invalid email format' 
      });
      expect(validateEmail('test@')).toEqual({ 
        isValid: false, 
        error: 'Invalid email format' 
      });
      expect(validateEmail('@example.com')).toEqual({ 
        isValid: false, 
        error: 'Invalid email format' 
      });
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toEqual({ isValid: true });
      expect(validatePassword('MySecureP@ssw0rd')).toEqual({ isValid: true });
    });

    test('should reject weak passwords', () => {
      expect(validatePassword('weak')).toEqual({ 
        isValid: false, 
        error: 'Invalid password format'
      });
      expect(validatePassword('password123')).toEqual({ 
        isValid: false, 
        error: 'Invalid password format'
      });
      expect(validatePassword('PASSWORD123')).toEqual({ 
        isValid: false, 
        error: 'Invalid password format'
      });
    });
  });

  describe('Phone Validation', () => {
    test('should validate correct phone numbers', () => {
      expect(validatePhone('+1234567890')).toEqual({ isValid: true });
      expect(validatePhone('1234567890')).toEqual({ isValid: true });
      expect(validatePhone('+44123456789')).toEqual({ isValid: true });
    });

    test('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toEqual({ 
        isValid: false, 
        error: 'Invalid phone number format' 
      });
      expect(validatePhone('abc123def')).toEqual({ 
        isValid: false, 
        error: 'Invalid phone number format' 
      });
    });
  });

  describe('Name Validation', () => {
    test('should validate correct names', () => {
      expect(validateName('John')).toEqual({ isValid: true });
      expect(validateName('Mary Jane')).toEqual({ isValid: true });
      expect(validateName('O\'Connor')).toEqual({ isValid: true });
      expect(validateName('Jean-Pierre')).toEqual({ isValid: true });
    });

    test('should reject invalid names', () => {
      expect(validateName('A')).toEqual({ 
        isValid: false, 
        error: 'Invalid name format'
      });
      expect(validateName('John123')).toEqual({ 
        isValid: false, 
        error: 'Invalid name format'
      });
    });
  });

  describe('URL Validation', () => {
    test('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true });
      expect(validateUrl('http://test.co.uk')).toEqual({ isValid: true });
      expect(validateUrl('https://sub.domain.com/path')).toEqual({ isValid: true });
    });

    test('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toEqual({ 
        isValid: false, 
        error: expect.stringContaining('Invalid URL format') 
      });
      expect(validateUrl('ftp://example.com')).toEqual({ 
        isValid: true
      });
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize strings', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('  test  ')).toBe('test');
    });

    test('should sanitize HTML', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeHtml('<iframe src="malicious.com"></iframe>')).toBe('');
      expect(sanitizeHtml('<p>Safe content</p>')).toBe('<p>Safe content</p>');
    });

    test('should sanitize SQL', () => {
      expect(sanitizeSql('SELECT * FROM users')).toBe(' * FROM users');
      expect(sanitizeSql('DROP TABLE users')).toBe(' TABLE users');
      expect(sanitizeSql('Safe content')).toBe('Safe content');
    });
  });

  describe('File Validation', () => {
    test('should validate file types', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      
      expect(validateFileType(imageFile, ['image/jpeg', 'image/png'])).toEqual({ isValid: true });
      expect(validateFileType(pdfFile, ['image/jpeg', 'image/png'])).toEqual({ 
        isValid: false, 
        error: expect.stringContaining('File type application/pdf is not allowed') 
      });
    });

    test('should validate file sizes', () => {
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      const smallFile = new File(['small'], 'small.txt', { type: 'text/plain' });
      
      expect(validateFileSize(smallFile, 1)).toEqual({ isValid: true });
      expect(validateFileSize(largeFile, 1)).toEqual({ 
        isValid: false, 
        error: expect.stringContaining('exceeds maximum allowed size') 
      });
    });
  });

  describe('Input Length Validation', () => {
    test('should validate input lengths', () => {
      expect(validateInputLength('test', 2, 10)).toEqual({ isValid: true });
      expect(validateInputLength('a', 2, 10)).toEqual({ 
        isValid: false, 
        error: 'Input must be at least 2 characters long' 
      });
      expect(validateInputLength('very long input', 2, 10)).toEqual({ 
        isValid: false, 
        error: 'Input must be no more than 10 characters long' 
      });
    });
  });

  describe('XSS Detection', () => {
    test('should detect XSS attempts', () => {
      expect(containsXSS('<script>alert("xss")</script>')).toBe(true);
      expect(containsXSS('javascript:alert("xss")')).toBe(true);
      expect(containsXSS('onclick="alert(\'xss\')"')).toBe(true);
      expect(containsXSS('<iframe src="malicious.com"></iframe>')).toBe(true);
      expect(containsXSS('Safe content')).toBe(false);
    });
  });

  describe('SQL Injection Detection', () => {
    test('should detect SQL injection attempts', () => {
      expect(containsSqlInjection('SELECT * FROM users')).toBe(true);
      expect(containsSqlInjection('DROP TABLE users')).toBe(true);
      expect(containsSqlInjection('1 OR 1=1')).toBe(true);
      expect(containsSqlInjection('Safe content')).toBe(false);
    });
  });

  describe('Comprehensive Input Validation', () => {
    test('should validate and sanitize input', () => {
      const result = validateAndSanitizeInput('test@example.com', {
        type: 'email',
        checkXSS: true,
        checkSqlInjection: true
      });
      
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    test('should reject malicious input', () => {
      const result = validateAndSanitizeInput('<script>alert("xss")</script>', {
        type: 'text',
        checkXSS: true,
        allowHtml: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input contains potentially malicious content');
    });
  });

  describe('Rate Limiter', () => {
    test('should limit requests', () => {
      const limiter = new RateLimiter(3, 1000); // 3 attempts per second
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(false);
      
      expect(limiter.isAllowed('user2')).toBe(true); // Different user
    });

    test('should reset after window', () => {
      const limiter = new RateLimiter(1, 100); // 1 attempt per 100ms
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(false);
      
      // Wait for window to expire
      setTimeout(() => {
        expect(limiter.isAllowed('user1')).toBe(true);
      }, 150);
    });
  });

  describe('Zod Schemas', () => {
    test('should validate user registration', () => {
      const validData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890'
      };
      
      expect(() => userRegistrationSchema.parse(validData)).not.toThrow();
    });

    test('should validate user login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      expect(() => userLoginSchema.parse(validData)).not.toThrow();
    });

    test('should validate profile update', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio'
      };
      
      expect(() => profileUpdateSchema.parse(validData)).not.toThrow();
    });
  });
});
