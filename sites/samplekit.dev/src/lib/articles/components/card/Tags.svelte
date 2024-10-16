<script lang="ts">
	import type { LoadedFrontMatter } from '$lib/articles/schemas';

	const { tags }: { tags: LoadedFrontMatter['tags'] } = $props();
</script>

{#if tags?.length}
	<ul class="not-prose flex min-h-[3rem] flex-wrap items-start gap-2">
		{#each tags as tag}
			<li class="rounded-badge bg-accent-12/10 px-2.5 py-0.5 text-xs font-medium text-gray-11">
				{tag}
			</li>
		{/each}
	</ul>
{/if}
