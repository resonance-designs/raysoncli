#!/usr/bin/env node
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const goreleaserConfig = path.resolve(root, ".goreleaser.yaml");
const args = new Set(process.argv.slice(2));

const parsed = Array.from(args).reduce((acc, item) => {
  if (item === "--snapshot") acc.snapshot = true;
  if (item === "--skip-publish") acc.skipPublish = true;
  if (item === "--clean") acc.clean = true;
  return acc;
}, { snapshot: false, skipPublish: false, clean: true });

if (parsed.snapshot && !parsed.skipPublish) {
  parsed.skipPublish = true;
}

const flags = ["release"];
if (parsed.snapshot) {
  flags.push("--snapshot");
  flags.push("--skip=publish");
}
if (parsed.clean) {
  flags.push("--clean");
}
flags.push("--config", goreleaserConfig);

const releaseResult = spawnSync("goreleaser", flags, {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (releaseResult.status !== 0) {
  process.exit(releaseResult.status || 1);
}
