export const fixtures = {
  issues: {
    single: {
      issue: {
        id: 1,
        project: { id: 1, name: "Test Project" },
        tracker: { id: 1, name: "Bug" },
        status: { id: 1, name: "New" },
        priority: { id: 2, name: "Normal" },
        author: { id: 1, name: "Test User" },
        subject: "Test issue",
        description: "This is a test issue",
        created_on: "2025-01-06T00:00:00Z",
        updated_on: "2025-01-06T00:00:00Z"
      }
    },
    list: {
      issues: [
        {
          id: 1,
          project: { id: 1, name: "Test Project" },
          tracker: { id: 1, name: "Bug" },
          status: { id: 1, name: "New" },
          priority: { id: 2, name: "Normal" },
          subject: "Test issue 1"
        },
        {
          id: 2,
          project: { id: 1, name: "Test Project" },
          tracker: { id: 2, name: "Feature" },
          status: { id: 2, name: "In Progress" },
          priority: { id: 3, name: "High" },
          subject: "Test issue 2"
        }
      ],
      total_count: 2,
      offset: 0,
      limit: 25
    }
  },
  projects: {
    single: {
      project: {
        id: 1,
        name: "Test Project",
        identifier: "test-project",
        description: "This is a test project",
        status: 1,
        created_on: "2025-01-06T00:00:00Z",
        updated_on: "2025-01-06T00:00:00Z"
      }
    },
    list: {
      projects: [
        {
          id: 1,
          name: "Test Project 1",
          identifier: "test-project-1",
          status: 1
        },
        {
          id: 2,
          name: "Test Project 2",
          identifier: "test-project-2",
          status: 1
        }
      ],
      total_count: 2,
      offset: 0,
      limit: 25
    }
  },
  timeEntries: {
    single: {
      time_entry: {
        id: 1,
        project: { id: 1, name: "Test Project" },
        issue: { id: 1, subject: "Test issue" },
        user: { id: 1, name: "Test User" },
        activity: { id: 1, name: "Development" },
        hours: 1.5,
        comments: "Test time entry",
        spent_on: "2025-01-06",
        created_on: "2025-01-06T00:00:00Z",
        updated_on: "2025-01-06T00:00:00Z"
      }
    },
    list: {
      time_entries: [
        {
          id: 1,
          project: { id: 1, name: "Test Project" },
          issue: { id: 1, subject: "Test issue" },
          user: { id: 1, name: "Test User" },
          hours: 1.5,
          spent_on: "2025-01-06"
        },
        {
          id: 2,
          project: { id: 1, name: "Test Project" },
          issue: { id: 2, subject: "Test issue 2" },
          user: { id: 1, name: "Test User" },
          hours: 2.0,
          spent_on: "2025-01-06"
        }
      ],
      total_count: 2,
      offset: 0,
      limit: 25
    }
  }
};