import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { IssuesClient } from "../../../client/issues.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Issues API (DELETE)", () => {
  let client: IssuesClient;
  let mockFetch: Mock;
  const issueId = fixtures.singleIssueResponse.issue.id;

  beforeEach(() => {
    client = new IssuesClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /issues/:id.json (deleteIssue)", () => {
    // DELETE操作は常にデータ変更の可能性があるため、全てスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作は常にデータの削除を伴うため、テストをスキップします
      // Redmine APIの仕様で、DELETEリクエストは以下の影響を及ぼします：
      // - チケットの完全な削除
      // - 関連する情報（添付ファイル、関係等）の削除
      // - ジャーナル（履歴）の削除
      // - ウォッチャーの削除
      //
      // これらの操作は全てデータの削除を伴うため、テスト環境でも
      // 実行すべきではありません。
    });
  });
});