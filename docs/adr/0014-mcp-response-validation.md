# MCPツールレスポンスのバリデーション実装

## ステータス

完了 - 2025-01-09

## コンテキスト

issues、usersツールの実行時にクラッシュする問題が発生しており、以下の課題が見つかりました：

1. MCPプロトコルとの不整合
   - コンテンツタイプとスキーマの検証が不十分
   - エラーレスポンスの形式が統一されていない

2. XMLフォーマットの問題
   - タグの閉じ方が不適切
   - メタデータの不整合

3. エラーハンドリングの課題
   - 権限関連エラーの標準化が必要
   - リソース固有のエラーへの対応が不十分

## 決定

### 1. MCPレスポンス形式の統一

```typescript
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

interface ToolResponse extends CallToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;          // type: "text"の場合
    data?: string;          // type: "image"の場合
    mimeType?: string;      // type: "image"の場合
    resource?: Resource;    // type: "resource"の場合
  }>;
  isError: boolean;
}
```

### 2. XMLフォーマットの標準化

```typescript
/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/[&]/g, '&amp;')
    .replace(/[<]/g, '&lt;')
    .replace(/[>]/g, '&gt;')
    .replace(/["]/g, '&quot;')
    .replace(/[']/g, '&apos;');
}

/**
 * Format custom fields
 */
function formatCustomFields(fields: Array<{ id: number; name: string; value: string | string[] }>) {
  return `
  <custom_fields>
    ${fields.map(field => `
    <field>
      <id>${field.id}</id>
      <name>${escapeXml(field.name)}</name>
      <value>${Array.isArray(field.value) ? escapeXml(field.value.join(", ")) : escapeXml(field.value)}</value>
    </field>`).join('')}
  </custom_fields>`;
}
```

### 3. バリデーション関数の実装

```typescript
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Validates MCP response format
 */
export function assertMcpToolResponse(response: unknown): void {
  // 構造の検証
  expect(response).toHaveProperty('content');
  expect(response).toHaveProperty('isError');
  
  const typedResponse = response as CallToolResult;
  
  // コンテンツ配列の検証
  expect(Array.isArray(typedResponse.content)).toBe(true);
  expect(typedResponse.content.length).toBeGreaterThan(0);
  
  // 各コンテンツアイテムの検証
  typedResponse.content.forEach(item => {
    expect(item).toHaveProperty('type');
    expect(['text', 'image', 'resource']).toContain(item.type);
    
    switch (item.type) {
      case 'text':
        expect(item).toHaveProperty('text');
        expect(typeof item.text).toBe('string');
        break;
      case 'image':
        expect(item).toHaveProperty('data');
        expect(item).toHaveProperty('mimeType');
        break;
      case 'resource':
        expect(item).toHaveProperty('resource');
        break;
    }
  });
}
```

### 4. テストケースの標準化

```typescript
describe('MCP Response Format', () => {
  it('returns valid MCP response for successful fetch', async () => {
    // Arrange
    mockFetch.mockImplementationOnce(() => 
      mockResponse(fixtures.listResponse)
    );

    // Act
    const response = await handlers.list_items({});

    // Assert
    assertMcpToolResponse(response);
    expect(response.isError).toBe(false);
    expect(response.content[0]).toEqual({
      type: "text",
      text: expect.stringContaining("<?xml")
    });
  });

  it('validates XML structure in response', async () => {
    // Arrange
    mockFetch.mockImplementationOnce(() => 
      mockResponse(fixtures.listResponse)
    );

    // Act
    const response = await handlers.list_items({});
    const xml = response.content[0].text;

    // Assert
    expect(xml).toMatch(/^<\?xml/);
    expect(xml).toMatch(/version="1.0"/);
    expect(xml).toMatch(/encoding="UTF-8"/);
  });
});
```

### 5. エラーハンドリングの標準化

```typescript
describe('Error Handling', () => {
  it('handles network errors correctly', async () => {
    mockFetch.mockImplementationOnce(() => 
      mockNetworkError("Network error")
    );

    const response = await handlers.list_items({});

    assertMcpToolResponse(response);
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toMatch(/network error/i);
  });

  it('handles API errors correctly', async () => {
    mockFetch.mockImplementationOnce(() => 
      mockErrorResponse(500, ["Internal server error"])
    );

    const response = await handlers.list_items({});

    assertMcpToolResponse(response);
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toMatch(/internal server error/i);
  });
});
```

## 結果

### 肯定的な結果

1. 応答品質の向上
   - MCPプロトコルとの完全な整合性確保
   - XMLの適切なエスケープ処理
   - バリデーションによるエラー検出の改善

2. テストの標準化
   - 包括的なテストケースの実装
   - 一貫したテストパターンの確立
   - エラーケースの網羅的なカバー

3. メンテナンス性の向上
   - コードの再利用性向上
   - エラー処理の統一
   - フォーマット処理の標準化

### 否定的な結果

1. 処理オーバーヘッド
   - バリデーション処理の追加
   - XMLエスケープ処理の追加
   - テストカバレッジの増加

2. 実装の複雑化
   - エラー処理パターンの増加
   - テストケースの増加
   - バリデーション処理の複雑化

## 完了条件

- [x] MCPレスポンス形式の修正
- [x] XMLフォーマットの修正
- [x] バリデーション関数の実装
- [x] テストケースの実装
- [x] すべてのテストがパス

## 参考資料

- [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [ADR 0011: Redmine API仕様に基づくMCPツールの再定義](./0011-redefine-tools-based-on-redmine-api.md)
- [ADR 0013: SDKの活用による実装の標準化](./0013-sdk-implementation.md)