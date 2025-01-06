# Users リソースの追加実装

## ステータス

承認済み - 2025-01-06
完了 - 2025-01-06

## MCP ツール

なし

## コンテキスト

ADR 0002 で計画された 4 つの Stable リソース（Issues, Projects, Users, Time Entries）のうち、Users リソースが未実装であることが判明しました。以下の状況を考慮する必要があります：

1. 実装の必要性

   - README に記載されている機能として明示
   - Redmine REST API の Stable リソース（1.1~）としての位置づけ
   - 他のリソースとの連携（プロジェクトメンバー、チケット担当者など）

2. 現状の課題

   - ADR 0003 の完了リストに Users リソースが含まれていない
   - ユーザー関連の型定義や操作が未実装
   - 既存の実装（Issues, Projects, Time Entries）との整合性確保が必要

3. 技術的制約
   - ADR 0004 のテスト戦略（GET 操作のみのテスト）との整合性
   - ADR 0006 のモジュール分割方針への準拠
   - ADR 0007 のテストツールと設定の活用

## 決定

以下の実装を完了しました：

1. **ファイル構造**

```
src/
├── lib/
│   ├── client/
│   │   ├── users.ts      # 新規作成
│   │   └── index.ts      # 更新
│   └── types/
│       ├── users/        # 新規作成
│       │   ├── schema.ts
│       │   └── types.ts
│       └── index.ts      # 更新
```

2. **API の実装範囲**

   - GET /users - ユーザー一覧の取得
     - ステータスフィルター対応
     - 名前検索対応
     - グループフィルター対応
   - GET /users/:id - ユーザー詳細の取得
     - メンバーシップ情報の取得対応
     - グループ情報の取得対応
   - API クライアントへの UsersClient の統合

3. **型定義とスキーマ**
   - UserListParams, UserShowParams の定義
   - RedmineUser, RedmineUserLimited の定義
   - Zodスキーマの実装
   - バリデーション機能の実装

4. **テスト実装**
   - ADR 0004 に従い、GET メソッドのテストを実装
   - ユーザー一覧取得のテスト
   - ユーザー詳細取得のテスト（include 対応）
   - エラーケースのテストを完了

## 結果

### 肯定的な結果

1. **機能の完全性**
   - README との整合性を確保
   - 計画された全 Stable リソースの実装が完了
   - ユーザー関連機能の提供開始

2. **保守性**
   - 既存の実装パターンを踏襲
   - 一貫したコード構造を維持
   - テスト容易性を確保

3. **拡張性**
   - 将来的な機能拡張への対応が容易
   - 他リソースとの連携強化の基盤を確立

4. **テストカバレッジ**
   - GETメソッドに対する包括的なテストを完了
   - エラーケースの検証も完了

### 否定的な結果

1. **実装の制限**
   - GET メソッドのみのテストによる品質保証の限界
   - 管理者権限が必要な操作の取り扱い

2. **開発への影響**
   - コードの整理と統合が必要
   - 新しい機能の追加に伴うレビュープロセスの増加

## 参考資料

- [Redmine REST Users API](https://www.redmine.org/projects/redmine/wiki/Rest_Users)
- [ADR 0002: API 実装の基本方針](./0002-api-implementation.md)
- [ADR 0003: モジュールの分割](./0003-separate-modules.md)
- [ADR 0004: ユニットテスト戦略](./0004-unit-testing-strategy.md)
- [ADR 0006: モジュール分割](./0006-separate-client-and-types.md)
- [ADR 0007: ユニットテストのツールと設定](./0007-unit-testing-tools-and-configs.md)