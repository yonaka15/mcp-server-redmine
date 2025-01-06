export const issueListResponse = {
  issues: [
    {
      id: 1,
      project: { id: 1, name: "Test Project" },
      tracker: { id: 1, name: "Task" },
      status: { id: 1, name: "New", is_closed: false },
      priority: { id: 2, name: "Normal" },
      author: { id: 1, name: "Test User" },
      assigned_to: { id: 2, name: "Test Manager" },
      subject: "Test issue",
      description: "Test description",
      start_date: "2025-01-01",
      due_date: "2025-01-31",
      done_ratio: 0,
      is_private: false,
      estimated_hours: null,
      total_estimated_hours: null,
      spent_hours: 0,
      total_spent_hours: 0,
      custom_fields: [
        { id: 1, name: "Custom Field 1", value: "1" },
        { id: 2, name: "Custom Field 2", value: "" }
      ],
      created_on: "2025-01-01T00:00:00Z",
      updated_on: "2025-01-01T00:00:00Z",
      closed_on: null,
    }
  ],
  total_count: 1,
  offset: 0,
  limit: 25,
};

export const singleIssueResponse = {
  issue: issueListResponse.issues[0],
};

// POSTリクエスト用のテストデータ
export const issueCreateData = {
  invalidIssue: {
    project_id: 1,
    priority_id: 2
    // subject is missing (required)
  },
  nonExistentProject: {
    project_id: 999,
    subject: "Test issue",
    priority_id: 2
  },
  normalIssue: {
    project_id: 1,
    subject: "Test issue",
    priority_id: 2
  }
} as const;