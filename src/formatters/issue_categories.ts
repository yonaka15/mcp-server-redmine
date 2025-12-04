import { RedmineIssueCategory } from "../lib/types/index.js";

/**
 * Format issue categories list
 */
export function formatIssueCategories(categories: RedmineIssueCategory[]): string {
  if (categories.length === 0) {
    return "<issue_categories>No issue categories found</issue_categories>";
  }

  const lines = categories.map((category) => formatIssueCategorySummary(category));
  return `<issue_categories count="${categories.length}">\n${lines.join("\n")}\n</issue_categories>`;
}

/**
 * Format single issue category (detailed)
 */
export function formatIssueCategory(category: RedmineIssueCategory): string {
  let result = `<issue_category id="${category.id}">\n`;
  result += `  <name>${escapeXml(category.name)}</name>\n`;
  result += `  <project id="${category.project.id}">${escapeXml(category.project.name)}</project>\n`;

  if (category.assigned_to) {
    result += `  <assigned_to id="${category.assigned_to.id}">${escapeXml(category.assigned_to.name)}</assigned_to>\n`;
  }

  result += `</issue_category>`;
  return result;
}

/**
 * Format issue category result (create/update)
 */
export function formatIssueCategoryResult(category: RedmineIssueCategory, action: string): string {
  return `<result>\n  <status>success</status>\n  <action>${action}</action>\n${formatIssueCategory(category)}\n</result>`;
}

/**
 * Format issue category deleted
 */
export function formatIssueCategoryDeleted(id: number): string {
  return `<result>\n  <status>success</status>\n  <action>deleted</action>\n  <issue_category_id>${id}</issue_category_id>\n</result>`;
}

function formatIssueCategorySummary(category: RedmineIssueCategory): string {
  let result = `  <issue_category id="${category.id}">\n`;
  result += `    <name>${escapeXml(category.name)}</name>\n`;
  if (category.assigned_to) {
    result += `    <assigned_to>${escapeXml(category.assigned_to.name)}</assigned_to>\n`;
  }
  result += `  </issue_category>`;
  return result;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
