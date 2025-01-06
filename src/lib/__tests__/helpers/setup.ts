// グローバルのfetchのモックを設定
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