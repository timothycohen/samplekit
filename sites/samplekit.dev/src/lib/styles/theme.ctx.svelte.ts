import { defineCtx } from '$lib/utils/client';
import { ThemeController, type InitialTheme } from './themeController.svelte';
import { getSystemScheme } from './themeUtils';

const [getCtx, setCtx] = defineCtx<ThemeController>();

const createThemeControllerCtx = (initialTheme: Omit<InitialTheme, 'systemScheme'>) => {
	setCtx(new ThemeController({ systemScheme: getSystemScheme(), ...initialTheme }));
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerCtx = getCtx;

export { createThemeControllerCtx, useThemeControllerCtx };
