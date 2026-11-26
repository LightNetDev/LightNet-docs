// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import linksValidator from "starlight-links-validator";
import llmsTxt from "starlight-llms-txt";
import announcement from "starlight-announcement";
import sidebarTopics from "starlight-sidebar-topics";
import { readdir, readFile, writeFile } from "node:fs/promises";

const site = "https://docs.lightnet.community";

/**
 * Rewrites site-relative Markdown links in the generated llms.txt files to absolute URLs,
 * so agents can follow them without knowing where the file came from.
 * @returns {import("astro").AstroIntegration}
 */
function absoluteLlmsTxtLinks() {
  return {
    name: "absolute-llms-txt-links",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const files = [
          ...["llms.txt", "llms-full.txt", "llms-small.txt"].map(
            (name) => new URL(name, dir),
          ),
          ...(await readdir(new URL("_llms-txt/", dir))).map(
            (name) => new URL(`_llms-txt/${name}`, dir),
          ),
        ];
        for (const file of files) {
          const text = await readFile(file, "utf8");
          await writeFile(file, text.replace(/\]\(\/(?!\/)/g, `](${site}/`));
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "LightNet",
      credits: true,
      head: [
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://plausible.io/js/pa-lvbjEZBNHGmir95L5sKqA.js",
          },
        },
        {
          tag: "script",
          content:
            "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
        },
      ],
      logo: {
        alt: "LightNet",
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      social: [
        {
          label: "GitHub",
          icon: "github",
          href: "https://github.com/LightNetDev/LightNet",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/LightNetDev/lightnet-docs/edit/main/",
      },
      plugins: [
        sidebarTopics([
          {
            label: "Ministry Documentation",
            link: "/ministry/start-here/getting-started",
            icon: "open-book",
            items: [
              {
                label: "Start here",
                items: [{ slug: "ministry/start-here/getting-started" }],
              },
              {
                label: "Plan",
                items: [
                  {
                    label: "Concepts",
                    items: [
                      { slug: "ministry/concepts/content-lifecycle" },
                      { slug: "ministry/concepts/how-lightnet-works" },
                      { slug: "ministry/concepts/why-lightnet" },
                      {
                        label: "Site navigation",
                        slug: "ministry/concepts/site-navigation",
                      },
                      { slug: "ministry/concepts/languages" },
                    ],
                  },
                ],
              },
              {
                label: "Build",
                items: [
                  { slug: "ministry/build/setup-github" },
                  { slug: "ministry/build/setup-cloudflare" },
                ],
              },
              {
                label: "Resources",
                items: [{ slug: "ministry/resources/glossary" }],
              },
            ],
          },
          {
            label: "Developer Documentation",
            link: "/start-here/getting-started",
            icon: "seti:json",
            items: [
              {
                label: "Start here",
                items: [
                  { slug: "start-here/getting-started" },
                  { slug: "start-here/setup-checklist" },
                ],
              },
              {
                label: "Concepts",
                items: [
                  { slug: "concepts/media-site-structure" },
                  { slug: "concepts/architecture" },
                  { slug: "concepts/collaboration" },
                ],
              },
              {
                label: "Build",
                items: [
                  { slug: "build/astro" },
                  {
                    label: "Global configuration",
                    items: [
                      { slug: "build/configuration/initialize-configuration" },
                      { slug: "build/configuration/set-logo" },
                      { slug: "build/configuration/set-favicon" },
                      { slug: "build/configuration/set-main-menu" },
                      { slug: "build/configuration/set-primary-color" },
                      { slug: "build/configuration/reference" },
                    ],
                  },
                  {
                    label: "Internationalization",
                    items: [
                      { slug: "build/i18n/fundamentals" },
                      { slug: "build/i18n/add-language" },
                      { slug: "build/i18n/custom-site-strings" },
                      { slug: "build/i18n/astro-locals-i18n" },
                    ],
                  },
                  {
                    label: "Pages",
                    items: [
                      { slug: "build/pages/fundamentals" },
                      { slug: "build/pages/initialize-homepage" },
                      { slug: "build/pages/markdown-page" },
                      { slug: "build/pages/section" },
                      { slug: "build/pages/hero-section" },
                      { slug: "build/pages/media-gallery-section" },
                      { slug: "build/pages/categories-section" },
                      { slug: "build/pages/search-section" },
                      { slug: "build/pages/highlight-section" },
                      { slug: "build/pages/video-player" },
                      { slug: "build/pages/media-list" },
                      { slug: "build/pages/search-input" },
                      { slug: "build/pages/custom-components" },
                      { slug: "build/pages/query-media-items" },
                      { slug: "build/pages/create-internal-links" },
                      { slug: "build/pages/footer" },
                    ],
                  },
                ],
              },
              {
                label: "Add content",
                items: [
                  { slug: "content/fundamentals" },
                  { slug: "content/media-items" },
                  { slug: "content/media-types" },
                  { slug: "content/categories" },
                  { slug: "content/media-collections" },
                  { slug: "content/administration-ui" },
                  { slug: "content/setup-github-auth" },
                ],
              },
              {
                label: "Deploy",
                items: [
                  { slug: "deploy/hosting" },
                  { slug: "deploy/custom-domain" },
                  { slug: "deploy/search-engines" },
                  { slug: "deploy/file-storage" },
                  { slug: "deploy/analytics" },
                ],
              },
              {
                label: "Run",
                items: [
                  { slug: "run/update" },
                  { slug: "run/monitor" },
                  {
                    label: "Major upgrade guides",
                    items: [{ slug: "run/upgrade-to/v4", label: "v4.0" }],
                  },
                ],
              },
              {
                label: "LightNet CLI",
                items: [
                  { slug: "cli/overview" },
                  { slug: "cli/check-files" },
                  { slug: "cli/check-links" },
                  { slug: "cli/check-translations" },
                  { slug: "cli/r2" },
                  { slug: "cli/setup-github-auth" },
                ],
              },
              {
                label: "Resources",
                items: [
                  { slug: "resources/error-reference" },
                  { slug: "resources/versions" },
                ],
              },
            ],
          },
        ]),
        announcement({
          announcements: [
            {
              id: "v4-release",
              hideOn: ["/ministry/**"],
              content: "LightNet v4 is here! ",
              link: {
                text: "Learn how to upgrade your site",
                href: "/run/upgrade-to/v4/",
              },
            },
          ],
        }),
        llmsTxt({
          projectName: "LightNet Docs",
          description:
            "Documentation for LightNet, an Astro integration for building static, multilingual media library websites (for example, a ministry's library of videos, audio, books, and other media).",
          details: `LightNet uses static site generation (SSG) to turn structured content into a fast, secure media library. It is built on Astro and provides prebuilt layouts, pages, components, an optional browser-based Administration UI, and a CLI. Sites are typically stored on GitHub and hosted on Cloudflare Workers, with optional Cloudflare R2 storage for large files.

The documentation has two sections:
- Developer Documentation (all paths except \`/ministry/\`): for Site Administrators, the developers who set up, build, deploy, and run a LightNet Site. This is the section coding agents usually need.
- Ministry Documentation (\`/ministry/\`): plain-language guidance for ministries and Content Administrators who make project decisions. Use its Glossary for the shared vocabulary.

Docs are organized around three lifecycle stages: Plan, Build, and Run.

Key facts for coding agents:
- Docs are verified against specific package versions; see [Versions](https://docs.lightnet.community/resources/versions/). Check the project's \`package.json\` before applying instructions.
- Packages: \`lightnet\` (Astro integration), \`@lightnet/cli\` (run as \`pnpm lightnet <command>\`), \`@lightnet/sveltia-admin\` (Administration UI), \`@lightnet/sveltia-github-auth\` (Administration UI sign-in), \`@lightnet/plausible-analytics\` (analytics).
- The integration is configured in \`astro.config.mjs\` with \`lightnet({ ... })\`; see the [configuration reference](https://docs.lightnet.community/build/configuration/reference/) for exact option shapes.
- Content lives in JSON files in content collections: \`src/content/media/\` (media items), \`src/content/media-types/\`, \`src/content/categories/\`, and \`src/content/media-collections/\`.
- Pages are Astro or Markdown files under \`src/pages/[locale]/\`; custom site strings live in \`src/translations/<locale>.yml\`.
- Use pnpm for package management. Look up build or runtime error messages in the [error reference](https://docs.lightnet.community/resources/error-reference/).

Key pages by task:
- Set up a new site: [Getting started](https://docs.lightnet.community/start-here/getting-started/), [Setup checklist](https://docs.lightnet.community/start-here/setup-checklist/)
- Understand the system: [Architecture](https://docs.lightnet.community/concepts/architecture/), [Media library structure](https://docs.lightnet.community/concepts/media-site-structure/), [Astro foundation](https://docs.lightnet.community/build/astro/)
- Configure the site: [Initialize configuration](https://docs.lightnet.community/build/configuration/initialize-configuration/), [Configuration reference](https://docs.lightnet.community/build/configuration/reference/)
- Languages: [i18n fundamentals](https://docs.lightnet.community/build/i18n/fundamentals/), [Add a site language](https://docs.lightnet.community/build/i18n/add-language/), [Custom translation keys](https://docs.lightnet.community/build/i18n/custom-site-strings/), [Astro.locals.i18n reference](https://docs.lightnet.community/build/i18n/astro-locals-i18n/)
- Build pages: [Pages fundamentals](https://docs.lightnet.community/build/pages/fundamentals/), [Customize homepage](https://docs.lightnet.community/build/pages/initialize-homepage/), [Query media items](https://docs.lightnet.community/build/pages/query-media-items/), [Custom components](https://docs.lightnet.community/build/pages/custom-components/), [Internal links](https://docs.lightnet.community/build/pages/create-internal-links/)
- Page components: [Section](https://docs.lightnet.community/build/pages/section/), [HeroSection](https://docs.lightnet.community/build/pages/hero-section/), [MediaGallerySection](https://docs.lightnet.community/build/pages/media-gallery-section/), [CategoriesSection](https://docs.lightnet.community/build/pages/categories-section/), [SearchSection](https://docs.lightnet.community/build/pages/search-section/), [HighlightSection](https://docs.lightnet.community/build/pages/highlight-section/), [VideoPlayer](https://docs.lightnet.community/build/pages/video-player/), [MediaList](https://docs.lightnet.community/build/pages/media-list/), [SearchInput](https://docs.lightnet.community/build/pages/search-input/), [Footer](https://docs.lightnet.community/build/pages/footer/)
- Manage content: [Content fundamentals](https://docs.lightnet.community/content/fundamentals/), [Media items](https://docs.lightnet.community/content/media-items/), [Media types](https://docs.lightnet.community/content/media-types/), [Categories](https://docs.lightnet.community/content/categories/), [Media collections](https://docs.lightnet.community/content/media-collections/)
- Administration UI: [Add the Administration UI](https://docs.lightnet.community/content/administration-ui/), [Set up GitHub authentication](https://docs.lightnet.community/content/setup-github-auth/)
- Deploy: [Hosting](https://docs.lightnet.community/deploy/hosting/), [Custom domain](https://docs.lightnet.community/deploy/custom-domain/), [Search engines](https://docs.lightnet.community/deploy/search-engines/), [Large file storage (R2)](https://docs.lightnet.community/deploy/file-storage/), [Analytics](https://docs.lightnet.community/deploy/analytics/)
- Run and maintain: [Update your site](https://docs.lightnet.community/run/update/), [Monitor availability](https://docs.lightnet.community/run/monitor/), [Upgrade to v4](https://docs.lightnet.community/run/upgrade-to/v4/)
- CLI: [Overview](https://docs.lightnet.community/cli/overview/), [check-files](https://docs.lightnet.community/cli/check-files/), [check-links](https://docs.lightnet.community/cli/check-links/), [check-translations](https://docs.lightnet.community/cli/check-translations/), [r2](https://docs.lightnet.community/cli/r2/), [setup-github-auth](https://docs.lightnet.community/cli/setup-github-auth/)
- Troubleshooting and terms: [Error reference](https://docs.lightnet.community/resources/error-reference/), [Versions](https://docs.lightnet.community/resources/versions/), [Glossary](https://docs.lightnet.community/ministry/resources/glossary/)

For a whole task area, fetch the matching documentation set below instead of individual pages. Use the abridged set when context is limited; it omits Ministry Documentation except the Glossary.`,
          optionalLinks: [
            {
              label: "LightNet homepage",
              url: "https://lightnet.community",
              description: "High-level overview and community entry point.",
            },
            {
              label: "LightNet GitHub repository",
              url: "https://github.com/LightNetDev/LightNet",
              description: "Core LightNet source code and issues.",
            },
            {
              label: "LightNet releases",
              url: "https://github.com/LightNetDev/LightNet/releases",
              description:
                "Release notes, including breaking changes in major versions.",
            },
            {
              label: "Example template",
              url: "https://github.com/LightNetDev/example-template",
              description: "Starter project used in the Getting started guide.",
            },
            {
              label: "Documentation source",
              url: "https://github.com/LightNetDev/lightnet-docs",
              description: "Source files for this documentation site.",
            },
          ],
          customSets: [
            {
              label: "Start here",
              description:
                "Getting started and the setup checklist for new sites.",
              paths: ["start-here/**"],
            },
            {
              label: "Concepts",
              description:
                "Architecture, media library structure, and collaboration.",
              paths: ["concepts/**"],
            },
            {
              label: "Build",
              description:
                "Astro foundations, global configuration and reference, internationalization, pages, and page components.",
              paths: ["build/**"],
            },
            {
              label: "Content",
              description:
                "Content collections (media items, media types, categories, media collections), the Administration UI, and GitHub authentication.",
              paths: ["content/**"],
            },
            {
              label: "Deploy",
              description:
                "Hosting on Cloudflare Workers, custom domains, search engines, R2 file storage, and analytics.",
              paths: ["deploy/**"],
            },
            {
              label: "Run",
              description:
                "Updates, availability monitoring, and major upgrade guides.",
              paths: ["run/**"],
            },
            {
              label: "LightNet CLI",
              description:
                "@lightnet/cli commands: check-files, check-links, check-translations, r2, and setup-github-auth.",
              paths: ["cli/**"],
            },
            {
              label: "Resources",
              description: "Error reference and verified package versions.",
              paths: ["resources/**"],
            },
            {
              label: "Ministry Documentation",
              description:
                "Non-technical guidance for ministries: concepts, account setup on GitHub and Cloudflare, and the Glossary.",
              paths: ["ministry/**"],
            },
          ],
          promote: [
            "start-here/getting-started",
            "start-here/setup-checklist",
            "concepts/architecture",
            "build/astro",
            "build/configuration/initialize-configuration",
            "build/configuration/reference",
            "content/fundamentals",
          ],
          demote: ["ministry/**", "resources/versions"],
          exclude: [
            "ministry/start-here/**",
            "ministry/concepts/**",
            "ministry/build/**",
            "ministry/plan/**",
            "ministry/administration/**",
          ],
          minify: {
            note: false,
            tip: false,
            // FileTree renders folders as <details>, so removing them drops file trees.
            details: false,
            // Keep line breaks so lists and steps stay readable.
            whitespace: false,
          },
          // Strip the "Section titled ..." heading anchor links.
          customSelectors: { all: [".sl-anchor-link"] },
        }),
        ...(process.env.CHECK_LINKS
          ? [
              linksValidator({
                errorOnLocalLinks: false,
              }),
            ]
          : []),
      ],
    }),
    absoluteLlmsTxtLinks(),
  ],
  redirects: {
    "/": "/start-here/getting-started",
    "/run/analytics": "/deploy/analytics",
  },
});
