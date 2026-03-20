const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const binary = process.argv[2] || "rayson";
const root = path.resolve(__dirname, "..");
const ext = process.platform === "win32" ? ".exe" : "";

function getGoBinaryDir() {
  const result = spawnSync("go", ["env", "GOBIN"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status === 0) {
    const gobin = (result.stdout || "").trim();
    if (gobin) {
      return gobin;
    }
  }

  const gopath = spawnSync("go", ["env", "GOPATH"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (gopath.status === 0) {
    const gp = (gopath.stdout || "").trim();
    if (gp) {
      return path.join(gp, "bin");
    }
  }

  return process.platform === "win32"
    ? path.join(process.env.USERPROFILE || "", "go", "bin")
    : path.join(process.env.HOME || "", "go", "bin");
}

const candidateDirs = [
  path.join(root, "bin"),
  path.join(root, "build"),
  path.join(root, ".bin"),
  getGoBinaryDir(),
];

const candidates = [
  path.join(root, binary),
  path.join(root, `${binary}${ext}`),
  path.join(process.cwd(), binary),
  path.join(process.cwd(), `${binary}${ext}`),
  ...candidateDirs.map((dir) => path.join(dir, binary)),
  ...candidateDirs.map((dir) => path.join(dir, `${binary}${ext}`)),
];

const exists = candidates.filter((candidate) =>
  candidate && fs.existsSync(candidate)
);

console.log(`rayson binary lookup for: ${binary}`);
if (exists.length > 0) {
  for (const location of exists) {
    console.log(`  - ${path.relative(root, location)}`);
  }
  process.exit(0);
}

console.log("No built binary found.");
console.log(`Checked ${candidates.length} likely locations.`);
console.log(`Hint: build with ` + '"go build -o ./bin/rayson ./cmd/rayson"');
process.exit(1);
