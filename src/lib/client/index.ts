import { IssuesClient } from "./issues.js";
import { ProjectsClient } from "./projects.js";
import { TimeEntriesClient } from "./time_entries.js";
import { UsersClient } from "./users.js";
import { RedmineApiError } from "./base.js";

/**
 * Redmine API クライアント
 */
export class RedmineClient {
  public readonly issues: IssuesClient;
  public readonly projects: ProjectsClient;
  public readonly timeEntries: TimeEntriesClient;
  public readonly users: UsersClient;

  constructor() {
    this.issues = new IssuesClient();
    this.projects = new ProjectsClient();
    this.timeEntries = new TimeEntriesClient();
    this.users = new UsersClient();
  }
}

// クライアントのシングルトンインスタンス
export const redmineClient = new RedmineClient();

export { RedmineApiError };