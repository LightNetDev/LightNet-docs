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
						{slug: "start-here/essential-skills"},
					],
				},
				{
					label: "Concepts",
					items: [
						{slug: "concepts/media-site-structure"},
						{slug: "concepts/architecture"},
						{slug: "concepts/collaboration"}
					]
				},
				{
					label: "Build",
					items: [
						{slug: "build/astro"},
						{label: "Global Configuration", items: [
							{slug: "build/configuration/initialize-configuration"},
							{slug: "build/configuration/set-logo"},	
							{slug: "build/configuration/set-favicon"},
							{slug: "build/configuration/set-main-menu"},
							{slug: "build/configuration/set-primary-color"},
							{slug: "build/configuration/reference"}
						]},
						{label: "Internationalization", items:[
							{slug: "build/i18n/fundamentals"},
							{slug: "build/i18n/custom-site-strings"},
							{slug: "build/i18n/add-language"}
						]},
						{label: "Pages", items: [
							{slug: "build/pages/fundamentals"},
							{slug: "build/pages/initialize-homepage"},
							{slug: "build/pages/about-page"},
							{slug: "build/pages/section"},
							{slug: "build/pages/hero-section"},
							{slug: "build/pages/media-gallery"},
							{slug: "build/pages/categories-overview"},
							{slug: "build/pages/highlight-section"},
							{slug: "build/pages/custom-components"},
							{slug: "build/pages/create-internal-links"}
						]}
					],
				},
				{label:"Add Content", items: [
					{slug: "content/fundamentals"},
					{slug: "content/media-items"},
					{slug: "content/media-types"},
					{slug: "content/categories"},
					{slug: "content/media-collections"},
					{slug: "content/administration-ui", badge: "Beta"},
				]},
				{
					label: "Deploy",
					items: [
						{slug: "deploy/hosting"},
						{slug: "deploy/search-engines"},
						{slug: "deploy/file-storage"}
					]
				},
				{
					label: "Run",
					items: [
						{slug: "run/update"},
						{slug: "run/monitor"}
					]
				}
			],
			plugins: process.env.CHECK_LINKS
				? [
					starlightLinksValidator({
						errorOnLocalLinks: false
					}),
				]
				: [],
		}),
	],
});
