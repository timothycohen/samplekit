<script lang="ts">
	import { CropWindow, defaultValue, defaultOptions, type CropValue } from '$lib/image/client';

	export let url: string;
	export let disabled = false;
	export let onSave: (value: CropValue) => void;
	export let crop: CropValue | undefined = undefined;
	let value = { ...(crop || defaultValue) };
</script>

<div class="crop-wrapper contents">
	<CropWindow
		bind:value
		media={{ content_type: 'image', url }}
		options={{ ...defaultOptions, shape: 'round', crop_window_margin: 0 }}
	/>
</div>

<div class="absolute bottom-0 right-0">
	<button
		{disabled}
		class="btn btn-accent w-full rounded-none rounded-br-card rounded-tl-card"
		on:click|stopPropagation={() => onSave(value)}
	>
		Save
	</button>
</div>

<style lang="postcss">
	.crop-wrapper :global(.outline) {
		@apply border-gray-6 outline-none;
	}
</style>
