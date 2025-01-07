// ベースとなるユーザー情報
export interface RedmineUser {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  last_login_on: string | null;
  passwd_changed_on?: string;
  api_key?: string;
  status: number;
  avatar_url: string;
  updated_on?: string;
  admin?: boolean;
  custom_fields?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  memberships?: Array<{
    id?: number;
    project: {
      id: number;
      name: string;
    };
    roles: Array<{
      id: number;
      name: string;
    }>;
  }>;
  groups?: Array<{
    id: number;
    name: string;
  }>;
}

// ユーザー一覧のレスポンス
export interface RedmineUserList {
  users: RedmineUser[];
  total_count: number;
  offset?: number;
  limit?: number;
}

// ユーザー取得のパラメータ
export interface UserListParams {
  status?: number; // 1=active, 2=registered, 3=locked
  name?: string; // フィルター: ログイン名、名、姓、メール
  group_id?: number; // フィルター: グループID
  offset?: number; // ページネーション: スキップ数
  limit?: number; // ページネーション: 1ページの上限（max: 100）
}

// 単一ユーザー取得のパラメータ
export interface UserShowParams {
  include?: string; // オプション: 'memberships' and/or 'groups'（カンマ区切り）
}

