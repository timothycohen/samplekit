<script lang="ts">
	import type { TableOfContentsItem, TableOfContentsElements } from '@melt-ui/svelte';

	interface Props {
		tree: TableOfContentsItem[];
		activeHeadingIdxs: number[];
		item: TableOfContentsElements['item'];
		level: number;
	}

	const { tree, activeHeadingIdxs, item, level }: Props = $props();
</script>

{#if tree.length}
	<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			<li class="space-y-.5">
				<a
					href="#{heading.id}"
					{...$item(heading.id)}
					class="transition-colors duration-300 underline--hidden hover:text-accent-12 data-[active]:text-accent-12 data-[active]:underline--show"
				>
					{heading.title}
				</a>
				{#if heading.children?.length}
					<svelte:self tree={heading.children} level={level + 1} {activeHeadingIdxs} {item} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
