---
title: Getting Started
description: Learn the basics of how to use LightNet Library
---

Welcome to the LightNet Library Developer Documentation! LightNet Library allows you to build customizable media distribution websites. This guide will walk you through setting up your environment and creating your first project.

## Prerequisites

Before starting, ensure the following are installed on your machine:

1. **Node.js** (version 22 or higher) – [Download Node.js](https://nodejs.org)
2. **Git** – [Download Git](https://git-scm.com)

To verify your installations, run the following commands:

```bash
node -v
git --version
```

If these commands return version numbers, you're ready to go!

---

## Step 1: Set Up the Sk8 Ministries Example

We recommend starting with the [Sk8 Ministries example](https://sk8-ministries.pages.dev/), a prebuilt template that showcases LightNet Library’s features. It’s a great starting point for learning how to structure your media site.

To create a local copy of the project, run:

```bash
npm create astro@latest -- --template LightNetDev/lightnet-library/examples/sk8-ministries
```

Follow the setup wizard to:

- Choose a name for your project.
- Install dependencies.
- Optionally, initialize a Git repository.

Once finished, navigate into your project folder:

```bash
cd your-project-name
```

---

## Step 2: Run the Development Server

Now that your project is set up, start the development server to see your site in action:

```bash
npm run dev
```

Your site will be available at [http://localhost:4321](http://localhost:4321). Open it in your browser to preview the example site.

---

## Step 3: Make Your First Customization

As your first customization, let’s change the page title:

1. Open astro.config.mjs in a text editor.
2. Modify the title field (e.g., change "Sk8 Ministry" to your desired site name).
3. Save the file. Your browser will automatically refresh to show the updated title. Note that the title in front of the large skater image won’t change immediately; don’t worry, you’ll learn how to modify that later.

### Optional Next Step: Add a New Section

You can also experiment with content by adding a new section to the homepage. Navigate to the `src/pages/[lang]` directory and modify the `index.astro` file to include a new heading or text.

---

## Step 4: Build and Deploy Your Site

When you're ready to deploy your site, run:

```bash
npm run build
```

This command generates a `dist` folder with static HTML files that are ready to be deployed to any server.

For detailed deployment instructions, check out our [Deployment Guide](/run/deploy).

---

## What's Next?

Great job! 🎉 Your site is up and running. Now, let’s dive deeper into how LightNet works and explore more advanced customization options. Head over to the next chapters for a tour of your new website.
