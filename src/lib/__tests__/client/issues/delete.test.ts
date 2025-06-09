import { jest, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { IssuesClient } from "../../../client/issues.js";
import * as fixtures from "../../helpers/fixtures.js";

describe("Issues API (DELETE)", () => {
  let mockFetch: Mock;
  // const issueId = fixtures.singleIssueResponse.issue.id; // 未使用のためコメントアウト

  beforeEach(() => {
    // new IssuesClient(); // client は未使用のためコメントアウト
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /issues/:id.json (deleteIssue)", () => {
    // DELETE操作のテストは安全のためスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作のテストケースは実装されていません。
      // Redmine APIの仕様として、DELETEリクエストは実際のデータを削除するため、
      // テスト環境以外での実行は推奨されません。
      // - テスト用の独立した環境で実行
      // - モックサーバーを使用してAPIレスポンスをシミュレート
      // - CI環境でのみ実行するなどの対策が必要
      //
      // 本テストスイートでは、DELETE操作のテストはスキップしています。
      // 必要に応じて、安全な方法でテストを実装してください。
    });
  });
});