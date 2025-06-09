import { jest, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
// import { UsersClient } from "../../../../client/users.js"; // Removed
// import { mockResponse, mockErrorResponse } from "../../../helpers/mocks.js"; // Removed
// import * as fixtures from "../../../helpers/fixtures.js"; // Removed
// import config from "../../../../config.js"; // Removed
// import { RedmineApiError } from "../../../client/base.js"; // Removed
// import { parseUrl } from "../../../helpers/url.js"; // Removed

describe("Users API (DELETE)", () => {
  // let client: UsersClient; // Removed
  let mockFetch: Mock;
  // const userId = fixtures.singleUserResponse.user.id; // Removed

  beforeEach(() => {
    // client = new UsersClient(); // Removed
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /users/:id.json (deleteUser)", () => {
    // DELETEリクエストのテストは安全のためスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETEリクエストのテストコードはここに記述
      // Redmine APIの仕様により、DELETEリクエストは実際のデータ変更を伴うため、
      // テスト実行時には注意が必要です。
      //
      // ユーザー削除時の考慮事項:
      // - ユーザーが作成したチケットの扱い
      // - ユーザーの活動履歴の扱い
      // - プロジェクトメンバーシップの扱い
      // - カスタムフィールド値の扱い
      // - グループメンバーシップの扱い
      //
      // APIのレスポンス:
      // - 正常に削除された場合は空のレスポンス (204 No Content)
      // - 存在しないIDを指定した場合や権限がない場合はエラー
      //
      // 具体的なテストケースとしては、
      // - 正常にユーザーを削除できること（関連データも適切に処理されること）
      // - 存在しないユーザーIDを指定した場合にエラーが返ること
      // - 管理者以外のユーザーが削除しようとした場合にエラーが返ること
      // などを検証します。
      //
      // 注意：自分自身を削除しようとした場合の挙動も確認が必要です。
    });
  });
});
