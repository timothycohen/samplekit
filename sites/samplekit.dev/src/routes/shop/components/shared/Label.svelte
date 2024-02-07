<script lang="ts">
	import { formatPrice } from '$routes/shop/utils';

	export let title: string;
	export let price: {
		amount: string;
		currencyCode: string;
	};
	export let position: 'bottom' | 'center' | undefined = undefined;
</script>

<div
	class={`@container/label absolute bottom-0 left-0 flex w-full px-4 pb-4
  ${position === 'center' ? 'lg:px-20 lg:pb-[35%]' : ''}`}
>
	<div
		class="border-gray-5 bg-app-bg/70 flex items-center rounded-full border p-1 text-xs font-semibold backdrop-blur-md"
	>
		<h3 class="mr-4 line-clamp-2 flex-grow pl-2 leading-none tracking-tight">{title}</h3>

		<p class="bg-accent-9 text-accent-9-contrast flex-none rounded-full p-2">
			{formatPrice(price)}
			<span class={'@[275px]/label:inline ml-1 hidden'}>{price.currencyCode}</span>
		</p>
	</div>
</div>
