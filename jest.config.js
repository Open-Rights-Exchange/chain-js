module.exports = {
  automock: false,
  // collectCoverageFrom: [
  //   'src/**/*.{js,jsx,ts}'
  // ],
  roots: [
    '<rootDir>/src/chains/eos_2/tests',
    '<rootDir>/src/tests',
    '<rootDir>/src/crypto/tests',
    '<rootDir>/src/chains/ethereum_1/tests',
  ],
  setupFiles: ['<rootDir>/src/tests/setupJest.js'],
  testMatch: ['<rootDir>/src/**/?(*.)(spec|test).(js|jsx|ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}
