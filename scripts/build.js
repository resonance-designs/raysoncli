#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const isWindows = process.platform === "win32";
const binaryName = isWindows ? "rayson.exe" : "rayson";
const outPath = path.join("bin", binaryName);
const alternatePath = isWindows ? path.join("bin", "rayson") : path.join("bin", "rayson.exe");

if (fs.existsSync(alternatePath)) {
  fs.rmSync(alternatePath, { force: true });
}

const result = spawnSync("go", ["build", "-o", outPath, "./cmd/rayson"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log(`Built ${outPath}`);
