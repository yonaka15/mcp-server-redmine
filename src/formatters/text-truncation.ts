/**
 * Text truncation and processing utilities for brief mode formatting
 */

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before the limit to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    // If we found a space reasonably close to the limit, use it
    return truncated.substring(0, lastSpace) + '...';
  } else {
    // Otherwise, just truncate at the limit
    return truncated + '...';
  }
}

/**
 * Truncate and clean description text for brief mode
 */
export function truncateDescription(description: string | null | undefined, maxLength: number): string {
  if (!description) {
    return '';
  }
  
  // Remove excessive whitespace and normalize line breaks
  const cleaned = description
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // Limit consecutive line breaks
    .trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return truncateText(cleaned, maxLength);
}

/**
 * Limit journal entries to a maximum count and truncate notes
 */
export function limitJournalEntries(
  journals: Array<{
    id: number;
    user: { id: number; name: string };
    notes?: string | null;
    private_notes?: boolean;
    created_on: string;
    details?: Array<{ property: string; name: string; old_value?: string | null; new_value?: string | null }>;
  }> | undefined,
  maxEntries: number,
  maxNoteLength: number = 100
): Array<{
  id: number;
  user: { id: number; name: string };
  notes?: string | null;
  private_notes?: boolean;
  created_on: string;
  details?: Array<{ property: string; name: string; old_value?: string | null; new_value?: string | null }>;
}> {
  if (!journals || journals.length === 0) {
    return [];
  }
  
  // Take the most recent entries
  const limited = journals.slice(-maxEntries);
  
  // Truncate notes in each entry
  return limited.map(journal => ({
    ...journal,
    notes: journal.notes ? truncateText(journal.notes, maxNoteLength) : journal.notes
  }));
}

/**
 * Create a brief summary of custom fields (non-empty only)
 */
export function summarizeCustomFields(
  customFields: Array<{
    id: number;
    name: string;
    value: string | string[] | null;
  }> | undefined,
  maxFields: number = 5
): string {
  if (!customFields || customFields.length === 0) {
    return '';
  }
  
  // Filter out empty fields and limit count
  const nonEmpty = customFields
    .filter(field => {
      if (field.value === null || field.value === undefined) return false;
      if (typeof field.value === 'string') return field.value.trim().length > 0;
      if (Array.isArray(field.value)) return field.value.length > 0;
      return true;
    })
    .slice(0, maxFields);
  
  if (nonEmpty.length === 0) {
    return '';
  }
  
  const summaries = nonEmpty.map(field => {
    let value = '';
    if (typeof field.value === 'string') {
      value = truncateText(field.value, 50);
    } else if (Array.isArray(field.value)) {
      value = field.value.join(', ');
      value = truncateText(value, 50);
    }
    return `${field.name}: ${value}`;
  });
  
  return summaries.join('; ');
}

/**
 * Remove HTML tags from text (basic cleanup)
 */
export function stripHtmlTags(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace non-breaking spaces
    .replace(/&amp;/g, '&')   // Decode common HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
