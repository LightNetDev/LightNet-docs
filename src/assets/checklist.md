### Prerequisites

- The ministry has decided to build a LightNet site.
- The ministry understands the expected time and financial costs.
- The ministry has appointed a content admin.

## 🏗️ Phase 1: Initialization

**Questions**

- Who will be the primary contact person for the site setup?
- Is there already a preferred name for the site?
- Which site languages and content languages are required?
- What is the default site language?
- Which media types need to be supported (e.g., YouTube videos, PDF books, audio files)?
- Is there an existing site that needs to be migrated?
- Approximately how many items are expected in the media library?
- Will external file storage be required?

### Set up accounts

- [ ] The ministry has a [GitHub account](https://docs.lightnet.community/deploy/hosting/#set-up-github)
- [ ] The ministry has a [GitHub organization](https://docs.lightnet.community/deploy/hosting/#set-up-github)
- [ ] The ministry has a [Cloudflare account](https://docs.lightnet.community/deploy/hosting/#set-up-cloudflare-workers)
- [ ] The ministry has granted the site admin access to the GitHub organization and Cloudflare account.

### Initialize the site

- [ ] The site admin has selected a starting template based on their experience:
  - [ ] New to LightNet: the site admin has started with the [example-template setup guide](https://docs.lightnet.community/start-here/getting-started/#1-set-up-the-example-template)
  - [ ] Experienced with LightNet: the site admin has started with the [minimal-template](https://github.com/LightNetDev/minimal-template)
- [ ] The site admin has updated `README.md` to reflect the ministry's site.
- [ ] The site admin has removed the template's MIT-0 `LICENSE.md`, which was included to allow the template to be reused and is not needed for the site's private repository.
- [ ] The site admin has pushed the local site to a [private GitHub repository in the ministry’s GitHub organization](https://docs.lightnet.community/deploy/hosting/#set-up-github)
- [ ] The site admin has [configured a Cloudflare Worker](https://docs.lightnet.community/deploy/hosting/#set-up-cloudflare-workers) connected to the GitHub repository.
- [ ] The site admin has confirmed that the site deploys successfully and is available at its `workers.dev` URL.

### Initial configuration

- [ ] The site admin has [configured media types](https://docs.lightnet.community/content/media-types/) according to ministry requirements
- [ ] The site admin has [configured site and content languages](https://docs.lightnet.community/build/i18n/add-language/)
- [ ] The site admin has completed an initial translation of the site into the configured languages (AI-assisted translation is acceptable).
  - [ ] Updated [`astro.config.mjs`](https://docs.lightnet.community/build/configuration/initialize-configuration)
  - [ ] Updated the [`about.md` page path and content](https://docs.lightnet.community/build/pages/about-page/)
  - [ ] Updated `/src/translations` as needed, including any missing [built-in LightNet translations](https://docs.lightnet.community/build/i18n/add-language/)
- [ ] The site admin has removed or replaced all example content included with the starting template, including [media items](https://docs.lightnet.community/content/media-items/), [media types](https://docs.lightnet.community/content/media-types/), [categories](https://docs.lightnet.community/content/categories/), and [media collections](https://docs.lightnet.community/content/media-collections/).
- [ ] The site admin has [configured the Admin UI](https://docs.lightnet.community/content/administration-ui/), including [GitHub authentication](https://docs.lightnet.community/content/administration-ui/#connect-to-github).
- [ ] The site admin has tested uploading a new item through the Admin UI.

### Optional: File Storage

- [ ] The site admin has [configured R2 external file storage](https://docs.lightnet.community/deploy/file-storage/)
- [ ] The site admin has [migrated](https://docs.lightnet.community/deploy/file-storage/#migrate-to-external-file-storage) any locally stored media files added during initial configuration to R2 and updated their media item URLs.

### Optional: Legacy Site Migration

- [ ] The site admin has migrated [media items](https://docs.lightnet.community/content/media-items/) from a legacy site.
- [ ] The site admin has migrated [media types](https://docs.lightnet.community/content/media-types/) from a legacy site.
- [ ] The site admin has migrated [categories](https://docs.lightnet.community/content/categories/) from a legacy site.
- [ ] The site admin has migrated [media collections](https://docs.lightnet.community/content/media-collections/) from a legacy site.

### Content Admin Onboarding

- [ ] The site admin has configured the Admin UI to hide unnecessary fields or collections.
- [ ] The content admin has successfully signed in to the Admin UI using their personal GitHub account.
- [ ] The content admin has uploaded at least 10 media items using the Admin UI.
- [ ] Content admins understand and accept responsibility for ensuring that only files they are authorized to use and distribute are uploaded.

> [!IMPORTANT]
> Continuing the setup is not recommended until the ministry has demonstrated that they can use the Admin UI successfully.

## 🎨 Phase 2: Customize the Site

**Questions**

- What is the name of the site?
- Is there an existing logo that should be used?
- Will categories be used to organize content?
- Will media collections be used?
- What content should be featured on the homepage?
- What content should be included on the About page?
- Are any additional pages required?
- Should the site display a "Powered by LightNet" credit in the footer?

### Content Organization

- [ ] The content admin understands how to [use categories](https://docs.lightnet.community/content/categories/)
- [ ] The content admin understands how to [use media collections](https://docs.lightnet.community/content/media-collections/)

### Pages and Content

- [ ] The site admin has [configured the homepage hero section](https://docs.lightnet.community/build/pages/hero-section/) with the title, subtitle, and hero image
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
- [ ] Optional: The site admin has [set search page to be filtered by current locale](https://docs.lightnet.community/build/configuration/reference/#searchpage)

### 🚀 Phase 3: Final Review and Go Live

**Questions**

- What is the domain name for the site?
- Does the site meet the ministry's goals and requirements?
- Are there any remaining changes before launch?

### Final Review

- [ ] The ministry has reviewed the site and approved it for launch
- [ ] The ministry has [reviewed all translations](https://docs.lightnet.community/cli/check-translations/)
- [ ] The site admin has tested the site on desktop and mobile devices:
  - [ ] Header
  - [ ] Footer
  - [ ] Homepage
  - [ ] Search page
  - [ ] A media item page for each media type
  - [ ] If used, Categories on the homepage, search page, and media item pages
  - [ ] If used, a sample of media collections and navigation between their media items
  - [ ] About page
- [ ] The site admin has tested the [404 page](https://docs.lightnet.community/build/pages/fundamentals/#defining-routes-with-the-pages-folder) by visiting a URL that does not exist

### Go Live

- [ ] The ministry has purchased the domain through [Cloudflare Domains](https://docs.lightnet.community/deploy/hosting/#configure-a-cloudflare-domain)
- [ ] The site admin has set the `name` property in `package.json` to reflect the site's domain name
- [ ] The site admin has [configured the site's custom domain](https://docs.lightnet.community/deploy/hosting/#set-up-cloudflare-workers) in `wrangler.jsonc`
- [ ] The site admin has [configured search engine indexing](https://docs.lightnet.community/deploy/search-engines/) according to the ministry's requirements
- [ ] The site admin has [set the `site` property](https://docs.lightnet.community/build/configuration/initialize-configuration/) in `astro.config.mjs` to the production URL
- [ ] The site admin has run `pnpm build` successfully
- [ ] The site admin has reviewed, committed, and pushed all go-live changes to GitHub
- [ ] The site admin has confirmed that Cloudflare deployed the latest commit
- [ ] The site admin has tested the deployed site at its production domain in a browser
- [ ] Responsibilities for content ownership, copyright, legal compliance, and ongoing site maintenance are clearly assigned and understood.
- [ ] If applicable, the project agreement with MediaWorks and handover documentation have been completed.
- [ ] The ministry understands that the initial site setup is complete.
- [ ] Milestone: The site has been launched successfully.

### ⚙️ Phase 4: Set up Operations

**Questions**

- Who will be responsible for ongoing site maintenance?
- What ongoing support arrangement is required, if any?
- Are monitoring and analytics required?
- Who will review analytics and respond to monitoring alerts?
- How often should the site be updated and its files, links, and translations checked?

- [ ] If applicable, the ministry understands the ongoing support arrangement for the site with MediaWorks.
- [ ] Optional: The site admin has configured [monitoring checks](https://docs.lightnet.community/run/monitor/)
- [ ] Optional: The ministry has created a Plausible account, and the site admin has [configured analytics](https://docs.lightnet.community/deploy/analytics/)
  - [ ] The ministry has assigned responsibility and a schedule for reviewing the analytics.
- [ ] The site admin has created a schedule to periodically [update](https://docs.lightnet.community/run/update/) the site.
- [ ] The site admin has created a schedule to periodically check the site's files, links, and translations using these LightNet CLI commands:
  - [`check-files`](https://docs.lightnet.community/cli/check-files/)
  - [`check-links`](https://docs.lightnet.community/cli/check-links/)
  - [`check-translations`](https://docs.lightnet.community/cli/check-translations/)
