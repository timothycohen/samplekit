<script>
	import { page } from '$app/stores';
	import CardList from '$lib/articles/components/card/CardList.svelte';
	import { featureCards } from '$lib/articles/load';
</script>

<section class="page">
	<h1 class="t-h1 text-center font-extrabold text-accent-9">{$page.status}</h1>
	{#if $page.error?.message}
		<p class="t-h3 text-center font-extrabold text-accent-9">{$page.error.message}</p>
	{:else if $page.status === 500}
		<p class="t-h3 text-center font-extrabold text-accent-9">Internal server error</p>
	{/if}

	{#if $page.status === 404}
		<p class="my-8 text-h4">Perhaps these might interest you?</p>
		<CardList cards={featureCards.filter((c) => c.metadata.featured)} />
	{/if}
</section>
