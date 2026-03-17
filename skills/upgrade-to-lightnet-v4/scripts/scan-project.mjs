#!/usr/bin/env node

import path from "node:path";
import {
  detectTargetProject,
  isDirectExecution,
  listFiles,
  parseArgs,
  readText,
  relativePath,
  runCli,
} from "./lib/common.mjs";
import { inspectContentLabels } from "./migrate-content-labels.mjs";
import { inspectCoverImageStyleMigration } from "./migrate-cover-image-style.mjs";
import { inspectImagesFolderMigration } from "./migrate-images-folder.mjs";
import { inspectLucideIconMappings } from "./migrate-lucide-icons.mjs";
import { inspectMediaCollections } from "./migrate-media-collections.mjs";
import { inspectMediaContentTypes } from "./migrate-media-content-types.mjs";
import { inspectPackageJsonUpgrade } from "./update-package-json.mjs";

const CODE_EXTENSIONS = [
  ".astro",
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
];

function createManualFinding(id, title, files, details) {
  return {
    id,
    title,
    files,
    details,
  };
}

async function inspectManualMigrations(projectDir, astroConfigFiles, iconInspection) {
  const srcDir = path.join(projectDir, "src");
  const codeFiles = await listFiles(srcDir, { extensions: CODE_EXTENSIONS });
  const contentJsonFiles = await listFiles(path.join(projectDir, "src", "content"), {
    extensions: [".json"],
  });
  const searchableFiles = [...astroConfigFiles, ...codeFiles, ...contentJsonFiles];
  const results = [];

  const matchedFiles = async (matcher) => {
    const files = [];
    for (const filePath of searchableFiles) {
      const content = await readText(filePath);
      if (matcher(content)) {
        files.push(relativePath(projectDir, filePath));
      }
    }
    return files;
  };

  const legacyLanguagesFiles = await matchedFiles(
    (content) =>
      content.includes("languages:") ||
      content.includes("isDefaultSiteLanguage") ||
      content.includes("fallbackLanguages"),
  );
  if (legacyLanguagesFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-site-languages",
        "Replace legacy `languages` config with `siteLanguages` and create `src/content/languages/*.json` entries.",
        legacyLanguagesFiles,
        [
          "Update `astro.config.*` manually because project config shapes vary.",
          "Create or update language content entries for every configured site locale.",
        ],
      ),
    );
  }

  const decapFiles = await matchedFiles(
    (content) =>
      content.includes("@lightnet/decap-admin") ||
      content.includes("decapAdmin(") ||
      content.includes("imagesFolder") ||
      content.includes("languages:"),
  );
  if (decapFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-admin-integration",
        "Rewrite the admin integration from Decap to `lightnetSveltiaAdmin(...)` and remove obsolete options.",
        decapFiles,
        [
          "Replace imports and integration setup manually in `astro.config.*`.",
          "Remove the old `languages` and `imagesFolder` options from the admin integration config.",
        ],
      ),
    );
  }

  const localeFiles = await matchedFiles((content) =>
    content.includes("Astro.currentLocale"),
  );
  if (localeFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-current-locale",
        "Update locale access from `Astro.currentLocale` to `Astro.locals.i18n.currentLocale`.",
        localeFiles,
        ["Review each file manually and adjust any dependent logic at the same time."],
      ),
    );
  }

  const daisyUiFiles = await matchedFiles(
    (content) => content.includes("daisyui") || content.includes("dy-"),
  );
  if (daisyUiFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-daisyui",
        "Reconfigure DaisyUI manually if the target site still uses it.",
        daisyUiFiles,
        [
          "LightNet v4 no longer injects DaisyUI config automatically.",
          "Confirm plugin, theme, and prefix settings in the target repo's Tailwind setup.",
        ],
      ),
    );
  }

  const mediaGalleryFiles = await matchedFiles(
    (content) =>
      content.includes("MediaGallerySection") &&
      (content.includes("viewLayout") ||
        content.includes('layout="book"') ||
        content.includes('layout="video"') ||
        content.includes('layout="portrait"') ||
        content.includes('layout="landscape"')),
  );
  if (mediaGalleryFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-media-gallery-section",
        "Update `MediaGallerySection` props from the old layout API to `itemWidth` and the new `layout` prop.",
        mediaGalleryFiles,
        ["This is source-code specific, so keep it as an agent-led edit."],
      ),
    );
  }

  const iconFiles = await matchedFiles((content) => content.includes("mdi--"));
  if (iconFiles.length > 0 && iconInspection.unmappedIcons.length > 0) {
    const details = [];

    if (iconInspection.files.length > 0) {
      details.push(
        "Run `scripts/migrate-lucide-icons.mjs` for the supported icon mappings first.",
      );
    }

    if (iconInspection.unmappedIcons.length > 0) {
      details.push(
        `Map unsupported Material Design icon ids manually: ${iconInspection.unmappedIcons.join(", ")}.`,
      );
    } else {
      details.push(
        "Review any remaining icon usage manually after the scripted replacements.",
      );
    }

    results.push(
      createManualFinding(
        "manual-lucide-icons",
        "Review remaining custom icons and replace unsupported `mdi--*` names manually.",
        iconFiles,
        details,
      ),
    );
  }

  return results;
}

