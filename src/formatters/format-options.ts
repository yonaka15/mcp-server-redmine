/**
 * Format options for controlling output verbosity in Redmine MCP server responses
 */

/**
 * Output detail levels for issue formatting
 */
export enum OutputDetailLevel {
  BRIEF = 'brief',
  FULL = 'full'
}

/**
 * Options for selective field inclusion in brief mode
 */
export interface BriefFieldOptions {
  /** Include assignee information */
  assignee?: boolean;
  /** Include issue description: false = exclude, true = full, "truncated" = truncated */
  description?: boolean | "truncated";
  /** Include custom fields: false = exclude, true = all non-empty, string[] = specific field names */
  custom_fields?: boolean | string[];
  /** Include start/due dates */
  dates?: boolean;
  /** Include category information */
  category?: boolean;
  /** Include target version information */
  version?: boolean;
  /** Include time tracking information (estimated/spent hours) */
  time_tracking?: boolean;
  /** Include journal entries (comments/history) */
  journals?: boolean;
  /** Include issue relations */
  relations?: boolean;
  /** Include attachment information */
  attachments?: boolean;
}

/**
 * Complete formatting options for issue output
 */
export interface FormatOptions {
  /** Detail level for output formatting */
  detail_level: OutputDetailLevel;
  /** Selective field options for brief mode */
  brief_fields?: BriefFieldOptions;
  /** Maximum length for description text in brief mode */
  max_description_length?: number;
  /** Maximum number of journal entries to include in brief mode */
  max_journal_entries?: number;
}

/**
 * Default formatting options
 */
export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  detail_level: OutputDetailLevel.FULL,
  max_description_length: 200,
  max_journal_entries: 3
};

/**
 * Parse formatting options from tool arguments
 */
export function parseFormatOptions(args: Record<string, unknown>): FormatOptions {
  const options: FormatOptions = { ...DEFAULT_FORMAT_OPTIONS };

  // Parse detail level
  if ('detail_level' in args && typeof args.detail_level === 'string') {
    const level = args.detail_level.toLowerCase();
    if (level === 'brief' || level === 'full') {
      options.detail_level = level as OutputDetailLevel;
    }
  }

  // Parse brief fields from JSON string
  if ('brief_fields' in args && typeof args.brief_fields === 'string') {
    try {
      const briefFields = JSON.parse(args.brief_fields) as BriefFieldOptions;
      options.brief_fields = briefFields;
    } catch (error) {
      // Invalid JSON, ignore and use defaults
      console.warn('Invalid brief_fields JSON:', error);
    }
  }

  // Parse numeric options
  if ('max_description_length' in args && typeof args.max_description_length === 'number') {
    options.max_description_length = Math.max(50, Math.min(1000, args.max_description_length));
  }

  if ('max_journal_entries' in args && typeof args.max_journal_entries === 'number') {
    options.max_journal_entries = Math.max(0, Math.min(10, args.max_journal_entries));
  }

  return options;
}

/**
 * Create default brief field options with commonly needed fields
 */
export function createDefaultBriefFields(): BriefFieldOptions {
  return {
    assignee: true,
    dates: true,
    description: "truncated",
    custom_fields: [],
    category: false,
    version: false,
    time_tracking: false,
    journals: false,
    relations: false,
    attachments: false
  };
}
