import { defineContext } from '$lib/utils/client';
import { ThemeController } from './colorThemeController.svelte';

const [get, set] = defineContext<ThemeController>();

const createThemeControllerContext = () => {
	set(new ThemeController());
};

/**
 * Initializes from storage and propagates changes to storage and the DOM.
 */
const useThemeControllerContext = get;

export { createThemeControllerContext, useThemeControllerContext };
