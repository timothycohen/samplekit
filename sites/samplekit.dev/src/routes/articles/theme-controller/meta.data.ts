import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Theme Controller',
	implementationSlug: '/appearance',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/lib/styles',
	description:
		'A theme controller that uses CSS variables to control light/dark mode with multiple themes, saves user preference to Cookies and avoids flash of unstyled content.',
	publishedAt: new Date('Wed Mar 6 13:36:17 2024 -0500'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/theme-controller-thumbnail-1200w.webp',
	imgLg: '/articles/theme-controller-q30.webp',
	tags: ['dark mode', 'multiple themes', 'tailwind', 'css variables', 'FOUC'],
	featured: true,
} satisfies RawFrontMatter;
