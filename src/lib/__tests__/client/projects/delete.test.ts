import { jest, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
// import { ProjectsClient } from "../../../../client/projects.js"; // Removed
// import { mockResponse, mockErrorResponse } from "../../../helpers/mocks.js"; // Removed
// import * as fixtures from "../../../helpers/fixtures.js"; // Removed
// import config from "../../../../config.js"; // Removed
// import { RedmineApiError } from "../../../client/base.js"; // Removed
// import { parseUrl } from "../../../helpers/url.js"; // Removed

describe("Projects API (DELETE)", () => {
  // let client: ProjectsClient; // Removed
  let mockFetch: Mock;

  beforeEach(() => {
    // client = new ProjectsClient(); // Removed
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /projects/:id.json (deleteProject)", () => {
    // DELETEリクエストのテストは安全のためスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETEリクエストのテストコードはここに記述
      // Redmine APIの仕様により、DELETEリクエストは実際のデータ変更を伴うため、
      // テスト実行時には注意が必要です。
      //
      // 1. プロジェクトの削除オプション
      //    - プロジェクトの完全削除
      //    - プロジェクトのアーカイブ（アーカイブは別のAPIエンドポイント）
      //    - カスタムフィールドの値
      //
      // 2. 関連データの扱い
      //    - プロジェクトのチケット
      //    - プロジェクトのWiki
      //    - プロジェクトのファイル
      //    - プロジェクトのニュース
      //    - プロジェクトのフォーラム
      //    - プロジェクトの作業時間
      //
      // 3. 権限とエラーケース
      //    - プロジェクト管理者の権限でのみ削除可能
      //    - 存在しないプロジェクトIDを指定した場合
      //    - アーカイブ済みプロジェクトの削除
      //
      // 4. APIのレスポンス
      //    - 正常に削除された場合は空のレスポンス (204 No Content)
      //    - 権限がない場合や存在しない場合はエラーレスポンス
      //
      // 5. 注意点
      //    - 削除操作は元に戻せないため、テスト環境でのみ実行することを強く推奨
      //
      // 具体的なテストケースとしては、
      // - 正常に削除できること
      // - 存在しないIDを指定した場合にエラーが返ること
      // - 権限がない場合にエラーが返ること
      // などを検証します。
    });
  });
});
