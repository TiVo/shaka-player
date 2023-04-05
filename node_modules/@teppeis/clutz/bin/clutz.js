#!/usr/bin/env node

"use strict";

const path = require("path");
const execa = require("execa");

try {
  execa.sync(
    "java",
    ["-jar", path.resolve(__dirname, "../clutz-all.jar"), ...process.argv.slice(2)],
    { stdio: "inherit" }
  );
} catch (e) {
  process.exit(e.exitCode);
}
