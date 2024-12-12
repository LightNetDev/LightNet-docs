---
title: Getting Started
description: Learn the basics of how to use LightNet Library
---

Welcome to the LightNet Library Developer Documentation! LightNet Library enables you to build your own media distribution website. This guide will help you set up your development environment and get started with building your site.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 22 or higher)
- **Git** (for version control)

You can download Node.js from [nodejs.org](https://nodejs.org). For Git, visit [git-scm.com](https://git-scm.com).

## Start with the Sk8 Ministries Example

Begin building your media library by creating a copy of our [Sk8 Ministries example](https://sk8-ministries.pages.dev/). This example will help you understand how things are done and get you up and running quickly.

To create your local copy of the example project, run the following command in your terminal:

```bash
npm create astro@latest -- --template LightNetDev/lightnet-library/examples/sk8-ministries
```

The setup wizard will prompt you to choose the name of your project, decide whether to install its dependencies, and whether to initialize a Git repository. Ensure that you select the option to install the npm dependencies to proceed with the next steps.

Next, change into the directory of your newly created project:

```bash
cd your-project-name
```

Run the following command to start the development server. This will provide you with quick feedback while working on the project:

```bash
npm run dev
```

### Make Your First Change

As your first change, you can update the page title to match your website's name. Open the file `astro.config.mjs` and change the `title` from "Sk8 Ministry" to your desired name. While `npm run dev` is running, the page will automatically update the title visible in the header. Note that the title in front of the large skater image won't change immediately; don't worry, you'll learn how to modify that later.

### Prepare Your Page for Deployment

To build your page for deployment, run the following command in your terminal:

```bash
npm run build
```

This command will generate some log output and create a new folder named `dist`. This folder contains the website as HTML files that can be easily deployed to a file server of your choice.

## Well Done! 🎉

Now that your page is running, let's explore what has just happened. Proceed to the next chapter for an overview of your new website.
