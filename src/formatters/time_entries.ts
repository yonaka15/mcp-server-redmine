import type { RedmineApiResponse, RedmineTimeEntry } from "../lib/types/index.js";

/**
 * 単一の作業時間記録をフォーマット
 */
export function formatTimeEntry(entry: RedmineTimeEntry): string {
  const sections = [
    // 基本情報
    `[${entry.spent_on}] ${entry.hours}h - ${entry.comments || "(no comment)"}`,
    [
      `Project: ${entry.project.name}`,
      entry.issue ? `Issue: #${entry.issue.id}` : null,
      `User: ${entry.user.name}`,
      `Activity: ${entry.activity.name}`,
      `Created: ${entry.created_on}`,
      `Updated: ${entry.updated_on}`,
    ].filter(Boolean).join(" | ")
  ];

  // カスタムフィールド
  if (entry.custom_fields?.length) {
    sections.push(
      "",
      "Custom fields:",
      ...entry.custom_fields.map((field: { name: string; value: string | string[] }) => 
        `${field.name}: ${Array.isArray(field.value) ? field.value.join(", ") : field.value}`
      )
    );
  }

  return sections.join("\n");
}

/**
 * 作業時間記録の一覧をフォーマット
 */
export function formatTimeEntries(response: RedmineApiResponse<RedmineTimeEntry>): string {
  if (!Array.isArray(response.time_entries) || response.time_entries.length === 0) {
    return "No time entries found.";
  }

  // 合計時間の計算
  const totalHours = response.time_entries.reduce((sum: number, entry: RedmineTimeEntry) => sum + entry.hours, 0);

  const sections = [
    `Found ${response.total_count} time entries (Total: ${totalHours.toFixed(2)}h):`,
    "",
    ...response.time_entries.map(formatTimeEntry)
  ];

  if (response.offset && response.limit && response.total_count) {
    sections.push(
      "",
      `Showing ${response.offset + 1}-${Math.min(response.offset + response.limit, response.total_count)} of ${response.total_count} entries`
    );
  }

  return sections.join("\n");
}

/**
 * 作業時間記録の作成/更新結果をフォーマット
 */
export function formatTimeEntryResult(entry: RedmineTimeEntry, action: "created" | "updated"): string {
  return [
    `Time entry was successfully ${action}.`,
    "",
    formatTimeEntry(entry)
  ].join("\n");
}

/**
 * 作業時間記録の削除結果をフォーマット
 */
export function formatTimeEntryDeleted(id: number): string {
  return `Time entry #${id} was successfully deleted.`;
}