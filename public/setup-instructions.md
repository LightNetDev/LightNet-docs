# Setup instructions

This guide walks through the process of setting up a new LightNet site for a ministry.

The checklist is presented in a recommended order, but some tasks can be completed in parallel or in a different sequence depending on the ministry's needs.

## How to use this guide

We recommend checking off items as you complete them. If a task is not relevant for the ministry,
either remove it or strike it through (using double tildes around the text).

## Prerequisites

- [ ] The ministry has decided to build a LightNet site.
- [ ] The ministry understands the expected time and financial costs.
- [ ] The ministry has appointed a content administrator.

## Set up accounts

- [ ] The ministry has [created a free GitHub account](https://github.com/signup)
- [ ] The ministry has [created a free Cloudflare account](https://dash.cloudflare.com/sign-up)
  - GitHub login can be used for Cloudflare.
- [ ] The ministry has [created a free GitHub organization](https://github.com/account/organizations/new?plan=free)
- [ ] The ministry has granted the site admin access to the GitHub organization and Cloudflare account.

## Initialize the site

- [ ] The site admin has deployed the [minimal-template](https://github.com/LightNetDev/minimal-template) to [Cloudflare Workers](https://deploy.workers.cloudflare.com/?url=https://github.com/LightNetDev/minimal-template)
  - [ ] A **private** repository has been created in the ministry's GitHub organization.
  - [ ] A public Cloudflare Workers test URL is available.
- [ ] The site admin has updated all dependencies:
  ```bash
  pnpm self-update
  pnpm update
  ```
- [ ] The site admin has removed `LICENSE.md`.
- [ ] The site admin has updated `README.md` to reflect the ministry's site.

## Initial customization

- [ ] The site admin has [configured media types](https://docs.lightnet.community/content/media-types/) according to ministry requirements
- [ ] The site admin has [configured site and content languages](https://docs.lightnet.community/build/i18n/add-language/)
- [ ] The site admin has completed an initial translation of the site into the configured languages (AI-assisted translation is acceptable).
  - [ ] Updated `astro.config.mjs`
  - [ ] Updated the `about.md` page path and content
  - [ ] Updated media type labels
  - [ ] Updated `/src/translations` as needed, including any missing [built-in LightNet translations](https://github.com/LightNetDev/LightNet/tree/main/packages/lightnet/src/i18n/translations)
- [ ] The site admin has [configured the Admin UI](https://docs.lightnet.community/content/administration-ui/), including GitHub authentication.
- [ ] The site admin has tested uploading a new item through the Admin UI.

## Optional: File Storage

- [ ] The site admin has [configured R2 external file storage](https://docs.lightnet.community/deploy/file-storage/)

## Content Administrator Onboarding

- [ ] The content administrator (content admin) has successfully signed in to the Admin UI using their personal GitHub account.
- [ ] The content admin has uploaded at least 10 media items using the Admin UI.
- [ ] Content administrators understand and accept responsibility for ensuring that only files they are authorized to use and distribute are uploaded.

> [!IMPORTANT]
> Continuing the setup is not recommended until the ministry has demonstrated that they can use the Admin UI successfully.

## Optional: Automated data migration

- [ ] The site admin has migrated categories from a legacy site.
- [ ] The site admin has migrated media items from a legacy site.
- [ ] The site admin has migrated media collections from a legacy site.
