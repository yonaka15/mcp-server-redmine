import {
  HandlerContext,
  ToolResponse,
  asNumber,
  ValidationError,
} from "./types.js";
import * as formatters from "../formatters/index.js";
import { readFile } from "fs/promises";
import { basename } from "path";

/**
 * Creates handlers for attachment-related operations
 * @param context Handler context containing the Redmine client and config
 * @returns Object containing all attachment-related handlers
 */
export function createAttachmentsHandlers(context: HandlerContext) {
  const { client } = context;

  return {
    /**
     * Upload a file to Redmine
     * Returns a token that can be used to attach the file to an issue
     */
    upload_file: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("filename" in argsObj)) {
          throw new ValidationError("filename is required");
        }
        if (!("content_base64" in argsObj)) {
          throw new ValidationError("content_base64 is required");
        }

        const filename = String(argsObj.filename);
        const contentBase64 = String(argsObj.content_base64);

        const response = await client.attachments.uploadFile(
          filename,
          contentBase64
        );

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUploadResponse(response, filename),
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
     * Get attachment details by ID
     */
    get_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const response = await client.attachments.getAttachment(id);

        return {
          content: [
            {
              type: "text",
              text: formatters.formatAttachment(response.attachment),
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
     * Update an attachment (filename and/or description)
     */
    update_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        const updateData: { filename?: string; description?: string } = {};

        if ("filename" in argsObj) {
          updateData.filename = String(argsObj.filename);
        }
        if ("description" in argsObj) {
          updateData.description = String(argsObj.description);
        }

        if (Object.keys(updateData).length === 0) {
          throw new ValidationError(
            "At least one of filename or description must be provided"
          );
        }

        await client.attachments.updateAttachment(id, updateData);

        return {
          content: [
            {
              type: "text",
              text: `Attachment #${id} updated successfully`,
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
     * Delete an attachment
     */
    delete_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);
        await client.attachments.deleteAttachment(id);

        return {
          content: [
            {
              type: "text",
              text: `Attachment #${id} deleted successfully`,
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
     * Download an attachment file content
     */
    download_attachment: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("id" in argsObj)) {
          throw new ValidationError("id is required");
        }

        const id = asNumber(argsObj.id);

        // First get attachment details
        const attachmentResponse = await client.attachments.getAttachment(id);
        const attachment = attachmentResponse.attachment;

        // Download the file content
        const fileContent = await client.attachments.downloadAttachment(
          attachment
        );

        // Convert to base64
        const base64Content = fileContent.toString("base64");

        return {
          content: [
            {
              type: "text",
              text: formatters.formatDownloadResponse(attachment, base64Content),
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
     * Upload a file from local filesystem path
     * Reads the file, converts to base64, and uploads to Redmine
     */
    upload_file_from_path: async (args: unknown): Promise<ToolResponse> => {
      try {
        if (typeof args !== "object" || args === null) {
          throw new ValidationError("Arguments must be an object");
        }

        const argsObj = args as Record<string, unknown>;

        if (!("file_path" in argsObj)) {
          throw new ValidationError("file_path is required");
        }

        const filePath = String(argsObj.file_path);

        // Use provided filename or extract from path
        const filename = "filename" in argsObj
          ? String(argsObj.filename)
          : basename(filePath);

        // Read file from filesystem
        const fileBuffer = await readFile(filePath);

        // Upload to Redmine
        const response = await client.attachments.uploadFile(
          filename,
          fileBuffer
        );

        return {
          content: [
            {
              type: "text",
              text: formatters.formatUploadResponse(response, filename),
            },
          ],
          isError: false,
        };
      } catch (error) {
        // Handle file not found error specifically
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
          return {
            content: [
              {
                type: "text",
                text: `File not found: ${(error as NodeJS.ErrnoException).path || 'unknown path'}`,
              },
            ],
            isError: true,
          };
        }

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
