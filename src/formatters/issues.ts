import type { RedmineApiResponse, RedmineIssue } from "../lib/types.js";

/**
 * 単一のチケット情報をフォーマット
 */
export function formatIssue(issue: RedmineIssue): string {
  const sections = [
    `#${issue.id}: ${issue.subject}`,
    [
      `Project: ${issue.project.name}`,
      `Status: ${issue.status.name}`,
      `Priority: ${issue.priority.name}`,
      issue.assigned_to ? `Assigned: ${issue.assigned_to.name}` : null,
      issue.category ? `Category: ${issue.category.name}` : null,
      issue.fixed_version ? `Version: ${issue.fixed_version.name}` : null,
      issue.start_date ? `Start: ${issue.start_date}` : null,
      issue.due_date ? `Due: ${issue.due_date}` : null,
      issue.estimated_hours ? `Estimated: ${issue.estimated_hours}h` : null,
      `Progress: ${issue.done_ratio}%`
    ].filter(Boolean).join(" | "),
  ];

  if (issue.description) {
    sections.push(
      "",
      "Description:",
      issue.description
    );
  }

  if (issue.custom_fields?.length) {
    sections.push(
      "",
      "Custom Fields:",
      ...issue.custom_fields.map(field => 
        `${field.name}: ${Array.isArray(field.value) ? field.value.join(", ") : field.value}`
      )
    );
  }

  return sections.join("\n");
}

/**
 * チケット一覧をフォーマット
 */
export function formatIssues(response: RedmineApiResponse<RedmineIssue>): string {
  if (!Array.isArray(response.issues) || response.issues.length === 0) {
    return "No issues found.";
  }

  const sections = [
    `Found ${response.total_count} issues:`,
    "",
    ...response.issues.map(formatIssue)
  ];

  if (response.offset && response.limit && response.total_count) {
    sections.push(
      "",
      `Showing ${response.offset + 1}-${Math.min(response.offset + response.limit, response.total_count)} of ${response.total_count} issues`
    );
  }

  return sections.join("\n");
}

/**
 * チケット作成/更新結果をフォーマット
 */
export function formatIssueResult(issue: RedmineIssue, action: "created" | "updated"): string {
  return [
    `Issue #${issue.id} was successfully ${action}.`,
    "",
    formatIssue(issue)
  ].join("\n");
}

/**
 * チケット削除結果をフォーマット 
 */
export function formatIssueDeleted(id: number): string {
  return `Issue #${id} was successfully deleted.`;
}