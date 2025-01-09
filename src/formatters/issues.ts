import type { RedmineApiResponse, RedmineIssue } from "../lib/types/index.js";

/**
 * Format a single issue
 */
export function formatIssue(issue: RedmineIssue): string {
  return `<issue>
  <id>${issue.id}</id>
  <subject>${issue.subject}</subject>
  <project>${issue.project.name}</project>
  <status>${issue.status.name}</status>
  <priority>${issue.priority.name}</priority>
  ${issue.assigned_to ? `<assigned_to>${issue.assigned_to.name}</assigned_to>` : ''}
  ${issue.category ? `<category>${issue.category.name}</category>` : ''}
  ${issue.fixed_version ? `<version>${issue.fixed_version.name}</version>` : ''}
  ${issue.start_date ? `<start_date>${issue.start_date}</start_date>` : ''}
  ${issue.due_date ? `<due_date>${issue.due_date}</due_date>` : ''}
  ${issue.estimated_hours ? `<estimated_hours>${issue.estimated_hours}</estimated_hours>` : ''}
  <progress>${issue.done_ratio}%</progress>
  ${issue.description ? `<description>${issue.description}</description>` : ''}
  ${issue.custom_fields?.length ? `
  <custom_fields>
    ${issue.custom_fields.map(field => `
    <field>
      <name>${field.name}</name>
      <value>${Array.isArray(field.value) ? field.value.join(", ") : field.value}</value>
    </field>`).join('')}
  </custom_fields>` : ''}
</issue>`;
}

/**
 * Format list of issues
 */
export function formatIssues(response: RedmineApiResponse<RedmineIssue>): string {
  if (!Array.isArray(response.issues) || response.issues.length === 0) {
    return "<issues />";
  }

  const issues = response.issues.map(formatIssue).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<issues total_count="${response.total_count}" offset="${response.offset}" limit="${response.limit}">
${issues}
</issues>`;
}

/**
 * Format issue create/update result
 */
export function formatIssueResult(issue: RedmineIssue, action: "created" | "updated"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <message>Issue #${issue.id} was successfully ${action}.</message>
  ${formatIssue(issue)}
</response>`;
}

/**
 * Format issue deletion result
 */
export function formatIssueDeleted(id: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <message>Issue #${id} was successfully deleted.</message>
</response>`;
}