import { RedmineEnumeration } from "../lib/types/index.js";

/**
 * Format issue priorities list
 */
export function formatIssuePriorities(priorities: RedmineEnumeration[]): string {
  return formatEnumerations(priorities, "issue_priorities", "priority");
}

/**
 * Format time entry activities list
 */
export function formatTimeEntryActivities(activities: RedmineEnumeration[]): string {
  return formatEnumerations(activities, "time_entry_activities", "activity");
}

/**
 * Format document categories list
 */
export function formatDocumentCategories(categories: RedmineEnumeration[]): string {
  return formatEnumerations(categories, "document_categories", "category");
}

/**
 * Generic enumeration formatter
 */
function formatEnumerations(
  items: RedmineEnumeration[],
  rootTag: string,
  itemTag: string
): string {
  if (items.length === 0) {
    return `<${rootTag}>No items found</${rootTag}>`;
  }

  const lines = items.map((item) => {
    return `  <${itemTag} id="${item.id}" is_default="${item.is_default}">${escapeXml(item.name)}</${itemTag}>`;
  });

  return `<${rootTag} count="${items.length}">\n${lines.join("\n")}\n</${rootTag}>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
