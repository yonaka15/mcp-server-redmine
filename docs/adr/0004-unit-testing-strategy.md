# ユニットテスト戦略

## ステータス

提案中 - 2025-01-05

## コンテキスト

Redmine用MCPサーバーのコード品質と信頼性を確保するためにユニットテストが必要です。以下のADRを経て実装が安定してきました：

1. プロジェクトの基本構造（0001）
2. API実装（0002、破棄）
3. モジュールの分割（0003）

以下の点を考慮したテスト戦略を決定する必要があります：

1. モジュール分割によりテストが容易になった点
2. モジュールごとに異なるタイプのテストが必要な点
3. 外部依存（Redmine API）のモック戦略

## 決定

以下のアプローチでユニットテストを実装します：

### テスト構造

```
tests/
├── lib/              # ライブラリテスト
│   ├── client.test.ts
│   ├── config.test.ts
│   └── types.test.ts
├── tools/            # ツール定義テスト
│   ├── issues.test.ts
│   ├── projects.test.ts
│   └── time_entries.test.ts
├── formatters/       # フォーマッターテスト
│   ├── issues.test.ts
│   ├── projects.test.ts
│   └── time_entries.test.ts
└── handlers.test.ts  # ハンドラーテスト
```

### テストフレームワーク

- Jest：テストランナーとアサーション
- ts-jest：TypeScriptサポート
- jest-fetch-mock：fetchのモック

### モジュールごとのテスト戦略

1. ライブラリテスト（`lib/`）
   - `client.ts`：APIリクエスト処理、エラー処理、クエリパラメータエンコード
   - `config.ts`：環境変数処理とバリデーション
   - `types.ts`：スキーマバリデーション

2. ツールテスト（`tools/`）
   - ツール定義の検証
   - 入力スキーマの検証
   - 必須フィールドの確認

3. フォーマッターテスト（`formatters/`）
   - 成功レスポンスのフォーマット処理
   - 空の結果のフォーマット処理
   - オプションフィールドの処理

4. ハンドラーテスト（`handlers.ts`）
   - リクエストのルーティング
   - エラー処理
   - レスポンスのフォーマット

### モック戦略

- APIコール用の`fetch`モック
- 設定用の環境変数モック
- レスポンスデータ用の定義済みフィクスチャ

### テストカバレッジ目標

- 行カバレッジ：80%以上
- 分岐カバレッジ：80%以上
- 関数カバレッジ：90%以上

## 結果

### 肯定的な結果

- バグの早期発見
- 安全なリファクタリング
- テストによるドキュメント化
- コード品質の向上
- コード構造に沿った明確なテスト構成

### 否定的な結果

- テスト作成の初期投資時間
- テストフィクスチャのメンテナンス
- 開発環境の追加依存関係

## 参考資料

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)