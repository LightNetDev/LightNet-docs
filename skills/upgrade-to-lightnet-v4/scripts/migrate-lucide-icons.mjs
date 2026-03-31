#!/usr/bin/env node

import {
  ensureTargetProject,
  isDirectExecution,
  listProjectFiles,
  parseArgs,
  readText,
  relativePath,
  runCli,
  unique,
  writeText,
} from "./lib/common.mjs";

const FILE_EXTENSIONS = [
  ".astro",
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
];

export const ICON_MAPPINGS = new Map([
  ["mdi--book-open-blank-variant", "lucide--book-open-text"],
  ["mdi--video-outline", "lucide--video"],
  ["mdi--file-document-box-outline", "lucide--file-text"],
  ["mdi--headphones", "lucide--headphones"],
  ["mdi--fountain-pen-tip", "lucide--pen-tool"],
]);

function findIconTokens(content) {
  return content.match(/mdi--[a-z0-9-]+/g) ?? [];
}

function replaceKnownIcons(content) {
  let nextContent = content;
  let mappedOccurrences = 0;

  for (const [fromIcon, toIcon] of ICON_MAPPINGS.entries()) {
    const regex = new RegExp(fromIcon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = nextContent.match(regex);
    if (!matches) {
      continue;
    }

    mappedOccurrences += matches.length;
    nextContent = nextContent.replace(regex, toIcon);
  }

  return {
    content: nextContent,
    mappedOccurrences,
  };
}

async function listSearchableFiles(projectDir) {
  return listProjectFiles(projectDir, { extensions: FILE_EXTENSIONS });
}

export async function inspectLucideIconMappings(projectDir) {
  const files = [];
  const findings = [];
  const warnings = [];
  const unmappedIcons = new Set();
  let mappedOccurrences = 0;

  for (const filePath of await listSearchableFiles(projectDir)) {
    const content = await readText(filePath);
    const replacements = replaceKnownIcons(content);
    const tokens = findIconTokens(content);

    for (const token of tokens) {
      if (!ICON_MAPPINGS.has(token)) {
        unmappedIcons.add(token);
      }
    }

    if (replacements.mappedOccurrences === 0) {
      continue;
    }

    mappedOccurrences += replacements.mappedOccurrences;
    files.push(relativePath(projectDir, filePath));
  }

  if (mappedOccurrences > 0) {
    findings.push(
      `Replace ${mappedOccurrences} known Material Design icon reference${mappedOccurrences === 1 ? "" : "s"} with Lucide equivalents.`,
    );
  }

  if (unmappedIcons.size > 0) {
    warnings.push(
      `Leave ${unmappedIcons.size} unsupported \`mdi--*\` icon id${unmappedIcons.size === 1 ? "" : "s"} unchanged and map them manually.`,
    );
  }

  return {
    id: "migrate-lucide-icons",
    applicable: mappedOccurrences > 0,
    blockers: [],
    files: unique(files),
    findings,
    warnings,
    unmappedIcons: [...unmappedIcons].sort(),
  };
}

export async function migrateLucideIcons(projectDir, options = {}) {
  const inspection = await inspectLucideIconMappings(projectDir);
  const changedFiles = [];

  for (const filePath of await listSearchableFiles(projectDir)) {
    const content = await readText(filePath);
    const replacements = replaceKnownIcons(content);

    if (replacements.mappedOccurrences === 0) {
      continue;
    }

    await writeText(filePath, replacements.content, { dryRun: options.dryRun });
    changedFiles.push(relativePath(projectDir, filePath));
  }

  return {
    ...inspection,
    changedFiles: unique(changedFiles),
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
    console.log("No supported `mdi--` icon mappings were found.");
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (result.unmappedIcons.length > 0) {
    console.log("Unmapped icons you must review manually:");
    for (const icon of result.unmappedIcons) {
      console.log(`- ${icon}`);
    }
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
  const result = await migrateLucideIcons(detection.projectDir, {
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
