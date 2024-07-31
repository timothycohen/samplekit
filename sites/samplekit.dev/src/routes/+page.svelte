<script lang="ts">
	import { FeatureCard, FeatureSwapCard } from '$lib/articles/components';
	import { allPostData } from '$lib/articles/load';
	import { BookOpenText, Boxes, Code } from '$lib/styles/icons';
</script>

<section class="page">
	<div class="cross-dots absolute -top-[var(--open-nav-height)] bottom-0 left-0 right-0 -z-20 hidden dark:block"></div>
	<div
		class="absolute -top-[var(--open-nav-height)] left-0 right-0 -z-10 hidden h-96 w-full bg-gradient-to-t from-app-bg/50 to-accent-3/50 opacity-60 dark:block"
	></div>
	<div
		class="absolute -top-[var(--open-nav-height)] left-0 right-0 -z-10 hidden h-96 w-full bg-gradient-to-tr from-app-bg/30 via-app-bg/50 to-transparent dark:block"
	></div>

	<div>
		<h1
			class="t-h1 mt-[clamp(1.875rem,_4.5vw,_3rem)] bg-gradient-to-tr from-accent-7 via-accent-11 to-accent-7 bg-clip-text text-center font-bold text-transparent"
		>
			SvelteKit Design Patterns
		</h1>
		<p
			class="mx-auto mt-[clamp(0.625rem,_1.5vw,_1rem)] max-w-xl text-center text-[clamp(1rem,_1.95vw,_1.25rem)] font-light"
		>
			Documenting the implementation of various flows, patterns, and techniques using SvelteKit.
		</p>

		<div class="mx-auto my-[clamp(1.875rem,_4.5vw,_3rem)] max-w-4xl">
			<ul class="mx-auto flex w-[17rem] flex-col items-center justify-between gap-4 md:w-full md:flex-row">
				<li class="flex w-full items-center gap-6 sm:flex-col sm:gap-3">
					<BookOpenText class="h-10 w-10 text-accent-12" />
					<div class="flex flex-col sm:items-center">
						<p class="text-h3-min font-bold">Articles</p>
						<p>Full implementation details</p>
					</div>
				</li>
				<li class="flex w-full items-center gap-6 sm:flex-col sm:gap-3">
					<Boxes class="h-10 w-10 text-accent-12" />
					<div class="flex flex-col sm:items-center">
						<p class="text-h3-min font-bold">Demos</p>
						<p>Embedded examples</p>
					</div>
				</li>
				<li class="flex w-full items-center gap-6 sm:flex-col sm:gap-3">
					<Code class="h-10 w-10 text-accent-12" />
					<div class="flex flex-col sm:items-center">
						<p class="text-h3-min font-bold">Code</p>
						<p>Open source on GitHub</p>
					</div>
				</li>
			</ul>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
		{#each allPostData as feature, i}
			{#if !(feature.imgSmGif ?? feature.imgSm)}
				<FeatureCard {feature} preview={i === 0} />
			{:else}
				<div class="block sm:hidden"><FeatureSwapCard {feature} preview={i === 0} /></div>
				<div class="hidden sm:block"><FeatureCard {feature} preview={i === 0} /></div>
			{/if}
		{/each}
	</div>
</section>

<style>
	/* https://projects.verou.me/css3patterns/#cross-dots */
	.cross-dots {
		--gradient-bg: hsl(var(--app-bg));
		--gradient-stripes: hsl(var(--accent-9) / 0.075);
		--gradient-dots: hsl(var(--accent-3) / 0.075);

		background: radial-gradient(var(--gradient-dots) 3px, transparent 4px),
			radial-gradient(var(--gradient-dots) 3px, transparent 4px), linear-gradient(var(--gradient-bg) 4px, transparent 0),
			linear-gradient(
				45deg,
				transparent 74px,
				transparent 75px,
				var(--gradient-stripes) 75px,
				var(--gradient-stripes) 76px,
				transparent 77px,
				transparent 109px
			),
			linear-gradient(
				-45deg,
				transparent 75px,
				transparent 76px,
				var(--gradient-stripes) 76px,
				var(--gradient-stripes) 77px,
				transparent 78px,
				transparent 109px
			),
			var(--gradient-bg);
		background-size:
			109px 109px,
			109px 109px,
			100% 6px,
			109px 109px,
			109px 109px;
		background-position:
			54px 55px,
			0px 0px,
			0px 0px,
			0px 0px,
			0px 0px;
	}
</style>
