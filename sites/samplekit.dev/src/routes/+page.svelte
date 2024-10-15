<script lang="ts">
	import { CardList } from '$lib/articles/components';
	import { LogoIcon } from '$lib/components';
	import I from '$lib/icons';
	import Slider from './home/Slider.svelte';
	import PreprocessorDemo from './home/pp-demo/PreprocessorDemo.pp.svelte';

	const { data } = $props();
</script>

<div class="overflow-hidden">
	<section class="py-12 lg:pt-20">
		<div class="mx-auto w-full max-w-7xl px-page">
			<div class="flex flex-col-reverse lg:flex-row">
				<div class="relative flex-1 space-y-2">
					<span class="flex justify-center lg:justify-start">
						<h1
							class="hero-size relative bg-gradient-to-r from-red-9 to-accent-11 bg-clip-text font-serif text-transparent"
						>
							Sample.Kit
						</h1>
					</span>
					<div class="hero-size text-center lg:text-left">
						<div class="whitespace-nowrap">Packages & Interactive</div>
						<div class="whitespace-nowrap">Demos For SvelteKit</div>
					</div>
					<div class="text-center text-gray-11 md:text-lg lg:text-left lg:text-2xl">
						<div>Home of the SampleKit preprocessors and</div>
						<div>demos for auth, e-commerce, and beyond.</div>
					</div>
					<div class="flex justify-center gap-2 text-sm sm:gap-4 sm:text-lg lg:justify-start">
						<a href="https://preprocessors.samplekit.dev" class="btn btn-accent mt-8">Preprocessors</a>
						<a href="/shop" class="btn btn-hollow mt-8">Shop Demo</a>
						<a href="#articles" class="btn btn-hollow mt-8">Articles</a>
					</div>
				</div>
				<div class="relative flex items-center justify-center">
					<div
						class="relative grid h-36 w-36 animate-spin place-items-center animation-duration-[120s] motion-reduce:animate-none md:h-48 md:w-48 lg:h-72 lg:w-72"
					>
						<div
							class="pulse absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-red-9/25 to-accent-11/35 blur-2xl"
						></div>
						<LogoIcon svgClasses="h-4/5 w-4/5 " svelteClasses="stroke-red-5 fill-accent-9-contrast" />
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-gradient-to-b from-app-bg to-accent-1 py-12" id="preprocessors">
		<div class="mx-auto w-full max-w-7xl px-page">
			<h2 class="mb-4 font-serif text-3xl lg:text-4xl">Preprocessors</h2>
			<p class="mb-8 text-lg text-gray-11 lg:mb-12">
				The SampleKit preprocessors utilize HTML comments with custom delimiters to inject functionality without
				interrupting other tooling.
			</p>
			<PreprocessorDemo />
		</div>
	</section>

	<section class="bg-gradient-to-t from-app-bg to-accent-1 py-12" id="demos">
		<div class="mx-auto w-full max-w-7xl px-page">
			<h2 class="mb-4 font-serif text-3xl lg:text-4xl">Demos</h2>
			<p class="mb-8 text-lg text-gray-11 lg:mb-12">
				The SampleKit website itself is an accessible template for implementing common features in a SvelteKit
				application.
			</p>
		</div>

		<Slider />
	</section>

	<section class="py-12" id="articles">
		<div class="mx-auto w-full max-w-7xl px-page">
			<h2 class="flex gap-2 font-serif text-3xl lg:text-4xl">
				Articles
				<sup class="text-sm">
					<span class="font-bold text-svelte">*</span>Now with
					<span class="text-base italic"> <span class="relative font-bold text-svelte">ᚱ</span>unes</span>
				</sup>
			</h2>

			<ul class="my-8 grid grid-cols-3 gap-4 lg:my-12">
				<li class="flex items-center justify-center gap-2 rounded-badge border border-blue-11 p-2">
					<I.BookOpenText class="h-6 w-6 text-blue-11" />
					<span class="text-lg font-bold text-gray-12">Tutorial</span>
				</li>

				<li class="flex items-center justify-center gap-2 rounded-badge border border-iris-11 p-2">
					<I.Boxes class="h-6 w-6 text-iris-11" />
					<span class="text-lg font-bold text-gray-12">Demo</span>
				</li>

				<li class="flex items-center justify-center gap-2 rounded-badge border border-green-11 p-2">
					<I.Code class="h-6 w-6 text-green-11" />
					<span class="text-lg font-bold text-gray-12">Source</span>
				</li>
			</ul>

			<CardList cards={data.featureCards} />
		</div>
	</section>
</div>

<style lang="postcss">
	@keyframes pulse {
		50% {
			opacity: 0.75;
		}
	}
	.pulse {
		animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	.hero-size {
		font-weight: bold;
		font-size: 2rem;
		line-height: 2.25rem;
	}
	@media (min-width: 768px) {
		.hero-size {
			font-size: 3rem;
			line-height: 1;
		}
	}
	@media (min-width: 1024px) {
		.hero-size {
			font-size: 3.5rem;
			line-height: 1;
		}
	}
</style>
