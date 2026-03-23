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
  unique,
  writeJson,
} from "./lib/common.mjs";

function isTranslationKeyLabel(value) {
  return typeof value === "string" && (value.startsWith("x.") || value.startsWith("ln."));
}

function convertStringLabel(container, key, defaultLocale, state, location) {
  const value = container?.[key];

  if (typeof value !== "string") {
    return false;
  }

  if (isTranslationKeyLabel(value)) {
    state.skipped.push(`${location} uses translation key "${value}"`);
    return false;
  }

  container[key] = { [defaultLocale]: value };
  state.converted += 1;
  return true;
}

export async function inspectContentLabels(projectDir) {
  const defaultLocale = "en";
  const files = [];
  const blockers = [];
  const warnings = [];
  const findings = [];
  const skipped = [];
  let converted = 0;

  const collectionSpecs = [
    {
      dir: path.join(projectDir, "src", "content", "categories"),
      transform: (data, state, fileLabel) =>
        convertStringLabel(data, "label", defaultLocale, state, `${fileLabel}:label`),
    },
    {
      dir: path.join(projectDir, "src", "content", "media-collections"),
      transform: (data, state, fileLabel) =>
        convertStringLabel(data, "label", defaultLocale, state, `${fileLabel}:label`),
    },
    {
      dir: path.join(projectDir, "src", "content", "media-types"),
      transform: (data, state, fileLabel) => {
        let changed = false;
        changed =
          convertStringLabel(
          data,
          "label",
          defaultLocale,
          state,
          `${fileLabel}:label`,
        ) || changed;

        if (
          data?.detailsPage &&
          typeof data.detailsPage === "object" &&
          !Array.isArray(data.detailsPage)
        ) {
          changed =
            convertStringLabel(
            data.detailsPage,
            "openActionLabel",
            defaultLocale,
            state,
            `${fileLabel}:detailsPage.openActionLabel`,
          ) || changed;
        }

        return changed;
      },
    },
    {
      dir: path.join(projectDir, "src", "content", "media"),
      transform: (data, state, fileLabel) => {
        if (!Array.isArray(data?.content)) {
          return false;
        }

        let changed = false;
        for (const [index, entry] of data.content.entries()) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            continue;
          }

          changed =
            convertStringLabel(
            entry,
            "label",
            defaultLocale,
            state,
            `${fileLabel}:content[${index}].label`,
          ) || changed;
        }

        return changed;
      },
    },
  ];

  for (const spec of collectionSpecs) {
    for (const filePath of await listJsonFiles(spec.dir)) {
      const data = await readJson(filePath);
      const state = { converted: 0, skipped: [] };
      const fileLabel = relativePath(projectDir, filePath);
      const changed = spec.transform(data, state, fileLabel);

      if (state.converted > 0) {
        converted += state.converted;
        files.push(fileLabel);
      }

      if (state.skipped.length > 0) {
        skipped.push(...state.skipped);
      }

      if (
        changed &&
        !files.includes(fileLabel)
      ) {
        files.push(fileLabel);
      }
    }
  }

  if (converted > 0) {
    findings.push(
      `Convert ${converted} string label field${converted === 1 ? "" : "s"} in JSON content collections to inline locale maps.`,
    );
  } else {
    warnings.push("No string label fields were found in the supported JSON content collections.");
  }

  if (skipped.length > 0) {
    warnings.push(
      `Skipped ${skipped.length} label field${skipped.length === 1 ? "" : "s"} that still use translation keys. Review them manually.`,
    );
  }

  return {
    id: "migrate-content-labels",
    applicable: converted > 0 || skipped.length > 0 || blockers.length > 0,
    blockers,
    files: unique(files),
    findings,
    skipped,
    warnings,
  };
}

export async function migrateContentLabels(projectDir, options = {}) {
  if (!options.defaultLocale) {
    throw new Error("`--default-locale` is required.");
  }

  const collectionSpecs = [
    {
      dir: path.join(projectDir, "src", "content", "categories"),
      transform: (data, state, fileLabel) =>
        convertStringLabel(data, "label", options.defaultLocale, state, `${fileLabel}:label`),
    },
    {
      dir: path.join(projectDir, "src", "content", "media-collections"),
      transform: (data, state, fileLabel) =>
        convertStringLabel(data, "label", options.defaultLocale, state, `${fileLabel}:label`),
    },
    {
      dir: path.join(projectDir, "src", "content", "media-types"),
      transform: (data, state, fileLabel) => {
        let changed = false;
        changed =
          convertStringLabel(
          data,
          "label",
          options.defaultLocale,
          state,
          `${fileLabel}:label`,
        ) || changed;

        if (
          data?.detailsPage &&
          typeof data.detailsPage === "object" &&
          !Array.isArray(data.detailsPage)
        ) {
          changed =
            convertStringLabel(
            data.detailsPage,
            "openActionLabel",
            options.defaultLocale,
            state,
            `${fileLabel}:detailsPage.openActionLabel`,
          ) || changed;
        }

        return changed;
      },
    },
    {
      dir: path.join(projectDir, "src", "content", "media"),
      transform: (data, state, fileLabel) => {
        if (!Array.isArray(data?.content)) {
          return false;
        }

        let changed = false;
        for (const [index, entry] of data.content.entries()) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            continue;
          }

          changed =
            convertStringLabel(
            entry,
            "label",
            options.defaultLocale,
            state,
            `${fileLabel}:content[${index}].label`,
          ) || changed;
        }

        return changed;
      },
    },
  ];

  const changedFiles = [];
  const skipped = [];
  let converted = 0;

  for (const spec of collectionSpecs) {
    for (const filePath of await listJsonFiles(spec.dir)) {
      const data = await readJson(filePath);
      const state = { converted: 0, skipped: [] };
      const fileLabel = relativePath(projectDir, filePath);
      const changed = spec.transform(data, state, fileLabel);

      converted += state.converted;
      skipped.push(...state.skipped);

      if (!changed) {
        continue;
      }

      await writeJson(filePath, data, { dryRun: options.dryRun });
      changedFiles.push(fileLabel);
    }
  }

  return {
    id: "migrate-content-labels",
    applicable: converted > 0 || skipped.length > 0,
    blockers: [],
    changedFiles: unique(changedFiles),
    files: unique(changedFiles),
    findings:
      converted > 0
        ? [
            `Convert ${converted} string label field${converted === 1 ? "" : "s"} in JSON content collections to inline locale maps.`,
          ]
        : [],
    skipped,
    warnings:
      skipped.length > 0
        ? [
            `Skipped ${skipped.length} label field${skipped.length === 1 ? "" : "s"} that still use translation keys. Review them manually.`,
          ]
        : converted === 0
          ? [
              "No string label fields were found in the supported JSON content collections.",
            ]
          : [],
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
    console.log("No JSON content label conversions are needed.");
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log("Skipped fields:");
    for (const item of result.skipped) {
      console.log(`- ${item}`);
    }
  }

  if (result.changedFiles?.length > 0) {
    console.log(dryRun ? "Would update:" : "Updated:");
    for (const filePath of result.changedFiles) {
      console.log(`- ${filePath}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    booleanOptions: ["dry-run"],
    stringOptions: ["default-locale", "project"],
  });
  const detection = await ensureTargetProject(args.project);
  const result = await migrateContentLabels(detection.projectDir, {
    defaultLocale: args["default-locale"],
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
