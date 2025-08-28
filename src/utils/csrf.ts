// CSRF (Cross-Site Request Forgery) protection utilities

export interface CSRFToken {
  token: string;
  expiresAt: number;
  issuedAt: number;
}

export interface CSRFConfig {
  tokenLength?: number;
  tokenExpiryMs?: number;
  headerName?: string;
  cookieName?: string;
}

const DEFAULT_CONFIG: Required<CSRFConfig> = {
  tokenLength: 32,
  tokenExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf-token'
};

// Generate secure random token
export const generateCSRFToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create CSRF token with expiration
export const createCSRFToken = (config: CSRFConfig = {}): CSRFToken => {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  
  return {
    token: generateCSRFToken(opts.tokenLength),
    expiresAt: now + opts.tokenExpiryMs,
    issuedAt: now
  };
};

// Validate CSRF token
export const validateCSRFToken = (
  token: string, 
  storedToken: CSRFToken | null
): { isValid: boolean; error?: string } => {
  if (!storedToken) {
    return { isValid: false, error: 'No CSRF token found' };
  }
  
  if (Date.now() > storedToken.expiresAt) {
    return { isValid: false, error: 'CSRF token has expired' };
  }
  
  if (token !== storedToken.token) {
    return { isValid: false, error: 'CSRF token mismatch' };
  }
  
  return { isValid: true };
};

// Store CSRF token in localStorage
export const storeCSRFToken = (token: CSRFToken, key: string = 'csrf-token'): void => {
  try {
    localStorage.setItem(key, JSON.stringify(token));
  } catch (error) {
    console.error('Failed to store CSRF token:', error);
  }
};

// Get stored CSRF token
export const getStoredCSRFToken = (key: string = 'csrf-token'): CSRFToken | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const token = JSON.parse(stored) as CSRFToken;
    
    if (Date.now() > token.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Failed to retrieve CSRF token:', error);
    return null;
  }
};

// CSRF protection class
export class CSRFProtection {
  private config: Required<CSRFConfig>;
  private storageKey: string;
  
  constructor(config: CSRFConfig = {}, storageKey: string = 'csrf-token') {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storageKey = storageKey;
  }
  
  initialize(): CSRFToken {
    const token = createCSRFToken(this.config);
    storeCSRFToken(token, this.storageKey);
    return token;
  }
  
  getToken(): CSRFToken {
    let token = getStoredCSRFToken(this.storageKey);
    
    if (!token) {
      token = this.initialize();
    }
    
    return token;
  }
  
  validate(token: string): { isValid: boolean; error?: string } {
    const storedToken = getStoredCSRFToken(this.storageKey);
    return validateCSRFToken(token, storedToken);
  }
  
  refresh(): CSRFToken {
    const token = createCSRFToken(this.config);
    storeCSRFToken(token, this.storageKey);
    return token;
  }
  
  getHeaders(): Record<string, string> {
    return {
      [this.config.headerName]: this.getToken().token
    };
  }
}

// Fetch wrapper with CSRF protection
export const csrfFetch = async (
  url: string, 
  options: RequestInit = {}, 
  csrfProtection: CSRFProtection
): Promise<Response> => {
  const headers = {
    ...options.headers,
    ...csrfProtection.getHeaders()
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};
