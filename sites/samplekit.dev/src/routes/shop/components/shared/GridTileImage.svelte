<script lang="ts">
	import Label from './Label.svelte';

	export let isInteractive = true;
	export let active = false;
	export let label:
		| {
				title: string;
				position?: 'bottom' | 'center';
				price: {
					amount: string;
					currencyCode: string;
				};
		  }
		| undefined = undefined;
	export let images: string[];
	export let alt: string;
	export let sizes: string | undefined = '';
	export let loading: 'lazy' | 'eager' | undefined = undefined;
	export let height: number | undefined = undefined;
	export let width: number | undefined = undefined;
</script>

<div
	class="group flex h-full w-full items-center justify-center overflow-hidden rounded-card hover:border-accent-9 group-focus-within:border-accent-9
			{label ? 'relative' : ''}
      {active ? 'border-2 border-accent-9' : 'border border-gray-5'}"
>
	{#if images.length}
		<div class="figure">
			<img
				draggable="false"
				class="h-full w-full object-cover {images[1] ? 'hover:opacity-0' : ''}
							{isInteractive ? 'transition-transform duration-300 ease-in-out group-hover:scale-105' : ''}"
				{alt}
				src={images[0]}
				{loading}
				{sizes}
				{height}
				{width}
			/>

			{#if images[1]}
				<img
					draggable="false"
					class="absolute inset-0 h-full w-full object-cover opacity-0 hover:opacity-100
								{isInteractive ? 'transition-transform duration-300 ease-in-out group-hover:scale-105' : ''}"
					{alt}
					src={images[1]}
					{loading}
					{sizes}
					{height}
					{width}
				/>
			{/if}
		</div>
	{/if}

	{#if label}
		<Label title={label.title} price={label.price} position={label.position} />
	{/if}
</div>
