<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Changelog, DateLine, FeatureCard, FeatureSwapCard, Series, TOC } from '$lib/articles/components';
	import { TabPanels } from '$lib/components';
	import { createCollapsedService, useCollapsedService } from '$lib/components/collapsedService';
	import { ArrowRight, PanelRightDashed, UnfoldVertical, FoldVertical } from '$lib/styles/icons';
	import { pluralize } from '$lib/utils/common';

	const { data, children } = $props();
	const article = $derived(data.article);

	let wordCount = $state(0);
	let readingTime = $state(0);

	function updateReadingTime() {
		const text = articleContentWrapper.innerText;
		const wpm = 225;
		const words = text.trim().split(/\s+/);
		wordCount = words.length;
		readingTime = Math.ceil(wordCount / wpm);
	}

	onMount(() => {
		updateReadingTime();
	});

	let articleContentWrapper: HTMLDivElement;
	let sidebarOpen = $state(true);

	createCollapsedService();
	const { triggerAll } = useCollapsedService();
	let allOpen = $state(false);

	const toggleAllOpen = () => {
		allOpen = !allOpen;
		triggerAll(allOpen);
	};
</script>

<div class="page" style="max-width: 1440px; padding: clamp(1rem, -0.6rem + 4vw, 3rem);">
	<article>
		<div class="mb-6-9">
			{#if article.imgLg && !article.demos?.main}
				<img
					class="mb-6 aspect-video h-auto w-full rounded-card object-cover object-top"
					src={article.imgLg}
					alt={article.title}
				/>
			{/if}

			<hgroup>
				<h1 class="t-h2 pb-6 font-bold tracking-wide">
					{article.title}
				</h1>
				{#if article.tags?.length}
					<ul class="mb-6 flex flex-wrap items-start justify-start gap-2 text-gray-11">
						{#each article.tags as tag}
							<li class="inline-flex items-center rounded-badge bg-gray-4 px-2.5 py-0.5 text-xs font-medium">
								{tag}
							</li>
						{/each}
					</ul>
				{/if}
				<p class="text-xs font-bold uppercase tracking-wider text-gray-11">
					<span class="uppercase">{readingTime} min read</span>
					<span class="mx-2" aria-hidden="true">•</span>
					<span class="uppercase">{wordCount} {pluralize('word', wordCount)}</span>
				</p>
			</hgroup>

			{#if article.demos?.main}
				<span class="prose prose-lg prose-radix">
					<h2 class="my-4" id="interactive-demo" data-auto-slug-anchor-position="prepend" data-auto-slug="">
						<a href="#interactive-demo" aria-hidden="true" tabindex="-1" data-auto-slug-anchor="">#</a>
						Interactive Demo
					</h2>
				</span>
				<div class="main-demo">
					<TabPanels files={article.demos.main} />
				</div>
			{/if}
		</div>

		<div class="mb-6-9 flex flex-col gap-8 lg:hidden">
			<Series series={article.series} />
			<TOC />
		</div>

		<div class="flex gap-[clamp(2.5rem,8vw,4rem)]">
			<div class="prose prose-lg prose-radix min-w-0 max-w-none flex-1" bind:this={articleContentWrapper} id="use-toc">
				{@render children?.()}
			</div>

			{#if sidebarOpen}
				<div class="hidden flex-col gap-8 lg:flex">
					<Series series={article.series} />

					<div class="flex-1">
						<div class="sticky top-[calc(var(--nav-height)_+_2rem)] overflow-y-auto">
							<div class="max-h-[calc(98vh-calc(var(--nav-height)_+_2rem))] py-2">
								<TOC>
									<div class="flex w-full items-center justify-between">
										<h2 class="t-h3 font-bold text-accent-12">Table of Contents</h2>
										<button
											class="btn btn-ghost mr-1 rounded-badge px-2 py-1"
											onclick={() => (sidebarOpen = !sidebarOpen)}
										>
											<ArrowRight class="h-5 w-5" />
										</button>
									</div>
								</TOC>
							</div>
						</div>
					</div>

					<div class="space-y-12">
						{#if article.prev}
							<div class="w-80">
								<h2 class="t-h3 mb-4 font-bold text-accent-12">Previous Article</h2>
								{#if !(article.prev.imgSmGif ?? article.prev.imgSm)}
									<FeatureCard feature={article.prev} />
								{:else}
									<FeatureCard feature={article.prev} />
								{/if}
							</div>
						{/if}

						{#if article.next}
							<div class="w-80">
								<h2 class="t-h3 mb-4 font-bold text-accent-12">Next Article</h2>
								{#if !(article.next.imgSmGif ?? article.next.imgSm)}
									<FeatureCard feature={article.next} />
								{:else}
									<FeatureCard feature={article.next} />
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<button
					in:fly={{ x: 40, y: 40 }}
					class="fixed bottom-20 right-4 hidden h-12 w-12 items-center justify-center rounded-full border border-gray-5 bg-app-bg/75 text-gray-11 backdrop-blur-md lg:flex"
					onclick={() => (sidebarOpen = !sidebarOpen)}
				>
					<PanelRightDashed class="h-6 w-6" />
				</button>
			{/if}

			<button
				in:fly={{ x: 40, y: 40 }}
				class="fixed bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gray-5 bg-app-bg/75 text-gray-11 backdrop-blur-md"
				onclick={() => toggleAllOpen()}
			>
				{#if allOpen}
					<UnfoldVertical class="h-6 w-6" />
				{:else}
					<FoldVertical class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</article>

	<footer class="mt-12 md:mt-24">
		<div class="mb-8">
			<DateLine lastUpdate={article.updates?.[article.updates.length - 1]} publishedAt={article.publishedAt} />
		</div>

		<div class="mb-6-9 flex flex-col gap-8 md:flex-row {sidebarOpen ? 'lg:hidden' : ''}">
			{#if article.prev}
				<div class="w-full md:max-w-md">
					<div class="prose prose-lg prose-radix mb-4"><h2>Previous Article</h2></div>
					{#if !(article.prev.imgSmGif ?? article.prev.imgSm)}
						<FeatureCard feature={article.prev} />
					{:else}
						<div class="block md:hidden"><FeatureSwapCard feature={article.prev} /></div>
						<div class="hidden md:block"><FeatureCard feature={article.prev} /></div>
					{/if}
				</div>
			{/if}

			{#if article.next}
				<div class="w-full md:max-w-md">
					<div class="prose prose-lg prose-radix mb-4"><h2>Next Article</h2></div>
					{#if !(article.next.imgSmGif ?? article.next.imgSm)}
						<FeatureCard feature={article.next} />
					{:else}
						<div class="block md:hidden"><FeatureSwapCard feature={article.next} /></div>
						<div class="hidden md:block"><FeatureCard feature={article.next} /></div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="prose prose-lg prose-radix">
			<Changelog updates={article.updates} />
			<p>
				Have a suggestion? File an
				<a href="https://github.com/timothycohen/samplekit/issues">issue</a>.
			</p>
		</div>
	</footer>
</div>

<style lang="postcss">
	article :global([data-auto-slug]) {
		position: relative;
		width: fit-content;
	}

	article :global([data-auto-slug]:not([data-auto-slug-ignore]):hover a[data-auto-slug-anchor]) {
		opacity: 1;
	}

	article :global([data-auto-slug-ignore] a[data-auto-slug-anchor]) {
		display: none;
	}

	article :global(.table-wrapper) {
		overflow-x: auto;
	}

	article :global(a[data-auto-slug-anchor]) {
		position: absolute;
		left: calc(0% - 1rem);
		width: calc(100% + 2rem);
		text-decoration: none;
		opacity: 0;
	}

	article .main-demo :global(.tabpanel > .code-wrapper) {
		padding: 1rem 1.5rem;
		margin: 0;
		font-size: 0.9rem;
	}
</style>
