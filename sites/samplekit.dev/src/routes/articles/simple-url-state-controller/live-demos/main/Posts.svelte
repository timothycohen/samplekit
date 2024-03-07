<script lang="ts">
	export let posts: { author: string; date: Date; message: string; avatar: number }[];
	export let resetFilters: () => void;
</script>

<div class="@container flex flex-wrap justify-around gap-4">
	{#each posts as { author, date, message, avatar } (date)}
		<div class="shadow-2 rounded-card @md:flex-[1_0_49%] flex flex-[1_0_100%] p-4 sm:p-8">
			<img
				class="mr-5 block h-8 w-8 max-w-full align-middle sm:h-16 sm:w-16"
				src="https://mighty.tools/mockmind-api/content/abstract/{avatar}.jpg"
				alt={author}
			/>
			<div class="w-full">
				<div class="text-gray-11 mb-2 flex flex-col justify-between sm:flex-row">
					<h3 class="font-medium">{author}</h3>
					<time class="text-xs" datetime={date.toISOString()}>{date.toLocaleString()}</time>
				</div>
				<p class="text-sm">{message}</p>
			</div>
		</div>
	{:else}
		<div class="my-8 w-full space-y-4">
			<div class="w-full alert-wrapper alert-wrapper-warning">No messages found.</div>
			<button class="btn btn-hollow" on:click={resetFilters}>Clear All Filters</button>
		</div>
	{/each}
</div>
