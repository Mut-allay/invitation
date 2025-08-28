// Data encryption utilities for sensitive information
// Uses Web Crypto API for secure encryption/decryption

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
}

export interface EncryptionOptions {
  algorithm?: 'AES-GCM' | 'AES-CBC';
  keyLength?: 128 | 256;
  iterations?: number;
}

// Default encryption options
const DEFAULT_OPTIONS: Required<EncryptionOptions> = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000
};

// Generate a random salt
export const generateSalt = (length: number = 16): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Generate a random IV (Initialization Vector)
export const generateIV = (): string => {
  const array = new Uint8Array(12); // 96 bits for AES-GCM
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Convert string to ArrayBuffer
export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer to string
export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

// Convert hex string to ArrayBuffer
export const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// Convert ArrayBuffer to hex string
export const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Derive encryption key from password
export const deriveKey = async (
  password: string, 
  salt: string, 
  options: EncryptionOptions = {}
): Promise<CryptoKey> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const passwordBuffer = stringToArrayBuffer(password);
  const saltBuffer = hexToArrayBuffer(salt);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: opts.iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: opts.algorithm,
      length: opts.keyLength
    },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data
export const encrypt = async (
  data: string, 
  password: string, 
  options: EncryptionOptions = {}
): Promise<EncryptedData> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(password, salt, opts);
    
    const dataBuffer = stringToArrayBuffer(data);
    const ivBuffer = hexToArrayBuffer(iv);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: opts.algorithm,
        iv: ivBuffer
      },
      key,
      dataBuffer
    );
    
    return {
      encrypted: arrayBufferToHex(encryptedBuffer),
      iv,
      salt
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Decrypt data
export const decrypt = async (
  encryptedData: EncryptedData, 
  password: string, 
  options: EncryptionOptions = {}
): Promise<string> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const key = await deriveKey(password, encryptedData.salt, opts);
    
    const encryptedBuffer = hexToArrayBuffer(encryptedData.encrypted);
    const ivBuffer = hexToArrayBuffer(encryptedData.iv);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: opts.algorithm,
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );
    
    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Hash data (one-way encryption)
export const hash = async (data: string, salt?: string): Promise<{ hash: string; salt: string }> => {
  const dataSalt = salt || generateSalt();
  const dataBuffer = stringToArrayBuffer(data + dataSalt);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hash = arrayBufferToHex(hashBuffer);
  
  return { hash, salt: dataSalt };
};

// Verify hash
export const verifyHash = async (data: string, hashValue: string, salt: string): Promise<boolean> => {
  const { hash: computedHash } = await hash(data, salt);
  return computedHash === hashValue;
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Encrypt sensitive object data
export const encryptObject = async (
  obj: Record<string, unknown>, 
  password: string, 
  options: EncryptionOptions = {}
): Promise<EncryptedData> => {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString, password, options);
};

// Decrypt sensitive object data
export const decryptObject = async (
  encryptedData: EncryptedData, 
  password: string, 
  options: EncryptionOptions = {}
): Promise<Record<string, unknown>> => {
  const jsonString = await decrypt(encryptedData, password, options);
  return JSON.parse(jsonString) as Record<string, unknown>;
};

// Encrypt file data
export const encryptFile = async (
  file: File, 
  password: string, 
  options: EncryptionOptions = {}
): Promise<EncryptedData> => {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return encrypt(base64, password, options);
};

// Decrypt file data
export const decryptFile = async (
  encryptedData: EncryptedData, 
  password: string, 
  originalFileName: string,
  originalFileType: string,
  options: EncryptionOptions = {}
): Promise<File> => {
  const base64 = await decrypt(encryptedData, password, options);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new File([bytes], originalFileName, { type: originalFileType });
};

// Secure storage wrapper
export class SecureStorage {
  private password: string;
  private options: EncryptionOptions;
  
  constructor(password: string, options: EncryptionOptions = {}) {
    this.password = password;
    this.options = options;
  }
  
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encrypt(value, this.password, this.options);
    localStorage.setItem(key, JSON.stringify(encrypted));
  }
  
  async getItem(key: string): Promise<string | null> {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;
    
    try {
      const encrypted = JSON.parse(encryptedData) as EncryptedData;
      return await decrypt(encrypted, this.password, this.options);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
  
  async setObject(key: string, value: Record<string, unknown>): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }
  
  async getObject(key: string): Promise<Record<string, unknown> | null> {
    const data = await this.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to parse object:', error);
      return null;
    }
  }
}

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Include special characters (@$!%*?&)');
  
  // Additional checks
  if (password.length >= 12) score += 1;
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
  else feedback.push('Avoid repeated characters');
  
  // Cap score at 4
  score = Math.min(score, 4);
  
  return {
    score,
    feedback,
    isStrong: score >= 3
  };
};

// Generate secure password
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
  let password = '';
  
  // Ensure at least one character from each category
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '@$!%*?&'[Math.floor(Math.random() * 7)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
