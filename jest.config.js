// jest.config.js
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // If you're using [Module Path Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases),
  // you will have to add the moduleNameMapper in order for jest to resolve your absolute paths.
  // The paths have to be matching with the paths option within the compilerOptions in the tsconfig.json
  // For example:
  moduleNameMapper: {
    'ops-frontend/(.*)$': '<rootDir>/src/$1',
    'ops-frontend-test/(.*)$': '<rootDir>/__tests__/$1'
  },
  resolver: undefined,
  testPathIgnorePatterns: ['<rootDir>/__tests__/test-utils'],
  testEnvironment: 'jest-environment-jsdom',
  // collectCoverage: true,
  // on node 14.x coverage provider v8 offers good speed and more or less good report
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/out/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
  ],
  coveragePathIgnorePatterns: [
    'src/pages/_app.tsx',
    'src/pages/_document.tsx',
    'src/i18n/i18n.ts',
    'src/store',
    '__tests__/test-utils'
  ],
  coverageThreshold: {
    global: {
      branches: 80, // because of default value branches
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ["jest-extended/all"]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);