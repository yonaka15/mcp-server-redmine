import type {
  RedmineAttachment,
  RedmineUploadResponse,
} from "../lib/types/attachments/index.js";

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) {
    return "";
  }
  return unsafe
    .replace(/[&]/g, "&amp;")
    .replace(/[<]/g, "&lt;")
    .replace(/[>]/g, "&gt;")
    .replace(/["]/g, "&quot;")
    .replace(/[']/g, "&apos;");
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format a single attachment
 */
export function formatAttachment(attachment: RedmineAttachment): string {
  return `<attachment>
  <id>${attachment.id}</id>
  <filename>${escapeXml(attachment.filename)}</filename>
  <filesize>${formatFileSize(attachment.filesize)}</filesize>
  <content_type>${escapeXml(attachment.content_type)}</content_type>
  ${attachment.description ? `<description>${escapeXml(attachment.description)}</description>` : ""}
  <author id="${attachment.author.id}">${escapeXml(attachment.author.name)}</author>
  <created_on>${attachment.created_on}</created_on>
  <content_url>${escapeXml(attachment.content_url)}</content_url>
  ${attachment.thumbnail_url ? `<thumbnail_url>${escapeXml(attachment.thumbnail_url)}</thumbnail_url>` : ""}
</attachment>`;
}

/**
 * Format list of attachments
 */
export function formatAttachments(attachments: RedmineAttachment[]): string {
  if (!attachments || attachments.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<attachments type="array" count="0" />`;
  }

  const formatted = attachments.map(formatAttachment).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<attachments type="array" count="${attachments.length}">
${formatted}
</attachments>`;
}

/**
 * Format upload response
 */
export function formatUploadResponse(
  response: RedmineUploadResponse,
  filename: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<upload>
  <status>success</status>
  <message>File "${escapeXml(filename)}" uploaded successfully</message>
  <token>${escapeXml(response.upload.token)}</token>
  <usage>Use this token with create_issue or update_issue to attach the file:
    {
      "uploads": [
        {
          "token": "${escapeXml(response.upload.token)}",
          "filename": "${escapeXml(filename)}",
          "content_type": "application/octet-stream"
        }
      ]
    }
  </usage>
</upload>`;
}

/**
 * Format download response
 */
export function formatDownloadResponse(
  attachment: RedmineAttachment,
  base64Content: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<download>
  <status>success</status>
  <attachment>
    <id>${attachment.id}</id>
    <filename>${escapeXml(attachment.filename)}</filename>
    <filesize>${formatFileSize(attachment.filesize)}</filesize>
    <content_type>${escapeXml(attachment.content_type)}</content_type>
  </attachment>
  <content_base64>${base64Content}</content_base64>
</download>`;
}
