#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const providedVersion = args[0];
const semver = /^\d+\.\d+\.\d+$/;

const projectRoot = path.resolve(__dirname, "..");
const versionPath = path.resolve(projectRoot, "cmd", "version.go");
const readmePath = path.resolve(projectRoot, "README.md");
const packageTargets = [
  path.resolve(projectRoot, "package.json"),
  path.resolve(projectRoot, "docs-site", "package.json"),
];

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function updateGoVersion(filePath, newVersion) {
  const versionFile = readFile(filePath);
  const versionMatch = /const\s+Version\s*=\s*"([^"]+)"/.exec(versionFile);

  if (!versionMatch) {
    throw new Error(`Could not locate Version constant in ${filePath}`);
  }

  const currentVersion = versionMatch[1];
  if (!semver.test(currentVersion)) {
    throw new Error(`Current version '${currentVersion}' is not valid x.y.z semver`);
  }

  const updatedVersionFile = versionFile.replace(
    /const\s+Version\s*=\s*"[^"]+"/,
    `const Version = "${newVersion}"`
  );
  writeFile(filePath, updatedVersionFile);
  return { updated: true, previous: currentVersion };
}

function updatePackageVersion(filePath, newVersion) {
  if (!fs.existsSync(filePath)) {
    return { updated: false, reason: "missing" };
  }

  const raw = readFile(filePath);
  const parsed = JSON.parse(raw);

  if (typeof parsed.version !== "string") {
    return { updated: false, reason: "no version field" };
  }

  const current = parsed.version;
  if (!semver.test(current)) {
    console.warn(
      `Skipping ${path.relative(projectRoot, filePath)}: existing version '${current}' is not x.y.z semver`
    );
    return { updated: false, reason: "non-semver version" };
  }

  parsed.version = newVersion;
  writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`);
  return { updated: true, previous: current };
}

if (!fs.existsSync(versionPath)) {
  throw new Error(`Version file not found: ${versionPath}`);
}

const goVersionFile = readFile(versionPath);
const goCurrentMatch = /const\s+Version\s*=\s*"([^"]+)"/.exec(goVersionFile);
if (!goCurrentMatch) {
  throw new Error(`Could not locate Version constant in ${versionPath}`);
}

const currentVersion = goCurrentMatch[1];
if (!semver.test(currentVersion)) {
  throw new Error(`Current version '${currentVersion}' is not valid x.y.z semver`);
}

let newVersion = providedVersion;
if (!newVersion) {
  const [major, minor, patch] = currentVersion.split(".");
  newVersion = `${major}.${minor}.${Number(patch) + 1}`;
} else if (!semver.test(newVersion)) {
  throw new Error(`Provided version '${newVersion}' must be in x.y.z format`);
}

const goUpdate = updateGoVersion(versionPath, newVersion, currentVersion);
if (goUpdate.updated) {
  console.log(`Updated cmd/version.go: ${goUpdate.previous} -> ${newVersion}`);
}

for (const packagePath of packageTargets) {
  const result = updatePackageVersion(packagePath, newVersion);
  if (result.updated) {
    console.log(`Updated ${path.relative(projectRoot, packagePath)}: ${result.previous} -> ${newVersion}`);
  } else if (result.reason) {
    console.warn(`Skipped ${path.relative(projectRoot, packagePath)}: ${result.reason}`);
  }
}

if (!fs.existsSync(readmePath)) {
  console.warn(`README file not found at: ${readmePath}`);
} else {
  const readme = readFile(readmePath);
  const badgePattern = /!\[Static Badge\]\(https:\/\/img\.shields\.io\/badge\/Version-[^)]*\)/;
  const badge = `![Static Badge](https://img.shields.io/badge/Version-${newVersion}-orange)`;

  if (!badgePattern.test(readme)) {
    console.warn(`Version badge not found in ${readmePath}; skipped README update.`);
  } else {
    writeFile(readmePath, readme.replace(badgePattern, badge));
    console.log(`Updated README badge: ${readmePath}`);
  }
}
