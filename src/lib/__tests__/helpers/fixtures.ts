export const issueListResponse = {
  issues: [
    {
      id: 4326,
      project: { id: 1, name: "Redmine" },
      tracker: { id: 2, name: "Feature" },
      status: { id: 1, name: "New" },
      priority: { id: 4, name: "Normal" },
      author: { id: 10106, name: "John Smith" },
      subject: "Aggregate Multiple Issue Changes",
      description: "This is a test issue",
      start_date: "2023-01-01",
      due_date: null,
      done_ratio: 0,
      estimated_hours: 8,
      custom_fields: [
        { id: 1, name: "Resolution", value: "Fixed" }
      ],
      created_on: "2023-01-01T10:00:00Z",
      updated_on: "2023-01-02T15:00:00Z"
    }
  ],
  total_count: 1
};

export const singleIssueResponse = {
  issue: issueListResponse.issues[0]
};

export const errorResponse = {
  errors: ["Resource not found"]
};