<script lang="ts">
	import { CropWindow, defaultValue, defaultOptions, type CropValue } from '$lib/image/client';

	interface Props {
		url: string,
		disabled?: boolean,
		onSave: (value: CropValue) => void,
		crop?: CropValue | undefined
	}

	let {
		url,
		disabled = false,
		onSave,
		crop = undefined
	}: Props = $props();
	let value = $state({ ...(crop || defaultValue) });
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
		onclick={(event) => {
	event.stopPropagation();
	onSave(value)
}}
	>
		Save
	</button>
</div>

<style lang="postcss">
	.crop-wrapper :global(.outline) {
		@apply border-gray-6 outline-none;
	}
</style>
