# プロジェクトの基本構造

## ステータス

承認済み - 2025-01-05

## MCP ツール

この ADR ではツールを定義しません。

## コンテキスト

Redmine の MCP サーバーを実装するにあたり、プロジェクトの基本構造と設定を決定する必要があります。
参考として、以下の既存実装を検討しました：

- MCP TypeScript SDK（パッケージ設定と TypeScript 設定のベースとして）
- Brave Search MCP Server（ディレクトリ構造のベースとして）

主な考慮点：

- MCP サーバーの標準的な実装パターンとの整合性
- TypeScript/Node.js プロジェクトとしての現代的な設定
- コードの保守性とテスト容易性
- 将来の機能拡張への対応

## 決定

以下の基本設定とディレクトリ構造を採用することにしました。

### ディレクトリ構造

```
.
├── README.ja.md
├── dist/            # コンパイル済みファイル用
├── docs/
│   └── adr/        # アーキテクチャ決定記録
├── src/
│   ├── index.ts    # メインエントリーポイント
│   ├── handlers.ts # MCPリクエストハンドラー
│   ├── client.ts   # Redmine APIクライアント
│   ├── types.ts    # 型定義
│   └── config.ts   # 設定
├── package.json    # プロジェクト設定
└── tsconfig.json   # TypeScript設定
```

### パッケージ設定（package.json）

主要な設定項目：

- type: "module" - ES Modules を使用
- engines: "node": ">=18" - Node.js v18 以上を要求
- dependencies:
  - @modelcontextprotocol/sdk: "^1.1.0" - 最新の MCP SDK を使用
  - zod: バリデーション用
- devDependencies:
  - typescript: ^5.5.4
  - tsx: 開発時の実行環境
  - jest: テストフレームワーク
- scripts:
  - build: TypeScript のビルド
  - dev: 開発用サーバー（tsx 使用）
  - test: Jest によるテスト実行
  - lint: ESLint による静的解析

### TypeScript 設定（tsconfig.json）

主要な設定項目：

- target: "es2018" - 比較的新しい JavaScript 機能を使用可能
- module: "Node16" - 最新のモジュールシステム
- declaration: true - 型定義ファイルの生成
- strict: true - 厳格な型チェック
- isolatedModules: true - 単一ファイルでの型チェックを保証
- その他のビルド最適化オプション

## 結果

### 肯定的な結果

- シンプルで理解しやすい構造
- 関心の分離が適切に行われている
- 他の MCP サーバー実装との一貫性
- 機能単位でのファイル分割による保守性の向上
- 現代的な TypeScript/Node.js プロジェクトの慣行に従った設定
- 開発体験の向上（tsx, ESLint, Jest）

### 否定的な結果

- ファイル数が増加した場合の管理の複雑化
- 複雑な機能を追加する際のディレクトリ構造の見直しが必要になる可能性
- 開発環境のセットアップがやや複雑になる

## 参考資料

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - パッケージ設定と TypeScript 設定のベース
  - [package.json](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/package.json)
  - [tsconfig.json](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/tsconfig.json)

