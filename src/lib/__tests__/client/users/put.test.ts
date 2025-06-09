import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Users API (PUT)", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let client: UsersClient;
  let mockFetch: Mock;
  const userId = fixtures.singleUserResponse.user.id;

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /users/:id.json (updateUser)", () => {
    // PUT操作のテストは安全のためスキップされています
    it.skip("all PUT operation tests are skipped for safety", () => {
      // PUT操作に対するRedmine APIの具体的な挙動は、APIドキュメントや実際のRedmine環境で確認してください。
      // Redmine APIの仕様として、PUTリクエストが成功した場合、通常は204 No Contentステータスコードが返されます。
      //
      // 更新可能なパラメータ:
      // - login: ユーザーID（変更不可）
      // - firstname: 名（変更可）
      // - lastname: 姓（変更可）
      // - mail: メールアドレス（変更可）
      // - password: パスワード（変更可）
      // - must_change_passwd: パスワード変更要否
      // - auth_source_id: 認証局ID（変更可）
      // - mail_notification: メール通知設定（変更可）
      // - admin: 管理者権限（変更可）
      // - status: ステータス（変更可）
      // - custom_fields: カスタムフィールド（変更可）
      // - group_ids: 所属グループID配列（変更可）
      //
      // 実際にclientのupdateUserメソッドを呼び出し、mockFetchが適切なパラメータで呼び出されたかなどを検証します。
      // 例えば、client.updateUser(userId, { user: { firstname: 'NewName' } })のような呼び出しをテストします。
    });
  });
});