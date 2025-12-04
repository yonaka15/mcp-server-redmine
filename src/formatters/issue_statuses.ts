import { RedmineIssueStatus } from "../lib/types/index.js";

/**
 * Format issue statuses list
 */
export function formatIssueStatuses(statuses: RedmineIssueStatus[]): string {
  if (statuses.length === 0) {
    return "<issue_statuses>No issue statuses found</issue_statuses>";
  }

  const lines = statuses.map((status) => {
    return `  <status id="${status.id}" is_closed="${status.is_closed}">${escapeXml(status.name)}</status>`;
  });

  return `<issue_statuses count="${statuses.length}">\n${lines.join("\n")}\n</issue_statuses>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
