<script lang="ts">
	import type { TocItem } from './types';

	interface Props {
		tocTree: Array<TocItem>;
		level: number;
	}

	const { tocTree, level }: Props = $props();
</script>

{#snippet Toc(tocTree: Array<TocItem>, level: number)}
	{#if tocTree.length}
		<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
			{#each tocTree as { href, title, children }, i (i)}
				<li class="space-y-.5">
					<a {href} class="inline-block w-full transition-colors duration-300 hover:text-accent-12">
						{title}
					</a>
					{#if children?.length}
						{@render Toc(children, level + 1)}
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

{@render Toc(tocTree, level)}
