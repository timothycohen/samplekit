import { defineCtx } from '$lib/utils/client';
import { ThemeController } from './themeController.svelte';

const [get, set] = defineCtx<ThemeController>();

const createThemeControllerCtx = () => {
	set(new ThemeController());
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerCtx = get;

export { createThemeControllerCtx, useThemeControllerCtx };
