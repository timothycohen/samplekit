<script lang="ts">
	import type { TableOfContentsItem, TableOfContentsElements } from '@melt-ui/svelte';

	interface Props {
		tree: TableOfContentsItem[];
		activeHeadingIdxs: number[];
		item: TableOfContentsElements['item'];
		level: number;
	}

	const { tree, activeHeadingIdxs, item, level }: Props = $props();

	let meltFlickerPrevented = $state(false);
	let mountedAndCanTransition = $state(false);
	setTimeout(() => (meltFlickerPrevented = true), 25);
	setTimeout(() => (mountedAndCanTransition = true), 150);
</script>

{#if tree.length}
	<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			<li class="space-y-.5">
				<a href="#{heading.id}" class="inline-block w-full hover:text-accent-12">
					<span
						{...$item(heading.id)}
						class="underline--hidden
				{meltFlickerPrevented ? 'data-[active]:text-accent-12 data-[active]:underline--show' : ''}
				{mountedAndCanTransition ? 'duration-300 before:duration-300' : 'duration-0 before:duration-0'}"
					>
						{heading.title}
					</span>
				</a>
				{#if heading.children?.length}
					<svelte:self tree={heading.children} level={level + 1} {activeHeadingIdxs} {item} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
