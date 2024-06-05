<script lang="ts">
	import { formatPrice } from '$routes/shop/utils';

	interface Props {
		title: string;
		price: {
			amount: string;
			currencyCode: string;
		};
		position?: 'bottom' | 'center' | undefined;
	}

	const { title, price, position = undefined }: Props = $props();
</script>

<div
	class="absolute bottom-0 left-0 flex w-full px-4 pb-4 @container/label
				{position === 'center' ? 'lg:px-20 lg:pb-[35%]' : ''}"
>
	<div
		class="flex items-center rounded-full border border-gray-5 bg-app-bg/70 p-1 text-xs font-semibold backdrop-blur-md"
	>
		<h3 class="mr-4 line-clamp-2 flex-grow pl-2 leading-none tracking-tight">{title}</h3>

		<p class="flex-none rounded-full bg-accent-9 p-2 text-accent-9-contrast">
			{formatPrice(price)}
			<span class={'ml-1 hidden @[275px]/label:inline'}>{price.currencyCode}</span>
		</p>
	</div>
</div>
