# Redmine API 仕様に基づく MCP ツールの再定義

## ステータス

提案中 - 2025-01-07

## コンテキスト

現在の MCP ツール実装が、Redmine REST API の仕様と完全には一致していない問題が発覚しました：

1. 命名の不一致

   - `search_` や `get_` といった命名が API の命名規則と異なる
   - リソース間で命名規則が統一されていない

2. パラメータの不完全な実装

   - プロジェクト検索で API にないパラメータを定義
   - 多くのフィルターオプションが未実装
   - フォーマットやバリデーションの定義が不十分

3. レスポンス形式の不統一
   - include による関連データの取得が不完全
   - 返却データの形式が API と異なる部分がある

Redmine API の仕様と完全な一貫性を持たせ、より正確で使いやすいツールにする必要があります。

## 決定

### 1. 命名規則の統一

API のエンドポイントに合わせて命名を統一：

- 一覧取得: `list_{resource}` 例）GET /issues -> `list_issues`
- 詳細取得: `show_{resource}` 例）GET /issues/1 -> `show_issue`
- 作成: `create_{resource}` 例）POST /issues -> `create_issue`
- 更新: `update_{resource}` 例）PUT /issues/1 -> `update_issue`
- 削除: `delete_{resource}` 例）DELETE /issues/1 -> `delete_issue`

### 2. リソースとツールの定義

各リソースの完全なツールセット：

1. Issues

   - list_issues
   - show_issue
   - create_issue
   - update_issue
   - delete_issue
   - add_issue_watcher
   - remove_issue_watcher

2. Projects

   - list_projects
   - show_project
   - create_project
   - update_project
   - delete_project
   - archive_project
   - unarchive_project

3. Time Entries

   - list_time_entries
   - show_time_entry
   - create_time_entry
   - update_time_entry
   - delete_time_entry

4. Users
   - list_users
   - show_user
   - create_user
   - update_user
   - delete_user

### 3. パラメータ定義の標準化

#### 3.1 共通パラメータ

- ページネーション: `offset`, `limit`
- 関連データ取得: `include`（カンマ区切り）
- ソート: `sort`（カラム名、`:desc`で降順）

#### 3.2 リソース固有のパラメータ

- ID 指定: 数値または文字列（リソースにより異なる）
- ステータス: 文字列または数値（`open`, `closed`, `*`など）
- 日付: `YYYY-MM-DD`形式
- タイムスタンプ: `YYYY-MM-DDTHH:MM:SSZ`形式

#### 3.3 カスタムフィールド

- **フィルター形式**: `cf_{field_id}`

  - `field_id`: カスタムフィールドの ID（数値）
  - 例：`cf_1`, `cf_2`, `cf_3`

- **検索演算子**:

  - 完全一致: `cf_1=value`
  - 部分一致: `cf_1=~value`
  - その他の演算子は URL エンコードが必要

- **制約事項**:
  - フィルタリング可能なフィールドのみ使用可能
  - フィールド ID は事前に確認が必要
  - カスタムフィールドは「フィルターとして使用」が有効化されている必要がある

### 4. リソース別実装仕様

#### 4.1 Issues

- list_issues:
  - カスタムフィールドによるフィルタリングをサポート
  - 複数の `cf_{field_id}` パラメータを同時に使用可能

#### 4.2 Projects

- list_projects:
  - カスタムフィールドの取得をサポート
  - include=issue_custom_fields で取得可能

## 結果

### 肯定的な結果

1. API 仕様との一貫性

   - 完全な機能セットの提供
   - 正確なパラメータ処理
   - 標準的なレスポンス形式

2. 使いやすさの向上

   - 一貫した命名規則
   - 明確なパラメータ定義
   - 適切なバリデーション

3. 保守性の向上
   - 明確な機能範囲
   - API ドキュメントとの整合性

### 否定的な結果

1. 後方互換性の課題

   - ツール名の変更による影響
   - パラメータ仕様の変更
   - 既存コードの修正必要性

2. 実装の複雑化

   - より詳細なバリデーション
   - エラーハンドリングの増加

3. 移行コスト
   - 既存実装の改修
   - テストの更新
   - ドキュメントの改訂

## 参考資料

- [Redmine REST API Issues](https://www.redmine.org/projects/redmine/wiki/Rest_Issues)
- [Redmine REST API Projects](https://www.redmine.org/projects/redmine/wiki/Rest_Projects)
- [Redmine REST API Time Entries](https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries)
- [Redmine REST API Users](https://www.redmine.org/projects/redmine/wiki/Rest_Users)
- [Redmine REST API Custom Fields](https://www.redmine.org/projects/redmine/wiki/Rest_api#Working-with-custom-fields)
