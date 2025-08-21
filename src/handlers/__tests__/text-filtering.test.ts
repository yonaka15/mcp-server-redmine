import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { createIssuesHandlers } from '../issues.js';
import { mockSimpleIssue } from '../../formatters/__tests__/fixtures/mock-issues.js';
import type { RedmineApiResponse } from '../../lib/types/index.js';
import type { HandlerContext } from '../types.js';

// Mock the IssuesClient
const mockGetIssues = jest.fn() as jest.MockedFunction<any>;
const mockCreateIssue = jest.fn() as jest.MockedFunction<any>;
const mockUpdateIssue = jest.fn() as jest.MockedFunction<any>;
const mockDeleteIssue = jest.fn() as jest.MockedFunction<any>;
const mockAddWatcher = jest.fn() as jest.MockedFunction<any>;
const mockRemoveWatcher = jest.fn() as jest.MockedFunction<any>;

const mockClient = {
  issues: {
    getIssues: mockGetIssues,
    createIssue: mockCreateIssue,
    updateIssue: mockUpdateIssue,
    deleteIssue: mockDeleteIssue,
    addWatcher: mockAddWatcher,
    removeWatcher: mockRemoveWatcher
  }
};

const mockContext: HandlerContext = {
  client: mockClient as any,
  config: {} as any,
  logger: console as any
};

