import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * 作業時間検索ツール
 */
export const TIME_ENTRY_SEARCH_TOOL: Tool = {
  name: "search_time_entries",
  description:
    "作業時間の記録を検索します。\n" +
    "- ユーザーID、プロジェクトID、日付での絞り込み\n" +
    "- 期間指定での検索も可能\n" +
    "- 最大100件まで取得可能",
  inputSchema: {
    type: "object",
    properties: {
      user_id: {
        type: "number",
        description: "ユーザーID (me: 自分の記録)"
      },
      project_id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      },
      spent_on: {
        type: "string",
        description: "特定の日付 (YYYY-MM-DD形式)"
      },
      from: {
        type: "string",
        description: "開始日 (YYYY-MM-DD形式)"
      },
      to: {
        type: "string",
        description: "終了日 (YYYY-MM-DD形式)"
      },
      limit: {
        type: "number",
        description: "取得件数 (1-100)",
        default: 10
      }
    }
  }
};

/**
 * 作業時間詳細取得ツール
 */
export const TIME_ENTRY_GET_TOOL: Tool = {
  name: "get_time_entry",
  description:
    "作業時間の記録の詳細を取得します。\n" +
    "- IDを指定して1件の作業時間記録を取得",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "作業時間記録のID"
      }
    },
    required: ["id"]
  }
};

/**
 * 作業時間記録作成ツール
 */
export const TIME_ENTRY_CREATE_TOOL: Tool = {
  name: "create_time_entry",
  description:
    "新しい作業時間を記録します。\n" +
    "- プロジェクトIDまたはチケットIDのいずれかが必須\n" +
    "- 作業時間（hours）と作業分類（activity_id）は必須\n" +
    "- カスタムフィールドの指定も可能",
  inputSchema: {
    type: "object",
    properties: {
      project_id: {
        type: "number",
        description: "プロジェクトID"
      },
      issue_id: {
        type: "number",
        description: "チケットID"
      },
      spent_on: {
        type: "string",
        description: "作業日 (YYYY-MM-DD形式)"
      },
      hours: {
        type: "number",
        description: "作業時間（時間単位）"
      },
      activity_id: {
        type: "number",
        description: "作業分類ID"
      },
      comments: {
        type: "string",
        description: "コメント"
      },
      user_id: {
        type: "number",
        description: "ユーザーID（管理者のみ指定可能）"
      },
      custom_field_values: {
        type: "object",
        description: "カスタムフィールドの値（キー：カスタムフィールドID）"
      }
    },
    required: ["hours", "activity_id"]
  }
};

/**
 * 作業時間記録更新ツール
 */
export const TIME_ENTRY_UPDATE_TOOL: Tool = {
  name: "update_time_entry",
  description:
    "既存の作業時間記録を更新します。\n" +
    "- IDを指定して1件の作業時間記録を更新\n" +
    "- 更新したい項目のみを指定可能\n" +
    "- プロジェクトの変更は不可",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "作業時間記録のID"
      },
      issue_id: {
        type: "number",
        description: "チケットID"
      },
      spent_on: {
        type: "string",
        description: "作業日 (YYYY-MM-DD形式)"
      },
      hours: {
        type: "number",
        description: "作業時間（時間単位）"
      },
      activity_id: {
        type: "number",
        description: "作業分類ID"
      },
      comments: {
        type: "string",
        description: "コメント"
      },
      custom_field_values: {
        type: "object",
        description: "カスタムフィールドの値（キー：カスタムフィールドID）"
      }
    },
    required: ["id"]
  }
};

/**
 * 作業時間記録削除ツール
 */
export const TIME_ENTRY_DELETE_TOOL: Tool = {
  name: "delete_time_entry",
  description:
    "作業時間の記録を削除します。\n" +
    "- IDを指定して1件の作業時間記録を削除\n" +
    "- この操作は取り消せません",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "作業時間記録のID"
      }
    },
    required: ["id"]
  }
};