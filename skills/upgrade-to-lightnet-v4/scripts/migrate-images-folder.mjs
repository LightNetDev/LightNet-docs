#!/usr/bin/env node

import path from "node:path";
import {
  ensureTargetProject,
  isDirectExecution,
  listJsonFiles,
  parseArgs,
  pathExists,
  readJson,
  relativePath,
  renamePath,
  runCli,
  writeJson,
} from "./lib/common.mjs";

const OLD_SEGMENT = "./_images/";
const NEW_SEGMENT = "./images/";

function replaceLegacyImagePaths(value) {
  if (typeof value === "string") {
    return value.startsWith(OLD_SEGMENT)
      ? { value: value.replace(OLD_SEGMENT, NEW_SEGMENT), changed: true }
      : { value, changed: false };
  }

  if (Array.isArray(value)) {
    let changed = false;
    const nextValue = value.map((entry) => {
      const result = replaceLegacyImagePaths(entry);
      changed ||= result.changed;
      return result.value;
    });
    return { value: nextValue, changed };
  }

  if (value && typeof value === "object") {
    let changed = false;
    const nextValue = {};

    for (const [key, entry] of Object.entries(value)) {
      const result = replaceLegacyImagePaths(entry);
      changed ||= result.changed;
      nextValue[key] = result.value;
    }

    return { value: nextValue, changed };
  }

  return { value, changed: false };
}

export async function inspectImagesFolderMigration(projectDir) {
  const mediaDir = path.join(projectDir, "src", "content", "media");
  const oldDir = path.join(mediaDir, "_images");
  const newDir = path.join(mediaDir, "images");
  const blockers = [];
  const findings = [];
  const warnings = [];
  const files = [];
  const jsonFiles = await listJsonFiles(mediaDir);
  let referencedFiles = 0;

  if ((await pathExists(oldDir)) && (await pathExists(newDir))) {
    blockers.push(
      "Both `src/content/media/_images` and `src/content/media/images` exist. Resolve that conflict before running this script.",
    );
  }

  if (await pathExists(oldDir)) {
    findings.push("Rename `src/content/media/_images` to `src/content/media/images`.");
    files.push(relativePath(projectDir, oldDir));
  }

  for (const filePath of jsonFiles) {
    const result = replaceLegacyImagePaths(await readJson(filePath));
    if (!result.changed) {
      continue;
    }

    referencedFiles += 1;
    files.push(relativePath(projectDir, filePath));
  }

  if (referencedFiles > 0) {
    findings.push(
      `Rewrite ${referencedFiles} media JSON file${referencedFiles === 1 ? "" : "s"} from \`${OLD_SEGMENT}\` to \`${NEW_SEGMENT}\`.`,
    );
  }

  if (!(await pathExists(oldDir)) && referencedFiles === 0) {
    warnings.push("No legacy media image folder or `./_images/` references were found.");
  }

  return {
    id: "migrate-images-folder",
    applicable: findings.length > 0 || blockers.length > 0,
    blockers,
    files,
    findings,
    warnings,
  };
}

export async function migrateImagesFolder(projectDir, options = {}) {
  const inspection = await inspectImagesFolderMigration(projectDir);

  if (inspection.blockers.length > 0) {
    return { ...inspection, changedFiles: [], exitCode: 1 };
  }

  const mediaDir = path.join(projectDir, "src", "content", "media");
  const oldDir = path.join(mediaDir, "_images");
  const newDir = path.join(mediaDir, "images");
  const changedFiles = [];

  if (await pathExists(oldDir)) {
    await renamePath(oldDir, newDir, { dryRun: options.dryRun });
    changedFiles.push(relativePath(projectDir, oldDir));
  }

  for (const filePath of await listJsonFiles(mediaDir)) {
    const data = await readJson(filePath);
    const result = replaceLegacyImagePaths(data);
    if (!result.changed) {
      continue;
    }

    await writeJson(filePath, result.value, { dryRun: options.dryRun });
    changedFiles.push(relativePath(projectDir, filePath));
  }

  return {
    ...inspection,
    changedFiles,
    exitCode: 0,
  };
}

function printResult(result, { dryRun = false } = {}) {
  if (result.findings.length > 0) {
    console.log("Planned changes:");
    for (const finding of result.findings) {
      console.log(`- ${finding}`);
    }
  } else {
    console.log("No legacy media image folder changes are needed.");
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (result.blockers.length > 0) {
    console.log("Blockers:");
    for (const blocker of result.blockers) {
      console.log(`- ${blocker}`);
    }
    return;
  }

  if (result.changedFiles.length > 0) {
    console.log(dryRun ? "Would update:" : "Updated:");
    for (const filePath of result.changedFiles) {
      console.log(`- ${filePath}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    booleanOptions: ["dry-run"],
    stringOptions: ["project"],
  });
  const detection = await ensureTargetProject(args.project);
  const result = await migrateImagesFolder(detection.projectDir, {
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
