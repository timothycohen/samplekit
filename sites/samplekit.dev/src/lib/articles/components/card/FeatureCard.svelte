<script lang="ts">
	import LinksAndDate from './LinksAndDate.svelte';
	import type { LoadedFrontMatter } from '$lib/articles/schema';

	type Props = {
		metadata: Pick<
			LoadedFrontMatter,
			| 'articlePath'
			| 'implementationPath'
			| 'srcCodeHref'
			| 'imgSm'
			| 'title'
			| 'description'
			| 'tags'
			| 'publishedAt'
			| 'updates'
			| 'video'
		>;
	};

	const { metadata }: Props = $props();

	// safari doesn't even show the first frame of the autoplay video, despite being muted
	const autoPlay = (node: HTMLVideoElement) => {
		node.play().catch(() => {});
	};
</script>

<div
	class="relative z-10 h-fit overflow-hidden rounded-card border border-gray-4 bg-app-bg transition-[transform,shadow] duration-500 hover:z-10 hover:scale-[1.01] hover:border-none hover:shadow-3"
>
	{#if metadata.video}
		<!-- negative margin to get rid of metadata.video's rounded border bottom -->
		<video autoplay loop muted playsinline class="-mb-1" use:autoPlay>
			<source src={metadata.video} />
		</video>
		<hr class="text-gray-5" />
	{:else if metadata.imgSm}
		<img src={metadata.imgSm} draggable="false" class="select-none" alt="" loading="lazy" />
		<hr class="text-gray-5" />
	{/if}

	<div class="relative bg-app-bg">
		<div class="bg-gradient-to-tr from-gray-1/25 to-gray-2/50">
			<div class="prose prose-sm prose-radix p-4 pb-3 text-base text-gray-11 marker:text-gray-11">
				<h3 class="mb-4 mt-1.5 font-serif font-bold">{metadata.title}</h3>
				{metadata.description}
			</div>
			<LinksAndDate {metadata} />
		</div>
	</div>
</div>
