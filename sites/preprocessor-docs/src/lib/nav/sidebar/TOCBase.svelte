<script lang="ts">
	type Item = {
		title: string;
		href: string;
		children?: Item[];
	};

	interface Props {
		tree?: Item[];
		level?: number;
	}

	const { tree = [], level = 1 }: Props = $props();
</script>

{#if tree && tree.length}
	<ul class="space-y-1 {level !== 1 ? 'pl-4' : ''}">
		{#each tree as heading, i (i)}
			<li>
				<a href={heading.href} class="transition-colors duration-300 hover:text-accent-12">
					{heading.title}
				</a>
				{#if heading.children && heading.children.length}
					<svelte:self tree={heading.children} level={level + 1} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}
