import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { inspectContentLabels, migrateContentLabels } from "../migrate-content-labels.mjs";
import { migrateCoverImageStyle } from "../migrate-cover-image-style.mjs";
import { migrateImagesFolder } from "../migrate-images-folder.mjs";
import { migrateLucideIcons } from "../migrate-lucide-icons.mjs";
import { migrateMediaCollections } from "../migrate-media-collections.mjs";
import { migrateMediaContentTypes } from "../migrate-media-content-types.mjs";
import { scanProject } from "../scan-project.mjs";
import { updatePackageJson } from "../update-package-json.mjs";

async function createProject() {
  const root = await mkdtemp(path.join(os.tmpdir(), "upgrade-to-lightnet-v4-"));

  await writeJson(root, "package.json", {
    dependencies: {
      astro: "^5.0.0",
      lightnet: "^3.5.0",
    },
  });
  await writeText(
    root,
    "astro.config.mjs",
    `import { defineConfig } from "astro/config";

export default defineConfig({});
`,
  );
  await mkdir(path.join(root, "src", "content"), { recursive: true });

  return root;
}

async function writeText(root, relativeFilePath, content) {
  const filePath = path.join(root, relativeFilePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function writeJson(root, relativeFilePath, value) {
  await writeText(root, relativeFilePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(root, relativeFilePath) {
  const content = await readFile(path.join(root, relativeFilePath), "utf8");
  return JSON.parse(content);
}

test("update-package-json updates LightNet packages and removes deprecated ones", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "package.json", {
    dependencies: {
      "@astrojs/tailwind": "^5.1.0",
      "@lightnet/decap-admin": "^3.2.0",
      astro: "^5.1.0",
      lightnet: "^3.5.0",
    },
  });

  const result = await updatePackageJson(projectDir);
  const packageJson = await readJson(projectDir, "package.json");

  assert.equal(result.exitCode, 0);
  assert.deepEqual(packageJson.dependencies, {
    "@lightnet/sveltia-admin": "^4",
    astro: "^6",
    lightnet: "^4",
  });
});

test("migrate-images-folder renames the media image directory and rewrites JSON references", async () => {
  const projectDir = await createProject();
  await writeText(projectDir, "src/content/media/_images/example.txt", "placeholder");
  await writeJson(projectDir, "src/content/media/book--en.json", {
    image: "./_images/example.txt",
  });

  const result = await migrateImagesFolder(projectDir);
  const mediaJson = await readJson(projectDir, "src/content/media/book--en.json");

  assert.equal(result.exitCode, 0);
  assert.equal(mediaJson.image, "./images/example.txt");
  await readFile(path.join(projectDir, "src/content/media/images/example.txt"), "utf8");
});

test("migrate-media-content-types infers upload and link types", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/media/book--en.json", {
    content: [
      { url: "/files/book.pdf" },
      { url: "https://example.com/book.pdf" },
      { type: "upload", url: "/files/keep.pdf" },
    ],
  });

  const result = await migrateMediaContentTypes(projectDir);
  const mediaJson = await readJson(projectDir, "src/content/media/book--en.json");

  assert.equal(result.exitCode, 0);
  assert.deepEqual(
    mediaJson.content.map((entry) => entry.type),
    ["upload", "link", "upload"],
  );
});

test("migrate-media-collections moves memberships into media-collections files", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/media/first--en.json", {
    collections: [{ collection: "featured", index: 2 }, { collection: "learn-series" }],
    title: "First",
  });
  await writeJson(projectDir, "src/content/media/second--en.json", {
    collections: [{ collection: "featured", index: 1 }],
    title: "Second",
  });
  await writeJson(projectDir, "src/content/media-collections/featured.json", {
    label: { en: "Featured" },
    mediaItems: ["existing-item"],
  });
  await writeJson(projectDir, "src/content/media-collections/learn-series.json", {
    label: { en: "Learn Series" },
  });

  const result = await migrateMediaCollections(projectDir);
  const featured = await readJson(projectDir, "src/content/media-collections/featured.json");
  const learnSeries = await readJson(
    projectDir,
    "src/content/media-collections/learn-series.json",
  );
  const first = await readJson(projectDir, "src/content/media/first--en.json");

  assert.equal(result.exitCode, 0);
  assert.deepEqual(featured.mediaItems, ["second--en", "first--en", "existing-item"]);
  assert.deepEqual(learnSeries.mediaItems, ["first--en"]);
  assert.equal("collections" in first, false);
});

