import {
  HandlerContext,
  ToolResponse,
  ValidationError,
  asNumber,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import type { RedmineVersionCreate, RedmineVersionUpdate } from "../lib/types/index.js";

/**
 * Creates handlers for version-related operations
 */
export function createVersionsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Lists versions for a project
     */
    list_versions: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }

        const projectId = String(argsObj.project_id);
        const response = await client.versions.getVersions(projectId);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatVersions(response.versions),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Shows a specific version
     */
    show_version: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.versions.getVersion(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatVersion(response.version),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Creates a new version
     */
    create_version: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("project_id" in argsObj)) {
          throw new ValidationError("project_id is required");
        }
        if (!("name" in argsObj)) {
          throw new ValidationError("name is required");
        }

        const projectId = String(argsObj.project_id);
        const versionData: RedmineVersionCreate = {
          name: String(argsObj.name),
        };

        if ("status" in argsObj) {
          versionData.status = String(argsObj.status) as "open" | "locked" | "closed";
        }
        if ("sharing" in argsObj) {
          versionData.sharing = String(argsObj.sharing) as "none" | "descendants" | "hierarchy" | "tree" | "system";
        }
        if ("due_date" in argsObj) {
          versionData.due_date = String(argsObj.due_date);
        }
        if ("description" in argsObj) {
          versionData.description = String(argsObj.description);
        }
        if ("wiki_page_title" in argsObj) {
          versionData.wiki_page_title = String(argsObj.wiki_page_title);
        }

        const response = await client.versions.createVersion(projectId, versionData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatVersionResult(response.version, "created"),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Updates a version
     */
    update_version: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const versionData: RedmineVersionUpdate = {};

        if ("name" in argsObj) {
          versionData.name = String(argsObj.name);
        }
        if ("status" in argsObj) {
          versionData.status = String(argsObj.status) as "open" | "locked" | "closed";
        }
        if ("sharing" in argsObj) {
          versionData.sharing = String(argsObj.sharing) as "none" | "descendants" | "hierarchy" | "tree" | "system";
        }
        if ("due_date" in argsObj) {
          versionData.due_date = String(argsObj.due_date);
        }
        if ("description" in argsObj) {
          versionData.description = String(argsObj.description);
        }
        if ("wiki_page_title" in argsObj) {
          versionData.wiki_page_title = String(argsObj.wiki_page_title);
        }

        const response = await client.versions.updateVersion(id, versionData);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatVersionResult(response.version, "updated"),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },

    /**
     * Deletes a version
     */
    delete_version: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;
        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        await client.versions.deleteVersion(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatVersionDeleted(id),
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : String(error),
            },
          ],
          isError: true,
        };
      }
    },
  };
}
