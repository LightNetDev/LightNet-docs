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

function compareMembership(left, right) {
  const leftIndex =
    typeof left.index === "number" ? left.index : Number.POSITIVE_INFINITY;
  const rightIndex =
    typeof right.index === "number" ? right.index : Number.POSITIVE_INFINITY;

  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return left.order - right.order;
}

export async function inspectMediaCollections(projectDir) {
  const mediaDir = path.join(projectDir, "src", "content", "media");
  const collectionsDir = path.join(projectDir, "src", "content", "media-collections");
  const findings = [];
  const warnings = [];
  const blockers = [];
  const files = [];
  const mediaFiles = await listJsonFiles(mediaDir);
  const collectionFiles = await listJsonFiles(collectionsDir);
  const collectionFileMap = new Map(
    collectionFiles.map((filePath) => [path.basename(filePath, ".json"), filePath]),
  );
  let membershipCount = 0;
  let legacyFields = 0;

  for (const [order, filePath] of mediaFiles.entries()) {
    const data = await readJson(filePath);
    const memberships = data?.collections;

    if (memberships === undefined) {
      continue;
    }

    if (!Array.isArray(memberships)) {
      blockers.push(
        `${relativePath(projectDir, filePath)} has a non-array \`collections\` field.`,
      );
      continue;
    }

    legacyFields += 1;
    files.push(relativePath(projectDir, filePath));

    for (const membership of memberships) {
      if (!membership || typeof membership !== "object" || Array.isArray(membership)) {
        blockers.push(
          `${relativePath(projectDir, filePath)} has an invalid collection membership entry.`,
        );
        continue;
      }

      if (typeof membership.collection !== "string" || membership.collection.length === 0) {
        blockers.push(
          `${relativePath(projectDir, filePath)} has a collection entry without a valid \`collection\` id.`,
        );
        continue;
      }

      membershipCount += 1;

      if (!collectionFileMap.has(membership.collection)) {
        blockers.push(
          `Missing collection file: src/content/media-collections/${membership.collection}.json`,
        );
      }
    }
  }

  if (legacyFields > 0) {
    findings.push(
      `Remove legacy \`media[].collections\` from ${legacyFields} media file${legacyFields === 1 ? "" : "s"}.`,
    );
  }

  if (membershipCount > 0) {
    findings.push(
      `Move ${membershipCount} media collection membership entr${membershipCount === 1 ? "y" : "ies"} into \`media-collections[].mediaItems\`.`,
    );
  } else {
    warnings.push("No legacy collection memberships were found to copy into `media-collections[].mediaItems`.");
  }

  return {
    id: "migrate-media-collections",
    applicable: legacyFields > 0 || blockers.length > 0,
    blockers: unique(blockers),
    files: unique(files),
    findings,
    warnings,
  };
}

export async function migrateMediaCollections(projectDir, options = {}) {
  const inspection = await inspectMediaCollections(projectDir);

  if (inspection.blockers.length > 0) {
    return { ...inspection, changedFiles: [], exitCode: 1 };
  }

  const mediaDir = path.join(projectDir, "src", "content", "media");
  const collectionsDir = path.join(projectDir, "src", "content", "media-collections");
  const mediaFiles = await listJsonFiles(mediaDir);
  const membershipsByCollection = new Map();
  const mediaFileUpdates = [];

  for (const [order, filePath] of mediaFiles.entries()) {
    const data = await readJson(filePath);
    const memberships = data?.collections;

    if (!Array.isArray(memberships)) {
      continue;
    }

    const mediaId = path.basename(filePath, ".json");
    for (const membership of memberships) {
      if (memberships.length > 0) {
        if (!membershipsByCollection.has(membership.collection)) {
          membershipsByCollection.set(membership.collection, []);
        }

        membershipsByCollection.get(membership.collection).push({
          index: membership.index,
          mediaId,
          order,
        });
      }
    }

    delete data.collections;
    mediaFileUpdates.push({ data, filePath });
  }

  const changedFiles = [];

  for (const [collectionId, memberships] of membershipsByCollection.entries()) {
    const collectionPath = path.join(collectionsDir, `${collectionId}.json`);
    const collectionData = await readJson(collectionPath);

    if (
      collectionData.mediaItems !== undefined &&
      !Array.isArray(collectionData.mediaItems)
    ) {
      throw new Error(
        `${relativePath(projectDir, collectionPath)} has a non-array \`mediaItems\` field.`,
      );
    }

    const migratedOrder = memberships
      .slice()
      .sort(compareMembership)
      .map((entry) => entry.mediaId);
    const existingItems = Array.isArray(collectionData.mediaItems)
      ? collectionData.mediaItems
      : [];
    const nextItems = [
      ...migratedOrder,
      ...existingItems.filter((item) => !migratedOrder.includes(item)),
    ];
    const dedupedItems = unique(nextItems);

    if (JSON.stringify(existingItems) !== JSON.stringify(dedupedItems)) {
      collectionData.mediaItems = dedupedItems;
      await writeJson(collectionPath, collectionData, { dryRun: options.dryRun });
      changedFiles.push(relativePath(projectDir, collectionPath));
    }
  }

  for (const update of mediaFileUpdates) {
    await writeJson(update.filePath, update.data, { dryRun: options.dryRun });
    changedFiles.push(relativePath(projectDir, update.filePath));
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
    console.log("No collection membership migration is needed.");
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
  const result = await migrateMediaCollections(detection.projectDir, {
    dryRun: args["dry-run"] ?? false,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
