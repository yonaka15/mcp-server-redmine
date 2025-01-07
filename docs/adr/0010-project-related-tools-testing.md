# プロジェクト関連ツールのテスト実施

## ステータス

提案中 - 2025-01-07

## コンテキスト

ADR 0005 で定めたインスペクタツールによるテスト戦略に基づき、プロジェクト関連ツールのテストを実施します。
ADR 0004 のテスト戦略に従い、データの変更を伴わない GET 操作のみをテストの対象とします。

### テスト対象ツール

プロジェクト関連のツールは `src/tools/projects.ts` で以下のように定義されています：

```typescript
// プロジェクト検索ツール
export const PROJECT_SEARCH_TOOL: Tool = {
  name: "search_projects",
  description:
    "Search for Redmine projects.\n" +
    "- Search by name or ID\n" +
    "- Filter by status\n" +
    "- Retrieve up to 100 projects",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search keywords",
      },
      status: {
        type: "number",
        description: "Status (1: active, 5: archived, 9: closed)",
        enum: [1, 5, 9],
      },
      include: {
        type: "string",
        description:
          "Include additional info (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: "",
      },
      limit: {
        type: "number",
        description: "Number of results (1-100)",
        default: 10,
      },
    },
    required: ["query"],
  },
};

// プロジェクト詳細取得ツール
export const PROJECT_GET_TOOL: Tool = {
  name: "get_project",
  description:
    "Get detailed project information.\n" +
    "- Specify project ID (numeric) or identifier (string)\n" +
    "- Can include related information like trackers and categories",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Project ID (numeric) or identifier (string)",
      },
      include: {
        type: "string",
        description:
          "Include additional info (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: "",
      },
    },
    required: ["id"],
  },
};
```

## 目的

1. 各パラメータの機能確認：

   - スキーマ定義されたすべてのパラメータが期待通り動作することを確認
   - パラメータの型チェックが正しく機能することを確認
   - 必須パラメータの検証が機能することを確認
   - デフォルト値が正しく適用されることを確認

2. レスポンスの検証：
   - パラメータの変更が適切に Redmine API のリクエストに反映されることを確認
   - 取得したデータの形式が期待通りであることを確認
   - include パラメータによる追加情報が正しく取得できることを確認

## 決定

インスペクタツールを使用して以下の検証を行います：

1. `search_projects`

   ```typescript
   // 型定義の確認
   properties: {
     query: string; // 必須
     status: number; // enum [1, 5, 9]
     include: string; // カンマ区切りリスト
     limit: number; // 1-100、デフォルト10
   }
   ```

2. `get_project`
   ```typescript
   // 型定義の確認
   properties: {
     id: string; // 必須
     include: string; // カンマ区切りリスト
   }
   ```

各パラメータについて、以下の観点で検証を実施：

- 型の境界値（型変換、不正な値の検証）
- 必須チェック（required: true の項目）
- デフォルト値の適用
- 列挙値の制限（enum 指定がある場合）
- 複合データの形式（カンマ区切りリストなど）

## 参考資料

- [ADR 0004: Unit Testing Strategy](./0004-unit-testing-strategy.md)
- [ADR 0005: Inspector Testing Strategy](./0005-inspector-testing-strategy.md)
- [Redmine REST API Projects](https://www.redmine.org/projects/redmine/wiki/Rest_Projects)
- [MCP TypeScript SDK Types](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/types.ts)
