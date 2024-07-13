import baseConfig from '../../prettier.config.js';

/**
 * @type {import("prettier").Config}
 */
const config = {
	...baseConfig,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
	tailwindConfig: 'tailwind.config.ts',
};

export default config;