describe('Text Filtering Functionality', () => {
  let handlers: ReturnType<typeof createIssuesHandlers>;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = createIssuesHandlers(mockContext);
  });

  describe('buildTextFilterParams integration', () => {
    const mockIssuesList: RedmineApiResponse<typeof mockSimpleIssue> = {
      issues: [mockSimpleIssue],
      total_count: 1,
      offset: 0,
      limit: 25
    };

    it('should generate correct API parameters for subject filter', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        subject_filter: 'test subject',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        subject_filter: 'test subject',
        'f[]': 'subject',
        'op[subject]': '~',
        'v[subject][]': 'test subject'
      });
    });

    it('should generate correct API parameters for description filter', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        description_filter: 'test description',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        description_filter: 'test description',
        'f[]': 'description',
        'op[description]': '~',
        'v[description][]': 'test description'
      });
    });

    it('should generate correct API parameters for notes filter', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        notes_filter: 'test notes',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        notes_filter: 'test notes',
        'f[]': 'notes',
        'op[notes]': '~',
        'v[notes][]': 'test notes'
      });
    });

    it('should generate correct API parameters for multiple text filters', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        subject_filter: 'subject text',
        description_filter: 'description text',
        notes_filter: 'notes text',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        subject_filter: 'subject text',
        description_filter: 'description text',
        notes_filter: 'notes text',
        'f[]': 'subject,description,notes',
        'op[subject]': '~',
        'op[description]': '~',
        'op[notes]': '~',
        'v[subject][]': 'subject text',
        'v[description][]': 'description text',
        'v[notes][]': 'notes text'
      });
    });

    it('should skip empty text filters', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        subject_filter: '',
        description_filter: 'valid description',
        notes_filter: '   ',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        subject_filter: '',
        description_filter: 'valid description',
        notes_filter: '   ',
        'f[]': 'description',
        'op[description]': '~',
        'v[description][]': 'valid description'
      });
    });

    it('should not add filter parameters when all text filters are empty', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        subject_filter: '',
        description_filter: '   ',
        notes_filter: '',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        subject_filter: '',
        description_filter: '   ',
        notes_filter: ''
      });
    });

    it('should combine text filters with existing parameters', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        project_id: '123',
        status_id: 'open',
        subject_filter: 'test',
        tracker_id: '1',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        project_id: 123,
        status_id: 'open',
        subject_filter: 'test',
        tracker_id: 1,
        'f[]': 'subject',
        'op[subject]': '~',
        'v[subject][]': 'test'
      });
    });

    it('should handle custom field parameters with text filters', async () => {
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        cf_123: 'custom value',
        subject_filter: 'test',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        cf_123: 'custom value',
        subject_filter: 'test',
        'f[]': 'subject',
        'op[subject]': '~',
        'v[subject][]': 'test'
      });
    });
  });

  describe('Error handling for text filters', () => {
    it('should handle API errors gracefully with text filters', async () => {
      mockGetIssues.mockRejectedValue(new Error('API Error'));

      const result = await handlers.list_issues({
        subject_filter: 'test',
        limit: '10'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('API Error');
    });

    it('should handle validation errors with text filters', async () => {
      const result = await handlers.list_issues(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Arguments must be an object');
    });
  });

  describe('Additional handler coverage', () => {
    it('should handle create_issue validation errors', async () => {
      const result = await handlers.create_issue({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('project_id is required');
    });

    it('should handle create_issue missing subject', async () => {
      const result = await handlers.create_issue({
        project_id: '123'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('subject is required');
    });

    it('should handle create_issue success', async () => {
      mockCreateIssue.mockResolvedValue({ issue: { id: 12345 } });

      const result = await handlers.create_issue({
        project_id: '123',
        subject: 'Test Issue'
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toBe('Issue #12345 created successfully');
      expect(mockCreateIssue).toHaveBeenCalledWith({
        project_id: 123,
        subject: 'Test Issue'
      });
    });

    it('should handle create_issue with all optional parameters', async () => {
      mockCreateIssue.mockResolvedValue({ issue: { id: 12345 } });

      const result = await handlers.create_issue({
        project_id: '123',
        subject: 'Test Issue',
        tracker_id: '1',
        status_id: '2',
        priority_id: '3',
        description: 'Test description',
        category_id: '4',
        fixed_version_id: '5',
        assigned_to_id: '6',
        parent_issue_id: '7',
        custom_fields: [{ id: 1, value: 'test' }],
        watcher_user_ids: [8, 9],
        is_private: true,
        estimated_hours: '10.5',
        start_date: '2024-01-01',
        due_date: '2024-01-31'
      });

      expect(result.isError).toBe(false);
      expect(mockCreateIssue).toHaveBeenCalledWith({
        project_id: 123,
        subject: 'Test Issue',
        tracker_id: 1,
        status_id: 2,
        priority_id: 3,
        description: 'Test description',
        category_id: 4,
        fixed_version_id: 5,
        assigned_to_id: 6,
        parent_issue_id: 7,
        custom_fields: [{ id: 1, value: 'test' }],
        watcher_user_ids: [8, 9],
        is_private: true,
        estimated_hours: 10.5,
        start_date: '2024-01-01',
        due_date: '2024-01-31'
      });
    });

    it('should handle create_issue API error', async () => {
      mockCreateIssue.mockRejectedValue(new Error('Create failed'));

      const result = await handlers.create_issue({
        project_id: '123',
        subject: 'Test Issue'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Create failed');
    });

    it('should handle update_issue validation error', async () => {
      const result = await handlers.update_issue({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('id is required');
    });

    it('should handle update_issue success', async () => {
      mockUpdateIssue.mockResolvedValue({});

      const result = await handlers.update_issue({
        id: '123',
        subject: 'Updated Subject'
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toBe('Issue #123 updated successfully');
      expect(mockUpdateIssue).toHaveBeenCalledWith(123, {
        subject: 'Updated Subject'
      });
    });

    it('should handle update_issue with all optional parameters', async () => {
      mockUpdateIssue.mockResolvedValue({});

      const result = await handlers.update_issue({
        id: '123',
        project_id: '456',
        tracker_id: '1',
        status_id: '2',
        priority_id: '3',
        subject: 'Updated Subject',
        description: 'Updated description',
        category_id: '4',
        fixed_version_id: '5',
        assigned_to_id: '6',
        parent_issue_id: '7',
        custom_fields: [{ id: 1, value: 'updated' }],
        notes: 'Update notes',
        private_notes: true,
        is_private: false,
        estimated_hours: '15.5',
        start_date: '2024-02-01',
        due_date: '2024-02-28'
      });

      expect(result.isError).toBe(false);
      expect(mockUpdateIssue).toHaveBeenCalledWith(123, {
        project_id: 456,
        tracker_id: 1,
        status_id: 2,
        priority_id: 3,
        subject: 'Updated Subject',
        description: 'Updated description',
        category_id: 4,
        fixed_version_id: 5,
        assigned_to_id: 6,
        parent_issue_id: 7,
        custom_fields: [{ id: 1, value: 'updated' }],
        notes: 'Update notes',
        private_notes: true,
        is_private: false,
        estimated_hours: 15.5,
        start_date: '2024-02-01',
        due_date: '2024-02-28'
      });
    });

    it('should handle update_issue API error', async () => {
      mockUpdateIssue.mockRejectedValue(new Error('Update failed'));

      const result = await handlers.update_issue({
        id: '123',
        subject: 'Updated Subject'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Update failed');
    });

    it('should handle list_issues with numeric status_id', async () => {
      const mockIssuesList: RedmineApiResponse<typeof mockSimpleIssue> = {
        issues: [mockSimpleIssue],
        total_count: 1,
        offset: 0,
        limit: 25
      };
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        status_id: '5',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        status_id: 5
      });
    });

    it('should handle list_issues with numeric assigned_to_id', async () => {
      const mockIssuesList: RedmineApiResponse<typeof mockSimpleIssue> = {
        issues: [mockSimpleIssue],
        total_count: 1,
        offset: 0,
        limit: 25
      };
      mockGetIssues.mockResolvedValue(mockIssuesList);

      await handlers.list_issues({
        assigned_to_id: '123',
        limit: '10'
      });

      expect(mockGetIssues).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        assigned_to_id: 123
      });
    });

    it('should handle get_issue validation error for null args', async () => {
      const result = await handlers.get_issue(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Arguments must be an object');
    });

    it('should handle get_issue validation error for missing id', async () => {
      const result = await handlers.get_issue({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('id is required');
    });

    it('should handle create_issue validation error for null args', async () => {
      const result = await handlers.create_issue(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Arguments must be an object');
    });

    it('should handle update_issue validation error for null args', async () => {
      const result = await handlers.update_issue(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Arguments must be an object');
    });
  });
});
