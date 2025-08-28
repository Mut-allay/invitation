import {
  generateCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  storeCSRFToken,
  getStoredCSRFToken,
  CSRFProtection,
  csrfFetch
} from '../csrf';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock crypto
const mockCrypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  })
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

describe('CSRF Protection Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Generation', () => {
    test('should generate CSRF token with default length', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    test('should generate CSRF token with custom length', () => {
      const token = generateCSRFToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe('Token Creation', () => {
    test('should create CSRF token with expiration', () => {
      const token = createCSRFToken();
      
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('issuedAt');
      expect(typeof token.token).toBe('string');
      expect(typeof token.expiresAt).toBe('number');
      expect(typeof token.issuedAt).toBe('number');
      expect(token.expiresAt).toBeGreaterThan(token.issuedAt);
    });

    test('should create token with custom configuration', () => {
      const token = createCSRFToken({
        tokenLength: 16,
        tokenExpiryMs: 1000
      });
      
      expect(token.token).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(token.expiresAt - token.issuedAt).toBe(1000);
    });
  });

  describe('Token Validation', () => {
    test('should validate correct token', () => {
      const storedToken = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
        issuedAt: Date.now()
      };
      
      const result = validateCSRFToken('test-token', storedToken);
      expect(result.isValid).toBe(true);
    });

    test('should reject missing token', () => {
      const result = validateCSRFToken('test-token', null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No CSRF token found');
    });

    test('should reject expired token', () => {
      const storedToken = {
        token: 'test-token',
        expiresAt: Date.now() - 1000, // Expired 1 second ago
        issuedAt: Date.now() - 3600000
      };
      
      const result = validateCSRFToken('test-token', storedToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CSRF token has expired');
    });

    test('should reject mismatched token', () => {
      const storedToken = {
        token: 'stored-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      const result = validateCSRFToken('different-token', storedToken);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('CSRF token mismatch');
    });
  });

  describe('Token Storage', () => {
    test('should store token in localStorage', () => {
      const token = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      storeCSRFToken(token, 'test-key');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(token)
      );
    });

    test('should retrieve stored token', () => {
      const token = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(token));
      
      const retrieved = getStoredCSRFToken('test-key');
      expect(retrieved).toEqual(token);
    });

    test('should return null for missing token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const retrieved = getStoredCSRFToken('test-key');
      expect(retrieved).toBeNull();
    });

    test('should return null for expired token', () => {
      const expiredToken = {
        token: 'test-token',
        expiresAt: Date.now() - 1000, // Expired
        issuedAt: Date.now() - 3600000
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredToken));
      
      const retrieved = getStoredCSRFToken('test-key');
      expect(retrieved).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });

    test('should handle invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const retrieved = getStoredCSRFToken('test-key');
      expect(retrieved).toBeNull();
    });
  });

  describe('CSRF Protection Class', () => {
    let csrfProtection: CSRFProtection;

    beforeEach(() => {
      csrfProtection = new CSRFProtection();
    });

    test('should initialize CSRF protection', () => {
      const token = csrfProtection.initialize();
      
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('issuedAt');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should get existing token', () => {
      const existingToken = {
        token: 'existing-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingToken));
      
      const token = csrfProtection.getToken();
      expect(token).toEqual(existingToken);
    });

    test('should create new token if none exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const token = csrfProtection.getToken();
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('issuedAt');
    });

    test('should validate token', () => {
      const storedToken = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedToken));
      
      const result = csrfProtection.validate('test-token');
      expect(result.isValid).toBe(true);
    });

    test('should refresh token', () => {
      const token = csrfProtection.refresh();
      
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('issuedAt');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should get headers', () => {
      const mockToken = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
      
      const headers = csrfProtection.getHeaders();
      expect(headers).toHaveProperty('X-CSRF-Token');
      expect(headers['X-CSRF-Token']).toBe('test-token');
    });

    test('should use custom configuration', () => {
      const customProtection = new CSRFProtection({
        headerName: 'Custom-CSRF-Token',
        tokenLength: 16
      });
      
      const token = customProtection.initialize();
      expect(token.token).toHaveLength(32); // 16 bytes = 32 hex chars
      
      const headers = customProtection.getHeaders();
      expect(headers).toHaveProperty('Custom-CSRF-Token');
    });
  });

  describe('CSRF Fetch Wrapper', () => {
    let csrfProtection: CSRFProtection;

    beforeEach(() => {
      csrfProtection = new CSRFProtection();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });

    test('should add CSRF token to headers', async () => {
      const mockToken = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
      
      await csrfFetch('https://api.example.com/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, csrfProtection);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'test-token'
          })
        })
      );
    });

    test('should preserve existing headers', async () => {
      const mockToken = {
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
        issuedAt: Date.now()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));
      
      const existingHeaders = {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      };
      
      await csrfFetch('https://api.example.com/data', {
        method: 'POST',
        headers: existingHeaders
      }, csrfProtection);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'test-token'
          })
        })
      );
    });
  });
});
