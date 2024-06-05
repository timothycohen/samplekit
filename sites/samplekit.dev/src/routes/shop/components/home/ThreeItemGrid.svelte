<script lang="ts">
	import { ThreeItemGridItem } from '$routes/shop/components';
	import type { Product } from '$lib/shop';

	interface Props {
		products: Product[];
	}

	const { products }: Props = $props();

	const [firstProduct, secondProduct, thirdProduct] = products;
</script>

{#if firstProduct && secondProduct && thirdProduct}
	<section class="grid gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
		<ThreeItemGridItem size="full" product={firstProduct} loading="eager" />
		<ThreeItemGridItem size="half" product={secondProduct} loading="eager" />
		<ThreeItemGridItem size="half" product={thirdProduct} />
	</section>
{/if}
