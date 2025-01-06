/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // TypeScript用の設定
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // ESM対応
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  // グローバルセットアップ
  setupFilesAfterEnv: [
    '<rootDir>/src/lib/__tests__/helpers/setup.ts'
  ],

  // テストファイルのパターン
  testMatch: [
    "**/__tests__/**/*.(spec|test).ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/helpers/"
  ],

  // テストタイムアウトの設定
  testTimeout: 10000,  // 10秒
  slowTestThreshold: 5000,  // 5秒以上を遅いテストとして警告

  // カバレッジ設定
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 80,
      statements: 80,
    },
  },
  
  // モック設定
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // エラー表示の改善
  verbose: true,
  
  // モジュール解決の設定
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};