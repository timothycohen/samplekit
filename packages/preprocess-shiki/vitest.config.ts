import { defineConfig, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			include: ['**'],
			exclude: [...coverageConfigDefaults.exclude, 'src/themes'],
			reporter: ['text'],
		},
	},
});
