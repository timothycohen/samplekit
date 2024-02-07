export type Theme = { name: string; scheme: 'light' | 'dark' };

/**
 * #### bellflower / amethyst
 * - success: Jade
 * - info: Cyan
 * - error: Ruby
 * - warning: Amber
 * - accent: Iris
 * - gray: Mauve
 *
 * #### daffodil / desert
 * - success: Green
 * - info: Blue
 * - error: Red
 * - warning: Yellow
 * - accent: Amber
 * - gray: Sand
 */
export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies Theme[];
