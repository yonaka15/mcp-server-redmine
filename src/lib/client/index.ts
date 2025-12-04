import { IssuesClient } from "./issues.js";
import { ProjectsClient } from "./projects.js";
import { TimeEntriesClient } from "./time_entries.js";
import { UsersClient } from "./users.js";
import { IssueStatusesClient } from "./issue_statuses.js";
import { TrackersClient } from "./trackers.js";
import { EnumerationsClient } from "./enumerations.js";
import { VersionsClient } from "./versions.js";
import { MembershipsClient } from "./memberships.js";
import { RolesClient } from "./roles.js";
import { IssueCategoriesClient } from "./issue_categories.js";
import { AttachmentsClient } from "./attachments.js";
import { RedmineApiError } from "./base.js";

/**
 * Redmine API Client
 */
export class RedmineClient {
  public readonly issues: IssuesClient;
  public readonly projects: ProjectsClient;
  public readonly timeEntries: TimeEntriesClient;
  public readonly users: UsersClient;
  public readonly issueStatuses: IssueStatusesClient;
  public readonly trackers: TrackersClient;
  public readonly enumerations: EnumerationsClient;
  public readonly versions: VersionsClient;
  public readonly memberships: MembershipsClient;
  public readonly roles: RolesClient;
  public readonly issueCategories: IssueCategoriesClient;
  public readonly attachments: AttachmentsClient;

  constructor() {
    this.issues = new IssuesClient();
    this.projects = new ProjectsClient();
    this.timeEntries = new TimeEntriesClient();
    this.users = new UsersClient();
    this.issueStatuses = new IssueStatusesClient();
    this.trackers = new TrackersClient();
    this.enumerations = new EnumerationsClient();
    this.versions = new VersionsClient();
    this.memberships = new MembershipsClient();
    this.roles = new RolesClient();
    this.issueCategories = new IssueCategoriesClient();
    this.attachments = new AttachmentsClient();
  }
}

// Singleton client instance
export const redmineClient = new RedmineClient();

export { RedmineApiError };