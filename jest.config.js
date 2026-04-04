module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  moduleNameMapper: {
    '^node:(.*)$': '$1',
  },
  collectCoverageFrom: [
    'app.js',
    'api/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
  ],
  coverageReporters: ['text', 'lcov'],
};
