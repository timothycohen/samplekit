<script lang="ts">
	import { createTableOfContents } from '@melt-ui/svelte';
	import TOCBase from './TOCBase.svelte';
	import TOCMelt from './TOCMelt.svelte';
	import type { Snippet } from 'svelte';

	type TocItem = { title: string; href: string; children?: TocItem[] };

	interface Props {
		children?: Snippet;
		onclick?: () => void;
		tree: TocItem[];
	}

	const { children, tree, onclick }: Props = $props();

	const {
		elements: { item },
		states: { activeHeadingIdxs, headingsTree },
	} = createTableOfContents({
		selector: '[data-toc-wrapper]',
		activeType: 'all',
		scrollOffset: 56 + 16,
		scrollBehaviour: 'smooth',
		headingFilterFn: (heading) => !!heading.dataset['toc'],
	});

	const tocReady = $derived(!!$activeHeadingIdxs.length);
</script>

<div class="lg:w-80">
	{#if children}
		{@render children()}
	{:else}
		<h2 class="t-h3 font-bold text-accent-12">Table of Contents</h2>
	{/if}
	<div class="mb-6 h-px w-full bg-gray-9"></div>
	<nav>
		{#if tocReady}
			<TOCMelt {onclick} tree={$headingsTree} activeHeadingIdxs={$activeHeadingIdxs} {item} level={1} />
		{:else}
			<TOCBase {onclick} {tree} level={1} />
		{/if}
	</nav>
</div>
