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

// プロジェクト関連のレスポンス
export const projectListResponse = {
  projects: [
    {
      id: 1,
      name: "Test Project",
      identifier: "test-project",
      description: "Test project description",
      homepage: "http://example.com",
      status: 1,
      parent: { id: 2, name: "Parent Project" },
      created_on: "2025-01-01T00:00:00Z",
      updated_on: "2025-01-01T00:00:00Z",
      is_public: true,
      inherit_members: true,
      custom_fields: [
        { id: 1, name: "Custom Field 1", value: "1" }
      ],
      enabled_module_names: [
        "issue_tracking",
        "time_tracking",
        "wiki"
      ]
    }
  ],
  total_count: 1,
  offset: 0,
  limit: 25,
};

// プロジェクト詳細（include無し）
export const singleProjectResponse = {
  project: projectListResponse.projects[0]
};

// プロジェクト詳細（include付き）
export const singleProjectWithIncludesResponse = {
  project: {
    ...projectListResponse.projects[0],
    trackers: [
      { id: 1, name: "Bug" },
      { id: 2, name: "Feature" }
    ],
    issue_categories: [
      { id: 1, name: "Backend" },
      { id: 2, name: "Frontend" }
    ],
    time_entry_activities: [
      { id: 1, name: "Development", is_default: true, active: true },
      { id: 2, name: "Design", is_default: false, active: true }
    ],
    default_version: { id: 3, name: "2.0" },
    default_assignee: { id: 2, name: "John Smith" }
  }
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

// タイムエントリー関連のレスポンス
export const timeEntryListResponse = {
  time_entries: [
    {
      id: 1,
      project: { id: 1, name: "Test Project" },
      issue: { id: 1 },  // subject フィールドを削除
      user: { id: 1, name: "Test User" },
      activity: { id: 1, name: "Development" },
      hours: 2.5,
      comments: "Working on feature implementation",
      spent_on: "2025-01-06",
      created_on: "2025-01-06T10:00:00Z",
      updated_on: "2025-01-06T10:00:00Z",
      custom_fields: [
        { id: 1, name: "Location", value: "Office" }
      ]
    },
    {
      id: 2,
      project: { id: 1, name: "Test Project" },
      issue: { id: 2 },  // subject フィールドを削除
      user: { id: 1, name: "Test User" },
      activity: { id: 2, name: "Design" },
      hours: 1.5,
      comments: "UI design review",
      spent_on: "2025-01-06",
      created_on: "2025-01-06T14:00:00Z",
      updated_on: "2025-01-06T14:00:00Z",
      custom_fields: [
        { id: 1, name: "Location", value: "Remote" }
      ]
    }
  ],
  total_count: 2,
  offset: 0,
  limit: 25
};

// 単一タイムエントリーのレスポンス
export const singleTimeEntryResponse = {
  time_entry: timeEntryListResponse.time_entries[0]
};

// ユーザー関連のレスポンス
export const userListResponse = {
  users: [
    {
      id: 1,
      login: "jsmith",
      firstname: "John",
      lastname: "Smith",
      mail: "john@example.com",
      created_on: "2025-01-01T00:00:00Z",
      updated_on: "2025-01-01T00:00:00Z",
      last_login_on: "2025-01-06T10:00:00Z",
      passwd_changed_on: "2025-01-01T00:00:00Z",
      status: 1,
      api_key: "abcdef1234567890",
      avatar_url: null,
    },
    {
      id: 2,
      login: "mjohnson",
      firstname: "Mike",
      lastname: "Johnson",
      mail: "mike@example.com",
      created_on: "2025-01-02T00:00:00Z",
      updated_on: "2025-01-02T00:00:00Z",
      last_login_on: "2025-01-06T09:00:00Z",
      passwd_changed_on: "2025-01-02T00:00:00Z",
      status: 1,
      api_key: "0987654321fedcba",
      avatar_url: null,
    }
  ],
  total_count: 2,
  offset: 0,
  limit: 25
};

// ユーザー詳細（基本情報）
export const singleUserResponse = {
  user: userListResponse.users[0]
};

// ユーザー詳細（include付き）
export const singleUserWithIncludesResponse = {
  user: {
    ...userListResponse.users[0],
    custom_fields: [
      { id: 1, name: "Department", value: "Engineering" },
      { id: 2, name: "Location", value: "Tokyo" }
    ],
    memberships: [
      {
        project: { id: 1, name: "Test Project" },
        roles: [
          { id: 1, name: "Developer" },
          { id: 2, name: "Tester" }
        ]
      }
    ],
    groups: [
      { id: 1, name: "Development Team" },
      { id: 2, name: "Quality Assurance" }
    ]
  }
};