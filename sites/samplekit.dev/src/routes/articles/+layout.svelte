<script lang="ts">
	import { onMount } from 'svelte';
	import { Changelog, DateLine, PrevNext, Series, TOC } from '$lib/articles/components';
	import { TabPanels } from '$lib/components';
	import { pluralize } from '$lib/utils/common';

	export let data;
	$: article = data.article;

	let wordCount = 0;
	let readingTime = 0;

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
</script>

<div class="page">
	<article>
		<div class="mb-6-9">
			{#if article.imgLg && !article.demos?.main}
				<img
					class="rounded-card mb-6 aspect-video h-auto w-full object-cover object-top"
					src={article.imgLg}
					alt={article.title}
				/>
			{/if}

			<hgroup>
				<h1 class="t-h2 pb-6 font-bold tracking-wide">
					{article.title}
				</h1>
				{#if article.tags?.length}
					<ul class="text-gray-11 mb-6 flex flex-wrap items-start justify-start gap-2">
						{#each article.tags as tag}
							<li class="bg-gray-4 rounded-badge inline-flex items-center px-2.5 py-0.5 text-xs font-medium">
								{tag}
							</li>
						{/each}
					</ul>
				{/if}
				<p class="text-gray-11 text-xs font-bold uppercase tracking-wider">
					<span class="uppercase">{readingTime} min read</span>
					<span class="mx-2" aria-hidden="true">•</span>
					<span class="uppercase">{wordCount} {pluralize('word', wordCount)}</span>
				</p>
			</hgroup>

			{#if article.demos?.main}
				<span class="prose prose-radix prose-lg">
					<h2 class="my-4" id="interactive-demo" data-auto-slug-anchor-position="prepend" data-auto-slug="">
						<a href="#interactive-demo" aria-hidden="true" tabindex="-1" data-auto-slug-anchor="">#</a>
						Interactive Demo
					</h2>
				</span>
				<TabPanels files={article.demos.main} />
			{/if}
		</div>

		<div class="mb-6-9 flex flex-col gap-8 lg:hidden">
			<Series series={article.series} />
			<TOC />
		</div>

		<div class="flex gap-[clamp(2.5rem,8vw,4rem)]">
			<div class="prose prose-radix prose-lg min-w-0 max-w-none flex-1" bind:this={articleContentWrapper} id="use-toc">
				<slot />
			</div>

			<div class="hidden flex-col gap-8 lg:flex">
				<Series series={article.series} />

				<div class="flex-1">
					<div class="sticky top-[calc(var(--nav-height)_+_2rem)] overflow-y-auto">
						<div class="max-h-[calc(98vh-calc(var(--nav-height)_+_2rem))] py-2">
							<TOC />
						</div>
					</div>
				</div>

				<PrevNext prev={article.prev} next={article.next} />
			</div>
		</div>
	</article>

	<footer class="mt-12 md:mt-24">
		<div class="mb-8">
			<DateLine lastUpdate={article.updates?.[article.updates.length - 1]} publishedAt={article.publishedAt} />
		</div>

		<div class="prose prose-lg prose-radix">
			<p>Have a suggestion? File an <a href="https://github.com/timothycohen/samplekit/issues">issue</a>.</p>
			<Changelog updates={article.updates} />
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
</style>
