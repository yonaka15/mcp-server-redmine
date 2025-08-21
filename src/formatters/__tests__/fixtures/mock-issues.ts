/**
 * Mock issue data for testing brief mode formatting
 */

import type { RedmineIssue } from '../../../lib/types/issues/types.js';

/**
 * Simple issue with minimal data
 */
export const mockSimpleIssue: RedmineIssue = {
  id: 1001,
  subject: 'Simple test issue',
  description: 'This is a simple test issue for brief mode testing.',
  project: {
    id: 10,
    name: 'Test Project'
  },
  tracker: {
    id: 1,
    name: 'Bug'
  },
  status: {
    id: 1,
    name: 'New'
  },
  priority: {
    id: 2,
    name: 'Normal'
  },
  author: {
    id: 1,
    name: 'Test Author'
  },
  done_ratio: 0,
  created_on: '2024-01-01T10:00:00Z',
  updated_on: '2024-01-01T10:00:00Z'
};

/**
 * Complex issue with all fields populated
 */
export const mockComplexIssue: RedmineIssue = {
  id: 1002,
  subject: 'Complex issue with all fields populated for comprehensive testing',
  description: 'This is a very detailed description of a complex issue that includes multiple paragraphs.\n\nIt has line breaks and extensive content that should be truncated in brief mode.\n\nThis description is intentionally long to test the truncation functionality and ensure that brief mode provides a concise summary while maintaining readability.',
  project: {
    id: 10,
    name: 'Test Project'
  },
  tracker: {
    id: 2,
    name: 'Feature'
  },
  status: {
    id: 3,
    name: 'In Progress'
  },
  priority: {
    id: 4,
    name: 'High'
  },
  author: {
    id: 1,
    name: 'Test Author'
  },
  assigned_to: {
    id: 2,
    name: 'Test Assignee'
  },
  category: {
    id: 5,
    name: 'Backend'
  },
  fixed_version: {
    id: 3,
    name: 'v2.0.0'
  },
  parent: {
    id: 1000
  },
  created_on: '2024-01-01T10:00:00Z',
  updated_on: '2024-01-15T14:30:00Z',
  start_date: '2024-01-02',
  due_date: '2024-01-31',
  done_ratio: 75,
  estimated_hours: 40.0,
  spent_hours: 30.0,
  custom_fields: [
    {
      id: 1,
      name: 'Environment',
      value: 'Production'
    },
    {
      id: 2,
      name: 'Browser',
      value: 'Chrome'
    },
    {
      id: 3,
      name: 'Tags',
      value: ['urgent', 'customer-facing', 'security']
    },
    {
      id: 4,
      name: 'Empty Field',
      value: ''
    },
    {
      id: 5,
      name: 'Null Field',
      value: null
    }
  ],
  journals: [
    {
      id: 101,
      user: {
        id: 1,
        name: 'Test Author'
      },
      notes: 'Initial issue creation with detailed analysis of the problem.',
      created_on: '2024-01-01T10:00:00Z',
      details: []
    },
    {
      id: 102,
      user: {
        id: 2,
        name: 'Test Assignee'
      },
      notes: 'Assigned to myself and started investigation. Found potential root cause in the authentication module.',
      created_on: '2024-01-02T09:00:00Z',
      details: [
        {
          property: 'assigned_to',
          name: 'Assignee',
          old_value: null,
          new_value: 'Test Assignee'
        },
        {
          property: 'status',
          name: 'Status',
          old_value: 'New',
          new_value: 'In Progress'
        }
      ]
    },
    {
      id: 103,
      user: {
        id: 3,
        name: 'Test Reviewer'
      },
      notes: 'Reviewed the proposed solution. Looks good but needs additional testing in staging environment.',
      created_on: '2024-01-10T16:30:00Z',
      details: [
        {
          property: 'done_ratio',
          name: 'Progress',
          old_value: '50',
          new_value: '75'
        }
      ]
    }
  ],
  relations: [
    {
      id: 301,
      issue_id: 1002,
      issue_to_id: 1003,
      relation_type: 'blocks',
      delay: null
    }
  ]
};

/**
 * Issue with custom fields only (for testing custom field filtering)
 */
