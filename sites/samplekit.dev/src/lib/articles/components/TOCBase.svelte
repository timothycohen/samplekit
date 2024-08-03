<script lang="ts">
	type TocItem = {
		title: string;
		href: string;
		children?: TocItem[];
	};

	interface Props {
		tree: TocItem[];
		level: number;
		onclick?: () => void;
	}

	const { tree, level, onclick }: Props = $props();
</script>

{#if tree.length}
	<ul class="space-y-.5 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			<li class="space-y-.5">
				<a
					href={heading.href}
					class="inline-block w-full transition-colors duration-300 hover:text-accent-12"
					{onclick}
				>
					{heading.title}
				</a>
				{#if heading.children?.length}
					<svelte:self {onclick} tree={heading.children} level={level + 1} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
