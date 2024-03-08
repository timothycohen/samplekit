import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Simple URL State Controller',
	implementationSlug: 'articles/simple-url-state-controller#interactive-demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/lib/stores/params',
	description: 'Store state in the URL with a few simple svelte stores.',
	publishedAt: new Date('2024-03-06'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgLg: '/articles/simple-url-state-controller-2368w.png',
	imgSm: '/articles/simple-url-state-controller-thumbnail.png',
	tags: ['url', 'state management'],
	featured: true,
	series: { name: 'URL State Controller', position: 1 },
} satisfies RawFrontMatter;
