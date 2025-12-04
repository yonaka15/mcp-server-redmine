import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Upload a file to Redmine
 * First step: upload file to get a token
 */
export const ATTACHMENT_UPLOAD_TOOL: Tool = {
  name: "upload_file",
  description:
    "Upload a file to Redmine. " +
    "Returns an upload token that can be used to attach the file to an issue. " +
    "Use the returned token with create_issue or update_issue to attach the file. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      filename: {
        type: "string",
        description: "Name of the file (e.g., 'screenshot.png', 'document.pdf')",
      },
      content_base64: {
        type: "string",
        description: "File content encoded as base64 string",
      },
    },
    required: ["filename", "content_base64"],
  },
};

/**
 * Get attachment details
 */
export const ATTACHMENT_GET_TOOL: Tool = {
  name: "get_attachment",
  description:
    "Get details of a specific attachment by ID. " +
    "Returns filename, size, content type, author, and download URL. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Attachment ID",
      },
    },
    required: ["id"],
  },
};

/**
 * Update attachment (filename and/or description)
 */
export const ATTACHMENT_UPDATE_TOOL: Tool = {
  name: "update_attachment",
  description:
    "Update an attachment's filename or description. " +
    "Only specified fields will be changed. " +
    "Available since Redmine 3.4",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Attachment ID to update",
      },
      filename: {
        type: "string",
        description: "New filename for the attachment",
      },
      description: {
        type: "string",
        description: "New description for the attachment",
      },
    },
    required: ["id"],
  },
};

/**
 * Delete an attachment
 */
export const ATTACHMENT_DELETE_TOOL: Tool = {
  name: "delete_attachment",
  description:
    "Delete an attachment permanently. " +
    "This action cannot be undone. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Attachment ID to delete",
      },
    },
    required: ["id"],
  },
};

/**
 * Download attachment content
 */
export const ATTACHMENT_DOWNLOAD_TOOL: Tool = {
  name: "download_attachment",
  description:
    "Download an attachment file content. " +
    "Returns the file content as base64 encoded string. " +
    "Available since Redmine 1.3",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "number",
        description: "Attachment ID to download",
      },
    },
    required: ["id"],
  },
};

/**
 * Upload a file from local filesystem path
 */
export const ATTACHMENT_UPLOAD_FROM_PATH_TOOL: Tool = {
  name: "upload_file_from_path",
  description:
    "Upload a file from local file system path to Redmine. " +
    "Returns an upload token that can be used to attach the file to an issue. " +
    "Use the returned token with create_issue or update_issue to attach the file. " +
    "Available since Redmine 1.4",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Absolute path to the file on local file system (e.g., 'C:\\Users\\name\\screenshot.png' or '/home/user/document.pdf')",
      },
      filename: {
        type: "string",
        description: "Optional: Override the filename for the attachment (default: use original filename from path)",
      },
    },
    required: ["file_path"],
  },
};
