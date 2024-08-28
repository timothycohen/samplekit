<script lang="ts">
	import { Admonition } from '$lib/components';

	interface Props {
		posts: { author: string; date: Date; message: string; avatar: number }[];
		resetFilters: () => void;
	}

	const { posts, resetFilters }: Props = $props();
</script>

<div class="flex flex-wrap justify-around gap-4 @container">
	{#each posts as { author, date, message, avatar } (date)}
		<div class="flex flex-[1_0_100%] rounded-card p-4 shadow-2 @md:flex-[1_0_49%] sm:p-8">
			<img
				class="mr-5 block h-8 w-8 max-w-full align-middle sm:h-16 sm:w-16"
				src="https://mighty.tools/mockmind-api/content/abstract/{avatar}.jpg"
				alt={author}
			/>
			<div class="w-full">
				<div class="mb-2 flex flex-col justify-between text-gray-11 sm:flex-row">
					<h3 class="font-medium">{author}</h3>
					<time class="text-xs" datetime={date.toISOString()}>{date.toLocaleString()}</time>
				</div>
				<p class="text-sm">{message}</p>
			</div>
		</div>
	{:else}
		<div class="my-8 mr-auto flex gap-2 items-center">
			<Admonition kind="error" title="No messages found." />
			<button class="btn btn-hollow" onclick={resetFilters}>Clear All Filters</button>
		</div>
	{/each}
</div>
