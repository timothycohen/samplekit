import { defineCtx } from '$lib/utils/client';
import { ThemeController } from './themeController.svelte';
import type { Theme } from './themeUtils';

const [get, set] = defineCtx<ThemeController>();

const createThemeControllerCtx = (initialTheme: Theme) => {
	set(new ThemeController(initialTheme));
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerCtx = get;

export { createThemeControllerCtx, useThemeControllerCtx };
