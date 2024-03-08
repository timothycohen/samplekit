import type { RawFrontMatter } from '$lib/articles/schema';

export default {
	title: 'Blog with Preprocessors',
	implementationSlug: `articles/preprocessors/#interactive-demo`,
	srcCodeHref: 'https://github.com/timothycohen/samplekit/blob/main/packages/markdown',
	description: 'Use preprocessors to format themed code blocks and Markdown tables alongside Svelte components.',
	publishedAt: new Date('2024-03-06'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm: '/articles/preprocessors-thumbnail.png',
	tags: ['preprocessors', 'blog', 'markdown', 'code highlighting', 'DX'],
	featured: true,
} satisfies RawFrontMatter;
