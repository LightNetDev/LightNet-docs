#!/usr/bin/env node

import path from "node:path";
import {
  detectPackageManager,
  ensureTargetProject,
  findPackageSection,
  formatJson,
  isDirectExecution,
  parseArgs,
  readJson,
  relativePath,
  removePackage,
  runCli,
  setPackageVersion,
  writeText,
} from "./lib/common.mjs";

const DEFAULT_ASTRO_VERSION = "^6";
const DEFAULT_LIGHTNET_VERSION = "^4";
const DEFAULT_SVELTIA_VERSION = "^4";

export async function inspectPackageJsonUpgrade(projectDir, options = {}) {
  const {
    astroVersion = DEFAULT_ASTRO_VERSION,
    lightnetVersion = DEFAULT_LIGHTNET_VERSION,
    sveltiaVersion = DEFAULT_SVELTIA_VERSION,
  } = options;

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await readJson(packageJsonPath);
  const findings = [];
  const warnings = [];
  const changes = [];
  const blockers = [];

  const lightnetSection = findPackageSection(packageJson, "lightnet");
  const astroSection = findPackageSection(packageJson, "astro");
  const sveltiaSection = findPackageSection(packageJson, "@lightnet/sveltia-admin");
  const decapSection = findPackageSection(packageJson, "@lightnet/decap-admin");
  const tailwindSection = findPackageSection(packageJson, "@astrojs/tailwind");

  if (!lightnetSection) {
    blockers.push("package.json does not declare the `lightnet` package.");
  } else if (packageJson[lightnetSection].lightnet !== lightnetVersion) {
    findings.push(
      `Update \`lightnet\` from ${packageJson[lightnetSection].lightnet} to ${lightnetVersion}.`,
    );
    changes.push({
      packageName: "lightnet",
      action: "set",
      section: lightnetSection,
      version: lightnetVersion,
    });
  }

  if (!astroSection) {
    blockers.push("package.json does not declare the `astro` package.");
  } else if (packageJson[astroSection].astro !== astroVersion) {
    findings.push(
      `Update \`astro\` from ${packageJson[astroSection].astro} to ${astroVersion}.`,
    );
    changes.push({
      packageName: "astro",
      action: "set",
      section: astroSection,
      version: astroVersion,
    });
  }

  if (decapSection) {
    findings.push("Remove `@lightnet/decap-admin` and replace it with `@lightnet/sveltia-admin`.");
    changes.push({
      packageName: "@lightnet/decap-admin",
      action: "remove",
      section: decapSection,
    });

    if (!sveltiaSection) {
      changes.push({
        packageName: "@lightnet/sveltia-admin",
        action: "set",
        section: decapSection,
        version: sveltiaVersion,
      });
      findings.push(
        `Add \`@lightnet/sveltia-admin\` at ${sveltiaVersion} in ${decapSection}.`,
      );
    }
  }

  if (sveltiaSection && packageJson[sveltiaSection]["@lightnet/sveltia-admin"] !== sveltiaVersion) {
    findings.push(
      `Update \`@lightnet/sveltia-admin\` from ${packageJson[sveltiaSection]["@lightnet/sveltia-admin"]} to ${sveltiaVersion}.`,
    );
    changes.push({
      packageName: "@lightnet/sveltia-admin",
      action: "set",
      section: sveltiaSection,
      version: sveltiaVersion,
    });
  }

  if (!sveltiaSection && !decapSection) {
    warnings.push(
      "No admin package dependency was found. This is fine if the target site does not use the administration UI.",
    );
  }

  if (tailwindSection) {
    findings.push("Remove `@astrojs/tailwind` because LightNet v4 no longer uses it.");
    changes.push({
      packageName: "@astrojs/tailwind",
      action: "remove",
      section: tailwindSection,
    });
  }

  return {
    id: "update-package-json",
    applicable: changes.length > 0 || blockers.length > 0 || warnings.length > 0,
    files: [relativePath(projectDir, packageJsonPath)],
    findings,
    warnings,
    blockers,
    changes,
  };
}

export async function updatePackageJson(projectDir, options = {}) {
  const inspection = await inspectPackageJsonUpgrade(projectDir, options);

  if (inspection.blockers.length > 0) {
    return {
      ...inspection,
      changedFiles: [],
      exitCode: 1,
    };
  }

  if (inspection.changes.length === 0) {
    return {
      ...inspection,
      changedFiles: [],
      installCommand: detectPackageManager(projectDir),
      exitCode: 0,
    };
  }

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await readJson(packageJsonPath);

  for (const change of inspection.changes) {
    if (change.action === "remove") {
      removePackage(packageJson, change.packageName);
      continue;
    }

    setPackageVersion(
      packageJson,
      change.packageName,
      change.version,
      change.section,
    );
  }

  await writeText(packageJsonPath, formatJson(packageJson), {
    dryRun: options.dryRun,
  });

  return {
    ...inspection,
    changedFiles: [relativePath(projectDir, packageJsonPath)],
    installCommand: detectPackageManager(projectDir),
    exitCode: 0,
  };
}

function printResult(result, { dryRun = false } = {}) {
  console.log(`Target project: ${result.files[0] === "package.json" ? "." : result.files[0]}`);

  if (result.findings.length > 0) {
    console.log("Planned package changes:");
    for (const finding of result.findings) {
      console.log(`- ${finding}`);
    }
  } else {
    console.log("No package.json changes are needed.");
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
    const mode = dryRun ? "Would update" : "Updated";
    console.log(`${mode}:`);
    for (const filePath of result.changedFiles) {
      console.log(`- ${filePath}`);
    }
  }

  console.log(`Next step: run \`${result.installCommand}\` in the target project.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    booleanOptions: ["dry-run"],
    stringOptions: ["astro-version", "lightnet-version", "project", "sveltia-version"],
  });
  const detection = await ensureTargetProject(args.project);
  const result = await updatePackageJson(detection.projectDir, {
    astroVersion: args["astro-version"] ?? DEFAULT_ASTRO_VERSION,
    dryRun: args["dry-run"] ?? false,
    lightnetVersion: args["lightnet-version"] ?? DEFAULT_LIGHTNET_VERSION,
    sveltiaVersion: args["sveltia-version"] ?? DEFAULT_SVELTIA_VERSION,
  });

  printResult(result, { dryRun: args["dry-run"] ?? false });
  return result.exitCode;
}

if (isDirectExecution(import.meta.url)) {
  await runCli(main);
}
