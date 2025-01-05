# Redmine MCP Server

Model Context Protocol (MCP) に対応した Redmine サーバーの実装です。RedmineのREST APIと連携して、チケット情報やプロジェクト情報をLLMに提供します。

## 機能

Redmine REST APIのStableなリソースに対応しています：
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

## セットアップ

### APIキーの取得

1. Redmineの管理者設定でRESTAPIを有効化
2. ユーザー設定ページからAPIキーを取得

### 環境変数の設定

以下の環境変数を設定してください：

- `REDMINE_API_KEY`: Redmineのユーザー設定で取得したAPIキー
- `REDMINE_HOST`: RedmineサーバーのURL（例：`https://redmine.example.com`）

## 開発

### 必要な環境

- Node.js 18以上
- npm 9以上

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

### 設計方針

アーキテクチャの決定記録（ADR）は `docs/adr` に保存されています。主な決定事項：

1. プロジェクトの基本構造（0001-base-project-structure.md）
2. モジュールの分割方針（0003-separate-modules.md）

## ライセンス

MIT

## 関連プロジェクト

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine](https://www.redmine.org/)