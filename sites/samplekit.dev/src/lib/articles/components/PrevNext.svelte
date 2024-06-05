<script lang="ts">
	import { FeatureCard, FeatureSwapCard } from '.';
	import type { LoadedFrontMatter } from '../schema';

	interface Props { prev: LoadedFrontMatter | undefined, next: LoadedFrontMatter | undefined }

	let { prev, next }: Props = $props();
</script>

{#if prev}
	<div class="mx-auto w-full lg:w-80">
		<h2 class="t-h4 my-4">Previous Article</h2>
		{#if !(prev.imgSmGif ?? prev.imgSm)}
			<FeatureCard feature={prev} />
		{:else}
			<div class="block md:hidden"><FeatureSwapCard feature={prev} /></div>
			<div class="hidden md:block"><FeatureCard feature={prev} /></div>
		{/if}
	</div>
{/if}

{#if next}
	<div class="mx-auto w-full lg:w-80">
		<h2 class="t-h4 my-4">Next Article</h2>
		{#if !(next.imgSmGif ?? next.imgSm)}
			<FeatureCard feature={next} />
		{:else}
			<div class="block md:hidden"><FeatureSwapCard feature={next} /></div>
			<div class="hidden md:block"><FeatureCard feature={next} /></div>
		{/if}
	</div>
{/if}
