<script>
	import { page } from '$app/stores';
	import { FeatureCard, FeatureSwapCard } from '$lib/articles/components';
	import { allPostData } from '$lib/articles/load';
</script>

<section class="page">
	<h1 class="t-h1 text-accent-9 text-center font-extrabold">{$page.status}</h1>
	{#if $page.error?.message}
		<p class="t-h3 text-accent-9 text-center font-extrabold">{$page.error.message}</p>
	{:else if $page.status === 500}
		<p class="t-h3 text-accent-9 text-center font-extrabold">Internal server error</p>
	{/if}

	{#if $page.status === 404}
		<p class="text-h4 my-8">Perhaps these might interest you?</p>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
			{#each allPostData.filter((f) => f.featured) as feature}
				{#if !(feature.imgSmGif ?? feature.imgSm)}
					<FeatureCard {feature} />
				{:else}
					<div class="block sm:hidden"><FeatureSwapCard {feature} /></div>
					<div class="hidden sm:block"><FeatureCard {feature} /></div>
				{/if}
			{/each}
		</div>
	{/if}
</section>
