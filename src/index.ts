#!/usr/bin/env node

import { runServer } from "./handlers/index.js";

// メインエントリーポイント
runServer().catch((error: unknown) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});