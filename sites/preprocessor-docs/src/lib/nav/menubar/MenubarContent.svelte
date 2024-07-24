<script lang="ts">
	import { page } from '$app/stores';
	import LogoIcon from '$lib/components/LogoIcon.svelte';
	import I from '$lib/icons';
	import { PaletteMenu } from '$lib/styles';

	const title = $derived.by(() => {
		if ($page.url.pathname.includes('code-decoration')) return 'Code Decoration';
		if ($page.url.pathname.includes('markdown')) return 'Markdown';
		if ($page.url.pathname.includes('math')) return 'Math';
		return 'Svelte Preprocessors';
	});
</script>

<PaletteMenu />

<h2 class="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-center text-xl">{title}</h2>

<a href="https://samplekit.dev">
	<LogoIcon svgClasses="h-6 w-6" />
</a>

<a href="https://github.com/timothycohen/samplekit">
	<I.GitHub class="rounded-full hover:fill-accent-9/30" />
</a>
