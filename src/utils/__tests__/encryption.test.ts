import {
  generateSalt,
  generateIV,
  encrypt,
  decrypt,
  hash,
  verifyHash,
  generateSecureToken,
  encryptObject,
  decryptObject,
  checkPasswordStrength,
  generateSecurePassword,
  SecureStorage
} from '../encryption';

// Mock crypto for testing
const mockCrypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    digest: jest.fn()
  }
};

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

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

describe('Encryption Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Salt Generation', () => {
    test('should generate salt with default length', () => {
      const salt = generateSalt();
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    test('should generate salt with custom length', () => {
      const salt = generateSalt(8);
      expect(salt).toHaveLength(16); // 8 bytes = 16 hex chars
    });
  });

  describe('IV Generation', () => {
    test('should generate IV', () => {
      const iv = generateIV();
      expect(iv).toHaveLength(24); // 12 bytes = 24 hex chars
    });
  });

  describe('Encryption and Decryption', () => {
    test('should encrypt and decrypt data', async () => {
      const testData = 'sensitive data';
      const password = 'test-password';

      // Mock crypto operations
      const mockKey = {} as CryptoKey;
      const mockEncryptedBuffer = new ArrayBuffer(16);
      const mockDecryptedBuffer = new TextEncoder().encode(testData);

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedBuffer);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedBuffer);

      const encrypted = await encrypt(testData, password);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');

      const decrypted = await decrypt(encrypted, password);
      expect(decrypted).toBe(testData);
    });

    test('should handle encryption errors', async () => {
      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Crypto error'));

      await expect(encrypt('data', 'password')).rejects.toThrow('Encryption failed');
    });

    test('should handle decryption errors', async () => {
      const invalidData = { encrypted: 'invalid', iv: 'invalid', salt: 'invalid' };
      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Crypto error'));

      await expect(decrypt(invalidData, 'password')).rejects.toThrow('Decryption failed');
    });
  });

  describe('Hashing', () => {
    test('should hash data', async () => {
      const testData = 'password123';
      const mockHashBuffer = new ArrayBuffer(32);
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      const result = await hash(testData);
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
    });

    test('should verify hash', async () => {
      const testData = 'password123';
      const mockHashBuffer = new ArrayBuffer(32);
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      const { hash: testHash, salt } = await hash(testData);
      const isValid = await verifyHash(testData, testHash, salt);
      expect(isValid).toBe(true);
    });
  });

  describe('Secure Token Generation', () => {
    test('should generate secure token', () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    test('should generate token with custom length', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe('Object Encryption', () => {
    test('should encrypt and decrypt objects', async () => {
      const testObject = { name: 'John', age: 30, secret: 'confidential' };
      const password = 'test-password';

      // Mock crypto operations
      const mockKey = {} as CryptoKey;
      const mockEncryptedBuffer = new ArrayBuffer(16);
      const mockDecryptedBuffer = new TextEncoder().encode(JSON.stringify(testObject));

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedBuffer);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedBuffer);

      const encrypted = await encryptObject(testObject, password);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');

      const decrypted = await decryptObject(encrypted, password);
      expect(decrypted).toEqual(testObject);
    });
  });

  describe('Password Strength', () => {
    test('should check strong passwords', () => {
      const strongPassword = 'StrongPass123!';
      const result = checkPasswordStrength(strongPassword);
      
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.isStrong).toBe(true);
      expect(result.feedback).toHaveLength(0);
    });

    test('should check weak passwords', () => {
      const weakPassword = 'weak';
      const result = checkPasswordStrength(weakPassword);
      
      expect(result.score).toBeLessThan(3);
      expect(result.isStrong).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    test('should provide feedback for weak passwords', () => {
      const weakPassword = 'password';
      const result = checkPasswordStrength(weakPassword);
      
      expect(result.feedback).toContain('Include uppercase letters');
      expect(result.feedback).toContain('Include numbers');
      expect(result.feedback).toContain('Include special characters (@$!%*?&)');
    });
  });

  describe('Secure Password Generation', () => {
    test('should generate secure password', () => {
      const password = generateSecurePassword();
      expect(password).toHaveLength(16);
      
      // Check that it contains all required character types
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[@$!%*?&]/);
    });

    test('should generate password with custom length', () => {
      const password = generateSecurePassword(20);
      expect(password).toHaveLength(20);
    });
  });

  describe('Secure Storage', () => {
    let secureStorage: SecureStorage;

    beforeEach(() => {
      secureStorage = new SecureStorage('test-password');
    });

    test('should store and retrieve encrypted data', async () => {
      const testData = 'sensitive data';
      
      // Mock encryption
      const mockKey = {} as CryptoKey;
      const mockEncryptedBuffer = new ArrayBuffer(16);
      const mockDecryptedBuffer = new TextEncoder().encode(testData);

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedBuffer);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedBuffer);

      localStorageMock.setItem.mockImplementation((key, value) => {
        localStorageMock.getItem.mockReturnValue(value);
      });

      await secureStorage.setItem('test-key', testData);
      const retrieved = await secureStorage.getItem('test-key');
      
      expect(retrieved).toBe(testData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', expect.any(String));
    });

    test('should store and retrieve objects', async () => {
      const testObject = { name: 'John', age: 30 };
      
      // Mock encryption
      const mockKey = {} as CryptoKey;
      const mockEncryptedBuffer = new ArrayBuffer(16);
      const mockDecryptedBuffer = new TextEncoder().encode(JSON.stringify(testObject));

      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedBuffer);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockDecryptedBuffer);

      localStorageMock.setItem.mockImplementation((key, value) => {
        localStorageMock.getItem.mockReturnValue(value);
      });

      await secureStorage.setObject('test-key', testObject);
      const retrieved = await secureStorage.getObject('test-key');
      
      expect(retrieved).toEqual(testObject);
    });

    test('should handle missing data', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = await secureStorage.getItem('missing-key');
      expect(result).toBeNull();
    });

    test('should handle decryption errors', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const result = await secureStorage.getItem('invalid-key');
      expect(result).toBeNull();
    });
  });
});
