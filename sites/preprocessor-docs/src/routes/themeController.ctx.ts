import { ThemeController, type Theme } from '$lib/styles';
import { defineCtx } from '$lib/utils/client';

const [get, set] = defineCtx<ThemeController>();

const createThemeControllerCtx = (initialTheme: Theme) => {
	set(new ThemeController(initialTheme));
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerCtx = get;

export { createThemeControllerCtx, useThemeControllerCtx };
