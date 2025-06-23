import type { RedmineApiResponse, RedmineIssue } from "../lib/types/index.js";

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }
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
function formatCustomFields(fields: Array<{ id: number; name: string; value: string | string[] | null }>) {
  return `
  <custom_fields>
    ${fields.map(field => `
    <field>
      <id>${field.id}</id>
      <name>${escapeXml(field.name)}</name>
      <value>${field.value === null || field.value === undefined ? '' : Array.isArray(field.value) ? escapeXml(field.value.join(", ")) : escapeXml(field.value)}</value>
    </field>`).join('')}
  </custom_fields>`;
}

/**
 * Format a single issue
 */
export function formatIssue(issue: RedmineIssue): string {
  const safeDescription = escapeXml(issue.description);

  return `<issue>
  <id>${issue.id}</id>
  <subject>${escapeXml(issue.subject)}</subject>
  <project>${escapeXml(issue.project?.name)}</project>
  <tracker>${escapeXml(issue.tracker?.name)}</tracker>
  <status>${escapeXml(issue.status?.name)}</status>
  <priority>${escapeXml(issue.priority?.name)}</priority>
  ${issue.author ? `<author>${escapeXml(issue.author?.name)}</author>` : ''}
  ${issue.assigned_to ? `<assigned_to>${escapeXml(issue.assigned_to?.name)}</assigned_to>` : ''}
  ${issue.category ? `<category>${escapeXml(issue.category?.name)}</category>` : ''}
  ${issue.fixed_version ? `<version>${escapeXml(issue.fixed_version?.name)}</version>` : ''}
  ${issue.parent ? `<parent_id>${issue.parent?.id}</parent_id>` : ''}
  ${issue.start_date ? `<start_date>${issue.start_date}</start_date>` : ''}
  ${issue.due_date ? `<due_date>${issue.due_date}</due_date>` : ''}
  ${issue.done_ratio !== undefined ? `<progress>${issue.done_ratio}%</progress>` : ''}
  ${issue.estimated_hours !== undefined ? `<estimated_hours>${issue.estimated_hours}</estimated_hours>` : ''}
  ${issue.spent_hours !== undefined ? `<spent_hours>${issue.spent_hours}</spent_hours>` : ''}
  ${safeDescription ? `<description>${safeDescription}</description>` : ''}
  ${issue.custom_fields?.length ? formatCustomFields(issue.custom_fields) : ''}
  ${issue.created_on ? `<created_on>${issue.created_on}</created_on>` : ''}
  ${issue.updated_on ? `<updated_on>${issue.updated_on}</updated_on>` : ''}
  ${issue.closed_on ? `<closed_on>${issue.closed_on}</closed_on>` : ''}
</issue>`;
}

/**
 * Format list of issues
 */
export function formatIssues(response: RedmineApiResponse<RedmineIssue>): string {
  // response や response.issues が null/undefined の場合のチェックを追加
  if (!response || !response.issues || !Array.isArray(response.issues) || response.issues.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<issues type="array" total_count="0" limit="0" offset="0" />';
  }

  const issues = response.issues.map(formatIssue).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<issues type="array" total_count="${response.total_count || 0}" offset="${response.offset || 0}" limit="${response.limit || 0}">
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
