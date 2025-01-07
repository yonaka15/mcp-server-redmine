import type { RedmineUser, RedmineUserList } from "../lib/types/users/index.js";

// ユーザーステータスの文字列化
function formatStatus(status: number): string {
  switch (status) {
    case 1:
      return 'Active';
    case 2:
      return 'Registered';
    case 3:
      return 'Locked';
    default:
      return 'Unknown';
  }
}

// 単一ユーザーの文字列フォーマット
export function formatUser(user: RedmineUser): string {
  let text = `User #${user.id}: ${user.login}\n`;
  text += `- Name: ${user.firstname} ${user.lastname}\n`;
  text += `- Email: ${user.mail}\n`;

  // ステータスは管理者のみ表示
  if ('status' in user) {
    text += `- Status: ${formatStatus(user.status)}\n`;
  }
  
  if (user.admin) {
    text += `- Role: Administrator\n`;
  }

  text += `- Created: ${user.created_on}\n`;
  if (user.last_login_on) {
    text += `- Last login: ${user.last_login_on}\n`;
  }
  if (user.passwd_changed_on) {
    text += `- Password changed: ${user.passwd_changed_on}\n`;
  }

  // APIキーは管理者と自身のみ表示
  if (user.api_key) {
    text += `- API key: ${user.api_key}\n`;
  }

  // カスタムフィールド
  if (user.custom_fields && user.custom_fields.length > 0) {
    text += "\nCustom Fields:\n";
    for (const field of user.custom_fields) {
      text += `- ${field.name}: ${field.value}\n`;
    }
  }

  // メンバーシップ情報
  if (user.memberships && user.memberships.length > 0) {
    text += "\nProject Memberships:\n";
    for (const membership of user.memberships) {
      text += `- ${membership.project.name}`;
      if (membership.roles && membership.roles.length > 0) {
        text += ` (${membership.roles.map(r => r.name).join(", ")})`;
      }
      text += "\n";
    }
  }

  // グループ情報
  if (user.groups && user.groups.length > 0) {
    text += "\nGroups:\n";
    text += user.groups.map(g => `- ${g.name}`).join("\n");
    text += "\n";
  }

  return text;
}

// ユーザー一覧の文字列フォーマット
export function formatUsers(response: RedmineUserList): string {
  if (response.users.length === 0) {
    return "No users found.";
  }

  let text = `Found ${response.total_count} users:\n\n`;
  
  for (const user of response.users) {
    text += `#${user.id} ${user.login} (${user.firstname} ${user.lastname})\n`;
    if ('status' in user) {
      text += `- Status: ${formatStatus(user.status)}\n`;
    }
    if (user.admin) {
      text += `- Role: Administrator\n`;
    }
    if (user.mail) {
      text += `- Email: ${user.mail}\n`;
    }
    if (user.last_login_on) {
      text += `- Last login: ${user.last_login_on}\n`;
    }
    text += "\n";
  }

  // ページネーション情報
  if (response.total_count > response.users.length) {
    const offset = response.offset || 0;
    const limit = response.limit || response.users.length;
    text += `\nShowing items ${offset + 1}-${Math.min(offset + limit, response.total_count)} of ${response.total_count}`;
  }

  return text;
}