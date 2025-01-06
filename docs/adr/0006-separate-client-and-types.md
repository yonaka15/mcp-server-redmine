# client.tsとtypes.tsの分割

## ステータス

完了 - 2025-01-06

## コンテキスト

ユニットテスト戦略（ADR 0004）の実装を進める中で、以下の課題に直面しています：

1. 現在のコードベースの状況
   - client.ts（約400行）に全APIクライアントロジックが集中
   - types.ts（複数の型定義とスキーマ）が肥大化
   - テストの作成と保守が困難
   - コードの変更影響範囲が大きい

2. 具体的な課題
   - 単体テストを書く際にモックの範囲が広くなる
   - 型定義の更新が他の機能に影響を与えやすい
   - ファイルが大きすぎてレビューが困難
   - 複数人での並行開発が難しい

3. 関連するADR
   - ADR 0003（モジュール分割）の方針を踏襲
   - ADR 0004（ユニットテスト）の実装に対応

4. モジュール解決における制約
   - Node.jsのESM/CJS互換性に対応する必要がある
   - `moduleResolution: "node16"` または `"nodenext"` の場合：
     - ESモジュールのインポートでは拡張子の明示が必須
     - CommonJSモジュールでは拡張子の省略が可能
   - インポートパスには出力ファイルの拡張子を指定する必要がある
     - `.mts` ファイルは `.mjs` として出力
     - `.cts` ファイルは `.cjs` として出力
     - `.ts` ファイルは package.json の `"type"` フィールドに基づいて解決

## 決定

既存の機能を保ったまま、以下のようなファイル分割を行います：

### 1. ディレクトリ構造

```
src/
├── lib/
│   ├── client/           # APIクライアント関連
│   │   ├── base.ts       # 基本クライアント機能 + エラー
│   │   ├── issues.ts     # Issuesリソース用クライアント
│   │   ├── projects.ts   # Projectsリソース用クライアント
│   │   ├── time_entries.ts # TimeEntriesリソース用クライアント
│   │   └── index.ts      # クライアントのエクスポート
│   ├── types/            # 型定義関連
│   │   ├── common.ts     # 共通の型定義・定数
│   │   ├── issues/       # Issues関連の型定義
│   │   │   ├── schema.ts # Zodスキーマ
│   │   │   └── types.ts  # TypeScript型定義
│   │   ├── projects/     # Projects関連の型定義
│   │   └── time_entries/ # TimeEntries関連の型定義
│   └── config.ts         # 設定（既存）
```

### 2. 分割方針

#### クライアント分割の方針
- 既存の`RedmineClient`クラスの機能をリソースごとに分割
- `base.ts`に共通機能（performRequest, encodeQueryParams）とエラー定義を配置
- 各リソースのAPIメソッドを対応するファイルに移動
- インターフェースや機能は変更せず、ファイル分割のみ実施

#### 型定義分割の方針
- リソースごとに型定義とスキーマを分離
- 共通の型定義や定数は`common.ts`に集約
- 既存のバリデーション関数は関連するスキーマと同じファイルに配置
- 型定義の内容は変更せず、ファイル分割のみ実施

#### モジュール参照の方針
- 全ての相対インポートで `.js` 拡張子を使用（出力ファイルの拡張子に合わせる）
- 型定義のインポートは `/index.js` を使用
- パッケージインポートは拡張子なしを維持

### 3. テストディレクトリ構造

```
src/
└── lib/
    └── __tests__/
        ├── client/           # クライアントのテスト
        │   ├── base.test.ts  # 基本機能のテスト
        │   ├── issues.test.ts
        │   ├── projects.test.ts
        │   └── time_entries.test.ts
        └── types/            # 型定義のテスト
            ├── common.test.ts
            ├── issues/
            ├── projects/
            └── time_entries/
```

## 結果

### 肯定的な結果

1. テスタビリティの向上
   - テストファイルとテスト対象の1対1対応
   - モックの範囲が限定的に
   - テストケースの管理が容易に

2. 保守性の向上
   - ファイルサイズが適正化
   - 変更の影響範囲が明確に
   - コードレビューが容易に

3. 開発効率の向上
   - 並行開発が可能に
   - コンフリクトのリスクが低減
   - 関連コードの特定が容易に

4. モジュール解決の信頼性向上
   - Node.jsのモジュール解決ルールに準拠
   - 実行時の解決エラーを防止
   - 開発時の型チェックを厳格化

### 否定的な結果

1. プロジェクト構造の複雑化
   - ファイル数の増加
   - ディレクトリ階層の深化
   - インポートパスの管理が必要

2. 初期コスト
   - 既存コードの移行作業
   - テストコードの更新
   - ドキュメントの更新

3. 拡張子管理のオーバーヘッド
   - インポート文での `.js` 拡張子の明示が必要
   - リファクタリング時の追加作業

### 追加の影響

リファクタリング作業中に以下の影響がありました：

1. テストコードの損失
   - リファクタリング中にテストコードが失われる事態が発生
   - 0004のテスト戦略に基づいて再実装が必要
   - モジュール分割により、より細かい単位でのテスト再実装が可能に

2. テストの再実装の必要性
   - クライアントの分割に合わせたテストの再設計
   - 新しいディレクトリ構造に合わせたテストファイルの配置
   - 共通部分のテストヘルパーの作成

## 参考資料

- [ADR 0003: モジュールの分割](./0003-separate-modules.md)
- [ADR 0004: ユニットテスト戦略](./0004-unit-testing-strategy.md)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [TypeScript: moduleResolution](https://www.typescriptlang.org/tsconfig#moduleResolution)
- [TypeScript: Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution)
- [Node.js Documentation: ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js Documentation: Modules: CommonJS modules](https://nodejs.org/api/modules.html)