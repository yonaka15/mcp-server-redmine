# インスペクタツールによるテスト戦略

## ステータス

承認済み - 2025-01-05
更新済み - 2025-01-06

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

2. **国際化（i18n）対応**
   - ツール定義の説明文を英語化しました（2025-01-06）
   - 今後の国際化対応の基礎となります

## 参考資料

- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Inspector Documentation](https://modelcontextprotocol.io/docs/tools/inspector)
- [Redmine API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [ADR 0004: Unit Testing Strategy](./0004-unit-testing-strategy.md)

