// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightLlmsTxt from "starlight-llms-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.lightnet.community",
  integrations: [
    starlight({
      title: "LightNet",
      credits: true,
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
      sidebar: [
        {
          label: "Start here",
          items: [
            { slug: "start-here/getting-started" },
            { slug: "start-here/recommended-skills" },
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
              ],
            },
            {
              label: "Pages",
              items: [
                { slug: "build/pages/fundamentals" },
                { slug: "build/pages/initialize-homepage" },
                { slug: "build/pages/about-page" },
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
          ],
        },
        {
          label: "Deploy",
          items: [
            { slug: "deploy/hosting" },
            { slug: "deploy/search-engines" },
            { slug: "deploy/file-storage" },
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
          label: "Resources",
          items: [
            { slug: "resources/error-reference" },
            { slug: "resources/versions" },
          ],
        },
      ],
      plugins: [
        starlightLlmsTxt({
          projectName: "LightNet Developer Docs",
          description:
            "Developer documentation for LightNet, an Astro-based integration for building static media library sites.",
          details: `LightNet uses static site generation (SSG) to turn structured content into a fast, secure media library. It is built on Astro and provides prebuilt layouts, components, and tooling for media sites.

Use these docs to learn how to set up a project, configure the LightNet integration, build pages and components, structure content collections (JSON files under src/content), add i18n, and deploy and operate a site.

Recommended reading order:
- Start with “Getting started”.
- Review architecture and Astro foundations.
- Use the configuration reference for exact option shapes.
- Follow the pages and content sections for building your media library.`,
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
              label: "Example template",
              url: "https://github.com/LightNetDev/example-template",
              description: "Starter project used in the Getting started guide.",
            },
          ],
          customSets: [
            {
              label: "Start here",
              description: "Project setup and onboarding for new users.",
              paths: ["start-here/**"],
            },
            {
              label: "Concepts",
              description:
                "Architecture, structure, and collaboration concepts.",
              paths: ["concepts/**"],
            },
            {
              label: "Build",
              description: "Astro foundations, configuration, pages, and i18n.",
              paths: ["build/**"],
            },
            {
              label: "Content",
              description: "Content collections, media metadata, and admin UI.",
              paths: ["content/**"],
            },
            {
              label: "Deploy",
              description: "Hosting, search engines, and file storage.",
              paths: ["deploy/**"],
            },
            {
              label: "Run",
              description: "Updates and monitoring.",
              paths: ["run/**"],
            },
            {
              label: "Resources",
              description: "Error reference and version information.",
              paths: ["resources/**"],
            },
          ],
          promote: [
            "start-here/getting-started",
            "concepts/architecture",
            "build/astro",
            "build/configuration/initialize-configuration",
            "build/configuration/reference",
            "content/fundamentals",
          ],
          demote: ["resources/versions", "resources/error-reference"],
          exclude: ["resources/versions", "resources/error-reference"],
          minify: {
            note: false,
            tip: false,
            details: true,
            whitespace: true,
          },
        }),
        ...(process.env.CHECK_LINKS
          ? [
              starlightLinksValidator({
                errorOnLocalLinks: false,
              }),
            ]
          : []),
      ],
    }),
  ],
  redirects: {
    "/": "/start-here/getting-started",
  },
});
