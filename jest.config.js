module.exports = {
  verbose: true,
  resetMocks: false,
  preset: 'ts-jest',
  roots: ['src'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: ['jest-localstorage-mock'],
  testEnvironment: 'jest-environment-jsdom',
};