function normalizeInspection(inspection, scriptName) {
  return {
    id: inspection.id,
    title: scriptName,
    script: scriptName,
    files: inspection.files,
    details: [
      ...inspection.findings,
      ...inspection.warnings.map((warning) => `Warning: ${warning}`),
      ...inspection.blockers.map((blocker) => `Blocker: ${blocker}`),
    ],
    hasBlockers: inspection.blockers.length > 0,
  };
}

export async function scanProject(projectDir) {
  const detection = await detectTargetProject(projectDir);

  if (!detection.valid) {
    throw new Error(
      `Target project does not look like a LightNet site: ${detection.projectDir}`,
    );
  }

  const packageInspection = await inspectPackageJsonUpgrade(detection.projectDir);
  const imagesInspection = await inspectImagesFolderMigration(detection.projectDir);
  const contentTypesInspection = await inspectMediaContentTypes(detection.projectDir);
  const collectionsInspection = await inspectMediaCollections(detection.projectDir);
  const coverImageInspection = await inspectCoverImageStyleMigration(
    detection.projectDir,
  );
  const labelInspection = await inspectContentLabels(detection.projectDir);
  const iconInspection = await inspectLucideIconMappings(detection.projectDir);
  const manualItems = await inspectManualMigrations(
    detection.projectDir,
    detection.astroConfigFiles,
    iconInspection,
  );

  const scriptable = [
    [packageInspection, "scripts/update-package-json.mjs"],
    [imagesInspection, "scripts/migrate-images-folder.mjs"],
    [contentTypesInspection, "scripts/migrate-media-content-types.mjs"],
    [collectionsInspection, "scripts/migrate-media-collections.mjs"],
    [coverImageInspection, "scripts/migrate-cover-image-style.mjs"],
    [labelInspection, "scripts/migrate-content-labels.mjs --default-locale <code>"],
    [iconInspection, "scripts/migrate-lucide-icons.mjs"],
  ]
    .filter(([inspection]) => inspection.applicable)
    .map(([inspection, scriptName]) => normalizeInspection(inspection, scriptName));

  const warnings = [];
  if (detection.astroConfigFiles.length === 0) {
    warnings.push("No `astro.config.*` file was found.");
  }
  if (!detection.hasContentDir) {
    warnings.push("No `src/content/` directory was found.");
  }

  const nextSteps = [
    "Run the relevant migration scripts with `--dry-run` first.",
    "Apply the manual code and config changes from the v4 migration guide.",
    "Run the target repo's install, build, and test commands after the migration.",
  ];

  return {
    projectDir: detection.projectDir,
    scriptable,
    manual: manualItems,
    warnings,
    nextSteps,
  };
}

function printScan(result) {
  console.log(`Target project: ${result.projectDir}`);

  if (result.scriptable.length > 0) {
    console.log("Scriptable migrations:");
    for (const item of result.scriptable) {
      console.log(`- ${item.title}`);
      for (const detail of item.details) {
        console.log(`  ${detail}`);
      }
      if (item.files.length > 0) {
        console.log(`  Files: ${item.files.join(", ")}`);
      }
    }
  } else {
    console.log("Scriptable migrations: none detected.");
  }

  if (result.manual.length > 0) {
    console.log("Manual migrations:");
    for (const item of result.manual) {
      console.log(`- ${item.title}`);
      for (const detail of item.details) {
        console.log(`  ${detail}`);
      }
      if (item.files.length > 0) {
        console.log(`  Files: ${item.files.join(", ")}`);
      }
    }
  } else {
    console.log("Manual migrations: none detected.");
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  console.log("Next steps:");
  for (const step of result.nextSteps) {
    console.log(`- ${step}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    booleanOptions: ["json"],
    stringOptions: ["project"],
  });
  const result = await scanProject(args.project);

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  printScan(result);
  return 0;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
