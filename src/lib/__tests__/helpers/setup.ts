import { jest } from '@jest/globals';

// テスト用環境変数の設定
process.env.REDMINE_API_KEY = 'test-api-key';
process.env.REDMINE_HOST = 'https://test-redmine.example.com';

beforeAll(() => {
  Object.defineProperty(global, "fetch", {
    writable: true,
    value: jest.fn()
  });
});

// テスト後のリセット
afterEach(() => {
  jest.resetAllMocks();
});

// エラー時のスタックトレースを改善
Error.stackTraceLimit = Infinity;