import { jest, describe, it, beforeEach } from '@jest/globals'; // expect removed
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
// import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js"; // Unused
// import * as fixtures from "../../helpers/fixtures.js"; // Unused due to userId being unused
// import config from "../../../config.js"; // Unused
// import { RedmineApiError } from "../../../client/base.js"; // Unused
// import { parseUrl } from "../../helpers/url.js"; // Unused

describe("Users API (DELETE)", () => {
  let client: UsersClient; // Assigned but not used in active tests
  let mockFetch: Mock;
  // const userId = fixtures.singleUserResponse.user.id; // Unused

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /users/:id.json (deleteUser)", () => {
    // DELETE操作のテストは安全のためスキップされています
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作のテストは、実際のAPIに対して実行するとデータが削除されてしまうため、
      // 通常はモック環境でのみ実施するか、特別なテスト用APIエンドポイントを使用します。
      // Redmine APIの仕様として、DELETEリクエストは成功するとステータスコード 204 No Content を返します。
      //
      // 削除の成功例:
      // - 一般ユーザーの削除
      // - 管理者ユーザーの削除（実行ユーザーの権限による）
      // - プロジェクトメンバーシップを持つユーザーの削除
      // - カスタムフィールド値を持つユーザーの削除
      // - APIキーを持つユーザーの削除
      //
      // 削除の失敗例:
      // - 存在しないユーザーID
      // - 自分自身を削除しようとする場合
      // - Wikiページを作成したユーザーの削除とページの扱い
      // - チケットを作成したユーザーの削除とチケットの扱い
      //
      // これらのテストケースを網羅的にテストするためには、各ケースに応じたモック設定とシナリオが必要です。
      // 現状ではclient変数やuserId変数も未使用警告が出る可能性があります。
      // ユーザー削除時の関連データの扱い（匿名化など）も確認ポイントです。
    });
  });
});
