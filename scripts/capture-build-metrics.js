#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  let profile = "default";
  let outPath = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--profile" && i + 1 < argv.length) {
      profile = argv[i + 1];
      i += 1;
    } else if (arg === "--out" && i + 1 < argv.length) {
      outPath = argv[i + 1];
      i += 1;
    } else if (!arg.startsWith("--") && i === 0) {
      profile = arg;
    }
  }

  return { profile, outPath };
}

function profileConfig(profileName) {
  const profile = (profileName || "default").toLowerCase();
  switch (profile) {
    case "default":
      return {
        id: "default",
        label: "default go build",
        buildArgs: ["build", "./..."],
        outFile: "docs/build-metrics-default.md",
      };
    case "tags":
      return {
        id: "tags",
        label: "go build with tags",
        buildArgs: ["build", "-tags", "windows", "./..."],
        outFile: "docs/build-metrics-tags.md",
      };
    case "release":
      return {
        id: "release",
        label: "go build with ldflags",
        buildArgs: [
          "build",
          "-ldflags",
          '-s -w',
          "./...",
        ],
        outFile: "docs/build-metrics-release.md",
      };
    case "race":
      return {
        id: "race",
        label: "go test compile with race",
        buildArgs: ["test", "-race", "-run", "^$", "-count", "1", "./..."],
        outFile: "docs/build-metrics-race.md",
      };
    default:
      throw new Error(
        `Unknown metrics profile '${profileName}'. Use one of: default, tags, release, race`
      );
  }
}

function run(label, args) {
  const start = Date.now();
  const result = spawnSync("go", args, { stdio: "inherit", shell: false });
  const elapsedMs = Date.now() - start;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? 1}`);
  }
  return elapsedMs;
}

function formatMs(ms) {
  const sec = ms / 1000;
  return `${sec.toFixed(2)}s`;
}

function main() {
  const root = path.resolve(__dirname, "..");
  process.chdir(root);
  const args = parseArgs(process.argv.slice(2));
  const config = profileConfig(args.profile);
  const outPath = path.resolve(root, args.outPath || config.outFile);
  const rel = path.relative(root, outPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`[metrics] output path ${outPath} is outside the project root.`);
  }

  let previous = null;
  if (fs.existsSync(outPath)) {
    const text = fs.readFileSync(outPath, "utf8");
    const clean = /- Clean step: ([0-9.]+)s/.exec(text);
    const cleanBuild = /- Clean build check: ([0-9.]+)s/.exec(text);
    const incrementalBuild = /- Incremental build check: ([0-9.]+)s/.exec(text);
    if (clean && cleanBuild && incrementalBuild) {
      previous = {
        cleanMs: Number(clean[1]) * 1000,
        cleanBuildMs: Number(cleanBuild[1]) * 1000,
        incrementalBuildMs: Number(incrementalBuild[1]) * 1000,
      };
    }
  }

  console.log(`[metrics] capturing build metrics (${config.label})...`);
  const cleanMs = run("go clean -cache", ["clean", "-cache"]);
  const buildCleanMs = run(`go ${config.buildArgs.join(" ")}`, config.buildArgs);
  const buildIncrementalMs = run(`go ${config.buildArgs.join(" ")}`, config.buildArgs);

  const now = new Date().toISOString();
  const lines = [
    "# Build Metrics",
    "",
    `- Timestamp: ${now}`,
    `- Profile: ${config.id}`,
    `- Go build args: ${config.buildArgs.join(" ")}`,
    `- Clean step: ${formatMs(cleanMs)}`,
    `- Clean build check: ${formatMs(buildCleanMs)}`,
    `- Incremental build check: ${formatMs(buildIncrementalMs)}`,
    "",
    "## Delta vs Previous Baseline",
    "",
    previous
      ? `- Clean step delta: ${formatMs(cleanMs - previous.cleanMs)}`
      : "- Clean step delta: n/a (no prior baseline)",
    previous
      ? `- Clean build check delta: ${formatMs(buildCleanMs - previous.cleanBuildMs)}`
      : "- Clean build check delta: n/a (no prior baseline)",
    previous
      ? `- Incremental build check delta: ${formatMs(buildIncrementalMs - previous.incrementalBuildMs)}`
      : "- Incremental build check delta: n/a (no prior baseline)",
    "",
    "## Notes",
    "",
    "- Peak build memory is not captured automatically on this platform.",
    "- Run this from a stable machine state for comparable results.",
    "",
  ];

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`[metrics] wrote ${path.relative(root, outPath)}`);
}

main();
