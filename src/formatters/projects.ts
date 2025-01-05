import type { RedmineApiResponse, RedmineProject } from "../lib/types.js";

/**
 * プロジェクトのステータスを文字列に変換
 */
function formatStatus(status: number): string {
  switch (status) {
    case 1:
      return "Active";
    case 5:
      return "Archived";
    case 9:
      return "Closed";
    default:
      return "Unknown";
  }
}

/**
 * 単一のプロジェクト情報をフォーマット
 */
export function formatProject(project: RedmineProject): string {
  const sections = [
    // 基本情報
    `${project.name} (${project.identifier})`,
    [
      `Status: ${formatStatus(project.status)}`,
      `Public: ${project.is_public ? "Yes" : "No"}`,
      project.parent ? `Parent: ${project.parent.name}` : null,
      `Created: ${project.created_on}`,
      project.homepage ? `Homepage: ${project.homepage}` : null,
    ].filter(Boolean).join(" | "),
  ];

  // 説明
  if (project.description) {
    sections.push(
      "",
      "Description:",
      project.description
    );
  }

  // 有効なモジュール
  if (project.enabled_modules?.length) {
    sections.push(
      "",
      "Enabled modules:",
      project.enabled_modules.join(", ")
    );
  }

  // トラッカー一覧
  if (project.trackers?.length) {
    sections.push(
      "",
      "Trackers:",
      project.trackers.map(t => t.name).join(", ")
    );
  }

  // カテゴリ一覧
  if (project.issue_categories?.length) {
    sections.push(
      "",
      "Categories:",
      project.issue_categories.map(c => c.name).join(", ")
    );
  }

  // 作業分類
  if (project.time_entry_activities?.length) {
    sections.push(
      "",
      "Time entry activities:",
      project.time_entry_activities
        .map(a => `${a.name}${a.is_default ? " (Default)" : ""}${!a.active ? " (Inactive)" : ""}`)
        .join(", ")
    );
  }

  // カスタムフィールド
  if (project.custom_fields?.length) {
    sections.push(
      "",
      "Custom fields:",
      ...project.custom_fields.map(field => 
        `${field.name}: ${Array.isArray(field.value) ? field.value.join(", ") : field.value}`
      )
    );
  }

  return sections.join("\n");
}

/**
 * プロジェクト一覧をフォーマット
 */
export function formatProjects(response: RedmineApiResponse<RedmineProject>): string {
  if (!Array.isArray(response.projects) || response.projects.length === 0) {
    return "No projects found.";
  }

  const sections = [
    `Found ${response.total_count} projects:`,
    "",
    ...response.projects.map(formatProject)
  ];

  if (response.offset && response.limit && response.total_count) {
    sections.push(
      "",
      `Showing ${response.offset + 1}-${Math.min(response.offset + response.limit, response.total_count)} of ${response.total_count} projects`
    );
  }

  return sections.join("\n");
}

/**
 * プロジェクト作成/更新結果をフォーマット
 */
export function formatProjectResult(project: RedmineProject, action: "created" | "updated"): string {
  return [
    `Project "${project.name}" was successfully ${action}.`,
    "",
    formatProject(project)
  ].join("\n");
}

/**
 * プロジェクト削除結果をフォーマット
 */
export function formatProjectDeleted(id: string | number): string {
  return `Project "${id}" was successfully deleted.`;
}

/**
 * プロジェクトのアーカイブ/アンアーカイブ結果をフォーマット
 */
export function formatProjectArchiveStatus(id: string | number, archived: boolean): string {
  return `Project "${id}" was successfully ${archived ? "archived" : "unarchived"}.`;
}