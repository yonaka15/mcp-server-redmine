# Redmine API 実装の基本方針

## ステータス

破棄 - 2025-01-05

## コンテキスト

MCP サーバーへの Redmine API の実装方針を決定する必要があります。
以下の点を考慮します：

- サーバーの初期化と設定
- 実装アプローチ
- 対象とする API の範囲
- データ形式の選択
- コードの構成

## 決定

以下の実装方針を採用します：

### 1. コードの構成とアプローチ

モジュールを分割し、責務を明確に分けて実装します：

```
src/
  ├── config.ts    - 設定管理
  ├── types.ts     - 型定義とスキーマ
  ├── client.ts    - Redmine APIクライアント
  ├── handlers.ts  - MCPリクエストハンドラ
  └── index.ts     - エントリーポイント
```

各モジュールの役割：

#### config.ts - 環境変数と設定の管理
```typescript
const ConfigSchema = z.object({
  redmine: z.object({
    apiKey: z.string({
      required_error: "REDMINE_API_KEY environment variable is required",
    }),
    host: z
      .string({
        required_error: "REDMINE_HOST environment variable is required",
      })
      .url("REDMINE_HOST must be a valid URL"),
  }),
  server: z.object({
    name: z.string().default("@yonaka15/mcp-server-redmine"),
    version: z.string().default("0.1.0"),
  }),
});
```

#### client.ts - API通信の実装
```typescript
export class RedmineClient {
  private async performRequest<T>(path: string, options?: RequestInit): Promise<T> {
    const url = new URL(path, config.redmine.host);
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json() as RedmineErrorResponse;
      throw new RedmineApiError(
        response.status,
        response.statusText,
        error.errors
      );
    }

    return response.json();
  }
}
```

### 2. 対象 API の範囲

Stable ステータスのリソースのみを対象とします：

1. Issues (1.0~)
   - チケットの作成、取得、更新、削除
2. Projects (1.0~)
   - プロジェクトの取得、更新、アーカイブ
3. Users (1.1~)
   - ユーザー情報の取得
4. Time Entries (1.1~)
   - 作業時間の記録、取得

### 3. データ形式

JSON 形式を採用し、zodによる型定義とバリデーションを実装します：

```typescript
// クエリパラメータのスキーマ
export const IssueQuerySchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  include: z.string().transform(str => str.split(",").filter(Boolean)).optional(),
  // ...その他のパラメータ
});

// リソースのスキーマ
export const RedmineIssueSchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  // ...その他のフィールド
});

// エラーの型定義
export class RedmineApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly errors: string[]
  ) {
    super(`Redmine API error: ${status} ${statusText}\n${errors.join(", ")}`);
    this.name = "RedmineApiError";
  }
}
```

### 4. エラーハンドリング

- カスタムエラークラスによる詳細なエラー情報の提供
- APIレスポンスコードに応じた適切な処理
- バリデーションエラーの明確な通知

## 結果

この決定は実装を進める中で、以下の理由により破棄されました：

1. ファイル構成が不十分
   - ツール定義とフォーマット処理が混在
   - コードの肥大化が予想される

2. 責務の分離が不十分
   - ハンドラーに多くの責務が集中
   - テストが困難な構造

これらの課題を解決するため、[ADR 0003: モジュールの分割とディレクトリ構造の整理](./0003-separate-modules.md)で、より詳細な実装方針が定められました。

ただし、本ADRで定義された以下の要素は、新しい実装でも継承されています：
- 設定管理の方針
- APIクライアントの基本構造
- 対象APIの範囲
- データ形式とバリデーション方針
- エラーハンドリングの方針

## 参考資料

- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Redmine REST Issues API](https://www.redmine.org/projects/redmine/wiki/Rest_Issues)
- [Redmine REST Projects API](https://www.redmine.org/projects/redmine/wiki/Rest_Projects)
- [Redmine REST Time Entries API](https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries)
- [Redmine REST Users API](https://www.redmine.org/projects/redmine/wiki/Rest_Users)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ADR 0003: モジュールの分割とディレクトリ構造の整理](./0003-separate-modules.md)