module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  moduleNameMapper: {
    '^node:(.*)$': '$1',
  },
};
