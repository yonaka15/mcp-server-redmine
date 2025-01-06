import { IssuesClient } from "./issues.js";
import { ProjectsClient } from "./projects.js";
import { TimeEntriesClient } from "./time_entries.js";
import { RedmineApiError } from "./base.js";

/**
 * Redmine API クライアント
 */
export class RedmineClient {
  public readonly issues: IssuesClient;
  public readonly projects: ProjectsClient;
  public readonly timeEntries: TimeEntriesClient;

  constructor() {
    this.issues = new IssuesClient();
    this.projects = new ProjectsClient();
    this.timeEntries = new TimeEntriesClient();
  }
}

// クライアントのシングルトンインスタンス
export const redmineClient = new RedmineClient();

export { RedmineApiError };