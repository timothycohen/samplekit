export type RouteLeaf = {
	depth: number;

	path: string;
	text: string;

	groupPath?: never;
	groupText?: never;
	children?: never;
};

export type RouteGroup = {
	depth: number;

	path?: never;
	text?: never;

	groupPath: string;
	groupText: string;
	children: (RouteLeaf | RouteGroup)[];
};

export const accountLayoutRoutes: (RouteLeaf | RouteGroup)[] = [
	{ path: '/account/profile', text: 'Profile', depth: 0 },
	{ path: '/appearance', text: 'Appearance', depth: 0 },
	{
		groupPath: '/account/security',
		groupText: 'Security',
		depth: 0,
		children: [
			{ path: '/account/security/auth', text: 'Authentication', depth: 1 },
			{ path: '/account/security/devices', text: 'Devices', depth: 1 },
		],
	},
];

const userDesktopRoutes: { title: string; url: string }[] = [
	{ title: 'Preprocessors', url: 'https://preprocessors.samplekit.dev' },
	{ title: 'Shop', url: '/shop' },
	{ title: 'Account', url: '/account/profile' },
];

const noUserDesktopRoutes: { title: string; url: string }[] = [
	{ title: 'Preprocessors', url: 'https://preprocessors.samplekit.dev' },
	{ title: 'Shop', url: '/shop' },
	{ title: 'Login', url: '/login' },
];

const userNavRoutes: (RouteLeaf | RouteGroup)[] = [
	{
		groupPath: '_',
		groupText: 'Demos',
		depth: 0,
		children: [
			{ path: '/', text: 'Articles', depth: 1 },
			{ path: '/shop', text: 'Shop', depth: 1 },
		],
	},
	{
		depth: 0,
		groupPath: 'https://preprocessors.samplekit.dev',
		groupText: 'Preprocessors',
		children: [
			{ depth: 1, text: 'Code Decoration', path: 'https://preprocessors.samplekit.dev/docs/code-decoration' },
			{ depth: 1, text: 'Math', path: 'https://preprocessors.samplekit.dev/docs/math' },
			{ depth: 1, text: 'Markdown', path: 'https://preprocessors.samplekit.dev/docs/markdown' },
		],
	},
	{
		groupPath: '/account',
		groupText: 'Account',
		depth: 0,
		children: [
			{ path: '/account/profile', text: 'Profile', depth: 1 },
			{ path: '/appearance', text: 'Appearance', depth: 1 },
		],
	},
	{
		groupPath: '/account/security',
		groupText: 'Security',
		depth: 0,
		children: [
			{ path: '/account/security/auth', text: 'Authentication', depth: 1 },
			{ path: '/account/security/devices', text: 'Devices', depth: 1 },
		],
	},
];

const noUserNavRoutes: (RouteLeaf | RouteGroup)[] = [
	{
		groupPath: '_',
		groupText: 'Demos',
		depth: 0,
		children: [
			{ path: '/', text: 'Articles', depth: 1 },
			{ path: '/shop', text: 'Shop', depth: 1 },
		],
	},
	{
		depth: 0,
		groupPath: 'https://preprocessors.samplekit.dev',
		groupText: 'Preprocessors',
		children: [
			{ depth: 1, text: 'Code Decoration', path: 'https://preprocessors.samplekit.dev/docs/code-decoration' },
			{ depth: 1, text: 'Math', path: 'https://preprocessors.samplekit.dev/docs/math' },
			{ depth: 1, text: 'Markdown', path: 'https://preprocessors.samplekit.dev/docs/markdown' },
		],
	},
	{
		groupPath: '/settings',
		groupText: 'Settings',
		depth: 0,
		children: [{ path: '/appearance', text: 'Appearance', depth: 1 }],
	},
	{
		groupPath: '/account',
		groupText: 'Account',
		depth: 0,
		children: [
			{ path: '/login', text: 'Login', depth: 1 },
			{ path: '/signup', text: 'Sign Up', depth: 1 },
		],
	},
];

export const getDesktopNavRoutes = (user: boolean) => (user ? userDesktopRoutes : noUserDesktopRoutes);
export const getMobileNavRoutes = (user: boolean) => (user ? userNavRoutes : noUserNavRoutes);
