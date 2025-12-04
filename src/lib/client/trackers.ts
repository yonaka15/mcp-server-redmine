import { BaseClient } from "./base.js";
import { RedmineTrackersResponse } from "../types/index.js";

export class TrackersClient extends BaseClient {
  /**
   * Get list of all trackers
   * GET /trackers.json
   */
  async getTrackers(): Promise<RedmineTrackersResponse> {
    return await this.performRequest<RedmineTrackersResponse>(
      "trackers.json"
    );
  }
}
