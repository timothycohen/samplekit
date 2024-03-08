import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Generic URL State Controller',
	implementationSlug: 'articles/generic-url-state-controller#demo',
	srcCodeHref:
		'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/routes/articles/generic-url-state-controller',
	description: 'Sync validated, generic store state to the URL with a flexible API.',
	publishedAt: new Date('2024-03-07'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/generic-url-state-controller-thumbnail.png',
	tags: ['url', 'state management', 'generics', 'context api', 'TypeScript'],
	featured: false,
	series: { name: 'URL State Controller', position: 2 },
} satisfies RawFrontMatter;
