import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/generic-url-state-controller/assets/generic-url-state-controller-thumbnail-1200w.webp';
export default {
	title: 'Generic URL State Controller',
	implementationPath: '/articles/generic-url-state-controller#demo',
	srcCodeHref:
		'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/routes/articles/generic-url-state-controller',
	description: 'Sync validated, generic store state to the URL with a flexible API.',
	publishedAt: new Date('2024-03-08T18:31:26.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	tags: ['url', 'state management', 'generics', 'context api', 'TypeScript'],
	featured: false,
	series: { name: 'URL State Controller', position: 2 },
	articlePath: '/articles/generic-url-state-controller',
	wordCount: 1829,
	readingTime: 9,
	toc: [
		{
			title: 'Drawbacks of the derived store',
			href: '/articles/generic-url-state-controller/#drawbacks-of-the-derived-store',
		},
		{
			title: 'Single Value Generic Param',
			href: '/articles/generic-url-state-controller/#single-value-generic-param',
			children: [
				{
					title: 'Building the Interface',
					href: '/articles/generic-url-state-controller/#building-the-interface',
					children: [
						{ title: 'Getters', href: '/articles/generic-url-state-controller/#getters' },
						{ title: 'Serializers', href: '/articles/generic-url-state-controller/#serializers' },
						{ title: 'Setters', href: '/articles/generic-url-state-controller/#setters' },
						{ title: 'Sync State', href: '/articles/generic-url-state-controller/#sync-state' },
					],
				},
				{ title: 'Implementation', href: '/articles/generic-url-state-controller/#single-value-implementation' },
			],
		},
		{
			title: 'Multi Value Generic Param',
			href: '/articles/generic-url-state-controller/#multi-value-generic-param',
			children: [
				{ title: 'Interface', href: '/articles/generic-url-state-controller/#interface' },
				{ title: 'Implementation', href: '/articles/generic-url-state-controller/#multi-value-implementation' },
			],
		},
		{ title: 'Concrete Types', href: '/articles/generic-url-state-controller/#concrete-types' },
		{ title: 'Conclusion', href: '/articles/generic-url-state-controller/#conclusion' },
	],
} satisfies LoadedFrontMatter;
