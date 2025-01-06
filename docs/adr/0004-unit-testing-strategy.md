# ユニットテスト戦略

## ステータス

承認済み - 2025-01-06
実装開始 - 2025-01-06
更新 - 2025-01-06
第2版 - 2025-01-06

## コンテキスト

Redmine用MCPサーバーのコード品質と信頼性を確保するためにユニットテストが必要です。以下のADRを経て実装が安定してきました：

1. プロジェクトの基本構造（0001）
2. API実装（0002、破棄）
3. モジュールの分割（0003）

以下の点を考慮したテスト戦略を決定し実装を進める必要があります：

1. モジュール分割によりテストが容易になった点
2. モジュールごとに異なるタイプのテストが必要な点
3. 外部依存（Redmine API）のモック戦略
4. Redmine APIの仕様に準拠した実装の検証
5. テストコードの保守性と可読性の確保

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
│   │   │   └── setup.ts      # グローバル設定
│   │   ├── base.test.ts      # 基本機能のテスト
│   │   └── issues/           # Issues APIのテスト
│   │       ├── get.test.ts   # GET /issues と GET /issues/[id]
│   │       ├── post.test.ts  # POST /issues
│   │       ├── put.test.ts   # PUT /issues/[id]
│   │       └── delete.test.ts # DELETE /issues/[id]
```

この構造の利点：
- 機能ごとのテストファイルの分離
- テストコードの見通しの向上
- メンテナンスの容易化
- チーム開発時の競合リスクの低減

### モックの戦略

1. **外部APIのモック化**
   - グローバルfetchのモック化による外部API呼び出しのシミュレーション
   - setup.tsでのグローバルモックの設定
   ```typescript
   beforeEach(() => {
     global.fetch = jest.fn();
   });

   afterEach(() => {
     jest.resetAllMocks();
   });
   ```

2. **レスポンスのモック**
   - fixtures.tsでテストデータを一元管理
   - エラーレスポンスを含む各種パターンの定義

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

2. **Issues APIのテスト実装**
   - base.test.ts（基本機能のテスト）
     - リクエストヘッダーの検証
     - HTTPメソッドの検証
     - レスポンスステータスの処理
     - エラーハンドリング
   - get.test.ts（GETリクエストのテスト）
     - 一覧取得と単一リソース取得
     - クエリパラメータの処理
     - エラーハンドリング
   - post.test.ts（POSTリクエストのテスト）
     - リソースの作成
     - バリデーション
     - エラーハンドリング
   - put.test.ts（PUTリクエストのテスト）
     - リソースの更新
     - バリデーション
     - エラーハンドリング
   - delete.test.ts（DELETEリクエストのテスト）
     - リソースの削除
     - エラーハンドリング

## 結果

### 肯定的な結果

- API仕様に基づく体系的なテスト実装が可能に
- モジュール構造に合わせたテストの整理
- テストヘルパーとフィクスチャの再利用
- HTTPリクエストのモック化による安定したテスト
- プロセスの標準化によるテスト品質の均一化
- テストファイルの分割による保守性の向上
- テストケースの見通しの改善
- グローバルモックの一元管理による保守性向上

### 否定的な結果

- ファイル数の増加に伴う初期学習コストの上昇
- API仕様の詳細な確認が必要で実装に時間がかかる
- フィクスチャの保守が必要
- テストファイル間の依存関係の管理が必要

### 今後の課題

1. Projects APIのテスト実装
2. Time Entries APIのテスト実装
3. カバレッジ目標の達成状況の監視
4. テストの実行時間の最適化

## 参考資料

- [Jest Documentation](https://jestjs.io/docs/getting-started) - テストフレームワークの基本設定とベストプラクティス
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest) - TypeScriptサポートの設定方法
- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api) - APIの仕様と制約
- [Issues REST API](https://www.redmine.org/projects/redmine/wiki/Rest_Issues) - Issuesリソースの詳細仕様