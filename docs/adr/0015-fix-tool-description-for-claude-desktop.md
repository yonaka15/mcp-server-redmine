# MCPツール説明のClaude Desktop Appクラッシュの回避（更新）

## ステータス

更新 - 2025-01-09 - ユニオン型によるクラッシュ条件を追加

## コンテキスト

Claude Desktop Appでツール説明を表示する際に、特定の条件でアプリがクラッシュする問題が発生しています。

### クラッシュの原因

1. 文字の制限
   - 括弧「(」「)」の存在
   - アンダースコア「_」の存在

2. 長さの制限
   - descriptionは4行以内に制限

3. スキーマの制限
   - `type: ["number", "string"]`のようなユニオン型の使用

### 影響を受けるツール

1. 括弧を含むもの
   - `list_users`: "(requires admin privileges)"
   - `show_user`: "'current' as ID"
   - パラメータ説明に括弧を含むツール

2. アンダースコアを含む用語
   - `time_entries`
   - `custom_fields`
   - `time_entry_activities`
   - その他の技術用語

3. ユニオン型を使用しているもの
   - `show_user`のid属性: `type: ["number", "string"]`
   - その他複数の型を受け付けるパラメータ

## 決定

以下のルールでツール説明文とスキーマを記述することを決定しました：

### 1. 長さの制限

説明文は4行以内に収める：
```typescript
description:
  "List all Redmine users. " +
  "Shows details for active and locked accounts. " +
  "Requires admin privileges. " +
  "Available since Redmine 1.1"
```

### 2. パラメータ型の説明

括弧を使わない簡潔な記述：
```typescript
// 変更前
"Project ID (numeric) or identifier (string)"

// 変更後
"Project ID as number or project key as text"
```

### 3. 技術用語の置換

アンダースコアを含む用語は自然な英語表現に置換：
```typescript
// 変更前
"Additional data like time_entries, custom_fields"

// 変更後
"Additional data like time tracking records, custom fields"
```

### 4. スキーマ定義の修正

ユニオン型を避け、文字列として受け取る：
```typescript
// 変更前
properties: {
  id: {
    type: ["number", "string"],
    description: "User ID as number or 'current' for own details"
  }
}

// 変更後
properties: {
  id: {
    type: "string",
    description: "User ID as number or 'current' for own details"
  }
}
```

ハンドラー側で型変換を実装：
```typescript
// ハンドラーでの型変換例
const id = params.id;
if (id === 'current') {
  // current用の処理
} else {
  const numId = parseInt(id, 10);
  if (!isNaN(numId)) {
    // 数値IDの処理
  }
}
```

### 制限事項

1. 説明文の制約
   - descriptionプロパティのみを対象とする
   - プロパティ名やパターンマッチングは変更しない
   - 説明文は必ず4行以内に収める
   - 括弧やアンダースコアは使用しない
   - Redmine APIの仕様を反映したパラメータ説明は維持（例：`type: "string"`でも説明文に"as number or text"を含む）

2. スキーマの制約
   - ユニオン型は使用しない
   - 複数の型を受け付ける場合は文字列として受け取る
   - 型変換とバリデーションはハンドラー層で実装

3. パラメータの整合性維持
   - Redmine APIの仕様を正確に反映したdescriptionを維持
   - スキーマとハンドラーで適切な型変換を実装
   - API仕様とのギャップをハンドラーで吸収

## 実装詳細

### 1. 型変換ヘルパー関数の修正 (types.ts)

1. 既存の`asStringOrNumber`を削除
2. 新しい`asNumberOrSpecial`関数を追加：
```typescript
export function asNumberOrSpecial(value: unknown, allowSpecial: string[] = []): string {
  if (typeof value === "string") {
    if (allowSpecial.includes(value)) {
      return value;
    }
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`Invalid value: ${value} (must be a number or one of: ${allowSpecial.join(", ")})`);
  }
  return String(num);
}
```

### 2. ハンドラーの修正

1. プロジェクト関連（projects.ts）：
   - 文字列として扱うように変更
   - `project_id`の型変換処理を`asNumberOrSpecial`に変更
   - IDパラメータ処理を統一

2. ユーザー関連（users.ts）：
   - `show_user`のID処理を修正
   - "current"を特別値として許可
   ```typescript
   const rawId = asNumberOrSpecial(args.id, ["current"]);
   const id = rawId === "current" ? "current" : parseInt(rawId, 10);
   ```

3. 時間記録関連（time_entries.ts）：
   - `project_id`を一旦文字列として受け付け
   - バリデーション前に数値に変換
   ```typescript
   let updatedArgs = { ...args };
   if ('project_id' in args) {
     const projectIdStr = asNumberOrSpecial(args.project_id);
     updatedArgs = { ...updatedArgs, project_id: parseInt(projectIdStr, 10) };
   }
   ```

## 結果

### 肯定的な結果

1. 安定性の向上
   - Claude Desktop Appのクラッシュを防止
   - 予期せぬ動作を回避
   - 一貫した実装パターンを確立

2. 型の安全性向上
   - 厳密な型チェックの実施
   - バリデーションとの組み合わせ
   - エラーメッセージの改善

3. メンテナンス性の向上
   - 一貫した型変換処理
   - 明確なバリデーションフロー
   - 再利用可能なヘルパー関数

4. 可読性の向上
   - 簡潔な説明文への統一
   - 自然な英語表現の採用
   - 視覚的に整理された情報

### 否定的な結果

1. 移行コスト
   - ツール定義の修正
   - 型変換処理の追加
   - テストケースの更新
   - レビュー工数の増加

2. 表現の制限
   - 括弧やアンダースコアが使用できない
   - 4行制限による詳細な説明の制約
   - 代替表現の工夫が必要

3. 実装の複雑化
   - 型変換処理の追加
   - バリデーションの2段階化
   - エラーハンドリングの増加

4. 一時的な対応
   - アプリの制限が解消された場合の再変更
   - メンテナンスの継続が必要

## 参考資料

- [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ADR 0011: Redmine API仕様に基づくMCPツールの再定義](./0011-redefine-tools-based-on-redmine-api.md)
- [ADR 0013: SDKの活用による実装の標準化](./0013-sdk-implementation.md)
- [ADR 0014: MCPツールレスポンスのバリデーション実装](./0014-mcp-response-validation.md)