import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * チケット検索ツール
 */
export const ISSUE_SEARCH_TOOL: Tool = {
  name: "search_issues",
  description: 
    "Redmineのチケットを検索します。\n" +
    "- チケットID、プロジェクトID、ステータス、担当者などで絞り込み可能\n" +
    "- キーワードによる全文検索も可能\n" +
    "- 最大100件まで取得可能",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "検索キーワード"
      },
      project_id: {
        type: "string",
        description: "プロジェクトID"
      },
      status: {
        type: "string",
        description: "ステータス (open/closed/*)",
      },
      assigned_to: {
        type: "string", 
        description: "担当者ID"
      },
      limit: {
        type: "number",
        description: "取得件数 (1-100)",
        default: 10
      }
    },
    required: ["query"]
  }
};

/**
 * チケット作成ツール
 */
export const ISSUE_CREATE_TOOL: Tool = {
  name: "create_issue",
  description:
    "新しいチケットを作成します。\n" +
    "- プロジェクトIDと件名は必須\n" +
    "- トラッカー、ステータス、優先度などを指定可能\n" +
    "- カスタムフィールドの値も設定可能",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "プロジェクトID"
      },
      subject: {
        type: "string",
        description: "チケットの件名"
      },
      description: {
        type: "string",
        description: "チケットの説明"
      },
      tracker_id: {
        type: "number",
        description: "トラッカーのID"
      },
      status_id: {
        type: "number",
        description: "ステータスのID"
      },
      priority_id: {
        type: "number",
        description: "優先度のID"
      },
      assigned_to_id: {
        type: "number",
        description: "担当者のID"
      },
      category_id: {
        type: "number",
        description: "カテゴリのID"
      },
      fixed_version_id: {
        type: "number",
        description: "対象バージョンのID"
      },
      parent_issue_id: {
        type: "number",
        description: "親チケットのID"
      },
      start_date: {
        type: "string",
        description: "開始日 (YYYY-MM-DD形式)"
      },
      due_date: {
        type: "string",
        description: "期日 (YYYY-MM-DD形式)"
      },
      estimated_hours: {
        type: "number",
        description: "予定工数"
      },
      done_ratio: {
        type: "number",
        description: "進捗率 (0-100)"
      }
    },
    required: ["project_id", "subject"]
  }
};

/**
 * チケット更新ツール
 */
export const ISSUE_UPDATE_TOOL: Tool = {
  name: "update_issue",
  description:
    "既存のチケットを更新します。\n" +
    "- チケットIDは必須\n" +
    "- 更新したい項目のみを指定可能\n" +
    "- コメントを追加することも可能",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "更新するチケットのID"
      },
      subject: {
        type: "string",
        description: "チケットの件名"
      },
      description: {
        type: "string",
        description: "チケットの説明"
      },
      status_id: {
        type: "number",
        description: "ステータスのID"
      },
      priority_id: {
        type: "number",
        description: "優先度のID"
      },
      assigned_to_id: {
        type: "number",
        description: "担当者のID"
      },
      category_id: {
        type: "number",
        description: "カテゴリのID"
      },
      fixed_version_id: {
        type: "number",
        description: "対象バージョンのID"
      },
      notes: {
        type: "string",
        description: "更新時のコメント"
      },
      private_notes: {
        type: "boolean",
        description: "コメントを非公開にするか"
      }
    },
    required: ["id"]
  }
};

/**
 * チケット削除ツール
 */
export const ISSUE_DELETE_TOOL: Tool = {
  name: "delete_issue",
  description:
    "チケットを削除します。\n" +
    "- チケットIDを指定\n" +
    "- この操作は取り消せません",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "削除するチケットのID"
      }
    },
    required: ["id"]
  }
};