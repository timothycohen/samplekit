<script lang="ts">
	import type { TableOfContentsItem, TableOfContentsElements } from '@melt-ui/svelte';

	interface Props {
		tree?: TableOfContentsItem[],
		activeHeadingIdxs: number[],
		item: TableOfContentsElements['item'],
		level?: number
	}

	let {
		tree = [],
		activeHeadingIdxs,
		item,
		level = 1
	}: Props = $props();
</script>

{#if tree && tree.length}
	<ul class="space-y-1 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			{@const active = activeHeadingIdxs.includes(heading.index)}
			<li>
				<a
					href="#{heading.id}"
					{...$item(heading.id)}
					use:item
					class="transition-colors duration-300 underline--hidden hover:text-accent-12
					{active ? 'underline--show' : ''}"
				>
					{heading.title.slice(2)}
				</a>
				{#if heading.children && heading.children.length}
					<svelte:self tree={heading.children} level={level + 1} {activeHeadingIdxs} {item} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
