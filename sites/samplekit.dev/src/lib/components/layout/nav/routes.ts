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

const userDesktopRoutes: { title: string; url: string }[] = [];

const noUserDesktopRoutes: { title: string; url: string }[] = [];

const userNavRoutes: (RouteLeaf | RouteGroup)[] = [
	{
		groupPath: '_',
		groupText: 'Demos',
		depth: 0,
		children: [{ path: '/', text: 'Articles', depth: 1 }],
	},
	{
		groupPath: '/account',
		groupText: 'Account',
		depth: 0,
		children: [{ path: '/appearance', text: 'Appearance', depth: 1 }],
	},
];

const noUserNavRoutes: (RouteLeaf | RouteGroup)[] = [
	{
		groupPath: '_',
		groupText: 'Demos',
		depth: 0,
		children: [{ path: '/', text: 'Articles', depth: 1 }],
	},
	{
		groupPath: '/settings',
		groupText: 'Settings',
		depth: 0,
		children: [{ path: '/appearance', text: 'Appearance', depth: 1 }],
	},
];

export const getDesktopNavRoutes = (user: boolean) => (user ? userDesktopRoutes : noUserDesktopRoutes);
export const getMobileNavRoutes = (user: boolean) => (user ? userNavRoutes : noUserNavRoutes);
