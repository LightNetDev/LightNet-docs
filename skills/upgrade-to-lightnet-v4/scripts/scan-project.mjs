#!/usr/bin/env node

import {
  detectTargetProject,
  isDirectExecution,
  listProjectFiles,
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

const PROJECT_SCAN_EXTENSIONS = [
  ...CODE_EXTENSIONS,
  ".json",
  ".md",
  ".mdx",
  ".yaml",
  ".yml",
];

function createManualFinding(id, title, files, details) {
  return {
    id,
    title,
    files,
    details,
  };
}

function detectConfigLabelFields(content) {
  const fields = [];

  if (/\btitle\s*:\s*["'`]/.test(content)) {
    fields.push("title");
  }

  if (/\blogo\s*:\s*\{[\s\S]*?\balt\s*:\s*["'`]/.test(content)) {
    fields.push("logo.alt");
  }

  if (/\bmainMenu\s*:\s*\[[\s\S]*?\blabel\s*:\s*["'`]/.test(content)) {
    fields.push("mainMenu[].label");
  }

  if (/\blanguages\s*:\s*\[[\s\S]*?\blabel\s*:\s*["'`]/.test(content)) {
    fields.push("languages[].label");
  }

  return fields;
}

function matchesTranslationMapRead(content) {
  return (
    /\b[A-Za-z_$][\w$]*\s*\.\s*data\s*\.\s*label\b/.test(content) ||
    /\b[A-Za-z_$][\w$]*\s*\.\s*data\s*\[\s*["'`]label["'`]\s*\]/.test(content)
  );
}

async function inspectManualMigrations(projectDir, astroConfigFiles, iconInspection) {
  const projectFiles = await listProjectFiles(projectDir, {
    extensions: PROJECT_SCAN_EXTENSIONS,
  });
  const searchableFiles = projectFiles.filter(
    (filePath) => !astroConfigFiles.includes(filePath),
  );
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

  const configInlineLabelFiles = [];
  const configFields = new Set();
  for (const filePath of astroConfigFiles) {
    const content = await readText(filePath);
    const detectedFields = detectConfigLabelFields(content);
    if (detectedFields.length > 0) {
      configInlineLabelFiles.push(relativePath(projectDir, filePath));
      for (const field of detectedFields) {
        configFields.add(field);
      }
    }
  }
  if (configInlineLabelFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-config-inline-labels",
        "Convert inline translation-capable config fields in `astro.config.*` to locale maps.",
        configInlineLabelFiles,
        [
          `Review these fields: ${[...configFields].sort().map((field) => `\`${field}\``).join(", ")}.`,
          "Replace plain-string or translation-key string values with inline locale maps.",
          "Keep the guidance generic to the target repo's configured locales and existing config structure.",
        ],
      ),
    );
  }

  const decapFiles = await matchedFiles(
    (content) =>
      content.includes("@lightnet/decap-admin") ||
      content.includes("decapAdmin(") ||
      content.includes("imagesFolder"),
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

  const daisyUiConfigFiles = [];
  for (const filePath of projectFiles) {
    const content = await readText(filePath);
    const relPath = relativePath(projectDir, filePath);
    const looksLikeTailwindConfig = /tailwind\.config\.(c|m)?(j|t)s$/.test(filePath);
    const mentionsDaisyUiConfig =
      content.includes("daisyui") ||
      /prefix\s*:\s*["'`]dy-["'`]/.test(content) ||
      /plugins\s*:\s*\[[\s\S]*daisyui/.test(content);

    if (
      looksLikeTailwindConfig ||
      relPath === "package.json" ||
      astroConfigFiles.includes(filePath)
    ) {
      if (mentionsDaisyUiConfig) {
        daisyUiConfigFiles.push(relPath);
      }
    }
  }
  if (daisyUiConfigFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-daisyui-config",
        "Review explicit DaisyUI configuration that LightNet v4 no longer injects automatically.",
        daisyUiConfigFiles,
        [
          "LightNet v4 no longer injects DaisyUI config automatically.",
          "Decide whether to keep DaisyUI with explicit project-owned Tailwind/plugin configuration or remove that dependency from the target repo.",
        ],
      ),
    );
  }

  const daisyUiMarkupFiles = await matchedFiles((content) => content.includes("dy-"));
  if (daisyUiMarkupFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-daisyui-markup",
        "Review DaisyUI-style markup and class usage as a manual design-system decision.",
        daisyUiMarkupFiles,
        [
          "Treat this as a manual design-system decision rather than a silent cleanup.",
          "Do not remove DaisyUI-style markup blindly.",
          "Choose whether to keep DaisyUI with explicit config, replace it with site-owned component styles, or replace it with another design-system primitive.",
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
        [
          "Map old content-like `layout` values such as `video`, `book`, `portrait`, and `landscape` to the new `itemWidth` prop.",
          "Map old `viewLayout` values to the new `layout` prop such as `grid` or `carousel`.",
          "Keep this as a manual, source-aware migration rather than an automatic rewrite.",
        ],
      ),
    );
  }

  const translationMapReadFiles = await matchedFiles(matchesTranslationMapRead);
  if (translationMapReadFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-translation-map-reads",
        "Update direct reads of migrated label-map fields to use `Astro.locals.i18n.tMap(...)`.",
        translationMapReadFiles,
        [
          "Fields such as `collection.data.label` now hold inline locale maps instead of plain strings.",
          "Replace direct reads with `Astro.locals.i18n.tMap(...)` where localized labels are rendered.",
        ],
      ),
    );
  }

  const legacyCustomKeyFiles = await matchedFiles(
    (content) =>
      /\bx\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+\b/.test(content),
  );
  if (legacyCustomKeyFiles.length > 0) {
    results.push(
      createManualFinding(
        "manual-legacy-custom-translation-keys",
        "Review legacy custom translation keys that still use the `x.` prefix.",
        legacyCustomKeyFiles,
        [
          "Rename old prefixed custom keys consistently across source, config, content, and translation files.",
          "Update call sites to the new key names and remove obsolete translation entries after the migration.",
        ],
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
  const labelInspection = await inspectContentLabels(detection.projectDir, {
    astroConfigFiles: detection.astroConfigFiles,
  });
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
    "Finish with grep-style verification for remaining `mdi--`, `viewLayout`, old gallery layout values, and `./_images/` references.",
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
