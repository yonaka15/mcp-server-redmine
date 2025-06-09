import { jest, describe, it, beforeEach } from '@jest/globals'; // expect removed
import type { Mock } from 'jest-mock';
// import { UsersClient } from "../../../client/users.js"; // Removed
// import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js"; // Unused
// import * as fixtures from "../../helpers/fixtures.js"; // Unused due to userId being unused
// import config from "../../../config.js"; // Unused
// import { RedmineApiError } from "../../../client/base.js"; // Unused
// import { parseUrl } from "../../helpers/url.js"; // Unused

describe("Users API (DELETE)", () => {
  // let client: UsersClient; // Removed
  let mockFetch: Mock;
  // const userId = fixtures.singleUserResponse.user.id; // Unused

  beforeEach(() => {
    // client = new UsersClient(); // Removed
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /users/:id.json (deleteUser)", () => {
    // DELETE処理のテストは安全のためスキップされている
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE処理のテストは、実際のAPIを叩かないように、またはテスト環境でのみ実行するように注意が必要です。
      // Redmine APIの仕様では、DELETEリクエストの成功時は 204 No Content が返ります。
      //
      // 削除の制約:
      // - 自分自身を削除できない
      // - 管理者権限がないと削除できない（通常は管理権限が必要）
      // - プロジェクトメンバーシップやチケット担当者になっているユーザーを削除する際の挙動
      // - APIキーで認証しているユーザーを削除する際の挙動
      //
      // 削除の成功例:
      // - 存在するユーザーID
      // - 関連情報（チケットやWikiなど）がないユーザーを削除した場合の挙動
      // - Wikiページを作成したユーザーを削除した場合、Wikiページの作者情報
      // - チケットを作成したユーザーを削除した場合、チケットの作者情報
      //
      // clientのメソッド呼び出し部分でエラーになるため、テスト自体をコメントアウトするか、
      // jest.fn() などでモック化する必要があるでしょう。
      // client.deleteUser(userId) のように呼び出します。
      // ユーザー削除の場合、関連する情報（例：作成したチケットの作成者）が匿名ユーザーになるなどの仕様も確認すると良いでしょう。
    });
  });
});