#!/usr/bin/env node

import path from "node:path";
import {
  ensureTargetProject,
  isDirectExecution,
  listJsonFiles,
  parseArgs,
  readJson,
  relativePath,
  runCli,
  writeJson,
} from "./lib/common.mjs";

export async function inspectCoverImageStyleMigration(projectDir) {
  const mediaTypesDir = path.join(projectDir, "src", "content", "media-types");
  const findings = [];
  const warnings = [];
  const blockers = [];
  const files = [];
  let affectedFiles = 0;

  for (const filePath of await listJsonFiles(mediaTypesDir)) {
    const data = await readJson(filePath);
    const coverStyle = data?.detailsPage?.coverStyle;

    if (coverStyle === undefined) {
      continue;
    }

    affectedFiles += 1;
    files.push(relativePath(projectDir, filePath));

    if (
      data.coverImageStyle !== undefined &&
      data.coverImageStyle !== coverStyle
    ) {
      blockers.push(
        `${relativePath(projectDir, filePath)} defines both \`detailsPage.coverStyle\` and \`coverImageStyle\` with different values.`,
      );
    }
  }

  if (affectedFiles > 0) {
    findings.push(
      `Move deprecated \`detailsPage.coverStyle\` values to top-level \`coverImageStyle\` in ${affectedFiles} file${affectedFiles === 1 ? "" : "s"}.`,
    );
  } else {
    warnings.push("No deprecated `detailsPage.coverStyle` fields were found.");
  }

  return {
    id: "migrate-cover-image-style",
    applicable: affectedFiles > 0 || blockers.length > 0,
    blockers,
    files,
    findings,
    warnings,
  };
}

export async function migrateCoverImageStyle(projectDir, options = {}) {
  const inspection = await inspectCoverImageStyleMigration(projectDir);

  if (inspection.blockers.length > 0) {
    return { ...inspection, changedFiles: [], exitCode: 1 };
  }

  const mediaTypesDir = path.join(projectDir, "src", "content", "media-types");
  const changedFiles = [];

  for (const filePath of await listJsonFiles(mediaTypesDir)) {
    const data = await readJson(filePath);
    const coverStyle = data?.detailsPage?.coverStyle;

    if (coverStyle === undefined) {
      continue;
    }

    if (data.coverImageStyle === undefined) {
      data.coverImageStyle = coverStyle;
    }

    delete data.detailsPage.coverStyle;
    if (
      data.detailsPage &&
      typeof data.detailsPage === "object" &&
      !Array.isArray(data.detailsPage) &&
      Object.keys(data.detailsPage).length === 0
    ) {
      delete data.detailsPage;
    }

    await writeJson(filePath, data, { dryRun: options.dryRun });
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
    console.log("No cover image style migration is needed.");
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
  const result = await migrateCoverImageStyle(detection.projectDir, {
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
