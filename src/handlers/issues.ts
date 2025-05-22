import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  HandlerContext,
  ToolResponse,
  asNumber,
  extractPaginationParams,
  ValidationError,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import type {
  RedmineIssueCreate,
  RedmineIssueUpdate,
  IssueListParams,
} from "../lib/types/index.js";
import { 
  ISSUE_LIST_TOOL, 
  ISSUE_CREATE_TOOL, 
  ISSUE_UPDATE_TOOL, 
  ISSUE_DELETE_TOOL, 
  ISSUE_ADD_WATCHER_TOOL, 
  ISSUE_REMOVE_WATCHER_TOOL 
} from '../tools/issues.js';
import { IssueQuerySchema } from '../lib/types/issues/schema.js';

/**
 * Creates handlers for issue-related operations
 * @param context Handler context containing the Redmine client and config
 * @returns Object containing all issue-related handlers
 */
export function createIssuesHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists issues with pagination and filters
     */
    list_issues: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input structure
        if (typeof args !== 'object' || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        // Extract and validate pagination parameters
        const argsObj = args as Record<string, unknown>;
        const { limit, offset } = extractPaginationParams(argsObj);

        // Construct parameters with type conversion
        const params: IssueListParams = {
          limit,
          offset,
        };

        // Add optional parameters with validation
        if ('sort' in argsObj) params.sort = String(argsObj.sort);
        if ('include' in argsObj) params.include = String(argsObj.include);
        if ('project_id' in argsObj) params.project_id = asNumber(argsObj.project_id);
        if ('issue_id' in argsObj) params.issue_id = asNumber(argsObj.issue_id);
        if ('subproject_id' in argsObj) params.subproject_id = String(argsObj.subproject_id);
        if ('tracker_id' in argsObj) params.tracker_id = asNumber(argsObj.tracker_id);

        // Handle status_id special values
        if ('status_id' in argsObj) {
          const statusId = String(argsObj.status_id);
          if (!["open", "closed", "*"].includes(statusId)) {
            params.status_id = asNumber(argsObj.status_id);
          } else {
            params.status_id = statusId as "open" | "closed" | "*";
          }
        }

        // Handle assigned_to_id special value
        if ('assigned_to_id' in argsObj) {
          if (argsObj.assigned_to_id === "me") {
            params.assigned_to_id = "me";
          } else {
            params.assigned_to_id = asNumber(argsObj.assigned_to_id);
          }
        }

        // Handle date filters
        if ('created_on' in argsObj) params.created_on = String(argsObj.created_on);
        if ('updated_on' in argsObj) params.updated_on = String(argsObj.updated_on);

        // Handle custom fields (cf_X parameters)
        for (const [key, value] of Object.entries(argsObj)) {
          if (key.startsWith("cf_")) {
            params[key as `cf_${number}`] = String(value);
          }
        }

        const issues = await client.issues.getIssues(params);
        
        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssues(issues),
            }
          ],
          isError: false,
        };
      } catch (error) {
        // Handle validation errors specifically
        const isValidationError = error instanceof ValidationError;
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    /**
     * Creates a new issue
     */
    create_issue: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input structure
        if (typeof args !== 'object' || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        // Validate required fields
        if (!('project_id' in argsObj)) {
          throw new ValidationError("project_id is required");
        }
        if (!('subject' in argsObj)) {
          throw new ValidationError("subject is required");
        }

        // Construct issue creation parameters
        const params: RedmineIssueCreate = {
          project_id: asNumber(argsObj.project_id),
          subject: String(argsObj.subject),
        };

        // Add optional parameters
        if ('tracker_id' in argsObj) params.tracker_id = asNumber(argsObj.tracker_id);
        if ('status_id' in argsObj) params.status_id = asNumber(argsObj.status_id);
        if ('priority_id' in argsObj) params.priority_id = asNumber(argsObj.priority_id);
        if ('description' in argsObj) params.description = String(argsObj.description);
        if ('category_id' in argsObj) params.category_id = asNumber(argsObj.category_id);
        if ('fixed_version_id' in argsObj) params.fixed_version_id = asNumber(argsObj.fixed_version_id);
        if ('assigned_to_id' in argsObj) params.assigned_to_id = asNumber(argsObj.assigned_to_id);
        if ('parent_issue_id' in argsObj) params.parent_issue_id = asNumber(argsObj.parent_issue_id);
        if ('custom_fields' in argsObj) params.custom_fields = argsObj.custom_fields as any[];
        if ('watcher_user_ids' in argsObj) params.watcher_user_ids = (argsObj.watcher_user_ids as number[]);
        if ('is_private' in argsObj) params.is_private = Boolean(argsObj.is_private);
        if ('estimated_hours' in argsObj) params.estimated_hours = asNumber(argsObj.estimated_hours);
        if ('start_date' in argsObj) params.start_date = String(argsObj.start_date);
        if ('due_date' in argsObj) params.due_date = String(argsObj.due_date);

        const response = await client.issues.createIssue(params);
        
        return {
          content: [
            {
              type: "text",
              text: `Issue #${response.issue.id} created successfully`,
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    /**
     * Updates an existing issue
     */
    update_issue: async (args: unknown): Promise<ToolResponse> => {
      try {
        // Validate input structure
        if (typeof args !== 'object' || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        // Validate required fields
        if (!('id' in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);

        // Construct issue update parameters
        const updateParams: RedmineIssueUpdate = {};

        // Add optional parameters
        if ('project_id' in argsObj) updateParams.project_id = asNumber(argsObj.project_id);
        if ('tracker_id' in argsObj) updateParams.tracker_id = asNumber(argsObj.tracker_id);
        if ('status_id' in argsObj) updateParams.status_id = asNumber(argsObj.status_id);
        if ('priority_id' in argsObj) updateParams.priority_id = asNumber(argsObj.priority_id);
        if ('subject' in argsObj) updateParams.subject = String(argsObj.subject);
        if ('description' in argsObj) updateParams.description = String(argsObj.description);
        if ('category_id' in argsObj) updateParams.category_id = asNumber(argsObj.category_id);
        if ('fixed_version_id' in argsObj) updateParams.fixed_version_id = asNumber(argsObj.fixed_version_id);
        if ('assigned_to_id' in argsObj) updateParams.assigned_to_id = asNumber(argsObj.assigned_to_id);
        if ('parent_issue_id' in argsObj) updateParams.parent_issue_id = asNumber(argsObj.parent_issue_id);
        if ('custom_fields' in argsObj) updateParams.custom_fields = argsObj.custom_fields as any[];
        if ('notes' in argsObj) updateParams.notes = String(argsObj.notes);
        if ('private_notes' in argsObj) updateParams.private_notes = Boolean(argsObj.private_notes);
        if ('is_private' in argsObj) updateParams.is_private = Boolean(argsObj.is_private);
        if ('estimated_hours' in argsObj) updateParams.estimated_hours = asNumber(argsObj.estimated_hours);
        if ('start_date' in argsObj) updateParams.start_date = String(argsObj.start_date);
        if ('due_date' in argsObj) updateParams.due_date = String(argsObj.due_date);

        await client.issues.updateIssue(id, updateParams);
        
        return {
          content: [
            {
              type: "text",
              text: `Issue #${id} updated successfully`,
            }
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            }
          ],
          isError: true,
        };
      }
    },

    // ... rest of the handlers unchanged ...
  };
}