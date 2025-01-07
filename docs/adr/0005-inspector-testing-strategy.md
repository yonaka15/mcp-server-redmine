# インスペクタツールによるテスト戦略

## ステータス

承認済み - 2025-01-05
更新済み - 2025-01-06
完了 - 2025-01-07

## コンテキスト

Redmine 用 MCP サーバーの実装が以下の ADR を経て基本的な形を整えました：

1. プロジェクトの基本構造（0001）
2. API 実装（0002、破棄）
3. モジュールの分割（0003）
4. ユニットテスト戦略（0004）

実装したコードの動作確認のため、MCP 公式のインスペクタツール（@modelcontextprotocol/inspector）を活用することを検討します。

## 決定

以下のアプローチでインスペクタツールを活用します：

### インスペクタを使用したテストフロー

1. ビルドプロセス

```bash
# TypeScriptのビルド
npm run build

# 実行権限の付与
# インスペクタツールがコマンドとしてビルド済みファイルを実行するため、
# 実行権限が必要です
chmod +x dist/index.js

# インスペクタの起動
npx @modelcontextprotocol/inspector dist/index.js
```

2. テスト項目

- サーバー接続テスト

  - 環境変数の設定
  - プロトコルネゴシエーション
  - エラー処理

- ツール機能テスト（Issues）

  - 一覧取得
  - 詳細取得
  - 作成
  - 更新
  - 削除

- ツール機能テスト（Projects）

  - 一覧取得
  - 詳細取得
  - 作成
  - 更新
  - アーカイブ/アンアーカイブ
  - 削除

- ツール機能テスト（Time Entries）
  - 一覧取得
  - 詳細取得
  - 作成
  - 更新
  - 削除

3. エラーパターンのテスト

- 無効な API キー
- 無効なホスト URL
- 必須パラメータの欠落
- バリデーションエラー
- 存在しないリソースへのアクセス

### テスト環境の準備

1. テスト用の Redmine サーバー

   - テスト用プロジェクト
   - テスト用ユーザー
   - テスト用 API キー

2. 環境変数の設定

```bash
export REDMINE_API_KEY="test_api_key"
export REDMINE_HOST="http://test.redmine.local"
```

### テスト範囲

ADR 0004（ユニットテスト戦略）に従い、データの変更を伴わない GET 操作のみをテストの対象とします。

#### テスト対象ツール

1. **Issues**

   - `search_issues`: チケット検索
   - その他のツール（作成・更新・削除）はテスト対象外

2. **Projects**

   - `search_projects`: プロジェクト検索
   - `get_project`: プロジェクト詳細取得
   - その他のツール（作成・更新・アーカイブ・削除）はテスト対象外

3. **Time Entries**

   - `search_time_entries`: 作業時間検索
   - `get_time_entry`: 作業時間詳細取得
   - その他のツール（作成・更新・削除）はテスト対象外

4. **Users**
   - `search_users`: ユーザー検索
   - `get_user`: ユーザー詳細取得

この方針により、以下の利点が得られます：

- テスト実行による実データへの影響を完全に防止
- 読み取り操作の完全性の確認
- 本番環境での安全なテスト実行が可能

## 実装と改善

### 2025-01-06 の更新

1. **初期セットアップの改善**

   - 実行権限の自動付与に関する問題を特定
   - ビルドプロセスに`chmod +x dist/index.js`を追加
   - テスト手順を更新

2. **プロジェクト検索の修正**

   - `ProjectQuerySchema`に`query`パラメータを追加
   - 検索機能のバグを修正

3. **国際化対応**
   - ツールの説明文を英語に変更（issues.ts, projects.ts, time_entries.ts）

### テスト実施記録

初回テストでは以下の問題を発見：

1. 実行権限の問題

   - 症状：`EACCES`エラー
   - 原因：ビルドファイルに実行権限がない
   - 解決：`chmod +x dist/index.js`の追加

2. プロジェクト検索の問題
   - 症状：検索キーワードが機能しない
   - 原因：クエリパラメータの未実装
   - 解決：スキーマの修正と実装の追加

## 結果

### 肯定的な結果

- エンドツーエンドでの動作確認が可能
- 実際の Redmine API との連携を確認
- インタラクティブなテストが可能
- エラー状況の即時フィードバック
- コードの問題を早期発見
- 権限の問題を含む実行環境の違いを発見可能

### 否定的な結果

- テスト用 Redmine サーバーの準備が必要
- 手動テストのため再現性に課題
- テスト結果の記録・管理が必要
- 自動化が難しい部分が存在
- 実行環境による権限設定の違いに注意が必要

