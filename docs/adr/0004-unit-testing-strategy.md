# ユニットテスト戦略

## ステータス

承認済み - 2025-01-06
実装開始 - 2025-01-06
更新 - 2025-01-06
第4版 - 2025-01-06

## コンテキスト

Redmine用MCPサーバーのコード品質と信頼性を確保するためにユニットテストが必要です。以下のADRを経て実装が安定してきました：

1. プロジェクトの基本構造（0001）
2. API実装（0002、破棄）
3. モジュールの分割（0003）
4. クライアントと型定義の分割（0006）

以下の点を考慮したテスト戦略を決定し実装を進める必要があります：

1. モジュール分割によりテストが容易になった点
2. モジュールごとに異なるタイプのテストが必要な点
3. 外部依存（Redmine API）のモック戦略
4. Redmine APIの仕様に準拠した実装の検証
5. テストコードの保守性と可読性の確保
6. クライアントの分割に伴うテストの再構築（ADR 0006による変更）

## 決定

### テスト実装のプロセス

各APIエンドポイントのテストを実装する際は、以下の手順で進める：

1. **API仕様の確認**
   - RedmineのREST API仕様を確認
   - エンドポイントの詳細な仕様を確認（パラメータ、レスポンス形式等）
   - バージョンによる違いの有無を確認

2. **既存コードの確認**
   - 実装済みのコードを確認
   - API仕様との整合性を確認
   - 実装上の制約や拡張を確認

3. **テストケースの実装**
   - 基本的なケース
   - エッジケース
   - エラーケース
   - Redmine API仕様に基づく検証

### ファイル構造

テストの保守性と可読性を向上させるため、以下のような構造でテストファイルを分割：

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── helpers/          # テストヘルパー
│   │   │   ├── fixtures.ts   # テストデータ
│   │   │   ├── setup.ts      # グローバル設定
│   │   │   └── mocks.ts      # 共通モック
│   │   ├── client/           # クライアントのテスト
│   │   │   ├── base/         # 基本機能のテスト
│   │   │   │   ├── request.test.ts
│   │   │   │   └── params.test.ts
│   │   │   ├── issues/       # Issues APIのテスト
│   │   │   │   ├── get.test.ts
│   │   │   │   ├── post.test.ts
│   │   │   │   ├── put.test.ts
│   │   │   │   └── delete.test.ts
│   │   │   ├── projects/     # Projects APIのテスト
│   │   │   └── time_entries/ # TimeEntries APIのテスト
│   │   └── types/            # 型のテスト
│   │       ├── issues/
│   │       ├── projects/
│   │       └── time_entries/
```

この構造の利点：
- 機能ごとのテストファイルの分離
- ドメインごとのテストの整理
- テストコードの見通しの向上
- メンテナンスの容易化
- チーム開発時の競合リスクの低減
- クライアント分割に対応した構造

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

3. **モックの使用方法**
   - jest.spyOnを使用してグローバルfetchをモック化
   - mockResolvedValueOnceでレスポンスを設定
   ```typescript
   describe("IssuesClient", () => {
     let client: IssuesClient;
     const mockFetch = jest.spyOn(global, "fetch");

     beforeEach(() => {
       client = new IssuesClient();
     });

     it("fetches issues", async () => {
       mockFetch.mockResolvedValueOnce(
         mockResponse(fixtures.issueListResponse)
       );
       const result = await client.getIssues();
       expect(result).toEqual(fixtures.issueListResponse);
     });
   });
   ```

学び：
1. モックの型付けの重要性
   - TypeScriptの型システムを活用してモックの型を正確に定義することで、テストの信頼性が向上
   - 将来の型エラーを早期に発見可能

2. Responseオブジェクトのモック
   - 独自のモックオブジェクトではなく、実際のResponseオブジェクトを使用することで型の整合性を保証
   - ヘッダーやステータスコードなど、実際のレスポンスに近い形でテストが可能

3. jest.spyOnの活用
   - グローバルオブジェクトのモック化には、型安全なjest.spyOnを使用
   - mockImplementationOnceではなくmockResolvedValueOnceを使用してPromiseを適切に扱う

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

### 実装状況（2025-01-06時点）

1. **テスト環境の整備**
   - ベースとなるテスト環境の構築
   - TypeScriptサポートの設定
   - グローバルモックの実装

2. **基本機能のテスト**
   - BaseClientのリクエスト機能テスト
   - パラメータエンコード機能テスト

3. **再実装が必要な部分**（ADR 0006によるモジュール分割の影響）
   - Issues APIのテスト
   - Projects APIのテスト
   - TimeEntries APIのテスト
   - 各クライアントのモック
   - フィクスチャの再整理

## 結果

### 肯定的な結果

1. テストの整理と管理
   - API仕様に基づく体系的なテスト実装が可能に
   - モジュール構造に合わせたテストの整理
   - テストヘルパーとフィクスチャの再利用
   - HTTPリクエストのモック化による安定したテスト

2. 実装プロセス
   - プロセスの標準化によるテスト品質の均一化
   - テストファイルの分割による保守性の向上
   - テストケースの見通しの改善
   - グローバルモックの一元管理

3. モジュール分割効果
   - 個別のクライアントテストが容易に
   - 依存関係が明確で影響範囲が把握しやすい
   - 共通機能のテストが再利用可能

### 否定的な結果

1. コスト面
   - ファイル数の増加に伴う初期学習コストの上昇
   - API仕様の詳細な確認が必要で実装に時間がかかる
   - モジュール分割による再実装の必要性

2. 管理面
   - フィクスチャの保守が必要
   - テストファイル間の依存関係の管理が必要
   - モックの一貫性維持が必要

### 今後のタスク

1. テスト実装の優先順位
   - BaseClientの基本機能テスト
   - Issues APIのテスト再実装
   - Projects APIのテスト再実装
   - TimeEntries APIのテスト再実装

2. 品質管理
   - カバレッジ目標の達成状況の監視
   - テストの実行時間の最適化
   - モックデータの整理と管理

## 参考資料

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest)
- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Issues REST API](https://www.redmine.org/projects/redmine/wiki/Rest_Issues)
- [ADR 0006: クライアントと型定義の分割](./0006-separate-client-and-types.md)