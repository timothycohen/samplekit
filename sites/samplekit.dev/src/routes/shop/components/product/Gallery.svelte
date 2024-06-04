<script lang="ts">
	import { createNumParam } from '$lib/stores';
	import { ArrowLeftIcon, ArrowRightIcon } from '$lib/styles/icons';
	import { GridTileImage } from '..';
	import type { Image } from '$lib/shop';

	export let images: Image[] = [];

	const imageIndex = createNumParam({ paramName: 'image' }, { max: images.length - 1, min: 0, wrap: true });

	$: image = images[$imageIndex];
</script>

<div class="rounded-card relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
	{#if image}
		<img
			class="h-full w-full object-contain"
			sizes="(min-width: 1024px) 66vw, 100vw"
			alt={image.altText}
			src={image.url}
		/>
	{/if}

	{#if images.length > 1}
		<div class="dark absolute bottom-[2%] flex w-full justify-center">
			<div class="bg-gray-5/70 text-gray-11 mx-auto flex items-center overflow-hidden rounded-full backdrop-blur">
				<button
					class="group flex h-11 w-20 items-center justify-center"
					aria-label="Previous product image"
					on:click={imageIndex.prev}
				>
					<ArrowLeftIcon class="group-hover:text-gray-12 h-5 w-5 group-hover:h-6 group-hover:w-6" />
				</button>

				<div class="bg-gray-7 mx-1 h-6 w-px"></div>

				<button
					class="group flex h-11 w-20 items-center justify-center"
					aria-label="Next product image"
					on:click={imageIndex.next}
				>
					<ArrowRightIcon class="group-hover:text-gray-12 h-5 w-5 group-hover:h-6 group-hover:w-6" />
				</button>
			</div>
		</div>
	{/if}
</div>

{#if images.length > 1}
	<ul class="my-12 flex items-center justify-center gap-2 lg:mb-0">
		{#each images as image, index (image.url)}
			{#if image}
				{@const active = index === $imageIndex}

				<li class="h-20 w-20">
					<button class="h-full w-full" aria-label="Enlarge product image" on:click={() => imageIndex.set(index)}>
						<GridTileImage
							{active}
							images={[image.url]}
							alt={image.altText ?? ''}
							isInteractive
							height={80}
							width={80}
						/>
					</button>
				</li>
			{/if}
		{/each}
	</ul>
{/if}
