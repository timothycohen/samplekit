<script lang="ts">
	import { handleToPath, type Product } from '$lib/shop';
	import GridTileImage from '../shared/GridTileImage.svelte';

	interface Props {
		product: Product;
		size: 'full' | 'half';
		loading?: 'lazy' | 'eager' | undefined;
	}

	const { product, size, loading = undefined }: Props = $props();
</script>

<div class={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}>
	<a
		class="relative block aspect-square h-full w-full"
		href={handleToPath({ handle: product.handle, kind: 'product' })}
	>
		<GridTileImage
			sizes={size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
			{loading}
			images={product.images.map((i) => ({ src: i.url, alt: i.altText }))}
			label={{
				position: size === 'full' ? 'center' : 'bottom',
				title: product.title,
				price: product.priceRange.minVariantPrice,
			}}
		/>
	</a>
</div>
