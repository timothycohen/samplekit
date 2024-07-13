export { THEMES, type Theme } from './colorThemeUtils';
export { createThemeControllerContext, useThemeControllerContext } from './context.svelte';
export * from './components';
export * from './serverHook';

/**
 * Usage:
 *
 * Define light/dark design tokens.
 * Define auto design tokens based on .dark or .light class.
 * Group auto design tokens into themes with [data-theme=<theme-name>].
 * `colorThemes.css`
 *
 * Add the { name: string; scheme: 'light' | 'dark' }[] THEMES array matching the themes defined in `colorThemes.css`
 * `colorThemeUtils.ts`
 *
 * Add theme on server to prevent FOUC.
 * `hooks.server.ts`
 * export const handle = sequence(updateThemeFromCookies);
 *
 * Initialize client state from storage and propagate changes to storage and the DOM.
 * `src/routes/layout.svelte`
 * createThemeControllerContext();
 *
 * Expose a way for the client to change the theme.
 * `PaletteMenu.svelte`
 * onclick={() => themeController.setTheme(theme.name)}
 */
