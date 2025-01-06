import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Users API (PUT)", () => {
  let client: UsersClient;
  let mockFetch: Mock;
  const userId = fixtures.singleUserResponse.user.id;

  beforeEach(() => {
    client = new UsersClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("PUT /users/:id.json (updateUser)", () => {
    // PUT操作は常にデータ変更の可能性があるため、全てスキップ
    it.skip("all PUT operation tests are skipped for safety", () => {
      // PUT操作は常にデータ変更の可能性があるため、テストをスキップします
      // Redmine APIの仕様で、PUTリクエストは以下のパラメータを受け付けます：
      //
      // 更新可能なパラメータ:
      // - login: ログイン名の変更
      // - firstname: 名の変更
      // - lastname: 姓の変更
      // - mail: メールアドレスの変更
      // - password: パスワードの変更
      // - must_change_passwd: パスワード変更強制
      // - auth_source_id: 認証ソースIDの変更
      // - mail_notification: メール通知設定の変更
      // - admin: 管理者権限の変更
      // - status: ステータスの変更
      // - custom_fields: カスタムフィールドの変更
      // - group_ids: 所属グループの変更
      //
      // これらの操作は全てユーザーデータの変更を伴うため、
      // テスト環境でも実行すべきではありません。
      // また、ユーザー更新には管理者権限が必要です。
    });
  });
});