export const mockIssueWithCustomFields: RedmineIssue = {
  id: 1003,
  subject: 'Issue with extensive custom fields',
  description: 'Testing custom field handling in brief mode.',
  project: {
    id: 10,
    name: 'Test Project'
  },
  tracker: {
    id: 1,
    name: 'Bug'
  },
  status: {
    id: 1,
    name: 'New'
  },
  priority: {
    id: 2,
    name: 'Normal'
  },
  author: {
    id: 1,
    name: 'Test Author'
  },
  done_ratio: 0,
  created_on: '2024-01-01T10:00:00Z',
  updated_on: '2024-01-01T10:00:00Z',
  custom_fields: [
    {
      id: 1,
      name: 'Priority Level',
      value: 'Critical'
    },
    {
      id: 2,
      name: 'Component',
      value: 'Authentication'
    },
    {
      id: 3,
      name: 'Affected Versions',
      value: ['v1.0.0', 'v1.1.0', 'v1.2.0']
    },
    {
      id: 4,
      name: 'Empty String Field',
      value: ''
    },
    {
      id: 5,
      name: 'Whitespace Field',
      value: '   '
    },
    {
      id: 6,
      name: 'Null Field',
      value: null
    },
    {
      id: 7,
      name: 'Empty Array Field',
      value: []
    },
    {
      id: 8,
      name: 'Long Text Field',
      value: 'This is a very long custom field value that should be truncated when displayed in brief mode to maintain readability and prevent information overload.'
    }
  ]
};

/**
 * Issue with extensive journals (for testing journal limiting)
 */
export const mockIssueWithManyJournals: RedmineIssue = {
  id: 1004,
  subject: 'Issue with many journal entries',
  description: 'Testing journal entry limiting in brief mode.',
  project: {
    id: 10,
    name: 'Test Project'
  },
  tracker: {
    id: 2,
    name: 'Feature'
  },
  status: {
    id: 5,
    name: 'Closed'
  },
  priority: {
    id: 2,
    name: 'Normal'
  },
  author: {
    id: 1,
    name: 'Test Author'
  },
  done_ratio: 100,
  created_on: '2024-01-01T10:00:00Z',
  updated_on: '2024-01-20T16:00:00Z',
  journals: [
    {
      id: 401,
      user: { id: 1, name: 'User 1' },
      notes: 'First journal entry with initial thoughts and analysis.',
      created_on: '2024-01-01T10:00:00Z',
      details: []
    },
    {
      id: 402,
      user: { id: 2, name: 'User 2' },
      notes: 'Second entry with additional research findings.',
      created_on: '2024-01-02T11:00:00Z',
      details: []
    },
    {
      id: 403,
      user: { id: 3, name: 'User 3' },
      notes: 'Third entry with proposed solution approach.',
      created_on: '2024-01-03T12:00:00Z',
      details: []
    },
    {
      id: 404,
      user: { id: 1, name: 'User 1' },
      notes: 'Fourth entry with implementation details.',
      created_on: '2024-01-04T13:00:00Z',
      details: []
    },
    {
      id: 405,
      user: { id: 2, name: 'User 2' },
      notes: 'Fifth entry with testing results and feedback.',
      created_on: '2024-01-05T14:00:00Z',
      details: []
    },
    {
      id: 406,
      user: { id: 4, name: 'User 4' },
      notes: 'Sixth entry with final review and approval.',
      created_on: '2024-01-06T15:00:00Z',
      details: [
        {
          property: 'status',
          name: 'Status',
          old_value: 'In Progress',
          new_value: 'Closed'
        }
      ]
    }
  ]
};

/**
 * Minimal issue for testing edge cases
 */
export const mockMinimalIssue: RedmineIssue = {
  id: 1005,
  subject: 'Minimal issue',
  project: {
    id: 10,
    name: 'Test Project'
  },
  tracker: {
    id: 1,
    name: 'Bug'
  },
  status: {
    id: 1,
    name: 'New'
  },
  priority: {
    id: 2,
    name: 'Normal'
  },
  author: {
    id: 1,
    name: 'Test Author'
  },
  done_ratio: 0,
  created_on: '2024-01-01T10:00:00Z',
  updated_on: '2024-01-01T10:00:00Z'
};
