<script lang="ts">
	import { createTableOfContents } from '@melt-ui/svelte';
	import TOCTree from './TOCTree.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	const {
		elements: { item },
		states: { activeHeadingIdxs, headingsTree },
	} = createTableOfContents({
		selector: '#use-toc',
		exclude: ['h1'],
		activeType: 'all',
		scrollOffset: 56 + 16,
		scrollBehaviour: 'smooth',
		headingFilterFn: (heading) =>
			heading.dataset['autoSlug'] !== undefined && heading.dataset['autoSlugIgnore'] === undefined,
	});
</script>

<div class="lg:w-80">
	{#if children}
		{@render children()}
	{:else}
		<h2 class="t-h3 font-bold text-accent-12">Table of Contents</h2>
	{/if}
	<div class="mb-6 h-px w-full bg-gray-9"></div>
	<nav>
		<TOCTree tree={$headingsTree} activeHeadingIdxs={$activeHeadingIdxs} {item} />
	</nav>
</div>
