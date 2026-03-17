#!/usr/bin/env node

import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ASTRO_CONFIG_NAMES = [
  "astro.config.mjs",
  "astro.config.js",
  "astro.config.ts",
  "astro.config.cjs",
  "astro.config.mts",
  "astro.config.cts",
];

const IGNORED_DIRECTORIES = new Set([
  ".astro",
  ".git",
  ".hg",
  ".svn",
  "coverage",
  "dist",
  "node_modules",
]);

export const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
];

export function parseArgs(
  argv,
  { booleanOptions = [], stringOptions = [], defaults = {} } = {},
) {
  const booleanSet = new Set(booleanOptions);
  const stringSet = new Set(stringOptions);
  const parsed = { ...defaults, _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    const option = token.slice(2);
    const equalsIndex = option.indexOf("=");
    const name = equalsIndex === -1 ? option : option.slice(0, equalsIndex);
    let value = equalsIndex === -1 ? undefined : option.slice(equalsIndex + 1);

    if (booleanSet.has(name)) {
      parsed[name] = value === undefined ? true : value !== "false";
      continue;
    }

    if (!stringSet.has(name)) {
      throw new Error(`Unknown option: --${name}`);
    }

    if (value === undefined) {
      value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for --${name}`);
      }
      index += 1;
    }

    parsed[name] = value;
  }

  return parsed;
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

export async function writeText(filePath, content, { dryRun = false } = {}) {
  if (dryRun) {
    return;
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export async function readJson(filePath) {
  const content = await readText(filePath);

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
}

export function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function writeJson(filePath, value, { dryRun = false } = {}) {
  await writeText(filePath, formatJson(value), { dryRun });
}

export function relativePath(projectDir, filePath) {
  return path.relative(projectDir, filePath) || ".";
}

export async function listFiles(rootDir, { extensions } = {}) {
  if (!(await pathExists(rootDir))) {
    return [];
  }

  const extensionSet = extensions ? new Set(extensions) : null;
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (extensionSet && !extensionSet.has(path.extname(entry.name))) {
        continue;
      }

      files.push(fullPath);
    }
  }

  await walk(rootDir);
  return files;
}

export async function listJsonFiles(rootDir) {
  return listFiles(rootDir, { extensions: [".json"] });
}

export async function detectTargetProject(projectOption) {
  const projectDir = path.resolve(projectOption ?? process.cwd());
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = (await pathExists(packageJsonPath))
    ? await readJson(packageJsonPath)
    : null;
  const astroConfigFiles = [];

  for (const fileName of ASTRO_CONFIG_NAMES) {
    const filePath = path.join(projectDir, fileName);
    if (await pathExists(filePath)) {
      astroConfigFiles.push(filePath);
    }
  }

  const contentDir = path.join(projectDir, "src", "content");
  const hasContentDir = await pathExists(contentDir);
  const dependencies = collectDependencies(packageJson);

  const hasLightNetDependency =
    dependencies.has("lightnet") ||
    dependencies.has("@lightnet/sveltia-admin") ||
    dependencies.has("@lightnet/decap-admin");

  const valid =
    hasLightNetDependency || (astroConfigFiles.length > 0 && hasContentDir);

  return {
    projectDir,
    packageJson,
    packageJsonPath,
    astroConfigFiles,
    contentDir,
    hasContentDir,
    dependencies,
    valid,
  };
}

export async function ensureTargetProject(projectOption) {
  const detection = await detectTargetProject(projectOption);

  if (!detection.valid) {
    throw new Error(
      `Target project does not look like a LightNet site: ${detection.projectDir}`,
    );
  }

  return detection;
}

export function collectDependencies(packageJson) {
  const dependencies = new Map();

  if (!packageJson || typeof packageJson !== "object") {
    return dependencies;
  }

  for (const section of DEPENDENCY_SECTIONS) {
    const packages = packageJson[section];
    if (!packages || typeof packages !== "object") {
      continue;
    }

    for (const [name, version] of Object.entries(packages)) {
      dependencies.set(name, version);
    }
  }

  return dependencies;
}

export function findPackageSection(packageJson, packageName) {
  for (const section of DEPENDENCY_SECTIONS) {
    if (packageJson?.[section]?.[packageName]) {
      return section;
    }
  }

  return null;
}

export function setPackageVersion(
  packageJson,
  packageName,
  version,
  preferredSection = "dependencies",
) {
  const section =
    findPackageSection(packageJson, packageName) ?? preferredSection;

  if (!packageJson[section] || typeof packageJson[section] !== "object") {
    packageJson[section] = {};
  }

  packageJson[section][packageName] = version;
  return section;
}

export function removePackage(packageJson, packageName) {
  let removedFrom = null;

  for (const section of DEPENDENCY_SECTIONS) {
    if (packageJson?.[section]?.[packageName]) {
      delete packageJson[section][packageName];
      removedFrom = section;
      if (Object.keys(packageJson[section]).length === 0) {
        delete packageJson[section];
      }
    }
  }

  return removedFrom;
}

export async function renamePath(fromPath, toPath, { dryRun = false } = {}) {
  if (dryRun) {
    return;
  }

  await fs.rename(fromPath, toPath);
}

export function detectPackageManager(projectDir) {
  const candidates = [
    ["pnpm-lock.yaml", "pnpm install"],
    ["yarn.lock", "yarn install"],
    ["bun.lockb", "bun install"],
    ["bun.lock", "bun install"],
    ["package-lock.json", "npm install"],
  ];

  for (const [fileName, installCommand] of candidates) {
    const filePath = path.join(projectDir, fileName);
    if (existsSync(filePath)) {
      return installCommand;
    }
  }

  return "npm install";
}

export function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

export function isDirectExecution(metaUrl) {
  if (!process.argv[1]) {
    return false;
  }

  return pathToFileURL(path.resolve(process.argv[1])).href === metaUrl;
}

export async function runCli(main) {
  try {
    const exitCode = await main();
    if (typeof exitCode === "number") {
      process.exitCode = exitCode;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

export function unique(values) {
  return [...new Set(values)];
}
