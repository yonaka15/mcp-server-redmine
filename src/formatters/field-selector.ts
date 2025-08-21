/**
 * Utilities for selective field inclusion in brief mode formatting
 */

import type { RedmineIssue } from "../lib/types/index.js";
import type { BriefFieldOptions } from "./format-options.js";

/**
 * Result of field selection with optional warnings
 */
export interface FieldSelectionResult {
  /** Selected issue fields */
  issue: Partial<RedmineIssue>;
  /** Warnings about missing or invalid fields */
  warnings?: string[];
}

/**
 * Select fields from an issue based on brief field options
 */
export function selectFields(issue: RedmineIssue, options: BriefFieldOptions): FieldSelectionResult {
  const warnings: string[] = [];
  
  // Always include essential fields
  const selected: Partial<RedmineIssue> = {
    id: issue.id,
    subject: issue.subject,
    project: issue.project,
    tracker: issue.tracker,
    status: issue.status,
    priority: issue.priority,
    author: issue.author
  };

  // Conditionally include optional fields based on options
  if (options.assignee && issue.assigned_to) {
    selected.assigned_to = issue.assigned_to;
  }

  if (options.description && issue.description) {
    selected.description = issue.description;
  }

  if (options.dates) {
    if (issue.start_date) selected.start_date = issue.start_date;
    if (issue.due_date) selected.due_date = issue.due_date;
    selected.created_on = issue.created_on;
    selected.updated_on = issue.updated_on;
    if (issue.closed_on) selected.closed_on = issue.closed_on;
  }

  if (options.category && issue.category) {
    selected.category = issue.category;
  }

  if (options.version && issue.fixed_version) {
    selected.fixed_version = issue.fixed_version;
  }

  if (options.time_tracking) {
    if (issue.estimated_hours !== undefined) selected.estimated_hours = issue.estimated_hours;
    if (issue.spent_hours !== undefined) selected.spent_hours = issue.spent_hours;
    if (issue.done_ratio !== undefined) selected.done_ratio = issue.done_ratio;
  }

  // Handle custom fields with selective filtering
  if (options.custom_fields && issue.custom_fields) {
    const customFieldResult = selectCustomFields(issue.custom_fields, options.custom_fields);
    selected.custom_fields = customFieldResult.fields;
    if (customFieldResult.warnings.length > 0) {
      warnings.push(...customFieldResult.warnings);
    }
  }

  if (options.journals && issue.journals) {
    selected.journals = issue.journals;
  }

  if (options.relations && issue.relations) {
    selected.relations = issue.relations;
  }

  return {
    issue: selected,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Result of custom field selection
 */
interface CustomFieldSelectionResult {
  fields: Array<{ id: number; name: string; value: string | string[] | null }>;
  warnings: string[];
}

/**
 * Select custom fields based on the custom_fields option
 */
function selectCustomFields(
  customFields: Array<{ id: number; name: string; value: string | string[] | null }>,
  option: boolean | string[]
): CustomFieldSelectionResult {
  const warnings: string[] = [];
  
  // If true, include all non-empty custom fields
  if (option === true) {
    return {
      fields: skipEmptyCustomFields(customFields),
      warnings: []
    };
  }
  
  // If false or empty array, include no custom fields
  if (option === false || (Array.isArray(option) && option.length === 0)) {
    return {
      fields: [],
      warnings: []
    };
  }
  
  // If array of field names, include only matching fields
  if (Array.isArray(option)) {
    const selectedFields: Array<{ id: number; name: string; value: string | string[] | null }> = [];
    const foundFieldNames = new Set<string>();
    
    // Find matching fields by name
    for (const field of customFields) {
      if (option.includes(field.name)) {
        foundFieldNames.add(field.name);
        // Only include non-empty fields
        if (isCustomFieldNonEmpty(field)) {
          selectedFields.push(field);
        }
      }
    }
    
    // Check for requested fields that weren't found or are empty
    for (const requestedName of option) {
      if (!foundFieldNames.has(requestedName)) {
        warnings.push(`Custom field "${requestedName}" not found or empty`);
      } else {
        // Field was found, check if it was included (non-empty)
        const foundField = customFields.find(f => f.name === requestedName);
        if (foundField && !isCustomFieldNonEmpty(foundField)) {
          warnings.push(`Custom field "${requestedName}" not found or empty`);
        }
      }
    }
    
    return {
      fields: selectedFields,
      warnings: warnings
    };
  }
  
  // Fallback: treat as false
  return {
    fields: [],
    warnings: []
  };
}

/**
 * Check if a custom field has a non-empty value
 */
function isCustomFieldNonEmpty(field: { id: number; name: string; value: string | string[] | null }): boolean {
  if (field.value === null || field.value === undefined) {
    return false;
  }
  
  if (typeof field.value === 'string') {
    return field.value.trim().length > 0;
  }
  
  if (Array.isArray(field.value)) {
    return field.value.length > 0 && field.value.some(v => v && v.trim().length > 0);
  }
  
  return true;
}

/**
 * Filter out empty custom fields to reduce noise
 */
export function skipEmptyCustomFields(customFields: Array<{
  id: number;
  name: string;
  value: string | string[] | null;
}>): Array<{ id: number; name: string; value: string | string[] | null }> {
  return customFields.filter(field => {
    if (field.value === null || field.value === undefined) {
      return false;
    }
    
    if (typeof field.value === 'string') {
      return field.value.trim().length > 0;
    }
    
    if (Array.isArray(field.value)) {
      return field.value.length > 0 && field.value.some(v => v && v.trim().length > 0);
    }
    
    return true;
  });
}

/**
 * Check if any brief fields are enabled
 */
export function hasBriefFieldsEnabled(options?: BriefFieldOptions): boolean {
  if (!options) return false;
  
  return Object.values(options).some(value => value === true);
}

/**
 * Get a summary of enabled brief fields for logging/debugging
 */
export function getBriefFieldsSummary(options?: BriefFieldOptions): string {
  if (!options) return 'none';
  
  const enabled = Object.entries(options)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
    
  return enabled.length > 0 ? enabled.join(', ') : 'none';
}
