#!/usr/bin/env node

"use strict";

const path = require("path");
const execa = require("execa");

try {
  execa.sync(
    "java",
    [
      "-cp",
      `${path.dirname(__dirname)}/clutz-all.jar`,
      "com.google.javascript.gents.TypeScriptGenerator",
      ...process.argv.slice(2),
    ],
    { stdio: "inherit" }
  );
} catch (e) {
  process.exit(e.code);
}
