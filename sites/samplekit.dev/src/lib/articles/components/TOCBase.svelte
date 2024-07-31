<script lang="ts">
	type TocItem = {
		title: string;
		href: string;
		children?: TocItem[];
	};

	interface Props {
		tree: TocItem[];
		level: number;
	}

	const { tree, level }: Props = $props();
</script>

{#if tree.length}
	<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			<li class="space-y-.5">
				<a href={heading.href} class="transition-colors duration-300 hover:text-accent-12">
					{heading.title}
				</a>
				{#if heading.children?.length}
					<svelte:self tree={heading.children} level={level + 1} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
