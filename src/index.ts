#!/usr/bin/env node

import { runServer } from "./handlers.js";

// メインエントリーポイント
runServer().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});