test("migrate-cover-image-style moves detailsPage.coverStyle to coverImageStyle", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/media-types/video.json", {
    detailsPage: {
      coverStyle: "video",
      layout: "default",
    },
  });

  const result = await migrateCoverImageStyle(projectDir);
  const mediaType = await readJson(projectDir, "src/content/media-types/video.json");

  assert.equal(result.exitCode, 0);
  assert.equal(mediaType.coverImageStyle, "video");
  assert.deepEqual(mediaType.detailsPage, { layout: "default" });
});

test("migrate-content-labels converts strings and skips translation-key labels", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/categories/teaching.json", {
    label: "Teaching",
  });
  await writeJson(projectDir, "src/content/media-types/video.json", {
    detailsPage: {
      openActionLabel: "Watch now",
    },
    label: "Video",
  });
  await writeJson(projectDir, "src/content/media/book--en.json", {
    content: [
      { label: "Read PDF", url: "/files/book.pdf" },
      { label: "x.home.title", url: "/files/other.pdf" },
    ],
  });

  const result = await migrateContentLabels(projectDir, { defaultLocale: "en" });
  const category = await readJson(projectDir, "src/content/categories/teaching.json");
  const mediaType = await readJson(projectDir, "src/content/media-types/video.json");
  const media = await readJson(projectDir, "src/content/media/book--en.json");

  assert.equal(result.exitCode, 0);
  assert.deepEqual(category.label, { en: "Teaching" });
  assert.deepEqual(mediaType.label, { en: "Video" });
  assert.deepEqual(mediaType.detailsPage.openActionLabel, { en: "Watch now" });
  assert.deepEqual(media.content[0].label, { en: "Read PDF" });
  assert.equal(media.content[1].label, "x.home.title");
  assert.equal(result.skipped.length, 1);
});

test("inspect-content-labels uses a derived default locale when astro config provides one", async () => {
  const projectDir = await createProject();
  await writeText(
    projectDir,
    "astro.config.mjs",
    `import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
  },
});
`,
  );
  await writeJson(projectDir, "src/content/categories/teaching.json", {
    label: "Lehre",
  });

  const result = await inspectContentLabels(projectDir, {
    astroConfigFiles: [path.join(projectDir, "astro.config.mjs")],
  });

  assert.equal(result.defaultLocale, "de");
  assert.match(result.findings[0], /default locale `de`/);
  assert.equal(
    result.warnings.some((warning) => warning.includes("locale-agnostic")),
    false,
  );
});

test("inspect-content-labels warns clearly when the default locale cannot be derived", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/categories/teaching.json", {
    label: "Teaching",
  });

  const result = await inspectContentLabels(projectDir, {
    astroConfigFiles: [path.join(projectDir, "astro.config.mjs")],
  });

  assert.equal(result.defaultLocale, null);
  assert.match(result.findings[0], /Inspect 1 string label field/);
  assert.ok(
    result.warnings.some((warning) =>
      warning.includes("locale-agnostic until you provide `--default-locale <code>`"),
    ),
  );
});

