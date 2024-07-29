<script lang="ts">
	import type { TocItem } from './types';

	type IsActive = (href: string) => true | null;

	interface Props {
		tocTree: Array<TocItem>;
		level: number;
		isActive: IsActive;
	}

	const { tocTree, isActive, level }: Props = $props();

	let flickerPrevented = $state(false);
	let mountedAndCanTransition = $state(false);
	setTimeout(() => (flickerPrevented = true), 25);
	setTimeout(() => (mountedAndCanTransition = true), 150);
</script>

{#snippet TocTree(tocTree: Array<TocItem>, level: number)}
	{#if tocTree.length}
		<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
			{#each tocTree as { href, title, children }, i (i)}
				<li class="space-y-.5">
					<a {href} class="inline-block w-full hover:text-accent-12">
						<span
							data-active={isActive(href)}
							class="underline--hidden
				{flickerPrevented ? 'data-[active]:text-accent-12 data-[active]:underline--show' : ''}
				{mountedAndCanTransition ? 'duration-300 before:duration-300' : 'duration-0 before:duration-0'}"
						>
							{title}
						</span>
					</a>
					{#if children?.length}
						{@render TocTree(children, level + 1)}
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

{@render TocTree(tocTree, level)}
