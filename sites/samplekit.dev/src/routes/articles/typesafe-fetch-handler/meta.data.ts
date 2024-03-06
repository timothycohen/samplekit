import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'TypeSafe Fetch Handler',
	implementationSlug: `/articles/typesafe-fetch-handler#interactive-demo`,
	srcCodeHref: 'https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/http/client.ts',
	description: 'A typesafe fetch handler that stores the route, method, res/req types, and fetch state.',
	publishedAt: new Date('2024-03-5'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgLg: '/articles/typesafe-fetch-handler.png',
	imgSm: '/articles/typesafe-fetch-handler-thumbnail.png',
	tags: ['typescript', 'http', 'DX', 'client-server', 'request handlers', 'endpoints'],
	featured: true,
} satisfies RawFrontMatter;
