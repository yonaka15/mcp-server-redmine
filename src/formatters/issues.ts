import type { RedmineApiResponse, RedmineIssue } from "../lib/types/index.js";
import type { FormatOptions, BriefFieldOptions } from "./format-options.js";
import { OutputDetailLevel, createDefaultBriefFields } from "./format-options.js";
import { selectFields, skipEmptyCustomFields, type FieldSelectionResult } from "./field-selector.js";
import { truncateDescription, limitJournalEntries } from "./text-truncation.js";

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
 * Format journal entries (comments and history)
 */
function formatJournals(journals: Array<{
  id: number;
  user: { id: number; name: string };
  notes?: string | null;
  private_notes?: boolean;
  created_on: string;
  details?: Array<{ property: string; name: string; old_value?: string | null; new_value?: string | null }>;
}>) {
  return `
  <journals>
    ${journals.map(journal => `
    <journal>
      <id>${journal.id}</id>
      <user>${escapeXml(journal.user.name)}</user>
      <created_on>${journal.created_on}</created_on>
      ${journal.private_notes ? `<private_notes>true</private_notes>` : ''}
      ${journal.notes !== null && journal.notes !== undefined ? `<notes>${escapeXml(journal.notes)}</notes>` : ''}
      ${journal.details && journal.details.length > 0 ? `
      <details>
        ${journal.details.map(detail => `
        <detail>
          <property>${escapeXml(detail.property)}</property>
          <name>${escapeXml(detail.name)}</name>
          ${detail.old_value !== null && detail.old_value !== undefined ? `<old_value>${escapeXml(detail.old_value)}</old_value>` : ''}
          ${detail.new_value !== null && detail.new_value !== undefined ? `<new_value>${escapeXml(detail.new_value)}</new_value>` : ''}
        </detail>`).join('')}
      </details>` : ''}
    </journal>`).join('')}
  </journals>`;
}

/**
 * Format a single issue in brief mode
 */
export function formatIssueBrief(issue: RedmineIssue, options: BriefFieldOptions, maxDescLength: number = 200, maxJournalEntries: number = 3): string {
  // Select only the fields specified in options
  const selectionResult = selectFields(issue, options);
  const selectedIssue = selectionResult.issue;
  
  // Build the brief XML output with only essential and selected fields
  let briefXml = `<issue>
  <id>${selectedIssue.id}</id>
  <subject>${escapeXml(selectedIssue.subject)}</subject>
  <project>${escapeXml(selectedIssue.project?.name)}</project>
  <tracker>${escapeXml(selectedIssue.tracker?.name)}</tracker>
  <status>${escapeXml(selectedIssue.status?.name)}</status>
  <priority>${escapeXml(selectedIssue.priority?.name)}</priority>`;

  // Add warnings if any
  if (selectionResult.warnings && selectionResult.warnings.length > 0) {
    briefXml += `\n  <warnings>`;
    for (const warning of selectionResult.warnings) {
      briefXml += `\n    <warning>${escapeXml(warning)}</warning>`;
    }
    briefXml += `\n  </warnings>`;
  }

  // Add optional fields based on selection
  if (selectedIssue.assigned_to) {
    briefXml += `\n  <assigned_to>${escapeXml(selectedIssue.assigned_to.name)}</assigned_to>`;
  }

  // Handle description with truncation support
  if (selectedIssue.description && options.description) {
    if (options.description === "truncated") {
      const truncatedDesc = truncateDescription(selectedIssue.description, maxDescLength);
      if (truncatedDesc) {
        briefXml += `\n  <description>${escapeXml(truncatedDesc)}</description>`;
      }
    } else if (options.description === true) {
      briefXml += `\n  <description>${escapeXml(selectedIssue.description)}</description>`;
    }
  }

  if (selectedIssue.category && options.category) {
    briefXml += `\n  <category>${escapeXml(selectedIssue.category.name)}</category>`;
  }

  if (selectedIssue.fixed_version && options.version) {
    briefXml += `\n  <version>${escapeXml(selectedIssue.fixed_version.name)}</version>`;
  }

  if (options.dates) {
    if (selectedIssue.start_date) briefXml += `\n  <start_date>${selectedIssue.start_date}</start_date>`;
    if (selectedIssue.due_date) briefXml += `\n  <due_date>${selectedIssue.due_date}</due_date>`;
    briefXml += `\n  <created_on>${selectedIssue.created_on}</created_on>`;
    briefXml += `\n  <updated_on>${selectedIssue.updated_on}</updated_on>`;
  }

  if (options.time_tracking) {
    if (selectedIssue.done_ratio !== undefined) briefXml += `\n  <progress>${selectedIssue.done_ratio}%</progress>`;
    if (selectedIssue.estimated_hours !== undefined) briefXml += `\n  <estimated_hours>${selectedIssue.estimated_hours}</estimated_hours>`;
    if (selectedIssue.spent_hours !== undefined) briefXml += `\n  <spent_hours>${selectedIssue.spent_hours}</spent_hours>`;
  }

  if (selectedIssue.custom_fields && options.custom_fields) {
    if (selectedIssue.custom_fields.length > 0) {
      briefXml += formatCustomFields(selectedIssue.custom_fields);
    }
  }

  if (selectedIssue.journals && options.journals) {
    const limitedJournals = limitJournalEntries(selectedIssue.journals, maxJournalEntries);
    if (limitedJournals.length > 0) {
      briefXml += formatJournals(limitedJournals);
    }
  }

  briefXml += '\n</issue>';
  return briefXml;
}

/**
 * Format a single issue with optional formatting options
 */
export function formatIssue(issue: RedmineIssue, options?: FormatOptions): string {
  // If no options provided or full mode, use original formatting
  if (!options || options.detail_level === OutputDetailLevel.FULL) {
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
  ${issue.journals?.length ? formatJournals(issue.journals) : ''}
  ${issue.created_on ? `<created_on>${issue.created_on}</created_on>` : ''}
  ${issue.updated_on ? `<updated_on>${issue.updated_on}</updated_on>` : ''}
  ${issue.closed_on ? `<closed_on>${issue.closed_on}</closed_on>` : ''}
</issue>`;
  }

  // Brief mode
  const briefFields = options.brief_fields || createDefaultBriefFields();
  const maxDescLength = options.max_description_length || 200;
  const maxJournalEntries = options.max_journal_entries || 3;
  
  return formatIssueBrief(issue, briefFields, maxDescLength, maxJournalEntries);
}

/**
 * Format list of issues with optional formatting options
 */
export function formatIssues(response: RedmineApiResponse<RedmineIssue>, options?: FormatOptions): string {
  // response や response.issues が null/undefined の場合のチェックを追加
  if (!response || !response.issues || !Array.isArray(response.issues) || response.issues.length === 0) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<issues type="array" total_count="0" limit="0" offset="0" />';
  }

  const issues = response.issues.map(issue => formatIssue(issue, options)).join('\n');
  
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
