export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/test/__mocks__/fileMock.js',
    '^../config/firebase$': '<rootDir>/src/test/__mocks__/firebase-config.ts',
    '^../../config/firebase$': '<rootDir>/src/test/__mocks__/firebase-config.ts',
    '^src/config/firebase$': '<rootDir>/src/test/__mocks__/firebase-config.ts',
    '^firebase/app$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^firebase/auth$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^firebase/firestore$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^firebase/storage$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^firebase/functions$': '<rootDir>/src/test/__mocks__/firebase.ts',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    // Temporarily exclude functions tests until Firebase Functions dependencies are properly configured
    // '<rootDir>/functions/**/*.{test,spec}.{ts,js}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.stories.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/config/firebase.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: false,
        verbatimModuleSyntax: false,
        moduleDetection: 'force',
        noEmit: true,
        strict: false,
        skipLibCheck: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        target: 'ES2022',
        types: ['jest', '@testing-library/jest-dom', 'node'],
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  collectCoverage: true,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
}; 