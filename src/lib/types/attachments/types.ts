// Attachment resource types

/**
 * Represents an attachment in Redmine
 */
export interface RedmineAttachment {
  id: number;
  filename: string;
  filesize: number;
  content_type: string;
  description?: string;
  content_url: string;
  thumbnail_url?: string;
  author: {
    id: number;
    name: string;
  };
  created_on: string;
}

/**
 * Response from upload endpoint
 */
export interface RedmineUploadResponse {
  upload: {
    token: string;
  };
}

/**
 * Attachment to be included when creating/updating an issue
 */
export interface RedmineAttachmentUpload {
  token: string;
  filename: string;
  content_type?: string;
  description?: string;
}

/**
 * Response when getting a single attachment
 */
export interface RedmineAttachmentResponse {
  attachment: RedmineAttachment;
}

/**
 * Parameters for updating an attachment
 */
export interface RedmineAttachmentUpdate {
  filename?: string;
  description?: string;
}
