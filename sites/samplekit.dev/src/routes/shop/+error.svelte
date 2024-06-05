<script>
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
</script>

<section class="page">
	<h1 class="t-h1 text-center font-extrabold text-accent-9">{$page.status}</h1>
	{#if $page.error?.message}
		<p class="t-h3 text-center font-extrabold text-accent-9">{$page.error.message}</p>
	{:else if $page.status === 500}
		<p class="t-h3 text-center font-extrabold text-accent-9">Internal server error</p>
	{/if}

	{#if $page.status === 404 && $page.data['homepageProducts']?.length}
		<p class="my-8 text-h4">Perhaps these might interest you?</p>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each $page.data['homepageProducts'] as product}
				{product}
			{/each}
		</div>
	{/if}
</section>