test("migrate-lucide-icons replaces only known icon mappings and leaves the rest for manual review", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/media-types/book.json", {
    icon: "mdi--book-open-blank-variant",
  });
  await writeText(
    projectDir,
    "src/components/IconDemo.astro",
    `<Icon name="mdi--video-outline" />\n<Icon name="mdi--book-open-page-variant" />\n`,
  );

  const result = await migrateLucideIcons(projectDir);
  const mediaType = await readJson(projectDir, "src/content/media-types/book.json");
  const iconDemo = await readFile(
    path.join(projectDir, "src/components/IconDemo.astro"),
    "utf8",
  );

  assert.equal(result.exitCode, 0);
  assert.equal(mediaType.icon, "lucide--book-open-text");
  assert.match(iconDemo, /lucide--video/);
  assert.match(iconDemo, /mdi--book-open-page-variant/);
  assert.deepEqual(result.unmappedIcons, ["mdi--book-open-page-variant"]);
});

test("migrate-lucide-icons ignores vendored and non-project paths", async () => {
  const projectDir = await createProject();
  await writeText(
    projectDir,
    "src/components/IconDemo.astro",
    `<Icon name="mdi--video-outline" />\n`,
  );
  await writeText(projectDir, "docs/icon-guide.mdx", `<Icon name="mdi--video-outline" />\n`);
  await writeText(
    projectDir,
    ".codex/cache/example.mdx",
    `<Icon name="mdi--video-outline" />\n`,
  );
  await writeText(
    projectDir,
    "fixtures/example/IconDemo.astro",
    `<Icon name="mdi--video-outline" />\n`,
  );
  await writeText(
    projectDir,
    "skills/upgrade-to-lightnet-v4/SKILL.md",
    `mdi--video-outline\n`,
  );

  const result = await migrateLucideIcons(projectDir);
  const appFile = await readFile(path.join(projectDir, "src/components/IconDemo.astro"), "utf8");
  const docsFile = await readFile(path.join(projectDir, "docs/icon-guide.mdx"), "utf8");
  const codexFile = await readFile(path.join(projectDir, ".codex/cache/example.mdx"), "utf8");
  const fixtureFile = await readFile(
    path.join(projectDir, "fixtures/example/IconDemo.astro"),
    "utf8",
  );
  const vendoredSkill = await readFile(
    path.join(projectDir, "skills/upgrade-to-lightnet-v4/SKILL.md"),
    "utf8",
  );

  assert.equal(result.exitCode, 0);
  assert.match(appFile, /lucide--video/);
  assert.match(docsFile, /mdi--video-outline/);
  assert.match(codexFile, /mdi--video-outline/);
  assert.match(fixtureFile, /mdi--video-outline/);
  assert.match(vendoredSkill, /mdi--video-outline/);
  assert.deepEqual(result.changedFiles, ["src/components/IconDemo.astro"]);
});

test("media JSON rewrites normalize legacy image paths across script order", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "src/content/media/book--en.json", {
    collections: [{ collection: "featured" }],
    content: [{ label: "Read", url: "/files/book.pdf" }],
    image: "./_images/example.jpg",
  });
  await writeJson(projectDir, "src/content/media-collections/featured.json", {
    label: { en: "Featured" },
  });

  await migrateMediaContentTypes(projectDir);
  await migrateContentLabels(projectDir, { defaultLocale: "en" });
  await migrateMediaCollections(projectDir);

  const media = await readJson(projectDir, "src/content/media/book--en.json");

  assert.equal(media.image, "./images/example.jpg");
  assert.equal(JSON.stringify(media).includes("./_images/"), false);
});

