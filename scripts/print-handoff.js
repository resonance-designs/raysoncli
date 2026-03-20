#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const relCandidates = [
  "README.md",
  "CHANGELOG.md",
  path.join("cmd", "version.go"),
  path.join("go.mod"),
  path.join("scripts", "bump-version.js"),
];

for (const rel of relCandidates) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    continue;
  }
  const body = fs.readFileSync(full, "utf8").trim();
  process.stdout.write(`\n===== ${rel} =====\n${body}\n`);
}

