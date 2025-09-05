import type { Config } from 'jest';

const config: Config = {
  displayName: 'tenant',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/tenant',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,ts}',
    '<rootDir>/src/**/*.{spec,test}.{js,ts}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^@aiofix/shared$': '<rootDir>/../../shared/src/index.ts',
    '^@aiofix/config$': '<rootDir>/../../config/src/index.ts',
    '^@aiofix/logging$': '<rootDir>/../../logging/src/index.ts',
    '^@aiofix/database$': '<rootDir>/../../database/src/index.ts',
    '^@aiofix/iam$': '<rootDir>/../iam/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};

export default config;
