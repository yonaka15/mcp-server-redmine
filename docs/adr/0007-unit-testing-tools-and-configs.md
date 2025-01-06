# ユニットテストのツールと設定

## ステータス

承認済み - 2025-01-06
作成 - 2025-01-06

## コンテキスト

[ADR 0004: ユニットテスト戦略](./0004-unit-testing-strategy.md)で決定したテスト戦略を実現するために、具体的なツールと設定が必要です。
実装を進める中で、以下の課題が明らかになりました：

1. テストフレームワークの選定と設定
2. モックの実装方針
3. TypeScriptとの統合
4. ESモジュールへの対応
5. テストヘルパーの実装方針

## 決定

### テストフレームワークと環境

1. **フレームワーク構成**
   - Jest：テストランナーとアサーション
   - ts-jest：TypeScriptサポート
   - Node.js環境でのテスト実行

2. **環境設定（jest.config.ts）**
   ```typescript
   const config: JestConfigWithTsJest = {
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
       "**/__tests__/**/*.[jt]s?(x)",
       "**/?(*.)+(spec|test).[jt]s?(x)"
     ],

     // カバレッジ設定
     collectCoverage: true,
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 90,
         lines: 80,
         statements: 80,
       },
     },
   };
   ```

### モックの戦略

1. **外部APIのモック化**
   - グローバルfetchのモック化による外部API呼び出しのシミュレーション
   - setup.tsでのグローバルモックの設定
   ```typescript
   // モック用の型定義と設定
   beforeAll(() => {
     Object.defineProperty(global, "fetch", {
       writable: true,
       value: jest.fn()
     });
   });

   afterEach(() => {
     jest.resetAllMocks();
   });
   ```

2. **レスポンスのモック**
   - fixtures.tsでテストデータを一元管理
   - 実際のResponseオブジェクトを返すモックを作成
   ```typescript
   export const mockResponse = (body: unknown, init?: ResponseInit): Response => {
     return new Response(JSON.stringify(body), {
       status: 200,
       headers: { "Content-Type": "application/json" },
       ...init
     });
   };
   ```

3. **Jestのモック実装方針**
   ```typescript
   import { jest, expect, describe, it, beforeEach, afterEach } from '@jest/globals';
   import type { Mock } from 'jest-mock';

   let mockFetch: Mock;
   mockFetch = jest.spyOn(global, 'fetch') as Mock;
   ```
   この実装は：
   - `@jest/globals`から必要な関数を全てインポート
   - `jest-mock`から`Mock`型を型定義としてインポート
   - モック用の変数を`Mock`型として定義
   - `spyOn`の戻り値を`Mock`型にキャスト

### URLとパラメータのテスト

URLやクエリパラメータのテストを容易にするためのヘルパー関数を実装：

```typescript
// テスト用のURLパース関数
export function parseUrl(url: string): { base: string; params: Record<string, string> } {
  const urlObj = new URL(url);
  const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return { base, params };
}

// テストでの使用例
it("fetches issues with parameters", async () => {
  const [url] = mockFetch.mock.calls[0] as [string, ...unknown[]];
  const { base, params } = parseUrl(url);
  
  // URLのベース部分とクエリパラメータを別々に検証
  expect(params).toEqual({
    offset: "0",
    limit: "25",
    project_id: "20",
    status_id: "open",
    sort: "updated_on:desc"
  });
});
```

注意点：
- URLパースの結果は基本URL部分にクエリパラメータを含めないようにする
- クエリパラメータは個別のオブジェクトとして扱う
- パラメータの値は全て文字列として扱う

## 結果

### 肯定的な結果

1. **テストフレームワークと設定**
   - TypeScriptとの優れた統合
   - ESモジュールのサポート
   - 包括的なカバレッジレポート

2. **モックの実装**
   - グローバルfetchの一貫したモック化
   - レスポンスモックの再利用性
   - 型安全なモック実装

3. **ヘルパー関数**
   - URLとパラメータのテストが容易に
   - コードの再利用性向上
   - テストの可読性向上

### 否定的な結果

1. **設定の複雑さ**
   - ESモジュール対応の複雑な設定
   - TypeScript設定の詳細な調整が必要
   - ts-jestの設定オプション管理

2. **モック管理**
   - グローバルモックの状態管理
   - テスト間での影響の可能性
   - モックリセットの必要性

3. **学習コスト**
   - Jest, TypeScript, ts-jestの組み合わせの理解
   - モックパターンの習得
   - ヘルパー関数の使用方法

## 参考資料

### Jest関連

1. [Jest TypeScript Documentation](https://jestjs.io/docs/getting-started#using-typescript)
   - TypeScriptを使用する際の公式推奨設定
   - ts-jestの設定方法

2. [DefinitelyTyped Jest](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jest)
   - Jestの型定義の実装
   - 現在の型定義の制限事項

3. [Jest Source Code (jest-mock)](https://github.com/jestjs/jest/tree/main/packages/jest-mock)
   - Jestのモック機能の実装
   - Mock型の定義

4. [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
   - ts-jestの設定オプション
   - 型定義の扱い方

### その他の参考資料

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Node.js ESM Support](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [ADR 0004: ユニットテスト戦略](./0004-unit-testing-strategy.md)