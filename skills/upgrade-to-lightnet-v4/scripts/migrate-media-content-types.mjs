#!/usr/bin/env node

import path from "node:path";
import {
  ensureTargetProject,
  isDirectExecution,
  isExternalUrl,
  listJsonFiles,
  parseArgs,
  readJson,
  relativePath,
  runCli,
  writeJson,
} from "./lib/common.mjs";

function inferContentType(url) {
  return isExternalUrl(url) ? "link" : "upload";
}

export async function inspectMediaContentTypes(projectDir) {
  const mediaDir = path.join(projectDir, "src", "content", "media");
  const findings = [];
  const warnings = [];
  const blockers = [];
  const files = [];
  let missingTypeEntries = 0;

  for (const filePath of await listJsonFiles(mediaDir)) {
    const data = await readJson(filePath);
    const content = data?.content;

    if (!Array.isArray(content)) {
      continue;
    }

    let fileNeedsUpdate = false;

    for (const entry of content) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        continue;
      }

      if (typeof entry.type === "string" && !["link", "upload"].includes(entry.type)) {
        blockers.push(
          `${relativePath(projectDir, filePath)} has \`content[].type = "${entry.type}"\`, which is not a valid LightNet v4 value.`,
        );
      }

      if (!("type" in entry) && typeof entry.url === "string") {
        missingTypeEntries += 1;
        fileNeedsUpdate = true;
      }
    }

    if (fileNeedsUpdate) {
      files.push(relativePath(projectDir, filePath));
    }
  }

  if (missingTypeEntries > 0) {
    findings.push(
      `Add explicit \`type\` values to ${missingTypeEntries} media content entr${missingTypeEntries === 1 ? "y" : "ies"}.`,
    );
  } else {
    warnings.push("No media content entries without `type` were found.");
  }

  return {
    id: "migrate-media-content-types",
    applicable: missingTypeEntries > 0 || blockers.length > 0,
    blockers,
    files,
    findings,
    warnings,
  };
}

export async function migrateMediaContentTypes(projectDir, options = {}) {
  const inspection = await inspectMediaContentTypes(projectDir);

  if (inspection.blockers.length > 0) {
    return { ...inspection, changedFiles: [], exitCode: 1 };
  }

  const mediaDir = path.join(projectDir, "src", "content", "media");
  const changedFiles = [];

  for (const filePath of await listJsonFiles(mediaDir)) {
    const data = await readJson(filePath);
    const content = data?.content;

    if (!Array.isArray(content)) {
      continue;
    }

    let changed = false;
    for (const entry of content) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        continue;
      }

      if (!("type" in entry) && typeof entry.url === "string") {
        entry.type = inferContentType(entry.url);
        changed = true;
      }
    }

    if (!changed) {
      continue;
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
    console.log("No media content type changes are needed.");
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
  const result = await migrateMediaContentTypes(detection.projectDir, {
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
