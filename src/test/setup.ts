import '@testing-library/jest-dom';

// Ensure Jest DOM matchers are available
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

// Polyfill TextEncoder for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;

// Polyfill fetch for Node.js environment
(global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() => {
  const response = {
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    clone: () => response,
    headers: new Map(),
    url: '',
    statusText: 'OK',
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  };
  return Promise.resolve(response);
}) as jest.Mock;

(global as unknown as { Request: jest.Mock }).Request = jest.fn() as jest.Mock;
(global as unknown as { Response: jest.Mock }).Response = jest.fn() as jest.Mock;

// Temporarily disable MSW for testing due to version compatibility issues
// import { server } from './mocks/server';

// Establish API mocking before all tests
// beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  // server.resetHandlers();
  jest.clearAllMocks();
});

// Clean up after the tests are finished
// afterAll(() => server.close());

// Mock IntersectionObserver
(global as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root: null = null;
  rootMargin: string = '';
  thresholds: readonly number[] = [];
  takeRecords() { return []; }
} as typeof IntersectionObserver;

// Mock ResizeObserver
(global as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as typeof ResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as unknown as { localStorage: typeof localStorage }).localStorage = localStorageMock as typeof localStorage;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as unknown as { sessionStorage: typeof sessionStorage }).sessionStorage = sessionStorageMock as typeof sessionStorage;

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 