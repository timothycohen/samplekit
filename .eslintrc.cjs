/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	plugins: ['@typescript-eslint', 'eslint-plugin-import', 'disable-autofix'],
	parser: '@typescript-eslint/parser',
	parserOptions: { sourceType: 'module', ecmaVersion: 2021, extraFileExtensions: ['.svelte'] },
	env: { browser: false, es2021: true, node: true },
	rules: {
		'prefer-const': 'off',
		'disable-autofix/prefer-const': ['warn', { destructuring: 'all' }],
		'no-unreachable': 'off', // rely on ts and IDE to dim unreachable code while not deleting it on fixAll
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
		],
		'@typescript-eslint/no-namespace': 0,
		'import/order': [
			'warn',
			{
				groups: ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index', 'object', 'type'],
				alphabetize: { order: 'asc' },
			},
		],
	},
	overrides: [
		{
			files: ['*.svelte'],
			extends: ['plugin:svelte/recommended', 'prettier'],
			plugins: ['svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: { parser: '@typescript-eslint/parser', sourceType: 'module', ecmaVersion: 2021 },
			env: { browser: true, es2021: true, node: false },
		},
		// {
		// files: ['sites/**'],
		// rules: { '@typescript-eslint/no-throw-literal': 'error' },
		// },
		{
			files: ['sites/samplekit.dev/**'],
			// parserOptions: { project: './sites/samplekit.dev/tsconfig.json' },
			globals: { App: 'readonly' },
			env: { browser: true, es2021: true, node: true },
		},
	],
};
