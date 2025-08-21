 import {
  HandlerContext,
  ToolResponse,
  asNumber,
  extractPaginationParams,
  ValidationError,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import { parseFormatOptions } from "../formatters/format-options.js";
import type {
  RedmineIssueCreate,
  RedmineIssueUpdate,
  IssueListParams,
} from "../lib/types/index.js";
// import {
//   ISSUE_LIST_TOOL, 
//   ISSUE_CREATE_TOOL, 
//   ISSUE_UPDATE_TOOL, 
//   ISSUE_DELETE_TOOL, 
//   ISSUE_ADD_WATCHER_TOOL, 
//   ISSUE_REMOVE_WATCHER_TOOL 
// } from '../tools/issues.js'; // Removed unused imports
// import { IssueQuerySchema } from '../lib/types/issues/schema.js'; // Removed unused import

/**
 * Builds Redmine API filter parameters for text filtering
 * Generates the f[], op[], and v[] parameters required by Redmine's filter API
 * 
 * @param textFilters Object containing text filter values
 * @returns Record of filter parameters to add to the API query
 */
function buildTextFilterParams(textFilters: {
  subject_filter?: string;
  description_filter?: string;
  notes_filter?: string;
}): Record<string, string | string[]> {
  const filterParams: Record<string, string | string[]> = {};
  const activeFilters: string[] = [];
  
  // TODO Phase 2: Add operator support (contains, equals, starts_with, regex)
  // TODO Phase 3: Implement flexible filter array system matching Redmine UI
  // TODO Phase 4: Add custom field filtering support (cf_123 format)
  
  // Subject filter: f[]=subject&op[subject]=~&v[subject][]=value
  if (textFilters.subject_filter && textFilters.subject_filter.trim() !== '') {
    activeFilters.push('subject');
    filterParams['op[subject]'] = '~'; // Contains operator
    filterParams['v[subject][]'] = textFilters.subject_filter;
  }
  
  // Description filter: f[]=description&op[description]=~&v[description][]=value
  if (textFilters.description_filter && textFilters.description_filter.trim() !== '') {
    activeFilters.push('description');
    filterParams['op[description]'] = '~';
    filterParams['v[description][]'] = textFilters.description_filter;
  }
  
  // Notes filter: f[]=notes&op[notes]=~&v[notes][]=value
  if (textFilters.notes_filter && textFilters.notes_filter.trim() !== '') {
    activeFilters.push('notes');
    filterParams['op[notes]'] = '~';
    filterParams['v[notes][]'] = textFilters.notes_filter;
  }
  
  // Set the f[] parameter as a comma-separated string for Redmine API
  if (activeFilters.length > 0) {
    filterParams['f[]'] = activeFilters.join(',');
  }
  
  return filterParams;
}

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
        if ('parent_id' in argsObj) params.parent_id = asNumber(argsObj.parent_id);

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

        // Handle text filters
        if ('subject_filter' in argsObj) params.subject_filter = String(argsObj.subject_filter);
        if ('description_filter' in argsObj) params.description_filter = String(argsObj.description_filter);
        if ('notes_filter' in argsObj) params.notes_filter = String(argsObj.notes_filter);

        // Build text filter parameters for Redmine API
        const textFilters = {
          subject_filter: params.subject_filter,
          description_filter: params.description_filter,
          notes_filter: params.notes_filter,
        };
        const textFilterParams = buildTextFilterParams(textFilters);

        // Merge text filter parameters with existing params
        const finalParams = { ...params, ...textFilterParams };

        const issues = await client.issues.getIssues(finalParams);
        
        // Parse formatting options
        const formatOptions = parseFormatOptions(argsObj);
        
        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssues(issues, formatOptions),
            }
          ],
          isError: false,
        };
      } catch (error) {
        // Handle validation errors specifically
        // const isValidationError = error instanceof ValidationError; // Removed unused variable
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
     * Gets a specific issue by ID
     */
    get_issue: async (args: unknown): Promise<ToolResponse> => {
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
        
        // Handle optional include parameter
        const params = 'include' in argsObj ? { include: String(argsObj.include) } : undefined;

        const response = await client.issues.getIssue(id, params);
        
        // Parse formatting options
        const formatOptions = parseFormatOptions(argsObj);
        
        return {
          content: [
            {
              type: "text",
              text: formatters.formatIssue(response.issue, formatOptions),
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
        if ('custom_fields' in argsObj) params.custom_fields = argsObj.custom_fields as { id: number; value: string | string[]; }[];
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
        if ('custom_fields' in argsObj) updateParams.custom_fields = argsObj.custom_fields as { id: number; value: string | string[]; }[];
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
