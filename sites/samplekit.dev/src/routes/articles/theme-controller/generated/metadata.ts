import type { LoadedFrontMatter } from '$lib/articles/schema';
import imgSm from '/src/routes/articles/theme-controller/assets/theme-controller-thumbnail-1200w.webp';
import imgLg from '/src/routes/articles/theme-controller/assets/theme-controller-q30.webp';
import video from '/src/routes/articles/theme-controller/assets/2024-08-05_19-56-30_800x645.mp4';
export default {
	title: 'Theme Controller',
	implementationPath: '/appearance',
	srcCodeHref: 'https://github.com/timothycohen/samplekit/tree/main/sites/samplekit.dev/src/lib/styles',
	description:
		'A theme controller that uses CSS variables to control light/dark mode with multiple themes, saves user preference to Cookies and avoids flash of unstyled content.',
	publishedAt: new Date('2024-03-06T18:36:17.000Z'),
	authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
	imgSm,
	imgLg,
	video,
	tags: ['dark mode', 'multiple themes', 'tailwind', 'css variables', 'FOUC'],
	featured: true,
	articlePath: '/articles/theme-controller',
	wordCount: 2833,
	readingTime: 13,
	toc: [
		{ title: 'Goals', href: '/articles/theme-controller/#goals' },
		{
			title: 'Organizing the CSS',
			href: '/articles/theme-controller/#organizing-the-css',
			children: [
				{
					title: 'Two design token sets for each theme',
					href: '/articles/theme-controller/#two-design-token-sets-for-each-theme',
				},
				{
					title: 'One design token set for each theme',
					href: '/articles/theme-controller/#one-design-token-set-for-each-theme',
				},
				{ title: 'Lifting design tokens up', href: '/articles/theme-controller/#lifting-design-tokens-up' },
				{
					title: 'Choosing an organization method',
					href: '/articles/theme-controller/#choosing-an-organization-method',
				},
			],
		},
		{ title: 'Controller Components', href: '/articles/theme-controller/#controller-components' },
		{
			title: 'Controller',
			href: '/articles/theme-controller/#controller',
			children: [
				{ title: 'Interface', href: '/articles/theme-controller/#interface' },
				{ title: 'Storage', href: '/articles/theme-controller/#storage' },
				{ title: 'Utils', href: '/articles/theme-controller/#utils' },
				{ title: 'Implementation', href: '/articles/theme-controller/#implementation' },
				{ title: 'Prevent FOUC', href: '/articles/theme-controller/#prevent-fouc' },
			],
		},
		{
			title: 'Using our theme',
			href: '/articles/theme-controller/#using-our-theme',
			children: [
				{ title: 'CSS', href: '/articles/theme-controller/#css' },
				{ title: 'Tailwind', href: '/articles/theme-controller/#tailwind' },
			],
		},
		{ title: 'Conclusion', href: '/articles/theme-controller/#conclusion' },
	],
} satisfies LoadedFrontMatter;
