import { BaseClient } from "./base.js";
import {
  RedmineAttachment,
  RedmineAttachmentResponse,
  RedmineUploadResponse,
  RedmineAttachmentUpdate,
} from "../types/attachments/index.js";
import config from "../config.js";

/**
 * Redmine Attachments API Client
 */
export class AttachmentsClient extends BaseClient {
  /**
   * Get a specific attachment by ID
   * GET /attachments/:id.json
   */
  async getAttachment(id: number): Promise<RedmineAttachmentResponse> {
    return await this.performRequest<RedmineAttachmentResponse>(
      `attachments/${id}.json`
    );
  }

  /**
   * Update an attachment (filename and/or description)
   * PATCH /attachments/:id.json
   * Available since Redmine 3.4.0
   */
  async updateAttachment(
    id: number,
    data: RedmineAttachmentUpdate
  ): Promise<void> {
    await this.performRequest(`attachments/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify({ attachment: data }),
    });
  }

  /**
   * Delete an attachment
   * DELETE /attachments/:id.json
   */
  async deleteAttachment(id: number): Promise<void> {
    await this.performRequest(`attachments/${id}.json`, {
      method: "DELETE",
    });
  }

  /**
   * Upload a file to Redmine
   * POST /uploads.json
   * Returns a token that can be used to attach the file to an issue
   *
   * @param filename - The name of the file
   * @param fileContent - The file content as base64 string or Buffer
   * @returns Upload response with token
   */
  async uploadFile(
    filename: string,
    fileContent: string | Buffer
  ): Promise<RedmineUploadResponse> {
    const url = new URL(`uploads.json?filename=${encodeURIComponent(filename)}`, config.redmine.host);

    // Convert base64 string to Buffer if needed
    let body: Buffer;
    if (typeof fileContent === "string") {
      body = Buffer.from(fileContent, "base64");
    } else {
      body = fileContent;
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
        "Content-Type": "application/octet-stream",
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json() as RedmineUploadResponse;
  }

  /**
   * Download an attachment file
   * GET /attachments/download/:id/:filename
   * Returns the file content as Buffer
   */
  async downloadAttachment(attachment: RedmineAttachment): Promise<Buffer> {
    const response = await fetch(attachment.content_url, {
      headers: {
        "X-Redmine-API-Key": config.redmine.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
