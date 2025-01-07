# ハンドラーモジュールの分割

## ステータス

提案中 - 2025-01-06
完了 - 2025-01-07

## コンテキスト

現在のプロジェクトでは、全ての MCP リクエストハンドラーが `src/handlers.ts` に集約されています。
しかし、以下の問題が発生しています：

1. ファイルが肥大化し、メンテナンスが困難になっている
2. 各ツール（Issues, Projects, Time Entries, Users）のハンドラーが混在している
3. テストの記述が複雑になっている
4. コードの再利用が難しい
5. ツール単位での開発やデバッグが効率的でない

また、MCP の各ツールがそれぞれ独立した機能を持つことを考慮すると、
ハンドラーもツールごとに分割することが望ましいと考えられます。

## 決定

handlers.ts を以下のように分割することにしました：

```
src/
├── handlers/
│   ├── index.ts          # ハンドラーのエントリーポイント
│   ├── issues.ts         # Issuesハンドラー
│   ├── projects.ts       # Projectsハンドラー
│   ├── time_entries.ts   # Time Entriesハンドラー
│   ├── users.ts          # Usersハンドラー
│   └── types.ts          # 共通の型定義
```

### 実装方針

1. 分割の基準

   - ツールの種類ごとに独立したファイルを作成
   - 共通の型定義は types.ts に集約
   - index.ts でハンドラーを集約し、エクスポート

2. 各ファイルの責務

   - `index.ts`: 全ハンドラーの登録とエクスポート
   - `issues.ts`: チケット関連のハンドラー
   - `projects.ts`: プロジェクト関連のハンドラー
   - `time_entries.ts`: 作業時間関連のハンドラー
   - `users.ts`: ユーザー関連のハンドラー
   - `types.ts`: 共通の型定義とインターフェース

3. 移行手順
   - 新しいディレクトリ構造の作成
   - 各ツールのハンドラーを対応するファイルに移動
   - 依存関係の整理と修正
   - テストの更新

### コード構造

```typescript
// handlers/types.ts
export interface HandlerContext {
  client: RedmineClient;
  config: Config;
}

// handlers/issues.ts
export function createIssuesHandlers(context: HandlerContext) {
  return {
    search_issues: async (params: SearchIssuesParams) => {
      // 実装
    },
    // 他のIssuesハンドラー
  };
}

// handlers/index.ts
export function createHandlers(context: HandlerContext) {
  return {
    ...createIssuesHandlers(context),
    ...createProjectsHandlers(context),
    ...createTimeEntriesHandlers(context),
    ...createUsersHandlers(context),
  };
}
```

## 結果

### 肯定的な結果

1. コードの整理と保守性の向上

   - 各ツールのロジックが独立
   - ファイルサイズが適切に管理可能
   - 関心の分離が明確

2. 開発効率の向上

   - ツール単位での開発が容易
   - テストの記述が簡潔に
   - デバッグが効率化

3. 拡張性の向上
   - 新しいツールの追加が容易
   - ツール単位でのバージョン管理
   - 機能の段階的な実装

### 否定的な結果

1. ファイル数の増加

   - プロジェクト構造の複雑化
   - インポート文の増加
   - 初期学習コストの上昇

2. リファクタリングの工数

   - 既存コードの移行作業
   - テストの更新
   - ドキュメントの更新

3. 相互依存の管理
   - モジュール間の依存関係の整理
   - 循環参照の防止
   - インターフェースの一貫性維持

## 参考資料

- [ADR-0001: プロジェクトの基本構造](./0001-base-project-structure.md)

  - ディレクトリ構造の基本方針

- [ADR-0003: モジュールの分割](./0003-separate-modules.md)

  - モジュール分割の考え方

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
  - MCP サーバーの実装パターン

