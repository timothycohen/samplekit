<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Header, SEO } from '$lib/components';
	import { themeController } from '$lib/styles';

	onMount(() => {
		const { destroy } = themeController.listen('light-dark-system');
		return destroy;
	});
</script>

<SEO meta={$page.data.meta} />

{#if $page.data.layout.showHeader}
	<Header />
{/if}

<div class="{$page.data.layout.showHeader ? 'min-h-screen-nav' : 'min-h-screen'} relative flex flex-col">
	<main class="flex min-h-full flex-1 flex-col">
		<slot />
	</main>

	{#if $page.data.layout.showFooter}
		<footer class="mt-8 p-4 text-center">
			<div class="flex justify-center gap-2">
				<span>A project by <a class="link" href="mailto:contact@timcohen.dev">Timothy Cohen</a> </span>
				|
				<a class="link" href="https://github.com/timothycohen/samplekit/blob/main/LICENSE" target="_blank">
					MIT License
				</a>
			</div>
		</footer>
	{/if}
</div>
