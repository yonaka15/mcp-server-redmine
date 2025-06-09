<<<<<<< HEAD
import { jest, describe, it, beforeEach } from '@jest/globals'; // expect removed
import type { Mock } from 'jest-mock';
import { UsersClient } from "../../../client/users.js";
// import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js"; // Unused
// import * as fixtures from "../../helpers/fixtures.js"; // Unused
// import config from "../../../config.js"; // Unused
// import { RedmineApiError } from "../../../client/base.js"; // Unused
// import { parseUrl } from "../../helpers/url.js"; // Unused

describe("Users API (POST)", () => {
  let client: UsersClient; // Assigned but not used in active tests
=======
'''import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
// import { UsersClient } from "../../../client/users.js"; // Commented out as client is unused
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Users API (POST)", () => {
  // let client: UsersClient; // Commented out as tests are skipped and client is unused
>>>>>>> origin/fix/eslint-errors
  let mockFetch: Mock;

  beforeEach(() => {
    // client = new UsersClient(); // Commented out as tests are skipped and client is unused
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("POST /users.json (createUser)", () => {
<<<<<<< HEAD
    // POST操作のテストは安全のためスキップされています
    it.skip("all POST operation tests are skipped for safety", () => {
      // POST操作のテストは、実際のAPIに対して実行するとデータが作成されてしまうため、
      // 通常はモック環境でのみ実施するか、特別なテスト用APIエンドポイントを使用します。
      // Redmine APIの仕様として、POSTリクエストは成功するとステータスコード 201 Created と作成されたリソースを返します。
      //
      // 必須パラメータ:
      // - login: ログインID
      // - firstname: 名
      // - lastname: 姓
      // - mail: メールアドレス
      // - password: パスワード (generate_passwordがfalseの場合)
      //
      // オプションパラメータ:
      // - auth_source_id: 認証元ID
      // - mail_notification: メール通知設定
      // - must_change_passwd: パスワード変更要否
      // - generate_password: パスワード自動生成
      // - admin: 管理者権限
      // - status: ステータス (1: 有効, 2: 未承諾, 3: ロック)
      // - custom_fields: カスタムフィールド値
      //
      // これらのテストケースを網羅的にテストするためには、各ケースに応じたモック設定とリクエストボディの作成が必要です。
      // 現状ではclient変数も未使用警告が出る可能性があります。
      // ユーザー作成時の関連データの扱いも確認ポイントです。
    });
  });
});
=======
    it.skip("all POST operation tests are skipped for safety", () => {
      // POST operations can modify data, so skip in automated tests unless specifically designed for it.
      // Redmine API's actual behavior for POST might involve 201 Created status and returning the created resource.
      // Required fields for user creation:
      // - login: User ID
      // - firstname: First name
      // - lastname: Last name
      // - mail: Email address
      // - password: Password (if generate_password is false)
      // Optional fields:
      // - auth_source_id: Authentication source ID
      // - mail_notification: Email notification setting
      // - must_change_passwd: Force password change
      // - generate_password: Generate password automatically
      // - admin: Administrator flag
      // - status: Status (1: active, 2: locked, 3: registered)
      // - custom_fields: Custom fields
      // Creating a user typically requires admin privileges in Redmine.
      // The client method should prepare the request body and headers correctly.
      // expect(client.createUser({ user: { login: 'testuser', ... } })).resolves.toBeDefined(); // Example assertion
    });
  });
});
'''
>>>>>>> origin/fix/eslint-errors
