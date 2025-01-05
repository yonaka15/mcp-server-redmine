import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * プロジェクト検索ツール
 */
export const PROJECT_SEARCH_TOOL: Tool = {
  name: "search_projects",
  description:
    "Redmineのプロジェクトを検索します。\n" +
    "- 名前やIDでの検索\n" +
    "- ステータスでの絞り込み\n" +
    "- 最大100件まで取得可能",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "検索キーワード"
      },
      status: {
        type: "number",
        description: "ステータス (1: active, 5: archived, 9: closed)",
        enum: [1, 5, 9]
      },
      include: {
        type: "string",
        description: "含める情報 (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: ""
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
 * プロジェクト詳細取得ツール
 */
export const PROJECT_GET_TOOL: Tool = {
  name: "get_project",
  description:
    "プロジェクトの詳細情報を取得します。\n" +
    "- プロジェクトID（数値）または識別子（文字列）で指定\n" +
    "- トラッカー、カテゴリなどの関連情報も取得可能",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      },
      include: {
        type: "string",
        description: "含める情報 (trackers,issue_categories,enabled_modules,time_entry_activities)",
        default: ""
      }
    },
    required: ["id"]
  }
};

/**
 * プロジェクト作成ツール
 */
export const PROJECT_CREATE_TOOL: Tool = {
  name: "create_project",
  description:
    "新しいプロジェクトを作成します。\n" +
    "- 名前と識別子は必須\n" +
    "- 親プロジェクトの指定も可能\n" +
    "- モジュールやトラッカーの設定も可能",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "プロジェクト名"
      },
      identifier: {
        type: "string",
        description: "プロジェクト識別子（英数字とハイフンのみ）"
      },
      description: {
        type: "string",
        description: "プロジェクトの説明"
      },
      homepage: {
        type: "string",
        description: "プロジェクトのホームページURL"
      },
      is_public: {
        type: "boolean",
        description: "公開プロジェクトにするか",
        default: true
      },
      parent_id: {
        type: "number",
        description: "親プロジェクトのID"
      },
      inherit_members: {
        type: "boolean",
        description: "親プロジェクトのメンバーを継承するか",
        default: false
      },
      tracker_ids: {
        type: "array",
        items: { type: "number" },
        description: "使用するトラッカーのID一覧"
      },
      enabled_module_names: {
        type: "array",
        items: { type: "string" },
        description: "有効にするモジュール名一覧"
      }
    },
    required: ["name", "identifier"]
  }
};

/**
 * プロジェクト更新ツール
 */
export const PROJECT_UPDATE_TOOL: Tool = {
  name: "update_project",
  description:
    "既存のプロジェクトを更新します。\n" +
    "- プロジェクトID（数値）または識別子（文字列）で指定\n" +
    "- 更新したい項目のみを指定可能",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      },
      name: {
        type: "string",
        description: "プロジェクト名"
      },
      description: {
        type: "string",
        description: "プロジェクトの説明"
      },
      homepage: {
        type: "string",
        description: "プロジェクトのホームページURL"
      },
      is_public: {
        type: "boolean",
        description: "公開プロジェクトにするか"
      },
      inherit_members: {
        type: "boolean",
        description: "親プロジェクトのメンバーを継承するか"
      },
      tracker_ids: {
        type: "array",
        items: { type: "number" },
        description: "使用するトラッカーのID一覧"
      },
      enabled_module_names: {
        type: "array",
        items: { type: "string" },
        description: "有効にするモジュール名一覧"
      }
    },
    required: ["id"]
  }
};

/**
 * プロジェクトアーカイブツール
 */
export const PROJECT_ARCHIVE_TOOL: Tool = {
  name: "archive_project",
  description:
    "プロジェクトをアーカイブします。\n" +
    "- プロジェクトID（数値）または識別子（文字列）で指定\n" +
    "- アーカイブされたプロジェクトは編集不可になります",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      }
    },
    required: ["id"]
  }
};

/**
 * プロジェクトアンアーカイブツール
 */
export const PROJECT_UNARCHIVE_TOOL: Tool = {
  name: "unarchive_project",
  description:
    "アーカイブされたプロジェクトを復元します。\n" +
    "- プロジェクトID（数値）または識別子（文字列）で指定\n" +
    "- アンアーカイブ後は通常通り編集可能になります",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      }
    },
    required: ["id"]
  }
};

/**
 * プロジェクト削除ツール
 */
export const PROJECT_DELETE_TOOL: Tool = {
  name: "delete_project",
  description:
    "プロジェクトを削除します。\n" +
    "- プロジェクトID（数値）または識別子（文字列）で指定\n" +
    "- この操作は取り消せません\n" +
    "- サブプロジェクトも同時に削除されます",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "プロジェクトID（数値）または識別子（文字列）"
      }
    },
    required: ["id"]
  }
};