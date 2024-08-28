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
</script>

<div class="feature-card relative z-10">
	{#if metadata.video}
		<!-- negative margin to get rid of macos rounded border bottom -->
		<video autoplay loop muted playsinline class="relative -mb-1 w-full">
			<source src={metadata.video} />
		</video>
		<hr class="text-gray-5" />
	{:else if metadata.imgSm}
		<img src={metadata.imgSm} draggable="false" class="select-none" alt="" loading="lazy" />
		<hr class="text-gray-5" />
	{/if}

	<div class="relative bg-gradient-to-tr from-gray-1/25 to-gray-2/50">
		<div class="feature-card-content">
			<h3 class="feature-card-title">{metadata.title}</h3>
			{metadata.description}
		</div>
		<LinksAndDate {metadata} />
	</div>
</div>
