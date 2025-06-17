module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
    '^.+\\.(css|less|scss|sass)$': 'jest-css-modules-transform'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  collectCoverageFrom: [
    'src/**/*.jsx',
    '!src/**/index.jsx',
    '!src/**/types/**/*.jsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover']
};
