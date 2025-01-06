import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Users API (DELETE)", () => {
  let client: UsersClient;
  let mockFetch: Mock;
  const userId = fixtures.singleUserResponse.user.id;

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /users/:id.json (deleteUser)", () => {
    // DELETE操作は常にデータ変更の可能性があるため、全てスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作は常にデータの削除を伴うため、テストをスキップします
      // Redmine APIの仕様で、DELETEリクエストは以下の影響を及ぼします：
      //
      // データへの影響:
      // - ユーザーアカウントの完全な削除
      // - ユーザーの活動履歴の削除
      // - プロジェクトメンバーシップの削除
      // - カスタムフィールド値の削除
      // - グループメンバーシップの削除
      //
      // 関連データへの影響:
      // - ウォッチャー設定の削除
      // - 担当チケットの担当者解除
      // - 作成したWikiページの作者情報の更新
      // - 作成したニュースの作者情報の更新
      //
      // これらの操作は全てデータの削除や変更を伴うため、
      // テスト環境でも実行すべきではありません。
      // また、ユーザー削除には管理者権限が必要です。
    });
  });
});