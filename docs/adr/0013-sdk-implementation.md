# SDKの活用による実装の標準化

## ステータス

承認済み - 2025-01-09
実装中 - 2025-01-09

## コンテキスト

MCP (Model Context Protocol) SDKを導入していますが、特に以下の点が課題となっていました：

1. レスポンスバリデーションの問題
   - コンテンツタイプの指定が正しくない（`text/plain` vs `text`）
   - バリデーションエラーが発生する
   - テストケースとの整合性が取れていない

2. MCPプロトコル仕様との不整合
   - コンテンツタイプの指定がSDKの仕様と異なる
   - 型のミスマッチが発生している

3. テストの期待値が仕様と一致していない
   - 古い形式（`text/plain`）を期待する内容になっている
   - テストケースの更新が必要

## 決定

以下の実装により、MCPプロトコルに準拠した形に修正を行うことにしました：

### 1. コンテンツタイプの修正

MCPプロトコルで定められた以下のコンテンツタイプを使用：

```typescript
type ContentType = "text" | "image" | "resource";
```

### 2. レスポンス形式の統一

レスポンス生成を以下の形式に統一：

```typescript
// 正常レスポンス
return {
  content: [
    {
      type: "text",  // "text/plain" から "text" に修正
      text: formatters.formatIssues(issues),
    }
  ],
  isError: false,
};

// エラーレスポンス
return {
  content: [
    {
      type: "text",  // "text/plain" から "text" に修正
      text: error instanceof Error ? error.message : String(error),
    }
  ],
  isError: true,
};
```

### 3. テストケースの更新

テストの期待値をMCPプロトコルに合わせて更新：

```typescript
const assertMcpResponse = (response: ToolResponse) => {
  // 各コンテンツアイテムがMCPプロトコルに準拠していることを確認
  response.content.forEach((item: ToolResponseContent) => {
    expect(item).toEqual({
      type: "text",  // MCPプロトコルに準拠した形式
      text: expect.any(String)
    });
  });
};
```

### 4. 適用範囲

最初のステップとしてissues関連の実装を完了：
- handlers/issues.ts
- handlers/__tests__/issues/get.test.ts

## 結果

### 肯定的な結果

1. プロトコル準拠
   - MCPプロトコルの仕様に完全に準拠
   - バリデーションエラーが解消
   - テストが正常にパス

2. コード品質
   - 一貫した実装パターン
   - 明確なエラーハンドリング
   - より良いテストカバレッジ

3. 保守性
   - 標準化された実装
   - 分かりやすいコード
   - 将来の変更への対応が容易

### 否定的な結果

1. 移行コスト
   - 既存コードの修正が必要
   - テストケースの更新が必要

2. 残作業
   - 他のハンドラー（projects, time_entries, users）の更新が未完了
   - 関連するテストケースの更新も必要

## 次のステップ

1. 残りのハンドラーの更新
   - projects
   - time_entries
   - users

2. テストケースの更新
   - 各ハンドラーのテストを修正
   - カバレッジの確認

3. ドキュメントの更新
   - READMEの更新
   - 関連するコメントの修正

## 参考資料

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Protocol Schema](https://github.com/modelcontextprotocol/specification/blob/main/schema/schema.ts)
