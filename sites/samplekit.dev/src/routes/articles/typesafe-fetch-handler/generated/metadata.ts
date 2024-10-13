import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/typesafe-fetch-handler/assets/typesafe-fetch-handler-thumbnail-1200w.webp';
import imgLg from '/src/routes/articles/typesafe-fetch-handler/assets/typesafe-fetch-handler-q30.webp';
export default {
	title: 'TypeSafe Fetch Handler',
	implementationPath: '/articles/typesafe-fetch-handler#demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/http/client.svelte.ts',
	description: 'A typesafe fetch handler that stores the route, method, res/req types, and fetch state.',
	publishedAt: new Date('2024-03-06T01:39:38.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	imgLg,
	tags: ['typescript', 'http', 'DX', 'client-server', 'request handlers', 'endpoints'],
	featured: true,
	updates: [
		{ at: new Date('2024-10-13T21:24:39.000Z'), descriptions: ['Tweak RequestHandler placement.'] },
		{ at: new Date('2024-08-13T22:26:40.000Z'), descriptions: ['Update to runes.'] },
	],
	articlePath: '/articles/typesafe-fetch-handler',
	wordCount: 1833,
	readingTime: 9,
	toc: [
		{
			title: 'Data in SvelteKit',
			href: '/articles/typesafe-fetch-handler/#data-in-sveltekit',
			children: [
				{ title: 'Load Functions', href: '/articles/typesafe-fetch-handler/#load-functions' },
				{ title: 'Form Actions', href: '/articles/typesafe-fetch-handler/#form-actions' },
				{ title: 'Endpoints', href: '/articles/typesafe-fetch-handler/#endpoints' },
			],
		},
		{
			title: 'Thinking through the API',
			href: '/articles/typesafe-fetch-handler/#thinking-through-the-api',
			children: [
				{ title: 'Interface', href: '/articles/typesafe-fetch-handler/#interface' },
				{ title: 'Server / Client Separation', href: '/articles/typesafe-fetch-handler/#server-/-client-separation' },
				{
					title: 'Hiding the route / method / types',
					href: '/articles/typesafe-fetch-handler/#hiding-the-route-/-method-/-types',
				},
				{
					title: 'Enforce server / client type consistency',
					href: '/articles/typesafe-fetch-handler/#enforce-server-/-client-type-consistency',
				},
				{ title: 'Dynamic Routes', href: '/articles/typesafe-fetch-handler/#dynamic-routes' },
				{ title: 'Options', href: '/articles/typesafe-fetch-handler/#options' },
			],
		},
		{ title: 'Implementation', href: '/articles/typesafe-fetch-handler/#implementation' },
		{ title: 'Conclusion', href: '/articles/typesafe-fetch-handler/#conclusion' },
	],
} satisfies LoadedFrontMatter;
