<script lang="ts">
	import { CropWindow, defaultCropValue, type CropValue } from '$lib/image/client';

	interface Props {
		url: string;
		disabled?: boolean;
		onSave: (value: CropValue) => void;
		crop?: CropValue | undefined;
	}

	const { url, disabled = false, onSave, crop = undefined }: Props = $props();

	const cw = new CropWindow({
		cropValue: { ...defaultCropValue, ...crop },
	});
</script>

<div {...cw.root({ insideCropWindowColor: 'hsl(240, 1%, 30%)' })}>
	<img {...cw.media()} src={url} />
	<div
		{...cw.cropWindow({ outsideCropWindowColor: 'hsla(0, 0%, 4.3%, 0.7)' })}
		class="border border-[hsla(0,0%,65.5%,0.5)]"
	>
		{#each cw.thirdLines({ thicknessPx: 1 }) as thirdLine}
			<div {...thirdLine({ color: 'hsla(0, 0%, 65.5%, 0.5)' })}></div>
		{/each}
	</div>
	<div {...cw.gestureHandler({ disabled })}></div>
</div>

<div class="absolute bottom-0 right-0">
	<button
		{disabled}
		class="btn btn-accent w-full rounded-none rounded-br-card rounded-tl-card"
		onclick={(event) => {
			event.stopPropagation();
			onSave(cw.pendingFixes ?? cw.cropValue);
		}}
	>
		Save
	</button>
</div>
