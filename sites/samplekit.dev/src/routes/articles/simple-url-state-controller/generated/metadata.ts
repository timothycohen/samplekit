import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/simple-url-state-controller/assets/simple-url-state-controller-thumbnail-1200w.webp';
import imgLg from '/src/routes/articles/simple-url-state-controller/assets/simple-url-state-controller-q30.webp';
export default {
	title: 'Simple URL State Controller',
	implementationPath: '/articles/simple-url-state-controller#demo',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/lib/stores/params',
	description: 'Store state in the URL with a few simple Svelte stores.',
	publishedAt: new Date('2024-03-07T18:29:34.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	imgLg,
	tags: ['url', 'state management'],
	featured: true,
	series: { name: 'URL State Controller', position: 1 },
	articlePath: '/articles/simple-url-state-controller',
	wordCount: 2674,
	readingTime: 12,
	toc: [
		{ title: 'Thinking through the API', href: '/articles/simple-url-state-controller/#thinking-through-the-api' },
		{
			title: 'Single value search param',
			href: '/articles/simple-url-state-controller/#single-value-search-param',
			children: [
				{
					title: 'API',
					href: '/articles/simple-url-state-controller/#api',
					children: [
						{
							title: 'Fulfilling the Store Contract',
							href: '/articles/simple-url-state-controller/#fulfilling-the-store-contract',
						},
						{ title: 'Convenience Methods', href: '/articles/simple-url-state-controller/#convenience-methods' },
						{ title: 'Multiple Params', href: '/articles/simple-url-state-controller/#multiple-params' },
						{ title: 'Result', href: '/articles/simple-url-state-controller/#result' },
						{ title: 'Go Options', href: '/articles/simple-url-state-controller/#go-options' },
					],
				},
				{
					title: 'Implementation',
					href: '/articles/simple-url-state-controller/#implementation',
					children: [
						{ title: 'Helpers', href: '/articles/simple-url-state-controller/#helpers' },
						{ title: 'searchParam', href: '/articles/simple-url-state-controller/#searchparam' },
					],
				},
				{ title: 'Adding Validation', href: '/articles/simple-url-state-controller/#adding-validation' },
				{ title: 'Demo', href: '/articles/simple-url-state-controller/#demo' },
			],
		},
		{
			title: 'Multi-value search params',
			href: '/articles/simple-url-state-controller/#multi-value-search-params',
			children: [
				{ title: 'API', href: '/articles/simple-url-state-controller/#api' },
				{ title: 'Implementation', href: '/articles/simple-url-state-controller/#implementation' },
			],
		},
		{ title: 'Conclusion', href: '/articles/simple-url-state-controller/#conclusion' },
	],
} satisfies LoadedFrontMatter;
