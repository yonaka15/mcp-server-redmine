import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { 
  selectFields, 
  skipEmptyCustomFields, 
  hasBriefFieldsEnabled, 
  getBriefFieldsSummary,
  type FieldSelectionResult 
} from '../field-selector.js';
import type { RedmineIssue } from '../../lib/types/issues/types.js';
import type { BriefFieldOptions } from '../format-options.js';

describe('Field Selector', () => {
  let mockIssue: RedmineIssue;

  beforeEach(() => {
    mockIssue = {
      id: 1,
      subject: 'Test Issue',
      project: { id: 1, name: 'Test Project' },
      tracker: { id: 1, name: 'Bug' },
      status: { id: 1, name: 'New' },
      priority: { id: 2, name: 'Normal' },
      author: { id: 1, name: 'Test User' },
      assigned_to: { id: 2, name: 'Assigned User' },
      category: { id: 1, name: 'Test Category' },
      fixed_version: { id: 1, name: 'Version 1.0' },
      parent: { id: 2 },
      description: 'This is a test issue description',
      start_date: '2024-01-01',
      due_date: '2024-01-31',
      done_ratio: 50,
      estimated_hours: 8,
      spent_hours: 4,
      custom_fields: [
        { id: 1, name: 'System Testing', value: 'Yes' },
        { id: 2, name: 'Empty Field', value: null },
        { id: 3, name: 'Technical Risk', value: 'Medium' },
        { id: 4, name: 'Empty String Field', value: '' },
        { id: 5, name: 'Multi Select', value: ['Option 1', 'Option 2'] }
      ],
      created_on: '2024-01-01T10:00:00Z',
      updated_on: '2024-01-15T15:30:00Z',
      closed_on: null,
      journals: [
        {
          id: 1,
          user: { id: 1, name: 'Test User' },
          notes: 'First comment',
          created_on: '2024-01-02T10:00:00Z',
          details: []
        }
      ],
      relations: [
        {
          id: 1,
          issue_id: 1,
          issue_to_id: 3,
          relation_type: 'relates',
          delay: null
        }
      ]
    };
  });

  describe('selectFields', () => {
    it('should return all fields when all options are true', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: true,
        custom_fields: true,
        dates: true,
        category: true,
        version: true,
        time_tracking: true,
        journals: true,
        relations: true,
        attachments: true
      };

      const result = selectFields(mockIssue, options);

      // Should include all core fields
      expect(result.issue.id).toBe(mockIssue.id);
      expect(result.issue.subject).toBe(mockIssue.subject);
      expect(result.issue.project).toEqual(mockIssue.project);
      expect(result.issue.tracker).toEqual(mockIssue.tracker);
      expect(result.issue.status).toEqual(mockIssue.status);
      expect(result.issue.priority).toEqual(mockIssue.priority);
      expect(result.issue.author).toEqual(mockIssue.author);
      
      // Should include optional fields when enabled
      expect(result.issue.assigned_to).toEqual(mockIssue.assigned_to);
      expect(result.issue.description).toBe(mockIssue.description);
      expect(result.issue.category).toEqual(mockIssue.category);
      expect(result.issue.fixed_version).toEqual(mockIssue.fixed_version);
      expect(result.issue.start_date).toBe(mockIssue.start_date);
      expect(result.issue.due_date).toBe(mockIssue.due_date);
      expect(result.issue.created_on).toBe(mockIssue.created_on);
      expect(result.issue.updated_on).toBe(mockIssue.updated_on);
      expect(result.issue.done_ratio).toBe(mockIssue.done_ratio);
      expect(result.issue.estimated_hours).toBe(mockIssue.estimated_hours);
      expect(result.issue.spent_hours).toBe(mockIssue.spent_hours);
      expect(result.issue.journals).toEqual(mockIssue.journals);
      expect(result.issue.relations).toEqual(mockIssue.relations);
      
      // Custom fields should be filtered (empty ones removed)
      expect(result.issue.custom_fields).toHaveLength(3); // Only non-empty ones
      expect(result.warnings).toBeUndefined();
    });

    it('should exclude assignee when assignee is false', () => {
      const options: BriefFieldOptions = {
        assignee: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.assigned_to).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
      expect(result.issue.subject).toBe(mockIssue.subject);
    });

    it('should exclude description when description is false', () => {
      const options: BriefFieldOptions = {
        description: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.description).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude custom_fields when custom_fields is false', () => {
      const options: BriefFieldOptions = {
        custom_fields: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude custom_fields when custom_fields is empty array', () => {
      const options: BriefFieldOptions = {
        custom_fields: []
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toEqual([]);
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should select specific custom fields by name', () => {
      const options: BriefFieldOptions = {
        custom_fields: ['System Testing', 'Technical Risk']
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toHaveLength(2);
      expect(result.issue.custom_fields).toEqual([
        { id: 1, name: 'System Testing', value: 'Yes' },
        { id: 3, name: 'Technical Risk', value: 'Medium' }
      ]);
      expect(result.warnings).toBeUndefined();
    });

    it('should warn about missing custom fields', () => {
      const options: BriefFieldOptions = {
        custom_fields: ['System Testing', 'Nonexistent Field', 'Technical Risk']
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toHaveLength(2);
      expect(result.issue.custom_fields).toEqual([
        { id: 1, name: 'System Testing', value: 'Yes' },
        { id: 3, name: 'Technical Risk', value: 'Medium' }
      ]);
      expect(result.warnings).toEqual(['Custom field "Nonexistent Field" not found or empty']);
    });

    it('should warn about empty custom fields', () => {
      const options: BriefFieldOptions = {
        custom_fields: ['System Testing', 'Empty Field', 'Empty String Field']
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toHaveLength(1);
      expect(result.issue.custom_fields).toEqual([
        { id: 1, name: 'System Testing', value: 'Yes' }
      ]);
      expect(result.warnings).toEqual([
        'Custom field "Empty Field" not found or empty',
        'Custom field "Empty String Field" not found or empty'
      ]);
    });

    it('should exclude date fields when dates is false', () => {
      const options: BriefFieldOptions = {
        dates: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.start_date).toBeUndefined();
      expect(result.issue.due_date).toBeUndefined();
      expect(result.issue.created_on).toBeUndefined();
      expect(result.issue.updated_on).toBeUndefined();
      expect(result.issue.closed_on).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude category when category is false', () => {
      const options: BriefFieldOptions = {
        category: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.category).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude version when version is false', () => {
      const options: BriefFieldOptions = {
        version: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.fixed_version).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude time tracking fields when time_tracking is false', () => {
      const options: BriefFieldOptions = {
        time_tracking: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.done_ratio).toBeUndefined();
      expect(result.issue.estimated_hours).toBeUndefined();
      expect(result.issue.spent_hours).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude journals when journals is false', () => {
      const options: BriefFieldOptions = {
        journals: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.journals).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should exclude relations when relations is false', () => {
      const options: BriefFieldOptions = {
        relations: false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.relations).toBeUndefined();
      expect(result.issue.id).toBe(mockIssue.id);
    });

    it('should always preserve core fields regardless of options', () => {
      const options: BriefFieldOptions = {
        assignee: false,
        description: false,
        custom_fields: false,
        dates: false,
        category: false,
        version: false,
        time_tracking: false,
        journals: false,
        relations: false,
        attachments: false
      };

      const result = selectFields(mockIssue, options);

      // Core fields should always be present
      expect(result.issue.id).toBe(mockIssue.id);
      expect(result.issue.subject).toBe(mockIssue.subject);
      expect(result.issue.project).toEqual(mockIssue.project);
      expect(result.issue.tracker).toEqual(mockIssue.tracker);
      expect(result.issue.status).toEqual(mockIssue.status);
      expect(result.issue.priority).toEqual(mockIssue.priority);
      expect(result.issue.author).toEqual(mockIssue.author);
    });

    it('should handle undefined options gracefully', () => {
      const options: BriefFieldOptions = {};

      const result = selectFields(mockIssue, options);

      // Should only include core fields when options are empty/undefined
      expect(result.issue.id).toBe(mockIssue.id);
      expect(result.issue.subject).toBe(mockIssue.subject);
      expect(result.issue.project).toEqual(mockIssue.project);
      expect(result.issue.tracker).toEqual(mockIssue.tracker);
      expect(result.issue.status).toEqual(mockIssue.status);
      expect(result.issue.priority).toEqual(mockIssue.priority);
      expect(result.issue.author).toEqual(mockIssue.author);
      
      // Optional fields should be undefined when not explicitly enabled
      expect(result.issue.assigned_to).toBeUndefined();
      expect(result.issue.description).toBeUndefined();
    });

    it('should handle issue without optional fields', () => {
      const minimalIssue: RedmineIssue = {
        id: 1,
        subject: 'Minimal Issue',
        project: { id: 1, name: 'Test Project' },
        tracker: { id: 1, name: 'Bug' },
        status: { id: 1, name: 'New' },
        priority: { id: 2, name: 'Normal' },
        author: { id: 1, name: 'Test User' },
        done_ratio: 0,
        created_on: '2024-01-01T10:00:00Z',
        updated_on: '2024-01-01T10:00:00Z'
      };

      const options: BriefFieldOptions = {
        assignee: true,
        description: true,
        custom_fields: true
      };

      const result = selectFields(minimalIssue, options);

      expect(result.issue.id).toBe(minimalIssue.id);
      expect(result.issue.assigned_to).toBeUndefined();
      expect(result.issue.description).toBeUndefined();
      expect(result.issue.custom_fields).toBeUndefined();
    });
  });

  describe('skipEmptyCustomFields', () => {
    it('should filter out custom fields with null values', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: 'Value 1' },
        { id: 2, name: 'Field 2', value: null },
        { id: 3, name: 'Field 3', value: 'Value 3' }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: 'Value 1' });
      expect(result[1]).toEqual({ id: 3, name: 'Field 3', value: 'Value 3' });
    });

    it('should filter out custom fields with empty string values', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: 'Value 1' },
        { id: 2, name: 'Field 2', value: '' },
        { id: 3, name: 'Field 3', value: 'Value 3' }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: 'Value 1' });
      expect(result[1]).toEqual({ id: 3, name: 'Field 3', value: 'Value 3' });
    });

    it('should keep custom fields with array values', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: ['Option 1', 'Option 2'] },
        { id: 2, name: 'Field 2', value: null },
        { id: 3, name: 'Field 3', value: [] }
      ];

      const result = skipEmptyCustomFields(customFields);

      // Empty arrays are filtered out by the implementation
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: ['Option 1', 'Option 2'] });
    });

    it('should keep custom fields with zero values', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: '0' },
        { id: 2, name: 'Field 2', value: 'false' },
        { id: 3, name: 'Field 3', value: null }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: '0' });
      expect(result[1]).toEqual({ id: 2, name: 'Field 2', value: 'false' });
    });

    it('should return empty array when all fields are empty', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: null },
        { id: 2, name: 'Field 2', value: '' },
        { id: 3, name: 'Field 3', value: null }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(0);
    });

    it('should handle empty input array', () => {
      const customFields: Array<{ id: number; name: string; value: string | string[] | null }> = [];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(0);
    });

    it('should preserve original objects without mutation', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: 'Value 1' },
        { id: 2, name: 'Field 2', value: null }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result[0]).toEqual(customFields[0]);
      expect(result[0]).toBe(customFields[0]); // filter() returns same object references
      expect(customFields[1].value).toBe(null); // Original should be unchanged
    });

    it('should filter out arrays with only empty strings', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: ['Valid Option'] },
        { id: 2, name: 'Field 2', value: ['', '   ', ''] },
        { id: 3, name: 'Field 3', value: ['Option 1', '', 'Option 2'] }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: ['Valid Option'] });
      expect(result[1]).toEqual({ id: 3, name: 'Field 3', value: ['Option 1', '', 'Option 2'] });
    });

    it('should handle whitespace-only string values', () => {
      const customFields = [
        { id: 1, name: 'Field 1', value: 'Valid Value' },
        { id: 2, name: 'Field 2', value: '   \n\t   ' },
        { id: 3, name: 'Field 3', value: 'Another Valid' }
      ];

      const result = skipEmptyCustomFields(customFields);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Field 1', value: 'Valid Value' });
      expect(result[1]).toEqual({ id: 3, name: 'Field 3', value: 'Another Valid' });
    });
  });

  describe('hasBriefFieldsEnabled', () => {
    it('should return false for undefined options', () => {
      const result = hasBriefFieldsEnabled(undefined);
      
      expect(result).toBe(false);
    });

    it('should return false when no fields are enabled', () => {
      const options: BriefFieldOptions = {
        assignee: false,
        description: false,
        custom_fields: false,
        dates: false,
        category: false,
        version: false,
        time_tracking: false,
        journals: false,
        relations: false,
        attachments: false
      };

      const result = hasBriefFieldsEnabled(options);
      
      expect(result).toBe(false);
    });

    it('should return true when at least one field is enabled', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: false,
        custom_fields: false
      };

      const result = hasBriefFieldsEnabled(options);
      
      expect(result).toBe(true);
    });

    it('should return true when multiple fields are enabled', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: true,
        dates: true,
        custom_fields: false
      };

      const result = hasBriefFieldsEnabled(options);
      
      expect(result).toBe(true);
    });

    it('should return false for empty options object', () => {
      const options: BriefFieldOptions = {};

      const result = hasBriefFieldsEnabled(options);
      
      expect(result).toBe(false);
    });

    it('should ignore non-boolean values when checking for enabled fields', () => {
      const options: BriefFieldOptions = {
        assignee: false,
        description: "truncated" as any, // This should not count as "true"
        custom_fields: [] as any, // This should not count as "true"
        dates: false
      };

      const result = hasBriefFieldsEnabled(options);
      
      expect(result).toBe(false);
    });
  });

  describe('getBriefFieldsSummary', () => {
    it('should return "none" for undefined options', () => {
      const result = getBriefFieldsSummary(undefined);
      
      expect(result).toBe('none');
    });

    it('should return "none" when no fields are enabled', () => {
      const options: BriefFieldOptions = {
        assignee: false,
        description: false,
        custom_fields: false,
        dates: false
      };

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('none');
    });

    it('should return single field name when one field is enabled', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: false,
        custom_fields: false
      };

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('assignee');
    });

    it('should return comma-separated field names when multiple fields are enabled', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: true,
        dates: true,
        custom_fields: false,
        category: false
      };

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('assignee, description, dates');
    });

    it('should return all field names when all fields are enabled', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: true,
        custom_fields: true,
        dates: true,
        category: true,
        version: true,
        time_tracking: true,
        journals: true,
        relations: true,
        attachments: true
      };

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('assignee, description, custom_fields, dates, category, version, time_tracking, journals, relations, attachments');
    });

    it('should return "none" for empty options object', () => {
      const options: BriefFieldOptions = {};

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('none');
    });

    it('should ignore non-boolean true values', () => {
      const options: BriefFieldOptions = {
        assignee: true,
        description: "truncated" as any, // Should be ignored
        custom_fields: [] as any, // Should be ignored
        dates: true
      };

      const result = getBriefFieldsSummary(options);
      
      expect(result).toBe('assignee, dates');
    });
  });

  describe('selectFields edge cases', () => {
    it('should handle custom fields with mixed array content', () => {
      const issueWithMixedArrays: RedmineIssue = {
        ...mockIssue,
        custom_fields: [
          { id: 1, name: 'Mixed Array', value: ['Valid', '', '   ', 'Also Valid'] },
          { id: 2, name: 'Empty Array', value: [] },
          { id: 3, name: 'Whitespace Array', value: ['   ', '\n', '\t'] }
        ]
      };

      const options: BriefFieldOptions = {
        custom_fields: ['Mixed Array', 'Empty Array', 'Whitespace Array']
      };

      const result = selectFields(issueWithMixedArrays, options);

      expect(result.issue.custom_fields).toHaveLength(1);
      expect(result.issue.custom_fields![0]).toEqual({ 
        id: 1, 
        name: 'Mixed Array', 
        value: ['Valid', '', '   ', 'Also Valid'] 
      });
      expect(result.warnings).toEqual([
        'Custom field "Empty Array" not found or empty',
        'Custom field "Whitespace Array" not found or empty'
      ]);
    });

    it('should handle time tracking fields with zero values', () => {
      const issueWithZeroValues: RedmineIssue = {
        ...mockIssue,
        estimated_hours: 0,
        spent_hours: 0,
        done_ratio: 0
      };

      const options: BriefFieldOptions = {
        time_tracking: true
      };

      const result = selectFields(issueWithZeroValues, options);

      expect(result.issue.estimated_hours).toBe(0);
      expect(result.issue.spent_hours).toBe(0);
      expect(result.issue.done_ratio).toBe(0);
    });

    it('should handle dates field with closed_on when present', () => {
      const issueWithClosedDate: RedmineIssue = {
        ...mockIssue,
        closed_on: '2024-02-01T10:00:00Z'
      };

      const options: BriefFieldOptions = {
        dates: true
      };

      const result = selectFields(issueWithClosedDate, options);

      expect(result.issue.start_date).toBe(issueWithClosedDate.start_date);
      expect(result.issue.due_date).toBe(issueWithClosedDate.due_date);
      expect(result.issue.created_on).toBe(issueWithClosedDate.created_on);
      expect(result.issue.updated_on).toBe(issueWithClosedDate.updated_on);
      expect(result.issue.closed_on).toBe(issueWithClosedDate.closed_on);
    });

    it('should handle custom_fields option with invalid type gracefully', () => {
      const options: BriefFieldOptions = {
        custom_fields: "invalid" as any // Should be treated as false
      };

      const result = selectFields(mockIssue, options);

      expect(result.issue.custom_fields).toEqual([]);
      expect(result.warnings).toBeUndefined();
    });
  });
});
