# Redmine API 実装の基本方針

## ステータス

承認済み - 2025-01-05

## MCP ツール

この ADR ではツールを定義しません。

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

単一ファイルで実装し、シンプルで直接的なアプローチを取ります：

```typescript
const REDMINE_API_KEY = process.env.REDMINE_API_KEY!;
const REDMINE_HOST = process.env.REDMINE_HOST!;

if (!REDMINE_API_KEY || !REDMINE_HOST) {
  console.error(
    "Error: REDMINE_API_KEY and REDMINE_HOST environment variables are required"
  );
  process.exit(1);
}

const server = new Server(
  {
    name: "@yonaka15/mcp-server-redmine",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function performRedmineRequest(path: string, options?: RequestInit) {
  const url = new URL(path, REDMINE_HOST);
  const response = await fetch(url, {
    ...options,
    headers: {
      "X-Redmine-API-Key": REDMINE_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Redmine API error: ${response.status} ${
        response.statusText
      }\\n${await response.text()}`
    );
  }

  return response.json();
}
```

index.ts での実装順序：

1. 型定義
2. 環境変数チェック
3. ユーティリティ関数
4. API リクエスト関数
5. MCP ツールの定義
6. リクエストハンドラーの設定
7. サーバー起動処理

### 2. 対象 API の範囲

Stable ステータスのリソースのみを対象とします：

1. Issues (1.0~)
   - チケットの作成、取得、更新、削除
2. Projects (1.0~)
   - プロジェクトの取得、更新
3. Users (1.1~)
   - ユーザー情報の取得
4. Time Entries (1.1~)
   - 作業時間の記録、取得

### 3. データ形式

JSON 形式を採用し、以下のような型定義とバリデーションを実装します：

```typescript
// 共通の型定義
interface PaginatedResponse<T> {
  total_count: number;
  offset: number;
  limit: number;
  [key: string]: T[] | number; // issues, projects などの配列
}

// Issues
interface RedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  subject: string;
  description?: string;
  start_date?: string;
  done_ratio: number;
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
  created_on: string;
  updated_on: string;
}

// Projects
interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  created_on: string;
  updated_on: string;
  is_public: boolean;
}

// Time Entries
interface RedmineTimeEntry {
  id: number;
  project: {
    id: number;
    name: string;
  };
  issue?: {
    id: number;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
  hours: number;
  comments?: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
}

// Users
interface RedmineUser {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  updated_on: string;
  last_login_on?: string;
  passwd_changed_on?: string;
  status: number; // 1: active, 2: registered, 3: locked
  api_key?: string; // Only visible for admins and self
  custom_fields?: {
    id: number;
    name: string;
    value: string | string[];
  }[];
  memberships?: {
    project: {
      id: number;
      name: string;
    };
    roles: {
      id: number;
      name: string;
    }[];
  }[];
  groups?: {
    id: number;
    name: string;
  }[];
}

// zodによるバリデーションスキーマ
const RedmineIssueSchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  tracker: z.object({
    id: z.number(),
    name: z.string(),
  }),
  status: z.object({
    id: z.number(),
    name: z.string(),
  }),
  priority: z.object({
    id: z.number(),
    name: z.string(),
  }),
  author: z.object({
    id: z.number(),
    name: z.string(),
  }),
  subject: z.string(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  done_ratio: z.number(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .optional(),
  created_on: z.string(),
  updated_on: z.string(),
});

const RedmineProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  identifier: z.string(),
  description: z.string().optional(),
  created_on: z.string(),
  updated_on: z.string(),
  is_public: z.boolean(),
});

const RedmineTimeEntrySchema = z.object({
  id: z.number(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  issue: z
    .object({
      id: z.number(),
    })
    .optional(),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  activity: z.object({
    id: z.number(),
    name: z.string(),
  }),
  hours: z.number(),
  comments: z.string().optional(),
  spent_on: z.string(),
  created_on: z.string(),
  updated_on: z.string(),
});

const RedmineUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  mail: z.string(),
  created_on: z.string(),
  updated_on: z.string(),
  last_login_on: z.string().optional(),
  passwd_changed_on: z.string().optional(),
  status: z.number(),
  api_key: z.string().optional(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .optional(),
  memberships: z
    .array(
      z.object({
        project: z.object({
          id: z.number(),
          name: z.string(),
        }),
        roles: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
      })
    )
    .optional(),
  groups: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
});
```

## 結果

### 肯定的な結果

- シンプルで理解しやすい実装
- 単一ファイルでの完結した実装
- 信頼性の高い API のみを使用
- JSON による扱いやすいデータ形式
- TypeScript/zod による型安全性
- Redmine の API 仕様に忠実な型定義
- すべての Stable リソースに対する型定義の提供

### 否定的な結果

- コードの再利用性が限定的
- テストの分離が難しい
- 一部の有用な機能が利用できない
- 将来的な機能追加時の複雑化

## 参考資料

- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Redmine REST Issues API](https://www.redmine.org/projects/redmine/wiki/Rest_Issues)
- [Redmine REST Projects API](https://www.redmine.org/projects/redmine/wiki/Rest_Projects)
- [Redmine REST Time Entries API](https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries)
- [Redmine REST Users API](https://www.redmine.org/projects/redmine/wiki/Rest_Users)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
