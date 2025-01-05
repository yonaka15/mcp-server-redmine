# Redmine MCP Server

Model Context Protocol (MCP) に対応した Redmine サーバーの実装です。RedmineのREST APIと連携して、チケット情報やプロジェクト情報をLLMに提供します。

## 機能

### リソース

- チケット情報の取得
  - チケット一覧
  - チケットの詳細（説明、コメント、添付ファイルなど）
  - カスタムフィールド
- プロジェクト情報の取得
  - プロジェクト一覧
  - プロジェクトの詳細
  - メンバー情報
- ユーザー情報の取得

### プロンプト

- チケット分析用テンプレート
  - チケット内容の要約
  - 関連チケットの提案
- プロジェクト分析用テンプレート
  - プロジェクト概要の生成

### ツール

- チケット検索
  - ステータス、担当者、期日などでの絞り込み
  - キーワード検索
- プロジェクト検索
  - ステータスでの絞り込み
  - キーワード検索

## セットアップ

### APIキーの取得

1. Redmineの管理者設定でRESTAPIを有効化
2. ユーザー設定ページからAPIキーを取得

### Claude Desktopでの設定

`claude_desktop_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "redmine": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-redmine"
      ],
      "env": {
        "REDMINE_API_KEY": "YOUR_API_KEY_HERE",
        "REDMINE_HOST": "https://your-redmine-server"
      }
    }
  }
}
```

### Docker

```json
{
  "mcpServers": {
    "redmine": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "REDMINE_API_KEY",
        "-e",
        "REDMINE_HOST",
        "mcp/redmine"
      ],
      "env": {
        "REDMINE_API_KEY": "YOUR_API_KEY_HERE",
        "REDMINE_HOST": "https://your-redmine-server"
      }
    }
  }
}
```

## 開発

### 必要な環境

- Node.js 18以上
- npm 9以上

### ディレクトリ構造

```
.
├── src/
│   ├── index.ts           # メインエントリーポイント
│   ├── handlers.ts        # MCPリクエストハンドラー
│   ├── client.ts          # Redmine APIクライアント
│   ├── types.ts           # 型定義
│   └── config.ts          # 設定
├── Dockerfile             # Dockerビルド設定
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript設定
└── README.ja.md          # ドキュメント
```

### ビルド

Dockerビルド：

```bash
docker build -t mcp/redmine:latest .
```

npmビルド：

```bash
# インストール
npm install

# ビルド
npm run build

# 開発サーバーの起動
npm run dev
```

## ライセンス

MIT

## 関連プロジェクト

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine](https://www.redmine.org/)