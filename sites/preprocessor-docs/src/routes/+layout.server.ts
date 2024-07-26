import { getStoredThemeOnServer } from '$lib/styles/themeUtils';

export const load = async ({ cookies }) => {
	return { initialTheme: getStoredThemeOnServer(cookies) };
};
