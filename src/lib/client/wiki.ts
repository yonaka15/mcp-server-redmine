import { BaseClient, RedmineApiError } from "./base.js";
import { ZodError } from "zod";
import {
  RedmineWikiPagesListResponseSchema,
  RedmineWikiPageResponseSchema,
  RedmineWikiPageHistoryResponseSchema,
  RedmineWikiPagesListResponse,
  RedmineWikiPageResponse,
  RedmineWikiPageHistoryResponse,
} from "../types/wiki/index.js";

export class WikiClient extends BaseClient {
  async listWikiPages(projectId: string | number): Promise<RedmineWikiPagesListResponse> {
    try {
      const response = await this.performRequest<RedmineWikiPagesListResponse>(
        `projects/${projectId}/wiki/index.json`
      );
      return RedmineWikiPagesListResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RedmineApiError(422, "Validation failed", [error.message]);
      }
      throw error;
    }
  }

  async getWikiPage(
    projectId: string | number,
    title: string,
    version?: number
  ): Promise<RedmineWikiPageResponse> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const versionSuffix = version !== undefined ? `/${version}` : "";
      const response = await this.performRequest<RedmineWikiPageResponse>(
        `projects/${projectId}/wiki/${encodedTitle}${versionSuffix}.json`
      );
      return RedmineWikiPageResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RedmineApiError(422, "Validation failed", [error.message]);
      }
      throw error;
    }
  }

  async listWikiHistory(
    projectId: string | number,
    title: string
  ): Promise<RedmineWikiPageHistoryResponse> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await this.performRequest<RedmineWikiPageHistoryResponse>(
        `projects/${projectId}/wiki/${encodedTitle}/history.json`
      );
      return RedmineWikiPageHistoryResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RedmineApiError(422, "Validation failed", [error.message]);
      }
      throw error;
    }
  }

  async createOrUpdateWikiPage(
    projectId: string | number,
    title: string,
    text: string,
    options?: { comments?: string; parent_title?: string }
  ): Promise<RedmineWikiPageResponse> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const body: Record<string, unknown> = {
        wiki_page: {
          text,
          ...(options?.comments ? { comments: options.comments } : {}),
          ...(options?.parent_title ? { parent: { title: options.parent_title } } : {}),
        },
      };

      const response = await this.performRequest<RedmineWikiPageResponse>(
        `projects/${projectId}/wiki/${encodedTitle}.json`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );

      return RedmineWikiPageResponseSchema.parse(response);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RedmineApiError(422, "Validation failed", [error.message]);
      }
      throw error;
    }
  }
}
