import { defineContext } from '$lib/utils/client';
import { ThemeController, type InitialTheme } from './themeController.svelte';
import { getSystemScheme } from './themeUtils';

const [get, set] = defineContext<ThemeController>();

const createThemeControllerCtx = (initialTheme: Omit<InitialTheme, 'schemeSystem'>) => {
	set(new ThemeController({ schemeSystem: getSystemScheme(), ...initialTheme }));
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerCtx = get;

export { createThemeControllerCtx, useThemeControllerCtx };
