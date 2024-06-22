import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import disableAutofix from 'eslint-plugin-disable-autofix';
import imports from 'eslint-plugin-import';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

const clientFiles = [
	'**/client/*',
	'**/client.js',
	'**/client.ts',
	'**/*.client.js',
	'**/*.client.ts',
	'**/+page.js',
	'**/+page.ts',
	'**/*.svelte',
	'**/*.svelte.js',
	'**/*.svelte.ts',
];

/** @type {import('eslint').Linter.FlatConfig} */
const config = [
	// js
	{
		name: 'eslint/js/recommended',
		files: ['*.js', '**/*.js', '*.ts', '**/*.ts', '*.svelte', '**/*.svelte'],
		rules: js.configs.recommended.rules,
	},
	{
		name: 'eslint/js/custom',
		files: ['*.js', '**/*.js', '*.ts', '**/*.ts', '*.svelte', '**/*.svelte'],
		rules: { 'no-throw-literal': 'error' },
	},
	{
		name: 'eslint/js/no-console',
		files: ['*.js', '**/*.js', '*.ts', '**/*.ts', '*.svelte', '**/*.svelte'],
		ignores: ['**/scripts/**'],
		rules: { 'no-console': 'error' },
	},
	// disable some autofixes so they don't change on save while in the middle of writing code
	{
		name: 'eslint-plugin-disable-autofix',
		plugins: { 'disable-autofix': disableAutofix },
		rules: { 'prefer-const': 'off', 'disable-autofix/prefer-const': ['warn', { destructuring: 'all' }] },
	},
	// ts
	...ts.configs.recommended,
	{
		name: 'typescript-eslint/custom',
		files: ['*.ts', '**/*.ts', '*.svelte', '**/*.svelte'],
		rules: {
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
			],
		},
	},
	// Note on specifying tsconfig for subdirectories:
	// Setting the tsconfig path to packages/package-name/tsconfig.json: Running from root is "eslint --max-warnings 0 .". VS Code plugin finds tsconfig. However running from child directories requires "pnpm -w" with dedicated script.
	// Setting the tsconfig path to tsconfig.json: Running from child directory is "eslint --max-warnings 0 .". Running from root is "pnpm --parallel --no-bail lint". VS Code plugin breaks because it can't find tsconfig.
	{
		name: 'typescript-eslint/custom – @samplekit/auth',
		files: ['packages/auth/src'],
		languageOptions: { parserOptions: { project: 'packages/auth/tsconfig.json' } },
	},
	{
		name: 'typescript-eslint/custom – @samplekit/preprocess-markdown',
		files: ['packages/preprocess-markdown/src'],
		languageOptions: { parserOptions: { project: 'packages/preprocess-markdown/tsconfig.json' } },
	},
	{
		name: 'typescript-eslint/custom – @samplekit/preprocess-shiki',
		files: ['packages/preprocess-shiki/src'],
		languageOptions: { parserOptions: { project: 'packages/preprocess-shiki/tsconfig.json' } },
	},
	{
		name: 'typescript-eslint/custom – @samplekit/svelte-crop-window',
		files: ['packages/svelte-crop-window/**'],
		ignores: ['**/*.svelte'],
		languageOptions: { parserOptions: { project: './packages/svelte-crop-window/tsconfig.json' } },
		rules: { '@typescript-eslint/no-this-alias': 'off' },
	},
	{
		name: 'typescript-eslint/custom – samplekit.dev',
		files: ['sites/samplekit.dev/**'],
		ignores: ['**/*.svelte'],
		languageOptions: { parserOptions: { project: 'sites/samplekit.dev/tsconfig.json' } },
		rules: { '@typescript-eslint/no-unused-expressions': 'off' }, // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	},
	// svelte
	...svelte.configs['flat/recommended'].map((c, i) => ({ ...c, name: 'svelte/flat/recommended/' + (c.name ?? i) })),
	...svelte.configs['flat/prettier'].map((c, i) => ({ ...c, name: 'svelte/flat/prettier/' + (c.name ?? i) })),
	{
		name: 'svelte/custom',
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: ts.parser } },
		rules: { '@typescript-eslint/no-unused-expressions': 'off' }, // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	},
	// globals
	{
		name: 'globals/client',
		files: clientFiles,
		languageOptions: { globals: globals.browser },
	},
	{
		name: 'globals/server',
		ignores: clientFiles,
		languageOptions: { globals: globals.node },
	},
	{
		name: 'globals/samplekit.dev',
		files: ['sites/samplekit.dev/**/*.svelte'],
		languageOptions: { globals: { App: 'readonly', DB: 'readonly', SvelteGeneric: 'readonly' } },
	},
	// prettier
	{
		name: 'eslint-config-prettier',
		...prettier,
	},
	// import order
	{
		name: 'eslint-plugin-import',
		plugins: { import: imports },
		rules: {
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index', 'object', 'type'],
					alphabetize: { order: 'asc' },
				},
			],
		},
	},
	// globals
	{
		rules: {
			'no-restricted-globals': [
				'error',
				{ name: 'name', message: 'Use local parameter instead.' },
				{ name: 'event', message: 'Use local parameter instead.' },
				{ name: 'alert', message: 'Use window.alert.' },
			],
		},
	},
	// ignores
	{
		name: 'ignores',
		ignores: [
			'sites/samplekit.dev/vite.config.ts',
			'sites/*/build/',
			'sites/*/.svelte-kit/',
			'packages/*/dist/',
			'packages/*/build/',
			'packages/*/.svelte-kit/',
			'sites/*/static/',
			'packages/*/static/',
			'sites/*/generated/',
			'packages/*/generated/',
			'sites/*/vite.config.js.timestamp-*',
			'packages/*/vite.config.js.timestamp-*',
			'sites/*/vite.config.ts.timestamp-*',
			'packages/*/vite.config.ts.timestamp-*',
			'wip',
		],
	},
];

export default config;
