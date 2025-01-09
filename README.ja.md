# Redmine MCP Server

Model Context Protocol (MCP) に対応した Redmine サーバーの実装です。Redmine の REST API と連携して、チケット情報やプロジェクト情報を LLM に提供します。

## 機能

Redmine REST API の Stable なリソースに対応しています：

- Issues (1.0~) - チケット
- Projects (1.0~) - プロジェクト
- Users (1.1~) - ユーザー
- Time Entries (1.1~) - 作業時間

### ツール

#### チケット関連

- チケット検索
  - プロジェクト、ステータス、担当者などでの絞り込み
  - キーワード検索
  - カスタムフィールド対応
- チケット作成・更新
  - トラッカー、ステータス、優先度の設定
  - カスタムフィールドの設定
  - コメントの追加
- チケット削除

#### プロジェクト関連

- プロジェクト検索
  - アクティブ/アーカイブ/クローズド状態での絞り込み
  - キーワード検索
- プロジェクト詳細取得
  - トラッカー、カテゴリなどの情報を含む
- プロジェクト作成・更新
  - モジュールやトラッカーの設定
  - メンバー継承設定
- プロジェクトのアーカイブ/アンアーカイブ
- プロジェクト削除

#### 作業時間関連

- 作業時間の記録検索
  - プロジェクト、ユーザー、期間での絞り込み
- 作業時間の詳細取得
- 作業時間の記録・更新
  - プロジェクトまたはチケットへの記録
  - 作業分類の指定
  - カスタムフィールド対応
- 作業時間の削除

## Claude での利用

Claude でこのサーバーを利用する場合、以下のような設定を行います：

```json
{
  "mcp-server-redmine": {
    "command": "npx",
    "args": [
      "-y",
      "--prefix",
      "/path/to/mcp-server-redmine",
      "mcp-server-redmine"
    ],
    "env": {
      "REDMINE_HOST": "https://your-redmine.example.com",
      "REDMINE_API_KEY": "your-api-key-here"
    }
  }
}
```

### 設定項目の説明

- `command`: npm パッケージを実行するためのコマンド
- `args`:
  - `-y`: プロンプトに自動で「yes」と応答
  - `--prefix`: インストール先のディレクトリを指定
  - 最後の引数はパッケージ名を指定
- `env`: 環境変数の設定
  - `REDMINE_HOST`: Redmine サーバーの URL
  - `REDMINE_API_KEY`: Redmine で取得した API キー

## セットアップ

### API キーの取得

1. Redmine の管理者設定で RESTAPI を有効化
2. ユーザー設定ページから API キーを取得

### 環境変数の設定

以下の環境変数を設定してください：

- `REDMINE_API_KEY`: Redmine のユーザー設定で取得した API キー
- `REDMINE_HOST`: Redmine サーバーの URL（例：`https://redmine.example.com`）

## テストについて

### ユニットテスト

```bash
# テストの実行
npm test
```

データの安全性のため、GET 操作のみをテスト対象としています。

### インスペクタによるテスト

[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)を使用して動作確認を行うことができます：

```bash
# ビルド
npm run build

# 実行権限の付与（重要）
chmod +x dist/index.js

# インスペクタの起動
npx @modelcontextprotocol/inspector dist/index.js
```

## 権限について

一部の機能は管理者権限が必要です：

### ユーザー関連

- `list_users`: 管理者権限必須
- `create_user`: 管理者権限必須
- `update_user`: 管理者権限必須
- `delete_user`: 管理者権限必須

各ユーザーの権限レベルによって、取得できる情報が異なります。詳細は[Redmine API のドキュメント](https://www.redmine.org/projects/redmine/wiki/Rest_Users)を参照してください。

## 開発

### 必要な環境

- Node.js 18 以上
- npm 9 以上

### 使用ライブラリ

- `@modelcontextprotocol/sdk`: MCP SDK
- `zod`: スキーマ検証
- `typescript`: 型システム

### ディレクトリ構造

```
.
├── src/
│   ├── tools/            # ツール定義
│   │   ├── issues.ts
│   │   ├── projects.ts
│   │   ├── time_entries.ts
│   │   └── index.ts
│   ├── formatters/       # フォーマッター
│   │   ├── issues.ts
│   │   ├── projects.ts
│   │   ├── time_entries.ts
│   │   └── index.ts
│   ├── lib/             # 共通ライブラリ
│   │   ├── client.ts     # Redmine APIクライアント
│   │   ├── config.ts     # 設定管理
│   │   └── types.ts      # 型定義
│   ├── handlers.ts       # リクエストハンドラー
│   └── index.ts         # エントリーポイント
├── docs/
│   └── adr/             # アーキテクチャ決定記録
├── package.json         # プロジェクト設定
├── tsconfig.json        # TypeScript設定
└── README.ja.md         # ドキュメント
```

### ビルド

```bash
# インストール
npm install

# ビルド
npm run build

# 開発サーバーの起動
npm run dev
```

### アーキテクチャ決定記録

プロジェクトの主要な設計判断は `docs/adr` に記録されています。新しい機能の追加や変更を行う際は、これらのドキュメントを参照してください。

## ライセンス

MIT

## 関連プロジェクト

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine](https://www.redmine.org/)

