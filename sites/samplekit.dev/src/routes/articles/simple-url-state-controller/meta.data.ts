import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Simple URL State Controller',
	implementationSlug: '/articles/simple-url-state-controller#interactive-demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/lib/stores/params',
	description: 'Store state in the URL with a few simple svelte stores.',
	publishedAt: new Date('Thu Mar 7 13:29:34 2024 -0500'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/simple-url-state-controller-thumbnail-1200w.webp',
	imgLg: '/articles/simple-url-state-controller-q30.webp',
	tags: ['url', 'state management'],
	featured: true,
	series: { name: 'URL State Controller', position: 1 },
} satisfies RawFrontMatter;