## 注意点

1. **ビルドファイルの実行権限**

   - MCP インスペクタはビルド済みの JavaScript ファイルをコマンドとして実行します
   - `chmod +x dist/index.js` による実行権限の付与が必要です
   - この設定は Git でトラッキングされないため、新規クローン時や CI 環境では必ず実行する必要があります

2. **英語化**
   - ツール定義の説明文を英語化しました（2025-01-06）

## ツールの一覧

### Issues (`src/tools/issues.ts`)

| Tool            | Constant            | Description                                                                                                                                               |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_issues` | `ISSUE_SEARCH_TOOL` | Search for Redmine issues.<br>- Filter by issue ID, project ID, status, assignee, etc.<br>- Full text search with keywords<br>- Retrieve up to 100 issues |
| `create_issue`  | `ISSUE_CREATE_TOOL` | Create a new issue.<br>- Project ID and subject are required<br>- Can specify tracker, status, priority<br>- Supports custom field values                 |
| `update_issue`  | `ISSUE_UPDATE_TOOL` | Update an existing issue.<br>- Issue ID is required<br>- Only specify fields to be updated<br>- Can add comments                                          |
| `delete_issue`  | `ISSUE_DELETE_TOOL` | Delete an issue.<br>- Specify issue ID<br>- This action cannot be undone                                                                                  |

### Projects (`src/tools/projects.ts`)

| Tool                | Constant                 | Description                                                                                                                                                  |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `search_projects`   | `PROJECT_SEARCH_TOOL`    | Search for Redmine projects.<br>- Search by name or ID<br>- Filter by status<br>- Retrieve up to 100 projects                                                |
| `get_project`       | `PROJECT_GET_TOOL`       | Get detailed project information.<br>- Specify project ID (numeric) or identifier (string)<br>- Can include related information like trackers and categories |
| `create_project`    | `PROJECT_CREATE_TOOL`    | Create a new project.<br>- Name and identifier are required<br>- Can specify parent project<br>- Configure modules and trackers                              |
| `update_project`    | `PROJECT_UPDATE_TOOL`    | Update an existing project.<br>- Specify project ID (numeric) or identifier (string)<br>- Only specify fields to be updated                                  |
| `archive_project`   | `PROJECT_ARCHIVE_TOOL`   | Archive a project.<br>- Specify project ID (numeric) or identifier (string)<br>- Archived projects cannot be edited                                          |
| `unarchive_project` | `PROJECT_UNARCHIVE_TOOL` | Restore an archived project.<br>- Specify project ID (numeric) or identifier (string)<br>- Project becomes editable after unarchiving                        |
| `delete_project`    | `PROJECT_DELETE_TOOL`    | Delete a project.<br>- Specify project ID (numeric) or identifier (string)<br>- This action cannot be undone<br>- Subprojects will also be deleted           |

### Time Entries (`src/tools/time_entries.ts`)

| Tool                  | Constant                 | Description                                                                                                                                       |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_time_entries` | `TIME_ENTRY_SEARCH_TOOL` | Search for time entries.<br>- Filter by user ID, project ID, and date<br>- Search within a date range<br>- Retrieve up to 100 entries             |
| `get_time_entry`      | `TIME_ENTRY_GET_TOOL`    | Get detailed time entry information.<br>- Retrieve a single time entry by ID                                                                      |
| `create_time_entry`   | `TIME_ENTRY_CREATE_TOOL` | Create a new time entry.<br>- Either project ID or issue ID is required<br>- Hours and activity ID are required<br>- Supports custom field values |
| `update_time_entry`   | `TIME_ENTRY_UPDATE_TOOL` | Update an existing time entry.<br>- Update a single time entry by ID<br>- Only specify fields to be updated<br>- Cannot change project            |
| `delete_time_entry`   | `TIME_ENTRY_DELETE_TOOL` | Delete a time entry.<br>- Delete a single time entry by ID<br>- This action cannot be undone                                                      |

### Users (`src/tools/users.ts`)

| Tool           | Constant           | Description      |
| -------------- | ------------------ | ---------------- |
| `search_users` | `USER_SEARCH_TOOL` | Search for users |
| `get_user`     | `USER_GET_TOOL`    | Get user details |

## 参考資料

- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Inspector Documentation](https://modelcontextprotocol.io/docs/tools/inspector)
- [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [ADR 0004: Unit Testing Strategy](./0004-unit-testing-strategy.md)
