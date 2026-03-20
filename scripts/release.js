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
  if (item === "--from-version") acc.fromVersion = true;
  if (item.startsWith("--version=")) {
    acc.versionFromCli = item.split("=").slice(1).join("=");
  }
  return acc;
}, { snapshot: false, skipPublish: false, clean: true });

const semver = /^\d+\.\d+\.\d+$/;

function runGit(args, capture = false) {
  const result = spawnSync("git", args, {
    cwd: root,
    stdio: capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || "").toString().trim();
    throw new Error(`git ${args.join(" ")} failed: ${message || "unknown error"}`);
  }
  return capture ? (result.stdout || "").toString().trim() : "";
}

function readVersionFromSource() {
  const goVersionMatch = /const\s+Version\s*=\s*"([^"]+)"/.exec(
    require("node:fs").readFileSync(path.resolve(root, "cmd", "version.go"), "utf8")
  );
  if (goVersionMatch && semver.test(goVersionMatch[1])) {
    return goVersionMatch[1];
  }

  const packagePaths = [
    path.resolve(root, "package.json"),
    path.resolve(root, "docs-site", "package.json"),
  ];
  for (const packagePath of packagePaths) {
    const parsed = JSON.parse(require("node:fs").readFileSync(packagePath, "utf8"));
    if (typeof parsed.version === "string" && semver.test(parsed.version)) {
      return parsed.version;
    }
  }

  throw new Error("Unable to determine release version from cmd/version.go or package.json files.");
}

function ensureTagForVersion(version) {
  const tag = `v${version}`;
  try {
    runGit(["tag", "-f", tag], false);
    return { name: tag, created: true };
  } catch (err) {
    throw new Error(`Unable to create fallback release tag '${tag}': ${err.message}`);
  }
}

function cleanupTag(tagName, created) {
  if (!created || !tagName) return;
  try {
    runGit(["tag", "-d", tagName], false);
  } catch (cleanupError) {
    console.error(`Warning: failed to remove temporary tag '${tagName}': ${cleanupError.message}`);
  }
}

if (parsed.snapshot && !parsed.skipPublish) {
  parsed.skipPublish = true;
}

const flags = ["release"];
if (parsed.snapshot) {
  flags.push("--snapshot");
  flags.push("--skip=publish");
}
if (parsed.skipPublish) {
  flags.push("--skip=publish");
}
if (parsed.clean) {
  flags.push("--clean");
}
flags.push("--config", goreleaserConfig);

let tempTag;
try {
  if (parsed.fromVersion && !parsed.snapshot) {
    const tagVersion = parsed.versionFromCli || process.env.RAYSON_RELEASE_VERSION || readVersionFromSource();
    if (!semver.test(tagVersion)) {
      throw new Error(`Configured release version '${tagVersion}' is not x.y.z`);
    }
    tempTag = ensureTagForVersion(tagVersion);
    flags.push("--clean");
    if (!parsed.skipPublish) {
      parsed.skipPublish = true;
    }
  }

  const releaseResult = spawnSync("goreleaser", flags, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (releaseResult.status !== 0) {
    process.exit(releaseResult.status || 1);
  }
} finally {
  cleanupTag(tempTag?.name, tempTag?.created);
}
