import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Blog with Preprocessors',
	implementationSlug: '/articles/preprocessors/#interactive-demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/blob/main/packages/markdown',
	description: 'Use preprocessors to format themed code blocks and Markdown tables alongside Svelte components.',
	publishedAt: new Date('Wed Mar 6 16:16:15 2024 -0500'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/preprocessors-thumbnail.png',
	tags: ['preprocessors', 'blog', 'markdown', 'code highlighting', 'DX'],
	featured: true,
	updates: [
		{ at: new Date('Wed Mar 20 16:11:27 2024 -0400'), descriptions: ['Expand processor syntax beyond highlighting.'] },
	],
} satisfies RawFrontMatter;
