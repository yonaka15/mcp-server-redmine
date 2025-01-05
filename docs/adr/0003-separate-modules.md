# モジュールの分割とディレクトリ構造の整理

## ステータス

承認済み - 2025-01-05
完了 - 2025-01-05

## コンテキスト

MCP サーバーの実装を進める中で、以下の状況に直面しています：

1. 現在の実装状況

   - `lib/`, `types.ts`, `config.ts`, `client.ts`は実装済み
   - `handlers.ts`を実装中で、以下の課題が発生
     - ツールの定義が増えることで、ファイルサイズが急速に増大
     - フォーマット関数の追加でさらにコードが肥大化
     - テストが書きづらい状態に

2. 現状の課題
   - `handlers.ts`の実装が 400 行を超える見込み
   - 関連する機能（ツール定義、フォーマット関数）が 1 ファイルに混在
   - 各ツールのテストが困難な状態

## 決定

以下のようなディレクトリ構造に変更することを決定しました：

```
src/
├── tools/                # ツール定義
│   ├── issues.ts
│   ├── projects.ts
│   ├── time_entries.ts
│   └── index.ts
├── formatters/          # フォーマッター
│   ├── issues.ts
│   ├── projects.ts
│   ├── time_entries.ts
│   └── index.ts
├── lib/                 # 実装済みの共通ライブラリ
│   ├── client.ts        # Redmine APIクライアント
│   ├── config.ts        # 設定管理
│   └── types.ts         # 型定義
├── handlers.ts          # リクエストハンドラー
└── index.ts            # エントリーポイント
```

### 1. モジュールの分割方針

- ツール定義（`tools/`）

  - Redmine の各リソースごとにファイルを分割
  - 各ツールのスキーマと入力バリデーションを含む
  - `index.ts`で全ツールをエクスポート

- フォーマッター（`formatters/`）

  - レスポンスのフォーマット処理を分離
  - リソースごとに適切なテキスト形式に整形
  - 再利用可能な形で実装

- ハンドラー（`handlers.ts`）
  - ツールの実行制御に特化
  - エラーハンドリングの統一的な処理
  - MCP プロトコルに従ったレスポンス生成

### 2. モジュール間の依存関係

依存の方向を以下のように制限：

```
handlers → tools → lib
       ↘        ↗
     formatters
```

## 結果

### 肯定的な結果

- 実装済みコードの整理と再利用性の向上
- ハンドラーの責務が明確に
- テストが書きやすい構造に改善
- 新しいツールの追加が容易に
- フォーマット処理の一貫性確保

### 否定的な結果

- ファイル数の増加
- 移行作業が必要
- インポートパスの管理が必要
- TypeScript の設定変更が必要

### 適用結果

この ADR に基づいて以下の実装が完了しました：

1. チケット関連機能

- 検索、作成、更新、削除

2. プロジェクト関連機能

- 検索、詳細取得、作成、更新
- アーカイブ/アンアーカイブ、削除

3. 作業時間関連機能

- 検索、詳細取得、作成、更新、削除

全ての機能について、ツール定義、フォーマッター、ハンドラーの 3 要素による実装が完了しました。

## 参照

- [Model Context Protocol servers](https://github.com/modelcontextprotocol/servers)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)

ハンドラーの実装に関連する参考資料：

- [MCP Tool Schema 定義](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/types.ts)
- [MCP プロトコル仕様書](https://spec.modelcontextprotocol.io)

