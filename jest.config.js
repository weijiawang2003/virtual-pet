/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'core',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/core/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/_scaffold_tmp/', '\\.vtime\\.test\\.ts$'],
    },
    {
      displayName: 'ui',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/src/ui/**/*.test.{ts,tsx}', '<rootDir>/__tests__/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: ['/node_modules/', '/_scaffold_tmp/'],
    },
    {
      displayName: 'virtual-time',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/core/**/*.vtime.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/_scaffold_tmp/'],
    },
    {
      displayName: 'providers',
      preset: 'jest-expo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/providers/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/_scaffold_tmp/'],
    },
  ],
  collectCoverageFrom: [
    'src/core/**/*.ts',
    '!src/core/**/*.test.ts',
    '!src/core/**/*.vtime.test.ts',
    '!src/core/**/types.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 95,
      branches: 90,
      functions: 95,
    },
  },
};
