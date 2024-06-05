<script lang="ts">
	import { createNumParam } from '$lib/stores';
	import { ArrowLeftIcon, ArrowRightIcon } from '$lib/styles/icons';
	import { GridTileImage } from '..';
	import type { Image } from '$lib/shop';

	interface Props { images?: Image[] }

	let { images = [] }: Props = $props();

	const imageIndex = createNumParam({ paramName: 'image' }, { max: images.length - 1, min: 0, wrap: true });

	let image = $derived(images[$imageIndex]);
</script>

<div class="relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-card">
	{#if image}
		<img
			class="h-full w-full object-contain"
			sizes="(min-width: 1024px) 66vw, 100vw"
			alt={image.altText}
			src={image.url}
		/>
	{/if}

	{#if images.length > 1}
		<div class="absolute bottom-[2%] flex w-full justify-center dark">
			<div class="mx-auto flex items-center overflow-hidden rounded-full bg-gray-5/70 text-gray-11 backdrop-blur">
				<button
					class="group flex h-11 w-20 items-center justify-center"
					aria-label="Previous product image"
					onclick={imageIndex.prev}
				>
					<ArrowLeftIcon class="h-5 w-5 group-hover:h-6 group-hover:w-6 group-hover:text-gray-12" />
				</button>

				<div class="mx-1 h-6 w-px bg-gray-7"></div>

				<button
					class="group flex h-11 w-20 items-center justify-center"
					aria-label="Next product image"
					onclick={imageIndex.next}
				>
					<ArrowRightIcon class="h-5 w-5 group-hover:h-6 group-hover:w-6 group-hover:text-gray-12" />
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
					<button class="h-full w-full" aria-label="Enlarge product image" onclick={() => imageIndex.set(index)}>
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
