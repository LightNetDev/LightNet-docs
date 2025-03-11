// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';


// https://astro.build/config
export default defineConfig({
	site: "https://lightnet-docs.pages.dev",
	integrations: [
		starlight({
			title: 'LightNet',
			social: {
				github: 'https://github.com/LightNetDev/lightnet',
			},
			editLink: {
				baseUrl: 'https://github.com/LightNetDev/lightnet-docs/edit/main/',
			  },
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{slug: "start-here/getting-started"},
						{label:"Core Concepts", items: [
							{slug: "start-here/concepts/media-site-structure"},
							{slug: "start-here/concepts/architecture"},
							{slug: "start-here/concepts/collaboration"}
						]},
						{label: "How to...", items: [
							{slug: "start-here/guides/essential-skills"},
						]}
					],
				},
				{
					label: "Build",
					items: [
						{label: "Concepts", items: [
							{slug: "build/concepts/astro"},
							{slug: "build/concepts/internationalization"},
							{slug: "build/concepts/project-structure"}
						]},
						{label: "Configuration", items: [
							{slug: "build/configuration/fundamentals"},
							{slug: "build/configuration/initialize-configurations"},
							{slug: "build/configuration/set-logo"},
							{slug: "build/configuration/set-favicon"},
							{slug: "build/configuration/set-main-menu"},
							{slug: "build/configuration/set-primary-color"}
						]},
						{label: "Internationalization", items:[
							{slug: "build/i18n/fundamentals"},
							{slug: "build/i18n/custom-site-strings"},
							{slug: "build/i18n/add-language"}
						]},
						{label: "Pages", items: [
							{slug: "build/pages/fundamentals"},
							{slug: "build/pages/initialize-homepage"},
							{slug: "build/pages/hero"},
							{slug: "build/pages/section"},
							{slug: "build/pages/categories-overview"},
							{slug: "build/pages/highlight-section"},
							{slug: "build/pages/media-gallery"},
							{slug: "build/pages/custom-components"},
							{slug: "build/pages/about-page"}
						]}
					],
				},
				{label:"Content", items: [
					{slug: "content/fundamentals"},
					{slug: "content/media-items"},
					{slug: "content/media-types"},
					{slug: "content/media-collections"},
					{slug: "content/categories"},
					{slug: "content/administration-ui", badge: "Beta"}
				]},
				{
					label: "Deploy",
					items: [
						{slug: "deploy/hosting"},
						{slug: "deploy/file-storage"}
					]
				},
				{
					label: "Run",
					items: [
						{slug: "run/update"},
						{slug: "run/monitor"}
					]
				},
				{
					label: 'Reference',
					items: [
						{slug: "reference/configuration"}
					]
				}
			],
			plugins: process.env.CHECK_LINKS
				? [
					starlightLinksValidator({
						errorOnFallbackPages: false,
						errorOnInconsistentLocale: true,
						errorOnLocalLinks: false
					}),
				]
				: [],
		}),
	],
});
