#!/usr/bin/env node
const { spawnSync } = require("node:child_process");

function run(step, cmd, args) {
  console.log(`\n[build-matrix] ${step}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run("go test (default)", "go", ["test", "./..."]);
run("go build", "go", ["build", "./..."]);

if (process.env.RAYSON_MATRIX_SKIP_SMOKE === "1") {
  console.log("\n[build-matrix] CLI smoke check skipped (RAYSON_MATRIX_SKIP_SMOKE=1)");
} else {
  run(
    "CLI smoke check",
    "go",
    ["run", "./cmd/rayson", "--help"],
  );
}

run("go test (quick compile)", "go", ["test", "-run", "^$", "-count", "1", "./..."]);

if (process.platform === "win32" && process.env.RAYSON_MATRIX_SKIP_LICENSES !== "1") {
  run("go version", "go", ["version"]);
}

console.log("\n[build-matrix] all checks passed");
