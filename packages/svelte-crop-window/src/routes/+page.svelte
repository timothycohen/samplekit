<script lang="ts">
	import { CropWindow, cropValueToStyles } from '$lib/index.js';

	const { data } = $props();

	const cw = new CropWindow();

	const img = {
		src: 'https://images.unsplash.com/photo-1501244686579-97d04b498199?w=1600&h=900',
		alt: '1600x900px forest.',
	};

	let resultHeight = $state(200);

	const styles = $derived(cropValueToStyles({ cropValue: cw.cropValue, height: resultHeight }));
</script>

<div
	class="page space-y-4 p-8"
	style="--mauve-11: {data.colors.mauve11}; --mauve-12: {data.colors.mauve12}; --iris-1: {data.colors.iris1};"
>
	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Result of `CropValue`</h2>
		<p>`CropValue` can be used to replicate the crop via CSS later.</p>
		<div class="grid max-w-xl sm:grid-cols-2">
			<span>Height (px)</span>
			<input type="number" min={50} max="250" step={5} bind:value={resultHeight} />
		</div>

		<div style={styles.outer}>
			<img draggable={false} style={styles.media} {...img} />
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Control `CropValue` With Code</h2>
		<p>The crop value can be controlled directly and changes will be reflected in the UI automatically.</p>
		<div class="grid max-w-xl sm:grid-cols-2">
			<div>Shape (rectangle or round)</div>
			<select bind:value={cw.cropValue.shape}>
				<option value="rect">rectangle</option>
				<option value="round">round</option>
			</select>
			<div>Aspect (ratio)</div>
			<div>
				<button onclick={() => (cw.cropValue.aspect = 8)}>8:1</button>
				<button onclick={() => (cw.cropValue.aspect = 16 / 9)}>16:9</button>
				<button onclick={() => (cw.cropValue.aspect = 4 / 3)}>4:3</button>
				<button onclick={() => (cw.cropValue.aspect = 1)}>1:1</button>
				<button onclick={() => (cw.cropValue.aspect = 3 / 4)}>3:4</button>
			</div>

			<div>Position X (multiplier offset)</div>
			<input type="number" min={-1} max={1} step={0.01} bind:value={cw.cropValue.position.x} />

			<div>Position Y (multiplier offset)</div>
			<input type="number" min={-1} max={1} step={0.01} bind:value={cw.cropValue.position.y} />

			<div>Scale (multiplier)</div>
			<div>
				<input type="range" min={0.01} max="6" step={0.01} bind:value={cw.cropValue.scale} />
				{cw.cropValue.scale}
			</div>

			<div>Rotation (degrees clockwise)</div>
			<div>
				<input type="range" min={-180} max="180" step={1} bind:value={cw.cropValue.rotation} />
				{cw.cropValue.rotation}
			</div>
		</div>
	</section>
</div>

<style>
	.page {
		color-scheme: dark;
		color: var(--mauve-11);
		background-color: var(--iris-1);
		min-height: 100vh;
	}

	h2 {
		color: var(--mauve-12);
	}
</style>
