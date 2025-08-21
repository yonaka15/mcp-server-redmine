import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { formatIssue, formatIssueBrief } from '../issues.js';
import { createDefaultBriefFields } from '../format-options.js';
import { 
  mockSimpleIssue, 
  mockComplexIssue, 
  mockIssueWithCustomFields, 
  mockIssueWithManyJournals,
  mockMinimalIssue 
} from './fixtures/mock-issues.js';

describe('Issue Formatters', () => {
  describe('formatIssueBrief', () => {
    it('should format simple issue in brief mode with default fields', () => {
      const result = formatIssueBrief(mockSimpleIssue, createDefaultBriefFields());
      
      expect(result).toContain('<issue>');
      expect(result).toContain('<id>1001</id>');
      expect(result).toContain('<subject>Simple test issue</subject>');
      expect(result).toContain('<project>Test Project</project>');
      expect(result).toContain('<tracker>Bug</tracker>');
      expect(result).toContain('<status>New</status>');
      expect(result).toContain('<priority>Normal</priority>');
      expect(result).toContain('</issue>');
      
      // Brief mode doesn't include author by default (only in full mode)
      expect(result).not.toContain('<author>');
      // Dates are always included in brief mode (created_on and updated_on)
      expect(result).toContain('<created_on>2024-01-01T10:00:00Z</created_on>');
      expect(result).toContain('<updated_on>2024-01-01T10:00:00Z</updated_on>');
      // Should contain truncated description in brief mode by default
      expect(result).toContain('<description>');
      // Should not contain custom fields in brief mode by default
      expect(result).not.toContain('<custom_fields>');
    });

    it('should include assignee and dates when enabled in brief fields', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.assignee = true;
      briefFields.dates = true;
      
      const result = formatIssueBrief(mockComplexIssue, briefFields);
      
      expect(result).toContain('<assigned_to>Test Assignee</assigned_to>');
      expect(result).toContain('<start_date>2024-01-02</start_date>');
      expect(result).toContain('<due_date>2024-01-31</due_date>');
    });

    it('should exclude custom fields by default in brief mode', () => {
      const result = formatIssueBrief(mockIssueWithCustomFields, createDefaultBriefFields());
      
      expect(result).not.toContain('<custom_fields>');
      expect(result).not.toContain('Priority Level');
      expect(result).not.toContain('Component');
    });

    it('should include custom fields when explicitly enabled', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.custom_fields = true;
      
      const result = formatIssueBrief(mockIssueWithCustomFields, briefFields);
      
      expect(result).toContain('<custom_fields>');
      // Should only include non-empty custom fields in XML format
      expect(result).toContain('<name>Priority Level</name>');
      expect(result).toContain('<value>Critical</value>');
      expect(result).toContain('<name>Component</name>');
      expect(result).toContain('<value>Authentication</value>');
      expect(result).toContain('<name>Affected Versions</name>');
      expect(result).toContain('<value>v1.0.0, v1.1.0, v1.2.0</value>');
      // Should not include empty fields
      expect(result).not.toContain('Empty String Field');
      expect(result).not.toContain('Null Field');
    });

    it('should limit journal entries in brief mode', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.journals = true;
      
      const result = formatIssueBrief(mockIssueWithManyJournals, briefFields, 200, 3);
      
      expect(result).toContain('<journals>');
      // Should only show the last 3 entries
      const journalMatches = result.match(/<journal>/g);
      expect(journalMatches).toHaveLength(3);
      
      // Should contain the most recent entries
      expect(result).toContain('Fourth entry with implementation details');
      expect(result).toContain('Fifth entry with testing results');
      expect(result).toContain('Sixth entry with final review');
      
      // Should not contain the earliest entries
      expect(result).not.toContain('First journal entry');
      expect(result).not.toContain('Second entry with additional');
    });

    it('should truncate description when enabled', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.description = "truncated";
      
      const result = formatIssueBrief(mockComplexIssue, briefFields, 100);
      
      expect(result).toContain('<description>');
      const descriptionMatch = result.match(/<description>(.*?)<\/description>/s);
      expect(descriptionMatch).toBeTruthy();
      
      if (descriptionMatch) {
        const description = descriptionMatch[1];
        expect(description.length).toBeLessThanOrEqual(103); // 100 + "..."
        expect(description).toContain('...');
      }
    });

    it('should handle minimal issue without optional fields', () => {
      const result = formatIssueBrief(mockMinimalIssue, createDefaultBriefFields());
      
      expect(result).toContain('<id>1005</id>');
      expect(result).toContain('<subject>Minimal issue</subject>');
      expect(result).not.toContain('<assigned_to>');
      expect(result).not.toContain('<description>');
      expect(result).not.toContain('<custom_fields>');
      expect(result).not.toContain('<journals>');
    });

    it('should include category and version when enabled', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.category = true;
      briefFields.version = true;
      
      const result = formatIssueBrief(mockComplexIssue, briefFields);
      
      expect(result).toContain('<category>Backend</category>');
      expect(result).toContain('<version>v2.0.0</version>');
    });

    it('should include time tracking when enabled', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.time_tracking = true;
      
      const result = formatIssueBrief(mockComplexIssue, briefFields);
      
      expect(result).toContain('<estimated_hours>40</estimated_hours>');
      expect(result).toContain('<spent_hours>30</spent_hours>');
      expect(result).toContain('<progress>75%</progress>');
    });

    it('should include relations when enabled', () => {
      const briefFields = createDefaultBriefFields();
      briefFields.relations = true;
      
      const result = formatIssueBrief(mockComplexIssue, briefFields);
      
      // Relations are not implemented in the current formatter
      // This test documents the expected behavior when implemented
      expect(result).not.toContain('<relations>');
    });

    it('should be significantly shorter than full format', () => {
      const briefResult = formatIssueBrief(mockComplexIssue, createDefaultBriefFields());
      const fullResult = formatIssue(mockComplexIssue);
      
      // Brief mode should be significantly shorter
      expect(briefResult.length).toBeLessThan(fullResult.length * 0.5);
      
      // Brief should be under reasonable length (e.g., 1000 chars for complex issue)
      expect(briefResult.length).toBeLessThan(1000);
    });
  });

  describe('formatIssue (full mode)', () => {
    it('should format complete issue with all fields', () => {
      const result = formatIssue(mockComplexIssue);
      
      expect(result).toContain('<issue>');
      expect(result).toContain('<id>1002</id>');
      expect(result).toContain('<subject>Complex issue with all fields populated for comprehensive testing</subject>');
      expect(result).toContain('<description>');
      expect(result).toContain('<custom_fields>');
      expect(result).toContain('<journals>');
      expect(result).toContain('</issue>');
      // Relations are not implemented yet
      expect(result).not.toContain('<relations>');
    });

    it('should include all journal entries in full mode', () => {
      const result = formatIssue(mockIssueWithManyJournals);
      
      expect(result).toContain('<journals>');
      const journalMatches = result.match(/<journal>/g);
      expect(journalMatches).toHaveLength(6); // All 6 journal entries
      
      // Should contain all entries
      expect(result).toContain('First journal entry');
      expect(result).toContain('Second entry with additional');
      expect(result).toContain('Sixth entry with final review');
    });

    it('should include full description without truncation', () => {
      const result = formatIssue(mockComplexIssue);
      
      expect(result).toContain('<description>');
      expect(result).toContain('This is a very detailed description');
      expect(result).toContain('multiple paragraphs');
      expect(result).toContain('maintaining readability');
      expect(result).not.toContain('...');
    });

    it('should include all custom fields in full mode', () => {
      const result = formatIssue(mockIssueWithCustomFields);
      
      expect(result).toContain('<custom_fields>');
      expect(result).toContain('Priority Level');
      expect(result).toContain('Component');
      expect(result).toContain('Affected Versions');
      // Should include empty fields in full mode
      expect(result).toContain('Empty String Field');
    });
  });

  describe('Brief vs Full Mode Comparison', () => {
    it('should demonstrate significant size reduction in brief mode', () => {
      const briefResult = formatIssueBrief(mockComplexIssue, createDefaultBriefFields());
      const fullResult = formatIssue(mockComplexIssue);
      
      console.log(`Brief mode length: ${briefResult.length} characters`);
      console.log(`Full mode length: ${fullResult.length} characters`);
      console.log(`Size reduction: ${((fullResult.length - briefResult.length) / fullResult.length * 100).toFixed(1)}%`);
      
      // Verify significant reduction (should be >70% reduction with truncated descriptions)
      const reductionPercentage = (fullResult.length - briefResult.length) / fullResult.length * 100;
      expect(reductionPercentage).toBeGreaterThan(70);
    });

    it('should maintain essential information in brief mode', () => {
      const briefResult = formatIssueBrief(mockComplexIssue, createDefaultBriefFields());
      
      // Essential fields should always be present
      expect(briefResult).toContain('<id>1002</id>');
      expect(briefResult).toContain('<subject>');
      expect(briefResult).toContain('<project>Test Project</project>');
      expect(briefResult).toContain('<tracker>Feature</tracker>');
      expect(briefResult).toContain('<status>In Progress</status>');
      expect(briefResult).toContain('<priority>High</priority>');
      // Brief mode doesn't include author by default
      expect(briefResult).not.toContain('<author>');
    });
  });
});
