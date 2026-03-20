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
        label: "default go test compile",
        testArgs: ["test", "-run", "^$", "-count", "1", "-json", "./..."],
        outFile: "docs/build-timings-default.md",
      };
    case "tags":
      return {
        id: "tags",
        label: "tagged compile test",
        testArgs: ["test", "-tags", "windows", "-run", "^$", "-count", "1", "-json", "./..."],
        outFile: "docs/build-timings-tags.md",
      };
    case "race":
      return {
        id: "race",
        label: "race compile timing",
        testArgs: ["test", "-race", "-run", "^$", "-count", "1", "-json", "./..."],
        outFile: "docs/build-timings-race.md",
      };
    case "test":
      return {
        id: "test",
        label: "named test compile",
        testArgs: ["test", "-run", "TestDoesNotExist", "-count", "1", "-json", "./..."],
        outFile: "docs/build-timings-tests.md",
      };
    default:
      throw new Error(
        `Unknown timings profile '${profileName}'. Use one of: default, tags, race, test`
      );
  }
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    encoding: "utf8",
  });

  return result;
}

function parseTimingPayload(payload) {
  if (!payload) return [];

  const entries = [];
  for (const line of payload.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    try {
      const item = JSON.parse(line);
      const label = item.Package || item.package || item.Action;
      const elapsedMs = item.Elapsed;

      if (typeof elapsedMs === "number" && label) {
        entries.push({ label, elapsedMs, action: item.Action || "pass", package: item.Package });
      }
    } catch (err) {
      // Ignore non-JSON output lines (expected from go test output noise).
      if (!(err instanceof SyntaxError)) {
        throw err;
      }
    }
  }

  return entries.sort((a, b) => b.elapsedMs - a.elapsedMs);
}

function formatMs(ms) {
  return `${(ms).toFixed(2)}s`;
}

function main() {
  const root = path.resolve(__dirname, "..");
  process.chdir(root);

  const args = parseArgs(process.argv.slice(2));
  const config = profileConfig(args.profile);

  const outPath = path.resolve(root, args.outPath || config.outFile);
  const rel = path.relative(root, outPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`[timings] output path ${outPath} is outside the project root.`);
  }
  const testArgs = config.testArgs;

  console.log(`[timings] running go test with JSON output (${config.label})`);
  const checkResult = run("go", testArgs);
  if (checkResult.status !== 0) {
    console.error(`[timings] go test failed: ${checkResult.status}`);
    process.exit(checkResult.status || 1);
  }

  const entries = parseTimingPayload(checkResult.stdout || "");
  const lines = [
    "# Build Timings",
    "",
    `- Timestamp: ${new Date().toISOString()}`,
    `- Profile: ${config.id}`,
    `- Test args: ${testArgs.join(" ")}`,
    "- Scope: top timed actions emitted by go test -json",
    "",
  ];

  if (entries.length === 0) {
    lines.push("- No timing entries parsed from go test JSON output.");
  } else {
    lines.push("- Top timing candidates:");
    for (const item of entries.slice(0, 12)) {
      const label = item.package || item.label;
      lines.push(`  - ${label}: ${formatMs(item.elapsedMs)}`);
    }
  }

  lines.push(
    "",
    "## Notes",
    "- Go test -json timings are advisory and can vary between runs.",
    "- Keep machine load stable when comparing snapshots.",
    ""
  );

  const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  const sectionHeader = "# Build Timings";
  const sectionText = lines.join("\n");
  const sectionIndex = existing.indexOf(sectionHeader);

  const updated =
    sectionIndex >= 0
      ? `${existing.slice(0, sectionIndex)}${sectionText}`
      : `${existing}\n\n${sectionText}`;

  fs.writeFileSync(outPath, updated, "utf8");
  console.log(`[timings] wrote timing notes to ${path.relative(root, outPath)}`);
}

main();
