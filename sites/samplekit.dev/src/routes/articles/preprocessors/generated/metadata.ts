import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/preprocessors/assets/preprocessors-thumbnail-1200w.webp';
import video from '/src/routes/articles/preprocessors/assets/2024-08-05_22-41-28_889x627.mp4';
export default {
	title: 'Blog with Preprocessors',
	implementationPath: '/articles/preprocessors/#demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/packages/markdown',
	description: 'Use preprocessors to format themed code blocks and Markdown tables alongside Svelte components.',
	publishedAt: new Date('2024-03-06T21:16:15.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	video,
	tags: ['preprocessors', 'blog', 'markdown', 'code highlighting', 'DX'],
	featured: true,
	updates: [
		{ at: new Date('2024-08-15T22:24:50.000Z'), descriptions: ['Update to use @samplekit preprocessors.'] },
		{ at: new Date('2024-03-21T17:59:53.000Z'), descriptions: ['Add formatLogFilename.'] },
		{ at: new Date('2024-03-20T20:11:27.000Z'), descriptions: ['Expand processor syntax beyond highlighting.'] },
	],
	articlePath: '/articles/preprocessors',
	wordCount: 3891,
	readingTime: 18,
	toc: [
		{
			title: 'Evaluating the Options',
			href: '/articles/preprocessors/#evaluating-the-options',
			children: [
				{ title: '0.1: Unified', href: '/articles/preprocessors/#0.1:-unified' },
				{ title: '0.2: MDsveX', href: '/articles/preprocessors/#0.2:-mdsvex' },
				{ title: '0.3: Preprocessors', href: '/articles/preprocessors/#0.3:-preprocessors' },
			],
		},
		{
			title: 'Writing the Preprocessors',
			href: '/articles/preprocessors/#writing-the-preprocessors',
			children: [
				{ title: 'Markdown', href: '/articles/preprocessors/#markdown' },
				{ title: 'Math', href: '/articles/preprocessors/#math' },
				{ title: 'Code Decoration', href: '/articles/preprocessors/#code-decoration' },
			],
		},
		{
			title: 'Code Editor Support',
			href: '/articles/preprocessors/#code-editor-support',
			children: [
				{ title: 'Overview', href: '/articles/preprocessors/#overview' },
				{ title: 'Syntaxes', href: '/articles/preprocessors/#syntaxes' },
				{ title: 'Snippets', href: '/articles/preprocessors/#snippets' },
			],
		},
		{ title: 'Conclusion', href: '/articles/preprocessors/#conclusion' },
	],
} satisfies LoadedFrontMatter;
