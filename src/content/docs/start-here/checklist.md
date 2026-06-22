### Prerequisites

- [ ] The ministry has decided to build a LightNet site.
- [ ] The ministry understands the expected time and financial costs.
- [ ] The ministry has appointed a content administrator.

## Phase 1: Initialization

**Questions**

- Who will be the primary contact person for this project?
- Is there already a preferred name for the site?
- Which site languages and content languages are required?
- Which media types need to be supported (e.g., YouTube videos, PDF books, audio files)?
- Is there an existing site that needs to be migrated?
- Approximately how many items are expected in the media library?
- Will external file storage be required?

### Set up accounts

- [ ] The ministry has [created a free GitHub account](https://github.com/signup)
- [ ] The ministry has [created a free Cloudflare account](https://dash.cloudflare.com/sign-up)
  - GitHub login can be used for Cloudflare.
- [ ] The ministry has [created a free GitHub organization](https://github.com/account/organizations/new?plan=free)
- [ ] The ministry has granted the site admin access to the GitHub organization and Cloudflare account.

### Initialize the site

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

### Initial configuration

- [ ] The site admin has [configured media types](https://docs.lightnet.community/content/media-types/) according to ministry requirements
- [ ] The site admin has [configured site and content languages](https://docs.lightnet.community/build/i18n/add-language/)
- [ ] The site admin has completed an initial translation of the site into the configured languages (AI-assisted translation is acceptable).
  - [ ] Updated `astro.config.mjs`
  - [ ] Updated the `about.md` page path and content
  - [ ] Updated media type labels
  - [ ] Updated `/src/translations` as needed, including any missing [built-in LightNet translations](https://github.com/LightNetDev/LightNet/tree/main/packages/lightnet/src/i18n/translations)
- [ ] The site admin has [configured the Admin UI](https://docs.lightnet.community/content/administration-ui/), including GitHub authentication through [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth).
- [ ] The site admin has tested uploading a new item through the Admin UI.

### Optional: File Storage

- [ ] The site admin has [configured R2 external file storage](https://docs.lightnet.community/deploy/file-storage/)

### Optional: Automated data migration

- [ ] The site admin has migrated categories from a legacy site.
- [ ] The site admin has migrated media items from a legacy site.
- [ ] The site admin has migrated media collections from a legacy site.

### Content Administrator Onboarding

- [ ] The content administrator (content admin) has successfully signed in to the Admin UI using their personal GitHub account.
- [ ] The content admin has uploaded at least 10 media items using the Admin UI.
- [ ] Content administrators understand and accept responsibility for ensuring that only files they are authorized to use and distribute are uploaded.

> [!IMPORTANT]
> Continuing the setup is not recommended until the ministry has demonstrated that they can use the Admin UI successfully.

## Phase 2: Customizing the site

**Questions**:

- Does ministry want to use category system?
- Does ministry want to use media collections?
- What is the final name and domain for the site?

### Customizing Content Metadata

- [ ] The content admin knows how to use categories
- [ ] The content admin knows how to use media collections

### Customizing Pages

- [ ] The site admin set hero image and title(s) on the homepage
- [ ] The site admin has created gallery sections on the homepage
- [ ] The ministry has provided text for an About page, the site admin has uploaded this
- [ ] Optional: Legal pages such as imprint and data policy have been created

### Customizing Site Structure

- [ ] The site admin has configured the header
  - site's title
  - logo + logo alt
  - main menu
- [ ] The site admin has configured the footer
  - Footer text
  - Footer links
  - Powered by LightNet (credits) on / off
- [ ] The site admin has set favicons
- [ ] Optional: The site admin has disabled search engine indexing

### Phase 3: Refinement and go-live

### Review

- [ ] The ministry has reviewed site customizations.
- [ ] The ministry has reviewed translations

### Go-live

- [ ] The ministry has purchased a domain
- [ ] The site admin has set site's domain through wrangler.jsonc
- [ ] The site admin has set GitHub repository metadata: website + topic
- [ ] The site admin has set the `site` property in astro.config.mjs to the site's domain
- [ ] todo discuss: the ministry has signed document that they have been informed about copyright...

### Additional quality

- [ ] The site admin has set up monitoring
- [ ] The ministry has created Plausible account, the site admin has set up analytics.
