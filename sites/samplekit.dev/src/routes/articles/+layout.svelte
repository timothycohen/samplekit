<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Vaul, Changelog, DateLine, FeatureCard, FeatureSwapCard, Series, TOC } from '$lib/articles/components';
	import { TabPanels, HAnchor, Portal } from '$lib/components';
	import { createCollapsedService, useCollapsedService } from '$lib/components/collapsedService';
	import I from '$lib/icons';
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
				<div class="prose prose-radix my-4 lg:prose-lg">
					<HAnchor tag="h2" title="Interactive Demo" />
				</div>
				<div class="main-demo prose-pre">
					<TabPanels files={article.demos.main} />
				</div>
			{/if}
		</div>

		<div class="mb-6-9 flex flex-col gap-8 lg:hidden">
			<Series series={article.series} />
		</div>

		<div class="flex gap-[clamp(2.5rem,8vw,4rem)]">
			<div
				class="prose prose-radix min-w-0 max-w-none flex-1 lg:prose-lg"
				bind:this={articleContentWrapper}
				data-toc-wrapper
			>
				{@render children?.()}
			</div>

			<div class="hidden flex-col gap-8 lg:flex">
				{#if sidebarOpen}
					<Series series={article.series} />

					<div class="flex-1">
						<div class="sticky top-[calc(var(--open-nav-height)_+_2rem)] overflow-y-auto">
							<div class="max-h-[calc(98vh-calc(var(--open-nav-height)_+_2rem))] py-2">
								<TOC tree={data.tree}>
									<div class="flex w-full items-center justify-between">
										<h2 class="t-h3 font-bold text-accent-12">Table of Contents</h2>
										<button
											class="btn btn-ghost mr-1 rounded-badge px-2 py-1"
											onclick={() => (sidebarOpen = !sidebarOpen)}
										>
											<I.ArrowRight class="h-5 w-5" />
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
				{:else}
					<button
						in:fly={{ x: 40, y: 40 }}
						class="fixed bottom-20 h-12 w-12 items-center justify-center rounded-full border border-gray-5 bg-app-bg/75 text-gray-11 backdrop-blur-md lg:flex"
						style="right: calc(var(--scrollbar-width, 0px) + 1rem);"
						onclick={() => (sidebarOpen = !sidebarOpen)}
					>
						<I.PanelRightDashed class="h-6 w-6" />
					</button>
				{/if}
			</div>

			<Portal targetSelector="#portal-target-header">
				<div class="contents lg:hidden">
					<span class="flex h-4/5 items-center">
						<Vaul>
							{#snippet children({ closeVaul })}
								<TOC tree={data.tree} onclick={closeVaul} />
							{/snippet}
						</Vaul>
						<button class="btn btn-hollow rounded-l-none border-none px-3" onclick={() => toggleAllOpen()}>
							{#if allOpen}
								<I.FoldVertical class="h-6 w-6" />
							{:else}
								<I.UnfoldVertical class="h-6 w-6" />
							{/if}
						</button>
					</span>
				</div>
			</Portal>

			<button
				in:fly={{ x: 40, y: 40 }}
				class="fixed bottom-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-gray-5 bg-app-bg/75 text-gray-11 backdrop-blur-md lg:flex"
				style="right: calc(var(--scrollbar-width, 0px) + 1rem);"
				onclick={() => toggleAllOpen()}
			>
				{#if allOpen}
					<I.UnfoldVertical class="h-6 w-6" />
				{:else}
					<I.FoldVertical class="h-6 w-6" />
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
					<div class="prose prose-radix mb-4 lg:prose-lg"><h2>Previous Article</h2></div>
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
					<div class="prose prose-radix mb-4 lg:prose-lg"><h2>Next Article</h2></div>
					{#if !(article.next.imgSmGif ?? article.next.imgSm)}
						<FeatureCard feature={article.next} />
					{:else}
						<div class="block md:hidden"><FeatureSwapCard feature={article.next} /></div>
						<div class="hidden md:block"><FeatureCard feature={article.next} /></div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="prose prose-radix lg:prose-lg">
			<Changelog updates={article.updates} />
			<p>
				Have a suggestion? File an
				<a href="https://github.com/timothycohen/samplekit/issues" data-external>issue</a>.
			</p>
		</div>
	</footer>
</div>
