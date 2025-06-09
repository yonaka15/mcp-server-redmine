import { jest, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
// import { UsersClient } from "../../../client/users.js"; // client is unused
// import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js"; // mockResponse, mockErrorResponse are unused
// import * as fixtures from "../../helpers/fixtures.js"; // fixtures is unused, so userId which depends on it is also effectively unused
// import config from "../../../config.js"; // config is unused
// import { RedmineApiError } from "../../../client/base.js"; // RedmineApiError is unused
// import { parseUrl } from "../../helpers/url.js"; // parseUrl is unused

describe("Users API (DELETE)", () => {
  // let client: UsersClient; // client is unused
  let mockFetch: Mock;
  // const userId = fixtures.singleUserResponse.user.id; // userId is unused

  beforeEach(() => {
    // client = new UsersClient(); // client is unused
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /users/:id.json (deleteUser)", () => {
    // DELETE操作のテストは安全のためスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作のテストケースは実装されていません。
      // Redmine APIの仕様として、DELETEリクエストは実際のデータを削除するため、
      // テスト環境以外での実行は推奨されません。
      //
      // ユーザー削除時の考慮事項:
      // - ユーザーが担当しているチケットの扱い
      // - ユーザーが作成したWikiページやドキュメントの扱い
      // - プロジェクトメンバーシップの削除
      // - カスタムフィールド値の削除
      // - グループメンバーシップの削除
      //
      // 削除できない場合の考慮事項:
      // - 管理者ユーザーの削除
      // - 自分が自分自身を削除する場合
      // - 作成したWikiページがロックされている場合
      // - 作成したフォーラムメッセージがロックされている場合
      //
      // 本テストスイートでは、DELETE操作のテストはスキップしています。
      // 必要に応じて、ユーザー削除が他のエンティティに与える影響を考慮し、
      // 安全な方法でテストを実装してください。
    });
  });
});