module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
  verbose: true,
};
