### Prerequisites

- [ ] The ministry has decided to build a LightNet site.
- [ ] The ministry understands the expected time and financial costs.
- [ ] The ministry has appointed a content administrator.

## Phase 1: Initialization

**Questions**

- Who will be the primary contact person for this project?
- Is there already a preferred name for the site?
- Which site languages and content languages are required?
- What is the default site language?
- Which media types need to be supported (e.g., YouTube videos, PDF books, audio files)?
- Is there an existing site that needs to be migrated?
- Approximately how many items are expected in the media library?
- Will external file storage be required?

### Set up accounts

- [ ] The ministry has [created a free GitHub account](https://github.com/signup)
- [ ] The ministry has [created a free Cloudflare account](https://dash.cloudflare.com/sign-up)
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

## Phase 2: Customize the Site

**Questions**:

- What is the final name of the site?
- Is there an existing logo that should be used?
- Will categories be used to organize content?
- Will media collections be used?
- What content should be featured on the homepage?
- What content should be included on the About page?
- Are any additional pages required?
- Should the site display a "Powered by LightNet" credit in the footer?

### Content Organization

- [ ] The content administrator understands how to [use categories](https://docs.lightnet.community/content/categories/)
- [ ] The content administrator understands how to [use media collections](https://docs.lightnet.community/content/media-collections/)

### Pages and Content

- [ ] The site admin has [configured the homepage hero section](https://docs.lightnet.community/build/pages/hero-section/) with the final title, subtitle, and hero image
- [ ] The site admin has [added media gallery sections](https://docs.lightnet.community/build/pages/media-gallery-section/) to the homepage, if required
- [ ] The site admin has [added a category overview section](https://docs.lightnet.community/build/pages/categories-section/), if categories are being used
- [ ] The ministry has provided content for the [About page](https://docs.lightnet.community/build/pages/about-page/), and the site admin has published it
- [ ] Optional: Legal pages (such as an imprint and privacy policy) have been created

### Site Configuration

- [ ] The site admin has configured the header:
  - [Set the site title](https://docs.lightnet.community/build/configuration/initialize-configuration/)
  - [Set the site logo](https://docs.lightnet.community/build/configuration/set-logo/)
  - [Configure the main navigation menu](https://docs.lightnet.community/build/configuration/set-main-menu/)
- [ ] The site admin has configured the footer:
  - [Set Footer text](https://docs.lightnet.community/build/configuration/reference/#footertext)
  - [Set Footer links](https://docs.lightnet.community/build/configuration/reference/#footerlinks)
  - [Enabled/Disabled credits](https://docs.lightnet.community/build/configuration/reference/#credits)
- [ ] The site admin has [configured the favicon](https://docs.lightnet.community/build/configuration/set-favicon/)
- [ ] Optional: The site admin has [set the primary site color](https://docs.lightnet.community/build/configuration/set-primary-color/) to match the ministry's branding
- [ ] Optional: The site admin has [disabled search engine indexing](https://docs.lightnet.community/deploy/search-engines/) if the site should not be publicly discoverable yet

### Phase 3: Review and Go Live

**Questions**:

- What is the final domain name for the site?
- Does the ministry require website analytics?
- Does the site meet the ministry's goals and requirements?
- Are there any remaining changes before launch?

### Review

- [ ] The ministry has reviewed the site and approved it for launch
- [ ] The ministry has [reviewed all translations](https://docs.lightnet.community/resources/lightnet-cli-reference/#check-translations)
- [ ] The site admin has completed requested changes
- [ ] The site admin has tested the site on desktop and mobile devices
- [ ] The site admin has tested configured links and menus

### Go Live

- [ ] The ministry has purchased the domain through [Cloudflare Domains](https://www.cloudflare.com/products/registrar/)
- [ ] The site admin has [configured the site's custom domain](https://docs.lightnet.community/deploy/hosting/#set-up-cloudflare-workers) in `wrangler.jsonc`
- [ ] The site admin has [set the `site` property](https://docs.lightnet.community/build/configuration/initialize-configuration/) in `astro.config.mjs` to the production URL
- [ ] The site admin has updated the GitHub repository metadata (website URL and relevant topics)
- [ ] Todo discuss: Responsibilities regarding content ownership, copyright, legal compliance, and ongoing site maintenance have been reviewed with the ministry, Any required project agreements or handover documentation have been completed
- [ ] The site has been launched successfully. The ministry understands that the initial setup project is complete and knows how to request future support

### Additional Quality Improvements

- [ ] The site admin has configured [monitoring checks](https://docs.lightnet.community/run/monitor/)
- [ ] The ministry has created a Plausible account, the site admin has [configured analytics](https://docs.lightnet.community/deploy/analytics/)
