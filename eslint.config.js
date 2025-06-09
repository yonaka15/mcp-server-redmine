// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // プロジェクトのルートにある src ディレクトリ内のファイルを対象とする
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    // ここにカスタムルールや設定を追加できます
    // 例:
    // rules: {
    //   "no-unused-vars": "warn"
    // }
  }
];