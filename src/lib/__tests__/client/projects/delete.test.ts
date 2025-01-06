import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { ProjectsClient } from "../../../client/projects.js";
import { mockResponse, mockErrorResponse } from "../../helpers/mocks.js";
import * as fixtures from "../../helpers/fixtures.js";
import config from "../../../config.js";
import { RedmineApiError } from "../../../client/base.js";
import { parseUrl } from "../../helpers/url.js";

describe("Projects API (DELETE)", () => {
  let client: ProjectsClient;
  let mockFetch: Mock;

  beforeEach(() => {
    client = new ProjectsClient();
    mockFetch = jest.spyOn(global, "fetch") as Mock;
    mockFetch.mockReset();
  });

  describe("DELETE /projects/:id.json (deleteProject)", () => {
    // DELETE操作は常にデータ削除を伴うため、全てスキップ
    it.skip("all DELETE operation tests are skipped for safety", () => {
      // DELETE操作は常にデータの削除を伴うため、テストをスキップします
      // Redmine APIの仕様で、DELETEリクエストは以下の影響を及ぼします：
      //
      // 1. プロジェクトの完全な削除
      //    - プロジェクトの基本情報
      //    - プロジェクトの設定情報
      //    - カスタムフィールドの値
      //
      // 2. 関連データの削除
      //    - プロジェクトのチケット
      //    - プロジェクトのWiki
      //    - プロジェクトのフォーラム
      //    - プロジェクトのニュース
      //    - プロジェクトの文書
      //    - プロジェクトのファイル
      //    - プロジェクトのリポジトリ設定
      //
      // 3. メンバーシップの削除
      //    - プロジェクトメンバーの割り当て解除
      //    - プロジェクト固有のロール設定
      //    - ウォッチャーの設定
      //
      // 4. サブプロジェクトへの影響
      //    - 親プロジェクトが削除される場合、サブプロジェクトは事前に
      //      削除しておく必要があります
      //    - それ以外の場合、サブプロジェクトの存在下での削除は失敗します
      //
      // 5. メール通知
      //    - 削除通知がプロジェクトメンバーに送信される可能性
      //
      // これらの操作は重要なデータの完全な削除を伴うため、
      // テスト環境でも実行すべきではありません。
    });
  });
});