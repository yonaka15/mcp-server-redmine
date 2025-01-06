// 一覧取得用のパラメータ
export interface UserListParams {
  offset?: number;
  limit?: number;
  // 1: active, 2: registered, 3: locked
  status?: 1 | 2 | 3;
  name?: string;
  group_id?: number;
}

// 詳細取得用のパラメータ
export interface UserShowParams {
  include?: string; // memberships,groups
}

// 基本的なユーザー情報
interface RedmineUserBase {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  updated_on?: string;
  last_login_on?: string;
  passwd_changed_on?: string;
  api_key?: string;
  status?: number;
  avatar_url?: string | null;  // nullも許容するように修正
}

// プロジェクトメンバーシップ情報
interface RedmineMembership {
  project: {
    id: number;
    name: string;
  };
  roles: {
    id: number;
    name: string;
  }[];
}

// グループ情報
interface RedmineGroup {
  id: number;
  name: string;
}

// カスタムフィールド
interface RedmineCustomField {
  id: number;
  name: string;
  value: string | string[];
}

// 完全なユーザー情報（管理者向け）
export interface RedmineUser extends RedmineUserBase {
  custom_fields?: RedmineCustomField[];
  memberships?: RedmineMembership[];
  groups?: RedmineGroup[];
}

// 一般ユーザー向けの制限された情報
export interface RedmineUserLimited {
  id: number;
  firstname: string;
  lastname: string;
  mail?: string;
  created_on: string;
  last_login_on?: string; // 管理者の場合のみ
}

// レスポンス型
export interface RedmineUserResponse {
  user: RedmineUser;
}

export interface RedmineUsersResponse {
  users: RedmineUser[];
  total_count: number;
  offset: number;
  limit: number;
}