test("scan-project reports generic config, translation-map, DaisyUI, gallery, and key cleanup guidance", async () => {
  const projectDir = await createProject();
  await writeJson(projectDir, "package.json", {
    dependencies: {
      "@lightnet/decap-admin": "^3.0.0",
      astro: "^5.0.0",
      daisyui: "^4.0.0",
      lightnet: "^3.0.0",
    },
  });
  await writeText(
    projectDir,
    "astro.config.mjs",
    `import decapAdmin from "@lightnet/decap-admin";

export default {
  title: "Site title",
  logo: { alt: "Site logo" },
  mainMenu: [{ href: "/about", label: "About" }],
  languages: [{ code: "en", label: "English", isDefaultSiteLanguage: true }],
  integrations: [decapAdmin({ imagesFolder: "_images" })],
};
`,
  );
  await writeText(
    projectDir,
    "tailwind.config.mjs",
    `import daisyui from "daisyui";

export default {
  plugins: [daisyui],
  daisyui: {
    prefix: "dy-",
  },
};
`,
  );
  await writeText(
    projectDir,
    "src/pages/index.astro",
    `---
const currentLocale = Astro.currentLocale;
const title = Astro.locals.i18n.tMap(config.title, { fallbackLocale: "en" });
---
<div class="dy-btn">{currentLocale}</div>
<div>{title}</div>
`,
  );
  await writeText(
    projectDir,
    "src/components/Gallery.astro",
    `<MediaGallerySection items={items} layout="book" viewLayout="grid" />`,
  );
  await writeText(
    projectDir,
    "src/components/CollectionCard.astro",
    `---
const label = collection.data.label;
---
<div>{label}</div>
`,
  );
  await writeText(projectDir, "src/i18n/en.yml", `x.site.title: "Welcome"\n`);
  await writeJson(projectDir, "src/content/media/book--en.json", {
    collections: [{ collection: "featured" }],
    content: [{ label: "Read", url: "/files/book.pdf" }],
    image: "./_images/example.jpg",
  });
  await writeJson(projectDir, "src/content/media-types/book.json", {
    detailsPage: { coverStyle: "book" },
    icon: "mdi--book-open-page-variant",
  });
  await writeJson(projectDir, "src/content/media-collections/featured.json", {
    label: "Featured",
  });

  const result = await scanProject(projectDir);
  const configFinding = result.manual.find((item) => item.id === "manual-config-inline-labels");
  const translationMapFinding = result.manual.find(
    (item) => item.id === "manual-translation-map-reads",
  );
  const daisyConfigFinding = result.manual.find((item) => item.id === "manual-daisyui-config");
  const daisyMarkupFinding = result.manual.find((item) => item.id === "manual-daisyui-markup");
  const galleryFinding = result.manual.find(
    (item) => item.id === "manual-media-gallery-section",
  );
  const keyFinding = result.manual.find(
    (item) => item.id === "manual-legacy-custom-translation-keys",
  );

  assert.ok(
    result.scriptable.some((item) => item.id === "update-package-json"),
    "expected package migration to be detected",
  );
  assert.ok(
    result.scriptable.some((item) => item.id === "migrate-media-collections"),
    "expected collection migration to be detected",
  );
  assert.ok(
    result.manual.some((item) => item.id === "manual-current-locale"),
    "expected Astro.currentLocale migration to be detected",
  );
  assert.ok(configFinding, "expected generic config inline label migration to be detected");
  assert.match(configFinding.details.join("\n"), /`title`/);
  assert.match(configFinding.details.join("\n"), /`logo\.alt`/);
  assert.match(configFinding.details.join("\n"), /`mainMenu\[\]\.label`/);
  assert.match(configFinding.details.join("\n"), /`languages\[\]\.label`/);
  assert.ok(
    translationMapFinding,
    "expected direct translation-map read migration to be detected",
  );
  assert.match(translationMapFinding.title, /tMap/);
  assert.ok(daisyConfigFinding, "expected DaisyUI config detection");
  assert.ok(daisyMarkupFinding, "expected DaisyUI markup detection");
  assert.match(daisyMarkupFinding.details.join("\n"), /manual design-system decision/);
  assert.ok(
    galleryFinding,
    "expected MediaGallerySection migration to be detected",
  );
  assert.match(galleryFinding.details.join("\n"), /`layout` values such as `video`, `book`/);
  assert.match(galleryFinding.details.join("\n"), /old `viewLayout` values/);
  assert.ok(keyFinding, "expected legacy custom translation-key cleanup to be detected");
  assert.match(keyFinding.details.join("\n"), /remove obsolete translation entries/);
  assert.ok(
    result.manual.some((item) => item.id === "manual-lucide-icons"),
    "expected icon review to be detected",
  );
});
