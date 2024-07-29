const STORAGE_KEY_THEME_FIXED_NAME = 'theme_fixed_name';
const STORAGE_KEY_THEME_FIXED_SCHEME = 'theme_fixed_scheme';
const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
];
const DEFAULT_THEME = { name: 'amethyst', scheme: 'dark' };
const getStoredThemeOnClient = () => {
	if (typeof window === 'undefined') return DEFAULT_THEME;
	const name = getBrowserCookie(STORAGE_KEY_THEME_FIXED_NAME);
	if (!name) return DEFAULT_THEME;
	const scheme = getBrowserCookie(STORAGE_KEY_THEME_FIXED_SCHEME);
	if (!scheme) return DEFAULT_THEME;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME;
};
const setThemeOnDoc = ({ name, scheme }) => {
	if (scheme === 'dark') {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
		document.documentElement.dataset['theme'] = name;
	} else {
		document.documentElement.classList.add('light');
		document.documentElement.classList.remove('dark');
		document.documentElement.dataset['theme'] = name;
	}
};

setThemeOnDoc(getStoredThemeOnClient());
