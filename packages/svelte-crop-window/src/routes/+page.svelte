<script lang="ts">
	import { CropWindow, cropValueToStyles } from '$lib/index.js';

	const { data } = $props();

	const cw = new CropWindow();

	const img = {
		src: 'https://images.unsplash.com/photo-1501244686579-97d04b498199?w=1600&h=900',
		alt: '1600x900px forest.',
	};

	const addOpacityToHex = (hex: number, opacity: number) => {
		const hexString = hex.toString(16).padStart(6, '0');
		const opacityString = Math.round(opacity * 255)
			.toString(16)
			.padStart(2, '0');
		return `#${hexString}${opacityString}`;
	};

	let resultHeight = $state(200);
	let thicknessPx = $state(1);
	let disabled = $state(false);

	let insideColor = $state(data.colors.iris3);
	let insideOpacity = $state(1);
	const insideHex = $derived(addOpacityToHex(parseInt(insideColor.slice(1), 16), insideOpacity));

	let outsideColor = $state(data.colors.iris5);
	let outsideOpacity = $state(0.4);
	const outsideHex = $derived(addOpacityToHex(parseInt(outsideColor.slice(1), 16), outsideOpacity));

	let lineColor = $state(data.colors.iris12);
	let lineOpacity = $state(0.25);
	const lineHex = $derived(addOpacityToHex(parseInt(lineColor.slice(1), 16), lineOpacity));

	const styles = $derived(cropValueToStyles({ cropValue: cw.pendingFixes ?? cw.cropValue, height: resultHeight }));
</script>

<div
	class="page space-y-4 p-8"
	style="--mauve-11: {data.colors.mauve11}; --mauve-12: {data.colors.mauve12}; --iris-1: {data.colors.iris1};"
>
	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Control `CropValue` With Gestures</h2>
		<div class="relative h-80 w-full max-w-screen-md">
			<div {...cw.root({ insideCropWindowColor: insideHex })}>
				<img {...cw.media()} {...img} />
				<div
					style="{cw.cropWindow({ outsideCropWindowColor: outsideHex }).style} border: {thicknessPx}px solid {lineHex};"
				>
					{#each cw.thirdLines({ thicknessPx }) as thirdLine}
						<div {...thirdLine({ color: lineHex })}></div>
					{/each}
				</div>
				<div {...cw.gestureHandler({ disabled })}></div>
			</div>
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Result of Valid `CropValue`</h2>
		<p>The validated `CropValue` can be used to replicate the crop via CSS later.</p>
		<div class="grid max-w-xl sm:grid-cols-2">
			<span>Height (px)</span>
			<input type="number" min={50} max="250" step={5} bind:value={resultHeight} />
		</div>

		<div style={styles.outer}>
			<img draggable={false} style={styles.media} {...img} />
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Valid `CropValue`</h2>
		{#if !cw.pendingFixes}
			<span>All good! `CropValue`:</span>
			<ul>
				{#each Object.entries(cw.cropValue) as [key, value]}
					{#if typeof value === 'object' && value !== null}
						{#each Object.entries(value) as [subKey, subValue]}
							<li><strong>{key}.{subKey}</strong>: {subValue}</li>
						{/each}
					{:else}
						<li><strong>{key}</strong>: {value}</li>
					{/if}
				{/each}
			</ul>
		{:else}
			<span>Pending Fixes:</span>
			<ul>
				{#each Object.entries(cw.pendingFixes) as [key, value]}
					{#if typeof value === 'object' && value !== null}
						{#each Object.entries(value) as [subKey, subValue]}
							<li><strong>{key}.{subKey}</strong>: {subValue}</li>
						{/each}
					{:else}
						<li><strong>{key}</strong>: {value}</li>
					{/if}
				{/each}
			</ul>
		{/if}
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

	<section class="space-y-2">
		<h2 class="text-2xl font-bold">`CropWindowOptions`</h2>
		<p>
			`CropWindowOptions` are only used to customize the cropping experience using gestures. They do not affect the
			resulting crop value.
		</p>
		<div class="grid max-w-xl sm:grid-cols-2">
			<span>Margin (%)</span>
			<input type="number" min={0} max="100" step={1} bind:value={cw.cropWindowOptions.marginPercent} />
		</div>
	</section>

	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Gesture Controller Styles</h2>
		<p>
			The melt-ui builder pattern means you have complete access to the DOM elements. Therefore, you can handle styles
			however you'd like. For convenience, the elements take optional parameters for common styling needs. These can be
			omitted in favor of direct styling. The following are optional parameters, but anything else, such as the border
			color, recticle peristence, etc., can be styled directly.
		</p>
		<div class="grid max-w-xl sm:grid-cols-2">
			<div>gestureHandler: disable</div>
			<input type="checkbox" bind:checked={disabled} />
			<div>cropWindow: outsideColor</div>
			<input type="color" bind:value={outsideColor} />
			<div>cropWindow: outsideOpacity</div>
			<input type="range" min={0} max="1" step={0.01} bind:value={outsideOpacity} />
			<div>cropWindow: insideColor</div>
			<input type="color" bind:value={insideColor} />
			<div>cropWindow: insideOpacity</div>
			<input type="range" min={0} max="1" step={0.01} bind:value={insideOpacity} />
			<div>cropWindow: lineColor</div>
			<input type="color" bind:value={lineColor} />
			<div>cropWindow: lineOpacity</div>
			<input type="range" min={0} max="1" step={0.01} bind:value={lineOpacity} />
			<div>thirdLines: thicknessPx</div>
			<input type="number" min={0} step={1} bind:value={thicknessPx} />
			<div>thirdLine: color</div>
			<input type="color" bind:value={lineColor} />
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
