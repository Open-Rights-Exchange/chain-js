module.exports = {
  automock: false,
  roots: [
    '<rootDir>/src/tests',
    '<rootDir>/src/crypto/tests',
  ],
  setupFiles: ['<rootDir>/src/tests/setupJest.js'],
  testMatch: ['<rootDir>/src/**/?(*.)(spec|test).(js|ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}
