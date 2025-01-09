import type { RedmineApiResponse, RedmineIssue } from "../lib/types/index.js";

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/[&]/g, '&amp;')
    .replace(/[<]/g, '&lt;')
    .replace(/[>]/g, '&gt;')
    .replace(/["]/g, '&quot;')
    .replace(/[']/g, '&apos;');
}

/**
 * Format custom fields
 */
function formatCustomFields(fields: Array<{ id: number; name: string; value: string | string[] }>) {
  return `
  <custom_fields>
    ${fields.map(field => `
    <field>
      <id>${field.id}</id>
      <name>${escapeXml(field.name)}</name>
      <value>${Array.isArray(field.value) ? escapeXml(field.value.join(", ")) : escapeXml(field.value)}</value>
    </field>`).join('')}
  </custom_fields>`;
}

/**
 * Format a single issue
 */
export function formatIssue(issue: RedmineIssue): string {
  const safeDescription = issue.description ? escapeXml(issue.description) : '';

  return `<issue>
  <id>${issue.id}</id>
  <subject>${escapeXml(issue.subject)}</subject>
  <project>${escapeXml(issue.project.name)}</project>
  <status>${escapeXml(issue.status.name)}</status>
  <priority>${escapeXml(issue.priority.name)}</priority>
  ${issue.assigned_to ? `<assigned_to>${escapeXml(issue.assigned_to.name)}</assigned_to>` : ''}
  ${issue.category ? `<category>${escapeXml(issue.category.name)}</category>` : ''}
  ${issue.fixed_version ? `<version>${escapeXml(issue.fixed_version.name)}</version>` : ''}
  ${issue.start_date ? `<start_date>${issue.start_date}</start_date>` : ''}
  ${issue.due_date ? `<due_date>${issue.due_date}</due_date>` : ''}
  ${issue.estimated_hours ? `<estimated_hours>${issue.estimated_hours}</estimated_hours>` : ''}
  <progress>${issue.done_ratio}%</progress>
  ${issue.description ? `<description>${safeDescription}</description>` : ''}
  ${issue.custom_fields?.length ? formatCustomFields(issue.custom_fields) : ''}
</issue>`;
}

/**
 * Format list of issues
 */
export function formatIssues(response: RedmineApiResponse<RedmineIssue>): string {
  if (!Array.isArray(response.issues) || response.issues.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<issues type="array" total_count="0" limit="0" offset="0" />';
  }

  const issues = response.issues.map(formatIssue).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<issues type="array" total_count="${response.total_count}" offset="${response.offset}" limit="${response.limit}">
${issues}
</issues>`;
}

/**
 * Format issue create/update result
 */
export function formatIssueResult(issue: RedmineIssue, action: "created" | "updated"): string {
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <message>Issue #${issue.id} was successfully ${action}.</message>
  ${formatIssue(issue)}
</response>`;
  return response;
}

/**
 * Format issue deletion result
 */
export function formatIssueDeleted(id: number): string {
  const response = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>success</status>
  <message>Issue #${id} was successfully deleted.</message>
</response>`;
  return response;
}