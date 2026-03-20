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

function planGoVersion(filePath, newVersion) {
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
  return {
    filePath,
    content: updatedVersionFile,
    updated: true,
    previous: currentVersion,
  };
}

function planPackageVersion(filePath, newVersion) {
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

  const updated = { ...parsed, version: newVersion };
  return {
    filePath,
    content: `${JSON.stringify(updated, null, 2)}\n`,
    updated: true,
    previous: current,
  };
}

function planReadmeVersion(filePath, newVersion) {
  if (!fs.existsSync(filePath)) {
    return { updated: false, reason: "missing" };
  }

  const readme = readFile(filePath);
  const badgePattern = /!\[Static Badge\]\(https:\/\/img\.shields\.io\/badge\/Version-([^)]*)\)/;
  const badgeMatch = badgePattern.exec(readme);
  if (!badgeMatch) {
    return { updated: false, reason: "badge-missing" };
  }

  const previous = badgeMatch[1];
  const updatedContent = readme.replace(
    badgePattern,
    `![Static Badge](https://img.shields.io/badge/Version-${newVersion}-orange)`
  );
  return {
    filePath,
    content: updatedContent,
    updated: true,
    previous,
  };
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

const plannedWrites = [];

const goUpdate = planGoVersion(versionPath, newVersion);
if (goUpdate.updated) {
  plannedWrites.push(goUpdate);
  console.log(`Planned cmd/version.go: ${goUpdate.previous} -> ${newVersion}`);
}

for (const packagePath of packageTargets) {
  const result = planPackageVersion(packagePath, newVersion);
  if (result.updated) {
    plannedWrites.push(result);
    console.log(`Planned ${path.relative(projectRoot, packagePath)}: ${result.previous} -> ${newVersion}`);
  } else if (result.reason) {
    console.warn(`Skipped ${path.relative(projectRoot, packagePath)}: ${result.reason}`);
  }
}

const readmeUpdate = planReadmeVersion(readmePath, newVersion);
if (readmeUpdate.updated) {
  plannedWrites.push(readmeUpdate);
  const rel = path.relative(projectRoot, readmePath);
  console.log(`Planned README badge: ${rel}`);
} else if (readmeUpdate.reason === "missing") {
  console.warn(`README file not found at: ${readmePath}`);
} else if (readmeUpdate.reason === "badge-missing") {
  console.warn(`Version badge not found in ${readmePath}; skipped README update.`);
}

for (const update of plannedWrites) {
  writeFile(update.filePath, update.content);
}
