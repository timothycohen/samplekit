<script>
	import { page } from '$app/stores';
</script>

<section class="page">
	<h1 class="t-h1 text-accent-9 text-center font-extrabold">{$page.status}</h1>
	{#if $page.error?.message}
		<p class="t-h3 text-accent-9 text-center font-extrabold">{$page.error.message}</p>
	{:else if $page.status === 500}
		<p class="t-h3 text-accent-9 text-center font-extrabold">Internal server error</p>
	{/if}

	{#if $page.status === 404 && $page.data['homepageProducts']?.length}
		<p class="text-h4 my-8">Perhaps these might interest you?</p>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each $page.data['homepageProducts'] as product}
				{product}
			{/each}
		</div>
	{/if}
</section>
