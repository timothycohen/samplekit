<script lang="ts" module>
	import { GH_TREE } from '$lib/consts';
	import type { RawFrontMatter } from '$lib/articles/schemas';

	export const metadata = {
		title: 'Websockets',
		implementationPath: '/articles/websockets#demo',
		srcCodeHref: `${GH_TREE}/sites/samplekit.dev/src/routes/articles/websockets`,
		description: 'Use WebSockets with SvelteKit.',
		publishedAt: new Date('2024-10-27 20:28:46 -0400'),
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		tags: ['websockets'],
		featured: true,
	} satisfies RawFrontMatter;
</script>

Todo
