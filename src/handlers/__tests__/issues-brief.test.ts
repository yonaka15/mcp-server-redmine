import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { createIssuesHandlers } from '../issues.js';
import { mockSimpleIssue, mockComplexIssue } from '../../formatters/__tests__/fixtures/mock-issues.js';
import type { RedmineApiResponse } from '../../lib/types/index.js';
import type { HandlerContext } from '../types.js';

// Mock the IssuesClient
const mockGetIssue = jest.fn() as jest.MockedFunction<any>;
const mockGetIssues = jest.fn() as jest.MockedFunction<any>;

const mockClient = {
  issues: {
    getIssue: mockGetIssue,
    getIssues: mockGetIssues
  }
};

const mockContext: HandlerContext = {
  client: mockClient as any,
  config: {} as any,
  logger: console as any
};

describe('Issues Handler - Brief Mode Integration', () => {
  let handlers: ReturnType<typeof createIssuesHandlers>;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = createIssuesHandlers(mockContext);
  });

  describe('get_issue handler', () => {
    it('should handle brief mode with default fields', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockSimpleIssue });

      const result = await handlers.get_issue({
        id: '1001',
        detail_level: 'brief'
      });

      expect(mockGetIssue).toHaveBeenCalledWith(1001, undefined);
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<issue>');
      expect(result.content[0].text).toContain('<id>1001</id>');
      expect(result.content[0].text).toContain('<subject>Simple test issue</subject>');
      
      // Brief mode characteristics
      expect(result.content[0].text).not.toContain('<author>');
      expect(result.content[0].text).toContain('<description>'); // Now included by default (truncated)
      expect(result.content[0].text).not.toContain('<custom_fields>');
      
      // Should be significantly shorter than full mode
      expect(result.content[0].text.length).toBeLessThan(500);
    });

    it('should handle brief mode with custom field configuration', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockComplexIssue });

      const briefFields = JSON.stringify({
        assignee: true,
        dates: true,
        description: true,
        custom_fields: true,
        category: false,
        version: false,
        time_tracking: false,
        journals: false,
        relations: false,
        attachments: false
      });

      const result = await handlers.get_issue({
        id: '1002',
        detail_level: 'brief',
        brief_fields: briefFields,
        max_description_length: '150',
        max_journal_entries: '2'
      });

      expect(mockGetIssue).toHaveBeenCalledWith(1002, undefined);
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<assigned_to>Test Assignee</assigned_to>');
      expect(result.content[0].text).toContain('<start_date>2024-01-02</start_date>');
      expect(result.content[0].text).toContain('<description>');
      expect(result.content[0].text).toContain('<custom_fields>');
      
      // Should not contain disabled fields
      expect(result.content[0].text).not.toContain('<category>');
      expect(result.content[0].text).not.toContain('<version>');
      expect(result.content[0].text).not.toContain('<progress>');
      expect(result.content[0].text).not.toContain('<journals>');
    });

    it('should handle full mode (default behavior)', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockComplexIssue });

      const result = await handlers.get_issue({
        id: '1002'
      });

      expect(mockGetIssue).toHaveBeenCalledWith(1002, undefined);
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<issue>');
      expect(result.content[0].text).toContain('<author>Test Author</author>');
      expect(result.content[0].text).toContain('<description>');
      expect(result.content[0].text).toContain('<custom_fields>');
      expect(result.content[0].text).toContain('<journals>');
      
      // Should be longer than brief mode
      expect(result.content[0].text.length).toBeGreaterThan(1000);
    });

    it('should handle include parameter with brief mode', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockComplexIssue });

      const result = await handlers.get_issue({
        id: '1002',
        include: 'journals,attachments',
        detail_level: 'brief'
      });

      expect(mockGetIssue).toHaveBeenCalledWith(1002, { include: 'journals,attachments' });
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<issue>');
      expect(result.content[0].text).toContain('<id>1002</id>');
    });
  });

  describe('list_issues handler', () => {
    const mockIssuesList: RedmineApiResponse<typeof mockSimpleIssue> = {
      issues: [mockSimpleIssue, mockComplexIssue],
      total_count: 2,
      offset: 0,
      limit: 25
    };

    it('should handle brief mode for issue list', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      const result = await handlers.list_issues({
        detail_level: 'brief',
        limit: '25'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 25,
        offset: 0
      });
      
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result.content[0].text).toContain('<issues type="array" total_count="2"');
      expect(result.content[0].text).toContain('<id>1001</id>');
      expect(result.content[0].text).toContain('<id>1002</id>');
      
      // Brief mode characteristics for all issues
      expect(result.content[0].text).not.toContain('<author>');
      expect(result.content[0].text).toContain('<description>'); // Now included by default (truncated)
      
      // Should be significantly shorter than full mode
      const issueMatches = result.content[0].text.match(/<issue>/g);
      expect(issueMatches).toHaveLength(2);
    });

    it('should handle full mode for issue list (default)', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      const result = await handlers.list_issues({
        project_id: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 25,
        offset: 0,
        project_id: 10
      });
      
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('<issues type="array"');
      expect(result.content[0].text).toContain('<author>Test Author</author>');
      expect(result.content[0].text).toContain('<description>');
      expect(result.content[0].text).toContain('<custom_fields>');
      
      // Should be longer than brief mode
      expect(result.content[0].text.length).toBeGreaterThan(2000);
    });
  });

  describe('Brief Mode Performance Characteristics', () => {
    it('should demonstrate significant size reduction in real handler usage', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockComplexIssue });

      // Get both brief and full mode results
      const briefResult = await handlers.get_issue({
        id: '1002',
        detail_level: 'brief'
      });

      const fullResult = await handlers.get_issue({
        id: '1002',
        detail_level: 'full'
      });

      // Calculate size reduction
      const briefText = briefResult.content[0].text;
      const fullText = fullResult.content[0].text;
      const reductionPercentage = (fullText.length - briefText.length) / fullText.length * 100;
      
      console.log(`Handler Brief mode length: ${briefText.length} characters`);
      console.log(`Handler Full mode length: ${fullText.length} characters`);
      console.log(`Handler Size reduction: ${reductionPercentage.toFixed(1)}%`);
      
      // Verify significant reduction (adjusted for truncated descriptions now included by default)
      expect(reductionPercentage).toBeGreaterThan(70);
      expect(briefText.length).toBeLessThan(fullText.length * 0.3);
    });

    it('should maintain essential information in brief mode handler', async () => {
      mockGetIssue.mockResolvedValue({ issue: mockComplexIssue });

      const result = await handlers.get_issue({
        id: '1002',
        detail_level: 'brief'
      });

      const text = result.content[0].text;
      
      // Essential fields should always be present
      expect(text).toContain('<id>1002</id>');
      expect(text).toContain('<subject>Complex issue with all fields populated for comprehensive testing</subject>');
      expect(text).toContain('<project>Test Project</project>');
      expect(text).toContain('<tracker>Feature</tracker>');
      expect(text).toContain('<status>In Progress</status>');
      expect(text).toContain('<priority>High</priority>');
      expect(text).toContain('<created_on>2024-01-01T10:00:00Z</created_on>');
      expect(text).toContain('<updated_on>2024-01-15T14:30:00Z</updated_on>');
    });
  });
});
